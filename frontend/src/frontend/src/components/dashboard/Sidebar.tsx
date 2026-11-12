import { UrjaLogo } from "@/components/layout/UrjaLogo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DASHBOARD_NAV,
  STAKEHOLDER_ROLES,
  type StakeholderRole,
} from "@/data/greenGridData";
import { useStakeholderRole } from "@/hooks/useStakeholderRole";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

function isActive(pathname: string, to: string) {
  if (to === "/dashboard") return pathname === "/dashboard";
  return pathname === to || pathname.startsWith(`${to}/`);
}

/* ------------------------------------------------------------------ */
/* Role selector — sets the active stakeholder role                    */
/* ------------------------------------------------------------------ */

function RoleSelector({ className }: { className?: string }) {
  const { role, setRoleId } = useStakeholderRole();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        data-ocid="sidebar.role_selector"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-left transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="min-w-0">
          <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Stakeholder
          </span>
          <span className="block truncate text-sm font-medium text-foreground">
            {role.short}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          data-ocid="sidebar.role_menu"
          className="absolute left-0 right-0 top-full z-30 mt-2 animate-fade-in overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-floating"
        >
          {STAKEHOLDER_ROLES.map((candidate: StakeholderRole) => (
            <li key={candidate.id}>
              <button
                type="button"
                data-ocid={`sidebar.role_option.${candidate.id}`}
                aria-current={candidate.id === role.id}
                onClick={() => {
                  setRoleId(candidate.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  candidate.id === role.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground",
                )}
              >
                {candidate.short}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation list                                                     */
/* ------------------------------------------------------------------ */

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-6">
      {DASHBOARD_NAV.map((group) => (
        <div key={group.heading}>
          <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {group.heading}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    data-ocid={`sidebar.nav.${item.label
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-full px-3.5 py-2 text-sm transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      active
                        ? "bg-primary text-primary-foreground shadow-subtle"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.code && (
                      <span
                        className={cn(
                          "shrink-0 font-mono text-[9px] font-semibold uppercase tracking-[0.1em]",
                          active
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground/70",
                        )}
                      >
                        {item.code}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop sidebar                                                     */
/* ------------------------------------------------------------------ */

export function Sidebar() {
  return (
    <aside
      data-ocid="sidebar"
      className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex"
    >
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link
          to="/"
          data-ocid="sidebar.logo_link"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <UrjaLogo />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <SidebarNav />
      </div>
      <div className="border-t border-border p-3">
        <RoleSelector />
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile drawer                                                       */
/* ------------------------------------------------------------------ */

export function SidebarDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        data-ocid="sidebar.drawer"
        className="w-full border-r border-border bg-sidebar p-0 sm:max-w-xs"
      >
        <SheetHeader className="flex h-16 flex-row items-center justify-between border-b border-border px-5 text-left">
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <UrjaLogo />
          <button
            type="button"
            data-ocid="sidebar.drawer.close_button"
            aria-label="Close navigation"
            onClick={() => onOpenChange(false)}
            className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <SidebarNav onNavigate={() => onOpenChange(false)} />
        </div>
        <div className="border-t border-border p-3">
          <RoleSelector />
        </div>
      </SheetContent>
    </Sheet>
  );
}
