import { SampleTag, SectionHeading, StatusBadge } from "@/components/shared";
import type { StatusTone } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DATASETS,
  DATASET_CATEGORIES,
  DATASET_UNITS,
  DATA_SOURCES,
  DATA_SOURCES_LAST_UPDATED,
  DATA_SOURCES_REPORTING_PERIOD,
  DEMO_DATA_LABEL,
  type Dataset,
  PIPELINE_STAGES,
  PIPELINE_STATE_LABEL,
  PROCESSING_LABEL,
  type PipelineStageState,
  type ProcessingStatus,
  VERIFICATION_LABEL,
  type VerificationStatus,
} from "@/data/dataSourcesData";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Database,
  FileSpreadsheet,
  Globe,
  RefreshCw,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Status tone maps — status colours carry meaning only                */
/* ------------------------------------------------------------------ */

const VERIFICATION_TONE: Record<VerificationStatus, StatusTone> = {
  verified: "success",
  pending: "warning",
  flagged: "danger",
};

const PROCESSING_TONE: Record<ProcessingStatus, StatusTone> = {
  processed: "success",
  processing: "primary",
  queued: "neutral",
  failed: "danger",
};

const PIPELINE_TONE: Record<PipelineStageState, StatusTone> = {
  completed: "success",
  pending: "neutral",
  failed: "danger",
  needs_review: "warning",
};

const PIPELINE_ICON: Record<PipelineStageState, typeof CheckCircle2> = {
  completed: CheckCircle2,
  pending: CircleDashed,
  failed: XCircle,
  needs_review: RefreshCw,
};

/* ------------------------------------------------------------------ */
/* Demo-data banner                                                    */
/* ------------------------------------------------------------------ */

function DemoDataBanner() {
  return (
    <div
      data-ocid="data_sources.demo_banner"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3"
    >
      <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-foreground">
        <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
        {DEMO_DATA_LABEL}
      </span>
      <span className="text-sm text-foreground">
        Illustrative prototype — no live ingestion, validation or persistence.
      </span>
      <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {DATA_SOURCES_REPORTING_PERIOD} · Last updated{" "}
        {DATA_SOURCES_LAST_UPDATED}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Source card                                                         */
/* ------------------------------------------------------------------ */

function SourceCard({
  source,
  index,
  selected,
  onSelect,
}: {
  source: (typeof DATA_SOURCES)[number];
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const datasetCount = DATASETS.filter(
    (dataset) => dataset.sourceId === source.id,
  ).length;
  return (
    <Card
      data-ocid={`data_sources.source_card.${index + 1}`}
      className={cn(
        "flex h-full flex-col rounded-[18px] border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated",
        selected ? "border-primary ring-1 ring-primary/30" : "border-border",
      )}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        data-ocid={`data_sources.source_card.${index + 1}.select_button`}
        className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="flex items-start justify-between gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-primary"
            style={{
              backgroundColor: `color-mix(in oklch, ${source.accent} 16%, transparent)`,
            }}
          >
            <Globe className="size-5" aria-hidden="true" />
          </span>
          <StatusBadge tone={selected ? "primary" : "neutral"}>
            {source.category}
          </StatusBadge>
        </span>
        <span className="mt-4 block font-display text-lg font-semibold text-foreground">
          {source.name}
        </span>
        <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
          {source.organisation}
        </span>
        <span className="mt-3 block flex-1 text-sm leading-relaxed text-muted-foreground">
          {source.description}
        </span>
      </button>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          data-ocid={`data_sources.source_card.${index + 1}.link`}
          className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px] text-primary transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="truncate">{source.url.replace("https://", "")}</span>
        </a>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {datasetCount} dataset{datasetCount === 1 ? "" : "s"}
        </span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Selected source detail panel                                        */
/* ------------------------------------------------------------------ */

function SourceDetail({
  source,
  onClear,
}: {
  source: (typeof DATA_SOURCES)[number];
  onClear: () => void;
}) {
  const datasets = DATASETS.filter((dataset) => dataset.sourceId === source.id);
  return (
    <Card
      data-ocid="data_sources.source_detail"
      className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-primary"
            style={{
              backgroundColor: `color-mix(in oklch, ${source.accent} 16%, transparent)`,
            }}
          >
            <Globe className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              Selected source
            </p>
            <h3 className="font-display text-xl font-semibold text-foreground">
              {source.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {source.organisation} · {source.category}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          data-ocid="data_sources.source_detail.close_button"
          onClick={onClear}
          className="rounded-full"
        >
          Clear selection
        </Button>
      </div>

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {source.description}
      </p>

      <div className="mt-6 space-y-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Datasets from this source
        </p>
        {datasets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No datasets registered for this source yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {datasets.map((dataset, index) => (
              <li
                key={dataset.id}
                data-ocid={`data_sources.source_detail.dataset.${index + 1}`}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {dataset.name}
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {dataset.reportingPeriod} · {dataset.unit}
                  </span>
                </span>
                <StatusBadge tone={VERIFICATION_TONE[dataset.verification]}>
                  {VERIFICATION_LABEL[dataset.verification]}
                </StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Pipeline visual                                                     */
/* ------------------------------------------------------------------ */

function PipelineVisual() {
  return (
    <div data-ocid="data_sources.pipeline" className="w-full">
      <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-0">
        {PIPELINE_STAGES.map((stage, index) => {
          const Icon = PIPELINE_ICON[stage.state];
          const isLast = index === PIPELINE_STAGES.length - 1;
          return (
            <li
              key={stage.id}
              data-ocid={`data_sources.pipeline.stage.${index + 1}`}
              className="flex flex-1 items-stretch gap-3 lg:flex-col lg:gap-0"
            >
              <div className="flex flex-1 flex-col rounded-2xl border border-border bg-card p-4 shadow-subtle">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <Icon
                    className={cn(
                      "size-4",
                      stage.state === "completed" && "text-success",
                      stage.state === "failed" && "text-destructive",
                      stage.state === "needs_review" && "text-warning",
                      stage.state === "pending" && "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-2 font-display text-base font-semibold text-foreground">
                  {stage.label}
                </h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {stage.description}
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  <StatusBadge tone={PIPELINE_TONE[stage.state]}>
                    {PIPELINE_STATE_LABEL[stage.state]}
                  </StatusBadge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {stage.detail}
                  </span>
                </div>
              </div>
              {!isLast && (
                <span
                  className="flex items-center justify-center text-muted-foreground lg:h-6 lg:w-full"
                  aria-hidden="true"
                >
                  <ArrowRight className="size-4 rotate-90 lg:rotate-0" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dataset provenance table                                            */
/* ------------------------------------------------------------------ */

function DatasetTable({ datasets }: { datasets: Dataset[] }) {
  return (
    <Card className="overflow-hidden rounded-[18px] border-border bg-card shadow-subtle">
      <Table data-ocid="data_sources.dataset_table">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-4">Dataset</TableHead>
            <TableHead className="px-4">Source</TableHead>
            <TableHead className="px-4">Category</TableHead>
            <TableHead className="px-4">Reporting period</TableHead>
            <TableHead className="px-4">Unit</TableHead>
            <TableHead className="px-4">Last updated</TableHead>
            <TableHead className="px-4">Collected</TableHead>
            <TableHead className="px-4">Verification</TableHead>
            <TableHead className="px-4">Processing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datasets.map((dataset, index) => (
            <TableRow
              key={dataset.id}
              data-ocid={`data_sources.dataset_row.${index + 1}`}
            >
              <TableCell className="px-4">
                <span className="block font-medium text-foreground">
                  {dataset.name}
                </span>
                <a
                  href={dataset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 block max-w-[16rem] truncate font-mono text-[10px] text-primary hover:underline"
                >
                  {dataset.url.replace("https://", "")}
                </a>
              </TableCell>
              <TableCell className="px-4 text-muted-foreground">
                {dataset.organisation}
              </TableCell>
              <TableCell className="px-4 text-muted-foreground">
                {dataset.category}
              </TableCell>
              <TableCell className="px-4 font-mono text-xs text-foreground">
                {dataset.reportingPeriod}
              </TableCell>
              <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                {dataset.unit}
              </TableCell>
              <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                {dataset.lastUpdated}
              </TableCell>
              <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                {dataset.collectedAt}
              </TableCell>
              <TableCell className="px-4">
                <StatusBadge tone={VERIFICATION_TONE[dataset.verification]}>
                  {VERIFICATION_LABEL[dataset.verification]}
                </StatusBadge>
              </TableCell>
              <TableCell className="px-4">
                <StatusBadge tone={PROCESSING_TONE[dataset.processing]}>
                  {PROCESSING_LABEL[dataset.processing]}
                </StatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Admin — add dataset metadata form                                   */
/* ------------------------------------------------------------------ */

function AddDatasetForm() {
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState(DATASET_CATEGORIES[0]);
  const [unit, setUnit] = useState(DATASET_UNITS[0]);
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim() !== "" && organisation.trim() !== "";

  return (
    <form
      data-ocid="data_sources.admin.add_form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        setSubmitted(true);
      }}
      className="grid gap-5 lg:grid-cols-2"
    >
      <div className="space-y-2">
        <label
          htmlFor="dataset-name"
          className="text-sm font-medium text-foreground"
        >
          Dataset name
        </label>
        <Input
          id="dataset-name"
          data-ocid="data_sources.admin.name_input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. State-wise Solar Generation"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="dataset-org"
          className="text-sm font-medium text-foreground"
        >
          Source organisation
        </label>
        <Input
          id="dataset-org"
          data-ocid="data_sources.admin.org_input"
          value={organisation}
          onChange={(event) => setOrganisation(event.target.value)}
          placeholder="e.g. Central Electricity Authority"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="dataset-url"
          className="text-sm font-medium text-foreground"
        >
          Source URL
        </label>
        <Input
          id="dataset-url"
          data-ocid="data_sources.admin.url_input"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="dataset-period"
          className="text-sm font-medium text-foreground"
        >
          Reporting period
        </label>
        <Input
          id="dataset-period"
          data-ocid="data_sources.admin.period_input"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          placeholder="e.g. Oct 2026"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="dataset-category"
          className="text-sm font-medium text-foreground"
        >
          Data category
        </label>
        <select
          id="dataset-category"
          data-ocid="data_sources.admin.category_select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {DATASET_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="dataset-unit"
          className="text-sm font-medium text-foreground"
        >
          Unit
        </label>
        <select
          id="dataset-unit"
          data-ocid="data_sources.admin.unit_select"
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {DATASET_UNITS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 lg:col-span-2">
        <label
          htmlFor="dataset-notes"
          className="text-sm font-medium text-foreground"
        >
          Provenance notes
        </label>
        <Textarea
          id="dataset-notes"
          data-ocid="data_sources.admin.notes_textarea"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Describe the collection method, licence and known caveats."
          className="rounded-xl"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <Button
          type="submit"
          data-ocid="data_sources.admin.submit_button"
          disabled={!canSubmit}
          className="rounded-full bg-primary text-primary-foreground hover:brightness-110"
        >
          Add dataset metadata
        </Button>
        <Button
          type="button"
          variant="outline"
          data-ocid="data_sources.admin.reset_button"
          onClick={() => {
            setName("");
            setOrganisation("");
            setUrl("");
            setPeriod("");
            setNotes("");
            setSubmitted(false);
          }}
          className="rounded-full"
        >
          Reset
        </Button>
        {submitted && (
          <span
            data-ocid="data_sources.admin.success_state"
            className="inline-flex items-center gap-2 text-sm text-success"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Metadata staged for review (demo only)
          </span>
        )}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Admin — CSV upload                                                  */
/* ------------------------------------------------------------------ */

function CsvUpload() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-5">
      <label
        htmlFor="csv-upload"
        data-ocid="data_sources.admin.dropzone"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) setFileName(file.name);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed px-6 py-12 text-center transition-smooth",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/40",
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Upload className="size-5" aria-hidden="true" />
        </span>
        <span className="font-display text-lg font-semibold text-foreground">
          Upload a dataset CSV
        </span>
        <span className="max-w-sm text-sm text-muted-foreground">
          Drag a file here or browse. Files are not parsed or stored in this
          prototype.
        </span>
        <input
          id="csv-upload"
          data-ocid="data_sources.admin.file_input"
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setFileName(file.name);
          }}
        />
      </label>

      {fileName && (
        <div
          data-ocid="data_sources.admin.upload_preview"
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle"
        >
          <FileSpreadsheet
            className="size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {fileName}
          </span>
          <StatusBadge tone="warning">Awaiting validation</StatusBadge>
          <Button
            type="button"
            variant="outline"
            data-ocid="data_sources.admin.clear_upload_button"
            onClick={() => setFileName(null)}
            className="rounded-full"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Admin — dataset status                                              */
/* ------------------------------------------------------------------ */

function DatasetStatus() {
  const processed = DATASETS.filter(
    (dataset) => dataset.processing === "processed",
  ).length;
  const percent = Math.round((processed / DATASETS.length) * 100);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
            <Database className="size-4 text-primary" aria-hidden="true" />
            Pipeline throughput
          </span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {processed}/{DATASETS.length} processed
          </span>
        </div>
        <Progress
          value={percent}
          data-ocid="data_sources.admin.throughput_progress"
          className="mt-4 h-2.5"
        />
      </div>

      <ul className="space-y-2.5">
        {DATASETS.map((dataset, index) => (
          <li
            key={dataset.id}
            data-ocid={`data_sources.admin.status_row.${index + 1}`}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {dataset.name}
              </span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                {dataset.records} · {dataset.reportingPeriod}
              </span>
            </span>
            <StatusBadge tone={VERIFICATION_TONE[dataset.verification]}>
              {VERIFICATION_LABEL[dataset.verification]}
            </StatusBadge>
            <StatusBadge tone={PROCESSING_TONE[dataset.processing]}>
              {PROCESSING_LABEL[dataset.processing]}
            </StatusBadge>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DataSourcesPage() {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const selectedSource =
    DATA_SOURCES.find((source) => source.id === selectedSourceId) ?? null;

  return (
    <div
      data-ocid="data_sources.page"
      className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10"
    >
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Platform"
          title="Data Sources & Provenance"
          description="Trace every figure back to its publisher, reporting period, verification state and processing stage."
          action={<SampleTag />}
        />
        <DemoDataBanner />
      </div>

      {/* Source cards */}
      <section className="mt-10 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Registered sources
            </h2>
            <p className="text-sm text-muted-foreground">
              Nine upstream publishers feeding the URJA platform.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Attribution on every dataset
          </span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_SOURCES.map((source, index) => (
            <SourceCard
              key={source.id}
              source={source}
              index={index}
              selected={source.id === selectedSourceId}
              onSelect={() =>
                setSelectedSourceId((current) =>
                  current === source.id ? null : source.id,
                )
              }
            />
          ))}
        </div>
        {selectedSource && (
          <SourceDetail
            source={selectedSource}
            onClear={() => setSelectedSourceId(null)}
          />
        )}
      </section>

      {/* Pipeline visual */}
      <section className="mt-12 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Data pipeline
            </h2>
            <p className="text-sm text-muted-foreground">
              From upstream source to dashboard tile, with stage-level status.
            </p>
          </div>
          <SampleTag />
        </div>
        <PipelineVisual />
      </section>

      {/* Dataset provenance table */}
      <section className="mt-12 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Dataset provenance
            </h2>
            <p className="text-sm text-muted-foreground">
              Full lineage for every dataset, including collection timestamps.
            </p>
          </div>
          <SampleTag />
        </div>
        <DatasetTable datasets={DATASETS} />
      </section>

      {/* Demo admin interface */}
      <section className="mt-12 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Admin console
            </h2>
            <p className="text-sm text-muted-foreground">
              Demo interface to view datasets, add metadata, upload a CSV and
              inspect status.
            </p>
          </div>
          <StatusBadge tone="primary">Demo only</StatusBadge>
        </div>

        <Tabs defaultValue="view" data-ocid="data_sources.admin.tabs">
          <TabsList className="h-auto flex-wrap rounded-full bg-muted p-1">
            <TabsTrigger
              value="view"
              data-ocid="data_sources.admin.view_tab"
              className="rounded-full px-4 py-2"
            >
              View datasets
            </TabsTrigger>
            <TabsTrigger
              value="add"
              data-ocid="data_sources.admin.add_tab"
              className="rounded-full px-4 py-2"
            >
              Add metadata
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              data-ocid="data_sources.admin.upload_tab"
              className="rounded-full px-4 py-2"
            >
              Upload CSV
            </TabsTrigger>
            <TabsTrigger
              value="status"
              data-ocid="data_sources.admin.status_tab"
              className="rounded-full px-4 py-2"
            >
              Dataset status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="mt-5">
            <DatasetTable datasets={DATASETS} />
          </TabsContent>

          <TabsContent value="add" className="mt-5">
            <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
              <AddDatasetForm />
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="mt-5">
            <Card className="rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
              <CsvUpload />
            </Card>
          </TabsContent>

          <TabsContent value="status" className="mt-5">
            <DatasetStatus />
          </TabsContent>
        </Tabs>
      </section>

      <p className="mt-10 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {DEMO_DATA_LABEL} · Illustrative prototype · Source attribution and
        reporting periods shown per dataset · {DATA_SOURCES_REPORTING_PERIOD}
      </p>
    </div>
  );
}
