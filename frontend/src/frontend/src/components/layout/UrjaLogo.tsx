import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

export function UrjaLogo({
  className,
  wordmarkClassName,
}: {
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" role="img">
          <title>Urja</title>
          <circle cx="12" cy="12" r="4" className="fill-accent" />
          <g className="stroke-accent" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
          </g>
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-xl font-semibold tracking-tight text-foreground",
          wordmarkClassName,
        )}
      >
        Urja
      </span>
    </span>
  );
}

export function SearchTrigger({
  onOpen,
  className,
}: {
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-ocid="command_palette_open"
      onClick={onOpen}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Search className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
        Ctrl K
      </kbd>
    </button>
  );
}

export function NavLink({
  to,
  label,
  active,
  onClick,
}: {
  to: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      data-ocid={`nav.link.${label.toLowerCase().replace(/\s+/g, "-")}`}
      className={cn(
        "rounded-full px-3.5 py-2 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "bg-primary text-primary-foreground shadow-subtle"
          : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
      )}
    >
      {label}
    </Link>
  );
}
