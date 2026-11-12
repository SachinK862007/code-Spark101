/**
 * URJA — Green Grid dashboard sample data.
 *
 * Every figure, series, marker and label in this module is static illustrative
 * sample data. Nothing is fetched, computed or persisted. Consumers must render
 * the visible "Sample data" label alongside these values, together with the
 * source attribution and reporting period.
 */

export interface StakeholderRole {
  id: string;
  label: string;
  short: string;
  description: string;
  portal: string;
  to: string;
  icon: "citizen" | "entity" | "policymaker" | "finance" | "circular";
}

export const STAKEHOLDER_ROLES: StakeholderRole[] = [
  {
    id: "citizen",
    label: "Citizen / Consumer",
    short: "Citizen",
    description:
      "Track your rooftop solar, understand your bill and follow the schemes you are eligible for.",
    portal: "Consumer Portal",
    to: "/dashboard",
    icon: "citizen",
  },
  {
    id: "entity",
    label: "Obligated Entity",
    short: "Obligated Entity",
    description:
      "Monitor renewable purchase obligations, compliance gaps and certificate positions.",
    portal: "Compliance Portal",
    to: "/rpo",
    icon: "entity",
  },
  {
    id: "policymaker",
    label: "Policymaker / Grid Operator",
    short: "Policymaker",
    description:
      "Read national capacity, generation mix and forecast outlooks across every regional grid.",
    portal: "National Dashboard",
    to: "/dashboard",
    icon: "policymaker",
  },
  {
    id: "finance",
    label: "Financial Institution",
    short: "Finance",
    description:
      "Compare green finance instruments, returns and risk signals for renewable projects.",
    portal: "Finance Portal",
    to: "/green-finance",
    icon: "finance",
  },
  {
    id: "circular",
    label: "Circular Economy Actor",
    short: "Circular Economy",
    description:
      "Map recyclers, panel take-back routes and material recovery across the value chain.",
    portal: "Circularity Portal",
    to: "/circularity",
    icon: "circular",
  },
];

export interface DashboardNavItem {
  label: string;
  to: string;
  code?: string;
}

export interface DashboardNavGroup {
  heading: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_NAV: DashboardNavGroup[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "India Energy Map", to: "/map" },
    ],
  },
  {
    heading: "Energy Intelligence",
    items: [
      { label: "Energy Mix", to: "/energy-mix", code: "D1" },
      { label: "RPO Compliance", to: "/rpo", code: "D2" },
      { label: "Solar ROI", to: "/solar-roi", code: "D3" },
      { label: "Energy Forecasting", to: "/forecasting", code: "D8" },
    ],
  },
  {
    heading: "Opportunities & Resources",
    items: [
      { label: "Green Jobs", to: "/green-jobs", code: "D4" },
      { label: "Green Finance", to: "/green-finance", code: "D5" },
      { label: "Circular Economy", to: "/circularity", code: "D6" },
      { label: "Environmental Impact", to: "/environment", code: "D7" },
    ],
  },
  {
    heading: "Platform",
    items: [
      { label: "Stakeholder Portal", to: "/stakeholders", code: "D9" },
      { label: "Data Sources & Provenance", to: "/data-sources" },
      { label: "API Explorer", to: "/energy/api" },
      { label: "Settings", to: "/settings" },
    ],
  },
];

export interface KpiCard {
  id: string;
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "flat";
  trendLabel: string;
  source: string;
  series: number[];
}

export const OVERVIEW_KPIS: KpiCard[] = [
  {
    id: "total-capacity",
    label: "Total Installed Capacity",
    value: "482.6",
    unit: "GW",
    trend: "up",
    trendLabel: "+9.8% YoY",
    source: "CEA",
    series: [40, 44, 47, 52, 56, 61, 66, 70, 75, 80, 86, 92, 98],
  },
  {
    id: "non-fossil-capacity",
    label: "Non-Fossil Installed Capacity",
    value: "241.6",
    unit: "GW",
    trend: "up",
    trendLabel: "+12.4% YoY",
    source: "MNRE",
    series: [20, 24, 27, 31, 35, 39, 44, 49, 54, 60, 66, 72, 79],
  },
  {
    id: "renewable-generation",
    label: "Renewable Generation",
    value: "113.4",
    unit: "TWh",
    trend: "up",
    trendLabel: "+24.5% YoY",
    source: "CEA",
    series: [30, 34, 33, 39, 44, 43, 50, 55, 54, 61, 67, 66, 74],
  },
  {
    id: "coal-share",
    label: "Coal Share of Generation",
    value: "58.8",
    unit: "%",
    trend: "down",
    trendLabel: "-3.4% YoY",
    source: "CEA",
    series: [72, 71, 70, 69, 67, 66, 65, 64, 63, 62, 61, 60, 59],
  },
  {
    id: "rpo-target",
    label: "RPO Target",
    value: "43.3",
    unit: "%",
    trend: "flat",
    trendLabel: "FY 2030 trajectory",
    source: "MoP",
    series: [24, 26, 28, 30, 32, 34, 36, 38, 40, 41, 42, 43, 43],
  },
  {
    id: "re-forecast",
    label: "Renewable Energy Forecast",
    value: "268.0",
    unit: "GW",
    trend: "up",
    trendLabel: "FY 2027 outlook",
    source: "Grid-India",
    series: [42, 48, 55, 62, 70, 79, 89, 100, 112, 126, 142, 160, 180],
  },
];

export interface EnergyMixSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

export const ENERGY_MIX: EnergyMixSlice[] = [
  { id: "coal", label: "Coal", value: 58.8, color: "var(--chart-5)" },
  { id: "solar", label: "Solar", value: 17.2, color: "var(--chart-2)" },
  { id: "wind", label: "Wind", value: 10.1, color: "var(--chart-4)" },
  { id: "hydro", label: "Hydro", value: 10.9, color: "var(--chart-3)" },
  { id: "nuclear", label: "Nuclear", value: 3.0, color: "var(--chart-1)" },
];

export interface GenerationTrendPoint {
  year: string;
  coal: number;
  renewable: number;
}

export const GENERATION_TRENDS: GenerationTrendPoint[] = [
  { year: "2018", coal: 1020, renewable: 180 },
  { year: "2019", coal: 1040, renewable: 210 },
  { year: "2020", coal: 1010, renewable: 240 },
  { year: "2021", coal: 1080, renewable: 290 },
  { year: "2022", coal: 1120, renewable: 350 },
  { year: "2023", coal: 1160, renewable: 420 },
  { year: "2024", coal: 1180, renewable: 510 },
];

export interface CapacityGrowthPoint {
  year: string;
  solar: number;
  wind: number;
  hydro: number;
  other: number;
}

export const CAPACITY_GROWTH: CapacityGrowthPoint[] = [
  { year: "2018", solar: 22, wind: 34, hydro: 45, other: 8 },
  { year: "2019", solar: 28, wind: 37, hydro: 46, other: 9 },
  { year: "2020", solar: 34, wind: 38, hydro: 46, other: 10 },
  { year: "2021", solar: 42, wind: 40, hydro: 47, other: 11 },
  { year: "2022", solar: 52, wind: 42, hydro: 47, other: 12 },
  { year: "2023", solar: 64, wind: 44, hydro: 47, other: 13 },
  { year: "2024", solar: 78, wind: 46, hydro: 47, other: 14 },
];

export interface RpoPoint {
  year: string;
  target: number;
  actual: number;
}

export const RPO_TRAJECTORY: RpoPoint[] = [
  { year: "2018", target: 17, actual: 15 },
  { year: "2020", target: 21, actual: 19 },
  { year: "2022", target: 26, actual: 24 },
  { year: "2024", target: 30, actual: 29 },
  { year: "2026", target: 35, actual: 33 },
  { year: "2028", target: 39, actual: 37 },
  { year: "2030", target: 43, actual: 41 },
];

export interface StateRankRow {
  rank: number;
  state: string;
  capacity: string;
  share: string;
  trend: "up" | "down" | "flat";
}

export const STATE_RANKING: StateRankRow[] = [
  {
    rank: 1,
    state: "Rajasthan",
    capacity: "28.4 GW",
    share: "49.8%",
    trend: "up",
  },
  {
    rank: 2,
    state: "Gujarat",
    capacity: "26.1 GW",
    share: "44.1%",
    trend: "up",
  },
  {
    rank: 3,
    state: "Tamil Nadu",
    capacity: "22.7 GW",
    share: "51.6%",
    trend: "flat",
  },
  {
    rank: 4,
    state: "Karnataka",
    capacity: "19.3 GW",
    share: "47.3%",
    trend: "up",
  },
  {
    rank: 5,
    state: "Maharashtra",
    capacity: "16.8 GW",
    share: "38.2%",
    trend: "up",
  },
  {
    rank: 6,
    state: "Andhra Pradesh",
    capacity: "13.2 GW",
    share: "42.7%",
    trend: "down",
  },
];

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  to: string;
  icon: "rpo" | "solar" | "forecast" | "jobs" | "finance";
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "rpo",
    label: "Calculate RPO compliance",
    description: "Check obligation vs. achievement",
    to: "/rpo",
    icon: "rpo",
  },
  {
    id: "solar",
    label: "Calculate solar ROI",
    description: "Rooftop payback and returns",
    to: "/solar-roi",
    icon: "solar",
  },
  {
    id: "forecast",
    label: "Explore energy forecast",
    description: "Demand and storage outlook",
    to: "/forecasting",
    icon: "forecast",
  },
  {
    id: "jobs",
    label: "Find green jobs",
    description: "Renewable sector openings",
    to: "/green-jobs",
    icon: "jobs",
  },
  {
    id: "finance",
    label: "Compare green finance",
    description: "Instruments and returns",
    to: "/green-finance",
    icon: "finance",
  },
];

export const STATE_FILTER_OPTIONS = [
  "All India",
  "Rajasthan",
  "Gujarat",
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Andhra Pradesh",
  "Uttar Pradesh",
];

export const DATE_FILTER_OPTIONS = [
  "Last 30 days",
  "Last quarter",
  "Last 12 months",
  "FY 2024-25",
];

export const DATA_REFRESH_SOURCES = [
  { id: "cea", label: "CEA", status: "live" as const },
  { id: "mnre", label: "MNRE", status: "live" as const },
  { id: "grid", label: "Grid-India", status: "live" as const },
  { id: "dpiit", label: "DPIIT", status: "delayed" as const },
];

export const LAST_UPDATED = "12 Nov 2026 · 06:00 IST";
export const REPORTING_PERIOD = "Data as of Oct 2026";
