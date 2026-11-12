import {
  ChartContainer,
  FilterChip,
  PageFrame,
  SampleTag,
  SectionHeading,
  SourceBadge,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  Compass,
  Gauge,
  Info,
  Minus,
  Radio,
  Sun,
  Wind,
} from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Illustrative sample data — static, never fetched or computed        */
/* ------------------------------------------------------------------ */

interface SummaryMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "flat";
  trendLabel: string;
  comparison: string;
  series: number[];
}

const SUMMARY_METRICS: SummaryMetric[] = [
  {
    id: "current-demand",
    label: "Current Energy Demand",
    value: "198,420",
    unit: "MW",
    trend: "up",
    trendLabel: "+2.4%",
    comparison: "vs. same hour yesterday",
    series: [42, 48, 45, 52, 58, 55, 61, 66, 63, 70, 74, 71, 78],
  },
  {
    id: "renewable-generation",
    label: "Renewable Generation",
    value: "69,050",
    unit: "MW",
    trend: "up",
    trendLabel: "+5.1%",
    comparison: "vs. 7-day average",
    series: [30, 33, 31, 36, 40, 38, 44, 47, 45, 50, 53, 51, 56],
  },
  {
    id: "non-fossil-capacity",
    label: "Non-Fossil Installed Capacity",
    value: "241.6",
    unit: "GW",
    trend: "up",
    trendLabel: "+1.8 GW",
    comparison: "added this quarter",
    series: [20, 24, 26, 29, 33, 36, 39, 43, 47, 51, 55, 60, 64],
  },
  {
    id: "forecast-demand",
    label: "Forecasted Energy Demand",
    value: "205,760",
    unit: "MW",
    trend: "down",
    trendLabel: "-0.6%",
    comparison: "peak, next 24 hours",
    series: [70, 72, 69, 74, 71, 68, 66, 69, 65, 63, 66, 62, 60],
  },
];

interface MixSlice {
  id: string;
  label: string;
  share: number;
  color: string;
}

const GENERATION_MIX: MixSlice[] = [
  { id: "solar", label: "Solar", share: 21, color: "var(--chart-2)" },
  { id: "wind", label: "Wind", share: 14, color: "var(--chart-3)" },
  { id: "hydro", label: "Hydro", share: 12, color: "var(--chart-4)" },
  { id: "thermal", label: "Thermal", share: 47, color: "var(--chart-1)" },
  { id: "other", label: "Other sources", share: 6, color: "var(--chart-5)" },
];

const TOTAL_GENERATION = "201,340 MW";

interface DemandPoint {
  label: string;
  demand: number;
  forecast: boolean;
  low?: number;
  high?: number;
}

const DEMAND_24H: DemandPoint[] = [
  { label: "00:00", demand: 168, forecast: false },
  { label: "03:00", demand: 158, forecast: false },
  { label: "06:00", demand: 182, forecast: false },
  { label: "09:00", demand: 194, forecast: false },
  { label: "12:00", demand: 198, forecast: false },
  { label: "15:00", demand: 201, forecast: false },
  { label: "18:00", demand: 206, forecast: false },
  { label: "21:00", demand: 188, forecast: false },
  { label: "00:00", demand: 176, forecast: true, low: 168, high: 184 },
  { label: "03:00", demand: 164, forecast: true, low: 154, high: 176 },
  { label: "06:00", demand: 188, forecast: true, low: 176, high: 201 },
  { label: "09:00", demand: 199, forecast: true, low: 186, high: 214 },
  { label: "12:00", demand: 205, forecast: true, low: 191, high: 221 },
  { label: "15:00", demand: 208, forecast: true, low: 193, high: 226 },
  { label: "18:00", demand: 212, forecast: true, low: 196, high: 231 },
  { label: "21:00", demand: 194, forecast: true, low: 179, high: 212 },
];

const DEMAND_7D: DemandPoint[] = [
  { label: "Thu", demand: 191, forecast: false },
  { label: "Fri", demand: 196, forecast: false },
  { label: "Sat", demand: 184, forecast: false },
  { label: "Sun", demand: 178, forecast: false },
  { label: "Mon", demand: 199, forecast: false },
  { label: "Tue", demand: 203, forecast: false },
  { label: "Wed", demand: 197, forecast: false },
  { label: "Thu", demand: 201, forecast: true, low: 192, high: 210 },
  { label: "Fri", demand: 206, forecast: true, low: 195, high: 218 },
  { label: "Sat", demand: 193, forecast: true, low: 181, high: 206 },
  { label: "Sun", demand: 187, forecast: true, low: 174, high: 201 },
  { label: "Mon", demand: 205, forecast: true, low: 190, high: 221 },
  { label: "Tue", demand: 209, forecast: true, low: 192, high: 227 },
  { label: "Wed", demand: 202, forecast: true, low: 185, high: 220 },
];

const DEMAND_30D: DemandPoint[] = [
  { label: "W1", demand: 188, forecast: false },
  { label: "W2", demand: 194, forecast: false },
  { label: "W3", demand: 201, forecast: false },
  { label: "W4", demand: 197, forecast: false },
  { label: "W5", demand: 203, forecast: true, low: 192, high: 215 },
  { label: "W6", demand: 208, forecast: true, low: 195, high: 222 },
  { label: "W7", demand: 199, forecast: true, low: 185, high: 214 },
  { label: "W8", demand: 205, forecast: true, low: 189, high: 222 },
];

const RANGE_SERIES: Record<string, DemandPoint[]> = {
  "24h": DEMAND_24H,
  "7d": DEMAND_7D,
  "30d": DEMAND_30D,
};

const RANGE_OPTIONS = [
  { id: "24h", label: "24 Hours" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
];

const SOLAR_TREND = [18, 22, 27, 34, 41, 47, 52, 49, 44, 38, 31, 26];
const WIND_TREND = [24, 26, 23, 28, 31, 29, 34, 37, 33, 30, 28, 25];

interface StateRow {
  state: string;
  capacity: string;
  capacityValue: number;
  generation: string;
  forecast: string;
  status: "Live" | "Delayed" | "Provisional";
  statusTone: "success" | "warning" | "neutral";
}

const STATE_ROWS: StateRow[] = [
  {
    state: "Rajasthan",
    capacity: "28.4 GW",
    capacityValue: 100,
    generation: "6,120 MW",
    forecast: "13,540 MW",
    status: "Live",
    statusTone: "success",
  },
  {
    state: "Gujarat",
    capacity: "24.1 GW",
    capacityValue: 85,
    generation: "5,480 MW",
    forecast: "21,760 MW",
    status: "Live",
    statusTone: "success",
  },
  {
    state: "Tamil Nadu",
    capacity: "21.7 GW",
    capacityValue: 76,
    generation: "4,910 MW",
    forecast: "17,930 MW",
    status: "Live",
    statusTone: "success",
  },
  {
    state: "Karnataka",
    capacity: "18.9 GW",
    capacityValue: 67,
    generation: "4,260 MW",
    forecast: "14,220 MW",
    status: "Delayed",
    statusTone: "warning",
  },
  {
    state: "Maharashtra",
    capacity: "16.3 GW",
    capacityValue: 57,
    generation: "3,740 MW",
    forecast: "28,410 MW",
    status: "Live",
    statusTone: "success",
  },
  {
    state: "Uttar Pradesh",
    capacity: "9.8 GW",
    capacityValue: 34,
    generation: "2,180 MW",
    forecast: "24,880 MW",
    status: "Provisional",
    statusTone: "neutral",
  },
];

const REGION_OPTIONS = [
  "All India",
  "Northern Region",
  "Western Region",
  "Southern Region",
  "Eastern Region",
  "North-Eastern Region",
];

const DATE_RANGE_OPTIONS = [
  "Last 24 hours",
  "Last 7 days",
  "Last 30 days",
  "This quarter",
];

const HORIZON_OPTIONS = [
  "Next 24 hours",
  "Next 3 days",
  "Next 7 days",
  "Next 30 days",
];

/* ------------------------------------------------------------------ */
/* Small chart primitives (inline SVG, no runtime dependencies)        */
/* ------------------------------------------------------------------ */

function TrendPill({
  trend,
  label,
}: { trend: SummaryMetric["trend"]; label: string }) {
  const Icon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold",
        trend === "up" && "bg-success/10 text-success",
        trend === "down" && "bg-destructive/10 text-destructive",
        trend === "flat" && "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

function Sparkline({ series }: { series: number[] }) {
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
  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className="h-10 w-full"
      aria-hidden="true"
    >
      <polygon points={`0,32 ${points} 100,32`} className="fill-primary/10" />
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

function DonutChart({ slices }: { slices: MixSlice[] }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg viewBox="0 0 160 160" className="size-44 shrink-0" role="img">
      <title>Illustrative generation mix by source</title>
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        strokeWidth="22"
        className="stroke-muted"
      />
      {slices.map((slice) => {
        const length = (slice.share / 100) * circumference;
        const dash = `${length} ${circumference - length}`;
        const element = (
          <circle
            key={slice.id}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="22"
            stroke={slice.color}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            transform="rotate(-90 80 80)"
            strokeLinecap="butt"
          />
        );
        offset += length;
        return element;
      })}
      <text
        x="80"
        y="74"
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[9px] uppercase tracking-[0.14em]"
      >
        Total
      </text>
      <text
        x="80"
        y="92"
        textAnchor="middle"
        className="fill-foreground font-mono text-[15px] font-semibold"
      >
        201 GW
      </text>
    </svg>
  );
}

function DemandChart({ data }: { data: DemandPoint[] }) {
  const width = 720;
  const height = 260;
  const padX = 8;
  const padTop = 16;
  const padBottom = 28;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;
  const values = data.flatMap((point) =>
    point.low !== undefined && point.high !== undefined
      ? [point.demand, point.low, point.high]
      : [point.demand],
  );
  const max = Math.max(...values) + 8;
  const min = Math.min(...values) - 8;
  const range = max - min || 1;

  const xAt = (index: number) => padX + (index / (data.length - 1)) * plotW;
  const yAt = (value: number) => padTop + (1 - (value - min) / range) * plotH;

  const firstForecast = data.findIndex((point) => point.forecast);
  const dividerX = firstForecast > 0 ? xAt(firstForecast) : null;

  const historical = data.filter((point) => !point.forecast);
  const forecast = data.filter((point) => point.forecast);

  const line = (points: DemandPoint[]) =>
    points
      .map((point) => `${xAt(data.indexOf(point))},${yAt(point.demand)}`)
      .join(" ");

  const bandPoints = forecast
    .map(
      (point) =>
        `${xAt(data.indexOf(point))},${yAt(point.high ?? point.demand)}`,
    )
    .concat(
      [...forecast]
        .reverse()
        .map(
          (point) =>
            `${xAt(data.indexOf(point))},${yAt(point.low ?? point.demand)}`,
        ),
    )
    .join(" ");

  const gridLines = [0, 1, 2, 3, 4].map((step) => {
    const value = min + (range * step) / 4;
    return { y: yAt(value), value: Math.round(value) };
  });

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 w-full"
        preserveAspectRatio="none"
        role="img"
      >
        <title>Historical and forecasted national energy demand</title>
        {gridLines.map((grid) => (
          <g key={grid.value}>
            <line
              x1={padX}
              x2={width - padX}
              y1={grid.y}
              y2={grid.y}
              className="stroke-border"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <text
              x={padX}
              y={grid.y - 4}
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {grid.value} GW
            </text>
          </g>
        ))}

        {bandPoints && (
          <polygon points={bandPoints} className="fill-primary/10" />
        )}

        {dividerX !== null && (
          <g>
            <line
              x1={dividerX}
              x2={dividerX}
              y1={padTop - 6}
              y2={height - padBottom}
              className="stroke-accent"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={dividerX + 6}
              y={padTop + 2}
              className="fill-accent font-mono text-[9px] font-semibold uppercase tracking-[0.12em]"
            >
              Forecast
            </text>
          </g>
        )}

        <polyline
          points={line(historical)}
          fill="none"
          className="stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={line(forecast)}
          fill="none"
          className="stroke-primary"
          strokeWidth="2.5"
          strokeDasharray="6 5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {data.map((point) => (
          <circle
            key={`${point.label}-${point.demand}`}
            cx={xAt(data.indexOf(point))}
            cy={yAt(point.demand)}
            r="3"
            className={
              point.forecast ? "fill-card stroke-primary" : "fill-primary"
            }
            strokeWidth="2"
          />
        ))}

        {data.map((point, index) =>
          index % 2 === 0 ? (
            <text
              key={`label-${point.label}-${index}`}
              x={xAt(index)}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {point.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

function MiniTrend({
  series,
  tone,
}: {
  series: number[];
  tone: "accent" | "primary";
}) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 34 - ((value - min) / range) * 30;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      className="h-16 w-full"
      aria-hidden="true"
    >
      <polygon
        points={`0,36 ${points} 100,36`}
        className={tone === "accent" ? "fill-accent/10" : "fill-primary/10"}
      />
      <polyline
        points={points}
        fill="none"
        className={tone === "accent" ? "stroke-accent" : "stroke-primary"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function EnergyPage() {
  const [range, setRange] = useState("24h");
  const [region, setRegion] = useState("All India");
  const [dateRange, setDateRange] = useState("Last 24 hours");
  const [horizon, setHorizon] = useState("Next 24 hours");

  const demandData = RANGE_SERIES[range] ?? DEMAND_24H;

  return (
    <PageFrame>
      {/* Editorial header */}
      <header className="border-b border-border pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Energy Intelligence
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              India&rsquo;s energy landscape.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Explore energy-market indicators, demand trends, renewable
              generation, and forecasts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="success">
              <span className="mr-1 inline-block size-1.5 rounded-full bg-success align-middle" />
              Data sources online
            </StatusBadge>
            <span className="font-mono text-xs text-muted-foreground">
              Last updated 12 Nov 2026 · 06:00 IST
            </span>
          </div>
        </div>

        {/* Selector bar */}
        <div className="mt-8 grid gap-4 rounded-[18px] border border-border bg-card p-4 shadow-subtle sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              State / Region
            </span>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger
                aria-label="State or region"
                data-ocid="energy.region_select"
                className="w-full rounded-lg border-input bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Date range
            </span>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger
                aria-label="Date range"
                data-ocid="energy.date_range_select"
                className="w-full rounded-lg border-input bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Forecast horizon
            </span>
            <Select value={horizon} onValueChange={setHorizon}>
              <SelectTrigger
                aria-label="Forecast horizon"
                data-ocid="energy.horizon_select"
                className="w-full rounded-lg border-input bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HORIZON_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Data source status
            </span>
            <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3">
              <Radio className="size-4 text-success" aria-hidden="true" />
              <span className="text-sm text-foreground">
                Grid-India · CEA · MNRE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Summary metric cards */}
      <section className="mt-10" aria-labelledby="energy-summary">
        <div className="flex items-center justify-between">
          <h2
            id="energy-summary"
            className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            National summary
          </h2>
          <SampleTag />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {SUMMARY_METRICS.map((metric) => (
            <Card
              key={metric.id}
              data-ocid={`energy.metric_card.${metric.id}`}
              className="rounded-[18px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">
                {metric.value}
                <span className="ml-1.5 text-base font-normal text-muted-foreground">
                  {metric.unit}
                </span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <TrendPill trend={metric.trend} label={metric.trendLabel} />
                <span className="text-xs text-muted-foreground">
                  {metric.comparison}
                </span>
              </div>
              <div className="mt-4">
                <Sparkline series={metric.series} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Generation mix + demand chart */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <ChartContainer
          title="Generation mix"
          description="Share of national generation by source"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <DonutChart slices={GENERATION_MIX} />
            <ul className="w-full space-y-2.5">
              {GENERATION_MIX.map((slice) => (
                <li
                  key={slice.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden="true"
                    />
                    {slice.label}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {slice.share}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              Total generation
            </span>
            <span className="font-mono text-lg font-semibold text-foreground">
              {TOTAL_GENERATION}
            </span>
          </div>
        </ChartContainer>

        <ChartContainer
          title="Energy demand"
          description="Historical demand and forecasted demand with confidence range"
          action={
            <div className="flex items-center gap-1.5">
              {RANGE_OPTIONS.map((option) => (
                <FilterChip
                  key={option.id}
                  label={option.label}
                  active={range === option.id}
                  onClick={() => setRange(option.id)}
                  className="px-3 py-1 text-xs"
                />
              ))}
            </div>
          }
        >
          <DemandChart data={demandData} />
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span
                className="h-0.5 w-6 rounded-full bg-primary"
                aria-hidden="true"
              />
              Historical demand
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-0.5 w-6 rounded-full border-t-2 border-dashed border-primary"
                aria-hidden="true"
              />
              Forecasted demand
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-6 rounded-sm bg-primary/10"
                aria-hidden="true"
              />
              Forecast confidence range
            </span>
          </div>
        </ChartContainer>
      </section>

      {/* Renewable energy section */}
      <section className="mt-10" aria-labelledby="energy-renewable">
        <SectionHeading
          eyebrow="Renewable energy"
          title="Solar and wind generation"
          description="Trends, renewable share and state-level comparison across the grid."
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sun className="size-4 text-accent" aria-hidden="true" />
                Solar generation trend
              </span>
              <SampleTag />
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold text-foreground">
              42,180
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                MW
              </span>
            </p>
            <div className="mt-3">
              <MiniTrend series={SOLAR_TREND} tone="accent" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Peak 52,400 MW at 12:00 IST
            </p>
          </Card>

          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Wind className="size-4 text-primary" aria-hidden="true" />
                Wind generation trend
              </span>
              <SampleTag />
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold text-foreground">
              26,870
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                MW
              </span>
            </p>
            <div className="mt-3">
              <MiniTrend series={WIND_TREND} tone="primary" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Peak 37,100 MW at 15:00 IST
            </p>
          </Card>

          <Card className="flex flex-col justify-between rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Gauge className="size-4 text-success" aria-hidden="true" />
                Renewable share
              </span>
              <SampleTag />
            </div>
            <p className="mt-4 font-mono text-4xl font-semibold text-foreground">
              34.8
              <span className="ml-1 text-lg font-normal text-muted-foreground">
                %
              </span>
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: "34.8%" }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Of total generation today · target 50% by 2030
            </p>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <ChartContainer
            title="State-level renewable capacity"
            description="Installed renewable capacity by leading state"
          >
            <ul className="space-y-4">
              {STATE_ROWS.map((row) => (
                <li key={row.state} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {row.state}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {row.capacity}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-primary"
                      style={{ width: `${row.capacityValue}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </ChartContainer>

          <Card className="rounded-[18px] border-border bg-secondary/40 p-6 shadow-subtle">
            <div className="flex items-center gap-2 text-primary">
              <Info className="size-4" aria-hidden="true" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                About this data
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
              Reading renewable indicators
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Installed capacity is measured in megawatts (MW) and gigawatts
              (GW) of power, while generation is energy delivered over time.
              Renewable share reflects the proportion of total generation from
              solar, wind, hydro and other non-fossil sources.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <SourceBadge>Grid-India NLDC</SourceBadge>
              <SourceBadge>CEA Daily Report</SourceBadge>
            </div>
          </Card>
        </div>
      </section>

      {/* State comparison + forecast detail */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartContainer
          title="State comparison"
          description="Renewable capacity, generation and forecast demand by state"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    State
                  </th>
                  <th className="pb-3 pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Renewable capacity
                  </th>
                  <th className="pb-3 pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Renewable generation
                  </th>
                  <th className="pb-3 pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Forecast demand
                  </th>
                  <th className="pb-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Data status
                  </th>
                </tr>
              </thead>
              <tbody>
                {STATE_ROWS.map((row, index) => (
                  <tr
                    key={row.state}
                    data-ocid={`energy.state_row.${index + 1}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.state}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-foreground">
                      {row.capacity}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-foreground">
                      {row.generation}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-foreground">
                      {row.forecast}
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge tone={row.statusTone}>
                        {row.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>

        <Card className="flex flex-col rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <Compass className="size-4" aria-hidden="true" />
              Featured forecast
            </span>
            <SampleTag />
          </div>
          <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">
            National demand outlook
          </h3>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Forecast location</dt>
              <dd className="font-medium text-foreground">All India</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Forecast type</dt>
              <dd className="font-medium text-foreground">Day-ahead demand</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Time horizon</dt>
              <dd className="font-medium text-foreground">{horizon}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Expected range</dt>
              <dd className="font-mono font-medium text-foreground">
                196,000 – 231,000 MW
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Last updated</dt>
              <dd className="font-mono font-medium text-foreground">
                12 Nov 2026
              </dd>
            </div>
          </dl>

          <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Historical trend
            </p>
            <div className="mt-2">
              <MiniTrend
                series={[188, 194, 201, 197, 203, 208, 199, 205]}
                tone="primary"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <SourceBadge>Grid-India NLDC</SourceBadge>
            <SourceBadge>Model v2.4</SourceBadge>
          </div>

          <Button
            type="button"
            data-ocid="energy.explore_forecast_button"
            className="mt-6 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CalendarRange className="size-4" aria-hidden="true" />
            Explore Forecast
          </Button>
        </Card>
      </section>
    </PageFrame>
  );
}
