import {
  ChartContainer,
  PageFrame,
  SampleTag,
  SectionHeading,
  SourceBadge,
  StatusBadge,
  type StatusTone,
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
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  Download,
  History,
  Info,
  Minus,
  Pencil,
  RotateCcw,
  Save,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* DEMO DATA — static illustrative sample data, never fetched          */
/* ------------------------------------------------------------------ */

const DEMO_SOURCE = "MoP RPO Trajectory (illustrative)";
const DEMO_PERIOD = "Compliance year FY 2025-26";

const ENTITY_CATEGORIES = [
  "DISCOM",
  "Captive Consumer",
  "Open Access Consumer",
  "Other eligible entity",
] as const;

const OBLIGATION_CATEGORIES = [
  "Solar + Non-Solar (combined)",
  "Solar only",
  "Non-Solar only",
  "Wind + Hydro",
] as const;

const POLICY_TYPES = [
  "MoP national trajectory",
  "State regulator (SERC) order",
  "Draft / proposed",
] as const;

const COMPLIANCE_YEARS = [
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
] as const;

const STATE_OPTIONS = [
  "Rajasthan",
  "Gujarat",
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Andhra Pradesh",
  "Uttar Pradesh",
  "Delhi",
] as const;

/** Illustrative baseline trajectory — 29.91% (FY26) rising to 43.33% (FY30). */
const RPO_TRAJECTORY: { year: string; target: number }[] = [
  { year: "2025", target: 29.91 },
  { year: "2026", target: 32.5 },
  { year: "2027", target: 35.2 },
  { year: "2028", target: 38.1 },
  { year: "2029", target: 40.7 },
  { year: "2030", target: 43.33 },
];

interface PolicyRate {
  year: string;
  solar: number;
  nonSolar: number;
  total: number;
}

const DEFAULT_POLICY_RATES: PolicyRate[] = [
  { year: "2025", solar: 8.1, nonSolar: 21.81, total: 29.91 },
  { year: "2026", solar: 9.2, nonSolar: 23.3, total: 32.5 },
  { year: "2027", solar: 10.4, nonSolar: 24.8, total: 35.2 },
  { year: "2028", solar: 11.7, nonSolar: 26.4, total: 38.1 },
  { year: "2029", solar: 13.1, nonSolar: 27.6, total: 40.7 },
  { year: "2030", solar: 14.6, nonSolar: 28.73, total: 43.33 },
];

interface AnnualHistoryRow {
  year: string;
  target: number;
  achieved: number;
  status: "Compliant" | "Shortfall" | "Surplus";
  tone: StatusTone;
}

const ANNUAL_HISTORY: AnnualHistoryRow[] = [
  {
    year: "2021-22",
    target: 21.0,
    achieved: 19.4,
    status: "Shortfall",
    tone: "danger",
  },
  {
    year: "2022-23",
    target: 24.0,
    achieved: 23.1,
    status: "Shortfall",
    tone: "danger",
  },
  {
    year: "2023-24",
    target: 26.5,
    achieved: 27.2,
    status: "Surplus",
    tone: "success",
  },
  {
    year: "2024-25",
    target: 28.4,
    achieved: 29.6,
    status: "Surplus",
    tone: "success",
  },
  {
    year: "2025-26",
    target: 29.91,
    achieved: 31.2,
    status: "Compliant",
    tone: "success",
  },
];

interface SavedCalculation {
  id: string;
  entity: string;
  year: string;
  category: string;
  compliance: number;
  status: "Compliant" | "Shortfall" | "Surplus";
  tone: StatusTone;
}

const SEED_HISTORY: SavedCalculation[] = [
  {
    id: "calc-1",
    entity: "Jaipur Vidyut Vitran Nigam",
    year: "2025",
    category: "DISCOM",
    compliance: 104.3,
    status: "Compliant",
    tone: "success",
  },
  {
    id: "calc-2",
    entity: "Rajasthan Spinning Mills",
    year: "2025",
    category: "Captive Consumer",
    compliance: 88.6,
    status: "Shortfall",
    tone: "danger",
  },
];

/* ------------------------------------------------------------------ */
/* Calculation model (illustrative, in-memory only)                    */
/* ------------------------------------------------------------------ */

interface FormState {
  entityName: string;
  category: string;
  state: string;
  year: string;
  consumption: string;
  procurement: string;
  obligation: string;
}

interface ComplianceResult {
  targetRate: number;
  required: number;
  actual: number;
  compliancePct: number;
  gap: number;
  remaining: number;
  status: "Compliant" | "Shortfall" | "Surplus";
  tone: StatusTone;
}

const INITIAL_FORM: FormState = {
  entityName: "Jaipur Vidyut Vitran Nigam",
  category: "DISCOM",
  state: "Rajasthan",
  year: "2025",
  consumption: "4200000",
  procurement: "1310000",
  obligation: "Solar + Non-Solar (combined)",
};

function computeCompliance(
  form: FormState,
  rates: PolicyRate[],
): ComplianceResult {
  const rate = rates.find((entry) => entry.year === form.year) ?? rates[0];
  const consumption = Number(form.consumption) || 0;
  const actual = Number(form.procurement) || 0;
  const targetRate = rate.total;
  const required = (consumption * targetRate) / 100;
  const compliancePct = required > 0 ? (actual / required) * 100 : 0;
  const gap = actual - required;
  const remaining = Math.max(required - actual, 0);
  const status: ComplianceResult["status"] =
    gap < -0.5 ? "Shortfall" : gap > 0.5 ? "Surplus" : "Compliant";
  const tone: StatusTone =
    status === "Shortfall"
      ? "danger"
      : status === "Surplus"
        ? "success"
        : "primary";
  return {
    targetRate,
    required,
    actual,
    compliancePct,
    gap,
    remaining,
    status,
    tone,
  };
}

const formatMwh = (value: number) =>
  `${Math.round(value).toLocaleString("en-IN")} MWh`;

/* ------------------------------------------------------------------ */
/* Circular compliance gauge                                           */
/* ------------------------------------------------------------------ */

function ComplianceGauge({
  percent,
  status,
  tone,
}: {
  percent: number;
  status: string;
  tone: StatusTone;
}) {
  const clamped = Math.max(0, Math.min(percent, 150));
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const arc = (clamped / 150) * circumference;
  const strokeClass =
    tone === "danger"
      ? "stroke-destructive"
      : tone === "success"
        ? "stroke-success"
        : "stroke-primary";

  return (
    <div className="relative flex size-52 items-center justify-center">
      <svg viewBox="0 0 160 160" className="size-full -rotate-90" role="img">
        <title>Compliance percentage gauge</title>
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="14"
          className="stroke-muted"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference - arc}`}
          className={strokeClass}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-semibold tracking-tight text-foreground">
          {percent.toFixed(1)}
          <span className="text-xl text-muted-foreground">%</span>
        </span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Compliance
        </span>
        <span className="mt-2">
          <StatusBadge tone={tone}>{status}</StatusBadge>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Target vs actual bar chart                                          */
/* ------------------------------------------------------------------ */

function TargetActualBars({
  required,
  actual,
}: {
  required: number;
  actual: number;
}) {
  const max = Math.max(required, actual, 1);
  const bars = [
    {
      id: "required",
      label: "Required procurement",
      value: required,
      color: "var(--chart-1)",
    },
    {
      id: "actual",
      label: "Actual eligible procurement",
      value: actual,
      color: "var(--chart-3)",
    },
  ];
  return (
    <div className="space-y-5">
      {bars.map((bar) => (
        <div key={bar.id} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{bar.label}</span>
            <span className="font-mono font-medium text-foreground">
              {formatMwh(bar.value)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-smooth"
              style={{
                width: `${(bar.value / max) * 100}%`,
                backgroundColor: bar.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RPO trajectory line chart (2025-2030)                               */
/* ------------------------------------------------------------------ */

function TrajectoryChart() {
  const width = 340;
  const height = 150;
  const padX = 30;
  const padY = 18;
  const maxValue = 50;
  const stepX = (width - padX * 2) / (RPO_TRAJECTORY.length - 1);
  const toY = (value: number) =>
    height - padY - (value / maxValue) * (height - padY * 2);
  const points = RPO_TRAJECTORY.map(
    (point, index) => `${padX + index * stepX},${toY(point.target)}`,
  ).join(" ");

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        role="img"
        aria-label="RPO target trajectory from 2025 to 2030"
      >
        <title>RPO target trajectory 2025 to 2030</title>
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
          points={points}
          fill="none"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {RPO_TRAJECTORY.map((point, index) => (
          <circle
            key={point.year}
            cx={padX + index * stepX}
            cy={toY(point.target)}
            r="2.6"
            className="fill-primary"
          />
        ))}
        {RPO_TRAJECTORY.map((point, index) => (
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
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        29.91% (FY26) → 43.33% (FY30) · illustrative baseline
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
    >
      {children}
    </Label>
  );
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "success";
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-lg font-semibold text-foreground",
          tone === "danger" && "text-destructive",
          tone === "success" && "text-success",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function RpoCompliancePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [rates, setRates] = useState<PolicyRate[]>(DEFAULT_POLICY_RATES);
  const [policyType, setPolicyType] = useState<string>(POLICY_TYPES[0]);
  const [policySource, setPolicySource] = useState(DEMO_SOURCE);
  const [effectiveDate, setEffectiveDate] = useState("2025-04-01");
  const [result, setResult] = useState<ComplianceResult | null>(() =>
    computeCompliance(INITIAL_FORM, DEFAULT_POLICY_RATES),
  );
  const [history, setHistory] = useState<SavedCalculation[]>(SEED_HISTORY);
  const [editingEntity, setEditingEntity] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const update = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateRate = (
    year: string,
    key: "solar" | "nonSolar",
    value: string,
  ) => {
    setRates((prev) =>
      prev.map((entry) => {
        if (entry.year !== year) return entry;
        const parsed = Number(value) || 0;
        const next = { ...entry, [key]: parsed };
        next.total = Number((next.solar + next.nonSolar).toFixed(2));
        return next;
      }),
    );
  };

  const handleCalculate = () => {
    setResult(computeCompliance(form, rates));
    setSavedNotice(null);
  };

  const handleSave = () => {
    if (!result) return;
    const entry: SavedCalculation = {
      id: `calc-${Date.now()}`,
      entity: form.entityName || "Unnamed entity",
      year: form.year,
      category: form.category,
      compliance: result.compliancePct,
      status: result.status,
      tone: result.tone,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 6));
    setSavedNotice(`Saved ${entry.entity} · FY ${entry.year}`);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setRates(DEFAULT_POLICY_RATES);
    setPolicyType(POLICY_TYPES[0]);
    setPolicySource(DEMO_SOURCE);
    setEffectiveDate("2025-04-01");
    setResult(computeCompliance(INITIAL_FORM, DEFAULT_POLICY_RATES));
    setSavedNotice(null);
  };

  const handleExport = () => {
    if (!result) return;
    const rows = [
      ["Field", "Value"],
      ["Entity name", form.entityName],
      ["Entity category", form.category],
      ["State", form.state],
      ["Compliance year", form.year],
      ["Obligation category", form.obligation],
      ["Total consumption (MWh)", form.consumption],
      ["Existing eligible procurement (MWh)", form.procurement],
      ["Applicable RPO target (%)", result.targetRate.toFixed(2)],
      ["Required procurement (MWh)", Math.round(result.required).toString()],
      [
        "Actual eligible procurement (MWh)",
        Math.round(result.actual).toString(),
      ],
      ["Compliance (%)", result.compliancePct.toFixed(2)],
      ["Shortfall / surplus (MWh)", Math.round(result.gap).toString()],
      ["Remaining requirement (MWh)", Math.round(result.remaining).toString()],
      ["Compliance status", result.status],
      ["Policy source", policySource],
      ["Policy type", policyType],
      ["Effective date", effectiveDate],
      ["Data label", "DEMO DATA — illustrative sample"],
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rpo-compliance-${form.year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shortfallTone = useMemo(() => {
    if (!result) return "neutral" as const;
    return result.gap < 0 ? ("danger" as const) : ("success" as const);
  }, [result]);

  return (
    <PageFrame>
      {/* Header */}
      <header className="border-b border-border pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Energy Intelligence · D2
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Renewable Purchase Obligation Tracker
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Track renewable procurement, compare targets, and calculate
              compliance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SampleTag />
            <StatusBadge tone="neutral">{DEMO_PERIOD}</StatusBadge>
            <span className="font-mono text-xs text-muted-foreground">
              Source: {DEMO_SOURCE}
            </span>
          </div>
        </div>
      </header>

      {/* Calculator + result */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Input form */}
        <Card
          data-ocid="rpo.calculator_panel"
          className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Compliance calculator
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter entity details to compute the obligation position.
              </p>
            </div>
            <SampleTag />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <FieldLabel htmlFor="rpo-entity">Entity name</FieldLabel>
              <Input
                id="rpo-entity"
                data-ocid="rpo.entity_name_input"
                value={form.entityName}
                onChange={(event) => update("entityName", event.target.value)}
                placeholder="e.g. Jaipur Vidyut Vitran Nigam"
                className="rounded-lg border-input bg-background"
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="rpo-category">Entity category</FieldLabel>
              <Select
                value={form.category}
                onValueChange={(value) => update("category", value)}
              >
                <SelectTrigger
                  id="rpo-category"
                  aria-label="Entity category"
                  data-ocid="rpo.category_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="rpo-state">State</FieldLabel>
              <Select
                value={form.state}
                onValueChange={(value) => update("state", value)}
              >
                <SelectTrigger
                  id="rpo-state"
                  aria-label="State"
                  data-ocid="rpo.state_select"
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

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="rpo-year">Compliance year</FieldLabel>
              <Select
                value={form.year}
                onValueChange={(value) => update("year", value)}
              >
                <SelectTrigger
                  id="rpo-year"
                  aria-label="Compliance year"
                  data-ocid="rpo.year_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPLIANCE_YEARS.map((option) => (
                    <SelectItem key={option} value={option}>
                      FY {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="rpo-obligation">
                Obligation category
              </FieldLabel>
              <Select
                value={form.obligation}
                onValueChange={(value) => update("obligation", value)}
              >
                <SelectTrigger
                  id="rpo-obligation"
                  aria-label="Obligation category"
                  data-ocid="rpo.obligation_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBLIGATION_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="rpo-consumption">
                Total electricity consumption (MWh)
              </FieldLabel>
              <Input
                id="rpo-consumption"
                data-ocid="rpo.consumption_input"
                type="number"
                inputMode="numeric"
                min="0"
                value={form.consumption}
                onChange={(event) => update("consumption", event.target.value)}
                className="rounded-lg border-input bg-background font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="rpo-procurement">
                Existing eligible RE procurement (MWh)
              </FieldLabel>
              <Input
                id="rpo-procurement"
                data-ocid="rpo.procurement_input"
                type="number"
                inputMode="numeric"
                min="0"
                value={form.procurement}
                onChange={(event) => update("procurement", event.target.value)}
                className="rounded-lg border-input bg-background font-mono"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              data-ocid="rpo.calculate_button"
              onClick={handleCalculate}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Calculator className="size-4" aria-hidden="true" />
              Calculate Compliance
            </Button>
            <Button
              type="button"
              variant="outline"
              data-ocid="rpo.save_button"
              onClick={handleSave}
              className="rounded-full border-border bg-card"
            >
              <Save className="size-4" aria-hidden="true" />
              Save calculation
            </Button>
            <Button
              type="button"
              variant="outline"
              data-ocid="rpo.export_button"
              onClick={handleExport}
              className="rounded-full border-border bg-card"
            >
              <Download className="size-4" aria-hidden="true" />
              Export CSV
            </Button>
            <Button
              type="button"
              variant="ghost"
              data-ocid="rpo.reset_button"
              onClick={handleReset}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </Button>
          </div>

          {savedNotice && (
            <p
              data-ocid="rpo.success_state"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-sm text-success"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {savedNotice}
            </p>
          )}
        </Card>

        {/* Result */}
        <Card
          data-ocid="rpo.result_panel"
          className="flex flex-col rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Compliance result
              </h2>
              <p className="text-sm text-muted-foreground">
                {form.entityName || "Unnamed entity"} · FY {form.year}
              </p>
            </div>
            <SampleTag />
          </div>

          {result ? (
            <>
              <div className="mt-6 flex justify-center">
                <ComplianceGauge
                  percent={result.compliancePct}
                  status={result.status}
                  tone={result.tone}
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <ResultStat
                  label="Applicable RPO target"
                  value={`${result.targetRate.toFixed(2)}%`}
                />
                <ResultStat
                  label="Required procurement"
                  value={formatMwh(result.required)}
                />
                <ResultStat
                  label="Actual eligible procurement"
                  value={formatMwh(result.actual)}
                />
                <ResultStat
                  label="Compliance percentage"
                  value={`${result.compliancePct.toFixed(1)}%`}
                />
                <ResultStat
                  label={result.gap < 0 ? "Shortfall" : "Surplus"}
                  value={formatMwh(Math.abs(result.gap))}
                  tone={result.gap < 0 ? "danger" : "success"}
                />
                <ResultStat
                  label="Remaining requirement"
                  value={formatMwh(result.remaining)}
                />
              </div>

              <div
                data-ocid="rpo.shortfall_indicator"
                className={cn(
                  "mt-5 flex items-start gap-3 rounded-xl border px-4 py-3",
                  result.gap < 0
                    ? "border-destructive/25 bg-destructive/5"
                    : "border-success/25 bg-success/5",
                )}
              >
                {result.gap < 0 ? (
                  <AlertTriangle
                    className="mt-0.5 size-5 shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                ) : (
                  <ShieldCheck
                    className="mt-0.5 size-5 shrink-0 text-success"
                    aria-hidden="true"
                  />
                )}
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {result.gap < 0
                      ? "Shortfall against obligation"
                      : "Obligation met"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.gap < 0
                      ? `Procure an additional ${formatMwh(result.remaining)} to reach the ${result.targetRate.toFixed(2)}% target.`
                      : `Surplus of ${formatMwh(Math.abs(result.gap))} above the ${result.targetRate.toFixed(2)}% target.`}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Enter entity details and select Calculate Compliance to see the
              obligation position.
            </p>
          )}
        </Card>
      </section>

      {/* Charts */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Target vs. actual procurement"
          description="Required obligation against eligible renewable procurement"
        >
          {result ? (
            <TargetActualBars
              required={result.required}
              actual={result.actual}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Calculate compliance to compare procurement against the target.
            </p>
          )}
        </ChartContainer>

        <ChartContainer
          title="RPO trajectory 2025–2030"
          description="Illustrative national obligation trajectory"
        >
          <TrajectoryChart />
        </ChartContainer>
      </section>

      {/* Annual history + shortfall */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartContainer
          title="Annual compliance history"
          description="Target versus achieved obligation by compliance year"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Compliance year
                  </th>
                  <th className="pb-3 pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Target
                  </th>
                  <th className="pb-3 pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Achieved
                  </th>
                  <th className="pb-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ANNUAL_HISTORY.map((row, index) => (
                  <tr
                    key={row.year}
                    data-ocid={`rpo.history_row.${index + 1}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.year}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-foreground">
                      {row.target.toFixed(2)}%
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-foreground">
                      {row.achieved.toFixed(2)}%
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>

        <Card className="flex flex-col rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <TrendingUp className="size-4" aria-hidden="true" />
              Shortfall indicator
            </span>
            <SampleTag />
          </div>
          <p className="mt-4 font-mono text-3xl font-semibold text-foreground">
            {result ? formatMwh(Math.abs(result.gap)) : "—"}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {result && result.gap < 0 ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-destructive">
                <ArrowDownRight className="size-3.5" aria-hidden="true" />
                Below obligation
              </span>
            ) : result ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-success">
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                Above obligation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-muted-foreground">
                <Minus className="size-3.5" aria-hidden="true" />
                Awaiting calculation
              </span>
            )}
            <StatusBadge tone={shortfallTone}>
              {result ? result.status : "Pending"}
            </StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The shortfall indicator compares eligible renewable procurement
            against the applicable obligation for the selected year and
            category. A negative value signals a compliance gap that must be
            closed with additional procurement or certificates.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <SourceBadge>{DEMO_SOURCE}</SourceBadge>
            <SourceBadge>{DEMO_PERIOD}</SourceBadge>
          </div>
        </Card>
      </section>

      {/* Policy assumptions */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="Policy assumptions"
          title="Configurable RPO rates"
          description="Adjust the applicable obligation rate by year, category and policy type. Values are illustrative and editable."
          action={<SampleTag />}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <div className="flex items-center gap-2 text-primary">
              <Info className="size-4" aria-hidden="true" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                Policy source
              </span>
            </div>
            <div className="mt-5 space-y-5">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="rpo-policy-type">Policy type</FieldLabel>
                <Select value={policyType} onValueChange={setPolicyType}>
                  <SelectTrigger
                    id="rpo-policy-type"
                    aria-label="Policy type"
                    data-ocid="rpo.policy_type_select"
                    className="w-full rounded-lg border-input bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="rpo-policy-source">
                  Policy source
                </FieldLabel>
                <Input
                  id="rpo-policy-source"
                  data-ocid="rpo.policy_source_input"
                  value={policySource}
                  onChange={(event) => setPolicySource(event.target.value)}
                  className="rounded-lg border-input bg-background"
                />
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="rpo-effective-date">
                  Effective date
                </FieldLabel>
                <Input
                  id="rpo-effective-date"
                  data-ocid="rpo.effective_date_input"
                  type="date"
                  value={effectiveDate}
                  onChange={(event) => setEffectiveDate(event.target.value)}
                  className="rounded-lg border-input bg-background font-mono"
                />
              </div>
            </div>
          </Card>

          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Obligation rates by year
              </h3>
              <SampleTag />
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Year
                    </th>
                    <th className="pb-3 pr-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Solar %
                    </th>
                    <th className="pb-3 pr-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Non-solar %
                    </th>
                    <th className="pb-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Total %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate, index) => (
                    <tr
                      key={rate.year}
                      data-ocid={`rpo.rate_row.${index + 1}`}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-medium text-foreground">
                        FY {rate.year}
                      </td>
                      <td className="py-2.5 pr-4">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          aria-label={`Solar rate for ${rate.year}`}
                          data-ocid={`rpo.solar_rate_input.${index + 1}`}
                          value={rate.solar}
                          onChange={(event) =>
                            updateRate(rate.year, "solar", event.target.value)
                          }
                          className="h-8 w-24 rounded-md border-input bg-background font-mono text-sm"
                        />
                      </td>
                      <td className="py-2.5 pr-4">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          aria-label={`Non-solar rate for ${rate.year}`}
                          data-ocid={`rpo.nonsolar_rate_input.${index + 1}`}
                          value={rate.nonSolar}
                          onChange={(event) =>
                            updateRate(
                              rate.year,
                              "nonSolar",
                              event.target.value,
                            )
                          }
                          className="h-8 w-24 rounded-md border-input bg-background font-mono text-sm"
                        />
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-foreground">
                        {rate.total.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Total is the sum of solar and non-solar rates. The 29.91% → 43.33%
              trajectory is an illustrative baseline only.
            </p>
          </Card>
        </div>
      </section>

      {/* Saved calculations + entity info */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <History className="size-4" aria-hidden="true" />
              Calculation history
            </span>
            <SampleTag />
          </div>
          {history.length > 0 ? (
            <ul data-ocid="rpo.history_list" className="mt-5 space-y-3">
              {history.map((entry, index) => (
                <li
                  key={entry.id}
                  data-ocid={`rpo.history_item.${index + 1}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {entry.entity}
                    </span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      FY {entry.year} · {entry.category}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-sm font-semibold text-foreground">
                      {entry.compliance.toFixed(1)}%
                    </span>
                    <StatusBadge tone={entry.tone}>{entry.status}</StatusBadge>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              No saved calculations yet. Run a calculation and save it to build
              your history.
            </p>
          )}
        </Card>

        <Card className="rounded-[18px] border-border bg-secondary/40 p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              Entity information
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="rpo.edit_entity_button"
              onClick={() => setEditingEntity((prev) => !prev)}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              {editingEntity ? "Done" : "Edit"}
            </Button>
          </div>

          {editingEntity ? (
            <div className="mt-5 space-y-4">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="rpo-edit-name">Entity name</FieldLabel>
                <Input
                  id="rpo-edit-name"
                  data-ocid="rpo.edit_name_input"
                  value={form.entityName}
                  onChange={(event) => update("entityName", event.target.value)}
                  className="rounded-lg border-input bg-background"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="rpo-edit-category">
                  Entity category
                </FieldLabel>
                <Select
                  value={form.category}
                  onValueChange={(value) => update("category", value)}
                >
                  <SelectTrigger
                    id="rpo-edit-category"
                    aria-label="Entity category"
                    data-ocid="rpo.edit_category_select"
                    className="w-full rounded-lg border-input bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_CATEGORIES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Entity name</dt>
                <dd className="text-right font-medium text-foreground">
                  {form.entityName || "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="text-right font-medium text-foreground">
                  {form.category}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">State</dt>
                <dd className="text-right font-medium text-foreground">
                  {form.state}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Obligation category</dt>
                <dd className="text-right font-medium text-foreground">
                  {form.obligation}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Compliance year</dt>
                <dd className="text-right font-mono font-medium text-foreground">
                  FY {form.year}
                </dd>
              </div>
            </dl>
          )}
        </Card>
      </section>

      <p className="mt-10 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        DEMO DATA · Illustrative sample only · Source: {DEMO_SOURCE} ·{" "}
        {DEMO_PERIOD}
      </p>
    </PageFrame>
  );
}
