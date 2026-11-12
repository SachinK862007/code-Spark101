import {
  ErrorState,
  PageFrame,
  SectionHeading,
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
import { errorMessage, useApiAction, useApiResource } from "@/hooks/useApiResource";
import { urjaApi } from "@/services/urjaApi";
import type {
  CurrentWeatherResponse,
  ForecastResponse,
  WeatherLocation,
} from "@/services/types";
import { cn } from "@/lib/utils";
import {
  CloudRain,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const COUNTRIES = [
  { code: "IN", label: "India" },
  { code: "LK", label: "Sri Lanka" },
  { code: "NP", label: "Nepal" },
  { code: "BD", label: "Bangladesh" },
  { code: "BT", label: "Bhutan" },
];

const STATE_SUGGESTIONS = [
  "Karnataka",
  "Maharashtra",
  "Rajasthan",
  "Gujarat",
  "Tamil Nadu",
  "Delhi",
  "Uttar Pradesh",
  "Telangana",
  "Kerala",
  "West Bengal",
];

const DEFAULT_CITY = "Bengaluru";

function formatTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function formatLastUpdated(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Wind;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-5 shadow-subtle">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function WeatherPage() {
  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("Karnataka");
  const [city, setCity] = useState(DEFAULT_CITY);
  const [selected, setSelected] = useState<{ city: string; state: string }>({
    city: DEFAULT_CITY,
    state: "Karnataka",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const status = useApiResource(() => urjaApi.weatherStatus(), []);
  const configured = status.data?.configured ?? false;

  const current = useApiResource<CurrentWeatherResponse>(
    () =>
      urjaApi.weatherCurrent({
        city: selected.city,
        state: selected.state || undefined,
      }),
    [selected.city, selected.state],
    { enabled: configured },
  );

  const forecast = useApiResource<ForecastResponse>(
    () =>
      urjaApi.weatherForecast({
        city: selected.city,
        state: selected.state || undefined,
      }),
    [selected.city, selected.state],
    { enabled: configured },
  );

  const search = useApiAction(async () => urjaApi.weatherLocations(searchTerm));

  const matches: WeatherLocation[] = search.data?.locations ?? [];

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const nextCity = city.trim();
      if (!nextCity) return;
      setSelected({ city: nextCity, state: state.trim() });
    },
    [city, state],
  );

  const refresh = useCallback(() => {
    void current.reload();
    void forecast.reload();
    void status.reload();
  }, [current, forecast, status]);

  const lastUpdated = useMemo(
    () => current.data?.retrieved_at ?? forecast.data?.retrieved_at ?? null,
    [current.data, forecast.data],
  );

  const daily = forecast.data?.forecast.daily ?? [];
  const intervals = (forecast.data?.forecast.intervals ?? []).slice(0, 8);
  const maxTemp = Math.max(...daily.map((day) => day.max_temp_c), 1);

  return (
    <PageFrame>
      <SectionHeading
        eyebrow="Weather intelligence"
        title="Weather for your energy decisions"
        description="Current conditions and the provider's available forecast, retrieved server-side from OpenWeatherMap. The API key never reaches the browser."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={configured ? "success" : "warning"}>
              {configured ? "Provider connected" : "Not configured"}
            </StatusBadge>
            <Button
              type="button"
              variant="outline"
              onClick={refresh}
              disabled={!configured || current.loading}
              className="rounded-full"
              data-ocid="weather.refresh_button"
            >
              {current.loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="size-4" aria-hidden="true" />
              )}
              Refresh
            </Button>
          </div>
        }
      />

      {!configured && !status.loading && (
        <Card className="mt-8 rounded-[18px] border-warning/30 bg-warning/5 p-6 shadow-subtle">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Add an OpenWeatherMap key to enable this page
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {status.data?.message ??
              "Weather is not configured. Add OPENWEATHER_API_KEY to backend/.env."}
          </p>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            backend/.env → OPENWEATHER_API_KEY=your_key · then restart uvicorn
          </p>
        </Card>
      )}

      {/* Location selector */}
      <Card className="mt-8 rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="weather-country"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Country
            </label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger
                id="weather-country"
                className="rounded-lg border-input bg-background"
                data-ocid="weather.country_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((entry) => (
                  <SelectItem key={entry.code} value={entry.code}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="weather-state"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              State
            </label>
            <Input
              id="weather-state"
              list="weather-states"
              value={state}
              onChange={(event) => setState(event.target.value)}
              placeholder="e.g. Karnataka"
              className="rounded-lg border-input bg-background"
              data-ocid="weather.state_input"
            />
            <datalist id="weather-states">
              {STATE_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="weather-city"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              City
            </label>
            <Input
              id="weather-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="e.g. Bengaluru"
              className="rounded-lg border-input bg-background"
              data-ocid="weather.city_input"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={!configured}
              className="w-full rounded-full"
              data-ocid="weather.get_weather_button"
            >
              {current.loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <MapPin className="size-4" aria-hidden="true" />
              )}
              Get weather
            </Button>
          </div>
        </form>

        {/* Searchable location */}
        <div className="mt-6 border-t border-border pt-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Search a location
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Start typing a city name"
              className="rounded-lg border-input bg-background"
              data-ocid="weather.search_input"
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!configured || searchTerm.trim().length < 2 || search.loading}
              onClick={() => {
                setShowSuggestions(true);
                void search.run(undefined as never);
              }}
              data-ocid="weather.search_button"
            >
              {search.loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              Search
            </Button>
          </div>

          {showSuggestions && matches.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {matches.map((match) => (
                <button
                  key={`${match.name}-${match.latitude}-${match.longitude}`}
                  type="button"
                  onClick={() => {
                    setCity(match.name);
                    setState(match.state ?? "");
                    setSelected({ city: match.name, state: match.state ?? "" });
                    setShowSuggestions(false);
                  }}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-smooth hover:border-primary/40 hover:bg-secondary"
                >
                  {match.name}
                  {match.state ? `, ${match.state}` : ""}
                </button>
              ))}
            </div>
          )}

          {search.error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {search.error.message}
            </p>
          )}
        </div>
      </Card>

      {/* Current conditions */}
      <div className="mt-8">
        {current.loading && (
          <Card className="rounded-[18px] border-border bg-card p-8 shadow-subtle">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Fetching current conditions for {selected.city}…
            </div>
          </Card>
        )}

        {current.error && configured && (
          <ErrorState
            title="Weather unavailable"
            description={errorMessage(current.error) ?? undefined}
            onRetry={() => void current.reload()}
          />
        )}

        {current.data && !current.loading && (
          <Card
            data-ocid="weather.current_card"
            className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {current.data.location.name}
                  {current.data.location.state
                    ? ` · ${current.data.location.state}`
                    : ""}{" "}
                  · {current.data.location.country}
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <span className="font-display text-6xl font-semibold tracking-tight text-foreground">
                    {Math.round(current.data.current.temperature_c)}°
                  </span>
                  <div className="pb-2">
                    <p className="text-lg font-medium capitalize text-foreground">
                      {current.data.current.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Feels like{" "}
                      {Math.round(current.data.current.feels_like_c)}°C · humidity{" "}
                      {current.data.current.humidity_pct}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {current.data.current.icon_url && (
                  <img
                    src={current.data.current.icon_url}
                    alt={current.data.current.description}
                    className="size-20"
                    loading="lazy"
                  />
                )}
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    Min {Math.round(current.data.current.min_temp_c)}° · Max{" "}
                    {Math.round(current.data.current.max_temp_c)}°
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Sunrise className="size-3.5" aria-hidden="true" />
                    {formatTime(current.data.current.sunrise)}
                    <Sunset className="ml-2 size-3.5" aria-hidden="true" />
                    {formatTime(current.data.current.sunset)}
                  </p>
                  <p className="font-mono text-xs">
                    {current.data.cached ? "Cached result" : "Fresh fetch"} ·{" "}
                    {current.data.provider}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                label="Wind"
                value={`${current.data.current.wind_speed_ms.toFixed(1)} m/s`}
                hint={`Direction ${current.data.current.wind_direction} (${current.data.current.wind_direction_deg}°)`}
                icon={Wind}
              />
              <StatTile
                label="Humidity"
                value={`${current.data.current.humidity_pct}%`}
                hint={`Cloud cover ${current.data.current.clouds_pct}%`}
                icon={Droplets}
              />
              <StatTile
                label="Pressure"
                value={`${current.data.current.pressure_hpa} hPa`}
                hint="Atmospheric pressure"
                icon={Gauge}
              />
              <StatTile
                label="Visibility"
                value={
                  current.data.current.visibility_m === null
                    ? "Not available"
                    : `${(current.data.current.visibility_m / 1000).toFixed(1)} km`
                }
                hint="Provider-dependent"
                icon={Eye}
              />
            </div>

            <p className="mt-5 font-mono text-xs text-muted-foreground">
              Last successful retrieval {formatLastUpdated(lastUpdated)} · observed{" "}
              {formatLastUpdated(current.data.current.observed_at)}
            </p>
          </Card>
        )}
      </div>

      {/* Forecast */}
      {forecast.data && (
        <>
          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Weather forecast
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                {forecast.data.forecast.provider}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {daily.map((day) => (
                <div
                  key={day.date}
                  className="rounded-[18px] border border-border bg-card p-5 shadow-subtle"
                >
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {new Date(`${day.date}T00:00:00`).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="font-mono text-2xl font-semibold text-foreground">
                      {Math.round(day.max_temp_c)}°
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {Math.round(day.min_temp_c)}°
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{
                        width: `${Math.max(6, (day.max_temp_c / maxTemp) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CloudRain className="size-3.5" aria-hidden="true" />
                    {day.precipitation_probability}% rain
                    <Wind className="ml-2 size-3.5" aria-hidden="true" />
                    {day.wind_speed_ms.toFixed(1)} m/s
                  </p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {day.condition ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {intervals.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Next intervals
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {intervals.map((interval) => (
                  <div
                    key={interval.time}
                    className={cn(
                      "flex items-center gap-3 rounded-[18px] border border-border bg-card p-4 shadow-subtle",
                    )}
                  >
                    {interval.icon_url && (
                      <img
                        src={interval.icon_url}
                        alt={interval.description}
                        className="size-10"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {new Date(interval.time.replace(" ", "T")).toLocaleString(
                          "en-IN",
                          { day: "numeric", month: "short", hour: "2-digit" },
                        )}
                      </p>
                      <p className="font-mono text-lg font-semibold text-foreground">
                        {Math.round(interval.temperature_c)}°
                      </p>
                      <p className="truncate text-xs capitalize text-muted-foreground">
                        {interval.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {forecast.error && configured && !forecast.loading && (
        <Card className="mt-8 rounded-[18px] border-warning/30 bg-warning/5 p-6 shadow-subtle">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Thermometer className="size-4 text-warning" aria-hidden="true" />
            {forecast.error.message}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            OpenWeatherMap includes current conditions and the 5 day / 3 hour forecast
            on the free plan. Other endpoints require a paid subscription.
          </p>
        </Card>
      )}

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Compass className="size-3.5" aria-hidden="true" />
          Weather data by OpenWeatherMap. Values are shown as received; no
          interpolation is applied.
        </p>
        <p className="mt-2 flex items-center gap-2">
          <Sun className="size-3.5" aria-hidden="true" />
          Sunrise and sunset are displayed in IST.
        </p>
      </footer>
    </PageFrame>
  );
}
