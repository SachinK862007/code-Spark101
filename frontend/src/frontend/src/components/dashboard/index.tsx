import { SampleTag, StatusBadge } from "@/components/shared";
import { Card } from "@/components/ui/card";
import {
  CAPACITY_GROWTH,
  type CapacityGrowthPoint,
  type EnergyMixSlice,
  type KpiCard,
  type QuickAction,
  type RpoPoint,
  type StakeholderRole,
  type StateRankRow,
} from "@/data/greenGridData";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  CircleDollarSign,
  CloudSun,
  Minus,
  Recycle,
  ShieldCheck,
  Sun,
  UserRound,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Trend chip — status colour carries meaning only                     */
/* ------------------------------------------------------------------ */

export function TrendChip({
  trend,
  label,
}: {
  trend: "up" | "down" | "flat";
  label: string;
}) {
  const Icon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const tone =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs font-semibold",
        tone,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkline                                                           */
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

/* ------------------------------------------------------------------ */
/* KPI card — value, unit, trend, sparkline, source, sample tag        */
/* ------------------------------------------------------------------ */

export function KpiCardView({
  kpi,
  index,
}: {
  kpi: KpiCard;
  index: number;
}) {
  return (
    <Card
      data-ocid={`dashboard.kpi_card.${index + 1}`}
      className="flex flex-col rounded-[18px] border-border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
        <SampleTag />
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">
        {kpi.value}
        <span className="ml-1.5 text-base font-normal text-muted-foreground">
          {kpi.unit}
        </span>
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <TrendChip trend={kpi.trend} label={kpi.trendLabel} />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {kpi.source}
        </span>
      </div>
      <div className="mt-3">
        <Sparkline series={kpi.series} />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Donut chart — energy mix                                            */
/* ------------------------------------------------------------------ */

export function DonutChart({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: EnergyMixSlice[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative size-44 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <title>Energy generation mix</title>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth="12"
          />
          {slices.map((slice) => {
            const fraction = slice.value / total;
            const dash = fraction * circumference;
            const segment = (
              <circle
                key={slice.id}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="12"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-semibold text-foreground">
            {centerValue}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {centerLabel}
          </span>
        </div>
      </div>
      <ul className="w-full space-y-2.5 sm:w-auto">
        {slices.map((slice) => (
          <li key={slice.id} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: slice.color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-foreground">{slice.label}</span>
            <span className="font-mono text-sm font-medium text-muted-foreground">
              {slice.value.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Line chart — RPO target vs actual                                   */
/* ------------------------------------------------------------------ */

export function RpoLineChart({ points }: { points: RpoPoint[] }) {
  const width = 320;
  const height = 160;
  const padX = 28;
  const padY = 18;
  const maxValue = 50;
  const stepX = (width - padX * 2) / (points.length - 1);
  const toY = (value: number) =>
    height - padY - (value / maxValue) * (height - padY * 2);

  const targetPoints = points
    .map((point, index) => `${padX + index * stepX},${toY(point.target)}`)
    .join(" ");
  const actualPoints = points
    .map((point, index) => `${padX + index * stepX},${toY(point.actual)}`)
    .join(" ");

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full"
        role="img"
        aria-label="RPO target versus actual achievement from 2018 to 2030"
      >
        <title>RPO target versus actual</title>
        {[0, 10, 20, 30, 40, 50].map((tick) => (
          <g key={tick}>
            <line
              x1={padX}
              y1={toY(tick)}
              x2={width - padX}
              y2={toY(tick)}
              className="stroke-border"
              strokeWidth="0.5"
            />
            <text
              x={padX - 6}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono text-[7px]"
            >
              {tick}
            </text>
          </g>
        ))}
        <polyline
          points={targetPoints}
          fill="none"
          className="stroke-muted-foreground"
          strokeWidth="1.6"
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={actualPoints}
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <circle
            key={point.year}
            cx={padX + index * stepX}
            cy={toY(point.actual)}
            r="2.4"
            className="fill-primary"
          />
        ))}
        {points.map((point, index) => (
          <text
            key={`label-${point.year}`}
            x={padX + index * stepX}
            y={height - 4}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[7px]"
          >
            {point.year}
          </text>
        ))}
      </svg>
      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-0.5 w-5 rounded-full bg-muted-foreground"
            aria-hidden="true"
          />
          Target
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-0.5 w-5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Actual
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stacked bar chart — renewable capacity growth                       */
/* ------------------------------------------------------------------ */

const CAPACITY_SERIES: {
  key: keyof Omit<CapacityGrowthPoint, "year">;
  label: string;
  color: string;
}[] = [
  { key: "solar", label: "Solar", color: "var(--chart-2)" },
  { key: "wind", label: "Wind", color: "var(--chart-4)" },
  { key: "hydro", label: "Hydro", color: "var(--chart-3)" },
  { key: "other", label: "Other", color: "var(--chart-1)" },
];

export function CapacityBarChart() {
  const maxTotal = Math.max(
    ...CAPACITY_GROWTH.map(
      (point) => point.solar + point.wind + point.hydro + point.other,
    ),
  );

  return (
    <div className="w-full">
      <div className="flex h-48 items-end justify-between gap-2">
        {CAPACITY_GROWTH.map((point) => {
          const total = point.solar + point.wind + point.hydro + point.other;
          const heightPct = (total / maxTotal) * 100;
          return (
            <div
              key={point.year}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className="flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-md"
                style={{ height: `${heightPct}%` }}
              >
                {CAPACITY_SERIES.map((series) => (
                  <div
                    key={series.key}
                    style={{
                      backgroundColor: series.color,
                      height: `${(point[series.key] / total) * 100}%`,
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {point.year}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        {CAPACITY_SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-2">
            <span
              className="size-2.5 rounded-sm"
              style={{ backgroundColor: series.color }}
              aria-hidden="true"
            />
            {series.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ranked state comparison list                                        */
/* ------------------------------------------------------------------ */

export function RankedStateList({ rows }: { rows: StateRankRow[] }) {
  return (
    <ol data-ocid="dashboard.state_ranking" className="space-y-2">
      {rows.map((row) => (
        <li
          key={row.state}
          data-ocid={`dashboard.state_row.${row.rank}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 transition-smooth hover:border-primary/30"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-secondary-foreground">
            {row.rank}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {row.state}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              {row.capacity} installed
            </span>
          </span>
          <span className="text-right">
            <span className="block font-mono text-sm font-semibold text-foreground">
              {row.share}
            </span>
            <TrendChip trend={row.trend} label="renewable" />
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Quick actions                                                       */
/* ------------------------------------------------------------------ */

const QUICK_ACTION_ICONS = {
  rpo: ShieldCheck,
  solar: Sun,
  forecast: CloudSun,
  jobs: Briefcase,
  finance: CircleDollarSign,
} as const;

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action, index) => {
        const Icon = QUICK_ACTION_ICONS[action.icon];
        return (
          <Link
            key={action.id}
            to={action.to}
            data-ocid={`dashboard.quick_action.${index + 1}`}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {action.label}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {action.description}
              </span>
            </span>
            <ArrowRight
              className="size-4 shrink-0 text-muted-foreground transition-smooth group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stakeholder card — landing page role selection                      */
/* ------------------------------------------------------------------ */

const STAKEHOLDER_ICONS = {
  citizen: UserRound,
  entity: Building2,
  policymaker: Zap,
  finance: CircleDollarSign,
  circular: Recycle,
} as const;

export function StakeholderCard({
  role,
  index,
  onSelect,
}: {
  role: StakeholderRole;
  index: number;
  onSelect: (id: string) => void;
}) {
  const Icon = STAKEHOLDER_ICONS[role.icon];
  return (
    <Card
      data-ocid={`home.stakeholder_card.${index + 1}`}
      className="flex h-full flex-col rounded-[20px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
        {role.label}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {role.description}
      </p>
      <button
        type="button"
        data-ocid={`home.stakeholder_card.${index + 1}.explore_button`}
        onClick={() => onSelect(role.id)}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Explore dashboard
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Data refresh indicator                                              */
/* ------------------------------------------------------------------ */

export function DataRefreshIndicator({
  sources,
  lastUpdated,
}: {
  sources: { id: string; label: string; status: "live" | "delayed" }[];
  lastUpdated: string;
}) {
  return (
    <div
      data-ocid="dashboard.refresh_indicator"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle"
    >
      <span className="inline-flex items-center gap-2">
        <span
          className="size-2 animate-pulse-soft rounded-full bg-success"
          aria-hidden="true"
        />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
          Data refresh
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-2">
        {sources.map((source) => (
          <StatusBadge
            key={source.id}
            tone={source.status === "live" ? "success" : "warning"}
          >
            {source.label} · {source.status}
          </StatusBadge>
        ))}
      </span>
      <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Last updated {lastUpdated}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section wrapper for dashboard content                               */
/* ------------------------------------------------------------------ */

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
