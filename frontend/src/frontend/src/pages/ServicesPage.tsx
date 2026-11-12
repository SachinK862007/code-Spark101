import {
  EmptyState,
  FilterChip,
  LoadingState,
  PageFrame,
  SampleTag,
  SectionHeading,
  StatusBadge,
  type StatusTone,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useApiResource } from "@/hooks/useApiResource";
import { urjaApi } from "@/services/urjaApi";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bus,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FileText,
  HeartPulse,
  Landmark,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { type ComponentType, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Static sample data — design-only prototype                          */
/* ------------------------------------------------------------------ */

interface DirectoryRow {
  id: string;
  name: string;
  department: string;
  category: string;
  location: string;
  contact: string;
  availability: string;
  status: "Verified" | "Updated" | "Under review";
}

const DIRECTORY_ROWS: DirectoryRow[] = [
  {
    id: "rooftop-solar-subsidy",
    name: "Rooftop Solar Subsidy",
    department: "Ministry of New & Renewable Energy",
    category: "Electricity and utilities",
    location: "New Delhi, Delhi",
    contact: "1800 180 3333",
    availability: "Mon–Fri · 9:30–17:30",
    status: "Verified",
  },
  {
    id: "pm-kusum",
    name: "PM-KUSUM Solar Pump Scheme",
    department: "Ministry of New & Renewable Energy",
    category: "Government schemes",
    location: "Gandhinagar, Gujarat",
    contact: "1800 233 4444",
    availability: "Mon–Sat · 10:00–18:00",
    status: "Verified",
  },
  {
    id: "utility-grievance",
    name: "Register Utility Grievance",
    department: "Central Electricity Authority",
    category: "Electricity and utilities",
    location: "New Delhi, Delhi",
    contact: "1912",
    availability: "24 × 7 helpline",
    status: "Updated",
  },
  {
    id: "municipal-water",
    name: "Municipal Water Connection",
    department: "Brihanmumbai Municipal Corporation",
    category: "Municipal services",
    location: "Mumbai, Maharashtra",
    contact: "1916",
    availability: "Mon–Sat · 8:00–20:00",
    status: "Updated",
  },
  {
    id: "district-hospital",
    name: "District Hospital Services",
    department: "Directorate of Health Services",
    category: "Healthcare",
    location: "Pune, Maharashtra",
    contact: "020 2612 3000",
    availability: "24 × 7 emergency",
    status: "Verified",
  },
  {
    id: "emergency-helpline",
    name: "Emergency Helpline 112",
    department: "Ministry of Home Affairs",
    category: "Emergency helplines",
    location: "National",
    contact: "112",
    availability: "24 × 7 emergency",
    status: "Verified",
  },
  {
    id: "ration-card",
    name: "Ration Card Services",
    department: "Department of Food & Public Distribution",
    category: "Government schemes",
    location: "Lucknow, Uttar Pradesh",
    contact: "1800 180 5555",
    availability: "Mon–Sat · 9:30–17:30",
    status: "Updated",
  },
  {
    id: "birth-certificate",
    name: "Birth Certificate Registration",
    department: "Municipal Corporation of Delhi",
    category: "Municipal services",
    location: "New Delhi, Delhi",
    contact: "011 2322 0000",
    availability: "Mon–Fri · 9:00–17:00",
    status: "Verified",
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat Health Cover",
    department: "National Health Authority",
    category: "Healthcare",
    location: "National",
    contact: "14555",
    availability: "24 × 7 helpline",
    status: "Verified",
  },
  {
    id: "consumer-forum",
    name: "Consumer Dispute Redressal",
    department: "Department of Consumer Affairs",
    category: "Other public services",
    location: "Chennai, Tamil Nadu",
    contact: "1915",
    availability: "Mon–Fri · 10:00–17:00",
    status: "Under review",
  },
  {
    id: "electricity-bill",
    name: "Electricity Bill Payment",
    department: "State Power Distribution Company",
    category: "Electricity and utilities",
    location: "Jaipur, Rajasthan",
    contact: "1912",
    availability: "24 × 7 portal",
    status: "Updated",
  },
];

interface CategoryCard {
  id: string;
  label: string;
  count: number;
  icon: ComponentType<{ className?: string }>;
}

const CATEGORY_CARDS: CategoryCard[] = [
  { id: "municipal", label: "Municipal services", count: 96, icon: Landmark },
  { id: "healthcare", label: "Healthcare", count: 64, icon: HeartPulse },
  {
    id: "electricity",
    label: "Electricity and utilities",
    count: 51,
    icon: Zap,
  },
  { id: "schemes", label: "Government schemes", count: 73, icon: Sparkles },
  {
    id: "emergency",
    label: "Emergency helplines",
    count: 12,
    icon: ShieldAlert,
  },
  { id: "other", label: "Other public services", count: 38, icon: Droplets },
];

const CATEGORY_FILTERS = [
  "All categories",
  "Municipal services",
  "Healthcare",
  "Electricity and utilities",
  "Government schemes",
  "Emergency helplines",
  "Other public services",
];

const STATES = [
  "All states",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
];

const CITIES = [
  "All cities",
  "Bengaluru",
  "Chennai",
  "Gandhinagar",
  "Jaipur",
  "Lucknow",
  "Mumbai",
  "New Delhi",
  "Pune",
];

const STATISTICS = [
  { id: "categories", label: "Service categories", value: "6" },
  { id: "resources", label: "Listed resources", value: "394" },
  { id: "locations", label: "Available locations", value: "128" },
  { id: "updated", label: "Recently updated", value: "27" },
];

const STATUS_TONES: Record<DirectoryRow["status"], StatusTone> = {
  Verified: "success",
  Updated: "primary",
  "Under review": "warning",
};

type SortKey = "name" | "category" | "location" | "status";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 6;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ServicesPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("All states");
  const [city, setCity] = useState("All cities");
  const [category, setCategory] = useState("All categories");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<"ready" | "loading" | "empty">(
    "ready",
  );

  // The directory is served by the backend; the bundled list is an offline
  // fallback so the page still renders if the API is not running.
  const directory = useApiResource(() => urjaApi.services(), []);
  const directoryRows = directory.data?.services ?? DIRECTORY_ROWS;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = directoryRows.filter((row) => {
      const matchesQuery =
        needle.length === 0 ||
        row.name.toLowerCase().includes(needle) ||
        row.department.toLowerCase().includes(needle) ||
        row.location.toLowerCase().includes(needle);
      const matchesState =
        state === "All states" || row.location.includes(state);
      const matchesCity = city === "All cities" || row.location.includes(city);
      const matchesCategory =
        category === "All categories" || row.category === category;
      return matchesQuery && matchesState && matchesCity && matchesCategory;
    });

    return [...rows].sort((a, b) => {
      const left = a[sortKey].toLowerCase();
      const right = b[sortKey].toLowerCase();
      if (left === right) return 0;
      const order = left < right ? -1 : 1;
      return sortDirection === "asc" ? order : -order;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, state, city, category, sortKey, sortDirection, directory.data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasActiveFilters =
    query.trim().length > 0 ||
    state !== "All states" ||
    city !== "All cities" ||
    category !== "All categories";

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setState("All states");
    setCity("All cities");
    setCategory("All categories");
    setPage(1);
  }

  return (
    <PageFrame>
      {/* Hero */}
      <section data-ocid="services.section" className="max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Public Services Directory
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
          Public services, made easier.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Find official information, service locations, contact details, and
          useful resources.
        </p>
        <p className="mt-5 flex flex-wrap items-center gap-2">
          <StatusBadge tone={directory.data ? "success" : "neutral"}>
            {directory.data ? "Served by URJA API" : "Offline fallback list"}
          </StatusBadge>
          {directory.data && (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {directory.data.count} services · {directory.data.categories.length} categories
            </span>
          )}
        </p>
      </section>

      {/* Search + filters */}
      <Card
        data-ocid="services.filters"
        className="mt-10 rounded-[20px] border-border bg-card p-5 shadow-subtle md:p-6"
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              data-ocid="services.search_input"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by service, department or location"
              aria-label="Search services"
              className="h-12 rounded-full border-input bg-background pl-11 pr-4 text-base"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              value={state}
              onValueChange={(value) => {
                setState(value);
                setPage(1);
              }}
            >
              <SelectTrigger
                data-ocid="services.state_select"
                aria-label="Filter by state"
                className="h-11 w-full rounded-full border-input bg-background px-4"
              >
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={city}
              onValueChange={(value) => {
                setCity(value);
                setPage(1);
              }}
            >
              <SelectTrigger
                data-ocid="services.city_select"
                aria-label="Filter by city"
                className="h-11 w-full rounded-full border-input bg-background px-4"
              >
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger
                data-ocid="services.category_select"
                aria-label="Filter by category"
                className="h-11 w-full rounded-full border-input bg-background px-4"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_FILTERS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              data-ocid="services.clear_button"
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
              Quick filters
            </span>
            {CATEGORY_FILTERS.slice(1, 6).map((option) => (
              <FilterChip
                key={option}
                label={option}
                active={category === option}
                onClick={() => {
                  setCategory(category === option ? "All categories" : option);
                  setPage(1);
                }}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Category cards */}
      <section data-ocid="services.categories" className="mt-14">
        <SectionHeading
          eyebrow="Browse"
          title="Service categories"
          description="Eight broad categories cover the most requested public services."
          action={<SampleTag />}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_CARDS.map((item) => {
            const Icon = item.icon;
            const active = category === item.label;
            return (
              <button
                key={item.id}
                type="button"
                data-ocid={`services.category_card.${item.id}`}
                aria-pressed={active}
                onClick={() => {
                  setCategory(active ? "All categories" : item.label);
                  setPage(1);
                }}
                className={cn(
                  "group flex flex-col items-start gap-4 rounded-[18px] border bg-card p-5 text-left shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary/50 bg-secondary/60"
                    : "border-border",
                )}
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-2xl transition-smooth",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="space-y-1">
                  <span className="block font-display text-base font-semibold leading-snug text-foreground">
                    {item.label}
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {item.count} resources
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Statistics */}
      <section data-ocid="services.stats" className="mt-14">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Directory at a glance
          </h2>
          <SampleTag />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATISTICS.map((stat) => (
            <Card
              key={stat.id}
              data-ocid={`services.stat.${stat.id}`}
              className="rounded-[18px] border-border bg-card p-6 shadow-subtle"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-3 font-mono text-4xl font-semibold tracking-tight text-foreground">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Directory listing */}
      <section data-ocid="services.directory" className="mt-14">
        <SectionHeading
          eyebrow="Directory"
          title="Listed resources"
          description="Sortable directory of official services, offices and helplines."
          action={
            <div className="flex items-center gap-2">
              <SampleTag />
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="services.preview_toggle"
                onClick={() =>
                  setPreview((current) =>
                    current === "ready"
                      ? "loading"
                      : current === "loading"
                        ? "empty"
                        : "ready",
                  )
                }
                className="rounded-full border-border bg-card text-xs"
              >
                Preview state
              </Button>
            </div>
          }
        />

        <div className="mt-8">
          {preview === "loading" ? (
            <LoadingState label="Loading directory…" />
          ) : preview === "empty" || pageRows.length === 0 ? (
            <EmptyState
              title="No services match your filters"
              description="Try a different search term, or clear the filters to see the full directory."
              action={
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="services.empty_clear_button"
                  onClick={clearFilters}
                  className="rounded-full border-border bg-card"
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <Card className="hidden overflow-hidden rounded-[20px] border-border bg-card shadow-subtle lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                      <SortableHead
                        label="Service / Department"
                        sortKey="name"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={toggleSort}
                        className="pl-6"
                      />
                      <SortableHead
                        label="Category"
                        sortKey="category"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={toggleSort}
                      />
                      <SortableHead
                        label="Location"
                        sortKey="location"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={toggleSort}
                      />
                      <TableHead className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Contact
                      </TableHead>
                      <TableHead className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Availability
                      </TableHead>
                      <SortableHead
                        label="Status"
                        sortKey="status"
                        activeKey={sortKey}
                        direction={sortDirection}
                        onSort={toggleSort}
                        className="pr-6"
                      />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        data-ocid={`services.row.${index + 1}`}
                        className="border-border"
                      >
                        <TableCell className="max-w-[22rem] py-4 pl-6">
                          <Link
                            to="/services/$id"
                            params={{ id: row.id }}
                            data-ocid={`services.row_link.${index + 1}`}
                            className="group block focus-visible:outline-none"
                          >
                            <span className="block font-medium text-foreground transition-smooth group-hover:text-primary">
                              {row.name}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {row.department}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground">
                          {row.category}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin
                              className="size-3.5 text-primary/70"
                              aria-hidden="true"
                            />
                            {row.location}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="inline-flex items-center gap-1.5 font-mono text-sm text-foreground">
                            <Phone
                              className="size-3.5 text-muted-foreground"
                              aria-hidden="true"
                            />
                            {row.contact}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground">
                          {row.availability}
                        </TableCell>
                        <TableCell className="py-4 pr-6">
                          <StatusBadge tone={STATUS_TONES[row.status]}>
                            {row.status}
                          </StatusBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {/* Mobile stacked cards */}
              <div className="space-y-4 lg:hidden">
                {pageRows.map((row, index) => (
                  <Link
                    key={row.id}
                    to="/services/$id"
                    params={{ id: row.id }}
                    data-ocid={`services.card.${index + 1}`}
                    className="block rounded-[18px] border border-border bg-card p-5 shadow-subtle transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-base font-semibold text-foreground">
                          {row.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {row.department}
                        </p>
                      </div>
                      <StatusBadge tone={STATUS_TONES[row.status]}>
                        {row.status}
                      </StatusBadge>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          Category
                        </dt>
                        <dd className="mt-1 text-foreground">{row.category}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          Location
                        </dt>
                        <dd className="mt-1 text-foreground">{row.location}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          Contact
                        </dt>
                        <dd className="mt-1 font-mono text-foreground">
                          {row.contact}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          Availability
                        </dt>
                        <dd className="mt-1 text-foreground">
                          {row.availability}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="font-mono text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="text-foreground">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                  </span>{" "}
                  of {filtered.length} resources
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="services.pagination_prev"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border-border bg-card"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        data-ocid={`services.pagination_page.${pageNumber}`}
                        aria-current={
                          pageNumber === currentPage ? "page" : undefined
                        }
                        onClick={() => setPage(pageNumber)}
                        className={cn(
                          "size-9 rounded-full font-mono text-sm transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          pageNumber === currentPage
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="services.pagination_next"
                    onClick={() =>
                      setPage((value) => Math.min(totalPages, value + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-full border-border bg-card"
                  >
                    Next
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </PageFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Sortable column header                                              */
/* ------------------------------------------------------------------ */

function SortableHead({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = activeKey === sortKey;
  const Icon = !active
    ? ArrowUpDown
    : direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        data-ocid={`services.sort.${sortKey}`}
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
        className={cn(
          "inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon
          className={cn("size-3.5", active ? "text-primary" : "opacity-60")}
          aria-hidden="true"
        />
      </button>
    </TableHead>
  );
}
