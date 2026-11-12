import {
  SearchPalette,
  useSearchShortcut,
} from "@/components/layout/SearchPalette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DASHBOARD_NAV, STAKEHOLDER_ROLES } from "@/data/greenGridData";
import { useStakeholderRole } from "@/hooks/useStakeholderRole";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* Resolve the current page title + breadcrumb from the route          */
/* ------------------------------------------------------------------ */

function usePageMeta() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  return useMemo(() => {
    for (const group of DASHBOARD_NAV) {
      for (const item of group.items) {
        if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
          return { group: group.heading, title: item.label };
        }
      }
    }
    return { group: "Overview", title: "Dashboard" };
  }, [pathname]);
}

/* ------------------------------------------------------------------ */
/* Role selector (top bar variant)                                     */
/* ------------------------------------------------------------------ */

function TopBarRoleSelector() {
  const { role, setRoleId } = useStakeholderRole();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-ocid="topbar.role_selector"
          className="hidden items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Role
          </span>
          <span className="max-w-32 truncate">{role.short}</span>
          <ChevronDown
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Stakeholder role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STAKEHOLDER_ROLES.map((candidate) => (
          <DropdownMenuItem
            key={candidate.id}
            data-ocid={`topbar.role_option.${candidate.id}`}
            onSelect={() => setRoleId(candidate.id)}
            className={cn(
              "cursor-pointer",
              candidate.id === role.id && "font-medium text-primary",
            )}
          >
            {candidate.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Top bar                                                             */
/* ------------------------------------------------------------------ */

export function TopBar({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { group, title } = usePageMeta();
  const [searchOpen, setSearchOpen] = useState(false);
  useSearchShortcut(() => setSearchOpen(true));

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            data-ocid="topbar.menu_button"
            aria-label="Open navigation"
            onClick={onOpenDrawer}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="hidden sm:block">
              <ol className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <li>{group}</li>
                <li aria-hidden="true">/</li>
                <li className="text-foreground">{title}</li>
              </ol>
            </nav>
            <h1 className="truncate font-display text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          </div>

          <button
            type="button"
            data-ocid="topbar.search_button"
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground transition-smooth hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">Search platform, policy…</span>
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] lg:inline-block">
              Ctrl K
            </kbd>
          </button>

          <TopBarRoleSelector />

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-ocid="topbar.notifications_button"
              aria-label="Notifications"
              className="relative flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Bell className="size-4.5" aria-hidden="true" />
              <span
                className="absolute right-2.5 top-2.5 size-2 rounded-full bg-accent"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              data-ocid="topbar.help_button"
              aria-label="Help"
              className="hidden size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex"
            >
              <HelpCircle className="size-4.5" aria-hidden="true" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  data-ocid="topbar.profile_button"
                  aria-label="Profile menu"
                  className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-smooth hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <UserRound className="size-4.5" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block text-sm font-medium text-foreground">
                    Demo Analyst
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Illustrative profile
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/settings" data-ocid="topbar.profile.settings_link">
                    <Settings className="size-4" aria-hidden="true" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    to="/stakeholders"
                    data-ocid="topbar.profile.portal_link"
                  >
                    <UserRound className="size-4" aria-hidden="true" />
                    Stakeholder portal
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-ocid="topbar.profile.signout_button"
                  className="cursor-pointer text-muted-foreground"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
