import { FOOTER_COLUMNS } from "@/data/sampleData";
import { Link } from "@tanstack/react-router";
import { UrjaLogo } from "./UrjaLogo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm space-y-4">
            <UrjaLogo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              A unified Indian public information, public services and energy
              intelligence platform.
            </p>
            <p className="font-display text-lg font-semibold text-foreground">
              Energy. Services. Answers.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      data-ocid={`footer.link.${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-foreground/80 transition-smooth hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono">
            © {year} Urja · Illustrative prototype · All figures are sample data
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noreferrer"
            className="transition-smooth hover:text-primary"
          >
            Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
