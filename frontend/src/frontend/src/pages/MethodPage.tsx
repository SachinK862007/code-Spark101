import {
  PageFrame,
  SampleTag,
  SectionHeading,
  SourceBadge,
  StatusBadge,
} from "@/components/shared";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Code2,
  Database,
  FileText,
  Gauge,
  Globe2,
  Landmark,
  Layers,
  Leaf,
  Lock,
  Megaphone,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Section A — How Urja works pipeline                                 */
/* ------------------------------------------------------------------ */

interface PipelineStage {
  id: string;
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "sources",
    step: "01",
    title: "Public Data Sources",
    description:
      "Government departments, public portals and energy-sector organisations publish the raw records.",
    icon: Database,
  },
  {
    id: "organisation",
    step: "02",
    title: "Data Organisation",
    description:
      "Records are normalised, de-duplicated and mapped to a shared vocabulary of places and services.",
    icon: Layers,
  },
  {
    id: "analysis",
    step: "03",
    title: "Analysis and Forecasting",
    description:
      "Historical series are prepared and modelled to produce demand and generation outlooks.",
    icon: BarChart3,
  },
  {
    id: "interface",
    step: "04",
    title: "Information Interface",
    description:
      "Results are presented in plain language with the source and confidence shown beside them.",
    icon: Gauge,
  },
  {
    id: "insights",
    step: "05",
    title: "User Insights",
    description:
      "People and institutions act on clear, attributable information about their region and grid.",
    icon: Sparkles,
  },
];

function PipelineDiagram() {
  return (
    <div
      data-ocid="method.pipeline"
      className="grid gap-4 lg:grid-cols-5 lg:items-stretch"
    >
      {PIPELINE_STAGES.map((stage, index) => {
        const Icon = stage.icon;
        const isLast = index === PIPELINE_STAGES.length - 1;
        return (
          <div key={stage.id} className="relative flex">
            <Card className="flex w-full flex-col gap-3 rounded-[18px] border-border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                  {stage.step}
                </span>
              </div>
              <h3 className="font-display text-base font-semibold leading-snug text-foreground">
                {stage.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {stage.description}
              </p>
            </Card>
            {!isLast && (
              <span
                className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-primary/50 lg:block"
                aria-hidden="true"
              >
                <ArrowRight className="size-5" />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section B — Data sources                                            */
/* ------------------------------------------------------------------ */

interface DataSource {
  id: string;
  category: string;
  title: string;
  description: string;
  provenance: string;
  icon: LucideIcon;
}

const DATA_SOURCES: DataSource[] = [
  {
    id: "govt",
    category: "Government departments",
    title: "Ministry and department releases",
    description:
      "Policy notifications, scheme guidelines and administrative circulars published by central and state departments.",
    provenance: "Official gazette · verified",
    icon: Landmark,
  },
  {
    id: "portals",
    category: "Public data portals",
    title: "Open government data portals",
    description:
      "Machine-readable datasets on services, geography and infrastructure released under open licences.",
    provenance: "Open licence · public",
    icon: Globe2,
  },
  {
    id: "energy",
    category: "Energy-sector organisations",
    title: "Grid and utility operators",
    description:
      "Load despatch centres and distribution utilities reporting demand, frequency and outage information.",
    provenance: "Operator report · public",
    icon: Radio,
  },
  {
    id: "regulatory",
    category: "Regulatory publications",
    title: "Regulatory filings and orders",
    description:
      "Tariff orders, market regulations and compliance publications issued by regulatory commissions.",
    provenance: "Regulatory order · official",
    icon: BookOpenCheck,
  },
  {
    id: "renewable",
    category: "Renewable energy datasets",
    title: "Generation and capacity datasets",
    description:
      "Installed capacity, generation output and commissioning records for solar, wind and hydro assets.",
    provenance: "Programme dataset · public",
    icon: Leaf,
  },
  {
    id: "announcements",
    category: "Public announcements",
    title: "Notices and public advisories",
    description:
      "Time-sensitive advisories, tender notices and public communications from responsible agencies.",
    provenance: "Public notice · unverified",
    icon: Megaphone,
  },
];

function DataSourceCard({ source }: { source: DataSource }) {
  const Icon = source.icon;
  return (
    <Card
      data-ocid={`method.source_card.${source.id}`}
      className="flex h-full flex-col gap-4 rounded-[18px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <SourceBadge>{source.provenance}</SourceBadge>
      </div>
      <div className="space-y-1.5">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {source.category}
        </p>
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
          {source.title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {source.description}
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Section C — Forecasting methodology                                 */
/* ------------------------------------------------------------------ */

interface ForecastStep {
  id: string;
  label: string;
  title: string;
  description: string;
}

const FORECAST_STEPS: ForecastStep[] = [
  {
    id: "historical",
    label: "Historical data",
    title: "Historical data",
    description:
      "Years of recorded demand, generation and weather series form the baseline for every outlook.",
  },
  {
    id: "preparation",
    label: "Data preparation",
    title: "Data preparation",
    description:
      "Gaps are filled, outliers reviewed and series aligned to a common time resolution.",
  },
  {
    id: "generation",
    label: "Forecast generation",
    title: "Forecast generation",
    description:
      "Statistical and machine-learning models produce day-ahead and medium-term projections.",
  },
  {
    id: "uncertainty",
    label: "Forecast uncertainty",
    title: "Forecast uncertainty",
    description:
      "Every projection carries a confidence band so the range of outcomes stays visible.",
  },
  {
    id: "evaluation",
    label: "Evaluation & monitoring",
    title: "Evaluation and monitoring",
    description:
      "Forecasts are scored against actuals and the models are reviewed on a fixed cadence.",
  },
];

function ForecastMethodology() {
  return (
    <div
      data-ocid="method.forecast"
      className="grid gap-5 md:grid-cols-2 lg:grid-cols-5"
    >
      {FORECAST_STEPS.map((step, index) => (
        <div key={step.id} className="relative flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-mono text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <h3 className="font-display text-base font-semibold text-foreground">
            {step.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section D — Transparency                                            */
/* ------------------------------------------------------------------ */

interface TransparencyLevel {
  id: string;
  label: string;
  description: string;
  tone: "success" | "primary" | "warning" | "neutral" | "danger";
  swatch: string;
  icon: LucideIcon;
}

const TRANSPARENCY_LEVELS: TransparencyLevel[] = [
  {
    id: "official",
    label: "Official information",
    description:
      "Published directly by the responsible authority and reproduced without alteration.",
    tone: "success",
    swatch: "bg-success",
    icon: ShieldCheck,
  },
  {
    id: "public",
    label: "Publicly available information",
    description:
      "Openly accessible records and datasets that Urja organises for easier reading.",
    tone: "primary",
    swatch: "bg-primary",
    icon: Globe2,
  },
  {
    id: "forecast",
    label: "Forecast values",
    description:
      "Modelled projections that carry a confidence range and are never presented as fact.",
    tone: "warning",
    swatch: "bg-warning",
    icon: BarChart3,
  },
  {
    id: "illustrative",
    label: "Illustrative / demo values",
    description:
      "Sample figures used in this prototype to show how real data would appear.",
    tone: "neutral",
    swatch: "bg-muted-foreground",
    icon: Sparkles,
  },
  {
    id: "unverified",
    label: "Unverified information",
    description:
      "Material awaiting confirmation, shown with a clear caution and its original source.",
    tone: "danger",
    swatch: "bg-destructive",
    icon: FileText,
  },
];

function TransparencySection() {
  return (
    <div
      data-ocid="method.transparency"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {TRANSPARENCY_LEVELS.map((level) => {
        const Icon = level.icon;
        return (
          <Card
            key={level.id}
            data-ocid={`method.transparency_card.${level.id}`}
            className="flex h-full flex-col gap-3 rounded-[18px] border-border bg-card p-6 shadow-subtle"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn("size-2.5 rounded-full", level.swatch)}
                aria-hidden="true"
              />
              <Icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <StatusBadge tone={level.tone}>{level.label}</StatusBadge>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {level.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section E — Privacy and accessibility                               */
/* ------------------------------------------------------------------ */

interface PrincipleCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const PRINCIPLE_CARDS: PrincipleCard[] = [
  {
    id: "accessible",
    title: "Accessible information",
    description:
      "Plain-language summaries, readable type and keyboard-friendly navigation across every screen.",
    icon: Users,
  },
  {
    id: "attribution",
    title: "Clear source attribution",
    description:
      "Every answer names where it came from, so readers can trace information to its origin.",
    icon: CheckCircle2,
  },
  {
    id: "privacy",
    title: "Privacy-conscious communication",
    description:
      "Queries are handled with care and personal details are never required to read public information.",
    icon: Lock,
  },
  {
    id: "multilingual",
    title: "Multilingual accessibility",
    description:
      "Content is structured for translation so information reaches readers in their own language.",
    icon: Globe2,
  },
];

function PrincipleCardView({ card }: { card: PrincipleCard }) {
  const Icon = card.icon;
  return (
    <Card
      data-ocid={`method.principle_card.${card.id}`}
      className="flex h-full flex-col gap-3 rounded-[18px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold text-foreground">
        {card.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {card.description}
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Section F — Developer tools                                         */
/* ------------------------------------------------------------------ */

function DeveloperToolsCard() {
  return (
    <Card
      data-ocid="method.developer_card"
      className="overflow-hidden rounded-[20px] border-border bg-card p-0 shadow-subtle"
    >
      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4 p-6 md:p-8">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Code2 className="size-5" aria-hidden="true" />
            </span>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Developer tools
            </p>
          </div>
          <h3 className="font-display text-2xl font-semibold text-foreground">
            Energy Market Forecast API Explorer
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Inspect the forecast endpoints that power Urja's energy
            intelligence, review request parameters and preview sample responses
            before you build.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="/energy/api"
              data-ocid="method.developer_link"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Open API Explorer
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <SampleTag />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-3 border-t border-border bg-muted/40 p-6 md:border-l md:border-t-0 md:p-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Endpoints
          </p>
          <ul className="space-y-2 font-mono text-xs text-foreground">
            <li className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                GET
              </span>
              /v1/forecast/demand
            </li>
            <li className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                GET
              </span>
              /v1/forecast/renewable
            </li>
            <li className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                GET
              </span>
              /v1/market/price
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Section wrapper                                                     */
/* ------------------------------------------------------------------ */

function MethodSection({
  id,
  eyebrow,
  title,
  description,
  children,
  muted = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      id={id}
      data-ocid={`method.section.${id}`}
      className={cn("py-16 md:py-24", muted && "bg-muted/40")}
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function MethodPage() {
  return (
    <div data-ocid="method.page">
      {/* Editorial header */}
      <section className="border-b border-border bg-gradient-subtle">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Method · About Urja
              </p>
              <SampleTag />
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Understand the information behind every answer.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Urja brings together public information and energy data, then
              presents it in a clear and accessible way.
            </p>
          </div>
        </div>
      </section>

      <MethodSection
        id="how-it-works"
        eyebrow="A · How Urja works"
        title="From public sources to usable insight"
        description="Five stages turn scattered public records into information people can act on."
      >
        <PipelineDiagram />
      </MethodSection>

      <MethodSection
        id="data-sources"
        eyebrow="B · Data sources"
        title="Where the information comes from"
        description="Each source is grouped by category and carries a visible provenance label."
        muted
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {DATA_SOURCES.map((source) => (
            <DataSourceCard key={source.id} source={source} />
          ))}
        </div>
      </MethodSection>

      <MethodSection
        id="forecasting"
        eyebrow="C · Forecasting methodology"
        title="How a forecast is produced"
        description="A transparent pipeline from historical records to monitored, uncertainty-aware projections."
      >
        <ForecastMethodology />
      </MethodSection>

      <MethodSection
        id="transparency"
        eyebrow="D · Transparency"
        title="Every value is labelled by its nature"
        description="The interface distinguishes official, public, forecast, illustrative and unverified information."
        muted
      >
        <TransparencySection />
      </MethodSection>

      <MethodSection
        id="privacy-accessibility"
        eyebrow="E · Privacy & accessibility"
        title="Built to be read by everyone"
        description="Accessibility, attribution, privacy and language are treated as first-class requirements."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLE_CARDS.map((card) => (
            <PrincipleCardView key={card.id} card={card} />
          ))}
        </div>
      </MethodSection>

      <MethodSection
        id="developer-tools"
        eyebrow="F · Developer tools"
        title="Build on the same data"
        description="The forecast API explorer exposes the endpoints behind Urja's energy intelligence."
        muted
      >
        <DeveloperToolsCard />
      </MethodSection>
    </div>
  );
}
