import { PageFrame, SampleTag, StatusBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  KeyRound,
  Lock,
  Play,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Static sample content — design only, no network calls               */
/* ------------------------------------------------------------------ */

type HttpMethod = "GET" | "POST";

interface EndpointDef {
  id: string;
  method: HttpMethod;
  path: string;
  name: string;
  description: string;
  status: number;
  statusText: string;
  group: string;
  source: string;
  period: string;
  request: string;
  response: string;
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: "energy-mix",
    method: "GET",
    path: "/api/v1/energy/mix",
    name: "Energy Mix",
    description:
      "Returns the national generation mix by source for the latest reporting interval, with installed capacity and share of total generation.",
    status: 200,
    statusText: "OK",
    group: "Energy",
    source: "CEA Installed Capacity & Generation Reports",
    period: "Reporting period: Oct 2026 (monthly)",
    request: `curl -X GET "https://api.urja.gov.in/api/v1/energy/mix?region=national" \\
  -H "Accept: application/json"`,
    response: `{
  "region": "national",
  "unit": "MW",
  "generated_at": "2026-11-12T06:00:00Z",
  "mix": [
    { "source": "coal", "capacity_mw": 218400, "share_pct": 46.2 },
    { "source": "solar", "capacity_mw": 94100, "share_pct": 19.9 },
    { "source": "wind", "capacity_mw": 48200, "share_pct": 10.2 },
    { "source": "hydro", "capacity_mw": 46900, "share_pct": 9.9 },
    { "source": "gas", "capacity_mw": 24800, "share_pct": 5.2 },
    { "source": "nuclear", "capacity_mw": 8180, "share_pct": 1.7 },
    { "source": "other", "capacity_mw": 32400, "share_pct": 6.9 }
  ],
  "demo_data": true
}`,
  },
  {
    id: "energy-states",
    method: "GET",
    path: "/api/v1/energy/states",
    name: "State Energy Indicators",
    description:
      "Returns a consolidated set of energy indicators for every state and union territory, including demand, renewable share and grid frequency.",
    status: 200,
    statusText: "OK",
    group: "Energy",
    source: "CEA & State Load Despatch Centres",
    period: "Reporting period: Oct 2026 (monthly)",
    request: `curl -X GET "https://api.urja.gov.in/api/v1/energy/states?limit=3" \\
  -H "Accept: application/json"`,
    response: `{
  "count": 36,
  "unit": "MW",
  "generated_at": "2026-11-12T06:00:00Z",
  "states": [
    { "code": "MH", "name": "Maharashtra", "demand_mw": 28400, "renewable_share_pct": 31.4, "frequency_hz": 49.98 },
    { "code": "GJ", "name": "Gujarat", "demand_mw": 21900, "renewable_share_pct": 42.7, "frequency_hz": 50.01 },
    { "code": "KA", "name": "Karnataka", "demand_mw": 15600, "renewable_share_pct": 48.9, "frequency_hz": 49.97 }
  ],
  "demo_data": true
}`,
  },
  {
    id: "rpo-targets",
    method: "GET",
    path: "/api/v1/rpo/targets",
    name: "RPO Targets",
    description:
      "Returns the renewable purchase obligation trajectory by year, split across solar, non-solar and total obligation percentages.",
    status: 200,
    statusText: "OK",
    group: "RPO",
    source: "MNRE RPO Trajectory Notification",
    period: "Reporting period: FY 2024-25 to FY 2029-30",
    request: `curl -X GET "https://api.urja.gov.in/api/v1/rpo/targets?year=2026" \\
  -H "Accept: application/json"`,
    response: `{
  "unit": "percent",
  "generated_at": "2026-11-12T06:00:00Z",
  "targets": [
    { "year": "2024-25", "solar_pct": 8.5, "non_solar_pct": 16.5, "total_pct": 25.0 },
    { "year": "2025-26", "solar_pct": 9.5, "non_solar_pct": 17.5, "total_pct": 27.0 },
    { "year": "2026-27", "solar_pct": 10.5, "non_solar_pct": 18.5, "total_pct": 29.0 }
  ],
  "demo_data": true
}`,
  },
  {
    id: "rpo-calculate",
    method: "POST",
    path: "/api/v1/rpo/calculate",
    name: "RPO Compliance Calculator",
    description:
      "Accepts an obligated entity's consumption and procurement profile and returns the compliance position, gap and certificate requirement.",
    status: 200,
    statusText: "OK",
    group: "RPO",
    source: "Illustrative calculation model",
    period: "Reporting period: FY 2026-27",
    request: `curl -X POST "https://api.urja.gov.in/api/v1/rpo/calculate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "entity": "DISCOM-North",
    "consumption_mwh": 1250000,
    "solar_procured_mwh": 98000,
    "non_solar_procured_mwh": 172000,
    "year": "2026-27"
  }'`,
    response: `{
  "entity": "DISCOM-North",
  "year": "2026-27",
  "obligation_pct": 29.0,
  "obligation_mwh": 362500,
  "procured_mwh": 270000,
  "gap_mwh": 92500,
  "certificates_required": 925,
  "status": "shortfall",
  "demo_data": true
}`,
  },
  {
    id: "solar-calculate",
    method: "POST",
    path: "/api/v1/solar/calculate",
    name: "Rooftop Solar ROI",
    description:
      "Accepts a rooftop system specification and tariff assumptions and returns the payback period, lifetime savings and CO₂ avoided.",
    status: 200,
    statusText: "OK",
    group: "Solar",
    source: "Illustrative ROI model",
    period: "Reporting period: FY 2026-27",
    request: `curl -X POST "https://api.urja.gov.in/api/v1/solar/calculate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "capacity_kw": 10,
    "capex_inr": 520000,
    "tariff_inr_per_kwh": 8.4,
    "state": "Maharashtra"
  }'`,
    response: `{
  "capacity_kw": 10,
  "annual_generation_kwh": 14600,
  "annual_savings_inr": 122640,
  "payback_years": 4.2,
  "lifetime_savings_inr": 2452800,
  "co2_avoided_tonnes_per_year": 11.8,
  "demo_data": true
}`,
  },
  {
    id: "jobs",
    method: "GET",
    path: "/api/v1/jobs",
    name: "Green Jobs Board",
    description:
      "Returns open green-energy job listings with role, employer, location, sector and salary band for the current reporting window.",
    status: 200,
    statusText: "OK",
    group: "Jobs",
    source: "Aggregated illustrative listings",
    period: "Reporting period: Nov 2026 (weekly)",
    request: `curl -X GET "https://api.urja.gov.in/api/v1/jobs?sector=solar&limit=3" \\
  -H "Accept: application/json"`,
    response: `{
  "count": 1284,
  "generated_at": "2026-11-12T06:00:00Z",
  "jobs": [
    { "id": "JOB-1042", "title": "Solar PV Installer", "employer": "SunGrid Energy", "location": "Pune, MH", "sector": "solar", "salary_band_inr": "3.6-5.4 LPA" },
    { "id": "JOB-1043", "title": "Wind Turbine Technician", "employer": "AeroWatt", "location": "Tirunelveli, TN", "sector": "wind", "salary_band_inr": "4.2-6.0 LPA" },
    { "id": "JOB-1044", "title": "Grid Analyst", "employer": "StateGrid Co.", "location": "Bengaluru, KA", "sector": "grid", "salary_band_inr": "8.0-12.0 LPA" }
  ],
  "demo_data": true
}`,
  },
  {
    id: "finance",
    method: "GET",
    path: "/api/v1/finance",
    name: "Green Finance Instruments",
    description:
      "Returns green finance instruments with indicative interest rates, tenures, minimum ticket sizes and eligible project categories.",
    status: 200,
    statusText: "OK",
    group: "Finance",
    source: "Illustrative lender disclosures",
    period: "Reporting period: Q3 FY 2026-27",
    request: `curl -X GET "https://api.urja.gov.in/api/v1/finance?category=solar" \\
  -H "Accept: application/json"`,
    response: `{
  "count": 24,
  "generated_at": "2026-11-12T06:00:00Z",
  "instruments": [
    { "id": "FIN-201", "name": "Rooftop Solar Term Loan", "lender": "Bharat Green Bank", "rate_pct": 8.9, "tenure_years": 10, "min_ticket_inr": 500000 },
    { "id": "FIN-202", "name": "Utility Solar Project Finance", "lender": "National Infra Capital", "rate_pct": 9.6, "tenure_years": 15, "min_ticket_inr": 50000000 }
  ],
  "demo_data": true
}`,
  },
  {
    id: "circularity-recyclers",
    method: "GET",
    path: "/api/v1/circularity/recyclers",
    name: "Recycler Directory",
    description:
      "Returns registered recyclers and handlers with material categories, licensed capacity and location for circular-economy routing.",
    status: 200,
    statusText: "OK",
    group: "Circularity",
    source: "CPCB Registered Recyclers Directory",
    period: "Reporting period: Oct 2026 (monthly)",
    request: `curl -X GET "https://api.urja.gov.in/api/v1/circularity/recyclers?material=solar_pv" \\
  -H "Accept: application/json"`,
    response: `{
  "count": 312,
  "generated_at": "2026-11-12T06:00:00Z",
  "recyclers": [
    { "id": "REC-88", "name": "EcoVolt Recycling", "materials": ["solar_pv", "battery"], "capacity_tpa": 12000, "location": "Ahmedabad, GJ" },
    { "id": "REC-89", "name": "GreenLoop Metals", "materials": ["turbine_blade", "steel"], "capacity_tpa": 8400, "location": "Chennai, TN" }
  ],
  "demo_data": true
}`,
  },
  {
    id: "environment",
    method: "GET",
    path: "/api/v1/environment",
    name: "Environmental Impact",
    description:
      "Returns environmental impact indicators including CO₂ avoided, air-quality index and water savings attributable to renewable generation.",
    status: 200,
    statusText: "OK",
    group: "Environment",
    source: "CPCB & CEA Environmental Reports",
    period: "Reporting period: Oct 2026 (monthly)",
    request: `curl -X GET "https://api.urja.gov.in/api/v1/environment?region=national" \\
  -H "Accept: application/json"`,
    response: `{
  "region": "national",
  "generated_at": "2026-11-12T06:00:00Z",
  "indicators": {
    "co2_avoided_mt": 184.6,
    "aqi_average": 118,
    "water_saved_mm3": 42.3,
    "so2_reduced_kt": 96.4
  },
  "demo_data": true
}`,
  },
  {
    id: "forecast",
    method: "POST",
    path: "/api/v1/forecast",
    name: "Demand & Generation Forecast",
    description:
      "Accepts a region and horizon and returns an hourly day-ahead demand and renewable generation forecast with confidence bands.",
    status: 200,
    statusText: "OK",
    group: "Forecast",
    source: "Illustrative forecasting model",
    period: "Reporting period: 12 Nov 2026 (day-ahead)",
    request: `curl -X POST "https://api.urja.gov.in/api/v1/forecast" \\
  -H "Content-Type: application/json" \\
  -d '{
    "region": "national",
    "horizon": "24h",
    "granularity": "hourly"
  }'`,
    response: `{
  "region": "national",
  "horizon": "24h",
  "unit": "MW",
  "generated_at": "2026-11-12T06:00:00Z",
  "forecast": [
    { "interval": "2026-11-12T07:00:00Z", "demand": 182110, "lower": 178400, "upper": 186900 },
    { "interval": "2026-11-12T08:00:00Z", "demand": 189640, "lower": 185100, "upper": 194300 },
    { "interval": "2026-11-12T09:00:00Z", "demand": 194220, "lower": 189700, "upper": 199100 }
  ],
  "demo_data": true
}`,
  },
  {
    id: "stakeholders-role",
    method: "GET",
    path: "/api/v1/stakeholders/{role}",
    name: "Stakeholder Portal Data",
    description:
      "Returns the portal payload for a stakeholder role — citizen, entity, policymaker, finance or circular — with role-specific metrics.",
    status: 200,
    statusText: "OK",
    group: "Stakeholders",
    source: "Illustrative role-based views",
    period: "Reporting period: Oct 2026 (monthly)",
    request: `curl -X GET "https://api.urja.gov.in/api/v1/stakeholders/policymaker" \\
  -H "Accept: application/json"`,
    response: `{
  "role": "policymaker",
  "generated_at": "2026-11-12T06:00:00Z",
  "metrics": [
    { "label": "Installed renewable capacity", "value": 189200, "unit": "MW" },
    { "label": "Renewable share of generation", "value": 24.6, "unit": "percent" },
    { "label": "RPO compliance rate", "value": 91.4, "unit": "percent" }
  ],
  "demo_data": true
}`,
  },
];

const GROUPS = Array.from(new Set(ENDPOINTS.map((endpoint) => endpoint.group)));

const REGIONS = [
  { value: "national", label: "National (all regions)" },
  { value: "northern", label: "Northern Region" },
  { value: "western", label: "Western Region" },
  { value: "southern", label: "Southern Region" },
  { value: "eastern", label: "Eastern Region" },
  { value: "north-eastern", label: "North-Eastern Region" },
];

const HORIZONS = [
  { value: "24h", label: "24 hours" },
  { value: "48h", label: "48 hours" },
  { value: "72h", label: "72 hours" },
  { value: "7d", label: "7 days" },
];

const GRANULARITIES = [
  { value: "15m", label: "15 minutes" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
];

const ERROR_CODES = [
  {
    code: "400",
    title: "Bad Request",
    description: "A required parameter is missing or malformed.",
  },
  {
    code: "401",
    title: "Unauthorized",
    description: "The API key is missing, expired or not recognised.",
  },
  {
    code: "403",
    title: "Forbidden",
    description: "The key does not have access to the requested resource.",
  },
  {
    code: "404",
    title: "Not Found",
    description: "The requested state, role or resource does not exist.",
  },
  {
    code: "429",
    title: "Rate Limited",
    description: "The request quota for the key has been exceeded.",
  },
  {
    code: "503",
    title: "Service Unavailable",
    description: "The data pipeline is temporarily unavailable.",
  },
];

/* ------------------------------------------------------------------ */
/* Small local building blocks                                         */
/* ------------------------------------------------------------------ */

const METHOD_TONES: Record<HttpMethod, string> = {
  GET: "border-primary/25 bg-primary/10 text-primary",
  POST: "border-accent/40 bg-accent/15 text-accent-foreground",
};

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em]",
        METHOD_TONES[method],
      )}
    >
      {method}
    </Badge>
  );
}

function CodeBlock({
  code,
  label,
  className,
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-border bg-[oklch(0.2_0.02_292)]",
        className,
      )}
    >
      {label && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">
            {label}
          </span>
          <Terminal className="size-3.5 text-white/40" aria-hidden="true" />
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed text-[oklch(0.9_0.02_85)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CopyButton({
  value,
  ocid,
  className,
}: {
  value: string;
  ocid: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(value).catch(() => undefined);
    }
  };

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-white/70 transition-smooth hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Overview cards                                                      */
/* ------------------------------------------------------------------ */

function OverviewCard({ endpoint }: { endpoint: EndpointDef }) {
  return (
    <Card
      data-ocid={`api.overview.card.${endpoint.id}`}
      className="flex flex-col rounded-[18px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
          {endpoint.name}
        </h3>
        <StatusBadge tone="success">{endpoint.status}</StatusBadge>
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {endpoint.description}
      </p>
      <div className="mt-5 flex items-center gap-2">
        <MethodBadge method={endpoint.method} />
        <code className="min-w-0 truncate font-mono text-xs text-muted-foreground">
          {endpoint.path}
        </code>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Request builder — region selector and illustrative parameters       */
/* ------------------------------------------------------------------ */

function RequestBuilder({ endpoint }: { endpoint: EndpointDef }) {
  const [region, setRegion] = useState("national");
  const [horizon, setHorizon] = useState("24h");
  const [granularity, setGranularity] = useState("hourly");
  const [startDate, setStartDate] = useState("2026-11-12");
  const [endDate, setEndDate] = useState("2026-11-13");
  const [includeConfidence, setIncludeConfidence] = useState(true);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="size-4 text-primary"
            aria-hidden="true"
          />
          <h4 className="font-display text-lg font-semibold text-foreground">
            Request builder
          </h4>
          <SampleTag />
        </div>
        <code className="min-w-0 truncate font-mono text-xs text-muted-foreground">
          {endpoint.path}
        </code>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="api-region" className="text-xs font-medium">
            Region
          </Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger
              id="api-region"
              data-ocid="api.request.region_select"
              className="rounded-xl"
            >
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="api-horizon" className="text-xs font-medium">
            Forecast horizon
          </Label>
          <Select value={horizon} onValueChange={setHorizon}>
            <SelectTrigger
              id="api-horizon"
              data-ocid="api.request.horizon_select"
              className="rounded-xl"
            >
              <SelectValue placeholder="Select horizon" />
            </SelectTrigger>
            <SelectContent>
              {HORIZONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="api-start" className="text-xs font-medium">
            Start date
          </Label>
          <Input
            id="api-start"
            type="date"
            data-ocid="api.request.start_date_input"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-xl font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="api-end" className="text-xs font-medium">
            End date
          </Label>
          <Input
            id="api-end"
            type="date"
            data-ocid="api.request.end_date_input"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-xl font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="api-granularity" className="text-xs font-medium">
            Granularity
          </Label>
          <Select value={granularity} onValueChange={setGranularity}>
            <SelectTrigger
              id="api-granularity"
              data-ocid="api.request.granularity_select"
              className="rounded-xl"
            >
              <SelectValue placeholder="Select granularity" />
            </SelectTrigger>
            <SelectContent>
              {GRANULARITIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="api-state" className="text-xs font-medium">
            State (for state indicators)
          </Label>
          <Input
            id="api-state"
            data-ocid="api.request.state_input"
            defaultValue="Maharashtra"
            className="rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-border bg-muted/40 px-4 py-3">
        <label
          htmlFor="api-confidence"
          className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
        >
          <input
            id="api-confidence"
            type="checkbox"
            data-ocid="api.request.confidence_checkbox"
            checked={includeConfidence}
            onChange={(event) => setIncludeConfidence(event.target.checked)}
            className="size-4 rounded border-input accent-[oklch(0.52_0.19_292)]"
          />
          Include confidence bounds
        </label>
        <Button
          type="button"
          data-ocid="api.request.run_button"
          className="rounded-full bg-primary px-5 text-primary-foreground shadow-subtle transition-smooth hover:bg-primary/90"
        >
          <Play className="mr-2 size-4" aria-hidden="true" />
          Run request
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Illustrative control only — this prototype does not send a network
        request.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Endpoint detail — request, response, copy, test request             */
/* ------------------------------------------------------------------ */

function EndpointDetail({ endpoint }: { endpoint: EndpointDef }) {
  const [tested, setTested] = useState(false);

  return (
    <div className="min-w-0 space-y-6">
      <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <MethodBadge method={endpoint.method} />
              <code className="font-mono text-sm text-foreground">
                {endpoint.path}
              </code>
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground">
              {endpoint.name}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {endpoint.description}
            </p>
          </div>
          <StatusBadge tone="success">
            {endpoint.status} {endpoint.statusText}
          </StatusBadge>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
            <Database className="size-3.5 text-primary" aria-hidden="true" />
            {endpoint.source}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
            {endpoint.period}
          </span>
        </div>

        <Separator className="my-6" />

        <RequestBuilder endpoint={endpoint} />

        <Separator className="my-6" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-lg font-semibold text-foreground">
              Example request
            </h4>
            <SampleTag />
          </div>
          <Button
            type="button"
            data-ocid="api.request.test_button"
            onClick={() => setTested(true)}
            className="rounded-full bg-primary px-5 text-primary-foreground shadow-subtle transition-smooth hover:bg-primary/90"
          >
            <Play className="mr-2 size-4" aria-hidden="true" />
            Test request
          </Button>
        </div>

        <div className="relative mt-4">
          <CodeBlock label="cURL" code={endpoint.request} />
          <div className="absolute right-3 top-2">
            <CopyButton
              value={endpoint.request}
              ocid="api.request.copy_button"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Illustrative control only — this prototype does not send a network
          request.
        </p>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-lg font-semibold text-foreground">
            Example response
          </h4>
          <SampleTag />
        </div>
        <ResponsePreview endpoint={endpoint} tested={tested} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Response preview                                                    */
/* ------------------------------------------------------------------ */

function ResponsePreview({
  endpoint,
  tested,
}: {
  endpoint: EndpointDef;
  tested: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-[oklch(0.19_0.02_292)] shadow-elevated">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <StatusBadge
            tone="success"
            className="border-success/40 bg-success/15"
          >
            {endpoint.status} {endpoint.statusText}
          </StatusBadge>
          <span className="font-mono text-[11px] text-white/50">
            {tested ? "142 ms · sample payload" : "awaiting test request"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton
            value={endpoint.response}
            ocid="api.response.copy_button"
          />
          <button
            type="button"
            data-ocid="api.response.expand_button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-white/70 transition-smooth hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {expanded ? (
              <ChevronDown className="size-3.5" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-3.5" aria-hidden="true" />
            )}
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      <Tabs defaultValue="json" className="gap-0">
        <div className="flex items-center justify-between border-b border-white/10 px-4">
          <TabsList className="bg-transparent p-0">
            <TabsTrigger
              value="json"
              data-ocid="api.response.json_tab"
              className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/50 data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              JSON
            </TabsTrigger>
            <TabsTrigger
              value="headers"
              data-ocid="api.response.headers_tab"
              className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/50 data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              Headers
            </TabsTrigger>
          </TabsList>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 sm:inline">
            Demo data
          </span>
        </div>

        <TabsContent value="json" className="m-0">
          {expanded ? (
            <pre className="max-h-[420px] overflow-auto px-5 py-5 font-mono text-[12.5px] leading-relaxed text-[oklch(0.9_0.02_85)]">
              <code>{endpoint.response}</code>
            </pre>
          ) : (
            <p className="px-5 py-6 font-mono text-xs text-white/40">
              Response collapsed — expand to view the sample payload.
            </p>
          )}
        </TabsContent>

        <TabsContent value="headers" className="m-0">
          <pre className="max-h-[420px] overflow-auto px-5 py-5 font-mono text-[12.5px] leading-relaxed text-[oklch(0.9_0.02_85)]">
            <code>{`content-type: application/json; charset=utf-8
x-urja-demo-data: true
x-urja-source: ${endpoint.source}
x-urja-reporting-period: ${endpoint.period.replace("Reporting period: ", "")}
cache-control: no-store`}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Endpoint explorer                                                   */
/* ------------------------------------------------------------------ */

function EndpointExplorer() {
  const [activeId, setActiveId] = useState(ENDPOINTS[0].id);
  const active = ENDPOINTS.find((item) => item.id === activeId) ?? ENDPOINTS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card
        data-ocid="api.explorer.nav_panel"
        className="h-fit rounded-[18px] border-border bg-card p-3 shadow-subtle"
      >
        <p className="px-3 pb-2 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Endpoints
        </p>
        <nav className="space-y-3" aria-label="API endpoints">
          {GROUPS.map((group) => (
            <div key={group} className="space-y-1">
              <p className="px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                {group}
              </p>
              {ENDPOINTS.filter((endpoint) => endpoint.group === group).map(
                (endpoint) => {
                  const isActive = endpoint.id === activeId;
                  return (
                    <button
                      key={endpoint.id}
                      type="button"
                      data-ocid={`api.explorer.endpoint.${endpoint.id}`}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setActiveId(endpoint.id)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2.5 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-mono text-[10px] font-bold uppercase tracking-[0.1em]",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {endpoint.method}
                        </span>
                        <span className="truncate text-sm font-medium">
                          {endpoint.name}
                        </span>
                      </span>
                      <span className="mt-1 block truncate font-mono text-[11px] text-muted-foreground">
                        {endpoint.path}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          ))}
        </nav>
      </Card>

      <EndpointDetail endpoint={active} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Documentation                                                       */
/* ------------------------------------------------------------------ */

function Documentation() {
  return (
    <Tabs defaultValue="overview" data-ocid="api.docs.tabs">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-full border border-border bg-muted/50 p-1">
        {[
          { value: "overview", label: "Overview" },
          { value: "auth", label: "Authentication" },
          { value: "endpoints", label: "Endpoints" },
          { value: "errors", label: "Error Codes" },
        ].map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            data-ocid={`api.docs.tab.${tab.value}`}
            className="rounded-full px-4 py-1.5 text-sm text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-subtle"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <h4 className="font-display text-lg font-semibold text-foreground">
              What this API provides
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The Urja Open Data API exposes structured energy, RPO, solar,
              jobs, finance, circularity, environmental and forecasting data as
              JSON over HTTPS. Every payload in this explorer is illustrative
              demo data.
            </p>
          </Card>
          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <h4 className="font-display text-lg font-semibold text-foreground">
              Base URL
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              All endpoints are served over HTTPS from a single versioned base.
            </p>
            <code className="mt-3 block rounded-xl border border-border bg-muted/50 px-3 py-2 font-mono text-xs text-foreground">
              https://api.urja.gov.in/api/v1
            </code>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="auth" className="mt-6">
        <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" aria-hidden="true" />
            <h4 className="font-display text-lg font-semibold text-foreground">
              Authentication
            </h4>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every request must carry a bearer API key in the Authorization
            header. Keys are scoped to a region and a rate limit tier.
          </p>
          <div className="mt-5">
            <CodeBlock
              label="Authorization header"
              code="Authorization: Bearer <API_KEY>"
            />
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-[14px] border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
            <Lock
              className="mt-0.5 size-4 shrink-0 text-warning"
              aria-hidden="true"
            />
            <span>
              This prototype is a visual preview. No keys are issued and no
              request is authenticated.
            </span>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="endpoints" className="mt-6">
        <Card className="overflow-hidden rounded-[18px] border-border bg-card shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Method
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Endpoint
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINTS.map((endpoint) => (
                  <tr
                    key={endpoint.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <MethodBadge method={endpoint.method} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {endpoint.path}
                    </td>
                    <td className="max-w-md px-4 py-3 text-sm text-muted-foreground">
                      {endpoint.description}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge tone="success">
                        {endpoint.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="errors" className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ERROR_CODES.map((error) => (
            <Card
              key={error.code}
              className="rounded-[18px] border-border bg-card p-5 shadow-subtle"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-semibold text-foreground">
                  {error.code}
                </span>
                <StatusBadge
                  tone={error.code.startsWith("5") ? "danger" : "warning"}
                >
                  {error.title}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {error.description}
              </p>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ApiExplorerPage() {
  return (
    <PageFrame>
      <header className="max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Developer Portal
          </p>
          <Badge
            variant="outline"
            data-ocid="api.demo_badge"
            className="rounded-full border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-foreground"
          >
            Demo Data
          </Badge>
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Urja Open Data API
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Explore the sample endpoints that power the Urja platform — energy
          mix, RPO compliance, solar ROI, green jobs, finance, circularity,
          environmental impact and forecasting.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <SampleTag />
          <span className="text-xs text-muted-foreground">
            All payloads are illustrative demo data with source attribution and
            reporting periods.
          </span>
        </div>
      </header>

      <section className="mt-12" aria-labelledby="api-overview-heading">
        <div className="flex items-end justify-between gap-4">
          <h2
            id="api-overview-heading"
            className="font-display text-2xl font-semibold text-foreground"
          >
            Endpoint overview
          </h2>
          <SampleTag />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ENDPOINTS.map((endpoint) => (
            <OverviewCard key={endpoint.id} endpoint={endpoint} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="api-explorer-heading">
        <h2
          id="api-explorer-heading"
          className="font-display text-2xl font-semibold text-foreground"
        >
          Endpoint explorer
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Select an endpoint to inspect its example request, example JSON
          response, status code and copy the payload.
        </p>
        <div className="mt-6">
          <EndpointExplorer />
        </div>
      </section>

      <section className="mt-14" aria-labelledby="api-docs-heading">
        <h2
          id="api-docs-heading"
          className="font-display text-2xl font-semibold text-foreground"
        >
          Documentation
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Reference material for integrating with the Urja Open Data API.
        </p>
        <div className="mt-6">
          <Documentation />
        </div>
      </section>
    </PageFrame>
  );
}
