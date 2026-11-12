import {
  PageFrame,
  SampleTag,
  SectionHeading,
  SourceBadge,
  StatusBadge,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Building2,
  ExternalLink,
  FileText,
  Landmark,
  Percent,
  RotateCcw,
  Scale,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Illustrative sample data — static, never fetched or computed        */
/* ------------------------------------------------------------------ */

type FundingType =
  | "Green Loan"
  | "Green Bond"
  | "Subsidy"
  | "Blended Finance"
  | "Project Finance";

interface FinanceProduct {
  id: string;
  name: string;
  institution: string;
  category: string;
  fundingType: FundingType;
  interestRate: number | null;
  interestLabel: string;
  amountMin: number;
  amountMax: number;
  amountLabel: string;
  repayment: string;
  eligibility: string;
  documents: string[];
  source: string;
  sourceUrl: string;
  matchScore: number;
  matchLabel: string;
  matchTone: "success" | "warning" | "neutral";
  scheme: string;
  reportingPeriod: string;
}

const FINANCE_PRODUCTS: FinanceProduct[] = [
  {
    id: "nsm-cfa",
    name: "National Solar Mission — Central Financial Assistance",
    institution: "Ministry of New and Renewable Energy (MNRE)",
    category: "Government Subsidies",
    fundingType: "Subsidy",
    interestRate: null,
    interestLabel: "Concessional / not applicable",
    amountMin: 5000000,
    amountMax: 250000000,
    amountLabel: "₹50 L – ₹25 Cr",
    repayment: "Not repayable (capital subsidy)",
    eligibility:
      "Grid-connected solar projects registered under NSM Phase-II; domestic content requirement applies to modules.",
    documents: [
      "Detailed project report",
      "Land ownership or lease deed",
      "Grid connectivity approval",
      "Company registration certificate",
    ],
    source: "MNRE",
    sourceUrl: "https://mnre.gov.in/",
    matchScore: 92,
    matchLabel: "Strong match",
    matchTone: "success",
    scheme: "National Solar Mission",
    reportingPeriod: "FY 2024-25",
  },
  {
    id: "ireda-term-loan",
    name: "IREDA Renewable Energy Term Loan",
    institution: "Indian Renewable Energy Development Agency (IREDA)",
    category: "Renewable Energy Financing",
    fundingType: "Green Loan",
    interestRate: 9.15,
    interestLabel: "9.15% p.a. (floating)",
    amountMin: 10000000,
    amountMax: 5000000000,
    amountLabel: "₹1 Cr – ₹500 Cr",
    repayment: "Up to 15 years with 6–12 month moratorium",
    eligibility:
      "Solar, wind, small hydro and bio-energy projects with a bankable DPR and promoter equity of at least 20%.",
    documents: [
      "Detailed project report",
      "Audited financials (3 years)",
      "Promoter net-worth statement",
      "Power purchase agreement",
      "Environmental clearance",
    ],
    source: "IREDA",
    sourceUrl: "https://www.ireda.in/",
    matchScore: 88,
    matchLabel: "Strong match",
    matchTone: "success",
    scheme: "IREDA Products",
    reportingPeriod: "Q2 FY 2024-25",
  },
  {
    id: "sbi-surya",
    name: "SBI Surya Ghar Rooftop Solar Loan",
    institution: "State Bank of India",
    category: "Green Loans",
    fundingType: "Green Loan",
    interestRate: 8.75,
    interestLabel: "8.75% p.a. (linked to repo)",
    amountMin: 100000,
    amountMax: 10000000,
    amountLabel: "₹1 L – ₹1 Cr",
    repayment: "Up to 10 years, no collateral up to ₹10 L",
    eligibility:
      "Residential and MSME rooftop solar installations under PM Surya Ghar; applicant must be the property owner.",
    documents: [
      "KYC and address proof",
      "Electricity bill",
      "Rooftop feasibility certificate",
      "Vendor quotation",
    ],
    source: "SBI",
    sourceUrl: "https://sbi.co.in/",
    matchScore: 81,
    matchLabel: "Good match",
    matchTone: "success",
    scheme: "PM Surya Ghar",
    reportingPeriod: "Oct 2026",
  },
  {
    id: "sebi-green-bond",
    name: "SEBI-Aligned Corporate Green Bond Issue",
    institution: "SEBI-registered issuers / merchant banks",
    category: "Green Bonds",
    fundingType: "Green Bond",
    interestRate: 7.85,
    interestLabel: "7.85% p.a. (indicative coupon)",
    amountMin: 250000000,
    amountMax: 20000000000,
    amountLabel: "₹25 Cr – ₹2,000 Cr",
    repayment: "5–10 year tenure, bullet or amortising",
    eligibility:
      "Listed or to-be-listed entities with a certified green use-of-proceeds framework and third-party review.",
    documents: [
      "Green bond framework",
      "Credit rating rationale",
      "Board resolution",
      "Use-of-proceeds certification",
    ],
    source: "SEBI",
    sourceUrl: "https://www.sebi.gov.in/",
    matchScore: 74,
    matchLabel: "Possible match",
    matchTone: "warning",
    scheme: "Green Bonds",
    reportingPeriod: "H1 FY 2024-25",
  },
  {
    id: "napcc-mission",
    name: "NAPCC National Mission on Strategic Knowledge for Climate Change",
    institution: "Department of Science & Technology",
    category: "Government Subsidies",
    fundingType: "Subsidy",
    interestRate: null,
    interestLabel: "Grant / not applicable",
    amountMin: 2000000,
    amountMax: 100000000,
    amountLabel: "₹20 L – ₹10 Cr",
    repayment: "Not repayable (grant-in-aid)",
    eligibility:
      "Research institutions, universities and consortia working on climate-resilient renewable deployment.",
    documents: [
      "Research proposal",
      "Institutional endorsement letter",
      "Budget and utilisation plan",
    ],
    source: "DST / NAPCC",
    sourceUrl: "https://dst.gov.in/",
    matchScore: 63,
    matchLabel: "Possible match",
    matchTone: "warning",
    scheme: "NAPCC Initiatives",
    reportingPeriod: "FY 2024-25",
  },
  {
    id: "nabard-msme",
    name: "NABARD MSME Green Finance Refinance",
    institution: "NABARD",
    category: "MSME Green Finance",
    fundingType: "Blended Finance",
    interestRate: 9.5,
    interestLabel: "9.50% p.a. (refinance window)",
    amountMin: 500000,
    amountMax: 50000000,
    amountLabel: "₹5 L – ₹5 Cr",
    repayment: "Up to 7 years with quarterly instalments",
    eligibility:
      "MSME units in renewable manufacturing, energy efficiency and clean-tech services with Udyam registration.",
    documents: [
      "Udyam registration",
      "GST returns",
      "Project cost estimate",
      "Bank statements (12 months)",
    ],
    source: "NABARD",
    sourceUrl: "https://www.nabard.org/",
    matchScore: 79,
    matchLabel: "Good match",
    matchTone: "success",
    scheme: "MSME Green Finance",
    reportingPeriod: "Q2 FY 2024-25",
  },
  {
    id: "solar-project-finance",
    name: "Utility-Scale Solar Project Finance Facility",
    institution: "Power Finance Corporation (PFC)",
    category: "Solar Project Finance",
    fundingType: "Project Finance",
    interestRate: 9.05,
    interestLabel: "9.05% p.a. (non-recourse)",
    amountMin: 500000000,
    amountMax: 50000000000,
    amountLabel: "₹50 Cr – ₹5,000 Cr",
    repayment: "Up to 18 years, debt-service coverage linked",
    eligibility:
      "Utility-scale solar parks and hybrid projects with a signed PPA and secured land and evacuation.",
    documents: [
      "Detailed project report",
      "Power purchase agreement",
      "Land and evacuation approvals",
      "Financial model and DSCR",
    ],
    source: "PFC",
    sourceUrl: "https://www.pfcindia.com/",
    matchScore: 85,
    matchLabel: "Strong match",
    matchTone: "success",
    scheme: "Solar Project Finance",
    reportingPeriod: "Q2 FY 2024-25",
  },
  {
    id: "green-bond-msme",
    name: "MSME Green Bond Aggregation Platform",
    institution: "SIDBI",
    category: "Green Bonds",
    fundingType: "Green Bond",
    interestRate: 8.25,
    interestLabel: "8.25% p.a. (pooled issuance)",
    amountMin: 10000000,
    amountMax: 500000000,
    amountLabel: "₹1 Cr – ₹50 Cr",
    repayment: "3–7 year tenure, amortising",
    eligibility:
      "Clusters of MSME clean-energy suppliers aggregated under a single certified green issuance.",
    documents: [
      "Cluster participation agreement",
      "Green certification",
      "Audited financials",
      "Use-of-proceeds plan",
    ],
    source: "SIDBI",
    sourceUrl: "https://www.sidbi.in/",
    matchScore: 70,
    matchLabel: "Possible match",
    matchTone: "warning",
    scheme: "Green Bonds",
    reportingPeriod: "H1 FY 2024-25",
  },
];

const CATEGORY_OPTIONS = [
  "All categories",
  "Green Loans",
  "Green Bonds",
  "Government Subsidies",
  "Renewable Energy Financing",
  "Solar Project Finance",
  "MSME Green Finance",
];

const PROJECT_TYPE_OPTIONS = [
  "Rooftop solar",
  "Utility-scale solar",
  "Wind",
  "Hybrid renewable",
  "Energy efficiency",
  "Clean-tech manufacturing",
];

const APPLICANT_TYPE_OPTIONS = [
  "Individual / household",
  "MSME",
  "Private company",
  "Public sector undertaking",
  "Cooperative / society",
  "Research institution",
];

const APPLICANT_CATEGORY_OPTIONS = [
  "General",
  "MSME (Udyam registered)",
  "Startup (DPIIT recognised)",
  "Women-led enterprise",
  "SC / ST entrepreneur",
];

const SORT_OPTIONS = [
  { id: "match", label: "Best match" },
  { id: "rate", label: "Interest rate (low to high)" },
  { id: "amount", label: "Funding amount (high to low)" },
];

const STATE_OPTIONS = [
  "All India",
  "Rajasthan",
  "Gujarat",
  "Tamil Nadu",
  "Karnataka",
  "Maharashtra",
  "Andhra Pradesh",
  "Uttar Pradesh",
];

interface ProfileForm {
  projectType: string;
  applicantType: string;
  state: string;
  projectCost: string;
  requiredFunding: string;
  capacity: string;
  loanDuration: string;
  applicantCategory: string;
}

const DEFAULT_PROFILE: ProfileForm = {
  projectType: PROJECT_TYPE_OPTIONS[0],
  applicantType: APPLICANT_TYPE_OPTIONS[1],
  state: STATE_OPTIONS[0],
  projectCost: "12,00,00,000",
  requiredFunding: "8,00,00,000",
  capacity: "5",
  loanDuration: "10",
  applicantCategory: APPLICANT_CATEGORY_OPTIONS[1],
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatInr(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

/* ------------------------------------------------------------------ */
/* Profile form field                                                  */
/* ------------------------------------------------------------------ */

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

function ProductCard({
  product,
  index,
  selected,
  saved,
  onToggleCompare,
  onToggleSave,
  onViewDetail,
}: {
  product: FinanceProduct;
  index: number;
  selected: boolean;
  saved: boolean;
  onToggleCompare: () => void;
  onToggleSave: () => void;
  onViewDetail: () => void;
}) {
  return (
    <Card
      data-ocid={`finance.product_card.${index + 1}`}
      className={cn(
        "flex h-full flex-col rounded-[18px] border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated",
        selected ? "border-primary ring-1 ring-primary/30" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            {product.category}
          </p>
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
            {product.name}
          </h3>
        </div>
        <StatusBadge tone={product.matchTone}>
          {product.matchScore}% · {product.matchLabel}
        </StatusBadge>
      </div>

      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">{product.institution}</span>
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Funding type
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {product.fundingType}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Interest rate
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {product.interestLabel}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Amount range
          </dt>
          <dd className="mt-0.5 font-mono font-medium text-foreground">
            {product.amountLabel}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Repayment
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {product.repayment}
          </dd>
        </div>
      </dl>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {product.eligibility}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SourceBadge>{product.source}</SourceBadge>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {product.reportingPeriod}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant={selected ? "default" : "outline"}
          size="sm"
          data-ocid={`finance.product_card.${index + 1}.compare_button`}
          onClick={onToggleCompare}
          className="rounded-full"
        >
          <Scale className="size-4" aria-hidden="true" />
          {selected ? "In comparison" : "Compare"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-ocid={`finance.product_card.${index + 1}.save_button`}
          onClick={onToggleSave}
          aria-pressed={saved}
          className="rounded-full"
        >
          {saved ? (
            <BookmarkCheck className="size-4 text-primary" aria-hidden="true" />
          ) : (
            <Bookmark className="size-4" aria-hidden="true" />
          )}
          {saved ? "Saved" : "Save"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-ocid={`finance.product_card.${index + 1}.detail_button`}
          onClick={onViewDetail}
          className="ml-auto rounded-full text-primary hover:text-primary"
        >
          Eligibility
          <ExternalLink className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function GreenFinancePage() {
  const [profile, setProfile] = useState<ProfileForm>(DEFAULT_PROFILE);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [sort, setSort] = useState(SORT_OPTIONS[0].id);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  const updateProfile = <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => setProfile((current) => ({ ...current, [key]: value }));

  const visibleProducts = useMemo(() => {
    const filtered =
      category === CATEGORY_OPTIONS[0]
        ? FINANCE_PRODUCTS
        : FINANCE_PRODUCTS.filter((product) => product.category === category);

    const sorted = [...filtered];
    if (sort === "rate") {
      sorted.sort(
        (a, b) =>
          (a.interestRate ?? Number.POSITIVE_INFINITY) -
          (b.interestRate ?? Number.POSITIVE_INFINITY),
      );
    } else if (sort === "amount") {
      sorted.sort((a, b) => b.amountMax - a.amountMax);
    } else {
      sorted.sort((a, b) => b.matchScore - a.matchScore);
    }
    return sorted;
  }, [category, sort]);

  const compareProducts = useMemo(
    () =>
      compareIds
        .map((id) => FINANCE_PRODUCTS.find((product) => product.id === id))
        .filter((product): product is FinanceProduct => Boolean(product)),
    [compareIds],
  );

  const detailProduct = detailId
    ? (FINANCE_PRODUCTS.find((product) => product.id === detailId) ?? null)
    : null;

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const toggleSave = (id: string) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    setCategory(CATEGORY_OPTIONS[0]);
    setSort(SORT_OPTIONS[0].id);
    setCompareIds([]);
  };

  return (
    <PageFrame>
      {/* Editorial header */}
      <header className="border-b border-border pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Opportunities &amp; Resources · D5
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Green finance, matched to your project.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Describe your project once and compare green loans, bonds,
              subsidies and project-finance products side by side.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <SampleTag />
              <StatusBadge tone="neutral">Demo data</StatusBadge>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Source: MNRE, IREDA, SEBI, NABARD, PFC, SIDBI
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">
              Reporting period · FY 2024-25
            </span>
          </div>
        </div>
      </header>

      {/* Project profile form */}
      <section className="mt-10" aria-labelledby="finance-profile">
        <SectionHeading
          eyebrow="Step 1"
          title="Project profile"
          description="All fields are illustrative. Adjust them to see how the matching options respond."
          action={<SampleTag />}
        />
        <Card className="mt-6 rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="finance-project-type" label="Project type">
              <Select
                value={profile.projectType}
                onValueChange={(value) => updateProfile("projectType", value)}
              >
                <SelectTrigger
                  aria-label="Project type"
                  data-ocid="finance.project_type_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="finance-applicant-type" label="Applicant type">
              <Select
                value={profile.applicantType}
                onValueChange={(value) => updateProfile("applicantType", value)}
              >
                <SelectTrigger
                  aria-label="Applicant type"
                  data-ocid="finance.applicant_type_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICANT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="finance-state" label="State">
              <Select
                value={profile.state}
                onValueChange={(value) => updateProfile("state", value)}
              >
                <SelectTrigger
                  aria-label="State"
                  data-ocid="finance.state_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="finance-applicant-category" label="Applicant category">
              <Select
                value={profile.applicantCategory}
                onValueChange={(value) =>
                  updateProfile("applicantCategory", value)
                }
              >
                <SelectTrigger
                  aria-label="Applicant category"
                  data-ocid="finance.applicant_category_select"
                  className="w-full rounded-lg border-input bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICANT_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              id="finance-project-cost"
              label="Estimated project cost (₹)"
              hint="Total capital cost in rupees"
            >
              <Input
                id="finance-project-cost"
                data-ocid="finance.project_cost_input"
                inputMode="numeric"
                value={profile.projectCost}
                onChange={(event) =>
                  updateProfile("projectCost", event.target.value)
                }
                className="rounded-lg border-input bg-background"
              />
            </Field>

            <Field
              id="finance-required-funding"
              label="Required funding (₹)"
              hint="Amount you intend to raise"
            >
              <Input
                id="finance-required-funding"
                data-ocid="finance.required_funding_input"
                inputMode="numeric"
                value={profile.requiredFunding}
                onChange={(event) =>
                  updateProfile("requiredFunding", event.target.value)
                }
                className="rounded-lg border-input bg-background"
              />
            </Field>

            <Field
              id="finance-capacity"
              label="Project capacity (MW)"
              hint="Installed or planned capacity"
            >
              <Input
                id="finance-capacity"
                data-ocid="finance.capacity_input"
                inputMode="decimal"
                value={profile.capacity}
                onChange={(event) =>
                  updateProfile("capacity", event.target.value)
                }
                className="rounded-lg border-input bg-background"
              />
            </Field>

            <Field
              id="finance-loan-duration"
              label="Loan duration (years)"
              hint="Preferred repayment horizon"
            >
              <Input
                id="finance-loan-duration"
                data-ocid="finance.loan_duration_input"
                inputMode="numeric"
                value={profile.loanDuration}
                onChange={(event) =>
                  updateProfile("loanDuration", event.target.value)
                }
                className="rounded-lg border-input bg-background"
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button
              type="button"
              data-ocid="finance.match_button"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Find matching options
            </Button>
            <Button
              type="button"
              variant="outline"
              data-ocid="finance.reset_button"
              onClick={resetProfile}
              className="rounded-full"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset profile
            </Button>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Demo data · no live matching
            </span>
          </div>
        </Card>
      </section>

      {/* Matching options */}
      <section className="mt-12" aria-labelledby="finance-options">
        <SectionHeading
          eyebrow="Step 2"
          title="Matching options"
          description="Compare up to three products. Sort by interest rate or funding amount, and save the ones worth revisiting."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Category
                </span>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    aria-label="Scheme category"
                    data-ocid="finance.category_select"
                    className="w-52 rounded-lg border-input bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Sort
                </span>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger
                    aria-label="Sort options"
                    data-ocid="finance.sort_select"
                    className="w-56 rounded-lg border-input bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Scale className="size-3.5" aria-hidden="true" />
            {compareIds.length} of 3 selected
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <Bookmark className="size-3.5" aria-hidden="true" />
            {savedIds.length} saved
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {visibleProducts.length} products · demo data
          </span>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              selected={compareIds.includes(product.id)}
              saved={savedIds.includes(product.id)}
              onToggleCompare={() => toggleCompare(product.id)}
              onToggleSave={() => toggleSave(product.id)}
              onViewDetail={() => setDetailId(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="mt-12" aria-labelledby="finance-compare">
        <SectionHeading
          eyebrow="Step 3"
          title="Side-by-side comparison"
          description="Select up to three products above to compare funding type, rate, amount, repayment and eligibility."
          action={<SampleTag />}
        />

        {compareProducts.length === 0 ? (
          <div
            data-ocid="finance.compare_empty_state"
            className="mt-6 flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-border bg-muted/30 px-6 py-14 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Scale className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-display text-lg font-semibold text-foreground">
              No products selected
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Choose up to three products from the matching options to build a
              comparison table.
            </p>
          </div>
        ) : (
          <Card className="mt-6 overflow-hidden rounded-[18px] border-border bg-card p-0 shadow-subtle">
            <div className="overflow-x-auto">
              <table
                data-ocid="finance.compare_table"
                className="w-full min-w-[720px] border-collapse text-sm"
              >
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Attribute
                    </th>
                    {compareProducts.map((product) => (
                      <th
                        key={product.id}
                        className="px-5 py-4 align-top font-display text-sm font-semibold text-foreground"
                      >
                        {product.name}
                        <span className="mt-1 block font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-muted-foreground">
                          {product.institution}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      {
                        label: "Funding type",
                        render: (p: FinanceProduct) => p.fundingType,
                      },
                      {
                        label: "Interest rate",
                        render: (p: FinanceProduct) => p.interestLabel,
                      },
                      {
                        label: "Amount range",
                        render: (p: FinanceProduct) => p.amountLabel,
                      },
                      {
                        label: "Repayment period",
                        render: (p: FinanceProduct) => p.repayment,
                      },
                      {
                        label: "Eligibility",
                        render: (p: FinanceProduct) => p.eligibility,
                      },
                      {
                        label: "Required documents",
                        render: (p: FinanceProduct) =>
                          `${p.documents.length} documents`,
                      },
                      {
                        label: "Match indicator",
                        render: (p: FinanceProduct) =>
                          `${p.matchScore}% · ${p.matchLabel}`,
                      },
                      {
                        label: "Official source",
                        render: (p: FinanceProduct) => p.source,
                      },
                    ] as {
                      label: string;
                      render: (product: FinanceProduct) => string;
                    }[]
                  ).map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-border/60 last:border-0"
                    >
                      <th
                        scope="row"
                        className="px-5 py-4 text-left align-top font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {row.label}
                      </th>
                      {compareProducts.map((product) => (
                        <td
                          key={product.id}
                          className="px-5 py-4 align-top text-foreground"
                        >
                          {row.render(product)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th
                      scope="row"
                      className="px-5 py-4 text-left align-top font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      Actions
                    </th>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="px-5 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            data-ocid={`finance.compare_table.detail_button.${product.id}`}
                            onClick={() => setDetailId(product.id)}
                            className="rounded-full"
                          >
                            <FileText className="size-4" aria-hidden="true" />
                            Details
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            data-ocid={`finance.compare_table.remove_button.${product.id}`}
                            onClick={() => toggleCompare(product.id)}
                            className="rounded-full"
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* Saved options */}
      <section className="mt-12" aria-labelledby="finance-saved">
        <SectionHeading
          eyebrow="Saved"
          title="Saved options"
          description="Products you bookmarked for later review in this session."
          action={<SampleTag />}
        />
        {savedIds.length === 0 ? (
          <div
            data-ocid="finance.saved_empty_state"
            className="mt-6 flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-border bg-muted/30 px-6 py-12 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Bookmark className="size-5" aria-hidden="true" />
            </span>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Nothing saved yet
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Use the Save action on any product card to keep it here for quick
              reference.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedIds.map((id, index) => {
              const product = FINANCE_PRODUCTS.find((item) => item.id === id);
              if (!product) return null;
              return (
                <li
                  key={id}
                  data-ocid={`finance.saved_item.${index + 1}`}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-subtle"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Landmark className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.institution}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {product.amountLabel} · {product.interestLabel}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${product.name} from saved`}
                    data-ocid={`finance.saved_item.${index + 1}.remove_button`}
                    onClick={() => toggleSave(id)}
                    className="rounded-full"
                  >
                    <BookmarkCheck
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Scheme categories reference */}
      <section className="mt-12" aria-labelledby="finance-schemes">
        <SectionHeading
          eyebrow="Reference"
          title="Example scheme categories"
          description="Illustrative categories drawn from national programmes and institutional products."
          action={<SampleTag />}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              id: "nsm",
              title: "National Solar Mission",
              body: "Central financial assistance and grid-connected solar targets under NSM Phase-II.",
              source: "MNRE",
            },
            {
              id: "napcc",
              title: "NAPCC initiatives",
              body: "National Action Plan on Climate Change missions spanning solar, efficiency and knowledge.",
              source: "MoEFCC / DST",
            },
            {
              id: "re-finance",
              title: "Renewable energy financing",
              body: "Term lending and refinance windows for solar, wind, hydro and bio-energy projects.",
              source: "IREDA / NABARD",
            },
            {
              id: "green-bonds",
              title: "Green bonds",
              body: "SEBI-aligned corporate and pooled issuances with certified use-of-proceeds frameworks.",
              source: "SEBI / SIDBI",
            },
            {
              id: "ireda",
              title: "IREDA products",
              body: "Dedicated renewable lending products with concessional rates and long tenures.",
              source: "IREDA",
            },
            {
              id: "msme",
              title: "MSME green finance",
              body: "Blended and refinance facilities for clean-tech manufacturing and efficiency upgrades.",
              source: "NABARD / SIDBI",
            },
          ].map((scheme, index) => (
            <Card
              key={scheme.id}
              data-ocid={`finance.scheme_card.${index + 1}`}
              className="rounded-[18px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
                <BadgeCheck className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {scheme.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {scheme.body}
              </p>
              <div className="mt-4">
                <SourceBadge>{scheme.source}</SourceBadge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Provenance footer */}
      <p className="mt-12 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        Demo data · Illustrative prototype · All products, rates and figures are
        sample data · Reporting period FY 2024-25
      </p>

      {/* Detail dialog */}
      <Dialog
        open={detailProduct !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <DialogContent
          data-ocid="finance.detail_dialog"
          className="max-h-[85vh] overflow-y-auto rounded-[18px] sm:max-w-2xl"
        >
          {detailProduct && (
            <>
              <DialogHeader>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {detailProduct.category} · {detailProduct.scheme}
                </p>
                <DialogTitle className="font-display text-2xl">
                  {detailProduct.name}
                </DialogTitle>
                <DialogDescription>
                  {detailProduct.institution}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={detailProduct.matchTone}>
                  {detailProduct.matchScore}% · {detailProduct.matchLabel}
                </StatusBadge>
                <SourceBadge>{detailProduct.source}</SourceBadge>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {detailProduct.reportingPeriod}
                </span>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <Percent className="size-3.5" aria-hidden="true" />
                    Interest rate
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {detailProduct.interestLabel}
                  </dd>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <Wallet className="size-3.5" aria-hidden="true" />
                    Amount range
                  </dt>
                  <dd className="mt-1 font-mono font-medium text-foreground">
                    {detailProduct.amountLabel}
                  </dd>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <ArrowUpDown className="size-3.5" aria-hidden="true" />
                    Repayment period
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {detailProduct.repayment}
                  </dd>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <Landmark className="size-3.5" aria-hidden="true" />
                    Funding type
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {detailProduct.fundingType}
                  </dd>
                </div>
              </dl>

              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Eligibility
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {detailProduct.eligibility}
                </p>
              </div>

              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Required documents
                </h3>
                <ul className="mt-2 space-y-2">
                  {detailProduct.documents.map((document) => (
                    <li
                      key={document}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <FileText
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {document}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="finance.detail_dialog.save_button"
                  onClick={() => toggleSave(detailProduct.id)}
                  className="rounded-full"
                >
                  {savedIds.includes(detailProduct.id) ? (
                    <BookmarkCheck
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <Bookmark className="size-4" aria-hidden="true" />
                  )}
                  {savedIds.includes(detailProduct.id)
                    ? "Saved"
                    : "Save option"}
                </Button>
                <a
                  href={detailProduct.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-ocid="finance.detail_dialog.source_link"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Official source
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Demo data · {formatInr(detailProduct.amountMin)} –{" "}
                  {formatInr(detailProduct.amountMax)}
                </span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
}
