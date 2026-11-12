import {
  SampleTag,
  SourceBadge,
  StatusBadge,
  type StatusTone,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FileText,
  Landmark,
  MapPin,
  Mic,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  TrendingUp,
  Volume2,
} from "lucide-react";
import { type FormEvent, useState } from "react";

/* ------------------------------------------------------------------ */
/* Static sample content for the conversation screen                   */
/* ------------------------------------------------------------------ */

const QUESTION =
  "Where can I apply for the rooftop solar subsidy in Pune, and what does today's power demand look like?";

const ASSISTANT_LEAD =
  "Here is what I found across official sources. The rooftop solar subsidy is administered by the Ministry of New & Renewable Energy through the national portal, and today's national demand is running at 198,420 MW with renewable sources contributing 34.8% of generation.";

const ASSISTANT_CLOSE =
  "I have grouped the results below by type. Every figure shown is illustrative sample data for this design preview.";

const FOLLOW_UPS = [
  "What documents do I need?",
  "Show nearby offices",
  "Compare with last week",
];

/* ------------------------------------------------------------------ */
/* Shared card shell                                                   */
/* ------------------------------------------------------------------ */

function ResultCard({
  kind,
  icon,
  title,
  subtitle,
  ocid,
  children,
  footer,
}: {
  kind: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  ocid: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card
      data-ocid={ocid}
      className="gap-0 rounded-[20px] border-border bg-card p-0 shadow-subtle transition-smooth hover:shadow-elevated"
    >
      <div className="flex items-start gap-4 border-b border-border px-6 py-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            {kind}
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <SampleTag className="hidden shrink-0 sm:inline-flex" />
      </div>
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
          {footer}
        </div>
      )}
    </Card>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* A. Public service information card                                  */
/* ------------------------------------------------------------------ */

function ServiceInfoCard() {
  return (
    <ResultCard
      kind="Public service"
      ocid="conversation.card.service"
      icon={<Building2 className="size-5" aria-hidden="true" />}
      title="Rooftop Solar Subsidy Cell"
      subtitle="Ministry of New & Renewable Energy · Pune Regional Office"
      footer={
        <>
          <StatusBadge tone="success">Verified source</StatusBadge>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="conversation.card.service.website_button"
              className="rounded-full border-border"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Official website
            </Button>
            <Button
              type="button"
              data-ocid="conversation.card.service.details_button"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              View details
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <DetailRow
          icon={<MapPin className="size-4" aria-hidden="true" />}
          label="Location"
          value="Pune, Maharashtra"
        />
        <DetailRow
          icon={<Building2 className="size-4" aria-hidden="true" />}
          label="Address"
          value="PMRDA Bhawan, Dr. Ambedkar Road, Pune 411001"
        />
        <DetailRow
          icon={<Phone className="size-4" aria-hidden="true" />}
          label="Contact"
          value="+91 20 2605 8800"
        />
        <DetailRow
          icon={<Clock className="size-4" aria-hidden="true" />}
          label="Operating hours"
          value="Mon–Fri · 10:00–17:30 IST"
        />
      </div>
    </ResultCard>
  );
}

/* ------------------------------------------------------------------ */
/* B. Government scheme card                                           */
/* ------------------------------------------------------------------ */

function SchemeCard() {
  return (
    <ResultCard
      kind="Government scheme"
      ocid="conversation.card.scheme"
      icon={<Landmark className="size-5" aria-hidden="true" />}
      title="PM Surya Ghar: Muft Bijli Yojana"
      subtitle="Residential rooftop solar subsidy programme"
      footer={
        <>
          <SourceBadge>mnre.gov.in</SourceBadge>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="conversation.card.scheme.website_button"
              className="rounded-full border-border"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Official website
            </Button>
            <Button
              type="button"
              data-ocid="conversation.card.scheme.details_button"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              View details
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        A central subsidy scheme that helps households install rooftop solar
        panels and receive a subsidy on the installed capacity, with net
        metering for surplus power exported to the grid.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Eligibility
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground">
            <li>Residential property owner in India</li>
            <li>Valid electricity connection</li>
            <li>No prior central solar subsidy claimed</li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Available benefits
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground">
            <li>Subsidy up to ₹78,000 for 3 kW</li>
            <li>Net metering for surplus export</li>
            <li>Collateral-free loan options</li>
          </ul>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Required documents
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            "Aadhaar card",
            "Electricity bill",
            "Property ownership proof",
            "Bank account details",
          ].map((doc) => (
            <span
              key={doc}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
            >
              {doc}
            </span>
          ))}
        </div>
      </div>
    </ResultCard>
  );
}

/* ------------------------------------------------------------------ */
/* C. Public helpline card                                             */
/* ------------------------------------------------------------------ */

function HelplineCard() {
  return (
    <ResultCard
      kind="Public helpline"
      ocid="conversation.card.helpline"
      icon={<Phone className="size-5" aria-hidden="true" />}
      title="National Power Consumer Helpline"
      subtitle="Ministry of Power · Consumer grievance support"
      footer={
        <>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            Official government source
          </span>
          <Button
            type="button"
            data-ocid="conversation.card.helpline.call_button"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Phone className="size-4" aria-hidden="true" />
            Call helpline
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Helpline number
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-foreground">
            1912
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Available hours
          </p>
          <p className="mt-1 text-sm text-foreground">24 × 7 · All days</p>
        </div>
      </div>
    </ResultCard>
  );
}

/* ------------------------------------------------------------------ */
/* D. Public announcement / news card                                  */
/* ------------------------------------------------------------------ */

function AnnouncementCard() {
  return (
    <ResultCard
      kind="Public announcement"
      ocid="conversation.card.announcement"
      icon={<CalendarDays className="size-5" aria-hidden="true" />}
      title="Rooftop solar subsidy applications cross 1.42 lakh in Maharashtra"
      subtitle="Published by Ministry of New & Renewable Energy"
      footer={
        <>
          <div className="flex items-center gap-2">
            <StatusBadge tone="primary">Government site</StatusBadge>
            <span className="font-mono text-xs text-muted-foreground">
              12 Nov 2026
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            data-ocid="conversation.card.announcement.source_button"
            className="rounded-full border-border"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Read source
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        The state has processed a record number of residential rooftop solar
        applications this quarter, with Pune and Nashik leading installations.
        Disbursement timelines have been shortened to 30 days after inspection.
      </p>
    </ResultCard>
  );
}

/* ------------------------------------------------------------------ */
/* E. Document checklist card                                          */
/* ------------------------------------------------------------------ */

const CHECKLIST = [
  { label: "Aadhaar card", required: true },
  { label: "Latest electricity bill", required: true },
  { label: "Property ownership proof", required: true },
  { label: "Bank account passbook", required: true },
  { label: "Passport-size photograph", required: false },
];

function DocumentChecklistCard() {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    "Aadhaar card": true,
  });

  return (
    <ResultCard
      kind="Document checklist"
      ocid="conversation.card.checklist"
      icon={<FileText className="size-5" aria-hidden="true" />}
      title="Documents for rooftop solar subsidy"
      subtitle="Keep these ready before you apply"
      footer={
        <>
          <SourceBadge>mnre.gov.in · official checklist</SourceBadge>
          <span className="font-mono text-xs text-muted-foreground">
            {Object.values(checked).filter(Boolean).length} of{" "}
            {CHECKLIST.length} ready
          </span>
        </>
      }
    >
      <ul className="space-y-2">
        {CHECKLIST.map((item) => {
          const isChecked = checked[item.label] ?? false;
          return (
            <li key={item.label}>
              <button
                type="button"
                aria-pressed={isChecked}
                onClick={() =>
                  setChecked((prev) => ({
                    ...prev,
                    [item.label]: !prev[item.label],
                  }))
                }
                data-ocid={`conversation.card.checklist.item.${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-smooth hover:border-primary/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {isChecked ? (
                  <CheckCircle2
                    className="size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    "flex-1 text-sm",
                    isChecked
                      ? "text-muted-foreground line-through"
                      : "text-foreground",
                  )}
                >
                  {item.label}
                </span>
                <StatusBadge tone={item.required ? "warning" : "neutral"}>
                  {item.required ? "Required" : "Optional"}
                </StatusBadge>
              </button>
            </li>
          );
        })}
      </ul>
    </ResultCard>
  );
}

/* ------------------------------------------------------------------ */
/* F. Energy forecast response card                                    */
/* ------------------------------------------------------------------ */

const FORECAST_SERIES = [
  { hour: "00", historical: 168, forecast: 170 },
  { hour: "03", historical: 158, forecast: 162 },
  { hour: "06", historical: 182, forecast: 186 },
  { hour: "09", historical: 194, forecast: 199 },
  { hour: "12", historical: 198, forecast: 204 },
  { hour: "15", historical: 201, forecast: 208 },
  { hour: "18", historical: 206, forecast: 212 },
  { hour: "21", historical: 188, forecast: 195 },
];

function ForecastChart() {
  const width = 640;
  const height = 220;
  const padX = 8;
  const padY = 16;
  const values = FORECAST_SERIES.flatMap((d) => [d.historical, d.forecast]);
  const max = Math.max(...values) + 12;
  const min = Math.min(...values) - 12;
  const range = max - min || 1;

  const x = (i: number) =>
    padX + (i / (FORECAST_SERIES.length - 1)) * (width - padX * 2);
  const y = (v: number) => padY + (1 - (v - min) / range) * (height - padY * 2);

  const histPoints = FORECAST_SERIES.map(
    (d, i) => `${x(i)},${y(d.historical)}`,
  ).join(" ");
  const forePoints = FORECAST_SERIES.map(
    (d, i) => `${x(i)},${y(d.forecast)}`,
  ).join(" ");
  const bandTop = FORECAST_SERIES.map(
    (d, i) => `${x(i)},${y(d.forecast + 8)}`,
  ).join(" ");
  const bandBottom = FORECAST_SERIES.map(
    (d, i) => `${x(i)},${y(d.forecast - 8)}`,
  )
    .reverse()
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-56 w-full"
      role="img"
      aria-label="Historical versus forecast power demand line chart, sample data"
    >
      <title>Historical versus forecast power demand</title>
      <defs>
        <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="oklch(0.52 0.19 292)"
            stopOpacity="0.18"
          />
          <stop
            offset="100%"
            stopColor="oklch(0.52 0.19 292)"
            stopOpacity="0.04"
          />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3].map((line) => {
        const gy = padY + (line / 3) * (height - padY * 2);
        return (
          <line
            key={`grid-${line}`}
            x1={padX}
            x2={width - padX}
            y1={gy}
            y2={gy}
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        );
      })}

      <polygon points={`${bandTop} ${bandBottom}`} fill="url(#forecastBand)" />

      <polyline
        points={histPoints}
        fill="none"
        className="stroke-muted-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={forePoints}
        fill="none"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {FORECAST_SERIES.map((d, i) => (
        <circle
          key={`pt-${d.hour}`}
          cx={x(i)}
          cy={y(d.forecast)}
          r="3"
          className="fill-primary"
        />
      ))}
    </svg>
  );
}

function EnergyForecastCard() {
  return (
    <ResultCard
      kind="Energy forecast"
      ocid="conversation.card.forecast"
      icon={<TrendingUp className="size-5" aria-hidden="true" />}
      title="Day-ahead power demand forecast"
      subtitle="Maharashtra · 24-hour outlook"
      footer={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge>Grid-India NLDC</SourceBadge>
            <span className="font-mono text-xs text-muted-foreground">
              Last updated 12 Nov 2026 · 06:00 IST
            </span>
          </div>
          <Button
            type="button"
            data-ocid="conversation.card.forecast.dashboard_button"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            View Energy Dashboard
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="h-0.5 w-6 rounded-full bg-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-0.5 w-6 rounded-full bg-primary"
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground">Forecast</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-6 rounded-sm bg-primary/15"
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground">Confidence band</span>
        </div>
      </div>

      <div className="mt-4">
        <ForecastChart />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Peak demand", value: "212 GW", note: "18:00 IST" },
          { label: "Renewable share", value: "34.8%", note: "day average" },
          { label: "Forecast accuracy", value: "96.2%", note: "7-day rolling" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-border bg-muted/40 p-4"
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold text-foreground">
              {metric.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {metric.note}
            </p>
          </div>
        ))}
      </div>
    </ResultCard>
  );
}

/* ------------------------------------------------------------------ */
/* G. Information and source card                                      */
/* ------------------------------------------------------------------ */

function InformationSourceCard() {
  return (
    <ResultCard
      kind="Information & source"
      ocid="conversation.card.source"
      icon={<FileText className="size-5" aria-hidden="true" />}
      title="National Portal for Rooftop Solar"
      subtitle="Ministry of New & Renewable Energy"
      footer={
        <>
          <span className="font-mono text-xs text-muted-foreground">
            Last updated 08 Nov 2026
          </span>
          <a
            href="https://solarrooftop.gov.in"
            target="_blank"
            rel="noreferrer"
            data-ocid="conversation.card.source.link"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            solarrooftop.gov.in
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        The national portal is the single window for residential rooftop solar
        subsidy applications. It lets households register, select a verified
        vendor, track installation and receive the subsidy directly in their
        bank account.
      </p>
    </ResultCard>
  );
}

/* ------------------------------------------------------------------ */
/* Composer                                                            */
/* ------------------------------------------------------------------ */

function Composer() {
  const [draft, setDraft] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraft("");
  }

  return (
    <div className="sticky bottom-0 z-30 border-t border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[840px] px-4 py-4 md:px-6 md:py-5">
        <form
          onSubmit={handleSubmit}
          data-ocid="conversation.composer"
          className="rounded-[22px] border border-border bg-card p-2 shadow-elevated"
        >
          <div className="flex items-end gap-2">
            <label htmlFor="ask-urja-input" className="sr-only">
              Ask Urja a question
            </label>
            <textarea
              id="ask-urja-input"
              data-ocid="conversation.composer.input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={1}
              placeholder="Ask about services, schemes, offices or energy…"
              className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              data-ocid="conversation.composer.mic_button"
              aria-label="Use microphone"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Mic className="size-5" aria-hidden="true" />
            </button>
            <button
              type="submit"
              data-ocid="conversation.composer.send_button"
              aria-label="Send message"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-smooth hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Send className="size-5" aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-ocid="conversation.composer.voice_mode_button"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Volume2 className="size-4 text-primary" aria-hidden="true" />
              Voice mode
            </button>
            <button
              type="button"
              data-ocid="conversation.composer.start_over_button"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Start over
            </button>
          </div>
          <SampleTag />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ConversationPage() {
  return (
    <div
      data-ocid="conversation.page"
      className="flex min-h-[calc(100dvh-4rem)] flex-col"
    >
      <div className="flex-1">
        <div className="mx-auto w-full max-w-[840px] px-4 py-10 md:px-6 md:py-16">
          {/* User turn */}
          <div className="flex flex-col items-end gap-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              You asked
            </span>
            <h1 className="text-right font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
              {QUESTION}
            </h1>
            <div className="max-w-[85%] rounded-[20px] rounded-tr-md border border-border bg-muted/60 px-5 py-4">
              <p className="text-sm leading-relaxed text-foreground">
                {QUESTION}
              </p>
            </div>
          </div>

          {/* Assistant turn */}
          <div className="mt-14 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                Urja
              </span>
              <SampleTag />
            </div>
            <p className="text-base leading-relaxed text-foreground md:text-lg">
              {ASSISTANT_LEAD}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {ASSISTANT_CLOSE}
            </p>
          </div>

          {/* Result cards */}
          <div className="mt-10 space-y-6">
            <ServiceInfoCard />
            <SchemeCard />
            <HelplineCard />
            <AnnouncementCard />
            <DocumentChecklistCard />
            <EnergyForecastCard />
            <InformationSourceCard />
          </div>

          {/* Follow-up suggestions */}
          <div className="mt-10">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Follow up
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FOLLOW_UPS.map((item) => (
                <button
                  key={item}
                  type="button"
                  data-ocid={`conversation.followup.${item
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}`}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Composer />
    </div>
  );
}
