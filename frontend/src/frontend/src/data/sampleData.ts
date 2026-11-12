/**
 * URJA — shared illustrative sample data.
 *
 * Every number, chart series, marker and response in the prototype is static
 * sample data. Nothing here is fetched, computed or persisted; it exists so the
 * design reads as a real production platform. Each consumer must render the
 * visible "Sample data" label alongside these values.
 */

export const SAMPLE_DATA_LABEL = "Sample data";

export interface NavItem {
  label: string;
  to: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Ask", to: "/ask" },
  { label: "Weather", to: "/weather" },
  { label: "Calculators", to: "/energy-calculations" },
  { label: "Explore Map", to: "/map" },
  { label: "Public Services", to: "/services" },
  { label: "Energy", to: "/energy" },
  { label: "About", to: "/about" },
];

export interface FooterColumn {
  heading: string;
  links: NavItem[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Platform",
    links: [
      { label: "Ask Urja", to: "/ask" },
      { label: "Explore Map", to: "/map" },
      { label: "Public Services", to: "/services" },
      { label: "Energy Dashboard", to: "/energy" },
      { label: "Voice Assistant", to: "/voice" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About Urja", to: "/about" },
      { label: "Methodology", to: "/about" },
      { label: "Energy API", to: "/energy/api" },
      { label: "Privacy", to: "/about" },
      { label: "Contact", to: "/about" },
    ],
  },
];

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: string;
  statusTone: "success" | "warning" | "neutral";
  series: number[];
}

export const NATIONAL_METRICS: MetricCard[] = [
  {
    id: "demand",
    label: "Live National Demand",
    value: "198,420",
    unit: "MW",
    status: "Normal · 49.98 Hz",
    statusTone: "success",
    series: [42, 48, 45, 52, 58, 55, 61, 66, 63, 70, 74, 71, 78],
  },
  {
    id: "renewable",
    label: "Renewable Contribution",
    value: "34.8",
    unit: "%",
    status: "High generation",
    statusTone: "success",
    series: [30, 33, 31, 36, 40, 38, 44, 47, 45, 50, 53, 51, 56],
  },
  {
    id: "solar",
    label: "Rooftop Solar Applications",
    value: "1,42,890",
    unit: "total",
    status: "Processing",
    statusTone: "warning",
    series: [20, 26, 24, 30, 34, 33, 39, 44, 42, 48, 52, 50, 57],
  },
];

export interface QuickService {
  id: string;
  label: string;
  description: string;
  icon: "sun" | "map" | "file";
}

export const QUICK_SERVICES: QuickService[] = [
  {
    id: "solar-subsidy",
    label: "Apply for Solar Subsidy",
    description: "Rooftop programme",
    icon: "sun",
  },
  {
    id: "outage-map",
    label: "Check Outage Map",
    description: "Live grid status",
    icon: "map",
  },
  {
    id: "grievance",
    label: "Register Utility Grievance",
    description: "Consumer support",
    icon: "file",
  },
];

export interface SuggestionChip {
  id: string;
  label: string;
}

export const HERO_SUGGESTIONS: SuggestionChip[] = [
  { id: "rooftop", label: "Rooftop Solar Subsidy" },
  { id: "kusum", label: "PM-KUSUM Scheme" },
  { id: "demand", label: "Daily Power Demand" },
  { id: "ev", label: "EV Charging Grid" },
];

export interface SearchGroup {
  heading: string;
  items: { id: string; label: string; description: string; to: string }[];
}

export const SEARCH_GROUPS: SearchGroup[] = [
  {
    heading: "Public services",
    items: [
      {
        id: "svc-solar",
        label: "Rooftop Solar Subsidy",
        description: "Apply for residential rooftop subsidy",
        to: "/services",
      },
      {
        id: "svc-kusum",
        label: "PM-KUSUM Scheme",
        description: "Solar pumps for farmers",
        to: "/services",
      },
      {
        id: "svc-grievance",
        label: "Register Utility Grievance",
        description: "File a consumer complaint",
        to: "/services",
      },
    ],
  },
  {
    heading: "Offices",
    items: [
      {
        id: "off-delhi",
        label: "Ministry of Power, New Delhi",
        description: "Shram Shakti Bhawan, Rafi Marg",
        to: "/map",
      },
      {
        id: "off-mumbai",
        label: "Regional Load Despatch Centre, Mumbai",
        description: "Western region grid operations",
        to: "/map",
      },
    ],
  },
  {
    heading: "Energy topics",
    items: [
      {
        id: "en-demand",
        label: "Daily Power Demand",
        description: "National demand and frequency",
        to: "/energy",
      },
      {
        id: "en-renewable",
        label: "Renewable Contribution",
        description: "Share of renewable generation",
        to: "/energy",
      },
    ],
  },
  {
    heading: "Platform pages",
    items: [
      {
        id: "pg-voice",
        label: "Voice Assistant",
        description: "Ask Urja by voice",
        to: "/voice",
      },
      {
        id: "pg-api",
        label: "Energy API Explorer",
        description: "Market forecast endpoints",
        to: "/energy/api",
      },
    ],
  },
];

export interface ServiceRecord {
  id: string;
  name: string;
  category: string;
  office: string;
  status: "Open" | "Processing" | "Closed";
  updated: string;
}

export const SERVICE_RECORDS: ServiceRecord[] = [
  {
    id: "rooftop-solar-subsidy",
    name: "Rooftop Solar Subsidy",
    category: "Renewable Energy",
    office: "Ministry of New & Renewable Energy",
    status: "Open",
    updated: "12 Nov 2026",
  },
  {
    id: "pm-kusum",
    name: "PM-KUSUM Scheme",
    category: "Agriculture",
    office: "Ministry of New & Renewable Energy",
    status: "Open",
    updated: "10 Nov 2026",
  },
  {
    id: "utility-grievance",
    name: "Register Utility Grievance",
    category: "Consumer Affairs",
    office: "Central Electricity Authority",
    status: "Processing",
    updated: "09 Nov 2026",
  },
  {
    id: "ev-charging",
    name: "EV Charging Grid Access",
    category: "Mobility",
    office: "Bureau of Energy Efficiency",
    status: "Open",
    updated: "08 Nov 2026",
  },
  {
    id: "outage-report",
    name: "Report a Power Outage",
    category: "Grid Operations",
    office: "Regional Load Despatch Centre",
    status: "Closed",
    updated: "05 Nov 2026",
  },
];

export interface MapMarker {
  id: string;
  name: string;
  type: "Office" | "Substation" | "Solar Park";
  region: string;
  x: number;
  y: number;
}

export const MAP_MARKERS: MapMarker[] = [
  {
    id: "m1",
    name: "Shram Shakti Bhawan",
    type: "Office",
    region: "Delhi",
    x: 38,
    y: 30,
  },
  {
    id: "m2",
    name: "Bhadla Solar Park",
    type: "Solar Park",
    region: "Rajasthan",
    x: 26,
    y: 42,
  },
  {
    id: "m3",
    name: "Pavagada Solar Park",
    type: "Solar Park",
    region: "Karnataka",
    x: 40,
    y: 74,
  },
  {
    id: "m4",
    name: "Mundra Substation",
    type: "Substation",
    region: "Gujarat",
    x: 20,
    y: 52,
  },
  {
    id: "m5",
    name: "Talcher Substation",
    type: "Substation",
    region: "Odisha",
    x: 62,
    y: 56,
  },
  {
    id: "m6",
    name: "RLDC Kolkata",
    type: "Office",
    region: "West Bengal",
    x: 70,
    y: 48,
  },
];

export interface StateEnergyRow {
  state: string;
  demand: string;
  renewable: string;
  frequency: string;
  trend: "up" | "down" | "flat";
}

export const STATE_ENERGY_ROWS: StateEnergyRow[] = [
  {
    state: "Maharashtra",
    demand: "28,410 MW",
    renewable: "38.2%",
    frequency: "49.97 Hz",
    trend: "up",
  },
  {
    state: "Gujarat",
    demand: "21,760 MW",
    renewable: "44.1%",
    frequency: "50.01 Hz",
    trend: "up",
  },
  {
    state: "Tamil Nadu",
    demand: "17,930 MW",
    renewable: "51.6%",
    frequency: "49.95 Hz",
    trend: "flat",
  },
  {
    state: "Karnataka",
    demand: "14,220 MW",
    renewable: "47.3%",
    frequency: "49.99 Hz",
    trend: "up",
  },
  {
    state: "Uttar Pradesh",
    demand: "24,880 MW",
    renewable: "22.4%",
    frequency: "49.94 Hz",
    trend: "down",
  },
  {
    state: "Rajasthan",
    demand: "13,540 MW",
    renewable: "49.8%",
    frequency: "50.02 Hz",
    trend: "up",
  },
];

export interface ChatMessage {
  id: string;
  role: "user" | "urja";
  text: string;
  sources?: string[];
}

export const SAMPLE_CONVERSATION: ChatMessage[] = [
  {
    id: "c1",
    role: "user",
    text: "What is today's national power demand and how much is renewable?",
  },
  {
    id: "c2",
    role: "urja",
    text: "National demand is currently 198,420 MW with renewable sources contributing 34.8% of generation. Frequency is stable at 49.98 Hz.",
    sources: ["Grid-India NLDC", "CEA Daily Report"],
  },
];

export interface ApiEndpoint {
  id: string;
  method: "GET";
  path: string;
  description: string;
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "forecast-demand",
    method: "GET",
    path: "/v1/forecast/demand",
    description: "Day-ahead national demand forecast",
  },
  {
    id: "forecast-renewable",
    method: "GET",
    path: "/v1/forecast/renewable",
    description: "Renewable generation outlook by region",
  },
  {
    id: "market-price",
    method: "GET",
    path: "/v1/market/price",
    description: "Day-ahead market clearing price",
  },
];

export const SAMPLE_API_RESPONSE = `{
  "region": "national",
  "generated_at": "2026-11-12T06:00:00Z",
  "unit": "MW",
  "forecast": [
    { "hour": "00:00", "demand": 168420 },
    { "hour": "06:00", "demand": 182110 },
    { "hour": "12:00", "demand": 198420 },
    { "hour": "18:00", "demand": 205760 },
    { "hour": "23:00", "demand": 174980 }
  ],
  "sample": true
}`;

export const DEMAND_SERIES = [
  { hour: "00", demand: 168, renewable: 52 },
  { hour: "03", demand: 158, renewable: 55 },
  { hour: "06", demand: 182, renewable: 61 },
  { hour: "09", demand: 194, renewable: 78 },
  { hour: "12", demand: 198, renewable: 92 },
  { hour: "15", demand: 201, renewable: 88 },
  { hour: "18", demand: 206, renewable: 64 },
  { hour: "21", demand: 188, renewable: 58 },
];
