import { apiBlob, apiTranscribe, ApiError } from "@/services/apiClient";
import { urjaApi } from "@/services/urjaApi";
import type { VoiceStatus } from "@/services/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceSessionState =
  | "ready"
  | "listening"
  | "processing"
  | "speaking"
  | "ended";

export interface VoiceTurn {
  id: string;
  speaker: "user" | "urja";
  time: string;
  text: string;
  sources?: string[];
}

const MAX_RECORDING_MS = 60_000;

function timeLabel(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function speechRecognitionCtor(): any {
  const scope = window as any;
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

/**
 * Voice session for the Voice page.
 *
 * Order of preference: Google Cloud STT/TTS through the backend (when
 * configured), then the browser's own speech APIs. The page never claims the
 * Google integration is active unless the backend reports it configured.
 */
export function useVoiceAssistant(language: string) {
  const [status, setStatus] = useState<VoiceStatus | null>(null);
  const [state, setState] = useState<VoiceSessionState>("ready");
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const previousQuestionRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    urjaApi
      .voiceStatus()
      .then((data) => {
        if (active) setStatus(data);
      })
      .catch(() => {
        if (active) setStatus(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const cleanupRecording = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    setRecording(false);
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      const langCode = language === "en" ? "en-IN" : `${language}-IN`;
      setState("speaking");
      if (status?.configured) {
        try {
          const blob = await apiBlob("/api/v1/voice/speak", {
            text,
            language: langCode,
          });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          setPlaying(true);
          await audio.play();
          audio.onended = () => {
            setPlaying(false);
            URL.revokeObjectURL(url);
            setState((current) => (current === "speaking" ? "ready" : current));
          };
          return;
        } catch (caught) {
          // Fall through to the browser voice so the answer is still spoken.
          setError(
            caught instanceof ApiError
              ? `${caught.message} Using the browser voice instead.`
              : "Audio playback failed. Using the browser voice instead.",
          );
        }
      }

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.onend = () => {
          setPlaying(false);
          setState((current) => (current === "speaking" ? "ready" : current));
        };
        setPlaying(true);
        window.speechSynthesis.speak(utterance);
      } else {
        setState("ready");
      }
    },
    [language, status?.configured],
  );

  const handleTranscript = useCallback(
    async (transcript: string) => {
      const question = transcript.trim();
      if (!question) {
        setError("No speech was recognised. Please try again.");
        setState("ready");
        return;
      }
      setError(null);
      setTurns((current) => [
        ...current,
        {
          id: `user-${Date.now()}`,
          speaker: "user",
          time: timeLabel(),
          text: question,
        },
      ]);
      setState("processing");

      try {
        const response = await urjaApi.ask({
          question,
          previous_question: previousQuestionRef.current,
        });
        previousQuestionRef.current = response.question;
        setTurns((current) => [
          ...current,
          {
            id: `urja-${Date.now()}`,
            speaker: "urja",
            time: timeLabel(),
            text: response.answer,
            sources: response.sources.map((source) => source.source_name),
          },
        ]);
        await speak(response.answer);
      } catch (caught) {
        setState("ready");
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Urja could not answer that request.",
        );
      }
    },
    [speak],
  );

  const startBrowserRecognition = useCallback(() => {
    const Recognition = speechRecognitionCtor();
    if (!Recognition) {
      setError(
        "Speech recognition is not available in this browser. Type your question on the Ask page instead.",
      );
      setState("ready");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = language === "en" ? "en-IN" : `${language}-IN`;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      void handleTranscript(transcript);
    };
    recognition.onerror = (event: any) => {
      setRecording(false);
      setState("ready");
      setError(
        event?.error === "not-allowed"
          ? "Microphone access was blocked. Allow microphone access in the browser and try again."
          : "The browser could not recognise speech. Please try again.",
      );
    };
    recognition.onend = () => setRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
    setState("listening");
  }, [handleTranscript, language]);

  const startListening = useCallback(async () => {
    setError(null);
    stopPlayback();

    if (!status?.configured) {
      startBrowserRecognition();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(
        "This browser cannot record audio. The browser speech fallback will be used.",
      );
      startBrowserRecognition();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        cleanupRecording();
        setState("processing");
        try {
          const result = await apiTranscribe(
            blob,
            language === "en" ? "en-IN" : `${language}-IN`,
          );
          await handleTranscript(result.transcript);
        } catch (caught) {
          setState("ready");
          setError(
            caught instanceof ApiError
              ? caught.message
              : "Transcription failed. Please try again.",
          );
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setState("listening");
      timerRef.current = window.setTimeout(() => {
        recorder.state !== "inactive" && recorder.stop();
      }, MAX_RECORDING_MS);
    } catch {
      setState("ready");
      setError(
        "Microphone access was blocked. Allow microphone access in the browser and try again.",
      );
    }
  }, [cleanupRecording, handleTranscript, language, startBrowserRecognition, status?.configured, stopPlayback]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setRecording(false);
      return;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      cleanupRecording();
    }
  }, [cleanupRecording]);

  const endSession = useCallback(() => {
    stopListening();
    stopPlayback();
    setState("ended");
    setRecording(false);
  }, [stopListening, stopPlayback]);

  const resume = useCallback(() => {
    setError(null);
    setState("ready");
  }, []);

  const reset = useCallback(() => {
    stopListening();
    stopPlayback();
    setTurns([]);
    setError(null);
    setState("ready");
    previousQuestionRef.current = null;
  }, [stopListening, stopPlayback]);

  useEffect(() => {
    return () => {
      stopPlayback();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop?.();
    };
  }, [stopPlayback]);

  return {
    status,
    state,
    turns,
    error,
    recording,
    playing,
    startListening,
    stopListening,
    endSession,
    resume,
    reset,
    stopPlayback,
    speak,
    providerActive: Boolean(status?.configured),
  };
}
