import { SampleTag, StatusBadge } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { STAKEHOLDER_ROLES } from "@/data/greenGridData";
import { useStakeholderRole } from "@/hooks/useStakeholderRole";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useState } from "react";

interface DisplayPreference {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const DISPLAY_PREFERENCES: DisplayPreference[] = [
  {
    id: "sample-labels",
    label: "Show sample-data labels",
    description:
      "Display the sample-data tag beside every metric, chart and response.",
    defaultOn: true,
  },
  {
    id: "source-attribution",
    label: "Show source attribution",
    description:
      "Display the reporting source and period under each data panel.",
    defaultOn: true,
  },
  {
    id: "compact-density",
    label: "Compact data density",
    description: "Reduce card padding to fit more metrics on screen.",
    defaultOn: false,
  },
  {
    id: "reduced-motion",
    label: "Reduce motion",
    description: "Minimise entrance and hover animation across the platform.",
    defaultOn: false,
  },
];

export default function SettingsPage() {
  const { role, setRoleId } = useStakeholderRole();
  const [preferences, setPreferences] = useState<Record<string, boolean>>(
    Object.fromEntries(
      DISPLAY_PREFERENCES.map((preference) => [
        preference.id,
        preference.defaultOn,
      ]),
    ),
  );

  const toggle = (id: string) =>
    setPreferences((previous) => ({ ...previous, [id]: !previous[id] }));

  return (
    <div
      data-ocid="settings.page"
      className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-10"
    >
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Platform
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Settings
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Display preferences and the active stakeholder role for this
          prototype.
        </p>
      </div>

      {/* Sample-data notice */}
      <div
        data-ocid="settings.sample_notice"
        className="mt-8 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3.5"
      >
        <Info
          className="mt-0.5 size-4.5 shrink-0 text-accent-foreground"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            This is a design prototype
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every figure, chart and response across URJA is illustrative sample
            data. Nothing is fetched, computed or persisted between sessions.
          </p>
        </div>
      </div>

      {/* Display preferences */}
      <Card className="mt-6 rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Display preferences
            </h2>
            <p className="text-sm text-muted-foreground">
              Control how data is presented across the dashboard.
            </p>
          </div>
          <SampleTag />
        </div>

        <ul className="mt-6 divide-y divide-border">
          {DISPLAY_PREFERENCES.map((preference) => (
            <li
              key={preference.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 space-y-0.5">
                <label
                  htmlFor={`settings.${preference.id}`}
                  className="block text-sm font-medium text-foreground"
                >
                  {preference.label}
                </label>
                <p className="text-sm text-muted-foreground">
                  {preference.description}
                </p>
              </div>
              <Switch
                id={`settings.${preference.id}`}
                data-ocid={`settings.toggle.${preference.id}`}
                checked={preferences[preference.id]}
                onCheckedChange={() => toggle(preference.id)}
                aria-label={preference.label}
              />
            </li>
          ))}
        </ul>
      </Card>

      {/* Stakeholder role */}
      <Card className="mt-6 rounded-[18px] border-border bg-card p-6 shadow-subtle md:p-8">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Stakeholder role
            </h2>
            <p className="text-sm text-muted-foreground">
              The active role shapes which portal and modules are highlighted.
            </p>
          </div>
          <StatusBadge tone="primary">{role.short}</StatusBadge>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {STAKEHOLDER_ROLES.map((candidate) => {
            const active = candidate.id === role.id;
            return (
              <button
                key={candidate.id}
                type="button"
                data-ocid={`settings.role_option.${candidate.id}`}
                aria-pressed={active}
                onClick={() => setRoleId(candidate.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span className="block text-sm font-medium text-foreground">
                  {candidate.label}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {candidate.portal}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
