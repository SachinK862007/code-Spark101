import {
  CapacityBarChart,
  DashboardSection,
  DataRefreshIndicator,
  DonutChart,
  KpiCardView,
  QuickActions,
  RankedStateList,
  RpoLineChart,
} from "@/components/dashboard";
import { SampleTag, StatusBadge } from "@/components/shared";
import { Card } from "@/components/ui/card";
import {
  DATA_REFRESH_SOURCES,
  DATE_FILTER_OPTIONS,
  ENERGY_MIX,
  GENERATION_TRENDS,
  LAST_UPDATED,
  OVERVIEW_KPIS,
  QUICK_ACTIONS,
  REPORTING_PERIOD,
  RPO_TRAJECTORY,
  STATE_FILTER_OPTIONS,
  STATE_RANKING,
} from "@/data/greenGridData";
import { cn } from "@/lib/utils";
import { CalendarRange, ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Generation trends line chart                                        */
/* ------------------------------------------------------------------ */

function GenerationTrendChart() {
  const width = 340;
  const height = 170;
  const padX = 30;
  const padY = 18;
  const maxValue = 1300;
  const stepX = (width - padX * 2) / (GENERATION_TRENDS.length - 1);
  const toY = (value: number) =>
    height - padY - (value / maxValue) * (height - padY * 2);

  const coalPoints = GENERATION_TRENDS.map(
    (point, index) => `${padX + index * stepX},${toY(point.coal)}`,
  ).join(" ");
  const renewablePoints = GENERATION_TRENDS.map(
    (point, index) => `${padX + index * stepX},${toY(point.renewable)}`,
  ).join(" ");

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full"
        role="img"
        aria-label="Coal and renewable generation trends from 2018 to 2024"
      >
        <title>Generation trends</title>
        {[0, 400, 800, 1200].map((tick) => (
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
          points={coalPoints}
          fill="none"
          className="stroke-chart-5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={renewablePoints}
          fill="none"
          className="stroke-chart-3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {GENERATION_TRENDS.map((point, index) => (
          <text
            key={point.year}
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
            className="h-0.5 w-5 rounded-full bg-chart-5"
            aria-hidden="true"
          />
          Coal (TWh)
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-0.5 w-5 rounded-full bg-chart-3"
            aria-hidden="true"
          />
          Renewable (TWh)
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filter select                                                       */
/* ------------------------------------------------------------------ */

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  icon,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon: typeof MapPin;
}) {
  const Icon = icon;
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <select
        id={id}
        data-ocid={`dashboard.${id}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-full border border-input bg-card py-2.5 pl-10 pr-9 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [state, setState] = useState(STATE_FILTER_OPTIONS[0]);
  const [dateRange, setDateRange] = useState(DATE_FILTER_OPTIONS[3]);

  return (
    <div
      data-ocid="dashboard.page"
      className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10"
    >
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Overview
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              India Green Grid
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              India&apos;s renewable energy transition at a glance
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <SampleTag />
              <StatusBadge tone="neutral">{REPORTING_PERIOD}</StatusBadge>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Source: CEA, MNRE, Grid-India
              </span>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <FilterSelect
              id="state_filter"
              label="State"
              value={state}
              options={STATE_FILTER_OPTIONS}
              onChange={setState}
              icon={MapPin}
            />
            <FilterSelect
              id="date_filter"
              label="Date range"
              value={dateRange}
              options={DATE_FILTER_OPTIONS}
              onChange={setDateRange}
              icon={CalendarRange}
            />
          </div>
        </div>

        <DataRefreshIndicator
          sources={DATA_REFRESH_SOURCES}
          lastUpdated={LAST_UPDATED}
        />
      </div>

      {/* KPI cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {OVERVIEW_KPIS.map((kpi, index) => (
          <KpiCardView key={kpi.id} kpi={kpi} index={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Energy mix
            </h2>
            <SampleTag />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Current generation mix (FY 24)
          </p>
          <div className="mt-6">
            <DonutChart
              slices={ENERGY_MIX}
              centerLabel="Coal share"
              centerValue="58.8%"
            />
          </div>
        </Card>

        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Generation trends
            </h2>
            <SampleTag />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Coal vs. renewable generation, 2018–2024
          </p>
          <div className="mt-6">
            <GenerationTrendChart />
          </div>
        </Card>

        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Renewable capacity growth
            </h2>
            <SampleTag />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Installed capacity by source (GW)
          </p>
          <div className="mt-6">
            <CapacityBarChart />
          </div>
        </Card>
      </div>

      {/* RPO + state ranking */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              RPO target vs. actual
            </h2>
            <SampleTag />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Renewable purchase obligation, 2018–2030 (%)
          </p>
          <div className="mt-6">
            <RpoLineChart points={RPO_TRAJECTORY} />
          </div>
        </Card>

        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              State comparison
            </h2>
            <SampleTag />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by installed renewable capacity
          </p>
          <div className="mt-6">
            <RankedStateList rows={STATE_RANKING} />
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <DashboardSection
        className="mt-10"
        title="Quick actions"
        description="Jump straight into the module you need."
        action={<SampleTag />}
      >
        <QuickActions actions={QUICK_ACTIONS} />
      </DashboardSection>

      <p
        className={cn(
          "mt-10 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
        )}
      >
        Illustrative prototype · All figures are sample data ·{" "}
        {REPORTING_PERIOD}
      </p>
    </div>
  );
}
