import {
  EmptyState,
  ErrorState,
  PageFrame,
  SectionHeading,
  SourceBadge,
  StatusBadge,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiAction, useApiResource } from "@/hooks/useApiResource";
import { urjaApi } from "@/services/urjaApi";
import type {
  RpoCalculationResponse,
  RpoEntityCategory,
  RpoObligationCategory,
  RpoTargetsResponse,
  SolarCalculationResponse,
} from "@/services/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  CloudOff,
  Leaf,
  Loader2,
  Percent,
  RotateCcw,
  Sun,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

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

const STATES = [
  "Karnataka",
  "Rajasthan",
  "Gujarat",
  "Tamil Nadu",
  "Maharashtra",
  "Andhra Pradesh",
  "Uttar Pradesh",
  "Delhi",
  "Madhya Pradesh",
  "Telangana",
  "Kerala",
  "West Bengal",
  "Haryana",
  "Punjab",
];

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function numberValue(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ResultRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right font-mono text-sm font-semibold",
          tone === "positive" && "text-success",
          tone === "negative" && "text-destructive",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ResultShell({
  title,
  source,
  children,
  onReset,
}: {
  title: string;
  source?: { label: string; url?: string };
  children: React.ReactNode;
  onReset: () => void;
}) {
  return (
    <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            Result
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
            {title}
          </h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="rounded-full"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Clear
        </Button>
      </div>
      <div className="mt-5">{children}</div>
      {source && (
        <div className="mt-5 border-t border-border pt-4">
          <SourceBadge>
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer" className="underline">
                {source.label}
              </a>
            ) : (
              source.label
            )}
          </SourceBadge>
        </div>
      )}
    </Card>
  );
}

function CalculatorFrame({
  eyebrow,
  title,
  description,
  form,
  result,
  formula,
}: {
  eyebrow: string;
  title: string;
  description: string;
  form: React.ReactNode;
  result: React.ReactNode;
  formula: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 space-y-4">{form}</div>
        <div className="mt-6 rounded-xl bg-muted/50 p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Calculation
          </p>
          <p className="mt-1.5 font-mono text-xs leading-relaxed text-foreground">
            {formula}
          </p>
        </div>
      </Card>
      <div>{result}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. RPO compliance                                                   */
/* ------------------------------------------------------------------ */

function RpoCalculator() {
  const targets = useApiResource<RpoTargetsResponse>(
    () => urjaApi.rpoTargets(),
    [],
  );
  const [entityName, setEntityName] = useState("Sample DISCOM");
  const [category, setCategory] = useState<RpoEntityCategory>("DISCOM");
  const [state, setState] = useState("Karnataka");
  const [year, setYear] = useState("2025-26");
  const [consumption, setConsumption] = useState("100000");
  const [unit, setUnit] = useState<"MWh" | "kWh">("MWh");
  const [renewable, setRenewable] = useState("24000");
  const [certificates, setCertificates] = useState("0");
  const [obligation, setObligation] = useState<RpoObligationCategory>("total");
  const [validation, setValidation] = useState<string | null>(null);

  const action = useApiAction(async () =>
    urjaApi.rpoCalculate({
      entity_name: entityName,
      entity_category: category,
      state,
      year,
      consumption: Number(consumption),
      consumption_unit: unit,
      renewable_procured: Number(renewable || 0),
      certificates: Number(certificates || 0),
      obligation_category: obligation,
    }),
  );

  const years = targets.data?.years ?? ["2024-25", "2025-26"];

  function submit() {
    const value = numberValue(consumption);
    if (!value || value <= 0) {
      setValidation("Enter applicable consumption greater than zero.");
      return;
    }
    if (numberValue(renewable) === null || numberValue(certificates) === null) {
      setValidation("Enter valid procurement and certificate values.");
      return;
    }
    setValidation(null);
    void action.run(undefined as never);
  }

  const result = action.data as RpoCalculationResponse | null;

  return (
    <CalculatorFrame
      eyebrow="Requirement and compliance"
      title="RPO compliance calculator"
      description="Uses the notified target for the selected year and entity category from the backend policy file. Missing targets are reported, never guessed."
      formula="Required = Consumption × Target % · Eligible = RE procured + Certificates (certificates only fill the gap) · Compliance = Eligible ÷ Required × 100"
      form={
        <>
          <Field id="calc-rpo-entity" label="Entity name">
            <Input
              id="calc-rpo-entity"
              value={entityName}
              onChange={(event) => setEntityName(event.target.value)}
              className="rounded-lg border-input bg-background"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="calc-rpo-category" label="Entity category">
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as RpoEntityCategory)}
              >
                <SelectTrigger
                  id="calc-rpo-category"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="calc-rpo-state" label="State">
              <Select value={state} onValueChange={setState}>
                <SelectTrigger
                  id="calc-rpo-state"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="calc-rpo-year" label="Compliance year">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger
                  id="calc-rpo-year"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((item) => (
                    <SelectItem key={item} value={item}>
                      FY {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="calc-rpo-obligation" label="Obligation category">
              <Select
                value={obligation}
                onValueChange={(value) =>
                  setObligation(value as RpoObligationCategory)
                }
              >
                <SelectTrigger
                  id="calc-rpo-obligation"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OBLIGATIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="calc-rpo-consumption" label="Consumption">
              <Input
                id="calc-rpo-consumption"
                inputMode="decimal"
                value={consumption}
                onChange={(event) => setConsumption(event.target.value)}
                className="rounded-lg border-input bg-background"
              />
            </Field>
            <Field id="calc-rpo-unit" label="Unit">
              <Select
                value={unit}
                onValueChange={(value) => setUnit(value as "MWh" | "kWh")}
              >
                <SelectTrigger
                  id="calc-rpo-unit"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MWh">MWh</SelectItem>
                  <SelectItem value="kWh">kWh</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="calc-rpo-renewable" label="RE procured (MWh)">
              <Input
                id="calc-rpo-renewable"
                inputMode="decimal"
                value={renewable}
                onChange={(event) => setRenewable(event.target.value)}
                className="rounded-lg border-input bg-background"
              />
            </Field>
          </div>

          <Field
            id="calc-rpo-certificates"
            label="Eligible certificates / credits (MWh)"
            hint="Certificates only count up to the remaining requirement, so the same renewable energy cannot be counted twice."
          >
            <Input
              id="calc-rpo-certificates"
              inputMode="decimal"
              value={certificates}
              onChange={(event) => setCertificates(event.target.value)}
              className="rounded-lg border-input bg-background"
            />
          </Field>

          {validation && (
            <p className="text-sm text-destructive" role="alert">
              {validation}
            </p>
          )}

          <Button
            type="button"
            onClick={submit}
            disabled={action.loading || targets.loading}
            className="w-full rounded-full"
            data-ocid="calculations.rpo.calculate_button"
          >
            {action.loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Calculator className="size-4" aria-hidden="true" />
            )}
            Calculate compliance
          </Button>
        </>
      }
      result={
        action.error ? (
          <ErrorState
            title="Calculation unavailable"
            description={action.error.message}
            onRetry={submit}
          />
        ) : result ? (
          <ResultShell
            title={`${result.result.compliance_pct.toFixed(2)}% compliant`}
            source={{
              label: `${result.policy.framework} · v${result.policy.version}`,
              url: result.policy.source.url,
            }}
            onReset={() => action.reset()}
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <StatusBadge
                tone={
                  result.result.status === "shortfall"
                    ? "danger"
                    : result.result.status === "surplus"
                      ? "success"
                      : "primary"
                }
              >
                {result.result.status}
              </StatusBadge>
              <StatusBadge tone="neutral">
                Target {result.target.percent}%
              </StatusBadge>
              <StatusBadge tone={result.target.verified ? "success" : "warning"}>
                {result.target.verified ? "Notified target" : "Unverified target"}
              </StatusBadge>
            </div>
            <ResultRow
              label="Required renewable energy"
              value={`${inr.format(result.target.required_mwh)} MWh`}
            />
            <ResultRow
              label="Eligible procurement"
              value={`${inr.format(result.eligible.total_mwh)} MWh`}
            />
            <ResultRow
              label="Shortfall"
              value={`${inr.format(result.result.shortfall_mwh)} MWh`}
              tone={result.result.shortfall_mwh > 0 ? "negative" : "default"}
            />
            <ResultRow
              label="Surplus"
              value={`${inr.format(result.result.surplus_mwh)} MWh`}
              tone={result.result.surplus_mwh > 0 ? "positive" : "default"}
            />
            <ResultRow
              label="Certificates counted"
              value={`${inr.format(result.eligible.certificates_mwh)} MWh`}
            />
            {result.notes.map((note) => (
              <p
                key={note}
                className="mt-3 flex gap-2 text-xs leading-relaxed text-muted-foreground"
              >
                <AlertTriangle
                  className="mt-0.5 size-3.5 shrink-0 text-warning"
                  aria-hidden="true"
                />
                {note}
              </p>
            ))}
          </ResultShell>
        ) : (
          <EmptyState
            title="Enter your obligation"
            description="Consumption, procurement and certificates produce a compliance position against the notified target."
          />
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 2. Solar ROI                                                        */
/* ------------------------------------------------------------------ */

function SolarCalculator() {
  const [state, setState] = useState("Karnataka");
  const [city, setCity] = useState("Bengaluru");
  const [bill, setBill] = useState("3000");
  const [consumption, setConsumption] = useState("320");
  const [tariff, setTariff] = useState("8.2");
  const [roof, setRoof] = useState("400");
  const [category, setCategory] = useState<"residential" | "commercial">(
    "residential",
  );
  const [systemType, setSystemType] = useState<"ongrid" | "offgrid" | "hybrid">(
    "ongrid",
  );
  const [validation, setValidation] = useState<string | null>(null);

  const action = useApiAction(async () =>
    urjaApi.solarCalculate({
      state,
      city,
      monthly_bill: numberValue(bill),
      monthly_consumption_kwh: numberValue(consumption),
      tariff: numberValue(tariff),
      roof_area_sqft: numberValue(roof),
      consumer_category: category,
      system_type: systemType,
    }),
  );

  const result = action.data as SolarCalculationResponse | null;

  function submit() {
    if (!numberValue(consumption) && !numberValue(bill) && !numberValue(roof)) {
      setValidation("Provide consumption, bill or roof area so the system can be sized.");
      return;
    }
    setValidation(null);
    void action.run(undefined as never);
  }

  return (
    <CalculatorFrame
      eyebrow="Rooftop solar"
      title="Solar ROI calculator"
      description="Sizes a rooftop system from consumption and roof area, then applies the configured cost, degradation, tariff and PM Surya Ghar subsidy rules."
      formula="Size = min(annual consumption ÷ specific yield, roof area ÷ sq ft per kW) · Savings = self-consumed kWh × tariff + export credit · Payback = net investment ÷ annual savings"
      form={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="calc-solar-state" label="State">
              <Select value={state} onValueChange={setState}>
                <SelectTrigger
                  id="calc-solar-state"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="calc-solar-city" label="City">
              <Input
                id="calc-solar-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="rounded-lg border-input bg-background"
              />
            </Field>
            <Field id="calc-solar-bill" label="Monthly bill (₹)">
              <Input
                id="calc-solar-bill"
                inputMode="decimal"
                value={bill}
                onChange={(event) => setBill(event.target.value)}
                className="rounded-lg border-input bg-background"
              />
            </Field>
            <Field id="calc-solar-consumption" label="Monthly consumption (kWh)">
              <Input
                id="calc-solar-consumption"
                inputMode="decimal"
                value={consumption}
                onChange={(event) => setConsumption(event.target.value)}
                className="rounded-lg border-input bg-background"
              />
            </Field>
            <Field id="calc-solar-tariff" label="Tariff (₹/kWh)">
              <Input
                id="calc-solar-tariff"
                inputMode="decimal"
                value={tariff}
                onChange={(event) => setTariff(event.target.value)}
                className="rounded-lg border-input bg-background"
              />
            </Field>
            <Field id="calc-solar-roof" label="Roof area (sq ft)">
              <Input
                id="calc-solar-roof"
                inputMode="decimal"
                value={roof}
                onChange={(event) => setRoof(event.target.value)}
                className="rounded-lg border-input bg-background"
              />
            </Field>
            <Field id="calc-solar-category" label="Consumer category">
              <Select
                value={category}
                onValueChange={(value) =>
                  setCategory(value as "residential" | "commercial")
                }
              >
                <SelectTrigger
                  id="calc-solar-category"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="calc-solar-type" label="System type">
              <Select
                value={systemType}
                onValueChange={(value) =>
                  setSystemType(value as "ongrid" | "offgrid" | "hybrid")
                }
              >
                <SelectTrigger
                  id="calc-solar-type"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongrid">On-grid</SelectItem>
                  <SelectItem value="offgrid">Off-grid</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {validation && (
            <p className="text-sm text-destructive" role="alert">
              {validation}
            </p>
          )}

          <Button
            type="button"
            onClick={submit}
            disabled={action.loading}
            className="w-full rounded-full"
            data-ocid="calculations.solar.calculate_button"
          >
            {action.loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sun className="size-4" aria-hidden="true" />
            )}
            Calculate solar ROI
          </Button>
        </>
      }
      result={
        action.error ? (
          <ErrorState
            title="Calculation unavailable"
            description={action.error.message}
            onRetry={submit}
          />
        ) : result ? (
          <ResultShell
            title={`${result.sizing.recommended_capacity_kw} kW recommended`}
            source={{
              label: `${result.subsidy_source.scheme} · verified ${result.subsidy_source.last_verified}`,
              url: result.subsidy_source.source_url,
            }}
            onReset={() => action.reset()}
          >
            <ResultRow
              label="Estimated annual generation"
              value={`${inr.format(result.returns.annual_generation_kwh)} kWh`}
            />
            <ResultRow
              label="Installation cost"
              value={`₹${inr.format(result.cost.install_cost_inr)}`}
            />
            <ResultRow
              label="Estimated subsidy"
              value={`₹${inr.format(result.cost.subsidy_estimate_inr)}`}
            />
            <ResultRow
              label="Net investment"
              value={`₹${inr.format(result.cost.net_investment_inr)}`}
            />
            <ResultRow
              label="Annual savings"
              value={`₹${inr.format(result.returns.annual_savings_inr)}`}
              tone="positive"
            />
            <ResultRow
              label="Payback"
              value={
                result.returns.payback_years
                  ? `${result.returns.payback_years.toFixed(1)} years`
                  : "—"
              }
            />
            <ResultRow
              label={`Lifetime savings (${result.returns.lifetime_years} yr)`}
              value={`₹${inr.format(result.returns.lifetime_savings_inr)}`}
            />
            <ResultRow
              label="CO₂ avoided per year"
              value={`${result.returns.co2_avoided_tonnes_per_year} t`}
            />
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {result.cost.subsidy_note}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {result.disclaimer}
            </p>
          </ResultShell>
        ) : (
          <EmptyState
            title="Estimate a rooftop system"
            description="Results include generation, subsidy, payback, lifetime savings and avoided emissions."
          />
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 3. Renewable contribution                                           */
/* ------------------------------------------------------------------ */

function ContributionCalculator() {
  const [total, setTotal] = useState("1000");
  const [renewable, setRenewable] = useState("350");
  const [nonFossil, setNonFossil] = useState("400");
  const [validation, setValidation] = useState<string | null>(null);

  const action = useApiAction(async () =>
    urjaApi.energyContribution({
      total_mwh: Number(total),
      renewable_mwh: Number(renewable),
      non_fossil_mwh: nonFossil.trim() ? Number(nonFossil) : null,
    }),
  );

  const result = action.data;

  function submit() {
    const totalValue = numberValue(total);
    const renewableValue = numberValue(renewable);
    if (!totalValue || totalValue <= 0) {
      setValidation("Total energy must be greater than zero.");
      return;
    }
    if (renewableValue === null || renewableValue < 0) {
      setValidation("Renewable energy must be zero or more.");
      return;
    }
    if (renewableValue > totalValue) {
      setValidation("Renewable energy cannot exceed total energy.");
      return;
    }
    setValidation(null);
    void action.run(undefined as never);
  }

  return (
    <CalculatorFrame
      eyebrow="Energy mix"
      title="Renewable energy contribution"
      description="Computes the renewable and non-fossil share of a supplied energy quantity. Shares are measured in MWh, never in installed capacity."
      formula="Renewable share = Renewable MWh ÷ Total MWh × 100 · Non-fossil share = Non-fossil MWh ÷ Total MWh × 100"
      form={
        <>
          <Field id="calc-contribution-total" label="Total energy (MWh)">
            <Input
              id="calc-contribution-total"
              inputMode="decimal"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              className="rounded-lg border-input bg-background"
            />
          </Field>
          <Field id="calc-contribution-renewable" label="Renewable energy (MWh)">
            <Input
              id="calc-contribution-renewable"
              inputMode="decimal"
              value={renewable}
              onChange={(event) => setRenewable(event.target.value)}
              className="rounded-lg border-input bg-background"
            />
          </Field>
          <Field
            id="calc-contribution-nonfossil"
            label="Non-fossil energy (MWh)"
            hint="Optional. Includes nuclear and large hydro in addition to renewables."
          >
            <Input
              id="calc-contribution-nonfossil"
              inputMode="decimal"
              value={nonFossil}
              onChange={(event) => setNonFossil(event.target.value)}
              className="rounded-lg border-input bg-background"
            />
          </Field>
          {validation && (
            <p className="text-sm text-destructive" role="alert">
              {validation}
            </p>
          )}
          <Button
            type="button"
            onClick={submit}
            disabled={action.loading}
            className="w-full rounded-full"
          >
            {action.loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Percent className="size-4" aria-hidden="true" />
            )}
            Calculate share
          </Button>
        </>
      }
      result={
        action.error ? (
          <ErrorState
            title="Calculation unavailable"
            description={action.error.message}
            onRetry={submit}
          />
        ) : result ? (
          <ResultShell
            title={`${result.result.renewable_share_pct}% renewable`}
            source={{
              label: "Computed from the values supplied in this request",
            }}
            onReset={() => action.reset()}
          >
            <ResultRow
              label="Renewable share"
              value={`${result.result.renewable_share_pct}%`}
              tone="positive"
            />
            <ResultRow
              label="Non-fossil share"
              value={
                result.result.non_fossil_share_pct === null
                  ? "Not supplied"
                  : `${result.result.non_fossil_share_pct}%`
              }
            />
            <ResultRow
              label="Fossil energy"
              value={`${inr.format(result.result.fossil_mwh)} MWh`}
            />
          </ResultShell>
        ) : (
          <EmptyState
            title="Enter an energy mix"
            description="Every input is treated as energy (MWh); capacity (MW) is not accepted here."
          />
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 4. Carbon avoidance                                                 */
/* ------------------------------------------------------------------ */

function CarbonCalculator() {
  const [energy, setEnergy] = useState("1000");
  const [unit, setUnit] = useState<"MWh" | "kWh">("MWh");
  const [factor, setFactor] = useState<"grid" | "coal" | "gas" | "diesel">(
    "grid",
  );
  const [validation, setValidation] = useState<string | null>(null);

  const action = useApiAction(async () =>
    urjaApi.carbonCalculate({
      energy_mwh: Number(energy),
      unit,
      emission_factor_source: factor,
    }),
  );

  const result = action.data;

  function submit() {
    const value = numberValue(energy);
    if (value === null || value < 0) {
      setValidation("Energy must be zero or more.");
      return;
    }
    setValidation(null);
    void action.run(undefined as never);
  }

  return (
    <CalculatorFrame
      eyebrow="Environmental impact"
      title="Carbon emission avoidance"
      description="Converts a clean-energy quantity into avoided CO₂ using the configured CEA planning factor. This is an estimate, not a measured emission reduction."
      formula="CO₂ avoided = Energy (kWh) × Emission factor (kg CO₂/kWh)"
      form={
        <>
          <Field id="calc-carbon-energy" label="Clean energy">
            <Input
              id="calc-carbon-energy"
              inputMode="decimal"
              value={energy}
              onChange={(event) => setEnergy(event.target.value)}
              className="rounded-lg border-input bg-background"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="calc-carbon-unit" label="Unit">
              <Select
                value={unit}
                onValueChange={(value) => setUnit(value as "MWh" | "kWh")}
              >
                <SelectTrigger
                  id="calc-carbon-unit"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MWh">MWh</SelectItem>
                  <SelectItem value="kWh">kWh</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="calc-carbon-factor" label="Displaced generation">
              <Select
                value={factor}
                onValueChange={(value) =>
                  setFactor(value as "grid" | "coal" | "gas" | "diesel")
                }
              >
                <SelectTrigger
                  id="calc-carbon-factor"
                  className="rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Indian grid (combined margin)</SelectItem>
                  <SelectItem value="coal">Coal</SelectItem>
                  <SelectItem value="gas">Natural gas</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          {validation && (
            <p className="text-sm text-destructive" role="alert">
              {validation}
            </p>
          )}
          <Button
            type="button"
            onClick={submit}
            disabled={action.loading}
            className="w-full rounded-full"
          >
            {action.loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Leaf className="size-4" aria-hidden="true" />
            )}
            Calculate avoided emissions
          </Button>
        </>
      }
      result={
        action.error ? (
          <ErrorState
            title="Calculation unavailable"
            description={action.error.message}
            onRetry={submit}
          />
        ) : result ? (
          <ResultShell
            title={`${inr.format(result.result.co2_avoided_tonnes)} t CO₂ avoided`}
            source={{
              label: result.factor.source_name,
              url: result.factor.source_url,
            }}
            onReset={() => action.reset()}
          >
            <ResultRow
              label="Avoided emissions"
              value={`${inr.format(result.result.co2_avoided_kg)} kg`}
              tone="positive"
            />
            <ResultRow
              label="Emission factor used"
              value={`${result.factor.kg_co2_per_kwh} kg CO₂/kWh`}
            />
            <ResultRow
              label="Equivalent trees per year"
              value={inr.format(result.result.equivalent_trees_per_year)}
            />
            {result.notes.map((note) => (
              <p key={note} className="mt-3 text-xs text-muted-foreground">
                {note}
              </p>
            ))}
          </ResultShell>
        ) : (
          <EmptyState
            title="Estimate avoided emissions"
            description="Pick the generation the clean energy displaces to see the avoided CO₂."
          />
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 5. Renewable requirement                                            */
/* ------------------------------------------------------------------ */

function RequirementCalculator() {
  const [total, setTotal] = useState("10000");
  const [target, setTarget] = useState("30");
  const [existing, setExisting] = useState("2100");
  const [validation, setValidation] = useState<string | null>(null);

  const action = useApiAction(async () =>
    urjaApi.energyRequirement({
      total_mwh: Number(total),
      target_pct: Number(target),
      existing_renewable_mwh: Number(existing || 0),
    }),
  );

  const result = action.data;

  function submit() {
    const totalValue = numberValue(total);
    const targetValue = numberValue(target);
    if (!totalValue || totalValue <= 0) {
      setValidation("Total energy must be greater than zero.");
      return;
    }
    if (targetValue === null || targetValue < 0 || targetValue > 100) {
      setValidation("Target share must be between 0 and 100.");
      return;
    }
    setValidation(null);
    void action.run(undefined as never);
  }

  return (
    <CalculatorFrame
      eyebrow="Planning"
      title="Renewable energy requirement"
      description="Turns a target share into the renewable energy quantity required, and the remaining gap against existing procurement."
      formula="Required = Total MWh × Target % · Remaining = max(0, Required − Existing renewable MWh)"
      form={
        <>
          <Field id="calc-requirement-total" label="Total energy (MWh)">
            <Input
              id="calc-requirement-total"
              inputMode="decimal"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              className="rounded-lg border-input bg-background"
            />
          </Field>
          <Field id="calc-requirement-target" label="Target share (%)">
            <Input
              id="calc-requirement-target"
              inputMode="decimal"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              className="rounded-lg border-input bg-background"
            />
          </Field>
          <Field
            id="calc-requirement-existing"
            label="Existing renewable energy (MWh)"
          >
            <Input
              id="calc-requirement-existing"
              inputMode="decimal"
              value={existing}
              onChange={(event) => setExisting(event.target.value)}
              className="rounded-lg border-input bg-background"
            />
          </Field>
          {validation && (
            <p className="text-sm text-destructive" role="alert">
              {validation}
            </p>
          )}
          <Button
            type="button"
            onClick={submit}
            disabled={action.loading}
            className="w-full rounded-full"
          >
            {action.loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Zap className="size-4" aria-hidden="true" />
            )}
            Calculate requirement
          </Button>
        </>
      }
      result={
        action.error ? (
          <ErrorState
            title="Calculation unavailable"
            description={action.error.message}
            onRetry={submit}
          />
        ) : result ? (
          <ResultShell
            title={
              result.result.met
                ? "Requirement already met"
                : `${inr.format(result.result.remaining_requirement_mwh)} MWh remaining`
            }
            source={{ label: "Computed from the target share you supplied" }}
            onReset={() => action.reset()}
          >
            <div className="mb-4 flex items-center gap-2">
              <StatusBadge tone={result.result.met ? "success" : "warning"}>
                {result.result.met ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3" aria-hidden="true" /> Met
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CloudOff className="size-3" aria-hidden="true" /> Gap
                  </span>
                )}
              </StatusBadge>
            </div>
            <ResultRow
              label="Required renewable energy"
              value={`${inr.format(result.result.required_renewable_mwh)} MWh`}
            />
            <ResultRow
              label="Achieved share"
              value={`${result.result.achieved_share_pct}%`}
            />
            <ResultRow
              label="Remaining requirement"
              value={`${inr.format(result.result.remaining_requirement_mwh)} MWh`}
              tone={result.result.met ? "positive" : "negative"}
            />
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              The target share is the value you entered. Check it against the
              applicable notified obligation before using this as a compliance figure.
            </p>
          </ResultShell>
        ) : (
          <EmptyState
            title="Plan a renewable target"
            description="Enter a total energy quantity and a share to see the requirement it implies."
          />
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function EnergyCalculationsPage() {
  return (
    <PageFrame>
      <SectionHeading
        eyebrow="Energy calculations"
        title="Calculators"
        description="Five calculators, each backed by the FastAPI calculation services: RPO compliance, solar ROI, renewable contribution, avoided emissions and renewable requirement."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="primary">
              <span className="flex items-center gap-1">
                <TrendingUp className="size-3" aria-hidden="true" /> Backend
                calculated
              </span>
            </StatusBadge>
          </div>
        }
      />

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Every result below is produced by the Python backend, not by the browser.
        Where a policy value is required, the backend uses its versioned,
        source-attributed policy file and refuses to guess a missing target.
      </p>

      <Tabs defaultValue="rpo" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-full bg-muted/60 p-1.5">
          <TabsTrigger value="rpo" className="rounded-full px-4 py-2">
            <Percent className="mr-1.5 size-3.5" aria-hidden="true" />
            RPO compliance
          </TabsTrigger>
          <TabsTrigger value="solar" className="rounded-full px-4 py-2">
            <Sun className="mr-1.5 size-3.5" aria-hidden="true" />
            Solar ROI
          </TabsTrigger>
          <TabsTrigger value="contribution" className="rounded-full px-4 py-2">
            <TrendingUp className="mr-1.5 size-3.5" aria-hidden="true" />
            Renewable share
          </TabsTrigger>
          <TabsTrigger value="carbon" className="rounded-full px-4 py-2">
            <Leaf className="mr-1.5 size-3.5" aria-hidden="true" />
            CO₂ avoidance
          </TabsTrigger>
          <TabsTrigger value="requirement" className="rounded-full px-4 py-2">
            <TrendingDown className="mr-1.5 size-3.5" aria-hidden="true" />
            RE requirement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rpo" className="mt-6">
          <RpoCalculator />
        </TabsContent>
        <TabsContent value="solar" className="mt-6">
          <SolarCalculator />
        </TabsContent>
        <TabsContent value="contribution" className="mt-6">
          <ContributionCalculator />
        </TabsContent>
        <TabsContent value="carbon" className="mt-6">
          <CarbonCalculator />
        </TabsContent>
        <TabsContent value="requirement" className="mt-6">
          <RequirementCalculator />
        </TabsContent>
      </Tabs>
    </PageFrame>
  );
}
