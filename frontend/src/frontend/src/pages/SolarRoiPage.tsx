import { DashboardSection } from "@/components/dashboard";
import { SampleTag, SourceBadge, StatusBadge } from "@/components/shared";
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
import { STATE_FILTER_OPTIONS } from "@/data/greenGridData";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Download,
  IndianRupee,
  Leaf,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Types + static configuration                                        */
/* ------------------------------------------------------------------ */

type UserCategory = "homeowner" | "business";
type SystemType = "ongrid" | "offgrid" | "hybrid";

interface Assumptions {
  costPerKw: number;
  yieldPerKw: number;
  tariff: number;
  subsidyRate: number;
  subsidyCap: number;
  efficiency: number;
}

interface RoiInputs {
  category: UserCategory;
  state: string;
  location: string;
  monthlyBill: number;
  monthlyConsumption: number;
  roofArea: number;
  tariff: number;
  systemType: SystemType;
}

interface RoiResult {
  systemSize: number;
  installCost: number;
  subsidy: number;
  finalInvestment: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  co2Avoided: number;
  annualGeneration: number;
  selfConsumption: number;
}

const CATEGORY_OPTIONS: { value: UserCategory; label: string }[] = [
  { value: "homeowner", label: "Homeowner" },
  { value: "business", label: "Small Business" },
];

const SYSTEM_TYPE_OPTIONS: { value: SystemType; label: string }[] = [
  { value: "ongrid", label: "On-grid (net metering)" },
  { value: "offgrid", label: "Off-grid (with battery)" },
  { value: "hybrid", label: "Hybrid (grid + battery)" },
];

const SYSTEM_TYPE_FACTOR: Record<SystemType, number> = {
  ongrid: 1,
  offgrid: 1.28,
  hybrid: 1.16,
};

const DEFAULT_ASSUMPTIONS: Assumptions = {
  costPerKw: 52000,
  yieldPerKw: 1450,
  tariff: 8.2,
  subsidyRate: 40,
  subsidyCap: 78000,
  efficiency: 82,
};

const DEFAULT_INPUTS: RoiInputs = {
  category: "homeowner",
  state: "Rajasthan",
  location: "Jaipur",
  monthlyBill: 4200,
  monthlyConsumption: 512,
  roofArea: 620,
  tariff: 8.2,
  systemType: "ongrid",
};

const COMPARE_SIZES = [3, 5, 7.5, 10];

const CO2_FACTOR = 0.71; // kg CO2 avoided per kWh of solar generation

/* ------------------------------------------------------------------ */
/* Calculation — illustrative, deterministic, no backend               */
/* ------------------------------------------------------------------ */

function computeRoi(inputs: RoiInputs, assumptions: Assumptions): RoiResult {
  const efficiency = assumptions.efficiency / 100;
  const typeFactor = SYSTEM_TYPE_FACTOR[inputs.systemType];

  // Size the system to cover the household's consumption, capped by roof area.
  const consumptionKw =
    inputs.monthlyConsumption / (assumptions.yieldPerKw / 12);
  const roofKw = inputs.roofArea / 100; // ~100 sq ft per kW
  const systemSize = Math.max(
    1,
    Math.round(Math.min(consumptionKw, roofKw) * 2) / 2,
  );

  const annualGeneration =
    systemSize * assumptions.yieldPerKw * efficiency * typeFactor;
  const installCost = systemSize * assumptions.costPerKw * typeFactor;

  const subsidy = Math.min(
    (installCost * assumptions.subsidyRate) / 100,
    assumptions.subsidyCap,
  );
  const finalInvestment = installCost - subsidy;

  const selfConsumption = Math.min(
    annualGeneration,
    inputs.monthlyConsumption * 12,
  );
  const annualSavings = selfConsumption * inputs.tariff;
  const monthlySavings = annualSavings / 12;
  const paybackYears = annualSavings > 0 ? finalInvestment / annualSavings : 0;
  const co2Avoided = annualGeneration * CO2_FACTOR;

  return {
    systemSize,
    installCost,
    subsidy,
    finalInvestment,
    monthlySavings,
    annualSavings,
    paybackYears,
    co2Avoided,
    annualGeneration,
    selfConsumption,
  };
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

const inr = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

function formatInr(value: number) {
  return `₹${inr.format(Math.round(value))}`;
}

function formatCompactInr(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return formatInr(value);
}

/* ------------------------------------------------------------------ */
/* Field primitives                                                    */
/* ------------------------------------------------------------------ */

function NumberField({
  id,
  label,
  value,
  onChange,
  suffix,
  prefix,
  min = 0,
  step = 1,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
  min?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
      >
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          data-ocid={`solar.${id}`}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
          className={cn(
            "h-11 rounded-xl border-input bg-card font-mono text-sm",
            prefix && "pl-8",
            suffix && "pr-14",
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          data-ocid={`solar.${id}`}
          className="h-11 w-full rounded-xl border-input bg-card text-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Result metric                                                       */
/* ------------------------------------------------------------------ */

function ResultMetric({
  index,
  label,
  value,
  hint,
  icon: Icon,
  emphasis = false,
}: {
  index: number;
  label: string;
  value: string;
  hint: string;
  icon: typeof Sun;
  emphasis?: boolean;
}) {
  return (
    <div
      data-ocid={`solar.result_metric.${index}`}
      className={cn(
        "rounded-2xl border p-4 transition-smooth",
        emphasis
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card hover:border-primary/25",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        <Icon
          className={cn(
            "size-4",
            emphasis ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Charts                                                              */
/* ------------------------------------------------------------------ */

function InvestmentDonut({ result }: { result: RoiResult }) {
  const slices = [
    {
      id: "subsidy",
      label: "Subsidy offset",
      value: result.subsidy,
      color: "var(--chart-3)",
    },
    {
      id: "investment",
      label: "Your investment",
      value: result.finalInvestment,
      color: "var(--chart-1)",
    },
  ];
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <title>Investment breakdown</title>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth="12"
          />
          {slices.map((slice) => {
            const dash = (slice.value / total) * circumference;
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
          <span className="font-mono text-lg font-semibold text-foreground">
            {formatCompactInr(result.installCost)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Gross cost
          </span>
        </div>
      </div>
      <ul className="w-full space-y-3 sm:w-auto">
        {slices.map((slice) => (
          <li key={slice.id} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: slice.color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-foreground">{slice.label}</span>
            <span className="font-mono text-sm font-medium text-muted-foreground">
              {formatCompactInr(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MonthlySavingsChart({ result }: { result: RoiResult }) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // Illustrative seasonal yield shape (higher in summer months).
  const shape = [
    0.82, 0.88, 1.0, 1.08, 1.14, 1.06, 0.94, 0.92, 0.98, 1.02, 0.9, 0.84,
  ];
  const values = shape.map((factor) => result.monthlySavings * factor);
  const max = Math.max(...values) || 1;

  return (
    <div className="w-full">
      <div className="flex h-44 items-end justify-between gap-1.5">
        {values.map((value, index) => (
          <div
            key={months[index]}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div
              className="w-full max-w-8 rounded-t-md bg-gradient-primary transition-smooth hover:brightness-110"
              style={{ height: `${(value / max) * 100}%` }}
              title={`${months[index]}: ${formatInr(value)}`}
            />
            <span className="font-mono text-[9px] text-muted-foreground">
              {months[index]}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Illustrative seasonal savings shape · peak month{" "}
        <span className="font-mono text-foreground">
          {formatInr(Math.max(...values))}
        </span>
      </p>
    </div>
  );
}

function PaybackTimeline({ result }: { result: RoiResult }) {
  const years = Math.max(1, Math.ceil(result.paybackYears));
  const milestones = Array.from({ length: years + 1 }, (_, i) => i);
  const progress =
    result.paybackYears > 0
      ? Math.min(100, (1 / result.paybackYears) * 100)
      : 0;

  return (
    <div className="w-full">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-primary transition-smooth"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        <span>Year 0</span>
        <span className="text-primary">
          Break-even · {result.paybackYears.toFixed(1)} yrs
        </span>
        <span>Year {years}</span>
      </div>
      <ol className="mt-5 space-y-2">
        {milestones.slice(0, 6).map((year) => {
          const cumulative = result.annualSavings * year;
          const recovered = Math.min(
            100,
            (cumulative / (result.finalInvestment || 1)) * 100,
          );
          return (
            <li
              key={year}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-secondary-foreground">
                {year}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Cumulative savings {formatCompactInr(cumulative)}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {recovered.toFixed(0)}% of investment recovered
                </span>
              </span>
              {recovered >= 100 && (
                <StatusBadge tone="success">Recovered</StatusBadge>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function GenerationChart({ result }: { result: RoiResult }) {
  const width = 340;
  const height = 160;
  const padX = 30;
  const padY = 18;
  const years = 25;
  const degradation = 0.006;
  const points = Array.from({ length: years + 1 }, (_, year) => ({
    year,
    value: result.annualGeneration * (1 - degradation) ** year,
  }));
  const maxValue = points[0].value || 1;
  const stepX = (width - padX * 2) / years;
  const toY = (value: number) =>
    height - padY - (value / maxValue) * (height - padY * 2);
  const linePoints = points
    .map((point) => `${padX + point.year * stepX},${toY(point.value)}`)
    .join(" ");
  const areaPoints = `${padX},${height - padY} ${linePoints} ${
    width - padX
  },${height - padY}`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full"
        role="img"
        aria-label="Estimated annual generation over 25 years with panel degradation"
      >
        <title>Estimated generation over 25 years</title>
        {[0, 0.5, 1].map((tick) => (
          <g key={tick}>
            <line
              x1={padX}
              y1={toY(maxValue * tick)}
              x2={width - padX}
              y2={toY(maxValue * tick)}
              className="stroke-border"
              strokeWidth="0.5"
            />
            <text
              x={padX - 6}
              y={toY(maxValue * tick) + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono text-[7px]"
            >
              {Math.round(maxValue * tick).toLocaleString("en-IN")}
            </text>
          </g>
        ))}
        <polygon points={areaPoints} className="fill-primary/10" />
        <polyline
          points={linePoints}
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[0, 5, 10, 15, 20, 25].map((year) => (
          <text
            key={year}
            x={padX + year * stepX}
            y={height - 4}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[7px]"
          >
            Y{year}
          </text>
        ))}
      </svg>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Year 1 generation{" "}
        <span className="font-mono text-foreground">
          {Math.round(result.annualGeneration).toLocaleString("en-IN")} kWh
        </span>{" "}
        · 0.6% annual degradation assumed
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SolarRoiPage() {
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULT_INPUTS);
  const [assumptions, setAssumptions] =
    useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [calculated, setCalculated] = useState<RoiResult>(() =>
    computeRoi(DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS),
  );
  const [saved, setSaved] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const comparison = useMemo(
    () =>
      COMPARE_SIZES.map((size) => {
        const installCost = size * assumptions.costPerKw;
        const subsidy = Math.min(
          (installCost * assumptions.subsidyRate) / 100,
          assumptions.subsidyCap,
        );
        const finalInvestment = installCost - subsidy;
        const annualGeneration =
          size *
          assumptions.yieldPerKw *
          (assumptions.efficiency / 100) *
          SYSTEM_TYPE_FACTOR[inputs.systemType];
        const annualSavings =
          Math.min(annualGeneration, inputs.monthlyConsumption * 12) *
          inputs.tariff;
        return {
          size,
          finalInvestment,
          annualSavings,
          payback: annualSavings > 0 ? finalInvestment / annualSavings : 0,
        };
      }),
    [assumptions, inputs.monthlyConsumption, inputs.systemType, inputs.tariff],
  );

  function updateInput<K extends keyof RoiInputs>(key: K, value: RoiInputs[K]) {
    setInputs((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setDownloaded(false);
  }

  function updateAssumption<K extends keyof Assumptions>(
    key: K,
    value: Assumptions[K],
  ) {
    setAssumptions((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleCalculate() {
    setCalculated(computeRoi(inputs, assumptions));
    setSaved(false);
    setDownloaded(false);
  }

  function handleReset() {
    setInputs(DEFAULT_INPUTS);
    setAssumptions(DEFAULT_ASSUMPTIONS);
    setCalculated(computeRoi(DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS));
    setSaved(false);
    setDownloaded(false);
  }

  return (
    <div
      data-ocid="solar.page"
      className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10"
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Energy Intelligence · D3
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Rooftop Solar ROI Calculator
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Estimate system size, subsidy, payback and lifetime savings for a
              rooftop solar installation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SampleTag />
            <StatusBadge tone="neutral">DEMO DATA</StatusBadge>
            <SourceBadge>MNRE benchmark costs · CEA tariffs</SourceBadge>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Inputs column */}
        <div className="space-y-6">
          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Site &amp; usage
              </h2>
              <Sun className="size-4 text-accent" aria-hidden="true" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your details to size a rooftop system.
            </p>

            <div className="mt-5 space-y-4">
              <SelectField
                id="category"
                label="User category"
                value={inputs.category}
                options={CATEGORY_OPTIONS}
                onChange={(value) =>
                  updateInput("category", value as UserCategory)
                }
              />
              <SelectField
                id="state"
                label="State"
                value={inputs.state}
                options={STATE_FILTER_OPTIONS.map((state) => ({
                  value: state,
                  label: state,
                }))}
                onChange={(value) => updateInput("state", value)}
              />
              <div className="space-y-1.5">
                <Label
                  htmlFor="location"
                  className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
                >
                  City / location
                </Label>
                <Input
                  id="location"
                  data-ocid="solar.location"
                  value={inputs.location}
                  onChange={(event) =>
                    updateInput("location", event.target.value)
                  }
                  placeholder="e.g. Jaipur"
                  className="h-11 rounded-xl border-input bg-card text-sm"
                />
              </div>
              <NumberField
                id="monthly_bill"
                label="Monthly electricity bill"
                value={inputs.monthlyBill}
                onChange={(value) => updateInput("monthlyBill", value)}
                prefix="₹"
              />
              <NumberField
                id="monthly_consumption"
                label="Monthly consumption"
                value={inputs.monthlyConsumption}
                onChange={(value) => updateInput("monthlyConsumption", value)}
                suffix="kWh"
              />
              <NumberField
                id="roof_area"
                label="Rooftop area"
                value={inputs.roofArea}
                onChange={(value) => updateInput("roofArea", value)}
                suffix="sq ft"
              />
              <NumberField
                id="tariff"
                label="Electricity tariff"
                value={inputs.tariff}
                onChange={(value) => updateInput("tariff", value)}
                prefix="₹"
                suffix="/kWh"
                step={0.1}
              />
              <SelectField
                id="system_type"
                label="System type"
                value={inputs.systemType}
                options={SYSTEM_TYPE_OPTIONS}
                onChange={(value) =>
                  updateInput("systemType", value as SystemType)
                }
              />
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                type="button"
                data-ocid="solar.calculate_button"
                onClick={handleCalculate}
                className="h-11 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated hover:brightness-110"
              >
                <Zap className="size-4" aria-hidden="true" />
                Calculate ROI
              </Button>
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="solar.reset_button"
                  onClick={handleReset}
                  className="h-10 rounded-full border-border bg-card text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="solar.assumptions_toggle"
                  aria-pressed={showAssumptions}
                  onClick={() => setShowAssumptions((open) => !open)}
                  className={cn(
                    "h-10 rounded-full border-border bg-card text-sm font-medium transition-smooth hover:border-primary/40 hover:bg-secondary",
                    showAssumptions ? "text-primary" : "text-foreground",
                  )}
                >
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  Assumptions
                </Button>
              </div>
            </div>
          </Card>

          {showAssumptions && (
            <Card
              data-ocid="solar.assumptions_panel"
              className="rounded-[18px] border-border bg-card p-6 shadow-subtle"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Assumptions
                </h2>
                <SampleTag />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Configurable cost, yield, subsidy and efficiency parameters.
              </p>
              <div className="mt-5 space-y-4">
                <NumberField
                  id="cost_per_kw"
                  label="Cost per kW"
                  value={assumptions.costPerKw}
                  onChange={(value) => updateAssumption("costPerKw", value)}
                  prefix="₹"
                  step={500}
                />
                <NumberField
                  id="yield_per_kw"
                  label="Generation yield per kW"
                  value={assumptions.yieldPerKw}
                  onChange={(value) => updateAssumption("yieldPerKw", value)}
                  suffix="kWh/yr"
                  step={10}
                />
                <NumberField
                  id="assumption_tariff"
                  label="Reference tariff"
                  value={assumptions.tariff}
                  onChange={(value) => updateAssumption("tariff", value)}
                  prefix="₹"
                  suffix="/kWh"
                  step={0.1}
                />
                <NumberField
                  id="subsidy_rate"
                  label="Subsidy eligibility"
                  value={assumptions.subsidyRate}
                  onChange={(value) => updateAssumption("subsidyRate", value)}
                  suffix="%"
                />
                <NumberField
                  id="subsidy_cap"
                  label="Subsidy limit"
                  value={assumptions.subsidyCap}
                  onChange={(value) => updateAssumption("subsidyCap", value)}
                  prefix="₹"
                  step={1000}
                />
                <NumberField
                  id="efficiency"
                  label="System efficiency"
                  value={assumptions.efficiency}
                  onChange={(value) => updateAssumption("efficiency", value)}
                  suffix="%"
                />
              </div>
            </Card>
          )}
        </div>

        {/* Results column */}
        <div className="space-y-6">
          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Estimated outcome
                </h2>
                <p className="text-sm text-muted-foreground">
                  {inputs.location}, {inputs.state} ·{" "}
                  {inputs.category === "homeowner"
                    ? "Homeowner"
                    : "Small Business"}
                </p>
              </div>
              <SampleTag />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ResultMetric
                index={1}
                label="Recommended size"
                value={`${calculated.systemSize.toFixed(1)} kW`}
                hint="Sized to consumption and roof area"
                icon={Sun}
                emphasis
              />
              <ResultMetric
                index={2}
                label="Installation cost"
                value={formatCompactInr(calculated.installCost)}
                hint="Before subsidy"
                icon={IndianRupee}
              />
              <ResultMetric
                index={3}
                label="Subsidy estimate"
                value={formatCompactInr(calculated.subsidy)}
                hint={`${assumptions.subsidyRate}% up to ${formatCompactInr(
                  assumptions.subsidyCap,
                )}`}
                icon={Check}
              />
              <ResultMetric
                index={4}
                label="Final investment"
                value={formatCompactInr(calculated.finalInvestment)}
                hint="Your net outlay"
                icon={IndianRupee}
                emphasis
              />
              <ResultMetric
                index={5}
                label="Monthly savings"
                value={formatInr(calculated.monthlySavings)}
                hint="Average across the year"
                icon={TrendingUp}
              />
              <ResultMetric
                index={6}
                label="Annual savings"
                value={formatCompactInr(calculated.annualSavings)}
                hint="At your current tariff"
                icon={TrendingUp}
              />
              <ResultMetric
                index={7}
                label="Payback period"
                value={`${calculated.paybackYears.toFixed(1)} yrs`}
                hint="Simple payback on net cost"
                icon={Zap}
                emphasis
              />
              <ResultMetric
                index={8}
                label="CO₂ avoided"
                value={`${Math.round(calculated.co2Avoided).toLocaleString(
                  "en-IN",
                )} kg`}
                hint="Per year of generation"
                icon={Leaf}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button
                type="button"
                data-ocid="solar.save_button"
                onClick={() => setSaved(true)}
                className="h-10 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated hover:brightness-110"
              >
                {saved ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                {saved ? "Calculation saved" : "Save calculation"}
              </Button>
              <Button
                type="button"
                variant="outline"
                data-ocid="solar.download_button"
                onClick={() => setDownloaded(true)}
                className="h-10 rounded-full border-border bg-card text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary"
              >
                {downloaded ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Download className="size-4" aria-hidden="true" />
                )}
                {downloaded ? "Report ready" : "Download sample report"}
              </Button>
            </div>
            {saved && (
              <p
                data-ocid="solar.save_success"
                className="mt-3 text-xs text-success"
              >
                Saved to this session only — persistence is not enabled in this
                prototype.
              </p>
            )}
            {downloaded && (
              <p
                data-ocid="solar.download_success"
                className="mt-3 text-xs text-muted-foreground"
              >
                A sample report would be generated here. This prototype does not
                produce a file.
              </p>
            )}
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Investment breakdown
                </h3>
                <SampleTag />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Gross cost split between subsidy and your investment
              </p>
              <div className="mt-6">
                <InvestmentDonut result={calculated} />
              </div>
            </Card>

            <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Monthly savings
                </h3>
                <SampleTag />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Illustrative seasonal savings across the year
              </p>
              <div className="mt-6">
                <MonthlySavingsChart result={calculated} />
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Payback timeline
                </h3>
                <SampleTag />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Cumulative savings against your net investment
              </p>
              <div className="mt-6">
                <PaybackTimeline result={calculated} />
              </div>
            </Card>

            <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Estimated generation
                </h3>
                <SampleTag />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Annual output over a 25-year system life
              </p>
              <div className="mt-6">
                <GenerationChart result={calculated} />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* System size comparison */}
      <DashboardSection
        className="mt-10"
        title="Compare system sizes"
        description="How net investment, annual savings and payback shift with system size."
        action={<SampleTag />}
      >
        <div className="overflow-hidden rounded-[18px] border border-border bg-card shadow-subtle">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  System size
                </th>
                <th className="px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Net investment
                </th>
                <th className="px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Annual savings
                </th>
                <th className="px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Payback
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, index) => {
                const isRecommended =
                  Math.abs(row.size - calculated.systemSize) < 0.75;
                return (
                  <tr
                    key={row.size}
                    data-ocid={`solar.compare_row.${index + 1}`}
                    className={cn(
                      "border-b border-border last:border-0 transition-smooth",
                      isRecommended ? "bg-primary/5" : "hover:bg-muted/40",
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-mono font-medium text-foreground">
                        {row.size} kW
                        {isRecommended && (
                          <StatusBadge tone="primary">Recommended</StatusBadge>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {formatCompactInr(row.finalInvestment)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {formatCompactInr(row.annualSavings)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {row.payback.toFixed(1)} yrs
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashboardSection>

      {/* Disclaimer */}
      <div className="mt-10 rounded-[18px] border border-border bg-muted/40 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Estimates are indicative only
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Actual system size, cost, subsidy and savings depend on your
              location, irradiance, shading, MNRE subsidy rules and your
              utility&apos;s tariff and net-metering policy. All figures on this
              screen are DEMO DATA for illustration and are not a quotation.
            </p>
            <p className="pt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Sources: MNRE benchmark costs · CEA tariff orders · Reporting
              period: FY 2024-25
            </p>
          </div>
        </div>
      </div>

      <p className="mt-8 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Illustrative prototype · All figures are DEMO DATA ·{" "}
        <span className="inline-flex items-center gap-1">
          Next step
          <ArrowRight className="size-3" aria-hidden="true" />
          Compare green finance options
        </span>
      </p>
    </div>
  );
}
