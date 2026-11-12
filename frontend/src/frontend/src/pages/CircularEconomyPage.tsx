import {
  EmptyState,
  FilterChip,
  PageFrame,
  SampleTag,
  SectionHeading,
  SourceBadge,
  StatusBadge,
  type StatusTone,
} from "@/components/shared";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BatteryCharging,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Cpu,
  Factory,
  Flame,
  Leaf,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Recycle,
  Route,
  Search,
  ShieldCheck,
  Sun,
  Truck,
  X,
} from "lucide-react";
import { type ComponentType, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Illustrative sample data — static, never fetched or computed        */
/* ------------------------------------------------------------------ */

type CategoryId =
  | "solar-panel"
  | "e-waste"
  | "ev-battery"
  | "battery-reuse"
  | "biogas"
  | "organic";

interface WasteCategory {
  id: CategoryId;
  label: string;
  short: string;
  icon: ComponentType<{ className?: string }>;
  dot: string;
  marker: string;
}

const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: "solar-panel",
    label: "Solar panel waste",
    short: "Solar panels",
    icon: Sun,
    dot: "bg-chart-2",
    marker: "bg-chart-2 text-white",
  },
  {
    id: "e-waste",
    label: "E-waste",
    short: "E-waste",
    icon: Cpu,
    dot: "bg-chart-4",
    marker: "bg-chart-4 text-white",
  },
  {
    id: "ev-battery",
    label: "EV battery recycling",
    short: "EV batteries",
    icon: BatteryCharging,
    dot: "bg-chart-1",
    marker: "bg-chart-1 text-white",
  },
  {
    id: "battery-reuse",
    label: "Battery reuse",
    short: "Battery reuse",
    icon: Recycle,
    dot: "bg-chart-3",
    marker: "bg-chart-3 text-white",
  },
  {
    id: "biogas",
    label: "Biogas units",
    short: "Biogas",
    icon: Flame,
    dot: "bg-accent",
    marker: "bg-accent text-accent-foreground",
  },
  {
    id: "organic",
    label: "Organic waste management",
    short: "Organic waste",
    icon: Leaf,
    dot: "bg-success",
    marker: "bg-success text-success-foreground",
  },
];

const CATEGORY_BY_ID = Object.fromEntries(
  WASTE_CATEGORIES.map((category) => [category.id, category]),
) as Record<CategoryId, WasteCategory>;

interface Recycler {
  id: string;
  name: string;
  categories: CategoryId[];
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  materials: string[];
  capacity: string;
  verified: boolean;
  source: string;
  x: number;
  y: number;
}

const RECYCLERS: Recycler[] = [
  {
    id: "rec-1",
    name: "Bhadla Panel Recovery Works",
    categories: ["solar-panel"],
    address: "Plot 14, Solar Park Road, Jodhpur District",
    city: "Jodhpur",
    state: "Rajasthan",
    phone: "+91 291 254 1180",
    email: "recovery@bhadlarecycle.example",
    materials: ["Silicon modules", "Aluminium frames", "Junction boxes"],
    capacity: "1,200 t / year",
    verified: true,
    source: "MNRE empanelled",
    x: 24,
    y: 40,
  },
  {
    id: "rec-2",
    name: "GreenLoop E-Waste Facility",
    categories: ["e-waste"],
    address: "Sector 8, Electronic City Phase II",
    city: "Bengaluru",
    state: "Karnataka",
    phone: "+91 80 4712 9900",
    email: "intake@greenloop.example",
    materials: ["PCBs", "Inverters", "Copper cabling"],
    capacity: "4,800 t / year",
    verified: true,
    source: "CPCB authorised",
    x: 44,
    y: 80,
  },
  {
    id: "rec-3",
    name: "VoltCycle Battery Recyclers",
    categories: ["ev-battery", "battery-reuse"],
    address: "Chakan Industrial Area, Phase III",
    city: "Pune",
    state: "Maharashtra",
    phone: "+91 20 6712 4400",
    email: "ops@voltcycle.example",
    materials: ["Li-ion packs", "Cathode black mass", "Nickel & cobalt"],
    capacity: "3,600 t / year",
    verified: true,
    source: "CPCB authorised",
    x: 28,
    y: 62,
  },
  {
    id: "rec-4",
    name: "Pavagada Second-Life Storage",
    categories: ["battery-reuse"],
    address: "Pavagada Taluk, Tumkur District",
    city: "Tumkur",
    state: "Karnataka",
    phone: "+91 813 324 4420",
    email: "reuse@pavagadastorage.example",
    materials: ["Second-life modules", "BMS units", "Cell balancing"],
    capacity: "900 t / year",
    verified: false,
    source: "Community submission",
    x: 42,
    y: 76,
  },
  {
    id: "rec-5",
    name: "Gobar Biogas Collective",
    categories: ["biogas", "organic"],
    address: "Village Kheri, Karnal District",
    city: "Karnal",
    state: "Haryana",
    phone: "+91 184 226 7700",
    email: "connect@gobarbiogas.example",
    materials: ["Cattle manure", "Crop residue", "Food waste"],
    capacity: "18,000 m³ / day",
    verified: true,
    source: "MNRE biogas programme",
    x: 34,
    y: 22,
  },
  {
    id: "rec-6",
    name: "Coastal Organic Composting",
    categories: ["organic"],
    address: "Muttukadu, East Coast Road",
    city: "Chennai",
    state: "Tamil Nadu",
    phone: "+91 44 2747 3300",
    email: "hello@coastalcompost.example",
    materials: ["Market waste", "Green waste", "Sludge"],
    capacity: "240 t / day",
    verified: true,
    source: "Municipal empanelled",
    x: 46,
    y: 88,
  },
  {
    id: "rec-7",
    name: "Mundra Panel Take-Back Hub",
    categories: ["solar-panel", "e-waste"],
    address: "Mundra Port Road, Kutch District",
    city: "Mundra",
    state: "Gujarat",
    phone: "+91 283 825 5640",
    email: "takeback@mundrahub.example",
    materials: ["Glass laminate", "Frames", "Cabling"],
    capacity: "2,100 t / year",
    verified: true,
    source: "Producer take-back",
    x: 18,
    y: 52,
  },
  {
    id: "rec-8",
    name: "Yamuna Bioenergy Plant",
    categories: ["biogas"],
    address: "Sector 32, Industrial Estate",
    city: "Noida",
    state: "Uttar Pradesh",
    phone: "+91 120 456 2200",
    email: "plant@yamunabioenergy.example",
    materials: ["Press mud", "Distillery spent wash"],
    capacity: "12,000 m³ / day",
    verified: false,
    source: "Community submission",
    x: 40,
    y: 26,
  },
];

const STATE_OPTIONS = [
  "All states",
  "Rajasthan",
  "Karnataka",
  "Maharashtra",
  "Haryana",
  "Tamil Nadu",
  "Gujarat",
  "Uttar Pradesh",
];

const CITY_OPTIONS = [
  "All cities",
  "Bengaluru",
  "Chennai",
  "Jodhpur",
  "Karnal",
  "Mundra",
  "Noida",
  "Pune",
  "Tumkur",
];

interface CircularMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
}

const CIRCULAR_METRICS: CircularMetric[] = [
  {
    id: "recyclers",
    label: "Registered recycler listings",
    value: "1,284",
    unit: "listings",
    note: "Across 26 states and 4 union territories",
    icon: Factory,
  },
  {
    id: "categories",
    label: "Available recycling categories",
    value: "6",
    unit: "categories",
    note: "Solar, e-waste, EV battery, reuse, biogas, organic",
    icon: Recycle,
  },
  {
    id: "diverted",
    label: "Estimated waste diverted",
    value: "3.42",
    unit: "Mt",
    note: "Cumulative, FY 2024-25 to date",
    icon: Package,
  },
  {
    id: "biogas",
    label: "Listed biogas facilities",
    value: "412",
    unit: "facilities",
    note: "Aggregate capacity 6.8 million m³ / day",
    icon: Flame,
  },
];

/* ------------------------------------------------------------------ */
/* Traceability form sample data                                       */
/* ------------------------------------------------------------------ */

const WASTE_TYPE_OPTIONS = WASTE_CATEGORIES.map((category) => category.label);

const CONDITION_OPTIONS = [
  "Intact — reusable",
  "Partially damaged",
  "End-of-life — recycle",
  "Mixed / unsorted",
];

const SERVICE_OPTIONS = [
  "Collection and pickup",
  "Processing and recovery",
  "Refurbishment and reuse",
  "Compliance documentation",
];

const LOCATION_OPTIONS = [
  "Jodhpur, Rajasthan",
  "Bengaluru, Karnataka",
  "Pune, Maharashtra",
  "Karnal, Haryana",
  "Chennai, Tamil Nadu",
  "Mundra, Gujarat",
  "Noida, Uttar Pradesh",
];

interface TraceabilityForm {
  wasteType: string;
  quantity: string;
  location: string;
  condition: string;
  service: string;
}

const EMPTY_FORM: TraceabilityForm = {
  wasteType: WASTE_TYPE_OPTIONS[0],
  quantity: "",
  location: LOCATION_OPTIONS[0],
  condition: CONDITION_OPTIONS[0],
  service: SERVICE_OPTIONS[0],
};

interface SubmittedListing {
  id: string;
  reference: string;
  wasteType: string;
  quantity: string;
  location: string;
  condition: string;
  service: string;
  status: "Received" | "Matched" | "In transit";
  statusTone: StatusTone;
  pathway: string;
  submitted: string;
}

const SUBMITTED_LISTINGS: SubmittedListing[] = [
  {
    id: "listing-1",
    reference: "URJA-CE-2041",
    wasteType: "Solar panel waste",
    quantity: "18 t",
    location: "Jodhpur, Rajasthan",
    condition: "End-of-life — recycle",
    service: "Processing and recovery",
    status: "Matched",
    statusTone: "success",
    pathway: "Collection → Glass & frame separation → Silicon recovery",
    submitted: "08 Nov 2026",
  },
  {
    id: "listing-2",
    reference: "URJA-CE-2038",
    wasteType: "EV battery recycling",
    quantity: "6.4 t",
    location: "Pune, Maharashtra",
    condition: "Partially damaged",
    service: "Collection and pickup",
    status: "In transit",
    statusTone: "primary",
    pathway: "Pickup scheduled → Discharge test → Black mass recovery",
    submitted: "06 Nov 2026",
  },
  {
    id: "listing-3",
    reference: "URJA-CE-2033",
    wasteType: "Organic waste management",
    quantity: "42 t",
    location: "Chennai, Tamil Nadu",
    condition: "Mixed / unsorted",
    service: "Processing and recovery",
    status: "Received",
    statusTone: "warning",
    pathway: "Segregation → Aerobic composting → Soil amendment",
    submitted: "02 Nov 2026",
  },
];

/* ------------------------------------------------------------------ */
/* Map canvas — static illustrated map with recycler markers           */
/* ------------------------------------------------------------------ */

function RecyclerMap({
  recyclers,
  selectedId,
  onSelect,
  zoom,
}: {
  recyclers: Recycler[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  zoom: number;
}) {
  return (
    <div
      data-ocid="circularity.map_canvas"
      className="absolute inset-0 overflow-hidden bg-[oklch(0.97_0.012_95)]"
      aria-label="Illustrative map of India showing recycler locations"
    >
      <div
        className="absolute inset-0 origin-center transition-transform duration-500 ease-out"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <title>Illustrative map base</title>
          <defs>
            <pattern
              id="circularity-grid"
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
          <rect width="100" height="100" fill="url(#circularity-grid)" />
          <path
            d="M30 8 L46 6 L58 12 L70 14 L78 24 L74 34 L80 44 L72 54 L66 66 L58 78 L50 90 L44 96 L40 88 L34 78 L28 66 L22 56 L16 46 L20 34 L24 22 Z"
            className="fill-[oklch(0.945_0.02_120)] stroke-[oklch(0.86_0.03_120)]"
            strokeWidth="0.4"
          />
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
        </svg>

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

        {recyclers.map((recycler) => {
          const category = CATEGORY_BY_ID[recycler.categories[0]];
          const Icon = category.icon;
          const selected = recycler.id === selectedId;
          return (
            <button
              key={recycler.id}
              type="button"
              data-ocid={`circularity.map_marker.${recycler.id}`}
              onClick={() => onSelect(recycler.id)}
              aria-label={`${recycler.name}, ${category.label}`}
              aria-pressed={selected}
              style={{ left: `${recycler.x}%`, top: `${recycler.y}%` }}
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
                {recycler.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Recycler detail card                                                */
/* ------------------------------------------------------------------ */

function RecyclerDetailCard({
  recycler,
  onClose,
}: {
  recycler: Recycler;
  onClose: () => void;
}) {
  const category = CATEGORY_BY_ID[recycler.categories[0]];
  const Icon = category.icon;
  return (
    <div
      data-ocid="circularity.recycler_detail_card"
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
            <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
              {recycler.name}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {category.label}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-ocid="circularity.recycler_detail_card.close_button"
          onClick={onClose}
          aria-label="Close recycler details"
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
            {recycler.address}
            <span className="block text-xs text-muted-foreground">
              {recycler.city}, {recycler.state}
            </span>
          </dd>
        </div>
        <div className="flex items-start gap-2.5">
          <Phone
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <dd className="font-mono text-foreground">{recycler.phone}</dd>
        </div>
        <div className="flex items-start gap-2.5">
          <Package
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <dd className="text-foreground">
            {recycler.capacity}
            <span className="block text-xs text-muted-foreground">
              Processing capacity
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {recycler.materials.map((material) => (
          <span
            key={material}
            className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {material}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <StatusBadge tone={recycler.verified ? "success" : "warning"}>
          {recycler.verified ? "Verified" : "Unverified"}
        </StatusBadge>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="size-1.5 rounded-full bg-primary/60"
            aria-hidden="true"
          />
          Source: {recycler.source}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          data-ocid="circularity.recycler_detail_card.view_details_button"
          className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View details
        </button>
        <button
          type="button"
          data-ocid="circularity.recycler_detail_card.contact_button"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Phone className="size-4" aria-hidden="true" />
          Contact
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Recycler directory card                                             */
/* ------------------------------------------------------------------ */

function RecyclerCard({
  recycler,
  index,
  onView,
}: {
  recycler: Recycler;
  index: number;
  onView: (id: string) => void;
}) {
  return (
    <Card
      data-ocid={`circularity.recycler_card.${index + 1}`}
      className="flex h-full flex-col rounded-[18px] border-border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold leading-snug text-foreground">
            {recycler.name}
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary/70" aria-hidden="true" />
            {recycler.city}, {recycler.state}
          </p>
        </div>
        <StatusBadge tone={recycler.verified ? "success" : "warning"}>
          {recycler.verified ? "Verified" : "Unverified"}
        </StatusBadge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {recycler.address}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {recycler.categories.map((categoryId) => {
          const category = CATEGORY_BY_ID[categoryId];
          return (
            <span
              key={categoryId}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              <span
                className={cn("size-1.5 rounded-full", category.dot)}
                aria-hidden="true"
              />
              {category.short}
            </span>
          );
        })}
      </div>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <Phone
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <dd className="font-mono text-foreground">{recycler.phone}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Package
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <dd className="text-muted-foreground">
            Accepts{" "}
            <span className="text-foreground">
              {recycler.materials.join(", ")}
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {recycler.source}
        </span>
        <button
          type="button"
          data-ocid={`circularity.recycler_card.${index + 1}.view_details_button`}
          onClick={() => onView(recycler.id)}
          className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View details
        </button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CircularEconomyPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("All states");
  const [city, setCity] = useState("All cities");
  const [activeCategories, setActiveCategories] = useState<CategoryId[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>("rec-1");
  const [zoom, setZoom] = useState(1);

  const [form, setForm] = useState<TraceabilityForm>(EMPTY_FORM);
  const [matches, setMatches] = useState<Recycler[] | null>(null);
  const [submitted, setSubmitted] =
    useState<SubmittedListing[]>(SUBMITTED_LISTINGS);
  const [activeListingId, setActiveListingId] = useState<string | null>(
    SUBMITTED_LISTINGS[0].id,
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return RECYCLERS.filter((recycler) => {
      if (
        activeCategories.length > 0 &&
        !recycler.categories.some((id) => activeCategories.includes(id))
      ) {
        return false;
      }
      if (state !== "All states" && recycler.state !== state) return false;
      if (city !== "All cities" && recycler.city !== city) return false;
      if (
        needle &&
        !`${recycler.name} ${recycler.city} ${recycler.state} ${recycler.address} ${recycler.materials.join(" ")}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [query, state, city, activeCategories]);

  const selected = useMemo(
    () => RECYCLERS.find((recycler) => recycler.id === selectedId) ?? null,
    [selectedId],
  );

  const activeListing = useMemo(
    () =>
      submitted.find((listing) => listing.id === activeListingId) ??
      submitted[0] ??
      null,
    [submitted, activeListingId],
  );

  const hasActiveFilters =
    query.trim().length > 0 ||
    state !== "All states" ||
    city !== "All cities" ||
    activeCategories.length > 0;

  function toggleCategory(id: CategoryId) {
    setActiveCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function clearFilters() {
    setQuery("");
    setState("All states");
    setCity("All cities");
    setActiveCategories([]);
  }

  function handleFindMatches() {
    const category = WASTE_CATEGORIES.find(
      (item) => item.label === form.wasteType,
    );
    const result = category
      ? RECYCLERS.filter((recycler) =>
          recycler.categories.includes(category.id),
        )
      : RECYCLERS;
    setMatches(result);
  }

  function handleRegisterListing() {
    const reference = `URJA-CE-${2042 + submitted.length - SUBMITTED_LISTINGS.length}`;
    const listing: SubmittedListing = {
      id: `listing-${submitted.length + 1}`,
      reference,
      wasteType: form.wasteType,
      quantity: form.quantity.trim() ? `${form.quantity.trim()} t` : "—",
      location: form.location,
      condition: form.condition,
      service: form.service,
      status: "Received",
      statusTone: "warning",
      pathway: "Intake logged → Verification → Recycler matching",
      submitted: "12 Nov 2026",
    };
    setSubmitted((prev) => [listing, ...prev]);
    setActiveListingId(listing.id);
    setForm(EMPTY_FORM);
    setMatches(null);
  }

  return (
    <PageFrame>
      {/* Editorial header */}
      <header className="border-b border-border pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Opportunities &amp; Resources · D6
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Circular economy &amp; recycler mapping.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Map recyclers, trace waste streams and follow material recovery
              across the renewable value chain.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <SampleTag />
              <StatusBadge tone="neutral">Data as of Oct 2026</StatusBadge>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Source: CPCB, MNRE, State Pollution Control Boards
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="success">
              <span className="mr-1 inline-block size-1.5 rounded-full bg-success align-middle" />
              Recycler registry online
            </StatusBadge>
            <span className="font-mono text-xs text-muted-foreground">
              Last updated 12 Nov 2026 · 06:00 IST
            </span>
          </div>
        </div>
      </header>

      {/* Dashboard metrics */}
      <section className="mt-10" aria-labelledby="circularity-metrics">
        <div className="flex items-center justify-between">
          <h2
            id="circularity-metrics"
            className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Circular economy at a glance
          </h2>
          <SampleTag />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {CIRCULAR_METRICS.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.id}
                data-ocid={`circularity.metric_card.${index + 1}`}
                className="rounded-[18px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-foreground">
                  {metric.value}
                  <span className="ml-1.5 text-base font-normal text-muted-foreground">
                    {metric.unit}
                  </span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {metric.note}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recycler directory */}
      <section className="mt-14" aria-labelledby="circularity-directory">
        <SectionHeading
          eyebrow="Recycler directory"
          title="Find a recycler"
          description="Search verified recyclers by location and the waste streams they accept."
          action={<SampleTag />}
        />

        <Card className="mt-8 rounded-[20px] border-border bg-card p-5 shadow-subtle md:p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                data-ocid="circularity.search_input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by recycler, city or accepted material"
                aria-label="Search recyclers"
                className="h-12 rounded-full border-input bg-background pl-11 pr-4 text-base"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Select value={state} onValueChange={setState}>
                <SelectTrigger
                  data-ocid="circularity.state_select"
                  aria-label="Filter by state"
                  className="h-11 w-full rounded-full border-input bg-background px-4"
                >
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {STATE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={city} onValueChange={setCity}>
                <SelectTrigger
                  data-ocid="circularity.city_select"
                  aria-label="Filter by city"
                  className="h-11 w-full rounded-full border-input bg-background px-4"
                >
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {CITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                data-ocid="circularity.clear_button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="h-11 rounded-full border-border bg-card px-4 text-sm font-medium"
              >
                <X className="size-4" aria-hidden="true" />
                Clear filters
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Waste category
              </span>
              {WASTE_CATEGORIES.map((category) => (
                <FilterChip
                  key={category.id}
                  label={category.short}
                  active={activeCategories.includes(category.id)}
                  onClick={() => toggleCategory(category.id)}
                />
              ))}
            </div>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="font-mono text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "recycler" : "recyclers"}{" "}
            listed
          </p>
          <SampleTag />
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState
              title="No recyclers match your filters"
              description="Try a different search term, or clear the filters to see the full recycler directory."
              action={
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="circularity.empty_clear_button"
                  onClick={clearFilters}
                  className="rounded-full border-border bg-card"
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((recycler, index) => (
                <RecyclerCard
                  key={recycler.id}
                  recycler={recycler}
                  index={index}
                  onView={setSelectedId}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Map panel */}
      <section className="mt-14" aria-labelledby="circularity-map">
        <SectionHeading
          eyebrow="Recycler map"
          title="Recycler locations"
          description="Select a marker to open the recycler detail card."
          action={<SampleTag />}
        />
        <Card className="mt-8 overflow-hidden rounded-[20px] border-border bg-card p-0 shadow-subtle">
          <div className="relative h-[520px] w-full">
            <RecyclerMap
              recyclers={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              zoom={zoom}
            />

            {/* Zoom controls */}
            <div className="pointer-events-none absolute inset-0 z-30">
              <div className="pointer-events-auto absolute right-4 top-4 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
                <button
                  type="button"
                  data-ocid="circularity.zoom_in_button"
                  onClick={() =>
                    setZoom((value) => Math.min(2, +(value + 0.2).toFixed(1)))
                  }
                  aria-label="Zoom in"
                  className="flex size-10 items-center justify-center text-foreground transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
                <span className="h-px bg-border" aria-hidden="true" />
                <button
                  type="button"
                  data-ocid="circularity.zoom_out_button"
                  onClick={() =>
                    setZoom((value) => Math.max(0.8, +(value - 0.2).toFixed(1)))
                  }
                  aria-label="Zoom out"
                  className="flex size-10 items-center justify-center text-foreground transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>
              </div>

              {/* Legend */}
              <div className="pointer-events-auto absolute bottom-4 right-4 w-56 rounded-2xl border border-border bg-card/95 p-3.5 shadow-elevated backdrop-blur-sm">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Waste categories
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {WASTE_CATEGORIES.map((category) => (
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
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-border bg-card/95 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-subtle backdrop-blur-sm">
                Zoom {zoom.toFixed(1)}× · Sample data
              </div>
            </div>

            {/* Detail card */}
            {selected && (
              <div className="pointer-events-none absolute left-4 top-4 z-30 hidden md:block">
                <RecyclerDetailCard
                  recycler={selected}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            )}
          </div>

          {/* Mobile detail card below the map */}
          {selected && (
            <div className="border-t border-border p-4 md:hidden">
              <RecyclerDetailCard
                recycler={selected}
                onClose={() => setSelectedId(null)}
              />
            </div>
          )}
        </Card>
      </section>

      {/* Traceability form + matches */}
      <section className="mt-14" aria-labelledby="circularity-traceability">
        <SectionHeading
          eyebrow="Traceability"
          title="Trace a waste stream"
          description="Describe the waste you want to divert and see sample matching recyclers."
          action={<SampleTag />}
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Card className="rounded-[20px] border-border bg-card p-6 shadow-subtle md:p-8">
            <div className="flex items-center gap-2 text-primary">
              <ClipboardList className="size-4" aria-hidden="true" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                Waste listing details
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="circularity-waste-type"
                  className="text-sm font-medium text-foreground"
                >
                  Waste type
                </Label>
                <Select
                  value={form.wasteType}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, wasteType: value }))
                  }
                >
                  <SelectTrigger
                    id="circularity-waste-type"
                    data-ocid="circularity.waste_type_select"
                    aria-label="Waste type"
                    className="h-11 w-full rounded-lg border-input bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WASTE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="circularity-quantity"
                  className="text-sm font-medium text-foreground"
                >
                  Estimated quantity (tonnes)
                </Label>
                <Input
                  id="circularity-quantity"
                  data-ocid="circularity.quantity_input"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: event.target.value,
                    }))
                  }
                  placeholder="e.g. 12.5"
                  className="h-11 rounded-lg border-input bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="circularity-location"
                  className="text-sm font-medium text-foreground"
                >
                  Location
                </Label>
                <Select
                  value={form.location}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, location: value }))
                  }
                >
                  <SelectTrigger
                    id="circularity-location"
                    data-ocid="circularity.location_select"
                    aria-label="Location"
                    className="h-11 w-full rounded-lg border-input bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="circularity-condition"
                  className="text-sm font-medium text-foreground"
                >
                  Material condition
                </Label>
                <Select
                  value={form.condition}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, condition: value }))
                  }
                >
                  <SelectTrigger
                    id="circularity-condition"
                    data-ocid="circularity.condition_select"
                    aria-label="Material condition"
                    className="h-11 w-full rounded-lg border-input bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="circularity-service"
                  className="text-sm font-medium text-foreground"
                >
                  Required service
                </Label>
                <Select
                  value={form.service}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, service: value }))
                  }
                >
                  <SelectTrigger
                    id="circularity-service"
                    data-ocid="circularity.service_select"
                    aria-label="Required service"
                    className="h-11 w-full rounded-lg border-input bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="circularity-notes"
                  className="text-sm font-medium text-foreground"
                >
                  Notes (optional)
                </Label>
                <Textarea
                  id="circularity-notes"
                  data-ocid="circularity.notes_textarea"
                  rows={3}
                  placeholder="Add handling notes, access constraints or documentation needs"
                  className="rounded-lg border-input bg-background"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  data-ocid="circularity.find_matches_button"
                  onClick={handleFindMatches}
                  className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Search className="size-4" aria-hidden="true" />
                  Find matching recyclers
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="circularity.register_listing_button"
                  onClick={handleRegisterListing}
                  className="flex-1 rounded-full border-border bg-card"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Register demo listing
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-[20px] border-border bg-card p-6 shadow-subtle md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Route className="size-4" aria-hidden="true" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Sample matching recyclers
                </span>
              </div>
              <SampleTag />
            </div>

            {matches === null ? (
              <div className="mt-6">
                <EmptyState
                  title="No matches yet"
                  description="Fill in the waste listing details and select Find matching recyclers to see sample results."
                />
              </div>
            ) : matches.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No recyclers accept this stream"
                  description="No listed recycler currently accepts this waste type. Try another category or widen your location."
                />
              </div>
            ) : (
              <ul data-ocid="circularity.match_list" className="mt-6 space-y-3">
                {matches.map((recycler, index) => {
                  const category = CATEGORY_BY_ID[recycler.categories[0]];
                  const Icon = category.icon;
                  return (
                    <li
                      key={recycler.id}
                      data-ocid={`circularity.match_item.${index + 1}`}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4 transition-smooth hover:border-primary/30"
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl",
                          category.marker,
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="size-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">
                            {recycler.name}
                          </p>
                          <StatusBadge
                            tone={recycler.verified ? "success" : "warning"}
                          >
                            {recycler.verified ? "Verified" : "Unverified"}
                          </StatusBadge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {recycler.city}, {recycler.state} ·{" "}
                          {recycler.capacity}
                        </p>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          Accepts {recycler.materials.join(", ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        data-ocid={`circularity.match_item.${index + 1}.view_button`}
                        onClick={() => setSelectedId(recycler.id)}
                        className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        View
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </section>

      {/* Submitted listings + pathway */}
      <section className="mt-14" aria-labelledby="circularity-listings">
        <SectionHeading
          eyebrow="Traceability ledger"
          title="Submitted listings"
          description="Track demo waste listings, their recycling pathway and collection or processing status."
          action={<SampleTag />}
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card className="overflow-hidden rounded-[20px] border-border bg-card shadow-subtle">
            <ul
              data-ocid="circularity.listing_list"
              className="divide-y divide-border"
            >
              {submitted.map((listing, index) => {
                const active = listing.id === activeListingId;
                return (
                  <li key={listing.id}>
                    <button
                      type="button"
                      data-ocid={`circularity.listing_item.${index + 1}`}
                      aria-pressed={active}
                      onClick={() => setActiveListingId(listing.id)}
                      className={cn(
                        "flex w-full flex-col gap-2 px-5 py-4 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                        active ? "bg-secondary/50" : "hover:bg-muted/40",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-primary">
                            {listing.reference}
                          </span>
                          <span className="font-medium text-foreground">
                            {listing.wasteType}
                          </span>
                        </span>
                        <StatusBadge tone={listing.statusTone}>
                          {listing.status}
                        </StatusBadge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Package className="size-3.5" aria-hidden="true" />
                          {listing.quantity}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" aria-hidden="true" />
                          {listing.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Truck className="size-3.5" aria-hidden="true" />
                          {listing.service}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {activeListing && (
            <Card className="flex flex-col rounded-[20px] border-border bg-card p-6 shadow-subtle md:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  <Route className="size-4" aria-hidden="true" />
                  Recycling pathway
                </span>
                <SampleTag />
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-foreground">
                {activeListing.wasteType}
              </h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {activeListing.reference} · submitted {activeListing.submitted}
              </p>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Quantity</dt>
                  <dd className="font-mono font-medium text-foreground">
                    {activeListing.quantity}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium text-foreground">
                    {activeListing.location}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Condition</dt>
                  <dd className="font-medium text-foreground">
                    {activeListing.condition}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Required service</dt>
                  <dd className="font-medium text-foreground">
                    {activeListing.service}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge tone={activeListing.statusTone}>
                      {activeListing.status}
                    </StatusBadge>
                  </dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Pathway
                </p>
                <ol className="mt-3 space-y-2.5">
                  {activeListing.pathway.split(" → ").map((step, index) => (
                    <li
                      key={step}
                      className="flex items-start gap-2.5 text-sm text-foreground"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <SourceBadge>CPCB authorised recyclers</SourceBadge>
                <SourceBadge>Demo traceability ledger</SourceBadge>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Provenance footer */}
      <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-6">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
          Illustrative prototype · All figures are sample data
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <CircleDot className="size-3.5 text-accent" aria-hidden="true" />
          Source: CPCB, MNRE, State Pollution Control Boards
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
          Reporting period: Data as of Oct 2026
        </span>
      </div>
    </PageFrame>
  );
}
