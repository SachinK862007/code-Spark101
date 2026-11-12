import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Sample-data label — required on every number, chart and response    */
/* ------------------------------------------------------------------ */

export function SampleTag({ className }: { className?: string }) {
  return (
    <span
      data-ocid="sample.label"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
      Sample data
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section heading — editorial eyebrow + serif title                   */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-2">
        {eyebrow && (
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status badge — status colours carry meaning only                    */
/* ------------------------------------------------------------------ */

const STATUS_TONES = {
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/25 bg-primary/10 text-primary",
} as const;

export type StatusTone = keyof typeof STATUS_TONES;

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
        STATUS_TONES[tone],
        className,
      )}
    >
      {children}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Source / provenance badge                                           */
/* ------------------------------------------------------------------ */

export function SourceBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <span
        className="size-1.5 rounded-full bg-primary/60"
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Suggestion chip                                                     */
/* ------------------------------------------------------------------ */

export function SuggestionChip({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Filter chip                                                         */
/* ------------------------------------------------------------------ */

export function FilterChip({
  label,
  active = false,
  onClick,
  className,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Metric card — label, mono value, status, sparkline                  */
/* ------------------------------------------------------------------ */

export function Sparkline({
  series,
  className,
}: {
  series: number[];
  className?: string;
}) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 30 - ((value - min) / range) * 26;
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `0,32 ${points} 100,32`;

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className={cn("h-10 w-full", className)}
      aria-hidden="true"
    >
      <polygon points={areaPoints} className="fill-primary/10" />
      <polyline
        points={points}
        fill="none"
        className="stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function MetricCard({
  label,
  value,
  unit,
  status,
  statusTone,
  series,
  className,
}: {
  label: string;
  value: string;
  unit: string;
  status: string;
  statusTone: StatusTone;
  series: number[];
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[18px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated",
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">
        {value}
        <span className="ml-1.5 text-base font-normal text-muted-foreground">
          {unit}
        </span>
      </p>
      <div className="mt-3">
        <StatusBadge tone={statusTone}>{status}</StatusBadge>
      </div>
      <div className="mt-4">
        <Sparkline series={series} />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Chart container                                                     */
/* ------------------------------------------------------------------ */

export function ChartContainer({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <SampleTag />
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Empty / loading / error states                                      */
/* ------------------------------------------------------------------ */

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-ocid="empty_state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-border bg-muted/30 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({
  label = "Loading sample data…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      data-ocid="loading_state"
      className={cn("space-y-4", className)}
      aria-busy="true"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {label}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
          <Skeleton key={id} className="h-32 rounded-[18px]" />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this section. Please try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      data-ocid="error_state"
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[18px] border border-destructive/25 bg-destructive/5 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-5" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          type="button"
          data-ocid="error_state.retry_button"
          onClick={onRetry}
          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page frame — consistent max width and vertical rhythm               */
/* ------------------------------------------------------------------ */

export function PageFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-ocid="page"
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-16",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Placeholder page body — used until page tasks implement the body    */
/* ------------------------------------------------------------------ */

export function PagePlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <PageFrame>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="mt-10">
        <EmptyState
          title="This screen is being composed"
          description="The shared shell, navigation and design system are in place. The full page body arrives in a following task."
        />
      </div>
    </PageFrame>
  );
}
