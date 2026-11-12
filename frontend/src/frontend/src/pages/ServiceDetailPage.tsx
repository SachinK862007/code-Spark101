import {
  PageFrame,
  SampleTag,
  SectionHeading,
  SourceBadge,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Local illustrative content for this screen                          */
/* ------------------------------------------------------------------ */

const SERVICE = {
  name: "Rooftop Solar Subsidy",
  category: "Renewable Energy",
  office: "Ministry of New & Renewable Energy",
  address: "Shram Shakti Bhawan, Rafi Marg, New Delhi 110001",
  region: "Central Delhi, Delhi",
  verified: "Verified 12 Nov 2026",
  overview:
    "The Rooftop Solar Subsidy programme provides a central financial assistance to residential households that install grid-connected rooftop solar systems. The subsidy is disbursed directly to the beneficiary's bank account after installation and net-metering approval by the local distribution company.",
};

const CONTACTS = [
  { id: "toll", label: "National Toll-Free Helpline", value: "1800 180 3333" },
  { id: "office", label: "Programme Office", value: "+91 11 2371 0400" },
  { id: "desk", label: "Residential Desk", value: "+91 11 2371 0412" },
];

const WORKING_HOURS = [
  { id: "mon", day: "Monday – Friday", hours: "09:30 – 17:30" },
  { id: "sat", day: "Saturday", hours: "10:00 – 13:00" },
  { id: "sun", day: "Sunday & Public Holidays", hours: "Closed" },
];

const SERVICES_PROVIDED = [
  "Residential rooftop solar subsidy application",
  "Vendor and installer empanelment verification",
  "Net-metering coordination with the local DISCOM",
  "Subsidy disbursement status tracking",
  "Technical feasibility guidance for households",
];

const REQUIRED_DOCUMENTS = [
  {
    id: "d1",
    label: "Proof of identity (Aadhaar or Passport)",
    mandatory: true,
  },
  {
    id: "d2",
    label: "Proof of address of the installation site",
    mandatory: true,
  },
  {
    id: "d3",
    label: "Latest electricity bill of the connection",
    mandatory: true,
  },
  {
    id: "d4",
    label: "Bank account details for subsidy credit",
    mandatory: true,
  },
  {
    id: "d5",
    label: "Signed vendor quotation and system specification",
    mandatory: true,
  },
  {
    id: "d6",
    label: "Net-metering approval from the DISCOM",
    mandatory: false,
  },
];

const APPLICATION_STEPS = [
  {
    id: "s1",
    title: "Register on the national portal",
    detail: "Create a household account and select your state and DISCOM.",
  },
  {
    id: "s2",
    title: "Submit the application",
    detail: "Upload identity, address and electricity bill documents.",
  },
  {
    id: "s3",
    title: "Feasibility approval",
    detail: "The DISCOM reviews the connection and issues technical clearance.",
  },
  {
    id: "s4",
    title: "Install through an empanelled vendor",
    detail: "Choose a registered vendor and complete the rooftop installation.",
  },
  {
    id: "s5",
    title: "Net-metering and inspection",
    detail: "The DISCOM installs the net meter and inspects the system.",
  },
  {
    id: "s6",
    title: "Subsidy disbursement",
    detail: "The subsidy is credited directly to the registered bank account.",
  },
];

const TIMELINES = [
  {
    id: "t1",
    stage: "Application acknowledgement",
    duration: "2 working days",
  },
  { id: "t2", stage: "Technical feasibility", duration: "15 working days" },
  { id: "t3", stage: "Net-metering approval", duration: "30 working days" },
  {
    id: "t4",
    stage: "Subsidy disbursement",
    duration: "30 days after inspection",
  },
];

const PORTAL_LINKS = [
  {
    id: "p1",
    label: "National Portal for Rooftop Solar",
    url: "pmsuryaghar.gov.in",
  },
  { id: "p2", label: "MNRE Scheme Guidelines", url: "mnre.gov.in/solar" },
  {
    id: "p3",
    label: "DISCOM Net-Metering Portal",
    url: "discom.gov.in/netmetering",
  },
];

const GRIEVANCE = [
  {
    id: "g1",
    level: "Level 1 — Programme Office",
    detail:
      "Raise a written complaint with the nodal officer at the programme office.",
    sla: "Resolved within 15 days",
  },
  {
    id: "g2",
    level: "Level 2 — DISCOM Consumer Forum",
    detail:
      "Escalate unresolved net-metering or billing issues to the consumer forum.",
    sla: "Resolved within 30 days",
  },
  {
    id: "g3",
    level: "Level 3 — MNRE Grievance Cell",
    detail: "Final escalation to the ministry grievance redressal cell.",
    sla: "Resolved within 45 days",
  },
];

const OFFICIAL_FACTS = [
  { id: "of1", label: "Published phone number", value: "1800 180 3333" },
  {
    id: "of2",
    label: "Published address",
    value: "Shram Shakti Bhawan, Rafi Marg, New Delhi",
  },
  {
    id: "of3",
    label: "Official service timeline",
    value: "45–60 days end to end",
  },
  { id: "of4", label: "Department website", value: "mnre.gov.in" },
];

const PUBLIC_NOTICES = [
  {
    id: "pn1",
    title: "Revised subsidy slabs effective 01 Oct 2026",
    date: "28 Sep 2026",
    tone: "success" as const,
    status: "Confirmed",
  },
  {
    id: "pn2",
    title: "Extended net-metering window for Delhi households",
    date: "14 Oct 2026",
    tone: "warning" as const,
    status: "Unverified",
  },
];

const PUBLIC_FEEDBACK = [
  {
    id: "pf1",
    text: "Vendor empanelment list was updated mid-application; had to reselect an installer.",
    source: "Consumer forum thread",
    tone: "warning" as const,
    status: "Unverified",
  },
  {
    id: "pf2",
    text: "Subsidy credited within 22 days of inspection for a 3 kW system.",
    source: "Public feedback",
    tone: "success" as const,
    status: "Confirmed",
  },
];

const DISCREPANCIES = [
  {
    id: "dc1",
    text: "Two public listings show a helpline number that differs from the published number.",
    tone: "danger" as const,
    status: "Discrepancy",
  },
];

const SOURCES = [
  {
    id: "sr1",
    label: "MNRE official scheme page",
    detail: "Primary source · retrieved 12 Nov 2026",
  },
  {
    id: "sr2",
    label: "National Portal for Rooftop Solar",
    detail: "Application data · retrieved 11 Nov 2026",
  },
  {
    id: "sr3",
    label: "DISCOM public notice board",
    detail: "Public notice · retrieved 10 Nov 2026",
  },
  {
    id: "sr4",
    label: "Consumer forum archive",
    detail: "Public feedback · retrieved 09 Nov 2026",
  },
];

const RELATED_SERVICES = [
  {
    id: "r1",
    name: "PM-KUSUM Scheme",
    category: "Agriculture",
    to: "/services/pm-kusum",
  },
  {
    id: "r2",
    name: "EV Charging Grid Access",
    category: "Mobility",
    to: "/services/ev-charging",
  },
  {
    id: "r3",
    name: "Register Utility Grievance",
    category: "Consumer Affairs",
    to: "/services/utility-grievance",
  },
];

/* ------------------------------------------------------------------ */
/* Small local building blocks                                         */
/* ------------------------------------------------------------------ */

function DetailSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-ocid={`service.section.${id}`}
      className="scroll-mt-24"
    >
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ServiceDetailPage() {
  return (
    <PageFrame className="max-w-[1440px]">
      {/* Breadcrumb + back action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" data-ocid="service.breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link
                to="/"
                className="transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link
                to="/services"
                className="transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Public Services
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="font-medium text-foreground">
              {SERVICE.name}
            </li>
          </ol>
        </nav>
        <Button
          asChild
          variant="outline"
          data-ocid="service.back_button"
          className="rounded-full border-border bg-card shadow-none transition-smooth hover:border-primary/40 hover:bg-secondary"
        >
          <Link to="/services">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to directory
          </Link>
        </Button>
      </div>

      {/* Top section */}
      <header
        data-ocid="service.header"
        className="mt-8 rounded-[20px] border border-border bg-card p-6 shadow-subtle md:p-10"
      >
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="primary">{SERVICE.category}</StatusBadge>
          <StatusBadge tone="success">
            <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
            {SERVICE.verified}
          </StatusBadge>
          <SampleTag />
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
          {SERVICE.name}
        </h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="size-4 shrink-0" aria-hidden="true" />
          {SERVICE.office}
        </p>
        <div className="mt-6 flex flex-wrap items-start gap-x-8 gap-y-3 border-t border-border pt-6">
          <p className="flex items-start gap-2 text-sm text-foreground">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>
              {SERVICE.address}
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {SERVICE.region}
              </span>
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Clock
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            Open today · 09:30 – 17:30
          </p>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left content column */}
        <div className="min-w-0 space-y-12">
          <DetailSection
            id="overview"
            title="Overview"
            description="What this service provides and who it is for."
          >
            <p className="text-base leading-relaxed text-foreground">
              {SERVICE.overview}
            </p>
          </DetailSection>

          <Separator />

          <DetailSection id="contact" title="Official contact numbers">
            <div className="grid gap-4 sm:grid-cols-2">
              {CONTACTS.map((contact) => (
                <div
                  key={contact.id}
                  data-ocid={`service.contact.${contact.id}`}
                  className="rounded-[16px] border border-border bg-card p-4 shadow-subtle"
                >
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {contact.label}
                  </p>
                  <p className="mt-1.5 font-mono text-lg font-semibold text-foreground">
                    {contact.value}
                  </p>
                </div>
              ))}
            </div>
          </DetailSection>

          <Separator />

          <DetailSection id="address" title="Address and location">
            <div className="overflow-hidden rounded-[16px] border border-border bg-card shadow-subtle">
              <div className="relative h-44 bg-gradient-subtle">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(oklch(var(--border)) 1px, transparent 1px), linear-gradient(90deg, oklch(var(--border)) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                  aria-hidden="true"
                />
                <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <span className="absolute bottom-3 left-3">
                  <SampleTag />
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-sm text-foreground">{SERVICE.address}</p>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="service.directions_button"
                  className="rounded-full border-border bg-card shadow-none transition-smooth hover:border-primary/40 hover:bg-secondary"
                >
                  <Navigation className="size-4" aria-hidden="true" />
                  Get directions
                </Button>
              </div>
            </div>
          </DetailSection>

          <Separator />

          <DetailSection id="hours" title="Working hours">
            <ul className="divide-y divide-border overflow-hidden rounded-[16px] border border-border bg-card shadow-subtle">
              {WORKING_HOURS.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="text-sm text-foreground">{row.day}</span>
                  <span
                    className={
                      row.hours === "Closed"
                        ? "font-mono text-sm text-muted-foreground"
                        : "font-mono text-sm font-medium text-foreground"
                    }
                  >
                    {row.hours}
                  </span>
                </li>
              ))}
            </ul>
          </DetailSection>

          <Separator />

          <DetailSection id="services" title="Services provided">
            <ul className="space-y-3">
              {SERVICES_PROVIDED.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </DetailSection>

          <Separator />

          <DetailSection
            id="documents"
            title="Required documents"
            description="Carry originals and one photocopy set for verification."
          >
            <ul className="space-y-2.5">
              {REQUIRED_DOCUMENTS.map((doc) => (
                <li
                  key={doc.id}
                  data-ocid={`service.document.${doc.id}`}
                  className="flex items-start justify-between gap-4 rounded-[14px] border border-border bg-card px-4 py-3 shadow-subtle"
                >
                  <span className="flex items-start gap-3 text-sm text-foreground">
                    <FileText
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {doc.label}
                  </span>
                  <StatusBadge tone={doc.mandatory ? "primary" : "neutral"}>
                    {doc.mandatory ? "Mandatory" : "If applicable"}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </DetailSection>

          <Separator />

          <DetailSection id="steps" title="Application steps">
            <ol className="relative space-y-6 border-l border-border pl-6">
              {APPLICATION_STEPS.map((step, index) => (
                <li key={step.id} className="relative">
                  <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full border border-border bg-card font-mono text-[11px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.detail}
                  </p>
                </li>
              ))}
            </ol>
          </DetailSection>

          <Separator />

          <DetailSection
            id="timelines"
            title="Expected service timelines"
            description="Published processing windows for each stage."
          >
            <div className="overflow-hidden rounded-[16px] border border-border bg-card shadow-subtle">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Stage
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Expected duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TIMELINES.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 text-foreground">{row.stage}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {row.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSection>

          <Separator />

          <DetailSection id="portals" title="Government portal links">
            <ul className="space-y-2.5">
              {PORTAL_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`https://${link.url}`}
                    data-ocid={`service.portal.${link.id}`}
                    className="group flex items-center justify-between gap-4 rounded-[14px] border border-border bg-card px-4 py-3 shadow-subtle transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                      <Globe
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {link.label}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      {link.url}
                      <ArrowUpRight
                        className="size-3.5 transition-smooth group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </DetailSection>

          <Separator />

          <DetailSection
            id="grievance"
            title="Grievance and escalation"
            description="Escalate in order if your application is not resolved."
          >
            <div className="space-y-3">
              {GRIEVANCE.map((item) => (
                <div
                  key={item.id}
                  data-ocid={`service.grievance.${item.id}`}
                  className="rounded-[16px] border border-border bg-card p-4 shadow-subtle"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {item.level}
                    </p>
                    <StatusBadge tone="neutral">{item.sla}</StatusBadge>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>

        {/* Right information column */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card
            data-ocid="service.important_panel"
            className="rounded-[18px] border-border bg-card p-6 shadow-subtle"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Important information
              </h2>
              <SampleTag />
            </div>
            <div className="mt-5 space-y-5">
              <InfoRow
                icon={<Phone className="size-4" aria-hidden="true" />}
                label="Official phone"
                value="1800 180 3333"
              />
              <InfoRow
                icon={<Globe className="size-4" aria-hidden="true" />}
                label="Website"
                value="mnre.gov.in/solar"
              />
              <InfoRow
                icon={<Clock className="size-4" aria-hidden="true" />}
                label="Opening hours"
                value="Mon–Fri 09:30–17:30 · Sat 10:00–13:00"
              />
              <InfoRow
                icon={<CalendarClock className="size-4" aria-hidden="true" />}
                label="Last verified"
                value="12 Nov 2026"
              />
            </div>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                type="button"
                data-ocid="service.panel.directions_button"
                className="w-full rounded-full bg-primary text-primary-foreground shadow-none transition-smooth hover:bg-primary/90"
              >
                <Navigation className="size-4" aria-hidden="true" />
                Get directions
              </Button>
              <Button
                asChild
                variant="outline"
                data-ocid="service.panel.website_button"
                className="w-full rounded-full border-border bg-card shadow-none transition-smooth hover:border-primary/40 hover:bg-secondary"
              >
                <a href="https://mnre.gov.in/solar">
                  <Globe className="size-4" aria-hidden="true" />
                  Visit official website
                </a>
              </Button>
            </div>
          </Card>

          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <h2 className="font-display text-lg font-semibold text-foreground">
              At a glance
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium text-foreground">
                  {SERVICE.category}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Region</dt>
                <dd className="font-medium text-foreground">
                  {SERVICE.region}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge tone="success">Open</StatusBadge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">End-to-end</dt>
                <dd className="font-mono font-medium text-foreground">
                  45–60 days
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>

      {/* Official vs additional public information */}
      <section
        data-ocid="service.comparison"
        className="mt-16 rounded-[20px] border border-border bg-muted/30 p-6 md:p-10"
      >
        <SectionHeading
          eyebrow="Provenance"
          title="Official vs additional public information"
          description="Official facts are published by the department. Additional public information is reported by the public and clearly separated."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Official panel */}
          <div
            data-ocid="service.official_panel"
            className="rounded-[18px] border border-success/25 bg-card p-6 shadow-subtle"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <ShieldCheck
                  className="size-5 text-success"
                  aria-hidden="true"
                />
                Official information
              </h3>
              <StatusBadge tone="success">Confirmed</StatusBadge>
            </div>
            <dl className="mt-5 space-y-4">
              {OFFICIAL_FACTS.map((fact) => (
                <div
                  key={fact.id}
                  className="border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <SourceBadge>MNRE official page</SourceBadge>
              <SourceBadge>National portal</SourceBadge>
            </div>
          </div>

          {/* Additional public panel */}
          <div
            data-ocid="service.public_panel"
            className="rounded-[18px] border border-warning/25 bg-card p-6 shadow-subtle"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                <TriangleAlert
                  className="size-5 text-warning"
                  aria-hidden="true"
                />
                Additional public information
              </h3>
              <StatusBadge tone="warning">Unverified</StatusBadge>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Public notices
                </p>
                <ul className="mt-2.5 space-y-2.5">
                  {PUBLIC_NOTICES.map((notice) => (
                    <li
                      key={notice.id}
                      data-ocid={`service.notice.${notice.id}`}
                      className="rounded-[14px] border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                          {notice.title}
                        </p>
                        <StatusBadge tone={notice.tone}>
                          {notice.status}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {notice.date}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Relevant public feedback
                </p>
                <ul className="mt-2.5 space-y-2.5">
                  {PUBLIC_FEEDBACK.map((item) => (
                    <li
                      key={item.id}
                      data-ocid={`service.feedback.${item.id}`}
                      className="rounded-[14px] border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-foreground">{item.text}</p>
                        <StatusBadge tone={item.tone}>
                          {item.status}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {item.source}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Information discrepancies
                </p>
                <ul className="mt-2.5 space-y-2.5">
                  {DISCREPANCIES.map((item) => (
                    <li
                      key={item.id}
                      data-ocid={`service.discrepancy.${item.id}`}
                      className="rounded-[14px] border border-destructive/30 bg-destructive/5 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <ShieldAlert
                          className="mt-0.5 size-4 shrink-0 text-destructive"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm text-foreground">{item.text}</p>
                          <div className="mt-1.5">
                            <StatusBadge tone="danger">
                              {item.status}
                            </StatusBadge>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Further sections */}
      <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-12">
          <DetailSection
            id="procedure"
            title="Service procedure timeline"
            description="The full journey from application to subsidy credit."
          >
            <ol className="relative space-y-6 border-l border-border pl-6">
              {APPLICATION_STEPS.map((step, index) => (
                <li key={step.id} className="relative">
                  <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full border border-border bg-card font-mono text-[11px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.detail}
                  </p>
                </li>
              ))}
            </ol>
          </DetailSection>

          <Separator />

          <DetailSection
            id="checklist"
            title="Document checklist"
            description="Tick each item before visiting the office."
          >
            <ul className="space-y-2.5">
              {REQUIRED_DOCUMENTS.map((doc) => (
                <li
                  key={doc.id}
                  data-ocid={`service.checklist.${doc.id}`}
                  className="flex items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3 shadow-subtle"
                >
                  <span
                    className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground"
                    aria-hidden="true"
                  >
                    <CheckCircle2 className="size-3.5" />
                  </span>
                  <span className="text-sm text-foreground">{doc.label}</span>
                </li>
              ))}
            </ul>
          </DetailSection>

          <Separator />

          <DetailSection id="escalation" title="Contact and escalation options">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[16px] border border-border bg-card p-4 shadow-subtle">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Phone className="size-4 text-primary" aria-hidden="true" />
                  Helpline
                </p>
                <p className="mt-1.5 font-mono text-sm text-foreground">
                  1800 180 3333
                </p>
              </div>
              <div className="rounded-[16px] border border-border bg-card p-4 shadow-subtle">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mail className="size-4 text-primary" aria-hidden="true" />
                  Grievance email
                </p>
                <p className="mt-1.5 font-mono text-sm text-foreground">
                  grievance-mnre@gov.in
                </p>
              </div>
            </div>
          </DetailSection>
        </div>

        <aside className="space-y-6">
          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Sources & provenance
              </h2>
              <SampleTag />
            </div>
            <ul className="mt-4 space-y-3">
              {SOURCES.map((source) => (
                <li
                  key={source.id}
                  data-ocid={`service.source.${source.id}`}
                  className="flex items-start gap-3"
                >
                  <BadgeCheck
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {source.label}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {source.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Related services
            </h2>
            <ul className="mt-4 space-y-2.5">
              {RELATED_SERVICES.map((related) => (
                <li key={related.id}>
                  <Link
                    to="/services/$id"
                    params={{ id: related.id }}
                    data-ocid={`service.related.${related.id}`}
                    className="group flex items-center justify-between gap-3 rounded-[14px] border border-border bg-muted/30 px-4 py-3 transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {related.name}
                      </span>
                      <span className="block font-mono text-xs text-muted-foreground">
                        {related.category}
                      </span>
                    </span>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground transition-smooth group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </PageFrame>
  );
}
