import { PageFrame, StatusBadge } from "@/components/shared";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Languages,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Static sample data — design-only prototype                          */
/* ------------------------------------------------------------------ */

type VoiceState = "ready" | "listening" | "processing" | "speaking" | "ended";

interface StateMeta {
  id: VoiceState;
  label: string;
  caption: string;
  tone: "neutral" | "primary" | "success" | "warning";
}

const VOICE_STATES: StateMeta[] = [
  {
    id: "ready",
    label: "Ready to talk",
    caption: "Tap the microphone to begin",
    tone: "neutral",
  },
  {
    id: "listening",
    label: "Listening",
    caption: "Urja is hearing you",
    tone: "primary",
  },
  {
    id: "processing",
    label: "Processing",
    caption: "Finding an answer",
    tone: "warning",
  },
  {
    id: "speaking",
    label: "Urja is speaking",
    caption: "Playing the response",
    tone: "success",
  },
  {
    id: "ended",
    label: "Conversation ended",
    caption: "Session closed",
    tone: "neutral",
  },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "kn", label: "Kannada · ಕನ್ನಡ" },
  { value: "hi", label: "Hindi · हिन्दी" },
  { value: "ta", label: "Tamil · தமிழ்" },
  { value: "te", label: "Telugu · తెలుగు" },
  { value: "bn", label: "Bengali · বাংলা" },
  { value: "mr", label: "Marathi · मराठी" },
];

interface TranscriptEntry {
  id: string;
  speaker: "user" | "urja";
  time: string;
  text: string;
  sources?: string[];
}

/* ------------------------------------------------------------------ */
/* Central voice orb                                                   */
/* ------------------------------------------------------------------ */

function VoiceOrb({ state }: { state: VoiceState }) {
  const isActive = state === "listening" || state === "speaking";
  const isProcessing = state === "processing";
  const isEnded = state === "ended";

  return (
    <div
      data-ocid="voice.orb"
      className="relative mx-auto flex aspect-square w-full max-w-[22rem] items-center justify-center sm:max-w-[26rem]"
    >
      {/* Outer soft ring */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-full border border-primary/15 bg-secondary/40 transition-smooth",
          isActive && "animate-pulse-soft",
        )}
      />
      {/* Mid ring */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-[9%] rounded-full border border-primary/25 bg-secondary/60 transition-smooth",
          isProcessing && "animate-pulse-soft",
        )}
      />
      {/* Inner gradient disc */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-[20%] rounded-full bg-gradient-primary shadow-floating transition-smooth",
          isActive && "animate-float",
          isEnded && "opacity-40",
        )}
      />

      {/* Waveform bars */}
      <span
        aria-hidden="true"
        className="absolute inset-[20%] flex items-center justify-center gap-1.5"
      >
        {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
          <span
            key={`wave-${bar}`}
            className={cn(
              "w-1.5 rounded-full bg-primary-foreground/80 transition-smooth",
              isActive ? "animate-pulse-soft" : "opacity-40",
            )}
            style={{
              height: isActive
                ? `${18 + ((bar * 13) % 34)}px`
                : isProcessing
                  ? "10px"
                  : "14px",
              animationDelay: `${bar * 120}ms`,
            }}
          />
        ))}
      </span>

      {/* Centre logo */}
      <span className="relative z-10 flex size-16 items-center justify-center rounded-2xl bg-card/95 shadow-elevated">
        <svg viewBox="0 0 24 24" className="size-8" fill="none" role="img">
          <title>Urja</title>
          <circle cx="12" cy="12" r="4" className="fill-primary" />
          <g className="stroke-primary" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
          </g>
        </svg>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Transcript panel                                                    */
/* ------------------------------------------------------------------ */

function TranscriptPanel({
  turns,
  providerActive,
  className,
}: {
  turns: { id: string; speaker: "user" | "urja"; time: string; text: string; sources?: string[] }[];
  providerActive: boolean;
  className?: string;
}) {
  return (
    <div
      data-ocid="voice.transcript.panel"
      className={cn(
        "flex flex-col rounded-[18px] border border-border bg-card shadow-subtle",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Live transcript
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {turns.length} {turns.length === 1 ? "turn" : "turns"} this session
          </p>
        </div>
        <StatusBadge tone={providerActive ? "success" : "warning"}>
          {providerActive ? "Google voice" : "Browser voice"}
        </StatusBadge>
      </div>

      <ol
        data-ocid="voice.transcript.list"
        className="flex max-h-[26rem] flex-col gap-4 overflow-y-auto px-5 py-5 lg:max-h-[34rem]"
      >
        {turns.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing is being recorded yet. Tap the microphone and speak, or use the
            Ask page to type a question.
          </li>
        )}
        {turns.map((entry) => (
          <li
            key={entry.id}
            data-ocid={`voice.transcript.item.${entry.id}`}
            className={cn(
              "flex flex-col gap-1.5",
              entry.speaker === "user" ? "items-end" : "items-start",
            )}
          >
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <span>{entry.speaker === "user" ? "You" : "Urja"}</span>
              <span aria-hidden="true">·</span>
              <time>{entry.time}</time>
            </div>
            <div
              className={cn(
                "max-w-[92%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed",
                entry.speaker === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm border border-border bg-muted/50 text-foreground",
              )}
            >
              {entry.text}
            </div>
            {entry.sources && entry.sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.sources.map((source) => (
                  <span
                    key={source}
                    className="rounded-full border border-border bg-card px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {source}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function VoicePage() {
  const [preview, setPreview] = useState<VoiceState | null>(null);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [language, setLanguage] = useState("en");
  const voice = useVoiceAssistant(language);

  // A tab click previews a state; any real interaction takes over again.
  const state: VoiceState = preview ?? voice.state;
  const activeMeta =
    VOICE_STATES.find((item) => item.id === state) ?? VOICE_STATES[0];
  const isEnded = state === "ended";
  const isListening = state === "listening";

  function handleMic() {
    setPreview(null);
    if (isEnded) voice.resume();
    if (voice.recording) voice.stopListening();
    else void voice.startListening();
  }

  function handleEnd() {
    setPreview(null);
    setSpeakerOn(false);
    voice.endSession();
  }

  function handleNewSession() {
    voice.reset();
    setPreview(null);
    setSpeakerOn(true);
  }

  return (
    <PageFrame className="max-w-[1440px]">
      {/* Header row */}
      <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Voice
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Urja Voice Assistant
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Speak naturally in your language and Urja answers with public
            service guidance and live energy intelligence.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <StatusBadge tone={activeMeta.tone}>{activeMeta.label}</StatusBadge>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {voice.providerActive ? "Google Cloud voice" : "Browser speech fallback"}
          </span>
        </div>
      </div>

      {/* State preview strip */}
      <div className="mt-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Interaction state preview
        </p>
        <div data-ocid="voice.state.tabs" className="mt-3 flex flex-wrap gap-2">
          {VOICE_STATES.map((item) => (
            <button
              key={item.id}
              type="button"
              data-ocid={`voice.state.tab.${item.id}`}
              aria-pressed={state === item.id}
              onClick={() => setPreview(item.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                state === item.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-10">
        {/* Voice stage */}
        <section
          data-ocid="voice.stage"
          className="flex flex-col items-center rounded-[20px] border border-border bg-gradient-subtle px-6 py-10 shadow-subtle md:px-10 md:py-14"
        >
          <VoiceOrb state={state} />

          <div className="mt-8 text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {activeMeta.label}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {activeMeta.caption}
            </p>
          </div>

          {/* Primary controls */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              data-ocid="voice.mic_button"
              aria-pressed={isListening}
              aria-label={voice.recording ? "Stop listening" : "Start listening"}
              onClick={handleMic}
              className={cn(
                "flex size-20 items-center justify-center rounded-full text-primary-foreground shadow-elevated transition-smooth hover:-translate-y-0.5 hover:shadow-floating focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isListening ? "bg-destructive" : "bg-primary",
              )}
            >
              {voice.recording ? (
                <MicOff className="size-8" aria-hidden="true" />
              ) : state === "processing" ? (
                <Loader2 className="size-8 animate-spin" aria-hidden="true" />
              ) : (
                <Mic className="size-8" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              data-ocid="voice.end_button"
              onClick={handleEnd}
              className="flex size-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive transition-smooth hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="End conversation"
            >
              <PhoneOff className="size-6" aria-hidden="true" />
            </button>

            <button
              type="button"
              data-ocid="voice.speaker_toggle"
              aria-pressed={speakerOn}
              onClick={() => {
                if (speakerOn) voice.stopPlayback();
                setSpeakerOn((prev) => !prev);
              }}
              className={cn(
                "flex size-14 items-center justify-center rounded-full border transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                speakerOn
                  ? "border-primary/30 bg-secondary text-secondary-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
              aria-label={speakerOn ? "Turn speaker off" : "Turn speaker on"}
            >
              {speakerOn ? (
                <Volume2 className="size-6" aria-hidden="true" />
              ) : (
                <VolumeX className="size-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Secondary controls */}
          <div className="mt-8 flex w-full flex-col items-center gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Languages
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger
                  data-ocid="voice.language.select"
                  aria-label="Conversation language"
                  className="h-10 w-[13rem] rounded-2xl border-border bg-card"
                >
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-border bg-card px-5"
            >
              <Link to="/ask" data-ocid="voice.text_chat_link">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Return to text chat
              </Link>
            </Button>
          </div>

          {voice.error && (
            <p
              role="alert"
              data-ocid="voice.error_state"
              className="mt-6 w-full rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {voice.error}
            </p>
          )}

          {/* Ended confirmation */}
          {isEnded && (
            <div
              data-ocid="voice.ended_state"
              className="mt-6 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground sm:flex-row"
            >
              <span className="flex items-center gap-2">
                <Check className="size-4 text-success" aria-hidden="true" />
                Conversation ended. Audio was never stored on the server.
              </span>
              <button
                type="button"
                data-ocid="voice.new_session_button"
                onClick={handleNewSession}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Start a new interaction
              </button>
            </div>
          )}
        </section>

        {/* Transcript — side panel on desktop, beneath orb on mobile */}
        <TranscriptPanel
          turns={voice.turns}
          providerActive={voice.providerActive}
          className="lg:sticky lg:top-24 lg:self-start"
        />
      </div>
    </PageFrame>
  );
}
