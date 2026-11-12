/**
 * URJA API client — the single place that talks to the FastAPI backend.
 *
 * The base URL comes from `VITE_API_BASE_URL` (see .env.example in this folder)
 * and never contains a secret: every API key lives on the server.
 */

const FALLBACK_BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_TIMEOUT_MS = 20_000;
const SESSION_KEY = "urja.session-id";

function resolveBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const base = (configured && configured.trim()) || FALLBACK_BASE_URL;
  return base.replace(/\/+$/, "");
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { code?: string; status?: number; details?: unknown } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options.code ?? "request_failed";
    this.status = options.status ?? 0;
    this.details = options.details;
  }

  /** True when the backend is reachable but the feature is not configured. */
  get isNotConfigured(): boolean {
    return (
      this.code === "search_not_configured" ||
      this.code === "weather_not_configured" ||
      this.code === "voice_not_configured"
    );
  }
}

/** Anonymous, per-tab session scope used only for Ask history. */
export function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 24)
        : `sess${Date.now().toString(36)}`;
    window.sessionStorage.setItem(SESSION_KEY, generated);
    return generated;
  } catch {
    return "anonymous";
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  timeoutMs?: number;
  signal?: AbortSignal;
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const entry of value) search.append(key, String(entry));
      continue;
    }
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  params?: Record<string, unknown>,
): Promise<T> {
  const { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers: {
        Accept: "application/json",
        "X-Session-Id": getSessionId(),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    throw new ApiError(
      aborted
        ? "The URJA backend took too long to respond."
        : `Cannot reach the URJA backend at ${API_BASE_URL}. Start it with: uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`,
      { code: aborted ? "timeout" : "network_error", details: error },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (!response.ok) {
      throw new ApiError(
        `The URJA backend returned an unexpected response (${response.status}).`,
        { code: "unexpected_response", status: response.status },
      );
    }
    return (await response.text()) as unknown as T;
  }

  const payload = await response.json();

  if (!response.ok) {
    const detail = payload?.detail;
    if (typeof detail === "string") {
      throw new ApiError(detail, { status: response.status });
    }
    throw new ApiError(
      detail?.message ?? `Request failed with status ${response.status}.`,
      {
        code: detail?.code ?? `http_${response.status}`,
        status: response.status,
        details: detail?.details,
      },
    );
  }

  return payload as T;
}

/** Raw fetch for endpoints that return binary audio (voice playback). */
export async function apiBlob(
  path: string,
  body: unknown,
  timeoutMs = 30_000,
): Promise<Blob> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": getSessionId(),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      let message = `Speech synthesis failed (${response.status}).`;
      let code = "speech_failed";
      try {
        const payload = await response.json();
        message = payload?.detail?.message ?? message;
        code = payload?.detail?.code ?? code;
      } catch {
        /* keep the generic message */
      }
      throw new ApiError(message, { code, status: response.status });
    }
    return await response.blob();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Cannot reach the URJA backend for audio playback.", {
      code: "network_error",
      details: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}

/** Upload a recorded audio clip for transcription. */
export async function apiTranscribe(
  audio: Blob,
  language: string,
): Promise<{ transcript: string; language: string; provider: string }> {
  const form = new FormData();
  form.append("audio", audio, "speech.webm");
  form.append("language", language);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/voice/transcribe`, {
      method: "POST",
      headers: { "X-Session-Id": getSessionId() },
      body: form,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(
        payload?.detail?.message ?? "Transcription failed.",
        {
          code: payload?.detail?.code ?? `http_${response.status}`,
          status: response.status,
        },
      );
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}
