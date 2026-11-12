import {
  PageFrame,
  SectionHeading,
  SourceBadge,
  StatusBadge,
  type StatusTone,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/services/apiClient";
import { urjaApi } from "@/services/urjaApi";
import type {
  RpoCalculationResponse,
  RpoEntityCategory,
  RpoObligationCategory,
  RpoTargetsResponse,
} from "@/services/types";
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
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Selection options                                                   */
/* ------------------------------------------------------------------ */

const ENTITY_CATEGORIES: RpoEntityCategory[] = [
  "DISCOM",
  "Captive Consumer",
  "Open Access Consumer",
  "Other eligible entity",
];

const OBLIGATIONS: { value: RpoObligationCategory; label: string }[] = [
  { value: "total", label: "Total renewable (combined)" },
  { value: "wind", label: "Wind sub-target" },
  { value: "hydro", label: "Hydro sub-target" },
  { value: "distributed_re", label: "Distributed RE sub-target" },
  { value: "other", label: "Other renewable sub-target" },
];

const STATE_OPTIONS = [
  "Rajasthan",
  "Gujarat",
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Andhra Pradesh",
  "Uttar Pradesh",
  "Delhi",
  "Madhya Pradesh",
  "Telangana",
];

const FALLBACK_YEARS = [
  "2024-25",
  "2025-26",
  "2026-27",
  "2027-28",
  "2028-29",
  "2029-30",
];

interface FormState {
  entityName: string;
  category: RpoEntityCategory;
  state: string;
  year: string;
  consumption: string;
  procurement: string;
  certificates: string;
  obligation: RpoObligationCategory;
}

interface ComplianceResult {
  targetRate: number;
  required: number;
  actual: number;
  compliancePct: number;
  gap: number;
  remaining: number;
  surplus: number;
  status: "Compliant" | "Shortfall" | "Surplus";
  tone: StatusTone;
  notes: string[];
  certificatesCounted: number;
  certificatesCapped: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  verified: boolean;
  sourceUrl: string;
  policyVersion: string;
  framework: string;
  obligationLabel: string;
}

interface SavedCalculation {
  id: string;
  entity: string;
  year: string;
  category: string;
  compliance: number;
  status: "Compliant" | "Shortfall" | "Surplus";
  tone: StatusTone;
}

const INITIAL_FORM: FormState = {
  entityName: "Jaipur Vidyut Vitran Nigam",
  category: "DISCOM",
  state: "Rajasthan",
  year: "2025-26",
  consumption: "4200000",
  procurement: "1310000",
  certificates: "0",
  obligation: "total",
};

const formatMwh = (value: number) =>
  `${Math.round(value).toLocaleString("en-IN")} MWh`;

function mapResult(response: RpoCalculationResponse): ComplianceResult {
  const status =
    response.result.status === "compliant"
      ? "Compliant"
      : response.result.status === "surplus"
        ? "Surplus"
        : "Shortfall";
  return {
    targetRate: response.target.percent,
    required: response.target.required_mwh,
    actual: response.eligible.total_mwh,
    compliancePct: response.result.compliance_pct,
    gap: response.result.surplus_mwh - response.result.shortfall_mwh,
    remaining: response.result.shortfall_mwh,
    surplus: response.result.surplus_mwh,
    status,
    tone:
      status === "Shortfall"
        ? "danger"
        : status === "Surplus"
          ? "success"
          : "primary",
    notes: response.notes,
    certificatesCounted: response.eligible.certificates_mwh,
    certificatesCapped: response.eligible.certificates_capped_mwh,
    effectiveFrom: response.target.effective_from,
    effectiveTo: response.target.effective_to,
    verified: response.policy.verified,
    sourceUrl: response.policy.source.url,
    policyVersion: response.policy.version,
    framework: response.policy.framework,
    obligationLabel: response.target.obligation_label,
  };
}

/* ------------------------------------------------------------------ */
/* Gauge                                                               */
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
  const arc = (Math.min(clamped, 100) / 100) * 220;
  const color =
    tone === "danger"
      ? "stroke-destructive"
      : tone === "success"
        ? "stroke-success"
        : "stroke-primary";

  return (
    <div className="relative flex size-48 items-center justify-center">
      <svg viewBox="0 0 200 120" className="absolute inset-0 size-full">
        <title>Compliance gauge</title>
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          className="stroke-border"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          className={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${arc} 260`}
        />
      </svg>
      <div className="mt-6 text-center">
        <p className="font-mono text-3xl font-semibold text-foreground">
          {percent.toFixed(1)}%
        </p>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function RpoCompliancePage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [policy, setPolicy] = useState<RpoTargetsResponse | null>(null);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedCalculation[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingEntity, setEditingEntity] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    urjaApi
      .rpoTargets()
      .then((data) => {
        if (active) setPolicy(data);
      })
      .catch((error) => {
        if (active) {
          setPolicyError(
            error instanceof ApiError
              ? error.message
              : "Could not load the RPO policy file.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const years = policy?.years?.length ? policy.years : FALLBACK_YEARS;

  const update = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const discomTargets = useMemo(() => {
    const rows = policy?.targets.filter((row) => row.category === "DISCOM") ?? [];
    return rows.map((row) => ({
      year: row.year,
      wind: row.sub_targets?.wind ?? null,
      hydro: row.sub_targets?.hydro ?? null,
      distributed: row.sub_targets?.distributed_re ?? null,
      other: row.sub_targets?.other ?? null,
      total: row.total,
    }));
  }, [policy]);

  const handleCalculate = async () => {
    setCalculating(true);
    setApiError(null);
    setSavedNotice(null);
    try {
      const response = await urjaApi.rpoCalculate({
        entity_name: form.entityName || "Unnamed entity",
        entity_category: form.category,
        state: form.state,
        year: form.year,
        consumption: Number(form.consumption),
        consumption_unit: "MWh",
        renewable_procured: Number(form.procurement || 0),
        certificates: Number(form.certificates || 0),
        obligation_category: form.obligation,
      });
      setResult(mapResult(response));
    } catch (error) {
      setResult(null);
      setApiError(
        error instanceof ApiError
          ? error.message
          : "The compliance calculation failed.",
      );
    } finally {
      setCalculating(false);
    }
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
    setResult(null);
    setApiError(null);
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
      ["Obligation category", result.obligationLabel],
      ["Total consumption (MWh)", form.consumption],
      ["Eligible renewable procurement (MWh)", form.procurement],
      ["Certificates declared (MWh)", form.certificates],
      ["Certificates counted (MWh)", result.certificatesCounted.toFixed(3)],
      ["Certificates not counted (MWh)", result.certificatesCapped.toFixed(3)],
      ["Applicable RPO target (%)", result.targetRate.toFixed(2)],
      ["Required procurement (MWh)", Math.round(result.required).toString()],
      ["Eligible procurement (MWh)", Math.round(result.actual).toString()],
      ["Compliance (%)", result.compliancePct.toFixed(2)],
      ["Shortfall (MWh)", Math.round(result.remaining).toString()],
      ["Surplus (MWh)", Math.round(result.surplus).toString()],
      ["Compliance status", result.status],
      ["Policy framework", result.framework],
      ["Policy version", result.policyVersion],
      ["Policy source", result.sourceUrl],
      ["Target verified", result.verified ? "yes" : "no"],
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

  const trajectory = discomTargets.length
    ? discomTargets
    : [{ year: "2025-26", wind: null, hydro: null, distributed: null, other: null, total: 33.01 }];

  return (
    <PageFrame>
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
              Calculate compliance against the notified, versioned RPO trajectory.
              The backend refuses to guess a target that is not configured.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={policy ? "success" : policyError ? "danger" : "neutral"}>
                {policy ? "Policy loaded" : policyError ? "Policy unavailable" : "Loading policy"}
              </StatusBadge>
              {result && (
                <StatusBadge tone={result.verified ? "success" : "warning"}>
                  {result.verified ? "Verified target" : "Unverified target"}
                </StatusBadge>
              )}
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {policy?.policy.framework ?? "MoP RPO/RCO trajectory till 2029-30"}
            </span>
          </div>
        </div>
      </header>

      {policyError && (
        <Card className="mt-6 rounded-[18px] border-destructive/30 bg-destructive/5 p-5">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
            {policyError}
          </p>
        </Card>
      )}

      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Input form */}
        <Card
          data-ocid="rpo.calculator_panel"
          className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8"
        >
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Compliance calculator
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter entity details to compute the obligation position.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label
                htmlFor="rpo-entity"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Entity name
              </label>
              <Input
                id="rpo-entity"
                data-ocid="rpo.entity_name_input"
                value={form.entityName}
                onChange={(event) => update("entityName", event.target.value)}
                className="rounded-lg border-input bg-background"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="rpo-category"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Entity category
              </label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  update("category", value as RpoEntityCategory)
                }
              >
                <SelectTrigger
                  id="rpo-category"
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
              <label
                htmlFor="rpo-state"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                State
              </label>
              <Select value={form.state} onValueChange={(value) => update("state", value)}>
                <SelectTrigger
                  id="rpo-state"
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
              <label
                htmlFor="rpo-year"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Compliance year
              </label>
              <Select value={form.year} onValueChange={(value) => update("year", value)}>
                <SelectTrigger
                  id="rpo-year"
                  data-ocid="rpo.year_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((option) => (
                    <SelectItem key={option} value={option}>
                      FY {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="rpo-obligation"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Obligation category
              </label>
              <Select
                value={form.obligation}
                onValueChange={(value) =>
                  update("obligation", value as RpoObligationCategory)
                }
              >
                <SelectTrigger
                  id="rpo-obligation"
                  data-ocid="rpo.obligation_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBLIGATIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="rpo-consumption"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Consumption (MWh)
              </label>
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
              <label
                htmlFor="rpo-procurement"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Renewable electricity (MWh)
              </label>
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

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label
                htmlFor="rpo-certificates"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Eligible certificates / credits (MWh)
              </label>
              <Input
                id="rpo-certificates"
                data-ocid="rpo.certificates_input"
                type="number"
                inputMode="numeric"
                min="0"
                value={form.certificates}
                onChange={(event) => update("certificates", event.target.value)}
                className="rounded-lg border-input bg-background font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Certificates are only counted up to the remaining requirement, so
                the same renewable energy cannot be claimed twice.
              </p>
            </div>
          </div>

          {apiError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {apiError}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              data-ocid="rpo.calculate_button"
              onClick={() => void handleCalculate()}
              disabled={calculating}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {calculating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Calculator className="size-4" aria-hidden="true" />
              )}
              Calculate Compliance
            </Button>
            <Button
              type="button"
              variant="outline"
              data-ocid="rpo.save_button"
              onClick={handleSave}
              disabled={!result}
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
              disabled={!result}
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
            <SourceBadge>Backend calculation</SourceBadge>
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
                {[
                  ["Applicable target", `${result.targetRate.toFixed(2)}%`],
                  ["Required procurement", formatMwh(result.required)],
                  ["Eligible procurement", formatMwh(result.actual)],
                  ["Compliance", `${result.compliancePct.toFixed(1)}%`],
                  [
                    result.remaining > 0 ? "Shortfall" : "Surplus",
                    formatMwh(result.remaining > 0 ? result.remaining : result.surplus),
                  ],
                  ["Certificates counted", formatMwh(result.certificatesCounted)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-muted/30 px-4 py-3"
                  >
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                data-ocid="rpo.shortfall_indicator"
                className={cn(
                  "mt-5 flex items-start gap-3 rounded-xl border px-4 py-3",
                  result.remaining > 0
                    ? "border-destructive/25 bg-destructive/5"
                    : "border-success/25 bg-success/5",
                )}
              >
                {result.remaining > 0 ? (
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
                    {result.remaining > 0
                      ? "Shortfall against obligation"
                      : "Obligation met"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.remaining > 0
                      ? `Procure an additional ${formatMwh(result.remaining)} to reach the ${result.targetRate.toFixed(2)}% target for ${result.obligationLabel.toLowerCase()}.`
                      : `Surplus of ${formatMwh(result.surplus)} above the ${result.targetRate.toFixed(2)}% target.`}
                  </p>
                </div>
              </div>

              {result.notes.map((note) => (
                <p
                  key={note}
                  className="mt-3 flex gap-2 text-xs leading-relaxed text-muted-foreground"
                >
                  <Info className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  {note}
                </p>
              ))}

              <div className="mt-4 flex flex-wrap gap-2">
                <SourceBadge>
                  <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                    {result.framework}
                  </a>
                </SourceBadge>
                <SourceBadge>v{result.policyVersion}</SourceBadge>
                {result.effectiveFrom && (
                  <SourceBadge>
                    {result.effectiveFrom} → {result.effectiveTo ?? "—"}
                  </SourceBadge>
                )}
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

      {/* Target vs actual + shortfall */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Target vs. actual procurement
          </h3>
          {result ? (
            <div className="mt-6 space-y-4">
              {[
                { label: "Required", value: result.required, className: "bg-primary/25" },
                { label: "Eligible", value: result.actual, className: "bg-success/70" },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{bar.label}</span>
                    <span className="font-mono text-foreground">
                      {formatMwh(bar.value)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", bar.className)}
                      style={{
                        width: `${Math.min(
                          100,
                          (bar.value / Math.max(result.required, 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Calculate compliance to compare procurement against the target.
            </p>
          )}
        </Card>

        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <TrendingUp className="size-4" aria-hidden="true" />
              Shortfall indicator
            </span>
          </div>
          <p className="mt-4 font-mono text-3xl font-semibold text-foreground">
            {result ? formatMwh(result.remaining) : "—"}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {result && result.remaining > 0 ? (
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
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                Awaiting calculation
              </span>
            )}
            <StatusBadge tone={result ? result.tone : "neutral"}>
              {result ? result.status : "Pending"}
            </StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The shortfall is measured against the requirement for the selected
            year, entity category and obligation category. A remaining value means
            the obligation is not yet met.
          </p>
        </Card>
      </section>

      {/* Policy table */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="Policy configuration"
          title="Notified RPO trajectory"
          description="Read directly from the backend's versioned policy file. Update that file to change targets — the UI cannot edit policy values."
          action={
            <StatusBadge tone={policy?.policy.verified ? "success" : "warning"}>
              {policy?.policy.verified ? "Verified" : "Unverified"}
            </StatusBadge>
          }
        />

        <Card className="mt-6 rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Year", "Wind %", "Hydro %", "Distributed RE %", "Other %", "Total %"].map(
                    (heading, index) => (
                      <th
                        key={heading}
                        className={cn(
                          "pb-3 pr-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
                          index > 0 && "text-right",
                        )}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {trajectory.map((row, index) => (
                  <tr
                    key={row.year}
                    data-ocid={`rpo.rate_row.${index + 1}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-2.5 pr-4 font-medium text-foreground">
                      FY {row.year}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-foreground">
                      {row.wind === null ? "—" : row.wind.toFixed(2)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-foreground">
                      {row.hydro === null ? "—" : row.hydro.toFixed(2)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-foreground">
                      {row.distributed === null ? "—" : row.distributed.toFixed(2)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-foreground">
                      {row.other === null ? "—" : row.other.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-foreground">
                      {row.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Captive and open access consumers have a single total obligation in the
            same order, so sub-targets are not offered for those categories.
          </p>
          {policy && (
            <div className="mt-4 flex flex-wrap gap-2">
              <SourceBadge>
                <a
                  href={policy.policy.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {policy.policy.source.name}
                </a>
              </SourceBadge>
              <SourceBadge>Updated {policy.policy.updated_at}</SourceBadge>
            </div>
          )}
        </Card>
      </section>

      {/* History + entity */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <History className="size-4" aria-hidden="true" />
              Session calculations
            </span>
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
              No saved calculations in this session. Run a calculation and save it
              to build a shortlist.
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
              {editingEntity ? "Done" : "Edit"}
            </Button>
          </div>

          {editingEntity ? (
            <div className="mt-5 space-y-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="rpo-edit-name"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Entity name
                </label>
                <Input
                  id="rpo-edit-name"
                  value={form.entityName}
                  onChange={(event) => update("entityName", event.target.value)}
                  className="rounded-lg border-input bg-background"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="rpo-edit-state"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  State
                </label>
                <Input
                  id="rpo-edit-state"
                  value={form.state}
                  onChange={(event) => update("state", event.target.value)}
                  className="rounded-lg border-input bg-background"
                />
              </div>
            </div>
          ) : (
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ["Entity name", form.entityName || "—"],
                ["Category", form.category],
                ["State", form.state],
                [
                  "Obligation category",
                  OBLIGATIONS.find((option) => option.value === form.obligation)?.label ??
                    form.obligation,
                ],
                ["Compliance year", `FY ${form.year}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
      </section>

      <p className="mt-10 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Calculations run in the URJA FastAPI backend · policy file version{" "}
        {policy?.policy.version ?? "unavailable"}
      </p>
    </PageFrame>
  );
}
