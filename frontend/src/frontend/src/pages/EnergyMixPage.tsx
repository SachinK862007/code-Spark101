import {
  ChartContainer,
  FilterChip,
  SampleTag,
  SectionHeading,
  SourceBadge,
  StatusBadge,
} from "@/components/shared";
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
  Activity,
  CalendarRange,
  Database,
  Factory,
  Gauge,
  Info,
  Leaf,
  MapPin,
  Radio,
  Sun,
  Wind,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Illustrative sample data — static, never fetched or computed        */
/* ------------------------------------------------------------------ */

type MetricMode = "capacity" | "generation";

interface SourceDef {
  id: string;
  label: string;
  color: string;
  /** installed capacity in GW for the reference year */
  capacity: number;
  /** annual generation in TWh for the reference year */
  generation: number;
  renewable: boolean;
}

const SOURCES: SourceDef[] = [
  {
    id: "coal",
    label: "Coal",
    color: "var(--chart-5)",
    capacity: 217.6,
    generation: 1180,
    renewable: false,
  },
  {
    id: "solar",
    label: "Solar",
    color: "var(--chart-2)",
    capacity: 78.4,
    generation: 118,
    renewable: true,
  },
  {
    id: "wind",
    label: "Wind",
    color: "var(--chart-4)",
    capacity: 46.2,
    generation: 82,
    renewable: true,
  },
  {
    id: "hydro",
    label: "Hydro",
    color: "var(--chart-3)",
    capacity: 46.9,
    generation: 148,
    renewable: true,
  },
  {
    id: "nuclear",
    label: "Nuclear",
    color: "var(--chart-1)",
    capacity: 8.2,
    generation: 48,
    renewable: false,
  },
  {
    id: "gas",
    label: "Gas & other",
    color: "var(--chart-5)",
    capacity: 25.3,
    generation: 62,
    renewable: false,
  },
];

const YEARS = [
  "FY 2020-21",
  "FY 2021-22",
  "FY 2022-23",
  "FY 2023-24",
  "FY 2024-25",
];

/** Per-year scaling so the year filter visibly changes every figure. */
const YEAR_FACTOR: Record<string, number> = {
  "FY 2020-21": 0.78,
  "FY 2021-22": 0.84,
  "FY 2022-23": 0.9,
  "FY 2023-24": 0.95,
  "FY 2024-25": 1,
};

const STATE_OPTIONS = [
  "All India",
  "Rajasthan",
  "Gujarat",
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Andhra Pradesh",
  "Uttar Pradesh",
];

/** Per-state scaling of the national mix (illustrative). */
const STATE_FACTOR: Record<string, number> = {
  "All India": 1,
  Rajasthan: 0.14,
  Gujarat: 0.13,
  "Tamil Nadu": 0.12,
  Karnataka: 0.1,
  Maharashtra: 0.09,
  "Andhra Pradesh": 0.07,
  "Uttar Pradesh": 0.06,
};

interface TrendPoint {
  year: string;
  coal: number;
  solar: number;
  wind: number;
  hydro: number;
  nuclear: number;
  gas: number;
}

/** Annual generation by source, TWh — stacked area source series. */
const GENERATION_TREND: TrendPoint[] = [
  {
    year: "2018",
    coal: 1020,
    solar: 36,
    wind: 60,
    hydro: 135,
    nuclear: 38,
    gas: 50,
  },
  {
    year: "2019",
    coal: 1040,
    solar: 50,
    wind: 62,
    hydro: 155,
    nuclear: 42,
    gas: 52,
  },
  {
    year: "2020",
    coal: 1010,
    solar: 62,
    wind: 64,
    hydro: 150,
    nuclear: 44,
    gas: 48,
  },
  {
    year: "2021",
    coal: 1080,
    solar: 74,
    wind: 68,
    hydro: 160,
    nuclear: 46,
    gas: 54,
  },
  {
    year: "2022",
    coal: 1120,
    solar: 92,
    wind: 72,
    hydro: 158,
    nuclear: 46,
    gas: 56,
  },
  {
    year: "2023",
    coal: 1160,
    solar: 108,
    wind: 78,
    hydro: 152,
    nuclear: 47,
    gas: 60,
  },
  {
    year: "2024",
    coal: 1180,
    solar: 118,
    wind: 82,
    hydro: 148,
    nuclear: 48,
    gas: 62,
  },
];

interface StateIndicator {
  state: string;
  capacity: string;
  share: string;
  trend: "up" | "down" | "flat";
  /** marker position on the stylised map, percentages */
  x: number;
  y: number;
}

const STATE_INDICATORS: StateIndicator[] = [
  {
    state: "Rajasthan",
    capacity: "28.4 GW",
    share: "49.8%",
    trend: "up",
    x: 24,
    y: 40,
  },
  {
    state: "Gujarat",
    capacity: "26.1 GW",
    share: "44.1%",
    trend: "up",
    x: 18,
    y: 52,
  },
  {
    state: "Tamil Nadu",
    capacity: "22.7 GW",
    share: "51.6%",
    trend: "flat",
    x: 46,
    y: 86,
  },
  {
    state: "Karnataka",
    capacity: "19.3 GW",
    share: "47.3%",
    trend: "up",
    x: 42,
    y: 76,
  },
  {
    state: "Maharashtra",
    capacity: "16.8 GW",
    share: "38.2%",
    trend: "up",
    x: 28,
    y: 62,
  },
  {
    state: "Andhra Pradesh",
    capacity: "13.2 GW",
    share: "42.7%",
    trend: "down",
    x: 50,
    y: 72,
  },
  {
    state: "Uttar Pradesh",
    capacity: "9.8 GW",
    share: "31.4%",
    trend: "up",
    x: 40,
    y: 34,
  },
];

const DATASET_META = {
  capacity: {
    organisation: "CEA",
    unit: "MW / GW",
    period: "Data as of Oct 2026",
    updated: "12 Nov 2026 · 06:00 IST",
    quality: "Provisional",
    qualityTone: "warning" as const,
  },
  generation: {
    organisation: "GRID-INDIA / POSOCO",
    unit: "MWh / GWh / BU",
    period: "Data as of Oct 2026",
    updated: "12 Nov 2026 · 05:30 IST",
    quality: "Verified",
    qualityTone: "success" as const,
  },
};

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

function formatCapacity(gw: number): string {
  if (gw >= 100) return `${gw.toFixed(1)} GW`;
  return `${(gw * 1000).toFixed(0)} MW`;
}

function formatGeneration(twh: number): string {
  // 1 TWh = 1000 GWh = 1 BU (billion units)
  if (twh >= 100) return `${twh.toFixed(0)} BU`;
  return `${(twh * 1000).toFixed(0)} GWh`;
}

/* ------------------------------------------------------------------ */
/* Energy-mix donut                                                    */
/* ------------------------------------------------------------------ */

function MixDonut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: { id: string; label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative size-44 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img">
          <title>Energy mix by source</title>
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
              {((slice.value / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stacked area generation trend                                       */
/* ------------------------------------------------------------------ */

const TREND_SERIES: {
  key: keyof Omit<TrendPoint, "year">;
  label: string;
  color: string;
}[] = [
  { key: "coal", label: "Coal", color: "var(--chart-5)" },
  { key: "solar", label: "Solar", color: "var(--chart-2)" },
  { key: "wind", label: "Wind", color: "var(--chart-4)" },
  { key: "hydro", label: "Hydro", color: "var(--chart-3)" },
  { key: "nuclear", label: "Nuclear", color: "var(--chart-1)" },
  { key: "gas", label: "Gas & other", color: "var(--chart-5)" },
];

function StackedAreaChart({ data }: { data: TrendPoint[] }) {
  const width = 720;
  const height = 260;
  const padX = 34;
  const padTop = 16;
  const padBottom = 28;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;

  const totals = data.map((point) =>
    TREND_SERIES.reduce((sum, series) => sum + point[series.key], 0),
  );
  const max = Math.max(...totals) * 1.05;
  const xAt = (index: number) => padX + (index / (data.length - 1)) * plotW;
  const yAt = (value: number) => padTop + (1 - value / max) * plotH;

  // Build cumulative stacked bands from the bottom up.
  const bands: { key: string; color: string; points: string }[] = [];
  const cumulative = data.map(() => 0);
  for (const series of TREND_SERIES) {
    const top = data.map((point, index) => {
      cumulative[index] += point[series.key];
      return cumulative[index];
    });
    const upper = top.map((value, index) => `${xAt(index)},${yAt(value)}`);
    const lower = data
      .map((_, index) => {
        const below = top[index] - data[index][series.key];
        return `${xAt(index)},${yAt(below)}`;
      })
      .reverse();
    bands.push({
      key: series.key,
      color: series.color,
      points: [...upper, ...lower].join(" "),
    });
  }

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 w-full"
        preserveAspectRatio="none"
        role="img"
      >
        <title>Annual generation by source, stacked</title>
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const value = max * step;
          return (
            <g key={step}>
              <line
                x1={padX}
                x2={width - padX}
                y1={yAt(value)}
                y2={yAt(value)}
                className="stroke-border"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <text
                x={padX - 6}
                y={yAt(value) + 3}
                textAnchor="end"
                className="fill-muted-foreground font-mono text-[9px]"
              >
                {Math.round(value)}
              </text>
            </g>
          );
        })}
        {bands.map((band) => (
          <polygon
            key={band.key}
            points={band.points}
            fill={band.color}
            opacity="0.85"
          />
        ))}
        {data.map((point, index) => (
          <text
            key={point.year}
            x={xAt(index)}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[9px]"
          >
            {point.year}
          </text>
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {TREND_SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-2">
            <span
              className="size-2.5 rounded-sm"
              style={{ backgroundColor: series.color }}
              aria-hidden="true"
            />
            {series.label}
          </span>
        ))}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em]">
          TWh per year
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Installed-capacity bar chart                                        */
/* ------------------------------------------------------------------ */

function CapacityBars({
  rows,
  max,
}: {
  rows: { id: string; label: string; value: number; color: string }[];
  max: number;
}) {
  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <li key={row.id} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <span
                className="size-2.5 rounded-sm"
                style={{ backgroundColor: row.color }}
                aria-hidden="true"
              />
              {row.label}
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              {formatCapacity(row.value)}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-smooth"
              style={{
                width: `${(row.value / max) * 100}%`,
                backgroundColor: row.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Coal vs renewables comparison                                       */
/* ------------------------------------------------------------------ */

function CoalVsRenewables({
  coalShare,
  renewableShare,
}: {
  coalShare: number;
  renewableShare: number;
}) {
  const rows = [
    { id: "coal", label: "Coal", value: coalShare, color: "var(--chart-5)" },
    {
      id: "renewable",
      label: "Renewables",
      value: renewableShare,
      color: "var(--chart-3)",
    },
  ];
  return (
    <div className="space-y-5">
      {rows.map((row) => (
        <div key={row.id} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{row.label}</span>
            <span className="font-mono text-lg font-semibold text-foreground">
              {row.value.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-smooth"
              style={{ width: `${row.value}%`, backgroundColor: row.color }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs leading-relaxed text-muted-foreground">
        Coal still leads the mix, but renewables have closed the gap by more
        than twelve percentage points since FY 2020-21.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* India map with state-wise renewable indicators                      */
/* ------------------------------------------------------------------ */

function IndiaRenewableMap({
  indicators,
  selectedState,
  onSelect,
}: {
  indicators: StateIndicator[];
  selectedState: string;
  onSelect: (state: string) => void;
}) {
  return (
    <div
      data-ocid="energy_mix.map"
      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-[oklch(0.97_0.012_95)]"
      aria-label="Illustrative map of India showing state-wise renewable indicators"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <title>Illustrative map base</title>
        <defs>
          <pattern
            id="mix-grid"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 6 0 L 0 0 0 6"
              fill="none"
              className="stroke-border"
              strokeWidth="0.15"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#mix-grid)" />
        <path
          d="M30 8 L46 6 L58 12 L70 14 L78 24 L74 34 L80 44 L72 54 L66 66 L58 78 L50 90 L44 96 L40 88 L34 78 L28 66 L22 56 L16 46 L20 34 L24 22 Z"
          className="fill-[oklch(0.945_0.02_120)] stroke-[oklch(0.86_0.03_120)]"
          strokeWidth="0.4"
        />
        <g
          className="stroke-[oklch(0.82_0.03_120)]"
          strokeWidth="0.25"
          fill="none"
          strokeDasharray="1.4 1"
        >
          <path d="M24 22 L40 26 L52 22 L70 14" />
          <path d="M20 34 L38 38 L56 34 L74 34" />
          <path d="M16 46 L34 50 L52 46 L80 44" />
          <path d="M22 56 L40 60 L58 56 L72 54" />
          <path d="M28 66 L44 70 L60 66 L66 66" />
          <path d="M34 78 L46 82 L58 78" />
          <path d="M40 26 L38 38 L34 50 L40 60 L44 70 L46 82" />
          <path d="M52 22 L56 34 L52 46 L58 56 L60 66 L58 78" />
        </g>
      </svg>

      {indicators.map((indicator) => {
        const selected = indicator.state === selectedState;
        return (
          <button
            key={indicator.state}
            type="button"
            data-ocid={`energy_mix.map_marker.${indicator.state
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")}`}
            onClick={() => onSelect(indicator.state)}
            aria-pressed={selected}
            aria-label={`${indicator.state}, renewable share ${indicator.share}`}
            style={{ left: `${indicator.x}%`, top: `${indicator.y}%` }}
            className={cn(
              "group absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected ? "z-20 scale-110" : "z-10 hover:scale-105",
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-full border-2 border-card shadow-elevated transition-smooth",
                indicator.trend === "down"
                  ? "bg-warning text-warning-foreground"
                  : "bg-success text-success-foreground",
                selected ? "size-9" : "size-7",
              )}
            >
              <Leaf
                className={selected ? "size-4" : "size-3.5"}
                aria-hidden="true"
              />
            </span>
            <span
              className={cn(
                "pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[10px] font-medium text-foreground shadow-subtle transition-smooth",
                selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            >
              {indicator.state} · {indicator.share}
            </span>
          </button>
        );
      })}

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-border bg-card/95 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-subtle backdrop-blur-sm">
        Renewable share of capacity
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dataset provenance strip                                            */
/* ------------------------------------------------------------------ */

function DatasetMeta({
  meta,
  ocid,
}: {
  meta: (typeof DATASET_META)[MetricMode];
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground"
    >
      <span className="inline-flex items-center gap-1.5">
        <Database className="size-3.5 text-primary" aria-hidden="true" />
        Source:{" "}
        <span className="font-medium text-foreground">{meta.organisation}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarRange className="size-3.5" aria-hidden="true" />
        {meta.period}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Gauge className="size-3.5" aria-hidden="true" />
        Unit: <span className="font-mono text-foreground">{meta.unit}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Radio className="size-3.5 text-success" aria-hidden="true" />
        Updated {meta.updated}
      </span>
      <StatusBadge tone={meta.qualityTone} className="ml-auto">
        {meta.quality}
      </StatusBadge>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function EnergyMixPage() {
  const [state, setState] = useState("All India");
  const [year, setYear] = useState("FY 2024-25");
  const [source, setSource] = useState("all");
  const [mode, setMode] = useState<MetricMode>("capacity");

  const yearFactor = YEAR_FACTOR[year] ?? 1;
  const stateFactor = STATE_FACTOR[state] ?? 1;
  const scale = yearFactor * stateFactor;

  const visibleSources = useMemo(
    () => (source === "all" ? SOURCES : SOURCES.filter((s) => s.id === source)),
    [source],
  );

  const mixSlices = useMemo(
    () =>
      visibleSources.map((s) => ({
        id: s.id,
        label: s.label,
        value: (mode === "capacity" ? s.capacity : s.generation) * scale,
        color: s.color,
      })),
    [visibleSources, mode, scale],
  );

  const mixTotal = mixSlices.reduce((sum, slice) => sum + slice.value, 0);

  const capacityRows = useMemo(
    () =>
      visibleSources
        .map((s) => ({
          id: s.id,
          label: s.label,
          value: s.capacity * scale,
          color: s.color,
        }))
        .sort((a, b) => b.value - a.value),
    [visibleSources, scale],
  );
  const capacityMax = Math.max(...capacityRows.map((row) => row.value), 1);

  const trendData = useMemo(
    () =>
      GENERATION_TREND.map((point) => ({
        ...point,
        coal: point.coal * yearFactor * stateFactor,
        solar: point.solar * yearFactor * stateFactor,
        wind: point.wind * yearFactor * stateFactor,
        hydro: point.hydro * yearFactor * stateFactor,
        nuclear: point.nuclear * yearFactor * stateFactor,
        gas: point.gas * yearFactor * stateFactor,
      })),
    [yearFactor, stateFactor],
  );

  const coalShare = useMemo(() => {
    const coal = SOURCES.find((s) => s.id === "coal");
    if (!coal) return 0;
    const total = SOURCES.reduce(
      (sum, s) => sum + (mode === "capacity" ? s.capacity : s.generation),
      0,
    );
    return (
      ((mode === "capacity" ? coal.capacity : coal.generation) / total) * 100
    );
  }, [mode]);

  const renewableShare = useMemo(() => {
    const total = SOURCES.reduce(
      (sum, s) => sum + (mode === "capacity" ? s.capacity : s.generation),
      0,
    );
    const renewable = SOURCES.filter((s) => s.renewable).reduce(
      (sum, s) => sum + (mode === "capacity" ? s.capacity : s.generation),
      0,
    );
    return (renewable / total) * 100;
  }, [mode]);

  const meta = DATASET_META[mode];
  const modeUnit = mode === "capacity" ? "GW" : "BU";

  return (
    <div
      data-ocid="energy_mix.page"
      className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10"
    >
      {/* Editorial header */}
      <header className="border-b border-border pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Energy Intelligence · D1
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Energy mix dashboard.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Installed capacity and actual generation by source, coal versus
              renewables, and state-wise renewable indicators.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <SampleTag />
              <StatusBadge tone="neutral">{meta.period}</StatusBadge>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Source: CEA · GRID-INDIA / POSOCO
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="success">
              <span className="mr-1 inline-block size-1.5 rounded-full bg-success align-middle" />
              Data sources online
            </StatusBadge>
            <span className="font-mono text-xs text-muted-foreground">
              Last updated {meta.updated}
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-8 grid gap-4 rounded-[18px] border border-border bg-card p-4 shadow-subtle sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              State / Region
            </span>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger
                aria-label="State or region"
                data-ocid="energy_mix.state_select"
                className="w-full rounded-lg border-input bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Year
            </span>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger
                aria-label="Financial year"
                data-ocid="energy_mix.year_select"
                className="w-full rounded-lg border-input bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Energy source
            </span>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger
                aria-label="Energy source"
                data-ocid="energy_mix.source_select"
                className="w-full rounded-lg border-input bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {SOURCES.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Metric
            </legend>
            <div className="flex h-9 items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
              <FilterChip
                label="Installed capacity"
                active={mode === "capacity"}
                onClick={() => setMode("capacity")}
                className="flex-1 px-2 py-1 text-xs"
              />
              <FilterChip
                label="Generation"
                active={mode === "generation"}
                onClick={() => setMode("generation")}
                className="flex-1 px-2 py-1 text-xs"
              />
            </div>
          </fieldset>
        </div>
      </header>

      {/* Summary strip */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          data-ocid="energy_mix.summary_card.1"
          className="rounded-[18px] border-border bg-card p-5 shadow-subtle"
        >
          <p className="text-sm font-medium text-muted-foreground">
            {mode === "capacity"
              ? "Total installed capacity"
              : "Total generation"}
          </p>
          <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">
            {mode === "capacity"
              ? formatCapacity(mixTotal)
              : formatGeneration(mixTotal)}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {state} · {year}
          </p>
        </Card>
        <Card
          data-ocid="energy_mix.summary_card.2"
          className="rounded-[18px] border-border bg-card p-5 shadow-subtle"
        >
          <p className="text-sm font-medium text-muted-foreground">
            Renewable share
          </p>
          <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-success">
            {renewableShare.toFixed(1)}
            <span className="ml-1 text-base font-normal text-muted-foreground">
              %
            </span>
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Of {mode === "capacity" ? "capacity" : "generation"}
          </p>
        </Card>
        <Card
          data-ocid="energy_mix.summary_card.3"
          className="rounded-[18px] border-border bg-card p-5 shadow-subtle"
        >
          <p className="text-sm font-medium text-muted-foreground">
            Coal share
          </p>
          <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">
            {coalShare.toFixed(1)}
            <span className="ml-1 text-base font-normal text-muted-foreground">
              %
            </span>
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Of {mode === "capacity" ? "capacity" : "generation"}
          </p>
        </Card>
        <Card
          data-ocid="energy_mix.summary_card.4"
          className="rounded-[18px] border-border bg-card p-5 shadow-subtle"
        >
          <p className="text-sm font-medium text-muted-foreground">
            Reporting period
          </p>
          <p className="mt-3 font-mono text-lg font-semibold tracking-tight text-foreground">
            {meta.period}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {meta.organisation}
          </p>
        </Card>
      </section>

      {/* Mix donut + capacity bars */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <ChartContainer
          title={
            mode === "capacity" ? "Installed capacity mix" : "Generation mix"
          }
          description={`Share by source · ${state} · ${year}`}
        >
          <MixDonut
            slices={mixSlices}
            centerLabel={mode === "capacity" ? "Total GW" : "Total BU"}
            centerValue={
              mode === "capacity"
                ? (mixTotal / 1000).toFixed(1)
                : mixTotal.toFixed(0)
            }
          />
          <DatasetMeta meta={meta} ocid="energy_mix.mix_meta" />
        </ChartContainer>

        <ChartContainer
          title="Installed capacity by source"
          description={`Ranked capacity · ${state} · ${year}`}
        >
          <CapacityBars rows={capacityRows} max={capacityMax} />
          <DatasetMeta
            meta={DATASET_META.capacity}
            ocid="energy_mix.capacity_meta"
          />
        </ChartContainer>
      </section>

      {/* Stacked area generation trend */}
      <section className="mt-10">
        <ChartContainer
          title="Generation trend by source"
          description={`Annual generation, stacked by source · ${state}`}
        >
          <StackedAreaChart data={trendData} />
          <DatasetMeta
            meta={DATASET_META.generation}
            ocid="energy_mix.trend_meta"
          />
        </ChartContainer>
      </section>

      {/* Coal vs renewables + map */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ChartContainer
          title="Coal vs. renewables"
          description={`Share of ${mode === "capacity" ? "installed capacity" : "generation"} · ${state} · ${year}`}
        >
          <CoalVsRenewables
            coalShare={coalShare}
            renewableShare={renewableShare}
          />
          <DatasetMeta meta={meta} ocid="energy_mix.comparison_meta" />
        </ChartContainer>

        <ChartContainer
          title="State-wise renewable indicators"
          description="Renewable share of installed capacity by leading state"
        >
          <IndiaRenewableMap
            indicators={STATE_INDICATORS}
            selectedState={state}
            onSelect={setState}
          />
          <DatasetMeta
            meta={DATASET_META.capacity}
            ocid="energy_mix.map_meta"
          />
        </ChartContainer>
      </section>

      {/* State comparison table */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="State comparison"
          title="Renewable capacity by state"
          description="Installed renewable capacity and share across leading states."
          action={<SampleTag />}
        />
        <Card className="mt-6 overflow-hidden rounded-[18px] border-border bg-card shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    State
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Renewable capacity
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Share of capacity
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {STATE_INDICATORS.map((row, index) => (
                  <tr
                    key={row.state}
                    data-ocid={`energy_mix.state_row.${index + 1}`}
                    className={cn(
                      "border-b border-border/60 transition-smooth last:border-0 hover:bg-muted/40",
                      row.state === state && "bg-secondary/40",
                    )}
                  >
                    <td className="px-6 py-3.5 font-medium text-foreground">
                      <span className="inline-flex items-center gap-2">
                        <MapPin
                          className="size-3.5 text-primary"
                          aria-hidden="true"
                        />
                        {row.state}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-foreground">
                      {row.capacity}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-foreground">
                      {row.share}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <StatusBadge
                        tone={
                          row.trend === "up"
                            ? "success"
                            : row.trend === "down"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {row.trend === "up"
                          ? "Rising"
                          : row.trend === "down"
                            ? "Falling"
                            : "Stable"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Unit note */}
      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="rounded-[18px] border-border bg-secondary/40 p-6 shadow-subtle lg:col-span-2">
          <div className="flex items-center gap-2 text-primary">
            <Info className="size-4" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
              About this data
            </span>
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
            Capacity is power, generation is energy
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Installed capacity measures the maximum power a plant can produce
            and is reported in megawatts (MW) and gigawatts (GW). Generation
            measures the energy actually delivered over time and is reported in
            megawatt hours (MWh), gigawatt hours (GWh) and billion units (BU).
            The two are never interchangeable, so every figure on this screen is
            labelled with its own unit.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <SourceBadge>CEA Installed Capacity Report</SourceBadge>
            <SourceBadge>GRID-INDIA / POSOCO</SourceBadge>
          </div>
        </Card>

        <Card className="flex flex-col justify-between rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Activity className="size-4 text-primary" aria-hidden="true" />
              Data quality
            </span>
            <SampleTag />
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Capacity dataset</dt>
              <dd>
                <StatusBadge tone="warning">Provisional</StatusBadge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Generation dataset</dt>
              <dd>
                <StatusBadge tone="success">Verified</StatusBadge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Refresh cadence</dt>
              <dd className="font-mono text-foreground">Monthly</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Factory className="size-3.5" aria-hidden="true" />
              {modeUnit} reference unit
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sun className="size-3.5 text-accent" aria-hidden="true" />
              <Wind className="size-3.5 text-primary" aria-hidden="true" />
              Solar &amp; wind tracked
            </span>
          </div>
        </Card>
      </section>

      <p className="mt-10 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Illustrative prototype · All figures are sample data · {meta.period}
      </p>
    </div>
  );
}
