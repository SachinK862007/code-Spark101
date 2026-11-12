import {
  DashboardSection,
  KpiCardView,
  QuickActions,
  Sparkline,
  TrendChip,
} from "@/components/dashboard";
import { SampleTag, StatusBadge } from "@/components/shared";
import { Card } from "@/components/ui/card";
import {
  type KpiCard,
  LAST_UPDATED,
  type QuickAction,
  REPORTING_PERIOD,
  STAKEHOLDER_ROLES,
} from "@/data/greenGridData";
import { useStakeholderRole } from "@/hooks/useStakeholderRole";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BatteryCharging,
  Briefcase,
  Building2,
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  CloudSun,
  Compass,
  FileText,
  Gauge,
  HandCoins,
  Landmark,
  Leaf,
  LineChart,
  MapPin,
  PackageCheck,
  Recycle,
  RecycleIcon,
  Route,
  ScrollText,
  ShieldCheck,
  Sprout,
  Sun,
  TrendingUp,
  Truck,
  Wind,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Portal content model                                                */
/* ------------------------------------------------------------------ */

interface PortalShortcut {
  id: string;
  label: string;
  description: string;
  to: string;
  icon: keyof typeof SHORTCUT_ICONS;
}

interface PortalAction {
  id: string;
  label: string;
  description: string;
  icon: "rpo" | "solar" | "forecast" | "jobs" | "finance";
  to: string;
}

interface PortalHighlight {
  id: string;
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "flat";
  trendLabel: string;
  series: number[];
}

interface PortalDefinition {
  id: string;
  eyebrow: string;
  welcome: string;
  intro: string;
  source: string;
  kpis: KpiCard[];
  actions: PortalAction[];
  shortcuts: PortalShortcut[];
  highlights: PortalHighlight[];
  highlightTitle: string;
  highlightDescription: string;
}

const SHORTCUT_ICONS = {
  solar: Sun,
  map: MapPin,
  jobs: Briefcase,
  schemes: ScrollText,
  savings: Leaf,
  impact: Sprout,
  rpo: ShieldCheck,
  consumption: Gauge,
  procurement: Wind,
  history: CalendarClock,
  forecast: CloudSun,
  report: FileText,
  mix: LineChart,
  capacity: Building2,
  demand: TrendingUp,
  storage: BatteryCharging,
  environment: Leaf,
  applications: ClipboardCheck,
  projects: FileText,
  categories: Landmark,
  compare: CircleDollarSign,
  insights: Compass,
  status: PackageCheck,
  recyclers: Recycle,
  listings: Truck,
  opportunities: HandCoins,
  biogas: Zap,
  materials: RecycleIcon,
  traceability: Route,
} as const;

/* ------------------------------------------------------------------ */
/* Portal definitions — one per stakeholder role                       */
/* ------------------------------------------------------------------ */

const PORTALS: PortalDefinition[] = [
  {
    id: "citizen",
    eyebrow: "Consumer Portal",
    welcome: "Welcome back, Rooftop Owner",
    intro:
      "Your rooftop solar, nearby public renewable resources, green jobs, government schemes and the environmental impact of your choices — all in one place.",
    source: "MNRE · State DISCOM · PM Surya Ghar",
    kpis: [
      {
        id: "citizen-roi",
        label: "Rooftop Solar ROI",
        value: "18.4",
        unit: "%",
        trend: "up",
        trendLabel: "+1.2 pts YoY",
        source: "MNRE",
        series: [12, 13, 13, 14, 15, 15, 16, 16, 17, 17, 18, 18, 18],
      },
      {
        id: "citizen-savings",
        label: "Estimated Annual Savings",
        value: "₹42,600",
        unit: "",
        trend: "up",
        trendLabel: "+8.1% YoY",
        source: "DISCOM",
        series: [28, 30, 31, 33, 34, 36, 37, 38, 39, 40, 41, 42, 43],
      },
      {
        id: "citizen-jobs",
        label: "Green Jobs Nearby",
        value: "1,284",
        unit: "openings",
        trend: "up",
        trendLabel: "+6.4% QoQ",
        source: "MNRE",
        series: [
          900, 940, 980, 1010, 1050, 1090, 1120, 1160, 1190, 1220, 1250, 1270,
          1284,
        ],
      },
      {
        id: "citizen-impact",
        label: "CO₂ Avoided",
        value: "6.8",
        unit: "t / yr",
        trend: "up",
        trendLabel: "+0.4 t YoY",
        source: "CEA",
        series: [4, 4.4, 4.8, 5.1, 5.4, 5.7, 6, 6.2, 6.4, 6.5, 6.6, 6.7, 6.8],
      },
    ],
    actions: [
      {
        id: "solar",
        label: "Calculate solar ROI",
        description: "Rooftop payback and returns",
        icon: "solar",
        to: "/solar-roi",
      },
      {
        id: "jobs",
        label: "Find green jobs",
        description: "Renewable sector openings",
        icon: "jobs",
        to: "/green-jobs",
      },
      {
        id: "forecast",
        label: "Check your energy outlook",
        description: "Demand and generation trends",
        icon: "forecast",
        to: "/forecasting",
      },
    ],
    shortcuts: [
      {
        id: "solar",
        label: "Solar ROI calculator",
        description: "Model rooftop payback, subsidy and returns",
        to: "/solar-roi",
        icon: "solar",
      },
      {
        id: "map",
        label: "Nearby renewable resources",
        description: "Public solar parks and wind farms near you",
        to: "/map",
        icon: "map",
      },
      {
        id: "jobs",
        label: "Green jobs board",
        description: "Openings across the renewable value chain",
        to: "/green-jobs",
        icon: "jobs",
      },
      {
        id: "schemes",
        label: "Government schemes",
        description: "Subsidies and incentives you may be eligible for",
        to: "/services",
        icon: "schemes",
      },
      {
        id: "savings",
        label: "Energy-saving information",
        description: "Practical ways to cut your monthly bill",
        to: "/energy",
        icon: "savings",
      },
      {
        id: "impact",
        label: "Environmental impact",
        description: "See the emissions your choices avoid",
        to: "/environment",
        icon: "impact",
      },
    ],
    highlightTitle: "Your rooftop at a glance",
    highlightDescription:
      "Illustrative performance of a 5 kW residential rooftop system.",
    highlights: [
      {
        id: "generation",
        label: "Monthly generation",
        value: "612",
        unit: "kWh",
        trend: "up",
        trendLabel: "+4.2%",
        series: [480, 500, 520, 540, 560, 575, 590, 600, 605, 608, 610, 612],
      },
      {
        id: "payback",
        label: "Payback period",
        value: "5.4",
        unit: "years",
        trend: "down",
        trendLabel: "-0.3 yr",
        series: [7, 6.8, 6.5, 6.3, 6.1, 5.9, 5.8, 5.7, 5.6, 5.5, 5.5, 5.4],
      },
      {
        id: "subsidy",
        label: "Subsidy applied",
        value: "₹78,000",
        unit: "",
        trend: "flat",
        trendLabel: "PM Surya Ghar",
        series: [78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78],
      },
    ],
  },
  {
    id: "entity",
    eyebrow: "Compliance Portal",
    welcome: "Welcome back, Compliance Officer",
    intro:
      "Your renewable purchase obligation position, annual consumption, procurement mix, shortfall or surplus and compliance history — with forecasting and report export.",
    source: "MoP RPO Rules · CERC · State SERC",
    kpis: [
      {
        id: "entity-rpo",
        label: "RPO Compliance",
        value: "92.4",
        unit: "%",
        trend: "up",
        trendLabel: "+3.1 pts YoY",
        source: "MoP",
        series: [80, 82, 83, 85, 86, 87, 88, 89, 90, 91, 91, 92, 92],
      },
      {
        id: "entity-consumption",
        label: "Annual Consumption",
        value: "1,842",
        unit: "GWh",
        trend: "up",
        trendLabel: "+5.6% YoY",
        source: "CERC",
        series: [
          1500, 1540, 1580, 1620, 1660, 1700, 1730, 1760, 1790, 1810, 1825,
          1835, 1842,
        ],
      },
      {
        id: "entity-procurement",
        label: "Renewable Procurement",
        value: "1,702",
        unit: "GWh",
        trend: "up",
        trendLabel: "+9.2% YoY",
        source: "CERC",
        series: [
          1180, 1240, 1300, 1360, 1420, 1480, 1530, 1580, 1620, 1650, 1675,
          1690, 1702,
        ],
      },
      {
        id: "entity-gap",
        label: "Shortfall / Surplus",
        value: "+140",
        unit: "GWh",
        trend: "up",
        trendLabel: "Surplus",
        source: "MoP",
        series: [-40, -20, 0, 20, 40, 60, 80, 95, 110, 120, 130, 135, 140],
      },
    ],
    actions: [
      {
        id: "rpo",
        label: "Calculate RPO compliance",
        description: "Obligation vs. achievement",
        icon: "rpo",
        to: "/rpo",
      },
      {
        id: "forecast",
        label: "Forecast obligation",
        description: "Projected compliance trajectory",
        icon: "forecast",
        to: "/forecasting",
      },
      {
        id: "finance",
        label: "Compare green finance",
        description: "Fund the procurement gap",
        icon: "finance",
        to: "/green-finance",
      },
    ],
    shortcuts: [
      {
        id: "rpo",
        label: "RPO compliance summary",
        description: "Obligation, achievement and certificate position",
        to: "/rpo",
        icon: "rpo",
      },
      {
        id: "consumption",
        label: "Annual consumption",
        description: "Energy drawn across your obligated units",
        to: "/energy",
        icon: "consumption",
      },
      {
        id: "procurement",
        label: "Renewable procurement",
        description: "Solar, wind and hydro purchase mix",
        to: "/energy",
        icon: "procurement",
      },
      {
        id: "history",
        label: "Compliance history",
        description: "Year-on-year obligation performance",
        to: "/rpo",
        icon: "history",
      },
      {
        id: "forecast",
        label: "Compliance forecasting",
        description: "Projected shortfall or surplus",
        to: "/forecasting",
        icon: "forecast",
      },
      {
        id: "report",
        label: "Compliance report export",
        description: "Generate a filing-ready summary",
        to: "/rpo",
        icon: "report",
      },
    ],
    highlightTitle: "Obligation trajectory",
    highlightDescription:
      "Illustrative RPO target versus achievement for your portfolio.",
    highlights: [
      {
        id: "target",
        label: "FY 2030 target",
        value: "43.3",
        unit: "%",
        trend: "flat",
        trendLabel: "MoP trajectory",
        series: [24, 26, 28, 30, 32, 34, 36, 38, 40, 41, 42, 43, 43],
      },
      {
        id: "achieved",
        label: "Achieved to date",
        value: "40.1",
        unit: "%",
        trend: "up",
        trendLabel: "+3.1 pts",
        series: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 39, 40, 40],
      },
      {
        id: "certificates",
        label: "Certificates held",
        value: "2,140",
        unit: "RECs",
        trend: "up",
        trendLabel: "+180 QoQ",
        series: [
          1500, 1560, 1620, 1680, 1740, 1800, 1860, 1920, 1980, 2040, 2080,
          2110, 2140,
        ],
      },
    ],
  },
  {
    id: "policymaker",
    eyebrow: "National Dashboard",
    welcome: "Welcome back, Grid Planner",
    intro:
      "The national energy mix, state-wise renewable capacity, demand forecast, renewable generation trends, storage planning and environmental indicators across every regional grid.",
    source: "CEA · Grid-India · MNRE",
    kpis: [
      {
        id: "policy-mix",
        label: "Renewable Share",
        value: "34.8",
        unit: "%",
        trend: "up",
        trendLabel: "+4.6 pts YoY",
        source: "CEA",
        series: [22, 24, 25, 27, 28, 30, 31, 32, 33, 34, 34, 35, 35],
      },
      {
        id: "policy-capacity",
        label: "Renewable Capacity",
        value: "241.6",
        unit: "GW",
        trend: "up",
        trendLabel: "+12.4% YoY",
        source: "MNRE",
        series: [
          120, 132, 145, 158, 172, 186, 200, 214, 224, 232, 237, 240, 242,
        ],
      },
      {
        id: "policy-demand",
        label: "Peak Demand",
        value: "250.1",
        unit: "GW",
        trend: "up",
        trendLabel: "+7.8% YoY",
        source: "Grid-India",
        series: [
          180, 188, 196, 204, 212, 220, 228, 234, 240, 244, 247, 249, 250,
        ],
      },
      {
        id: "policy-storage",
        label: "Storage Pipeline",
        value: "18.6",
        unit: "GWh",
        trend: "up",
        trendLabel: "+2.4 GWh YoY",
        source: "CEA",
        series: [4, 5, 6, 7, 8, 9, 11, 12, 14, 15, 16, 17, 19],
      },
    ],
    actions: [
      {
        id: "forecast",
        label: "Explore demand forecast",
        description: "Regional demand and storage outlook",
        icon: "forecast",
        to: "/forecasting",
      },
      {
        id: "solar",
        label: "Model solar capacity",
        description: "Rooftop and utility-scale potential",
        icon: "solar",
        to: "/solar-roi",
      },
      {
        id: "rpo",
        label: "Review RPO trajectory",
        description: "National obligation outlook",
        icon: "rpo",
        to: "/rpo",
      },
    ],
    shortcuts: [
      {
        id: "mix",
        label: "National energy mix",
        description: "Generation by source across the country",
        to: "/energy",
        icon: "mix",
      },
      {
        id: "capacity",
        label: "State-wise renewable capacity",
        description: "Installed capacity ranked by state",
        to: "/map",
        icon: "capacity",
      },
      {
        id: "demand",
        label: "Demand forecast",
        description: "Projected peak and energy demand",
        to: "/forecasting",
        icon: "demand",
      },
      {
        id: "forecast",
        label: "Renewable generation trends",
        description: "Solar and wind output over time",
        to: "/energy",
        icon: "forecast",
      },
      {
        id: "storage",
        label: "Storage planning",
        description: "Battery and pumped-hydro pipeline",
        to: "/forecasting",
        icon: "storage",
      },
      {
        id: "environment",
        label: "Environmental indicators",
        description: "Emissions intensity and avoided CO₂",
        to: "/environment",
        icon: "environment",
      },
    ],
    highlightTitle: "Grid outlook",
    highlightDescription:
      "Illustrative national indicators for the current reporting period.",
    highlights: [
      {
        id: "coal",
        label: "Coal share",
        value: "58.8",
        unit: "%",
        trend: "down",
        trendLabel: "-3.4 pts",
        series: [72, 71, 70, 69, 67, 66, 65, 64, 63, 62, 61, 60, 59],
      },
      {
        id: "nonfossil",
        label: "Non-fossil capacity",
        value: "241.6",
        unit: "GW",
        trend: "up",
        trendLabel: "+12.4%",
        series: [
          120, 132, 145, 158, 172, 186, 200, 214, 224, 232, 237, 240, 242,
        ],
      },
      {
        id: "intensity",
        label: "Emissions intensity",
        value: "0.71",
        unit: "kg / kWh",
        trend: "down",
        trendLabel: "-0.04",
        series: [
          0.82, 0.81, 0.8, 0.79, 0.78, 0.77, 0.76, 0.75, 0.74, 0.73, 0.72, 0.72,
          0.71,
        ],
      },
    ],
  },
  {
    id: "finance",
    eyebrow: "Finance Portal",
    welcome: "Welcome back, Investment Analyst",
    intro:
      "Green finance applications, project profiles, financing categories, investment comparisons, renewable project insights and a project status overview.",
    source: "IREDA · SIDBI · NHB",
    kpis: [
      {
        id: "finance-apps",
        label: "Applications in Review",
        value: "148",
        unit: "files",
        trend: "up",
        trendLabel: "+12 this month",
        source: "IREDA",
        series: [90, 96, 102, 108, 114, 120, 126, 132, 138, 142, 145, 147, 148],
      },
      {
        id: "finance-sanctioned",
        label: "Value Sanctioned",
        value: "₹8,420",
        unit: "Cr",
        trend: "up",
        trendLabel: "+14.2% YoY",
        source: "SIDBI",
        series: [
          4200, 4600, 5000, 5400, 5800, 6200, 6600, 7000, 7300, 7600, 7900,
          8150, 8420,
        ],
      },
      {
        id: "finance-yield",
        label: "Avg. Project Yield",
        value: "11.6",
        unit: "%",
        trend: "up",
        trendLabel: "+0.4 pts YoY",
        source: "NHB",
        series: [
          9.8, 10, 10.2, 10.4, 10.6, 10.8, 11, 11.1, 11.2, 11.3, 11.4, 11.5,
          11.6,
        ],
      },
      {
        id: "finance-active",
        label: "Active Projects",
        value: "326",
        unit: "projects",
        trend: "up",
        trendLabel: "+28 QoQ",
        source: "IREDA",
        series: [
          210, 224, 238, 252, 266, 280, 292, 302, 310, 316, 320, 323, 326,
        ],
      },
    ],
    actions: [
      {
        id: "finance",
        label: "Compare green finance",
        description: "Instruments, returns and risk",
        icon: "finance",
        to: "/green-finance",
      },
      {
        id: "solar",
        label: "Model solar returns",
        description: "Rooftop and utility-scale ROI",
        icon: "solar",
        to: "/solar-roi",
      },
      {
        id: "forecast",
        label: "Review demand outlook",
        description: "Underwrite against grid forecasts",
        icon: "forecast",
        to: "/forecasting",
      },
    ],
    shortcuts: [
      {
        id: "applications",
        label: "Green finance applications",
        description: "Files awaiting appraisal and sanction",
        to: "/green-finance",
        icon: "applications",
      },
      {
        id: "projects",
        label: "Project profiles",
        description: "Capacity, sponsor and technology detail",
        to: "/green-finance",
        icon: "projects",
      },
      {
        id: "categories",
        label: "Financing categories",
        description: "Debt, equity, blended and guarantee",
        to: "/green-finance",
        icon: "categories",
      },
      {
        id: "compare",
        label: "Investment comparisons",
        description: "Side-by-side instrument returns",
        to: "/green-finance",
        icon: "compare",
      },
      {
        id: "insights",
        label: "Renewable project insights",
        description: "Sector trends and risk signals",
        to: "/energy",
        icon: "insights",
      },
      {
        id: "status",
        label: "Project status overview",
        description: "Pipeline stage across the portfolio",
        to: "/green-finance",
        icon: "status",
      },
    ],
    highlightTitle: "Portfolio snapshot",
    highlightDescription:
      "Illustrative financing indicators across the active portfolio.",
    highlights: [
      {
        id: "debt",
        label: "Debt share",
        value: "68",
        unit: "%",
        trend: "flat",
        trendLabel: "of portfolio",
        series: [62, 63, 64, 64, 65, 65, 66, 66, 67, 67, 68, 68, 68],
      },
      {
        id: "irr",
        label: "Blended IRR",
        value: "13.2",
        unit: "%",
        trend: "up",
        trendLabel: "+0.5 pts",
        series: [
          11.4, 11.6, 11.8, 12, 12.2, 12.4, 12.6, 12.8, 12.9, 13, 13.1, 13.1,
          13.2,
        ],
      },
      {
        id: "npas",
        label: "Stressed assets",
        value: "1.8",
        unit: "%",
        trend: "down",
        trendLabel: "-0.3 pts",
        series: [3.2, 3.1, 3, 2.8, 2.7, 2.5, 2.4, 2.3, 2.2, 2.1, 2, 1.9, 1.8],
      },
    ],
  },
  {
    id: "circular",
    eyebrow: "Circularity Portal",
    welcome: "Welcome back, Circular Economy Partner",
    intro:
      "The recycler directory, waste listings, available recycling opportunities, biogas facilities, material categories and demo traceability records across the value chain.",
    source: "CPCB · State Pollution Boards",
    kpis: [
      {
        id: "circular-recyclers",
        label: "Verified Recyclers",
        value: "412",
        unit: "partners",
        trend: "up",
        trendLabel: "+34 QoQ",
        source: "CPCB",
        series: [
          280, 296, 312, 328, 344, 358, 370, 382, 392, 400, 406, 410, 412,
        ],
      },
      {
        id: "circular-recovered",
        label: "Material Recovered",
        value: "86.4",
        unit: "kt",
        trend: "up",
        trendLabel: "+11.8% YoY",
        source: "CPCB",
        series: [48, 52, 56, 60, 64, 68, 72, 76, 79, 82, 84, 85, 86],
      },
      {
        id: "circular-listings",
        label: "Open Waste Listings",
        value: "1,096",
        unit: "lots",
        trend: "up",
        trendLabel: "+92 this month",
        source: "SPCB",
        series: [
          640, 690, 740, 790, 840, 890, 930, 970, 1010, 1040, 1065, 1082, 1096,
        ],
      },
      {
        id: "circular-biogas",
        label: "Biogas Facilities",
        value: "168",
        unit: "plants",
        trend: "up",
        trendLabel: "+14 YoY",
        source: "MNRE",
        series: [
          110, 118, 126, 134, 142, 148, 154, 158, 162, 164, 166, 167, 168,
        ],
      },
    ],
    actions: [
      {
        id: "finance",
        label: "Explore circular finance",
        description: "Fund recovery infrastructure",
        icon: "finance",
        to: "/green-finance",
      },
      {
        id: "jobs",
        label: "Find circular economy jobs",
        description: "Recovery and recycling roles",
        icon: "jobs",
        to: "/green-jobs",
      },
      {
        id: "forecast",
        label: "Review material outlook",
        description: "Projected recovery volumes",
        icon: "forecast",
        to: "/forecasting",
      },
    ],
    shortcuts: [
      {
        id: "recyclers",
        label: "Recycler directory",
        description: "Verified partners by material and region",
        to: "/circularity",
        icon: "recyclers",
      },
      {
        id: "listings",
        label: "Waste listings",
        description: "Open lots available for recovery",
        to: "/circularity",
        icon: "listings",
      },
      {
        id: "opportunities",
        label: "Recycling opportunities",
        description: "Matched demand for recovered material",
        to: "/circularity",
        icon: "opportunities",
      },
      {
        id: "biogas",
        label: "Biogas facilities",
        description: "Operational plants and capacity",
        to: "/circularity",
        icon: "biogas",
      },
      {
        id: "materials",
        label: "Material categories",
        description: "Panels, blades, batteries and metals",
        to: "/circularity",
        icon: "materials",
      },
      {
        id: "traceability",
        label: "Demo traceability records",
        description: "Illustrative chain-of-custody entries",
        to: "/circularity",
        icon: "traceability",
      },
    ],
    highlightTitle: "Recovery snapshot",
    highlightDescription:
      "Illustrative recovery indicators across material categories.",
    highlights: [
      {
        id: "panels",
        label: "Panel recovery",
        value: "42.1",
        unit: "kt",
        trend: "up",
        trendLabel: "+9.4%",
        series: [22, 24, 26, 28, 30, 32, 34, 36, 38, 39, 40, 41, 42],
      },
      {
        id: "batteries",
        label: "Battery recovery",
        value: "18.6",
        unit: "kt",
        trend: "up",
        trendLabel: "+12.1%",
        series: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 17, 18, 19],
      },
      {
        id: "diversion",
        label: "Landfill diversion",
        value: "74.3",
        unit: "%",
        trend: "up",
        trendLabel: "+3.2 pts",
        series: [58, 60, 62, 64, 66, 68, 69, 70, 71, 72, 73, 73, 74],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Role switcher                                                       */
/* ------------------------------------------------------------------ */

function RoleSwitcher() {
  const { role, setRoleId } = useStakeholderRole();
  return (
    <div
      data-ocid="portal.role_switcher"
      className="flex flex-wrap gap-2"
      aria-label="Stakeholder role"
    >
      {STAKEHOLDER_ROLES.map((candidate) => {
        const active = candidate.id === role.id;
        return (
          <button
            key={candidate.id}
            type="button"
            data-ocid={`portal.role_tab.${candidate.id}`}
            aria-pressed={active}
            onClick={() => setRoleId(candidate.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-subtle"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {candidate.short}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Module shortcut card                                                */
/* ------------------------------------------------------------------ */

function ShortcutCard({
  shortcut,
  index,
}: {
  shortcut: PortalShortcut;
  index: number;
}) {
  const Icon = SHORTCUT_ICONS[shortcut.icon];
  return (
    <Link
      to={shortcut.to}
      data-ocid={`portal.shortcut.${index + 1}`}
      className="group flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">
          {shortcut.label}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {shortcut.description}
        </span>
      </span>
      <ArrowRight
        className="mt-1 size-4 shrink-0 text-muted-foreground transition-smooth group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Highlight card                                                      */
/* ------------------------------------------------------------------ */

function HighlightCard({
  highlight,
  index,
}: {
  highlight: PortalHighlight;
  index: number;
}) {
  return (
    <Card
      data-ocid={`portal.highlight.${index + 1}`}
      className="rounded-[18px] border-border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {highlight.label}
        </p>
        <SampleTag />
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-foreground">
        {highlight.value}
        {highlight.unit && (
          <span className="ml-1.5 text-sm font-normal text-muted-foreground">
            {highlight.unit}
          </span>
        )}
      </p>
      <div className="mt-2">
        <TrendChip trend={highlight.trend} label={highlight.trendLabel} />
      </div>
      <div className="mt-3">
        <Sparkline series={highlight.series} />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Portal body                                                         */
/* ------------------------------------------------------------------ */

function PortalBody({ portal }: { portal: PortalDefinition }) {
  const actions: QuickAction[] = portal.actions.map((action) => ({
    id: action.id,
    label: action.label,
    description: action.description,
    to: action.to,
    icon: action.icon,
  }));

  return (
    <div data-ocid={`portal.body.${portal.id}`} className="space-y-10">
      {/* Welcome */}
      <div className="flex flex-col gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {portal.eyebrow}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {portal.welcome}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {portal.intro}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SampleTag />
          <StatusBadge tone="neutral">{REPORTING_PERIOD}</StatusBadge>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Source: {portal.source}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {portal.kpis.map((kpi, index) => (
          <KpiCardView key={kpi.id} kpi={kpi} index={index} />
        ))}
      </div>

      {/* Quick actions */}
      <DashboardSection
        title="Quick actions"
        description="The tools this role reaches for most often."
        action={<SampleTag />}
      >
        <QuickActions actions={actions} />
      </DashboardSection>

      {/* Module shortcuts */}
      <DashboardSection
        title="Module shortcuts"
        description="Every module available to this portal."
        action={<SampleTag />}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {portal.shortcuts.map((shortcut, index) => (
            <ShortcutCard key={shortcut.id} shortcut={shortcut} index={index} />
          ))}
        </div>
      </DashboardSection>

      {/* Highlights */}
      <DashboardSection
        title={portal.highlightTitle}
        description={portal.highlightDescription}
        action={<SampleTag />}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portal.highlights.map((highlight, index) => (
            <HighlightCard
              key={highlight.id}
              highlight={highlight}
              index={index}
            />
          ))}
        </div>
      </DashboardSection>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function StakeholderPortalPage() {
  const { role } = useStakeholderRole();
  const portal =
    PORTALS.find((candidate) => candidate.id === role.id) ?? PORTALS[0];

  return (
    <div
      data-ocid="portal.page"
      className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10"
    >
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Platform · D9
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Stakeholder Portals
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Each role opens its own portal with tailored KPIs, quick actions
              and module shortcuts. Switch roles to see how the platform adapts.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Active role
            </span>
            <StatusBadge tone="primary">{role.label}</StatusBadge>
          </div>
        </div>

        <RoleSwitcher />
      </div>

      {/* Portal body */}
      <div className="mt-10">
        <PortalBody portal={portal} />
      </div>

      <p className="mt-10 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Illustrative prototype · All figures are demo data · {REPORTING_PERIOD}{" "}
        · Last updated {LAST_UPDATED}
      </p>
    </div>
  );
}
