/**
 * Response shapes exposed by the URJA FastAPI backend (`/api/v1`).
 * These mirror the Pydantic models so pages stay typed end to end.
 */

export interface ProvenanceMeta {
  status: string;
  status_note: string;
  source: {
    name: string;
    url: string;
    secondary_name?: string;
    secondary_url?: string;
  };
  reporting_period: string;
  last_updated: string;
}

export interface EnergySourceRow {
  id: string;
  label: string;
  capacity_mw?: number;
  generation_gwh?: number;
  type: "fossil" | "non_fossil" | "renewable";
  share_pct: number;
  is_renewable: boolean;
}

export interface EnergyShareBlock {
  metric: string;
  unit: string;
  total_mw?: number;
  total_gwh?: number;
  sources: EnergySourceRow[];
  shares: {
    renewable_pct: number;
    non_fossil_pct: number;
    fossil_pct: number;
  };
  meta: ProvenanceMeta;
  data_kind: "capacity" | "generation";
}

export interface EnergyMixResponse {
  capacity: EnergyShareBlock;
  generation: EnergyShareBlock;
}

export interface StateEnergyRow {
  state: string;
  renewable_capacity_mw: number;
  renewable_share_pct: number;
}

export interface EnergyStatesResponse {
  unit_capacity: string;
  states: StateEnergyRow[];
  meta: ProvenanceMeta;
}

export interface EnergySummary {
  installed_capacity_gw: number;
  renewable_capacity_share_pct: number;
  non_fossil_capacity_share_pct: number;
  generation_twh: number;
  renewable_generation_share_pct: number;
  meta: ProvenanceMeta;
}

export type RpoEntityCategory =
  | "DISCOM"
  | "Captive Consumer"
  | "Open Access Consumer"
  | "Other eligible entity";

export type RpoObligationCategory =
  | "total"
  | "wind"
  | "hydro"
  | "distributed_re"
  | "other";

export interface RpoTargetRow {
  year: string;
  category: string;
  total: number;
  sub_targets: Record<string, number> | null;
  effective_from?: string | null;
  effective_to?: string | null;
}

export interface RpoTargetsResponse {
  policy: {
    version: string;
    framework: string;
    verified: boolean;
    updated_at?: string;
    source: { name: string; url: string; effective_from?: string; note?: string };
    notes: string[];
  };
  years: string[];
  entity_categories: RpoEntityCategory[];
  obligation_categories: Record<RpoObligationCategory, string>;
  targets: RpoTargetRow[];
}

export interface RpoCalculationRequest {
  entity_name: string;
  entity_category: RpoEntityCategory;
  state: string;
  year: string;
  consumption: number;
  consumption_unit: "kWh" | "MWh";
  renewable_procured: number;
  certificates: number;
  obligation_category: RpoObligationCategory;
}

export interface RpoCalculationResponse {
  policy: {
    version: string;
    framework: string;
    verified: boolean;
    source: { name: string; url: string };
  };
  inputs: Record<string, string | number>;
  target: {
    percent: number;
    basis: "total" | "sub_target";
    required_mwh: number;
    required_kwh: number;
    obligation_label: string;
    effective_from: string | null;
    effective_to: string | null;
    effective_from_label?: string;
    sub_targets: Record<string, number> | null;
    verified: boolean;
    framework: string;
  };
  eligible: {
    renewable_mwh: number;
    certificates_mwh: number;
    certificates_capped_mwh: number;
    renewable_rejected_mwh: number;
    total_mwh: number;
  };
  result: {
    compliance_pct: number;
    shortfall_mwh: number;
    surplus_mwh: number;
    status: "compliant" | "shortfall" | "surplus";
  };
  notes: string[];
}

export interface SolarCalculationRequest {
  state: string;
  city?: string | null;
  monthly_bill?: number | null;
  monthly_consumption_kwh?: number | null;
  tariff?: number | null;
  roof_area_sqft?: number | null;
  system_capacity_kw?: number | null;
  consumer_category: "residential" | "commercial";
  system_type: "ongrid" | "offgrid" | "hybrid";
}

export interface SolarCalculationResponse {
  inputs: Record<string, string | number | null>;
  sizing: {
    recommended_capacity_kw: number;
    basis: string;
    specific_yield_kwh_per_kwp: number;
    performance_ratio: number;
    system_type_factor: number;
  };
  cost: {
    install_cost_inr: number;
    subsidy_estimate_inr: number;
    net_investment_inr: number;
    cost_per_kw_inr: number;
    subsidy_note: string;
  };
  returns: {
    annual_generation_kwh: number;
    self_consumed_kwh: number;
    exported_kwh: number;
    annual_savings_inr: number;
    monthly_savings_inr: number;
    payback_years: number | null;
    lifetime_years: number;
    lifetime_savings_inr: number;
    lifetime_generation_kwh: number;
    co2_avoided_kg_per_year: number;
    co2_avoided_tonnes_per_year: number;
  };
  assumptions: Record<string, number>;
  subsidy_source: {
    scheme: string;
    source_name: string;
    source_url: string;
    last_verified: string;
  };
  disclaimer: string;
}

export interface AskSource {
  title: string;
  url: string;
  snippet: string;
  source_name: string;
  is_official: boolean;
  priority: number;
  published_at: string | null;
  retrieved_at: string | null;
}

export interface AskResponse {
  question: string;
  answer: string;
  answer_kind: "retrieved_excerpts" | "no_results" | "provider_unavailable";
  sources: AskSource[];
  provider: string;
  retrieved_at: string;
  cached: boolean;
  context_used: boolean;
  official_source_count: number;
}

export interface WeatherStatus {
  configured: boolean;
  provider: string;
  message: string;
  supported_endpoints: string[];
}

export interface WeatherLocation {
  name: string;
  state: string | null;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature_c: number;
  feels_like_c: number;
  min_temp_c: number;
  max_temp_c: number;
  humidity_pct: number;
  pressure_hpa: number;
  condition: string;
  description: string;
  icon: string;
  icon_url: string;
  wind_speed_ms: number;
  wind_direction_deg: number;
  wind_direction: string;
  clouds_pct: number;
  visibility_m: number | null;
  sunrise: string | null;
  sunset: string | null;
  observed_at: string | null;
  provider: string;
}

export interface CurrentWeatherResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  retrieved_at: string;
  provider: string;
  cached: boolean;
}

export interface ForecastInterval {
  time: string;
  timestamp: number;
  temperature_c: number;
  feels_like_c: number;
  humidity_pct: number;
  condition: string;
  description: string;
  icon: string;
  icon_url: string;
  wind_speed_ms: number;
  wind_direction: string;
  precipitation_probability: number;
  rain_3h_mm?: number;
  clouds_pct: number;
}

export interface ForecastDay {
  date: string;
  min_temp_c: number;
  max_temp_c: number;
  condition: string | null;
  precipitation_probability: number;
  wind_speed_ms: number;
}

export interface ForecastResponse {
  location: WeatherLocation;
  forecast: {
    city: string;
    country: string;
    intervals: ForecastInterval[];
    daily: ForecastDay[];
    provider: string;
    retrieved_at: string;
  };
  retrieved_at: string;
  cached: boolean;
}

export interface MapCategory {
  id: string;
  label: string;
  group: string;
  marker_color: string;
  count: number;
}

export interface MapLocation {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  hours: string | null;
  verified: boolean;
  data_status: string;
  source_name: string;
  source_url: string;
  details: string | null;
}

export interface MapLocationsResponse {
  count: number;
  locations: MapLocation[];
  attribution: string;
  note: string;
}

export interface ServiceRecord {
  id: string;
  name: string;
  department: string;
  category: string;
  location: string;
  city: string;
  state: string;
  contact: string;
  availability: string;
  status: "Verified" | "Updated" | "Under review";
  official_url: string;
  source_name: string;
  updated_at: string;
  description: string;
}

export interface ServicesResponse {
  count: number;
  services: ServiceRecord[];
  categories: { id: string; label: string; icon: string; count: number }[];
  states: string[];
  disclaimer: string;
}

export interface JobsResponse {
  count: number;
  jobs: {
    id: string;
    title: string;
    organisation: string;
    category: string;
    location: string;
    state: string;
    employment_type: string;
    experience: string;
    salary_note: string;
    posted_at: string | null;
    source_name: string;
    source_url: string;
    description: string;
  }[];
  categories: string[];
  states: string[];
  data_status: string;
  disclaimer: string;
}

export interface FinanceResponse {
  count: number;
  products: {
    id: string;
    name: string;
    provider: string;
    type: string;
    instrument: string;
    eligible_for: string;
    interest_rate: number | null;
    rate_note: string;
    tenure_note: string;
    amount_note: string;
    source_name: string;
    source_url: string;
    updated_at: string;
  }[];
  types: string[];
  data_status: string;
  disclaimer: string;
}

export interface CircularityResponse {
  streams: {
    id: string;
    name: string;
    handling: string;
    do_not: string;
    source_name: string;
    source_url: string;
  }[];
  resources: {
    id: string;
    name: string;
    kind: string;
    description: string;
    url: string;
    source_name: string;
  }[];
  data_status: string;
  disclaimer: string;
}

export interface EnvironmentResponse {
  regions: {
    region: string;
    solar_capacity_mw: number;
    co2_avoided_mt_per_year: number;
    air_quality_index: number;
  }[];
  source: { name: string; url: string; note: string };
  data_status: string;
  air_quality_note: string;
}

export interface DataSourcesResponse {
  count: number;
  sources: {
    id: string;
    dataset_name: string;
    provider: string;
    source_url: string;
    reporting_period: string | null;
    collected_at: string | null;
    last_updated: string | null;
    unit: string | null;
    data_status: string;
    processing_notes: string | null;
    used_by: string[];
  }[];
}

export interface VoiceStatus {
  provider: string;
  configured: boolean;
  sdk_installed: boolean;
  detail: string | null;
  supported_languages: { code: string; label: string }[];
  fallback: string;
  supported_actions: { intent: string; route: string; example: string }[];
}

export interface ForecastEstimateResponse {
  inputs: Record<string, string | number | null>;
  method: {
    kind: string;
    description: string;
    weather_used: boolean;
    weather_note: string | null;
    confidence: string;
    assumptions: Record<string, number>;
  };
  daily: {
    date: string;
    estimated_generation_mwh: number;
    low_mwh: number;
    high_mwh: number;
    uncertainty_pct: number;
    weather_used: boolean;
    notes: string[];
  }[];
  totals: {
    estimated_generation_mwh: number;
    low_mwh: number;
    high_mwh: number;
  };
  data_status: string;
}

export interface CarbonResponse {
  inputs: { energy_mwh: number; unit: string; emission_factor_source: string };
  factor: { kg_co2_per_kwh: number; source_name: string; source_url: string };
  result: {
    co2_avoided_kg: number;
    co2_avoided_tonnes: number;
    equivalent_trees_per_year: number;
  };
  notes: string[];
}

export interface EnergyCalculationResponse {
  inputs: Record<string, number | null>;
  result: {
    renewable_share_pct: number;
    non_fossil_share_pct: number | null;
    fossil_mwh: number;
  };
  notes: string[];
}

export interface RequirementResponse {
  inputs: Record<string, number>;
  result: {
    required_renewable_mwh: number;
    remaining_requirement_mwh: number;
    achieved_share_pct: number;
    met: boolean;
  };
  notes: string[];
}

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  database: string;
  integrations: Record<string, boolean>;
  time: string;
}
