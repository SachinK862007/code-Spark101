import {
  EmptyState,
  FilterChip,
  PageFrame,
  SampleTag,
  SectionHeading,
  StatusBadge,
  type StatusTone,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Banknote,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Static sample data — design-only prototype                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  "Solar Installation",
  "Wind Maintenance",
  "Battery Design",
  "Renewable Energy Engineering",
  "Organic Farming",
  "Sustainability",
  "Environmental Research",
  "Energy Data Analysis",
] as const;

type Category = (typeof CATEGORIES)[number];

const EXPERIENCE_LEVELS = [
  "Entry level",
  "1–3 years",
  "3–5 years",
  "5–8 years",
  "8+ years",
] as const;

type Experience = (typeof EXPERIENCE_LEVELS)[number];

const WORK_MODES = ["On-site", "Hybrid", "Remote"] as const;

type WorkMode = (typeof WORK_MODES)[number];

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Contract",
  "Internship",
  "Apprenticeship",
] as const;

type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

const SALARY_BANDS = [
  "Any salary",
  "Under ₹4 LPA",
  "₹4–8 LPA",
  "₹8–15 LPA",
  "₹15 LPA+",
] as const;

type SalaryBand = (typeof SALARY_BANDS)[number];

const LOCATIONS = [
  "All locations",
  "Bengaluru, Karnataka",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Chennai, Tamil Nadu",
  "Hyderabad, Telangana",
  "Coimbatore, Tamil Nadu",
  "Remote — India",
] as const;

interface Job {
  id: string;
  title: string;
  organisation: string;
  organisationType: string;
  organisationAbout: string;
  location: string;
  category: Category;
  experience: Experience;
  salary: string;
  salaryMin: number;
  employmentType: EmploymentType;
  workMode: WorkMode;
  postedDate: string;
  summary: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  qualifications: string[];
  applicationInstructions: string;
  openings: number;
}

const JOBS: Job[] = [
  {
    id: "solar-field-installer",
    title: "Solar Field Installation Technician",
    organisation: "Suryodaya Renewables",
    organisationType: "Rooftop solar EPC contractor",
    organisationAbout:
      "A rooftop solar engineering, procurement and construction firm that has commissioned over 180 MW of distributed solar across western India.",
    location: "Jaipur, Rajasthan",
    category: "Solar Installation",
    experience: "1–3 years",
    salary: "₹3.6–5.4 LPA",
    salaryMin: 3.6,
    employmentType: "Full-time",
    workMode: "On-site",
    postedDate: "Posted 3 days ago",
    summary:
      "Install and commission rooftop photovoltaic arrays for residential and commercial sites.",
    description:
      "Join a field crew delivering rooftop solar systems from structural mounting through to grid synchronisation. You will work alongside licensed electricians and site supervisors to keep installations safe, on schedule and to specification.",
    responsibilities: [
      "Mount and align module arrays on pitched and flat rooftops",
      "Route DC cabling, install junction boxes and terminate strings",
      "Commission inverters and verify generation against design output",
      "Complete site safety checklists and handover documentation",
    ],
    skills: [
      "PV module mounting",
      "DC wiring and termination",
      "Inverter commissioning",
      "Working at height",
      "Site safety compliance",
    ],
    qualifications: [
      "ITI or diploma in electrical or electronics trade",
      "Valid electrical wireman licence preferred",
      "Willingness to travel to project sites",
    ],
    applicationInstructions:
      "Email your CV and trade certificate to careers@suryodaya-demo.example with the subject line “Solar Field Installation Technician”. Shortlisted candidates are invited to a site walkthrough.",
    openings: 6,
  },
  {
    id: "wind-turbine-maintenance",
    title: "Wind Turbine Maintenance Engineer",
    organisation: "Vayu Wind Services",
    organisationType: "O&M service provider",
    organisationAbout:
      "An operations and maintenance specialist managing more than 900 wind turbines across Tamil Nadu and Gujarat wind farms.",
    location: "Coimbatore, Tamil Nadu",
    category: "Wind Maintenance",
    experience: "3–5 years",
    salary: "₹7.2–10.8 LPA",
    salaryMin: 7.2,
    employmentType: "Full-time",
    workMode: "On-site",
    postedDate: "Posted 5 days ago",
    summary:
      "Carry out scheduled and corrective maintenance on utility-scale wind turbines.",
    description:
      "You will keep turbine fleets generating reliably through preventive maintenance, fault diagnosis and component replacement. The role combines hands-on nacelle work with data-led reliability analysis.",
    responsibilities: [
      "Perform scheduled maintenance on nacelle, hub and tower systems",
      "Diagnose and repair electrical and mechanical faults",
      "Replace gearbox, bearing and blade components with the site team",
      "Log work orders and reliability data in the maintenance system",
    ],
    skills: [
      "Turbine mechanical systems",
      "SCADA fault diagnosis",
      "Hydraulic systems",
      "Confined space and height work",
      "Preventive maintenance planning",
    ],
    qualifications: [
      "B.E. or B.Tech in mechanical or electrical engineering",
      "3+ years of wind farm O&M experience",
      "GWO basic safety training certification",
    ],
    applicationInstructions:
      "Apply through the Vayu Wind Services careers portal with your engineering degree and safety certifications attached. Technical interviews are held at the Coimbatore service hub.",
    openings: 3,
  },
  {
    id: "battery-pack-design",
    title: "Battery Pack Design Engineer",
    organisation: "Amperon Energy Systems",
    organisationType: "Battery and storage manufacturer",
    organisationAbout:
      "A grid-scale and electric-mobility battery manufacturer building lithium-ion pack assembly lines in Gujarat.",
    location: "Ahmedabad, Gujarat",
    category: "Battery Design",
    experience: "3–5 years",
    salary: "₹9.6–14.4 LPA",
    salaryMin: 9.6,
    employmentType: "Full-time",
    workMode: "Hybrid",
    postedDate: "Posted 1 week ago",
    summary:
      "Design lithium-ion battery packs for stationary storage and mobility applications.",
    description:
      "Own the mechanical and thermal design of battery packs from cell selection through to validation. You will work with cell suppliers, thermal engineers and manufacturing teams to take designs into production.",
    responsibilities: [
      "Design pack enclosures, busbars and module assemblies",
      "Model thermal behaviour and specify cooling strategies",
      "Run structural and abuse-test validation programmes",
      "Support design-for-manufacture reviews with the assembly line",
    ],
    skills: [
      "CAD (SolidWorks or CATIA)",
      "Thermal simulation",
      "BMS integration",
      "Cell characterisation",
      "DFM and DFA",
    ],
    qualifications: [
      "B.E. or M.Tech in mechanical, electrical or energy engineering",
      "Experience with lithium-ion pack design",
      "Familiarity with AIS-156 and IEC 62619 standards",
    ],
    applicationInstructions:
      "Send a portfolio of pack designs and your CV to talent@amperon-demo.example. Include a short note on a validation programme you have led.",
    openings: 2,
  },
  {
    id: "re-grid-integration",
    title: "Renewable Grid Integration Engineer",
    organisation: "Grid-India Transition Lab",
    organisationType: "Grid planning and research body",
    organisationAbout:
      "A grid planning unit studying renewable integration, storage dispatch and transmission adequacy for the national grid.",
    location: "Bengaluru, Karnataka",
    category: "Renewable Energy Engineering",
    experience: "5–8 years",
    salary: "₹14–20 LPA",
    salaryMin: 14,
    employmentType: "Full-time",
    workMode: "Hybrid",
    postedDate: "Posted 2 weeks ago",
    summary:
      "Model renewable integration and storage dispatch for regional transmission planning.",
    description:
      "Lead studies on how rising solar and wind penetration affects grid stability, curtailment and storage requirements. Your models will inform transmission investment and flexibility planning.",
    responsibilities: [
      "Build production-cost and unit-commitment models",
      "Assess curtailment, ramping and flexibility needs",
      "Evaluate storage and demand-response options",
      "Publish planning notes for regional grid operators",
    ],
    skills: [
      "Power system modelling",
      "Python and optimisation libraries",
      "PSS/E or PLEXOS",
      "Renewable resource assessment",
      "Technical writing",
    ],
    qualifications: [
      "M.Tech or Ph.D. in power systems or energy engineering",
      "5+ years in grid or renewable integration studies",
      "Track record of published planning analysis",
    ],
    applicationInstructions:
      "Submit your CV and two representative study reports to careers@gridtransition-demo.example. Include the modelling tools you work in.",
    openings: 1,
  },
  {
    id: "organic-farm-supervisor",
    title: "Organic Farm Supervisor",
    organisation: "Prithvi Agro Collective",
    organisationType: "Farmer producer organisation",
    organisationAbout:
      "A collective of 1,200 smallholder farmers transitioning to certified organic and agroecological practices.",
    location: "Pune, Maharashtra",
    category: "Organic Farming",
    experience: "1–3 years",
    salary: "₹3.0–4.8 LPA",
    salaryMin: 3.0,
    employmentType: "Full-time",
    workMode: "On-site",
    postedDate: "Posted 4 days ago",
    summary:
      "Guide smallholder farmers through organic certification and sustainable cultivation.",
    description:
      "Work directly with member farmers to plan crop rotations, manage soil health and maintain the records required for organic certification. The role blends field agronomy with farmer training.",
    responsibilities: [
      "Advise farmers on organic inputs and soil management",
      "Maintain certification and traceability records",
      "Run field demonstrations and farmer training sessions",
      "Coordinate harvest logistics with the collective's buyers",
    ],
    skills: [
      "Organic cultivation practices",
      "Soil health assessment",
      "Farmer training",
      "Certification documentation",
      "Marathi and Hindi communication",
    ],
    qualifications: [
      "B.Sc. in agriculture or a related discipline",
      "Experience with organic or natural farming",
      "Willingness to travel across member villages",
    ],
    applicationInstructions:
      "Call the collective office or email your CV to hr@prithviagro-demo.example. Field visits are arranged for shortlisted applicants.",
    openings: 4,
  },
  {
    id: "sustainability-analyst",
    title: "Corporate Sustainability Analyst",
    organisation: "Meridian Industries",
    organisationType: "Manufacturing group",
    organisationAbout:
      "A diversified manufacturing group reporting on emissions, energy and water across eleven plants.",
    location: "Hyderabad, Telangana",
    category: "Sustainability",
    experience: "3–5 years",
    salary: "₹8.4–12 LPA",
    salaryMin: 8.4,
    employmentType: "Full-time",
    workMode: "Hybrid",
    postedDate: "Posted 6 days ago",
    summary:
      "Track emissions, energy and resource metrics and prepare sustainability disclosures.",
    description:
      "Own the group's sustainability data pipeline and reporting. You will gather plant-level data, calculate emissions and prepare disclosures aligned with emerging reporting standards.",
    responsibilities: [
      "Collect and validate plant-level energy and emissions data",
      "Calculate Scope 1, 2 and 3 emissions inventories",
      "Prepare annual sustainability and BRSR disclosures",
      "Identify reduction opportunities with plant teams",
    ],
    skills: [
      "GHG accounting",
      "BRSR and GRI reporting",
      "Data analysis and spreadsheets",
      "Stakeholder coordination",
      "Assurance readiness",
    ],
    qualifications: [
      "Degree in environmental science, engineering or commerce",
      "3+ years in sustainability or ESG reporting",
      "Familiarity with GHG Protocol",
    ],
    applicationInstructions:
      "Apply via the Meridian Industries careers page with your CV and a sample disclosure or emissions inventory you have prepared.",
    openings: 2,
  },
  {
    id: "air-quality-researcher",
    title: "Air Quality Research Associate",
    organisation: "Centre for Clean Air Studies",
    organisationType: "Environmental research institute",
    organisationAbout:
      "An independent research institute studying urban air quality, source apportionment and public health impacts.",
    location: "Chennai, Tamil Nadu",
    category: "Environmental Research",
    experience: "Entry level",
    salary: "₹4.2–6.0 LPA",
    salaryMin: 4.2,
    employmentType: "Contract",
    workMode: "On-site",
    postedDate: "Posted 2 days ago",
    summary:
      "Support air quality monitoring campaigns and source apportionment studies.",
    description:
      "Assist senior researchers in running monitoring campaigns, processing sensor and reference-grade data, and preparing findings for publication and policy briefs.",
    responsibilities: [
      "Operate and maintain air quality monitoring instruments",
      "Clean, process and analyse monitoring datasets",
      "Support source apportionment modelling",
      "Draft sections of research reports and briefs",
    ],
    skills: [
      "Air quality monitoring",
      "R or Python analysis",
      "Data quality control",
      "Scientific writing",
      "Field campaign coordination",
    ],
    qualifications: [
      "Master's degree in environmental science or engineering",
      "Exposure to atmospheric monitoring or modelling",
      "Strong analytical writing skills",
    ],
    applicationInstructions:
      "Email your CV, a writing sample and academic transcripts to research@cleanair-demo.example with the subject “Air Quality Research Associate”.",
    openings: 2,
  },
  {
    id: "energy-data-analyst",
    title: "Energy Data Analyst",
    organisation: "Wattwise Analytics",
    organisationType: "Energy analytics platform",
    organisationAbout:
      "A data platform helping discoms and renewable developers forecast demand, generation and revenue.",
    location: "Bengaluru, Karnataka",
    category: "Energy Data Analysis",
    experience: "1–3 years",
    salary: "₹6.0–9.6 LPA",
    salaryMin: 6.0,
    employmentType: "Full-time",
    workMode: "Remote",
    postedDate: "Posted 1 day ago",
    summary:
      "Build dashboards and models that turn metered energy data into decisions.",
    description:
      "Work with large metered datasets to build forecasting models, anomaly detection and client dashboards. You will partner with product and engineering to ship analytics features.",
    responsibilities: [
      "Clean and model time-series energy datasets",
      "Build demand and generation forecasting models",
      "Develop client-facing dashboards and reports",
      "Investigate data anomalies with engineering",
    ],
    skills: [
      "SQL and Python",
      "Time-series analysis",
      "Dashboarding tools",
      "Statistical modelling",
      "Clear data storytelling",
    ],
    qualifications: [
      "Degree in engineering, statistics or data science",
      "1+ year of analytics experience",
      "Comfort with large datasets",
    ],
    applicationInstructions:
      "Apply through the Wattwise careers portal and link a dashboard or analysis you are proud of. This is a fully remote role within India.",
    openings: 3,
  },
  {
    id: "solar-design-drafter",
    title: "Solar Design and Drafting Engineer",
    organisation: "Suryodaya Renewables",
    organisationType: "Rooftop solar EPC contractor",
    organisationAbout:
      "A rooftop solar engineering, procurement and construction firm that has commissioned over 180 MW of distributed solar across western India.",
    location: "Ahmedabad, Gujarat",
    category: "Solar Installation",
    experience: "1–3 years",
    salary: "₹4.8–7.2 LPA",
    salaryMin: 4.8,
    employmentType: "Full-time",
    workMode: "Hybrid",
    postedDate: "Posted 1 week ago",
    summary:
      "Produce rooftop solar layouts, single-line diagrams and bill-of-materials.",
    description:
      "Translate site surveys into buildable solar designs. You will prepare drawings, size systems and coordinate with the field team to resolve design queries.",
    responsibilities: [
      "Prepare rooftop layouts and single-line diagrams",
      "Size arrays, inverters and balance-of-system components",
      "Produce bills of materials and design notes",
      "Resolve design queries with installation crews",
    ],
    skills: [
      "AutoCAD and PV design tools",
      "System sizing",
      "Electrical single-line diagrams",
      "Site survey interpretation",
      "Attention to detail",
    ],
    qualifications: [
      "Diploma or degree in electrical or energy engineering",
      "Experience with rooftop solar design software",
      "Familiarity with net-metering requirements",
    ],
    applicationInstructions:
      "Email your CV and two sample design drawings to careers@suryodaya-demo.example with the subject “Solar Design and Drafting Engineer”.",
    openings: 2,
  },
  {
    id: "wind-resource-analyst",
    title: "Wind Resource Assessment Analyst",
    organisation: "Vayu Wind Services",
    organisationType: "O&M service provider",
    organisationAbout:
      "An operations and maintenance specialist managing more than 900 wind turbines across Tamil Nadu and Gujarat wind farms.",
    location: "Remote — India",
    category: "Wind Maintenance",
    experience: "3–5 years",
    salary: "₹8.0–11.5 LPA",
    salaryMin: 8.0,
    employmentType: "Full-time",
    workMode: "Remote",
    postedDate: "Posted 9 days ago",
    summary:
      "Analyse wind measurement data to estimate energy yield for new sites.",
    description:
      "Assess wind resource data, model energy yield and advise on turbine layout for prospective wind farms. The role is remote with occasional site visits.",
    responsibilities: [
      "Process met-mast and LiDAR measurement data",
      "Model long-term energy yield and uncertainty",
      "Optimise turbine micro-siting and layout",
      "Prepare resource assessment reports for clients",
    ],
    skills: [
      "WAsP or equivalent tools",
      "Wind data analysis",
      "Statistical modelling",
      "Report writing",
      "GIS basics",
    ],
    qualifications: [
      "Degree in engineering, meteorology or atmospheric science",
      "3+ years in wind resource assessment",
      "Experience with energy yield modelling",
    ],
    applicationInstructions:
      "Send your CV and a summary of a resource assessment you have completed to careers@vayuwind-demo.example.",
    openings: 1,
  },
  {
    id: "sustainability-intern",
    title: "Sustainability Reporting Intern",
    organisation: "Meridian Industries",
    organisationType: "Manufacturing group",
    organisationAbout:
      "A diversified manufacturing group reporting on emissions, energy and water across eleven plants.",
    location: "Hyderabad, Telangana",
    category: "Sustainability",
    experience: "Entry level",
    salary: "₹25,000 / month stipend",
    salaryMin: 3.0,
    employmentType: "Internship",
    workMode: "On-site",
    postedDate: "Posted 3 days ago",
    summary:
      "Support the sustainability team with data collection and disclosure drafting.",
    description:
      "A six-month internship for a student or recent graduate keen to learn corporate sustainability reporting. You will support data collection, verification and drafting of disclosures.",
    responsibilities: [
      "Assist with plant-level data collection",
      "Help verify and organise sustainability datasets",
      "Draft sections of disclosure documents",
      "Support internal awareness sessions",
    ],
    skills: [
      "Spreadsheet analysis",
      "Research skills",
      "Attention to detail",
      "Written communication",
      "Interest in ESG",
    ],
    qualifications: [
      "Final-year student or recent graduate in a relevant field",
      "Strong academic record",
      "Available for six months",
    ],
    applicationInstructions:
      "Apply via the Meridian Industries careers page with your CV and a short statement of interest in sustainability reporting.",
    openings: 2,
  },
  {
    id: "battery-test-technician",
    title: "Battery Test Technician",
    organisation: "Amperon Energy Systems",
    organisationType: "Battery and storage manufacturer",
    organisationAbout:
      "A grid-scale and electric-mobility battery manufacturer building lithium-ion pack assembly lines in Gujarat.",
    location: "Ahmedabad, Gujarat",
    category: "Battery Design",
    experience: "Entry level",
    salary: "₹3.0–4.2 LPA",
    salaryMin: 3.0,
    employmentType: "Apprenticeship",
    workMode: "On-site",
    postedDate: "Posted 8 days ago",
    summary:
      "Run cell and pack tests and record results on the validation bench.",
    description:
      "An apprenticeship on the battery validation bench, learning to run cycle-life, thermal and abuse tests while maintaining meticulous test records.",
    responsibilities: [
      "Set up and run cell and pack test cycles",
      "Record and organise test data",
      "Maintain test bench equipment",
      "Flag anomalies to validation engineers",
    ],
    skills: [
      "Test bench operation",
      "Data recording",
      "Basic electrical measurement",
      "Lab safety",
      "Careful documentation",
    ],
    qualifications: [
      "ITI or diploma in electrical or electronics trade",
      "Interest in battery technology",
      "Willingness to learn",
    ],
    applicationInstructions:
      "Email your CV to talent@amperon-demo.example with the subject “Battery Test Technician apprenticeship”.",
    openings: 5,
  },
];

const SALARY_BAND_RANGES: Record<SalaryBand, [number, number]> = {
  "Any salary": [0, Number.POSITIVE_INFINITY],
  "Under ₹4 LPA": [0, 4],
  "₹4–8 LPA": [4, 8],
  "₹8–15 LPA": [8, 15],
  "₹15 LPA+": [15, Number.POSITIVE_INFINITY],
};

const CATEGORY_TONES: Record<Category, StatusTone> = {
  "Solar Installation": "warning",
  "Wind Maintenance": "primary",
  "Battery Design": "success",
  "Renewable Energy Engineering": "primary",
  "Organic Farming": "success",
  Sustainability: "success",
  "Environmental Research": "neutral",
  "Energy Data Analysis": "primary",
};

const DEMO_SOURCE = "Compiled from illustrative employer listings";
const DEMO_PERIOD = "Sample set · Nov 2026";

/* ------------------------------------------------------------------ */
/* Job card                                                            */
/* ------------------------------------------------------------------ */

function JobCard({
  job,
  index,
  saved,
  onToggleSave,
  onOpen,
}: {
  job: Job;
  index: number;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onOpen: (job: Job) => void;
}) {
  return (
    <Card
      data-ocid={`jobs.card.${index + 1}`}
      className="flex h-full flex-col rounded-[20px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            {job.category}
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-foreground">
            {job.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{job.organisation}</span>
          </p>
        </div>
        <button
          type="button"
          data-ocid={`jobs.save_button.${index + 1}`}
          aria-pressed={saved}
          aria-label={
            saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`
          }
          onClick={() => onToggleSave(job.id)}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full border transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            saved
              ? "border-primary/40 bg-secondary text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
          )}
        >
          {saved ? (
            <BookmarkCheck className="size-4" aria-hidden="true" />
          ) : (
            <Bookmark className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="min-w-0">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Location
          </dt>
          <dd className="mt-1 flex items-center gap-1.5 text-foreground">
            <MapPin
              className="size-3.5 shrink-0 text-primary/70"
              aria-hidden="true"
            />
            <span className="truncate">{job.location}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Experience
          </dt>
          <dd className="mt-1 flex items-center gap-1.5 text-foreground">
            <GraduationCap
              className="size-3.5 shrink-0 text-primary/70"
              aria-hidden="true"
            />
            <span className="truncate">{job.experience}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Compensation
          </dt>
          <dd className="mt-1 flex items-center gap-1.5 font-mono text-foreground">
            <Banknote
              className="size-3.5 shrink-0 text-primary/70"
              aria-hidden="true"
            />
            <span className="truncate">{job.salary}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Work mode
          </dt>
          <dd className="mt-1 flex items-center gap-1.5 text-foreground">
            <Briefcase
              className="size-3.5 shrink-0 text-primary/70"
              aria-hidden="true"
            />
            <span className="truncate">{job.workMode}</span>
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge tone={CATEGORY_TONES[job.category]}>
          {job.employmentType}
        </StatusBadge>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <Clock className="size-3" aria-hidden="true" />
          {job.postedDate}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-5">
        <Button
          type="button"
          data-ocid={`jobs.apply_button.${index + 1}`}
          onClick={() => onOpen(job)}
          className="flex-1 rounded-full bg-primary text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated hover:brightness-110"
        >
          <Send className="size-4" aria-hidden="true" />
          Apply
        </Button>
        <Button
          type="button"
          variant="outline"
          data-ocid={`jobs.detail_button.${index + 1}`}
          onClick={() => onOpen(job)}
          className="rounded-full border-border bg-card"
        >
          View details
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Job detail dialog                                                   */
/* ------------------------------------------------------------------ */

function JobDetailDialog({
  job,
  saved,
  onToggleSave,
  onClose,
}: {
  job: Job | null;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={job !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="jobs.detail_dialog"
        className="max-h-[88vh] overflow-y-auto rounded-[20px] border-border bg-card p-0 sm:max-w-2xl"
      >
        {job && (
          <div className="p-6 md:p-8">
            <DialogHeader className="text-left">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                {job.category}
              </p>
              <DialogTitle className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground">
                {job.title}
              </DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5" aria-hidden="true" />
                  {job.organisation}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {job.location}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <SampleTag />
              <StatusBadge tone={CATEGORY_TONES[job.category]}>
                {job.employmentType}
              </StatusBadge>
              <StatusBadge tone="neutral">{job.workMode}</StatusBadge>
              <StatusBadge tone="neutral">{job.experience}</StatusBadge>
            </div>

            <dl className="mt-6 grid gap-4 rounded-2xl border border-border bg-muted/30 p-5 sm:grid-cols-3">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Compensation
                </dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-foreground">
                  {job.salary}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Openings
                </dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-foreground">
                  {job.openings}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Posted
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                  <CalendarDays
                    className="size-3.5 text-primary/70"
                    aria-hidden="true"
                  />
                  {job.postedDate}
                </dd>
              </div>
            </dl>

            <div className="mt-6 space-y-6">
              <section>
                <h4 className="font-display text-base font-semibold text-foreground">
                  Role description
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {job.description}
                </p>
              </section>

              <section>
                <h4 className="font-display text-base font-semibold text-foreground">
                  Responsibilities
                </h4>
                <ul className="mt-2 space-y-2">
                  {job.responsibilities.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="font-display text-base font-semibold text-foreground">
                  Skills
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="font-display text-base font-semibold text-foreground">
                  Qualifications
                </h4>
                <ul className="mt-2 space-y-2">
                  {job.qualifications.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <GraduationCap
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-border bg-muted/30 p-5">
                <h4 className="font-display text-base font-semibold text-foreground">
                  About {job.organisation}
                </h4>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {job.organisationType}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {job.organisationAbout}
                </p>
              </section>

              <section>
                <h4 className="font-display text-base font-semibold text-foreground">
                  How to apply
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {job.applicationInstructions}
                </p>
              </section>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
              <Button
                type="button"
                data-ocid="jobs.detail_apply_button"
                className="rounded-full bg-primary text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated hover:brightness-110 sm:flex-1"
              >
                <Send className="size-4" aria-hidden="true" />
                Apply for this role
              </Button>
              <Button
                type="button"
                variant="outline"
                data-ocid="jobs.detail_save_button"
                aria-pressed={saved}
                onClick={() => onToggleSave(job.id)}
                className="rounded-full border-border bg-card"
              >
                {saved ? (
                  <BookmarkCheck className="size-4" aria-hidden="true" />
                ) : (
                  <Bookmark className="size-4" aria-hidden="true" />
                )}
                {saved ? "Saved" : "Save job"}
              </Button>
            </div>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Demo opportunity · {DEMO_SOURCE} · {DEMO_PERIOD}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function GreenJobsPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [category, setCategory] = useState<string>("All categories");
  const [experience, setExperience] = useState<string>("All experience");
  const [workMode, setWorkMode] = useState<string>("All work modes");
  const [salaryBand, setSalaryBand] = useState<SalaryBand>("Any salary");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const [minSalary, maxSalary] = SALARY_BAND_RANGES[salaryBand];
    return JOBS.filter((job) => {
      const matchesQuery =
        needle.length === 0 ||
        job.title.toLowerCase().includes(needle) ||
        job.organisation.toLowerCase().includes(needle);
      const matchesLocation =
        location === LOCATIONS[0] || job.location === location;
      const matchesCategory =
        category === "All categories" || job.category === category;
      const matchesExperience =
        experience === "All experience" || job.experience === experience;
      const matchesWorkMode =
        workMode === "All work modes" || job.workMode === workMode;
      const matchesSalary =
        job.salaryMin >= minSalary && job.salaryMin < maxSalary;
      const matchesSaved = !showSavedOnly || savedIds.includes(job.id);
      return (
        matchesQuery &&
        matchesLocation &&
        matchesCategory &&
        matchesExperience &&
        matchesWorkMode &&
        matchesSalary &&
        matchesSaved
      );
    });
  }, [
    query,
    location,
    category,
    experience,
    workMode,
    salaryBand,
    showSavedOnly,
    savedIds,
  ]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    location !== LOCATIONS[0] ||
    category !== "All categories" ||
    experience !== "All experience" ||
    workMode !== "All work modes" ||
    salaryBand !== "Any salary" ||
    showSavedOnly;

  function toggleSave(id: string) {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id],
    );
  }

  function clearFilters() {
    setQuery("");
    setLocation(LOCATIONS[0]);
    setCategory("All categories");
    setExperience("All experience");
    setWorkMode("All work modes");
    setSalaryBand("Any salary");
    setShowSavedOnly(false);
  }

  return (
    <PageFrame>
      {/* Header */}
      <section data-ocid="jobs.section" className="max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Opportunities &amp; Resources · D4
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
          Green jobs board
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Browse renewable-sector openings across generation, manufacturing,
          research and services — from field installation to energy analytics.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <SampleTag />
          <StatusBadge tone="neutral">{DEMO_PERIOD}</StatusBadge>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Source: {DEMO_SOURCE}
          </span>
        </div>
      </section>

      {/* Search + filters */}
      <Card
        data-ocid="jobs.filters"
        className="mt-10 rounded-[20px] border-border bg-card p-5 shadow-subtle md:p-6"
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              data-ocid="jobs.search_input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by job title or company"
              aria-label="Search jobs by title or company"
              className="h-12 rounded-full border-input bg-background pl-11 pr-4 text-base"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger
                data-ocid="jobs.location_select"
                aria-label="Filter by location"
                className="h-11 w-full rounded-full border-input bg-background px-4"
              >
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                data-ocid="jobs.category_select"
                aria-label="Filter by category"
                className="h-11 w-full rounded-full border-input bg-background px-4"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All categories">All categories</SelectItem>
                {CATEGORIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger
                data-ocid="jobs.experience_select"
                aria-label="Filter by experience"
                className="h-11 w-full rounded-full border-input bg-background px-4"
              >
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All experience">All experience</SelectItem>
                {EXPERIENCE_LEVELS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={workMode} onValueChange={setWorkMode}>
              <SelectTrigger
                data-ocid="jobs.work_mode_select"
                aria-label="Filter by work mode"
                className="h-11 w-full rounded-full border-input bg-background px-4"
              >
                <SelectValue placeholder="Work mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All work modes">All work modes</SelectItem>
                {WORK_MODES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={salaryBand}
              onValueChange={(value) => setSalaryBand(value as SalaryBand)}
            >
              <SelectTrigger
                data-ocid="jobs.salary_select"
                aria-label="Filter by salary range"
                className="h-11 w-full rounded-full border-input bg-background px-4"
              >
                <SelectValue placeholder="Salary range" />
              </SelectTrigger>
              <SelectContent>
                {SALARY_BANDS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Quick filters
            </span>
            <FilterChip
              label="Saved jobs"
              active={showSavedOnly}
              onClick={() => setShowSavedOnly((current) => !current)}
            />
            {CATEGORIES.slice(0, 4).map((option) => (
              <FilterChip
                key={option}
                label={option}
                active={category === option}
                onClick={() =>
                  setCategory(category === option ? "All categories" : option)
                }
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid="jobs.clear_button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="ml-auto rounded-full border-border bg-card text-xs"
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Saved jobs summary */}
      <section data-ocid="jobs.saved_summary" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-subtle">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookmarkCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-base font-semibold text-foreground">
                Saved jobs
              </p>
              <p className="text-sm text-muted-foreground">
                {savedIds.length === 0
                  ? "No roles saved yet — bookmark a listing to keep it here."
                  : `${savedIds.length} role${savedIds.length === 1 ? "" : "s"} saved for later.`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            data-ocid="jobs.saved_view_button"
            aria-pressed={showSavedOnly}
            onClick={() => setShowSavedOnly((current) => !current)}
            className="rounded-full border-border bg-card"
          >
            {showSavedOnly ? "Show all jobs" : "View saved jobs"}
          </Button>
        </div>
      </section>

      {/* Listings */}
      <section data-ocid="jobs.listings" className="mt-10">
        <SectionHeading
          eyebrow={showSavedOnly ? "Saved" : "Openings"}
          title={showSavedOnly ? "Your saved jobs" : "Current openings"}
          description={
            showSavedOnly
              ? "Roles you have bookmarked during this session."
              : "Illustrative demo opportunities across the renewable sector."
          }
          action={
            <span className="font-mono text-xs text-muted-foreground">
              {filtered.length} of {JOBS.length} roles
            </span>
          }
        />

        <div className="mt-8">
          {filtered.length === 0 ? (
            <EmptyState
              title={
                showSavedOnly
                  ? "No saved jobs yet"
                  : "No jobs match your filters"
              }
              description={
                showSavedOnly
                  ? "Bookmark a listing with the save button and it will appear here."
                  : "Try a different search term, or clear the filters to see every opening."
              }
              action={
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="jobs.empty_clear_button"
                  onClick={clearFilters}
                  className="rounded-full border-border bg-card"
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  saved={savedIds.includes(job.id)}
                  onToggleSave={toggleSave}
                  onOpen={setActiveJob}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Demo notice */}
      <p className="mt-10 flex items-center gap-2 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
        Demo opportunities · {DEMO_SOURCE} · {DEMO_PERIOD}
      </p>

      <JobDetailDialog
        job={activeJob}
        saved={activeJob ? savedIds.includes(activeJob.id) : false}
        onToggleSave={toggleSave}
        onClose={() => setActiveJob(null)}
      />
    </PageFrame>
  );
}
