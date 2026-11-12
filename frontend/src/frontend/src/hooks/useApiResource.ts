import { ApiError } from "@/services/apiClient";
import { useCallback, useEffect, useRef, useState } from "react";

interface ResourceState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

/**
 * Runs a read-only API call and exposes loading/error/data plus a reload action.
 * `enabled: false` keeps the request idle (used for provider-gated panels).
 */
export function useApiResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  options: { enabled?: boolean } = {},
) {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    error: null,
    loading: enabled,
  });
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    const current = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (requestId.current === current) {
        setState({ data, error: null, loading: false });
      }
    } catch (error) {
      if (requestId.current === current) {
        setState({
          data: null,
          error:
            error instanceof ApiError
              ? error
              : new ApiError("The request failed unexpectedly."),
          loading: false,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run, ...deps]);

  return { ...state, reload: run };
}

/** Runs an on-demand mutation with loading/error state. */
export function useApiAction<TInput, TOutput>(
  action: (input: TInput) => Promise<TOutput>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<TOutput | null>(null);

  const run = useCallback(
    async (input: TInput): Promise<TOutput | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await action(input);
        setData(result);
        return result;
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught
            : new ApiError("The request failed unexpectedly."),
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [action],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return { run, loading, error, data, reset };
}

export function errorMessage(error: ApiError | null): string | null {
  if (!error) return null;
  return error.message;
}
