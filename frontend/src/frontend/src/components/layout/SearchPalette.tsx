import { SEARCH_GROUPS } from "@/data/sampleData";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  FileText,
  LayoutGrid,
  Mic,
  Search,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const GROUP_ICONS = {
  "Public services": FileText,
  Offices: Building2,
  "Energy topics": Zap,
  "Platform pages": LayoutGrid,
} as const;

export function SearchPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      const id = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCH_GROUPS;
    return SEARCH_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  if (!open) return null;

  return (
    <dialog
      open
      data-ocid="command_palette"
      aria-label="Search Urja"
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-start justify-center border-0 bg-transparent px-4 pt-[12vh]"
    >
      <button
        type="button"
        aria-label="Close search"
        data-ocid="command_palette.close_button"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-2xl animate-fade-in-up overflow-hidden rounded-[20px] border border-border bg-card shadow-floating">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            data-ocid="command_palette.search_input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services, locations, energy information..."
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
            Esc
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto px-2 py-3">
          {groups.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches for “{query}”. Try a service, office or energy topic.
            </p>
          ) : (
            groups.map((group) => {
              const Icon =
                GROUP_ICONS[group.heading as keyof typeof GROUP_ICONS] ??
                FileText;
              return (
                <div key={group.heading} className="mb-2">
                  <p className="px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {group.heading}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      data-ocid={`command_palette.item.${item.id}`}
                      onClick={() => {
                        onOpenChange(false);
                        void navigate({ to: item.to });
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>
              select
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Mic className="size-3.5" aria-hidden="true" />
            Try “Talk to Urja” for voice
          </span>
        </div>
      </div>
    </dialog>
  );
}

export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen]);
}

export function SearchPaletteHint({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-mono text-[10px] text-muted-foreground", className)}
    >
      Ctrl K
    </span>
  );
}
