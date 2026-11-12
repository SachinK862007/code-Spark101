import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PRIMARY_NAV } from "@/data/sampleData";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Mic } from "lucide-react";
import { useState } from "react";
import { SearchPalette, useSearchShortcut } from "./SearchPalette";
import { NavLink, SearchTrigger, UrjaLogo } from "./UrjaLogo";

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useSearchShortcut(() => setSearchOpen(true));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link
            to="/"
            data-ocid="nav.logo_link"
            className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <UrjaLogo />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                label={item.label}
                active={isActive(pathname, item.to)}
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <SearchTrigger onOpen={() => setSearchOpen(true)} />
            <Link
              to="/voice"
              data-ocid="nav.talk_to_urja_button"
              className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-subtle transition-smooth hover:shadow-elevated hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
            >
              <Mic className="size-4" aria-hidden="true" />
              Talk to Urja
            </Link>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  data-ocid="nav.menu_button"
                  aria-label="Open navigation menu"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                data-ocid="nav.sheet"
                className="w-full border-l border-border bg-background sm:max-w-sm"
              >
                <SheetHeader className="text-left">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <UrjaLogo />
                </SheetHeader>
                <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                  {PRIMARY_NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      data-ocid={`nav.mobile_link.${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={cn(
                        "rounded-2xl px-4 py-3.5 font-display text-2xl font-semibold tracking-tight transition-smooth",
                        isActive(pathname, item.to)
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-secondary",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-8 space-y-3 border-t border-border pt-6">
                  <button
                    type="button"
                    data-ocid="nav.mobile_search_button"
                    onClick={() => {
                      setMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-smooth hover:border-primary/40"
                  >
                    Search
                  </button>
                  <Link
                    to="/voice"
                    onClick={() => setMenuOpen(false)}
                    data-ocid="nav.mobile_talk_button"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-smooth hover:brightness-110"
                  >
                    <Mic className="size-4" aria-hidden="true" />
                    Talk to Urja
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
