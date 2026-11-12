import {
  EmptyState,
  PageFrame,
  SectionHeading,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApiResource } from "@/hooks/useApiResource";
import { urjaApi } from "@/services/urjaApi";
import type { MapCategory, MapLocation } from "@/services/types";
import { cn } from "@/lib/utils";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Building2,
  Compass,
  ExternalLink,
  EyeOff,
  Layers,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Recycle,
  Search,
  Sun,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/** Offline fallback so the page still renders without the API running. */
const FALLBACK_CATEGORIES: MapCategory[] = [
  { id: "solar", label: "Solar installations", group: "renewable", marker_color: "#b58a2b", count: 3 },
  { id: "wind", label: "Wind installations", group: "renewable", marker_color: "#2f7d6d", count: 1 },
  { id: "hydro", label: "Hydro stations", group: "renewable", marker_color: "#3a6ea5", count: 0 },
  { id: "government", label: "Government offices", group: "public", marker_color: "#6d3fb8", count: 2 },
  { id: "public_service", label: "Public service centres", group: "public", marker_color: "#8a5cd6", count: 1 },
  { id: "electricity", label: "Electricity utilities", group: "public", marker_color: "#b9702b", count: 0 },
  { id: "recycling", label: "Recycling facilities", group: "circular", marker_color: "#2f7d3a", count: 1 },
  { id: "healthcare", label: "Healthcare facilities", group: "public", marker_color: "#b33a3a", count: 0 },
];

const FALLBACK_LOCATIONS: MapLocation[] = [
  {
    id: "loc-1",
    name: "Ministry of New & Renewable Energy",
    category: "government",
    address: "Shram Shakti Bhawan, Rafi Marg",
    city: "New Delhi",
    state: "Delhi",
    latitude: 28.6139,
    longitude: 77.209,
    phone: "011 2371 9405",
    hours: "Mon–Fri · 9:00–17:30",
    verified: true,
    data_status: "reference",
    source_name: "MNRE",
    source_url: "https://mnre.gov.in/",
    details:
      "Ministry responsible for India's renewable energy programmes, including PM Surya Ghar.",
  },
  {
    id: "loc-2",
    name: "Bhadla Solar Park",
    category: "solar",
    address: "Bhadla, Jodhpur District",
    city: "Jodhpur",
    state: "Rajasthan",
    latitude: 27.5397,
    longitude: 71.9153,
    phone: null,
    hours: null,
    verified: true,
    data_status: "reference",
    source_name: "Rajasthan Renewable Energy Corporation",
    source_url: "https://energy.rajasthan.gov.in/rrecl",
    details: "Utility-scale solar cluster in the Thar Desert. Marker position is approximate.",
  },
  {
    id: "loc-3",
    name: "Muppandal Wind Farm",
    category: "wind",
    address: "Muppandal, Kanyakumari District",
    city: "Kanyakumari",
    state: "Tamil Nadu",
    latitude: 8.2312,
    longitude: 77.5303,
    phone: null,
    hours: null,
    verified: true,
    data_status: "reference",
    source_name: "Tamil Nadu Energy Development Agency",
    source_url: "https://teda.in/",
    details: "One of India's largest onshore wind clusters.",
  },
];

const RENEWABLE_IDS = ["solar", "wind", "hydro"];

const CATEGORY_ICONS: Record<string, typeof Sun> = {
  solar: Sun,
  wind: Wind,
  hydro: Compass,
  government: Building2,
  public_service: MapPin,
  electricity: Zap,
  recycling: Recycle,
  healthcare: Building2,
};

function allCategoryIds(categories: MapCategory[]): Set<string> {
  return new Set(categories.map((category) => category.id));
}

export default function MapPage() {
  const categoriesQuery = useApiResource(() => urjaApi.mapCategories(), []);
  const locationsQuery = useApiResource(() => urjaApi.mapLocations(), []);

  const categories = categoriesQuery.data?.categories ?? FALLBACK_CATEGORIES;
  const locations = locationsQuery.data?.locations ?? FALLBACK_LOCATIONS;

  const [active, setActive] = useState<Set<string>>(() =>
    allCategoryIds(FALLBACK_CATEGORIES),
  );
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("loc-2");
  const [mapFailed, setMapFailed] = useState(false);

  // Adopt the full category set once the API responds.
  useEffect(() => {
    if (categoriesQuery.data) {
      setActive(allCategoryIds(categoriesQuery.data.categories));
    }
  }, [categoriesQuery.data]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return locations.filter((location) => {
      if (!active.has(location.category)) return false;
      if (!needle) return true;
      return (
        location.name.toLowerCase().includes(needle) ||
        location.address.toLowerCase().includes(needle) ||
        location.city.toLowerCase().includes(needle) ||
        location.state.toLowerCase().includes(needle)
      );
    });
  }, [active, locations, query]);

  const selected =
    filtered.find((location) => location.id === selectedId) ?? filtered[0] ?? null;

  const renewableActive = RENEWABLE_IDS.every((id) => active.has(id));

  function toggleCategory(categoryId: string) {
    setActive((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  function toggleRenewable() {
    setActive((current) => {
      const next = new Set(current);
      if (RENEWABLE_IDS.every((id) => next.has(id))) {
        for (const id of RENEWABLE_IDS) next.delete(id);
      } else {
        for (const id of RENEWABLE_IDS) next.add(id);
      }
      return next;
    });
  }

  /* ---------------------------------------------------------------- */
  /* Leaflet integration                                               */
  /* ---------------------------------------------------------------- */

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    try {
      const map = L.map(containerRef.current, {
        center: [22.5, 79.5],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      // Ensure tiles and layout settle after the panel is shown.
      setTimeout(() => map.invalidateSize(), 120);
    } catch {
      setMapFailed(true);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    for (const location of filtered) {
      const category = categories.find((entry) => entry.id === location.category);
      const color = category?.marker_color ?? "#6d3fb8";
      const marker = L.circleMarker([location.latitude, location.longitude], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      });
      marker.bindPopup(
        `<strong>${location.name}</strong><br/>${location.address}<br/><span style="font-size:11px">${category?.label ?? location.category}</span>`,
      );
      marker.on("click", () => setSelectedId(location.id));
      marker.addTo(layer);
    }
  }, [filtered, categories]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    map.flyTo([selected.latitude, selected.longitude], 7, { duration: 0.6 });
  }, [selected]);

  const lastUpdated = locationsQuery.data ? "Served by URJA API" : "Offline fallback list";

  return (
    <PageFrame>
      <SectionHeading
        eyebrow="Explore map"
        title="India's energy and public-service map"
        description="Locations are reference coordinates compiled from public institutional pages, not randomly generated facilities. Map tiles © OpenStreetMap contributors."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={locationsQuery.data ? "success" : "neutral"}>
              {lastUpdated}
            </StatusBadge>
            <StatusBadge tone="neutral">{filtered.length} locations shown</StatusBadge>
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* Filters + list */}
        <div className="space-y-4">
          <Card className="rounded-[18px] border-border bg-card p-5 shadow-subtle">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="size-4" aria-hidden="true" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                Layers and search
              </span>
            </div>

            <div className="relative mt-4">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a facility, city or state"
                className="rounded-lg border-input bg-background pl-9"
                data-ocid="map.search_input"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                data-ocid="map.filter.renewable"
                aria-pressed={renewableActive}
                onClick={toggleRenewable}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth",
                  renewableActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40",
                )}
              >
                Renewable energy
              </button>
              {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category.id] ?? MapPin;
                const isActive = active.has(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    data-ocid={`map.filter.${category.id}`}
                    aria-pressed={isActive}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth",
                      isActive
                        ? "border-border bg-secondary text-foreground"
                        : "border-dashed border-border bg-card text-muted-foreground/70 hover:border-primary/40",
                    )}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: category.marker_color }}
                      aria-hidden="true"
                    />
                    <Icon className="size-3" aria-hidden="true" />
                    {category.label}
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="max-h-[520px] overflow-y-auto rounded-[18px] border-border bg-card p-2 shadow-subtle">
            {locationsQuery.loading && (
              <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading locations…
              </p>
            )}

            {filtered.length === 0 && !locationsQuery.loading && (
              <div className="p-4">
                <EmptyState
                  title="No locations match"
                  description="Adjust the layer filters or clear the search to see facilities again."
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setQuery("");
                        setActive(allCategoryIds(categories));
                      }}
                    >
                      Reset filters
                    </Button>
                  }
                />
              </div>
            )}

            <ul className="divide-y divide-border/60">
              {filtered.map((location) => {
                const category = categories.find(
                  (entry) => entry.id === location.category,
                );
                const isSelected = selected?.id === location.id;
                return (
                  <li key={location.id}>
                    <button
                      type="button"
                      data-ocid={`map.marker.${location.id}`}
                      onClick={() => setSelectedId(location.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "w-full rounded-xl px-3 py-3 text-left transition-smooth",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-secondary",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: category?.marker_color }}
                          aria-hidden="true"
                        />
                        <span className="truncate text-sm font-medium">
                          {location.name}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {location.address} · {location.city}
                      </span>
                      {!location.verified && (
                        <span className="mt-1 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-warning">
                          <EyeOff className="size-3" aria-hidden="true" />
                          Directory pointer
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Map + detail */}
        <div className="space-y-4">
          <Card className="overflow-hidden rounded-[18px] border-border bg-card p-0 shadow-subtle">
            <div
              ref={containerRef}
              data-ocid="map.canvas"
              role="application"
              aria-label="Interactive map of energy and public service locations"
              className="h-[420px] w-full bg-muted/40 md:h-[520px]"
            />
            {mapFailed && (
              <div className="border-t border-border p-4 text-sm text-muted-foreground">
                The interactive map could not initialise in this browser. Use the
                location list to browse facilities and open their source links.
              </div>
            )}
          </Card>

          {selected ? (
            <Card
              data-ocid="map.detail_card"
              className="rounded-[18px] border-border bg-card p-6 shadow-subtle"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                    {categories.find((entry) => entry.id === selected.category)?.label ??
                      selected.category}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
                    {selected.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span>{selected.address}</span> · {selected.city},{" "}
                    {selected.state}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge tone={selected.verified ? "success" : "warning"}>
                    {selected.verified ? "Verified location" : "Directory pointer"}
                  </StatusBadge>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {selected.data_status}
                  </span>
                </div>
              </div>

              {selected.details && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {selected.details}
                </p>
              )}

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/30 px-3 py-2">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    Coordinates
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm text-foreground">
                    {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                  </dd>
                </div>
                {selected.phone && (
                  <div className="rounded-xl border border-border bg-muted/30 px-3 py-2">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      Contact
                    </dt>
                    <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-foreground">
                      <Phone className="size-3.5" aria-hidden="true" />
                      {selected.phone}
                    </dd>
                  </div>
                )}
                {selected.hours && (
                  <div className="rounded-xl border border-border bg-muted/30 px-3 py-2">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      Hours
                    </dt>
                    <dd className="mt-0.5 text-sm text-foreground">{selected.hours}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={selected.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary"
                >
                  {selected.source_name}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    mapRef.current?.flyTo(
                      [selected.latitude, selected.longitude],
                      9,
                      { duration: 0.6 },
                    );
                  }}
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Zoom in
                </Button>
              </div>
            </Card>
          ) : (
            <EmptyState
              title="No location selected"
              description="Choose a facility from the list or click a marker on the map."
            />
          )}

          <p className="text-xs text-muted-foreground">
            {locationsQuery.data?.note ??
              "Marker positions are approximate. Every record links to its source."}{" "}
            Map data © OpenStreetMap contributors.
          </p>
        </div>
      </div>
    </PageFrame>
  );
}
