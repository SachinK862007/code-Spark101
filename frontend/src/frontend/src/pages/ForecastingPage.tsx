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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BatteryCharging,
  CloudSun,
  Compass,
  Download,
  Droplets,
  Gauge,
  Info,
  MapPin,
  RefreshCw,
  Save,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Illustrative sample data — static, never fetched or computed        */
/* ------------------------------------------------------------------ */

const STATE_OPTIONS = [
  "Rajasthan",
  "Gujarat",
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Andhra Pradesh",
];

const CITY_OPTIONS: Record<string, string[]> = {
  Rajasthan: ["Jodhpur", "Jaisalmer", "Bhadla", "Barmer"],
  Gujarat: ["Kutch", "Bhavnagar", "Rajkot", "Surendranagar"],
  "Tamil Nadu": ["Tirunelveli", "Coimbatore", "Thoothukudi", "Salem"],
  Karnataka: ["Bellary", "Chitradurga", "Gadag", "Raichur"],
  Maharashtra: ["Solapur", "Ahmednagar", "Nashik", "Satara"],
  "Andhra Pradesh": ["Kurnool", "Anantapur", "Kadapa", "Nellore"],
};

const TECHNOLOGY_OPTIONS = [
  { id: "solar", label: "Solar" },
  { id: "wind", label: "Wind" },
  { id: "hybrid", label: "Hybrid" },
];

const HORIZON_OPTIONS = [
  { id: "24h", label: "24 Hours" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
];

interface WeatherMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: "temp" | "irradiance" | "wind" | "cloud";
  series: number[];
}

const WEATHER_METRICS: WeatherMetric[] = [
  {
    id: "temperature",
    label: "Temperature",
    value: "34.2",
    unit: "°C",
    icon: "temp",
    series: [26, 28, 31, 34, 36, 35, 32, 29],
  },
  {
    id: "irradiance",
    label: "Solar Irradiance",
    value: "842",
    unit: "W/m²",
    icon: "irradiance",
    series: [120, 340, 610, 790, 842, 760, 520, 210],
  },
  {
    id: "wind-speed",
    label: "Wind Speed",
    value: "7.4",
    unit: "m/s",
    icon: "wind",
    series: [5.1, 6.2, 7.8, 8.4, 7.4, 6.9, 6.1, 5.6],
  },
  {
    id: "cloud-cover",
    label: "Cloud Cover",
    value: "18",
    unit: "%",
    icon: "cloud",
    series: [42, 36, 24, 14, 18, 22, 30, 38],
  },
];

interface OutputPoint {
  label: string;
  solar: number;
  wind: number;
  low: number;
  high: number;
  forecast: boolean;
}

const OUTPUT_24H: OutputPoint[] = [
  { label: "00:00", solar: 0, wind: 42, low: 38, high: 46, forecast: false },
  { label: "03:00", solar: 0, wind: 48, low: 43, high: 53, forecast: false },
  { label: "06:00", solar: 34, wind: 52, low: 46, high: 58, forecast: false },
  { label: "09:00", solar: 128, wind: 46, low: 41, high: 51, forecast: false },
  { label: "12:00", solar: 186, wind: 38, low: 34, high: 42, forecast: false },
  { label: "15:00", solar: 164, wind: 44, low: 39, high: 49, forecast: true },
  { label: "18:00", solar: 72, wind: 58, low: 51, high: 65, forecast: true },
  { label: "21:00", solar: 8, wind: 64, low: 56, high: 72, forecast: true },
];

const OUTPUT_7D: OutputPoint[] = [
  { label: "Thu", solar: 168, wind: 52, low: 46, high: 58, forecast: false },
  { label: "Fri", solar: 174, wind: 48, low: 42, high: 54, forecast: false },
  { label: "Sat", solar: 152, wind: 61, low: 54, high: 68, forecast: false },
  { label: "Sun", solar: 181, wind: 44, low: 39, high: 49, forecast: false },
  { label: "Mon", solar: 166, wind: 57, low: 50, high: 64, forecast: true },
  { label: "Tue", solar: 158, wind: 63, low: 55, high: 71, forecast: true },
  { label: "Wed", solar: 172, wind: 49, low: 43, high: 55, forecast: true },
];

const OUTPUT_30D: OutputPoint[] = [
  { label: "W1", solar: 164, wind: 51, low: 45, high: 57, forecast: false },
  { label: "W2", solar: 171, wind: 55, low: 48, high: 62, forecast: false },
  { label: "W3", solar: 158, wind: 47, low: 41, high: 53, forecast: false },
  { label: "W4", solar: 176, wind: 59, low: 51, high: 67, forecast: true },
  { label: "W5", solar: 168, wind: 62, low: 53, high: 71, forecast: true },
  { label: "W6", solar: 162, wind: 54, low: 47, high: 61, forecast: true },
];

const OUTPUT_SERIES: Record<string, OutputPoint[]> = {
  "24h": OUTPUT_24H,
  "7d": OUTPUT_7D,
  "30d": OUTPUT_30D,
};

interface ForecastSummary {
  id: string;
  label: string;
  value: string;
  unit: string;
  note: string;
  tone: "primary" | "success" | "warning" | "neutral";
}

const FORECAST_SUMMARY: ForecastSummary[] = [
  {
    id: "solar-generation",
    label: "Estimated Solar Generation",
    value: "1,284",
    unit: "MWh/day",
    note: "Peak 186 MW at 12:00 IST",
    tone: "primary",
  },
  {
    id: "wind-generation",
    label: "Estimated Wind Generation",
    value: "1,046",
    unit: "MWh/day",
    note: "Peak 64 MW at 21:00 IST",
    tone: "primary",
  },
  {
    id: "expected-output",
    label: "Expected Output Trend",
    value: "+6.4",
    unit: "% vs. 7-day avg",
    note: "Rising through the horizon",
    tone: "success",
  },
  {
    id: "uncertainty",
    label: "Forecast Uncertainty Range",
    value: "±11.2",
    unit: "%",
    note: "P90 confidence band",
    tone: "warning",
  },
  {
    id: "shortfall",
    label: "Expected Energy Shortfall",
    value: "312",
    unit: "MWh",
    note: "Evening peak, 18:00–22:00",
    tone: "warning",
  },
  {
    id: "storage-duration",
    label: "Estimated Storage Duration",
    value: "4.6",
    unit: "hours",
    note: "At 60% depth of discharge",
    tone: "neutral",
  },
];

interface BatteryRecommendation {
  id: string;
  label: string;
  value: string;
  unit: string;
  note: string;
}

const BATTERY_RECOMMENDATION: BatteryRecommendation[] = [
  {
    id: "recommended-capacity",
    label: "Recommended Battery Capacity",
    value: "48",
    unit: "MWh",
    note: "Covers evening shortfall with margin",
  },
  {
    id: "power-rating",
    label: "Recommended Power Rating",
    value: "12",
    unit: "MW",
    note: "Discharge over 4-hour window",
  },
  {
    id: "cycles",
    label: "Estimated Daily Cycles",
    value: "1.2",
    unit: "cycles/day",
    note: "One full charge, partial top-up",
  },
  {
    id: "coverage",
    label: "Shortfall Coverage",
    value: "96",
    unit: "%",
    note: "Of modelled evening deficit",
  },
];

interface ComparisonRow {
  id: string;
  technology: string;
  generation: string;
  capacityFactor: string;
  storageNeed: string;
  reliability: "High" | "Moderate" | "Variable";
  tone: "success" | "warning" | "neutral";
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    id: "solar",
    technology: "Solar",
    generation: "1,284 MWh/day",
    capacityFactor: "24.1%",
    storageNeed: "52 MWh",
    reliability: "Moderate",
    tone: "warning",
  },
  {
    id: "wind",
    technology: "Wind",
    generation: "1,046 MWh/day",
    capacityFactor: "31.8%",
    storageNeed: "38 MWh",
    reliability: "Variable",
    tone: "neutral",
  },
  {
    id: "hybrid",
    technology: "Hybrid",
    generation: "2,330 MWh/day",
    capacityFactor: "28.4%",
    storageNeed: "48 MWh",
    reliability: "High",
    tone: "success",
  },
];

interface DeficitPoint {
  label: string;
  deficit: number;
}

const DEFICIT_SERIES: DeficitPoint[] = [
  { label: "00:00", deficit: 12 },
  { label: "03:00", deficit: 8 },
  { label: "06:00", deficit: 4 },
  { label: "09:00", deficit: 0 },
  { label: "12:00", deficit: 0 },
  { label: "15:00", deficit: 6 },
  { label: "18:00", deficit: 42 },
  { label: "21:00", deficit: 58 },
];

const CHARGE_SERIES = [18, 12, 8, 24, 62, 88, 74, 46];
const DISCHARGE_SERIES = [0, 0, 0, 0, 0, 0, 26, 54];

const WEATHER_ICONS = {
  temp: Thermometer,
  irradiance: Sun,
  wind: Wind,
  cloud: CloudSun,
} as const;

/* ------------------------------------------------------------------ */
/* Chart primitives (inline SVG, no runtime dependencies)              */
/* ------------------------------------------------------------------ */

function WeatherSparkline({ series }: { series: number[] }) {
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
      <polygon points={`0,32 ${points} 100,32`} className="fill-accent/10" />
      <polyline
        points={points}
        fill="none"
        className="stroke-accent"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function OutputChart({ data }: { data: OutputPoint[] }) {
  const width = 720;
  const height = 280;
  const padX = 12;
  const padTop = 18;
  const padBottom = 30;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;
  const values = data.flatMap((point) => [
    point.solar,
    point.wind,
    point.low,
    point.high,
  ]);
  const max = Math.max(...values) + 12;
  const min = 0;
  const range = max - min || 1;

  const xAt = (index: number) => padX + (index / (data.length - 1)) * plotW;
  const yAt = (value: number) => padTop + (1 - (value - min) / range) * plotH;

  const firstForecast = data.findIndex((point) => point.forecast);
  const dividerX = firstForecast > 0 ? xAt(firstForecast) : null;

  const solarPoints = data
    .map((point, index) => `${xAt(index)},${yAt(point.solar)}`)
    .join(" ");
  const windPoints = data
    .map((point, index) => `${xAt(index)},${yAt(point.wind)}`)
    .join(" ");

  const bandPoints = data
    .map((point, index) => `${xAt(index)},${yAt(point.high)}`)
    .concat(
      [...data]
        .reverse()
        .map(
          (point, index) => `${xAt(data.length - 1 - index)},${yAt(point.low)}`,
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
        <title>Historical and forecasted solar and wind output</title>
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
              {grid.value} MW
            </text>
          </g>
        ))}

        <polygon points={bandPoints} className="fill-primary/10" />

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
          points={solarPoints}
          fill="none"
          className="stroke-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={windPoints}
          fill="none"
          className="stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {data.map((point, index) => (
          <circle
            key={`solar-${point.label}-${index}`}
            cx={xAt(index)}
            cy={yAt(point.solar)}
            r="3"
            className={
              point.forecast ? "fill-card stroke-accent" : "fill-accent"
            }
            strokeWidth="2"
          />
        ))}
        {data.map((point, index) => (
          <circle
            key={`wind-${point.label}-${index}`}
            cx={xAt(index)}
            cy={yAt(point.wind)}
            r="3"
            className={
              point.forecast ? "fill-card stroke-primary" : "fill-primary"
            }
            strokeWidth="2"
          />
        ))}

        {data.map((point, index) => (
          <text
            key={`label-${point.label}-${index}`}
            x={xAt(index)}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[9px]"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function SolarWindComparison() {
  const rows = [
    { id: "solar", label: "Solar", value: 1284, color: "var(--chart-2)" },
    { id: "wind", label: "Wind", value: 1046, color: "var(--chart-4)" },
  ];
  const max = Math.max(...rows.map((row) => row.value));
  return (
    <div className="space-y-5">
      {rows.map((row) => (
        <div key={row.id} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: row.color }}
                aria-hidden="true"
              />
              {row.label}
            </span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {row.value.toLocaleString("en-IN")} MWh/day
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(row.value / max) * 100}%`,
                backgroundColor: row.color,
              }}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Hybrid combined output
        </span>
        <span className="font-mono text-lg font-semibold text-foreground">
          2,330 MWh/day
        </span>
      </div>
    </div>
  );
}

function WeatherTrendChart() {
  const width = 640;
  const height = 200;
  const padX = 10;
  const padTop = 16;
  const padBottom = 26;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;
  const temp = [26, 28, 31, 34, 36, 35, 32, 29];
  const irradiance = [120, 340, 610, 790, 842, 760, 520, 210];
  const labels = [
    "00:00",
    "03:00",
    "06:00",
    "09:00",
    "12:00",
    "15:00",
    "18:00",
    "21:00",
  ];

  const tempMax = 40;
  const irrMax = 900;
  const xAt = (index: number) => padX + (index / (temp.length - 1)) * plotW;
  const tempY = (value: number) => padTop + (1 - value / tempMax) * plotH;
  const irrY = (value: number) => padTop + (1 - value / irrMax) * plotH;

  const tempPoints = temp
    .map((value, index) => `${xAt(index)},${tempY(value)}`)
    .join(" ");
  const irrPoints = irradiance
    .map((value, index) => `${xAt(index)},${irrY(value)}`)
    .join(" ");

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-48 w-full"
        preserveAspectRatio="none"
        role="img"
      >
        <title>
          Temperature and solar irradiance across the forecast horizon
        </title>
        <polyline
          points={irrPoints}
          fill="none"
          className="stroke-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={tempPoints}
          fill="none"
          className="stroke-primary"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {labels.map((label, index) => (
          <text
            key={label}
            x={xAt(index)}
            y={height - 6}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[9px]"
          >
            {label}
          </text>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span
            className="h-0.5 w-6 rounded-full bg-accent"
            aria-hidden="true"
          />
          Solar irradiance (W/m²)
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-0.5 w-6 rounded-full border-t-2 border-dashed border-primary"
            aria-hidden="true"
          />
          Temperature (°C)
        </span>
      </div>
    </div>
  );
}

function BatteryCycleChart() {
  const width = 640;
  const height = 220;
  const padX = 12;
  const padTop = 16;
  const padBottom = 28;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;
  const labels = [
    "00:00",
    "03:00",
    "06:00",
    "09:00",
    "12:00",
    "15:00",
    "18:00",
    "21:00",
  ];
  const max = 100;
  const barW = plotW / labels.length;
  const yAt = (value: number) => padTop + (1 - value / max) * plotH;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-52 w-full"
        preserveAspectRatio="none"
        role="img"
      >
        <title>Battery charge and discharge across the day</title>
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={padX}
              x2={width - padX}
              y1={yAt(tick)}
              y2={yAt(tick)}
              className="stroke-border"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <text
              x={padX}
              y={yAt(tick) - 4}
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {tick}%
            </text>
          </g>
        ))}
        {labels.map((label, index) => {
          const charge = CHARGE_SERIES[index];
          const discharge = DISCHARGE_SERIES[index];
          const x = padX + index * barW + barW * 0.2;
          const w = barW * 0.6;
          return (
            <g key={label}>
              <rect
                x={x}
                y={yAt(charge)}
                width={w}
                height={plotH - (yAt(charge) - padTop)}
                className="fill-primary/70"
                rx="2"
              />
              {discharge > 0 && (
                <rect
                  x={x}
                  y={yAt(charge + discharge)}
                  width={w}
                  height={yAt(charge) - yAt(charge + discharge)}
                  className="fill-accent/80"
                  rx="2"
                />
              )}
              <text
                x={x + w / 2}
                y={height - 8}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[9px]"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span
            className="size-3 rounded-sm bg-primary/70"
            aria-hidden="true"
          />
          State of charge
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-accent/80" aria-hidden="true" />
          Discharge to grid
        </span>
      </div>
    </div>
  );
}

function DeficitChart() {
  const width = 640;
  const height = 200;
  const padX = 12;
  const padTop = 16;
  const padBottom = 28;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;
  const max = Math.max(...DEFICIT_SERIES.map((point) => point.deficit)) + 8;
  const barW = plotW / DEFICIT_SERIES.length;
  const yAt = (value: number) => padTop + (1 - value / max) * plotH;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-48 w-full"
        preserveAspectRatio="none"
        role="img"
      >
        <title>Estimated energy deficit across the day</title>
        {DEFICIT_SERIES.map((point, index) => {
          const x = padX + index * barW + barW * 0.22;
          const w = barW * 0.56;
          const barHeight = plotH - (yAt(point.deficit) - padTop);
          return (
            <g key={point.label}>
              <rect
                x={x}
                y={yAt(point.deficit)}
                width={w}
                height={barHeight}
                className={
                  point.deficit > 30 ? "fill-destructive/70" : "fill-warning/70"
                }
                rx="2"
              />
              <text
                x={x + w / 2}
                y={height - 8}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[9px]"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span
            className="size-3 rounded-sm bg-warning/70"
            aria-hidden="true"
          />
          Manageable deficit
        </span>
        <span className="flex items-center gap-2">
          <span
            className="size-3 rounded-sm bg-destructive/70"
            aria-hidden="true"
          />
          Storage required
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ForecastingPage() {
  const [state, setState] = useState("Rajasthan");
  const [city, setCity] = useState("Jodhpur");
  const [technology, setTechnology] = useState("hybrid");
  const [capacity, setCapacity] = useState("120");
  const [horizon, setHorizon] = useState("24h");
  const [batteryCapacity, setBatteryCapacity] = useState("48");
  const [backupDuration, setBackupDuration] = useState("4");
  const [recalculatedAt, setRecalculatedAt] = useState(
    "12 Nov 2026 · 06:00 IST",
  );

  const cityOptions = CITY_OPTIONS[state] ?? [];
  const outputData = OUTPUT_SERIES[horizon] ?? OUTPUT_24H;

  const handleStateChange = (value: string) => {
    setState(value);
    const nextCities = CITY_OPTIONS[value] ?? [];
    setCity(nextCities[0] ?? "");
  };

  return (
    <PageFrame>
      {/* Editorial header */}
      <header className="border-b border-border pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Energy Intelligence · D8
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Energy Forecasting Lab
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Explore solar and wind generation estimates, weather conditions,
              and storage requirements.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="warning">Simulated weather</StatusBadge>
            <span className="font-mono text-xs text-muted-foreground">
              Last updated {recalculatedAt}
            </span>
          </div>
        </div>
      </header>

      {/* Planner inputs */}
      <section className="mt-10" aria-labelledby="forecast-inputs">
        <div className="flex items-center justify-between">
          <h2
            id="forecast-inputs"
            className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Forecast parameters
          </h2>
          <SampleTag />
        </div>
        <Card className="mt-5 rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="forecast-state"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                State
              </Label>
              <Select value={state} onValueChange={handleStateChange}>
                <SelectTrigger
                  id="forecast-state"
                  aria-label="State"
                  data-ocid="forecast.state_select"
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
              <Label
                htmlFor="forecast-city"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                City / Location
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger
                  id="forecast-city"
                  aria-label="City or location"
                  data-ocid="forecast.city_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="forecast-capacity"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Installed Capacity (MW)
              </Label>
              <Input
                id="forecast-capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                data-ocid="forecast.capacity_input"
                className="rounded-lg border-input bg-background"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="forecast-battery"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Battery Capacity (MWh)
              </Label>
              <Input
                id="forecast-battery"
                type="number"
                min="0"
                value={batteryCapacity}
                onChange={(event) => setBatteryCapacity(event.target.value)}
                data-ocid="forecast.battery_input"
                className="rounded-lg border-input bg-background"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="forecast-backup"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Backup Duration (hours)
              </Label>
              <Input
                id="forecast-backup"
                type="number"
                min="0"
                value={backupDuration}
                onChange={(event) => setBackupDuration(event.target.value)}
                data-ocid="forecast.backup_input"
                className="rounded-lg border-input bg-background"
              />
            </div>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Technology
              </legend>
              <div className="flex flex-wrap gap-2">
                {TECHNOLOGY_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.id}
                    label={option.label}
                    active={technology === option.id}
                    onClick={() => setTechnology(option.id)}
                    data-ocid={`forecast.technology.${option.id}`}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Forecast Horizon
              </legend>
              <div className="flex flex-wrap gap-2">
                {HORIZON_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.id}
                    label={option.label}
                    active={horizon === option.id}
                    onClick={() => setHorizon(option.id)}
                    data-ocid={`forecast.horizon.${option.id}`}
                  />
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col justify-end gap-2 sm:col-span-2 lg:col-span-1">
              <Button
                type="button"
                data-ocid="forecast.recalculate_button"
                onClick={() => setRecalculatedAt("12 Nov 2026 · 06:00 IST")}
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Recalculate
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              {city}, {state}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {capacity} MW installed · {batteryCapacity} MWh storage ·{" "}
              {backupDuration}h backup
            </span>
            <SourceBadge className="ml-auto">
              Simulated weather · sample model
            </SourceBadge>
          </div>
        </Card>
      </section>

      {/* Weather panel */}
      <section className="mt-10" aria-labelledby="forecast-weather">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2
              id="forecast-weather"
              className="font-display text-xl font-semibold tracking-tight text-foreground"
            >
              Weather conditions
            </h2>
            <p className="text-sm text-muted-foreground">
              Simulated conditions for {city}, {state} · reporting period Oct
              2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="warning">Simulated</StatusBadge>
            <SampleTag />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {WEATHER_METRICS.map((metric) => {
            const Icon = WEATHER_ICONS[metric.icon];
            return (
              <Card
                key={metric.id}
                data-ocid={`forecast.weather_card.${metric.id}`}
                className="rounded-[18px] border-border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Icon className="size-4 text-accent" aria-hidden="true" />
                    {metric.label}
                  </span>
                </div>
                <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">
                  {metric.value}
                  <span className="ml-1.5 text-base font-normal text-muted-foreground">
                    {metric.unit}
                  </span>
                </p>
                <div className="mt-3">
                  <WeatherSparkline series={metric.series} />
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-5 flex flex-wrap items-center gap-4 rounded-[18px] border-border bg-secondary/40 p-5 shadow-subtle">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <CloudSun className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold text-foreground">
              Clear skies with light afternoon breeze
            </p>
            <p className="text-sm text-muted-foreground">
              High irradiance through midday, wind strengthening into the
              evening peak. Conditions are simulated for illustration.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SourceBadge>Simulated weather feed</SourceBadge>
            <SourceBadge>Reporting period Oct 2026</SourceBadge>
          </div>
        </Card>
      </section>

      {/* Forecast summary */}
      <section className="mt-10" aria-labelledby="forecast-summary">
        <div className="flex items-center justify-between">
          <h2
            id="forecast-summary"
            className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Forecast summary
          </h2>
          <SampleTag />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {FORECAST_SUMMARY.map((item) => (
            <Card
              key={item.id}
              data-ocid={`forecast.summary_card.${item.id}`}
              className="rounded-[18px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">
                {item.value}
                <span className="ml-1.5 text-base font-normal text-muted-foreground">
                  {item.unit}
                </span>
              </p>
              <div className="mt-3">
                <StatusBadge tone={item.tone}>{item.note}</StatusBadge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Output chart */}
      <section className="mt-10">
        <ChartContainer
          title="Historical versus forecast output"
          description="Solar and wind generation with forecast uncertainty range"
          action={
            <div className="flex items-center gap-1.5">
              {HORIZON_OPTIONS.map((option) => (
                <FilterChip
                  key={option.id}
                  label={option.label}
                  active={horizon === option.id}
                  onClick={() => setHorizon(option.id)}
                  className="px-3 py-1 text-xs"
                />
              ))}
            </div>
          }
        >
          <OutputChart data={outputData} />
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span
                className="h-0.5 w-6 rounded-full bg-accent"
                aria-hidden="true"
              />
              Solar output
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-0.5 w-6 rounded-full bg-primary"
                aria-hidden="true"
              />
              Wind output
            </span>
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-6 rounded-sm bg-primary/10"
                aria-hidden="true"
              />
              Forecast uncertainty range
            </span>
          </div>
        </ChartContainer>
      </section>

      {/* Comparison + weather trend */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Solar and wind comparison"
          description="Estimated daily generation by technology"
        >
          <SolarWindComparison />
        </ChartContainer>

        <ChartContainer
          title="Weather trend"
          description="Temperature and solar irradiance across the horizon"
        >
          <WeatherTrendChart />
        </ChartContainer>
      </section>

      {/* Battery + deficit */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Battery charge and discharge"
          description="Storage time-shifts midday generation to the evening peak"
        >
          <BatteryCycleChart />
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Battery storage time-shifts surplus midday solar generation to cover
            the evening demand peak, smoothing the daily output curve.
          </p>
        </ChartContainer>

        <ChartContainer
          title="Estimated energy deficit"
          description="Unmet demand after generation and storage"
        >
          <DeficitChart />
        </ChartContainer>
      </section>

      {/* Battery sizing recommendation */}
      <section className="mt-10" aria-labelledby="forecast-battery-sizing">
        <SectionHeading
          eyebrow="Storage planner"
          title="Battery sizing recommendation"
          description="Indicative storage sizing for the selected location, capacity and backup duration."
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="grid gap-5 sm:grid-cols-2">
            {BATTERY_RECOMMENDATION.map((item) => (
              <Card
                key={item.id}
                data-ocid={`forecast.battery_card.${item.id}`}
                className="rounded-[18px] border-border bg-card p-6 shadow-subtle"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <BatteryCharging
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">
                  {item.value}
                  <span className="ml-1.5 text-base font-normal text-muted-foreground">
                    {item.unit}
                  </span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.note}
                </p>
              </Card>
            ))}
          </div>

          <Card className="flex flex-col rounded-[18px] border-border bg-secondary/40 p-6 shadow-subtle md:p-8">
            <div className="flex items-center gap-2 text-primary">
              <Gauge className="size-4" aria-hidden="true" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                Storage as time-shifting
              </span>
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold text-foreground">
              Why storage matters here
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Solar generation peaks at midday while demand peaks in the
              evening. Battery storage does not create energy — it time-shifts
              surplus generation to the hours when it is needed, reducing the
              modelled evening deficit.
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Modelled deficit</dt>
                <dd className="font-mono font-medium text-foreground">
                  312 MWh
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Storage coverage</dt>
                <dd className="font-mono font-medium text-foreground">96%</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Backup duration</dt>
                <dd className="font-mono font-medium text-foreground">
                  {backupDuration} hours
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <SourceBadge>Simulated weather</SourceBadge>
              <SourceBadge>Sample storage model</SourceBadge>
            </div>
          </Card>
        </div>
      </section>

      {/* Technology comparison table */}
      <section className="mt-10">
        <ChartContainer
          title="Compare solar, wind and hybrid"
          description="Indicative generation, capacity factor and storage need by technology"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Technology
                  </th>
                  <th className="pb-3 pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Estimated generation
                  </th>
                  <th className="pb-3 pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Capacity factor
                  </th>
                  <th className="pb-3 pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Storage need
                  </th>
                  <th className="pb-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Reliability
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, index) => (
                  <tr
                    key={row.id}
                    data-ocid={`forecast.comparison_row.${index + 1}`}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      technology === row.id && "bg-secondary/40",
                    )}
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.technology}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-foreground">
                      {row.generation}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-foreground">
                      {row.capacityFactor}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-foreground">
                      {row.storageNeed}
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge tone={row.tone}>
                        {row.reliability}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </section>

      {/* Actions */}
      <section className="mt-10">
        <Card className="flex flex-col gap-5 rounded-[18px] border-border bg-card p-6 shadow-subtle md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-xl space-y-1">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Save or export this forecast
            </h3>
            <p className="text-sm text-muted-foreground">
              Save the current scenario or export a sample report. All figures
              are illustrative sample data and are not persisted.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              data-ocid="forecast.change_location_button"
              variant="outline"
              className="rounded-full border-border bg-card text-foreground hover:bg-secondary"
            >
              <MapPin className="size-4" aria-hidden="true" />
              Change location
            </Button>
            <Button
              type="button"
              data-ocid="forecast.save_button"
              variant="outline"
              className="rounded-full border-border bg-card text-foreground hover:bg-secondary"
            >
              <Save className="size-4" aria-hidden="true" />
              Save forecast
            </Button>
            <Button
              type="button"
              data-ocid="forecast.export_button"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="size-4" aria-hidden="true" />
              Export sample report
            </Button>
          </div>
        </Card>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
          <span className="inline-flex items-center gap-2">
            <Compass className="size-4 text-primary" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
              DEMO DATA
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            Illustrative sample data · simulated weather · reporting period Oct
            2026
          </span>
          <span className="ml-auto flex flex-wrap gap-2">
            <SourceBadge>CEA</SourceBadge>
            <SourceBadge>MNRE</SourceBadge>
            <SourceBadge>Grid-India</SourceBadge>
          </span>
        </div>
      </section>
    </PageFrame>
  );
}
