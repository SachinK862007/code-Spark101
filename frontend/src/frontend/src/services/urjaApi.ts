/**
 * Typed endpoint functions. Components must call these instead of `fetch`
 * directly, so the base URL, headers, errors and session scope stay in one place.
 */

import { apiRequest } from "./apiClient";
import type {
  AskResponse,
  CarbonResponse,
  CircularityResponse,
  CurrentWeatherResponse,
  DataSourcesResponse,
  EnergyCalculationResponse,
  EnergyMixResponse,
  EnergyStatesResponse,
  EnergySummary,
  EnvironmentResponse,
  FinanceResponse,
  ForecastEstimateResponse,
  ForecastResponse,
  HealthResponse,
  JobsResponse,
  MapCategory,
  MapLocationsResponse,
  RequirementResponse,
  RpoCalculationRequest,
  RpoCalculationResponse,
  RpoTargetsResponse,
  ServiceRecord,
  ServicesResponse,
  SolarCalculationRequest,
  SolarCalculationResponse,
  VoiceStatus,
  WeatherLocation,
  WeatherStatus,
} from "./types";

const V1 = "/api/v1";

export const urjaApi = {
  health: () => apiRequest<HealthResponse>(`${V1}/health`),

  // ---------------------------------------------------------------- Ask
  ask: (payload: {
    question: string;
    previous_question?: string | null;
    limit?: number;
  }) =>
    apiRequest<AskResponse>(`${V1}/ask`, {
      method: "POST",
      body: { ...payload, session_id: "anonymous" },
      timeoutMs: 25_000,
    }),

  askHistory: (limit = 20) =>
    apiRequest<{ count: number; turns: unknown[] }>(`${V1}/ask/history`, {}, {
      limit,
    }),

  // -------------------------------------------------------------- Energy
  energyMix: () => apiRequest<EnergyMixResponse>(`${V1}/energy/mix`),
  energyCapacity: () => apiRequest<EnergyMixResponse["capacity"]>(`${V1}/energy/capacity`),
  energyGeneration: () =>
    apiRequest<EnergyMixResponse["generation"]>(`${V1}/energy/generation`),
  energySummary: () => apiRequest<EnergySummary>(`${V1}/energy/summary`),
  energyStates: () => apiRequest<EnergyStatesResponse>(`${V1}/energy/states`),
  energyContribution: (payload: {
    total_mwh: number;
    renewable_mwh: number;
    non_fossil_mwh?: number | null;
  }) =>
    apiRequest<EnergyCalculationResponse>(`${V1}/energy/calculate`, {
      method: "POST",
      body: payload,
    }),
  energyRequirement: (payload: {
    total_mwh: number;
    target_pct: number;
    existing_renewable_mwh: number;
  }) =>
    apiRequest<RequirementResponse>(`${V1}/energy/requirement`, {
      method: "POST",
      body: payload,
    }),

  // ----------------------------------------------------------------- RPO
  rpoTargets: () => apiRequest<RpoTargetsResponse>(`${V1}/rpo/targets`),
  rpoCalculate: (payload: RpoCalculationRequest) =>
    apiRequest<RpoCalculationResponse>(`${V1}/rpo/calculate`, {
      method: "POST",
      body: payload,
    }),

  // --------------------------------------------------------------- Solar
  solarCalculate: (payload: SolarCalculationRequest) =>
    apiRequest<SolarCalculationResponse>(`${V1}/solar/calculate`, {
      method: "POST",
      body: payload,
    }),

  // ------------------------------------------------------------- Weather
  weatherStatus: () => apiRequest<WeatherStatus>(`${V1}/weather/status`),
  weatherLocations: (q: string) =>
    apiRequest<{ count: number; locations: WeatherLocation[] }>(
      `${V1}/weather/locations`,
      {},
      { q },
    ),
  weatherCurrent: (location: {
    city: string;
    state?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }) =>
    apiRequest<CurrentWeatherResponse>(`${V1}/weather/current`, {}, {
      city: location.city,
      state: location.state ?? undefined,
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
    }),
  weatherForecast: (location: {
    city: string;
    state?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }) =>
    apiRequest<ForecastResponse>(`${V1}/weather/forecast`, {}, {
      city: location.city,
      state: location.state ?? undefined,
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
    }),

  // ---------------------------------------------------------------- Maps
  mapCategories: () =>
    apiRequest<{ count: number; categories: MapCategory[] }>(`${V1}/maps/categories`),
  mapLocations: (params: { category?: string[]; group?: string[]; q?: string } = {}) =>
    apiRequest<MapLocationsResponse>(`${V1}/maps/locations`, {}, params),

  // ------------------------------------------------------------ Services
  services: (params: { q?: string; category?: string; state?: string } = {}) =>
    apiRequest<ServicesResponse>(`${V1}/services`, {}, params),
  service: (id: string) => apiRequest<ServiceRecord>(`${V1}/services/${id}`),

  // ------------------------------------------------------------- Modules
  jobs: (params: { q?: string; category?: string; state?: string } = {}) =>
    apiRequest<JobsResponse>(`${V1}/jobs`, {}, params),
  finance: (params: { q?: string; type?: string } = {}) =>
    apiRequest<FinanceResponse>(`${V1}/finance`, {}, params),
  circularity: () => apiRequest<CircularityResponse>(`${V1}/circularity`),
  environment: (region?: string) =>
    apiRequest<EnvironmentResponse>(`${V1}/environment`, {}, { region }),
  carbonCalculate: (payload: {
    energy_mwh: number;
    unit?: "kWh" | "MWh";
    emission_factor_source?: "grid" | "coal" | "gas" | "diesel";
  }) =>
    apiRequest<CarbonResponse>(`${V1}/environment/carbon-calculate`, {
      method: "POST",
      body: payload,
    }),
  dataSources: () => apiRequest<DataSourcesResponse>(`${V1}/data-sources`),

  // ---------------------------------------------------------- Forecasting
  forecastEstimate: (payload: {
    location: string;
    state?: string | null;
    technology: "solar" | "wind";
    capacity_mw: number;
    horizon_days: number;
    latitude?: number | null;
    longitude?: number | null;
  }) =>
    apiRequest<ForecastEstimateResponse>(`${V1}/forecasting/estimate`, {
      method: "POST",
      body: payload,
      timeoutMs: 30_000,
    }),
  batterySizing: (payload: {
    daily_energy_kwh: number;
    autonomy_days: number;
    depth_of_discharge?: number;
    roundtrip_efficiency?: number;
  }) =>
    apiRequest<{
      result: { usable_capacity_kwh: number; required_capacity_kwh: number; required_capacity_mwh: number };
    }>(`${V1}/forecasting/battery`, { method: "POST", body: payload }),

  // --------------------------------------------------------------- Voice
  voiceStatus: () => apiRequest<VoiceStatus>(`${V1}/voice/status`),
};
