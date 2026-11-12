import { SampleTag, StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronDown,
  Clock,
  Compass,
  Cross,
  FileText,
  Layers,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
  Search,
  Sun,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Map-specific sample data (illustrative only — nothing is fetched)   */
/* ------------------------------------------------------------------ */

type CategoryId =
  | "government"
  | "service"
  | "healthcare"
  | "electricity"
  | "ev"
  | "renewable"
  | "other";

interface Category {
  id: CategoryId;
  label: string;
  short: string;
  icon: typeof Building2;
  /** marker fill + ring classes */
  marker: string;
  dot: string;
}

const CATEGORIES: Category[] = [
  {
    id: "government",
    label: "Government offices",
    short: "Govt offices",
    icon: Building2,
    marker: "bg-primary text-primary-foreground",
    dot: "bg-primary",
  },
  {
    id: "service",
    label: "Public service centres",
    short: "Service centres",
    icon: FileText,
    marker: "bg-chart-4 text-white",
    dot: "bg-chart-4",
  },
  {
    id: "healthcare",
    label: "Healthcare facilities",
    short: "Healthcare",
    icon: Cross,
    marker: "bg-destructive text-destructive-foreground",
    dot: "bg-destructive",
  },
  {
    id: "electricity",
    label: "Electricity service centres",
    short: "Electricity",
    icon: Zap,
    marker: "bg-warning text-warning-foreground",
    dot: "bg-warning",
  },
  {
    id: "ev",
    label: "EV charging stations",
    short: "EV charging",
    icon: Compass,
    marker: "bg-success text-success-foreground",
    dot: "bg-success",
  },
  {
    id: "renewable",
    label: "Renewable energy locations",
    short: "Renewable",
    icon: Sun,
    marker: "bg-accent text-accent-foreground",
    dot: "bg-accent",
  },
  {
    id: "other",
    label: "Other public resources",
    short: "Other",
    icon: MapPin,
    marker: "bg-muted-foreground text-background",
    dot: "bg-muted-foreground",
  },
];

const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

interface MapLocation {
  id: string;
  name: string;
  category: CategoryId;
  address: string;
  city: string;
  state: string;
  phone: string;
  hours: string;
  verified: boolean;
  source: string;
  x: number;
  y: number;
}

const LOCATIONS: MapLocation[] = [
  {
    id: "loc-1",
    name: "Shram Shakti Bhawan",
    category: "government",
    address: "Rafi Marg, Sansad Marg Area",
    city: "New Delhi",
    state: "Delhi",
    phone: "+91 11 2371 0400",
    hours: "Mon–Fri · 9:30 AM – 6:00 PM",
    verified: true,
    source: "Ministry of Power",
    x: 40,
    y: 26,
  },
  {
    id: "loc-2",
    name: "Bhadla Solar Park",
    category: "renewable",
    address: "Bhadla, Jodhpur District",
    city: "Jodhpur",
    state: "Rajasthan",
    phone: "+91 291 254 1100",
    hours: "Open 24 hours",
    verified: true,
    source: "MNRE",
    x: 24,
    y: 40,
  },
  {
    id: "loc-3",
    name: "Pavagada Solar Park",
    category: "renewable",
    address: "Pavagada Taluk, Tumkur District",
    city: "Tumkur",
    state: "Karnataka",
    phone: "+91 813 324 4400",
    hours: "Open 24 hours",
    verified: true,
    source: "Karnataka Solar Power",
    x: 42,
    y: 76,
  },
  {
    id: "loc-4",
    name: "Mundra Grid Substation",
    category: "electricity",
    address: "Mundra Port Road, Kutch District",
    city: "Mundra",
    state: "Gujarat",
    phone: "+91 283 825 5600",
    hours: "Mon–Sat · 8:00 AM – 8:00 PM",
    verified: true,
    source: "PGCIL",
    x: 18,
    y: 52,
  },
  {
    id: "loc-5",
    name: "Talcher Thermal Substation",
    category: "electricity",
    address: "Talcher, Angul District",
    city: "Talcher",
    state: "Odisha",
    phone: "+91 676 024 1200",
    hours: "Open 24 hours",
    verified: false,
    source: "Community submission",
    x: 64,
    y: 56,
  },
  {
    id: "loc-6",
    name: "RLDC Kolkata",
    category: "government",
    address: "Salt Lake Sector V, Bidhannagar",
    city: "Kolkata",
    state: "West Bengal",
    phone: "+91 33 2357 8100",
    hours: "Mon–Fri · 9:00 AM – 5:30 PM",
    verified: true,
    source: "Grid-India",
    x: 72,
    y: 46,
  },
  {
    id: "loc-7",
    name: "AIIMS Community Health Centre",
    category: "healthcare",
    address: "Ansari Nagar East, Aurobindo Marg",
    city: "New Delhi",
    state: "Delhi",
    phone: "+91 11 2658 8500",
    hours: "Open 24 hours",
    verified: true,
    source: "Ministry of Health",
    x: 44,
    y: 30,
  },
  {
    id: "loc-8",
    name: "Passport Seva Kendra",
    category: "service",
    address: "Hudco Trikona, Bhikaji Cama Place",
    city: "New Delhi",
    state: "Delhi",
    phone: "+91 11 2617 4400",
    hours: "Mon–Fri · 9:00 AM – 4:30 PM",
    verified: true,
    source: "MEA",
    x: 37,
    y: 33,
  },
  {
    id: "loc-9",
    name: "Tata Power EV Hub",
    category: "ev",
    address: "Bandra Kurla Complex, G Block",
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91 22 6665 8282",
    hours: "Open 24 hours",
    verified: true,
    source: "Tata Power",
    x: 28,
    y: 62,
  },
  {
    id: "loc-10",
    name: "BESCOM Consumer Centre",
    category: "service",
    address: "K R Circle, Ambedkar Veedhi",
    city: "Bengaluru",
    state: "Karnataka",
    phone: "+91 80 2226 6000",
    hours: "Mon–Sat · 10:00 AM – 5:00 PM",
    verified: true,
    source: "BESCOM",
    x: 44,
    y: 80,
  },
  {
    id: "loc-11",
    name: "Kamuthi Solar Farm",
    category: "renewable",
    address: "Kamuthi, Ramanathapuram District",
    city: "Kamuthi",
    state: "Tamil Nadu",
    phone: "+91 456 726 3300",
    hours: "Open 24 hours",
    verified: false,
    source: "Community submission",
    x: 46,
    y: 88,
  },
  {
    id: "loc-12",
    name: "Regional Passport Office",
    category: "government",
    address: "Sector 34-A, Chandigarh",
    city: "Chandigarh",
    state: "Punjab",
    phone: "+91 172 266 4400",
    hours: "Mon–Fri · 9:00 AM – 5:00 PM",
    verified: true,
    source: "MEA",
    x: 34,
    y: 18,
  },
];

const STATES = [
  "All states",
  "Delhi",
  "Rajasthan",
  "Gujarat",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Odisha",
  "West Bengal",
  "Punjab",
];

/* ------------------------------------------------------------------ */
/* Map canvas — static illustrated map with roads, boundaries, labels  */
/* ------------------------------------------------------------------ */

function MapCanvas({
  locations,
  selectedId,
  onSelect,
  zoom,
}: {
  locations: MapLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  zoom: number;
}) {
  return (
    <div
      data-ocid="map.canvas"
      className="absolute inset-0 overflow-hidden bg-[oklch(0.97_0.012_95)]"
      aria-label="Illustrative map of India showing public service locations"
    >
      {/* Zoomable layer */}
      <div
        className="absolute inset-0 origin-center transition-transform duration-500 ease-out"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Base map illustration */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <title>Illustrative map base</title>
          <defs>
            <pattern
              id="map-grid"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 6 0 L 0 0 0 6"
                fill="none"
                className="stroke-border"
                strokeWidth="0.15"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#map-grid)" />

          {/* Landmass silhouette (stylised) */}
          <path
            d="M30 8 L46 6 L58 12 L70 14 L78 24 L74 34 L80 44 L72 54 L66 66 L58 78 L50 90 L44 96 L40 88 L34 78 L28 66 L22 56 L16 46 L20 34 L24 22 Z"
            className="fill-[oklch(0.945_0.02_120)] stroke-[oklch(0.86_0.03_120)]"
            strokeWidth="0.4"
          />

          {/* State boundary lines */}
          <g
            className="stroke-[oklch(0.82_0.03_120)]"
            strokeWidth="0.25"
            fill="none"
            strokeDasharray="1.4 1"
          >
            <path d="M24 22 L40 26 L52 22 L70 14" />
            <path d="M20 34 L38 38 L56 34 L74 34" />
            <path d="M16 46 L34 50 L52 46 L80 44" />
            <path d="M22 56 L40 60 L58 56 L72 54" />
            <path d="M28 66 L44 70 L60 66 L66 66" />
            <path d="M34 78 L46 82 L58 78" />
            <path d="M40 26 L38 38 L34 50 L40 60 L44 70 L46 82" />
            <path d="M52 22 L56 34 L52 46 L58 56 L60 66 L58 78" />
          </g>

          {/* Major roads */}
          <g
            className="stroke-[oklch(0.9_0.02_80)]"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
          >
            <path d="M34 18 L40 26 L44 30 L37 33 L28 62 L44 80 L46 88" />
            <path d="M24 40 L40 26 L72 46" />
            <path d="M18 52 L28 62 L44 80" />
            <path d="M64 56 L72 46 L80 44" />
          </g>

          {/* Rivers */}
          <g
            className="stroke-[oklch(0.78_0.06_230)]"
            strokeWidth="0.6"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          >
            <path d="M30 8 L36 22 L34 38 L40 52 L46 66 L50 82 L44 96" />
            <path d="M58 12 L60 28 L56 42 L62 56 L66 66" />
          </g>
        </svg>

        {/* Locality labels */}
        <span className="absolute left-[36%] top-[22%] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          Delhi NCR
        </span>
        <span className="absolute left-[20%] top-[38%] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          Rajasthan
        </span>
        <span className="absolute left-[14%] top-[50%] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          Gujarat
        </span>
        <span className="absolute left-[24%] top-[60%] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          Maharashtra
        </span>
        <span className="absolute left-[40%] top-[78%] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          Karnataka
        </span>
        <span className="absolute left-[62%] top-[44%] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          West Bengal
        </span>

        {/* Markers */}
        {locations.map((loc) => {
          const category = CATEGORY_BY_ID[loc.category];
          const Icon = category.icon;
          const selected = loc.id === selectedId;
          return (
            <button
              key={loc.id}
              type="button"
              data-ocid={`map.marker.${loc.id}`}
              onClick={() => onSelect(loc.id)}
              aria-label={`${loc.name}, ${category.label}`}
              aria-pressed={selected}
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              className={cn(
                "group absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                selected ? "z-20 scale-110" : "z-10 hover:scale-105",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full border-2 border-card shadow-elevated transition-smooth",
                  category.marker,
                  selected ? "size-9" : "size-7",
                )}
              >
                <Icon
                  className={selected ? "size-4" : "size-3.5"}
                  aria-hidden="true"
                />
              </span>
              {selected && (
                <span
                  className={cn(
                    "absolute inset-0 -z-10 animate-ping rounded-full opacity-40",
                    category.dot,
                  )}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[10px] font-medium text-foreground shadow-subtle transition-smooth",
                  selected
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100",
                )}
              >
                {loc.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Left panel — search, state selector, layer filters                  */
/* ------------------------------------------------------------------ */

function FilterPanel({
  query,
  onQueryChange,
  state,
  onStateChange,
  activeCategories,
  onToggleCategory,
  onClear,
  resultCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  state: string;
  onStateChange: (value: string) => void;
  activeCategories: CategoryId[];
  onToggleCategory: (id: CategoryId) => void;
  onClear: () => void;
  resultCount: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Explore
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
              Explore Map
            </h1>
          </div>
          <SampleTag />
        </div>

        {/* Location search */}
        <div className="relative mt-5">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            data-ocid="map.search_input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search a location or landmark"
            aria-label="Search location"
            className="w-full rounded-full border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>

        {/* State / city selector */}
        <div className="relative mt-3">
          <label htmlFor="map-state-select" className="sr-only">
            State or city
          </label>
          <select
            id="map-state-select"
            data-ocid="map.state_select"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full appearance-none rounded-full border border-input bg-card py-2.5 pl-4 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Layer filters */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Layers
          </p>
          <button
            type="button"
            data-ocid="map.clear_filters_button"
            onClick={onClear}
            className="text-xs font-medium text-primary transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Reset
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const active = activeCategories.includes(category.id);
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                data-ocid={`map.filter.${category.id}`}
                aria-pressed={active}
                onClick={() => onToggleCategory(category.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {category.short}
              </button>
            );
          })}
        </div>

        <p className="mt-5 font-mono text-xs text-muted-foreground">
          {resultCount} {resultCount === 1 ? "location" : "locations"} shown
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating detail card                                                */
/* ------------------------------------------------------------------ */

function DetailCard({
  location,
  onClose,
}: {
  location: MapLocation;
  onClose: () => void;
}) {
  const category = CATEGORY_BY_ID[location.category];
  const Icon = category.icon;
  return (
    <div
      data-ocid="map.detail_card"
      className="pointer-events-auto w-full max-w-sm animate-fade-in-up rounded-[20px] border border-border bg-card p-5 shadow-floating"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              category.marker,
            )}
            aria-hidden="true"
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
              {location.name}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {category.label}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-ocid="map.detail_card.close_button"
          onClick={onClose}
          aria-label="Close location details"
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Minus className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-start gap-2.5">
          <MapPin
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <dd className="text-foreground">
            {location.address}
            <span className="block text-xs text-muted-foreground">
              {location.city}, {location.state}
            </span>
          </dd>
        </div>
        <div className="flex items-start gap-2.5">
          <Phone
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <dd className="font-mono text-foreground">{location.phone}</dd>
        </div>
        <div className="flex items-start gap-2.5">
          <Clock
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <dd className="text-foreground">{location.hours}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <StatusBadge tone={location.verified ? "success" : "warning"}>
          {location.verified ? "Verified" : "Unverified"}
        </StatusBadge>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="size-1.5 rounded-full bg-primary/60"
            aria-hidden="true"
          />
          Source: {location.source}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          data-ocid="map.detail_card.view_details_button"
          className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View details
        </button>
        <button
          type="button"
          data-ocid="map.detail_card.directions_button"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Navigation className="size-4" aria-hidden="true" />
          Directions
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Map controls — zoom, locate, legend, layer selector                 */
/* ------------------------------------------------------------------ */

function MapControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onLocate,
  activeCategories,
  onToggleCategory,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  activeCategories: CategoryId[];
  onToggleCategory: (id: CategoryId) => void;
}) {
  const [legendOpen, setLegendOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* Zoom + locate */}
      <div className="pointer-events-auto absolute right-4 top-4 flex flex-col gap-2">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
          <button
            type="button"
            data-ocid="map.zoom_in_button"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="flex size-10 items-center justify-center text-foreground transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
          <span className="h-px bg-border" aria-hidden="true" />
          <button
            type="button"
            data-ocid="map.zoom_out_button"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="flex size-10 items-center justify-center text-foreground transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          data-ocid="map.locate_button"
          onClick={onLocate}
          aria-label="Centre on current location"
          className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-elevated transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <LocateFixed className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Layer selector */}
      <div className="pointer-events-auto absolute right-4 top-40 w-52">
        <button
          type="button"
          data-ocid="map.layer_selector_button"
          onClick={() => setLayersOpen((v) => !v)}
          aria-expanded={layersOpen}
          className="flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground shadow-elevated transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="inline-flex items-center gap-2">
            <Layers className="size-4 text-primary" aria-hidden="true" />
            Layers
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              layersOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
        {layersOpen && (
          <div className="mt-2 animate-fade-in rounded-2xl border border-border bg-card p-2 shadow-floating">
            {CATEGORIES.map((category) => {
              const active = activeCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  data-ocid={`map.layer_toggle.${category.id}`}
                  aria-pressed={active}
                  onClick={() => onToggleCategory(category.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs text-foreground transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={cn("size-2.5 rounded-full", category.dot)}
                      aria-hidden="true"
                    />
                    {category.short}
                  </span>
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full border text-[9px]",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-transparent",
                    )}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="pointer-events-auto absolute bottom-4 right-4 w-56">
        <div className="rounded-2xl border border-border bg-card/95 shadow-elevated backdrop-blur-sm">
          <button
            type="button"
            data-ocid="map.legend_toggle"
            onClick={() => setLegendOpen((v) => !v)}
            aria-expanded={legendOpen}
            className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              Legend
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                legendOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
          {legendOpen && (
            <ul className="space-y-1.5 border-t border-border px-3.5 py-3">
              {CATEGORIES.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span
                    className={cn("size-2.5 rounded-full", category.dot)}
                    aria-hidden="true"
                  />
                  {category.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Zoom readout */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-border bg-card/95 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-subtle backdrop-blur-sm">
        Zoom {zoom.toFixed(1)}× · Sample data
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function MapPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("All states");
  const [activeCategories, setActiveCategories] = useState<CategoryId[]>(
    CATEGORIES.map((c) => c.id),
  );
  const [selectedId, setSelectedId] = useState<string | null>("loc-1");
  const [zoom, setZoom] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LOCATIONS.filter((loc) => {
      if (!activeCategories.includes(loc.category)) return false;
      if (state !== "All states" && loc.state !== state) return false;
      if (
        q &&
        !`${loc.name} ${loc.city} ${loc.state} ${loc.address}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [query, state, activeCategories]);

  const selected = useMemo(
    () => LOCATIONS.find((l) => l.id === selectedId) ?? null,
    [selectedId],
  );

  const toggleCategory = (id: CategoryId) =>
    setActiveCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  const clearFilters = () => {
    setQuery("");
    setState("All states");
    setActiveCategories(CATEGORIES.map((c) => c.id));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSheetOpen(false);
  };

  return (
    <div
      data-ocid="map.page"
      className="relative flex h-[calc(100dvh-4rem)] w-full overflow-hidden bg-background"
    >
      {/* Desktop / tablet left panel */}
      <aside
        data-ocid="map.panel"
        className="hidden w-[340px] shrink-0 border-r border-border bg-card md:flex md:flex-col lg:w-[380px]"
      >
        <FilterPanel
          query={query}
          onQueryChange={setQuery}
          state={state}
          onStateChange={setState}
          activeCategories={activeCategories}
          onToggleCategory={toggleCategory}
          onClear={clearFilters}
          resultCount={filtered.length}
        />
      </aside>

      {/* Map area */}
      <div className="relative flex-1">
        <MapCanvas
          locations={filtered}
          selectedId={selectedId}
          onSelect={handleSelect}
          zoom={zoom}
        />

        <MapControls
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(1)))}
          onZoomOut={() => setZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(1)))}
          onLocate={() => setZoom(1)}
          activeCategories={activeCategories}
          onToggleCategory={toggleCategory}
        />

        {/* Floating detail card — desktop / tablet */}
        {selected && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-30 hidden md:block">
            <DetailCard
              location={selected}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}

        {/* Mobile: bottom sheet trigger + panel */}
        <div className="absolute inset-x-0 bottom-0 z-40 md:hidden">
          {sheetOpen ? (
            <div className="max-h-[70dvh] overflow-y-auto rounded-t-[24px] border-t border-border bg-card shadow-floating">
              <div className="flex justify-center pt-3">
                <span
                  className="h-1.5 w-10 rounded-full bg-border"
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-center justify-between px-5 pt-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Filters & layers
                </p>
                <button
                  type="button"
                  data-ocid="map.sheet_close_button"
                  onClick={() => setSheetOpen(false)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Done
                </button>
              </div>
              <div className="h-[52dvh]">
                <FilterPanel
                  query={query}
                  onQueryChange={setQuery}
                  state={state}
                  onStateChange={setState}
                  activeCategories={activeCategories}
                  onToggleCategory={toggleCategory}
                  onClear={clearFilters}
                  resultCount={filtered.length}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {selected && (
                <DetailCard
                  location={selected}
                  onClose={() => setSelectedId(null)}
                />
              )}
              <button
                type="button"
                data-ocid="map.sheet_open_button"
                onClick={() => setSheetOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-elevated transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Layers className="size-4 text-primary" aria-hidden="true" />
                Filters & layers
                <span className="font-mono text-xs text-muted-foreground">
                  {filtered.length}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
