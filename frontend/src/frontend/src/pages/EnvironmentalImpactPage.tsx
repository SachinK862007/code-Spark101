import {
  DashboardSection,
  DataRefreshIndicator,
  KpiCardView,
  TrendChip,
} from "@/components/dashboard";
import {
  SampleTag,
  SourceBadge,
  StatusBadge,
  type StatusTone,
} from "@/components/shared";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DATA_REFRESH_SOURCES,
  DATE_FILTER_OPTIONS,
  type KpiCard,
  LAST_UPDATED,
  REPORTING_PERIOD,
  STATE_FILTER_OPTIONS,
} from "@/data/greenGridData";
import { cn } from "@/lib/utils";
import {
  CalendarRange,
  ChevronDown,
  Database,
  Factory,
  Leaf,
  MapPin,
  SlidersHorizontal,
  Wind,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Local sample data — illustrative only, nothing is fetched           */
/* ------------------------------------------------------------------ */

const CITY_FILTER_OPTIONS = [
  "All cities",
  "Jaipur",
  "Ahmedabad",
  "Chennai",
  "Bengaluru",
  "Mumbai",
  "Hyderabad",
];

const SOURCE_FILTER_OPTIONS = [
  "All sources",
  "Solar",
  "Wind",
  "Hydro",
  "Biomass",
];

const ENVIRONMENT_KPIS: KpiCard[] = [
  {
    id: "co2-avoided",
    label: "Estimated CO₂ Avoided",
    value: "412.8",
    unit: "MtCO₂e",
    trend: "up",
    trendLabel: "+18.6% YoY",
    source: "CEA · estimated",
    series: [180, 205, 224, 248, 271, 296, 318, 342, 366, 388, 402, 412],
  },
  {
    id: "renewable-generation",
    label: "Renewable Generation",
    value: "113.4",
    unit: "TWh",
    trend: "up",
    trendLabel: "+24.5% YoY",
    source: "CEA · measured",
    series: [30, 34, 33, 39, 44, 43, 50, 55, 54, 61, 67, 74],
  },
  {
    id: "emissions-intensity",
    label: "Estimated Emissions Intensity",
    value: "0.62",
    unit: "kgCO₂/kWh",
    trend: "down",
    trendLabel: "-4.1% YoY",
    source: "CEA · estimated",
    series: [78, 77, 76, 74, 73, 71, 70, 68, 67, 65, 64, 62],
  },
  {
    id: "aqi",
    label: "National Air Quality Index",
    value: "128",
    unit: "AQI",
    trend: "down",
    trendLabel: "-6 pts vs. last month",
    source: "CPCB · measured",
    series: [168, 162, 158, 151, 149, 144, 140, 137, 134, 131, 129, 128],
  },
  {
    id: "pm25",
    label: "PM2.5 Concentration",
    value: "48.2",
    unit: "µg/m³",
    trend: "down",
    trendLabel: "-8.4% YoY",
    source: "CPCB · measured",
    series: [72, 69, 67, 64, 61, 59, 57, 55, 53, 51, 49, 48],
  },
  {
    id: "climate-index",
    label: "Climate Action Index",
    value: "71.4",
    unit: "/100",
    trend: "up",
    trendLabel: "+3.2 pts YoY",
    source: "Composite · estimated",
    series: [52, 54, 56, 58, 60, 62, 64, 66, 67, 69, 70, 71],
  },
];

interface RegionalCo2Point {
  region: string;
  avoided: number;
}

const REGIONAL_CO2_AVOIDED: RegionalCo2Point[] = [
  { region: "Northern", avoided: 118 },
  { region: "Western", avoided: 104 },
  { region: "Southern", avoided: 96 },
  { region: "Eastern", avoided: 52 },
  { region: "North-East", avoided: 24 },
  { region: "Central", avoided: 19 },
];

interface GenerationVsAvoidedPoint {
  year: string;
  generation: number;
  avoided: number;
}

const GENERATION_VS_AVOIDED: GenerationVsAvoidedPoint[] = [
  { year: "2019", generation: 210, avoided: 148 },
  { year: "2020", generation: 240, avoided: 172 },
  { year: "2021", generation: 290, avoided: 208 },
  { year: "2022", generation: 350, avoided: 254 },
  { year: "2023", generation: 420, avoided: 312 },
  { year: "2024", generation: 510, avoided: 388 },
];

interface AqiTrendPoint {
  month: string;
  aqi: number;
}

const AQI_TREND: AqiTrendPoint[] = [
  { month: "Jan", aqi: 168 },
  { month: "Feb", aqi: 158 },
  { month: "Mar", aqi: 149 },
  { month: "Apr", aqi: 141 },
  { month: "May", aqi: 136 },
  { month: "Jun", aqi: 132 },
  { month: "Jul", aqi: 129 },
  { month: "Aug", aqi: 134 },
  { month: "Sep", aqi: 138 },
  { month: "Oct", aqi: 131 },
  { month: "Nov", aqi: 128 },
  { month: "Dec", aqi: 126 },
];

interface StateEnvironmentalRow {
  rank: number;
  state: string;
  co2Avoided: string;
  intensity: string;
  aqi: number;
  aqiTone: StatusTone;
  trend: "up" | "down" | "flat";
}

const STATE_ENVIRONMENTAL: StateEnvironmentalRow[] = [
  {
    rank: 1,
    state: "Rajasthan",
    co2Avoided: "62.4 Mt",
    intensity: "0.54 kg/kWh",
    aqi: 142,
    aqiTone: "warning",
    trend: "up",
  },
  {
    rank: 2,
    state: "Gujarat",
    co2Avoided: "54.1 Mt",
    intensity: "0.58 kg/kWh",
    aqi: 118,
    aqiTone: "warning",
    trend: "up",
  },
  {
    rank: 3,
    state: "Tamil Nadu",
    co2Avoided: "48.7 Mt",
    intensity: "0.51 kg/kWh",
    aqi: 96,
    aqiTone: "success",
    trend: "flat",
  },
  {
    rank: 4,
    state: "Karnataka",
    co2Avoided: "41.2 Mt",
    intensity: "0.49 kg/kWh",
    aqi: 104,
    aqiTone: "warning",
    trend: "up",
  },
  {
    rank: 5,
    state: "Maharashtra",
    co2Avoided: "36.8 Mt",
    intensity: "0.63 kg/kWh",
    aqi: 134,
    aqiTone: "warning",
    trend: "up",
  },
  {
    rank: 6,
    state: "Andhra Pradesh",
    co2Avoided: "28.3 Mt",
    intensity: "0.61 kg/kWh",
    aqi: 112,
    aqiTone: "warning",
    trend: "down",
  },
];

interface AirQualityMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  band: string;
  tone: StatusTone;
  source: "CPCB" | "OpenAQ";
}

const AIR_QUALITY_METRICS: AirQualityMetric[] = [
  {
    id: "aqi",
    label: "Air Quality Index",
    value: "128",
    unit: "AQI",
    band: "Moderate",
    tone: "warning",
    source: "CPCB",
  },
  {
    id: "pm25",
    label: "PM2.5",
    value: "48.2",
    unit: "µg/m³",
    band: "Moderate",
    tone: "warning",
    source: "CPCB",
  },
  {
    id: "pm10",
    label: "PM10",
    value: "92.6",
    unit: "µg/m³",
    band: "Satisfactory",
    tone: "success",
    source: "CPCB",
  },
  {
    id: "no2",
    label: "NO₂",
    value: "31.4",
    unit: "µg/m³",
    band: "Satisfactory",
    tone: "success",
    source: "OpenAQ",
  },
  {
    id: "so2",
    label: "SO₂",
    value: "12.8",
    unit: "µg/m³",
    band: "Good",
    tone: "success",
    source: "OpenAQ",
  },
  {
    id: "o3",
    label: "O₃",
    value: "54.1",
    unit: "µg/m³",
    band: "Satisfactory",
    tone: "success",
    source: "OpenAQ",
  },
];

interface ClimateIndicator {
  id: string;
  label: string;
  value: string;
  unit: string;
  detail: string;
  trend: "up" | "down" | "flat";
  trendLabel: string;
  icon: "leaf" | "wind" | "factory";
}

const CLIMATE_INDICATORS: ClimateIndicator[] = [
  {
    id: "forest-cover",
    label: "Forest & Tree Cover",
    value: "25.2",
    unit: "% of area",
    detail: "National land under forest and tree cover",
    trend: "up",
    trendLabel: "+0.4 pts",
    icon: "leaf",
  },
  {
    id: "re-share",
    label: "Renewable Share of Generation",
    value: "23.4",
    unit: "%",
    detail: "Non-fossil share of total generation",
    trend: "up",
    trendLabel: "+4.2 pts",
    icon: "wind",
  },
  {
    id: "emissions-intensity",
    label: "Grid Emissions Intensity",
    value: "0.62",
    unit: "kgCO₂/kWh",
    detail: "Estimated carbon intensity of the grid",
    trend: "down",
    trendLabel: "-4.1%",
    icon: "factory",
  },
];

const CLIMATE_ICONS = {
  leaf: Leaf,
  wind: Wind,
  factory: Factory,
} as const;

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
        data-ocid={`environment.${id}`}
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
/* Regional CO₂ avoided bar chart                                      */
/* ------------------------------------------------------------------ */

function RegionalCo2Chart() {
  const max = Math.max(...REGIONAL_CO2_AVOIDED.map((point) => point.avoided));
  return (
    <div className="w-full">
      <div className="flex h-52 items-end justify-between gap-3">
        {REGIONAL_CO2_AVOIDED.map((point) => {
          const heightPct = (point.avoided / max) * 100;
          return (
            <div
              key={point.region}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="font-mono text-[10px] font-semibold text-foreground">
                {point.avoided}
              </span>
              <div
                className="w-full max-w-12 rounded-t-md bg-gradient-primary transition-smooth"
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-center font-mono text-[10px] text-muted-foreground">
                {point.region}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Estimated CO₂ avoided by region (MtCO₂e)
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Renewable generation vs. estimated emissions avoided line chart     */
/* ------------------------------------------------------------------ */

function GenerationVsAvoidedChart() {
  const width = 340;
  const height = 170;
  const padX = 30;
  const padY = 18;
  const maxValue = 560;
  const stepX = (width - padX * 2) / (GENERATION_VS_AVOIDED.length - 1);
  const toY = (value: number) =>
    height - padY - (value / maxValue) * (height - padY * 2);

  const generationPoints = GENERATION_VS_AVOIDED.map(
    (point, index) => `${padX + index * stepX},${toY(point.generation)}`,
  ).join(" ");
  const avoidedPoints = GENERATION_VS_AVOIDED.map(
    (point, index) => `${padX + index * stepX},${toY(point.avoided)}`,
  ).join(" ");

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full"
        role="img"
        aria-label="Renewable generation versus estimated emissions avoided from 2019 to 2024"
      >
        <title>Renewable generation versus estimated emissions avoided</title>
        {[0, 140, 280, 420, 560].map((tick) => (
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
          points={generationPoints}
          fill="none"
          className="stroke-chart-3"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={avoidedPoints}
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          strokeDasharray="5 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {GENERATION_VS_AVOIDED.map((point, index) => (
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
      <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-0.5 w-5 rounded-full bg-chart-3"
            aria-hidden="true"
          />
          Renewable generation (TWh)
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-0.5 w-5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Estimated CO₂ avoided (MtCO₂e)
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Air-quality trend line chart                                        */
/* ------------------------------------------------------------------ */

function AqiTrendChart() {
  const width = 340;
  const height = 150;
  const padX = 28;
  const padY = 16;
  const maxValue = 180;
  const stepX = (width - padX * 2) / (AQI_TREND.length - 1);
  const toY = (value: number) =>
    height - padY - (value / maxValue) * (height - padY * 2);

  const points = AQI_TREND.map(
    (point, index) => `${padX + index * stepX},${toY(point.aqi)}`,
  ).join(" ");
  const areaPoints = `${padX},${height - padY} ${points} ${width - padX},${height - padY}`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        role="img"
        aria-label="National air quality index trend across 2024"
      >
        <title>National air quality index trend</title>
        {[0, 60, 120, 180].map((tick) => (
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
        <polygon points={areaPoints} className="fill-accent/15" />
        <polyline
          points={points}
          fill="none"
          className="stroke-accent"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {AQI_TREND.map((point, index) => (
          <circle
            key={point.month}
            cx={padX + index * stepX}
            cy={toY(point.aqi)}
            r="2"
            className="fill-accent"
          />
        ))}
        {AQI_TREND.map((point, index) => (
          <text
            key={`label-${point.month}`}
            x={padX + index * stepX}
            y={height - 3}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[7px]"
          >
            {point.month}
          </text>
        ))}
      </svg>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Measured AQI · CPCB station network
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* State-wise environmental comparison                                 */
/* ------------------------------------------------------------------ */

function StateEnvironmentalList({
  rows,
  onSelect,
}: {
  rows: StateEnvironmentalRow[];
  onSelect: (row: StateEnvironmentalRow) => void;
}) {
  return (
    <ol data-ocid="environment.state_comparison" className="space-y-2">
      {rows.map((row) => (
        <li key={row.state}>
          <button
            type="button"
            data-ocid={`environment.state_row.${row.rank}`}
            onClick={() => onSelect(row)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left transition-smooth hover:border-primary/30 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-secondary-foreground">
              {row.rank}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {row.state}
              </span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                {row.co2Avoided} avoided · {row.intensity}
              </span>
            </span>
            <span className="flex flex-col items-end gap-1">
              <StatusBadge tone={row.aqiTone}>AQI {row.aqi}</StatusBadge>
              <TrendChip trend={row.trend} label="avoided" />
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function EnvironmentalImpactPage() {
  const [state, setState] = useState(STATE_FILTER_OPTIONS[0]);
  const [city, setCity] = useState(CITY_FILTER_OPTIONS[0]);
  const [dateRange, setDateRange] = useState(DATE_FILTER_OPTIONS[3]);
  const [source, setSource] = useState(SOURCE_FILTER_OPTIONS[0]);
  const [detailState, setDetailState] = useState<StateEnvironmentalRow | null>(
    null,
  );

  const comparisonRows = useMemo(() => {
    if (state === STATE_FILTER_OPTIONS[0]) return STATE_ENVIRONMENTAL;
    const match = STATE_ENVIRONMENTAL.find((row) => row.state === state);
    return match ? [match] : STATE_ENVIRONMENTAL;
  }, [state]);

  return (
    <div
      data-ocid="environment.page"
      className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10"
    >
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Opportunities &amp; Resources · D7
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Environmental Impact
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Follow emissions avoided, air quality and climate indicators
              across the transition.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <SampleTag />
              <StatusBadge tone="neutral">{REPORTING_PERIOD}</StatusBadge>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Source: CEA, CPCB, OpenAQ
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
              id="city_filter"
              label="City"
              value={city}
              options={CITY_FILTER_OPTIONS}
              onChange={setCity}
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
            <FilterSelect
              id="source_filter"
              label="Energy source"
              value={source}
              options={SOURCE_FILTER_OPTIONS}
              onChange={setSource}
              icon={SlidersHorizontal}
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
        {ENVIRONMENT_KPIS.map((kpi, index) => (
          <KpiCardView key={kpi.id} kpi={kpi} index={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Regional CO₂ avoided
            </h2>
            <SampleTag />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Estimated emissions avoided by regional grid
          </p>
          <div className="mt-6">
            <RegionalCo2Chart />
          </div>
        </Card>

        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Generation vs. emissions avoided
            </h2>
            <SampleTag />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Renewable generation against estimated CO₂ avoided, 2019–2024
          </p>
          <div className="mt-6">
            <GenerationVsAvoidedChart />
          </div>
        </Card>
      </div>

      {/* Air quality */}
      <DashboardSection
        className="mt-10"
        title="Air quality"
        description="Measured pollutant concentrations from CPCB and OpenAQ station networks."
        action={<SampleTag />}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle lg:col-span-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-foreground">
                Air quality trend
              </h3>
              <StatusBadge tone="warning">Measured</StatusBadge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              National AQI across 2024
            </p>
            <div className="mt-6">
              <AqiTrendChart />
            </div>
          </Card>

          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-foreground">
                Pollutants
              </h3>
              <SampleTag />
            </div>
            <ul className="mt-5 space-y-3">
              {AIR_QUALITY_METRICS.map((metric) => (
                <li
                  key={metric.id}
                  data-ocid={`environment.air_metric.${metric.id}`}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {metric.label}
                    </span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      {metric.source} · measured
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {metric.value}
                      <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                        {metric.unit}
                      </span>
                    </span>
                    <StatusBadge tone={metric.tone}>{metric.band}</StatusBadge>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </DashboardSection>

      {/* State comparison + climate indicators */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              State-wise comparison
            </h2>
            <SampleTag />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Estimated CO₂ avoided, grid intensity and measured AQI
          </p>
          <div className="mt-6">
            <StateEnvironmentalList
              rows={comparisonRows}
              onSelect={setDetailState}
            />
          </div>
        </Card>

        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Climate indicators
            </h2>
            <SampleTag />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            National climate and land-use signals
          </p>
          <div className="mt-6 space-y-3">
            {CLIMATE_INDICATORS.map((indicator) => {
              const Icon = CLIMATE_ICONS[indicator.icon];
              return (
                <div
                  key={indicator.id}
                  data-ocid={`environment.climate_card.${indicator.id}`}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4 transition-smooth hover:border-primary/30"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {indicator.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {indicator.detail}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-lg font-semibold text-foreground">
                      {indicator.value}
                      <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                        {indicator.unit}
                      </span>
                    </span>
                    <TrendChip
                      trend={indicator.trend}
                      label={indicator.trendLabel}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Data source note */}
      <div className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
          <Database className="size-3.5 text-primary" aria-hidden="true" />
          Data sources
        </span>
        <SourceBadge>CEA — estimated emissions avoided</SourceBadge>
        <SourceBadge>CPCB — measured air quality</SourceBadge>
        <SourceBadge>OpenAQ — measured air quality</SourceBadge>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {REPORTING_PERIOD}
        </span>
      </div>

      <p className="mt-8 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Illustrative prototype · All figures are sample data · Emissions avoided
        are estimated; air quality is measured · {REPORTING_PERIOD}
      </p>

      {/* Environmental detail dialog */}
      <Dialog
        open={detailState !== null}
        onOpenChange={(open) => {
          if (!open) setDetailState(null);
        }}
      >
        <DialogContent
          data-ocid="environment.detail_dialog"
          className="rounded-[20px] border-border bg-card sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold text-foreground">
              {detailState?.state} environmental detail
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Illustrative sample data for {detailState?.state}. Emissions
              avoided are estimated; air quality is measured.
            </DialogDescription>
          </DialogHeader>
          {detailState && (
            <dl className="grid grid-cols-2 gap-4 py-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Estimated CO₂ avoided
                </dt>
                <dd className="mt-1 font-mono text-lg font-semibold text-foreground">
                  {detailState.co2Avoided}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Grid emissions intensity
                </dt>
                <dd className="mt-1 font-mono text-lg font-semibold text-foreground">
                  {detailState.intensity}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Measured AQI
                </dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-lg font-semibold text-foreground">
                    {detailState.aqi}
                  </span>
                  <StatusBadge tone={detailState.aqiTone}>
                    {detailState.aqi <= 100 ? "Satisfactory" : "Moderate"}
                  </StatusBadge>
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Avoided trend
                </dt>
                <dd className="mt-1">
                  <TrendChip
                    trend={detailState.trend}
                    label="vs. last period"
                  />
                </dd>
              </div>
            </dl>
          )}
          <DialogFooter>
            <button
              type="button"
              data-ocid="environment.detail_dialog.close_button"
              onClick={() => setDetailState(null)}
              className={cn(
                "inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
