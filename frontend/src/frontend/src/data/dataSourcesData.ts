/**
 * URJA — Data Sources & Provenance sample data.
 *
 * Every source, dataset, pipeline stage and admin record in this module is
 * static illustrative sample data. Nothing is fetched, uploaded, validated or
 * persisted. Consumers must render the visible "DEMO DATA" label alongside
 * these values, together with the source attribution and reporting period.
 */

export type VerificationStatus = "verified" | "pending" | "flagged";
export type ProcessingStatus = "processed" | "processing" | "queued" | "failed";
export type PipelineStageState =
  | "completed"
  | "pending"
  | "failed"
  | "needs_review";

export interface DataSource {
  id: string;
  name: string;
  organisation: string;
  url: string;
  category: string;
  description: string;
  accent: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: "cea",
    name: "CEA",
    organisation: "Central Electricity Authority",
    url: "https://cea.nic.in",
    category: "Generation & capacity",
    description:
      "Installed capacity, generation mix and plant-level performance for the national grid.",
    accent: "var(--chart-1)",
  },
  {
    id: "grid-india",
    name: "GRID-INDIA / POSOCO",
    organisation: "Grid Controller of India",
    url: "https://grid-india.in",
    category: "Grid operations",
    description:
      "Real-time demand, frequency, interchange and renewable integration across regional grids.",
    accent: "var(--chart-4)",
  },
  {
    id: "mnre",
    name: "MNRE",
    organisation: "Ministry of New & Renewable Energy",
    url: "https://mnre.gov.in",
    category: "Policy & schemes",
    description:
      "Programme targets, scheme disbursements and renewable capacity milestones.",
    accent: "var(--chart-3)",
  },
  {
    id: "bee",
    name: "BEE",
    organisation: "Bureau of Energy Efficiency",
    url: "https://beeindia.gov.in",
    category: "Efficiency & standards",
    description:
      "Energy intensity benchmarks, appliance standards and demand-side savings.",
    accent: "var(--chart-2)",
  },
  {
    id: "data-gov",
    name: "data.gov.in",
    organisation: "National Data & Analytics Platform",
    url: "https://data.gov.in",
    category: "Open data",
    description:
      "Open government datasets on energy, infrastructure and consumption indicators.",
    accent: "var(--chart-5)",
  },
  {
    id: "cpcb",
    name: "CPCB",
    organisation: "Central Pollution Control Board",
    url: "https://cpcb.nic.in",
    category: "Air quality",
    description:
      "Ambient air quality monitoring and emission inventories for major cities.",
    accent: "var(--chart-5)",
  },
  {
    id: "openaq",
    name: "OpenAQ",
    organisation: "OpenAQ Community",
    url: "https://openaq.org",
    category: "Air quality",
    description:
      "Aggregated open air-quality measurements from reference and low-cost sensors.",
    accent: "var(--chart-3)",
  },
  {
    id: "ireda",
    name: "IREDA",
    organisation: "Indian Renewable Energy Development Agency",
    url: "https://ireda.in",
    category: "Green finance",
    description:
      "Renewable project lending, disbursement and portfolio performance data.",
    accent: "var(--chart-1)",
  },
  {
    id: "pm-surya-ghar",
    name: "PM Surya Ghar",
    organisation: "Ministry of New & Renewable Energy",
    url: "https://pmsuryaghar.gov.in",
    category: "Rooftop solar",
    description:
      "Rooftop solar installations, subsidy claims and beneficiary counts by state.",
    accent: "var(--chart-2)",
  },
];

export interface Dataset {
  id: string;
  name: string;
  sourceId: string;
  organisation: string;
  url: string;
  category: string;
  reportingPeriod: string;
  unit: string;
  lastUpdated: string;
  collectedAt: string;
  verification: VerificationStatus;
  processing: ProcessingStatus;
  records: string;
}

export const DATASETS: Dataset[] = [
  {
    id: "ds-capacity",
    name: "Installed Generation Capacity",
    sourceId: "cea",
    organisation: "Central Electricity Authority",
    url: "https://cea.nic.in/capacity",
    category: "Generation & capacity",
    reportingPeriod: "Oct 2026",
    unit: "GW",
    lastUpdated: "12 Nov 2026 · 06:00 IST",
    collectedAt: "12 Nov 2026 · 06:04 IST",
    verification: "verified",
    processing: "processed",
    records: "1,284 rows",
  },
  {
    id: "ds-mix",
    name: "Daily Generation Mix",
    sourceId: "cea",
    organisation: "Central Electricity Authority",
    url: "https://cea.nic.in/generation",
    category: "Generation & capacity",
    reportingPeriod: "Oct 2026",
    unit: "MU",
    lastUpdated: "12 Nov 2026 · 05:30 IST",
    collectedAt: "12 Nov 2026 · 05:33 IST",
    verification: "verified",
    processing: "processed",
    records: "9,460 rows",
  },
  {
    id: "ds-demand",
    name: "Regional Demand & Frequency",
    sourceId: "grid-india",
    organisation: "Grid Controller of India",
    url: "https://grid-india.in/demand",
    category: "Grid operations",
    reportingPeriod: "Nov 2026 (to date)",
    unit: "MW / Hz",
    lastUpdated: "12 Nov 2026 · 06:15 IST",
    collectedAt: "12 Nov 2026 · 06:16 IST",
    verification: "verified",
    processing: "processing",
    records: "42,180 rows",
  },
  {
    id: "ds-re-targets",
    name: "Renewable Capacity Targets",
    sourceId: "mnre",
    organisation: "Ministry of New & Renewable Energy",
    url: "https://mnre.gov.in/targets",
    category: "Policy & schemes",
    reportingPeriod: "FY 2026-27",
    unit: "GW",
    lastUpdated: "10 Nov 2026 · 14:00 IST",
    collectedAt: "10 Nov 2026 · 14:05 IST",
    verification: "verified",
    processing: "processed",
    records: "312 rows",
  },
  {
    id: "ds-schemes",
    name: "Scheme Disbursement Ledger",
    sourceId: "mnre",
    organisation: "Ministry of New & Renewable Energy",
    url: "https://mnre.gov.in/schemes",
    category: "Policy & schemes",
    reportingPeriod: "Q2 FY 2026-27",
    unit: "₹ crore",
    lastUpdated: "08 Nov 2026 · 11:20 IST",
    collectedAt: "08 Nov 2026 · 11:24 IST",
    verification: "pending",
    processing: "queued",
    records: "1,046 rows",
  },
  {
    id: "ds-efficiency",
    name: "Energy Intensity Benchmarks",
    sourceId: "bee",
    organisation: "Bureau of Energy Efficiency",
    url: "https://beeindia.gov.in/benchmarks",
    category: "Efficiency & standards",
    reportingPeriod: "FY 2025-26",
    unit: "kgoe / unit",
    lastUpdated: "05 Nov 2026 · 09:45 IST",
    collectedAt: "05 Nov 2026 · 09:50 IST",
    verification: "verified",
    processing: "processed",
    records: "688 rows",
  },
  {
    id: "ds-open-energy",
    name: "State Energy Indicators",
    sourceId: "data-gov",
    organisation: "National Data & Analytics Platform",
    url: "https://data.gov.in/energy",
    category: "Open data",
    reportingPeriod: "FY 2024-25",
    unit: "mixed",
    lastUpdated: "02 Nov 2026 · 18:10 IST",
    collectedAt: "02 Nov 2026 · 18:15 IST",
    verification: "flagged",
    processing: "failed",
    records: "3,204 rows",
  },
  {
    id: "ds-air-cpcb",
    name: "Ambient Air Quality (CPCB)",
    sourceId: "cpcb",
    organisation: "Central Pollution Control Board",
    url: "https://cpcb.nic.in/aqi",
    category: "Air quality",
    reportingPeriod: "Nov 2026 (to date)",
    unit: "µg/m³",
    lastUpdated: "12 Nov 2026 · 06:10 IST",
    collectedAt: "12 Nov 2026 · 06:12 IST",
    verification: "verified",
    processing: "processing",
    records: "18,940 rows",
  },
  {
    id: "ds-air-openaq",
    name: "Open Air Quality Sensors",
    sourceId: "openaq",
    organisation: "OpenAQ Community",
    url: "https://openaq.org/locations",
    category: "Air quality",
    reportingPeriod: "Nov 2026 (to date)",
    unit: "µg/m³",
    lastUpdated: "12 Nov 2026 · 06:05 IST",
    collectedAt: "12 Nov 2026 · 06:07 IST",
    verification: "pending",
    processing: "queued",
    records: "27,610 rows",
  },
  {
    id: "ds-ireda",
    name: "Renewable Lending Portfolio",
    sourceId: "ireda",
    organisation: "Indian Renewable Energy Development Agency",
    url: "https://ireda.in/portfolio",
    category: "Green finance",
    reportingPeriod: "Q2 FY 2026-27",
    unit: "₹ crore",
    lastUpdated: "06 Nov 2026 · 16:30 IST",
    collectedAt: "06 Nov 2026 · 16:34 IST",
    verification: "verified",
    processing: "processed",
    records: "742 rows",
  },
  {
    id: "ds-surya-ghar",
    name: "Rooftop Solar Installations",
    sourceId: "pm-surya-ghar",
    organisation: "Ministry of New & Renewable Energy",
    url: "https://pmsuryaghar.gov.in/dashboard",
    category: "Rooftop solar",
    reportingPeriod: "Oct 2026",
    unit: "installations",
    lastUpdated: "11 Nov 2026 · 20:00 IST",
    collectedAt: "11 Nov 2026 · 20:04 IST",
    verification: "verified",
    processing: "processed",
    records: "5,118 rows",
  },
];

export interface PipelineStage {
  id: string;
  label: string;
  description: string;
  state: PipelineStageState;
  detail: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "sources",
    label: "Data Sources",
    description: "Nine upstream publishers registered",
    state: "completed",
    detail: "9 sources · last sync 06:16 IST",
  },
  {
    id: "collection",
    label: "Data Collection",
    description: "Scheduled and on-demand ingestion",
    state: "completed",
    detail: "11 datasets · 110,584 rows",
  },
  {
    id: "validation",
    label: "Validation",
    description: "Schema, range and completeness checks",
    state: "needs_review",
    detail: "2 datasets awaiting review",
  },
  {
    id: "processing",
    label: "Processing",
    description: "Normalisation and unit harmonisation",
    state: "pending",
    detail: "3 datasets in queue",
  },
  {
    id: "database",
    label: "Database",
    description: "Curated analytical store",
    state: "completed",
    detail: "8 datasets materialised",
  },
  {
    id: "api",
    label: "REST API",
    description: "Versioned read endpoints",
    state: "completed",
    detail: "v1 · 14 endpoints live",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Visualisation and reporting layer",
    state: "failed",
    detail: "1 tile failed to refresh",
  },
];

export const PIPELINE_STATE_LABEL: Record<PipelineStageState, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  needs_review: "Needs review",
};

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  flagged: "Flagged",
};

export const PROCESSING_LABEL: Record<ProcessingStatus, string> = {
  processed: "Processed",
  processing: "Processing",
  queued: "Queued",
  failed: "Failed",
};

export const DATASET_CATEGORIES = [
  "Generation & capacity",
  "Grid operations",
  "Policy & schemes",
  "Efficiency & standards",
  "Open data",
  "Air quality",
  "Green finance",
  "Rooftop solar",
];

export const DATASET_UNITS = [
  "GW",
  "MU",
  "MW / Hz",
  "₹ crore",
  "kgoe / unit",
  "µg/m³",
  "installations",
  "mixed",
];

export const DEMO_DATA_LABEL = "DEMO DATA";
export const DATA_SOURCES_REPORTING_PERIOD = "Data as of Oct 2026";
export const DATA_SOURCES_LAST_UPDATED = "12 Nov 2026 · 06:16 IST";
