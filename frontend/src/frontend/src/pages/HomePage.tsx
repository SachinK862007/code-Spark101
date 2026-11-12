import { StakeholderCard } from "@/components/dashboard";
import { SampleTag, SectionHeading, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STAKEHOLDER_ROLES } from "@/data/greenGridData";
import { useStakeholderRole } from "@/hooks/useStakeholderRole";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  Compass,
  Gauge,
  LineChart,
  Mic,
  Network,
  Radio,
  ShieldCheck,
  Sparkles,
  Sun,
  Wind,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/* Hero suggestion chips — the six required prompts                    */
/* ------------------------------------------------------------------ */

const HERO_PROMPTS = [
  "Find a nearby public service office",
  "What government schemes can I access?",
  "Show Karnataka's renewable energy outlook",
  "What is the energy demand forecast?",
  "Find an electricity complaint helpline",
  "Explain rooftop solar benefits",
];

/* ------------------------------------------------------------------ */
/* Section C — four platform overview panels                           */
/* ------------------------------------------------------------------ */

const OVERVIEW_PANELS = [
  {
    id: "directory",
    icon: Building2,
    title: "Public Service Directory",
    description:
      "Browse verified central and state services with office locations, eligibility and official links.",
    value: "1,240",
    unit: "services indexed",
    tone: "primary" as const,
  },
  {
    id: "market",
    icon: LineChart,
    title: "Energy Market Insights",
    description:
      "Track demand, generation mix and market clearing prices across every regional grid.",
    value: "198,420",
    unit: "MW live demand",
    tone: "success" as const,
  },
  {
    id: "renewable",
    icon: Sun,
    title: "Renewable Energy Intelligence",
    description:
      "Understand solar and wind contribution, capacity growth and state-level renewable outlooks.",
    value: "34.8",
    unit: "% renewable share",
    tone: "warning" as const,
  },
  {
    id: "voice",
    icon: Mic,
    title: "Voice-Based Assistance",
    description:
      "Ask questions in natural language and receive sourced answers across services and energy data.",
    value: "12",
    unit: "languages planned",
    tone: "neutral" as const,
  },
];

/* ------------------------------------------------------------------ */
/* Section D — three "what Urja offers" cards                          */
/* ------------------------------------------------------------------ */

const OFFER_CARDS = [
  {
    id: "traceable",
    icon: ShieldCheck,
    title: "Information you can trace",
    description:
      "Every answer carries its source, an official link and a last-updated timestamp, so you always know where a figure came from.",
    points: [
      "Source labels on every response",
      "Direct links to official portals",
      "Clear verification indicators",
    ],
  },
  {
    id: "natural",
    icon: Sparkles,
    title: "Communication that feels natural",
    description:
      "Ask in plain language by text or voice. Urja understands intent and replies in a form that is easy to read and act on.",
    points: [
      "Voice and text interaction",
      "Multilingual interface concept",
      "Conversational, sourced answers",
    ],
  },
  {
    id: "energy",
    icon: Gauge,
    title: "Energy intelligence for everyone",
    description:
      "From demand forecasting to renewable analysis, complex grid data is presented clearly for citizens, analysts and developers.",
    points: [
      "Demand and generation trends",
      "Renewable energy analysis",
      "API access for developers",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Section B — connected-India visual data                             */
/* ------------------------------------------------------------------ */

const NETWORK_NODES = [
  { id: "n1", x: 50, y: 12, label: "Delhi" },
  { id: "n2", x: 22, y: 34, label: "Rajasthan" },
  { id: "n3", x: 78, y: 30, label: "Kolkata" },
  { id: "n4", x: 30, y: 62, label: "Gujarat" },
  { id: "n5", x: 62, y: 70, label: "Karnataka" },
  { id: "n6", x: 48, y: 46, label: "Central Grid" },
];

const ORBIT_CARDS = [
  {
    id: "o1",
    icon: Radio,
    label: "Grid frequency",
    value: "49.98 Hz",
    position: "left-0 top-6",
  },
  {
    id: "o2",
    icon: Sun,
    label: "Solar parks",
    value: "84 active",
    position: "right-0 top-16",
  },
  {
    id: "o3",
    icon: Wind,
    label: "Wind capacity",
    value: "46.6 GW",
    position: "left-4 bottom-10",
  },
  {
    id: "o4",
    icon: Building2,
    label: "Service offices",
    value: "312 mapped",
    position: "right-2 bottom-4",
  },
];

/* ------------------------------------------------------------------ */
/* Reveal wrapper — scroll-based entrance, honours reduced motion      */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero ask input                                                      */
/* ------------------------------------------------------------------ */

function AskInput() {
  const [value, setValue] = useState("");
  const expanded = value.length > 60;

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="w-full max-w-2xl"
    >
      <div
        className={cn(
          "group relative flex items-end gap-2 rounded-[22px] border border-white/15 bg-white/10 p-2 backdrop-blur-md transition-smooth focus-within:border-primary/60 focus-within:bg-white/15 focus-within:shadow-[0_0_0_4px_oklch(0.52_0.19_292_/_0.25)]",
          expanded ? "min-h-[7.5rem]" : "min-h-[4.25rem]",
        )}
      >
        <label htmlFor="ask-urja" className="sr-only">
          Ask Urja anything
        </label>
        <textarea
          id="ask-urja"
          data-ocid="home.ask_input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={expanded ? 3 : 1}
          placeholder="Ask Urja anything..."
          className="max-h-40 min-h-[2.75rem] flex-1 resize-none bg-transparent px-3 py-3 text-base text-white placeholder:text-white/60 focus:outline-none"
        />
        <div className="flex items-center gap-1.5 pb-0.5">
          <button
            type="button"
            data-ocid="home.mic_button"
            aria-label="Ask by voice"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-smooth hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Mic className="size-5" aria-hidden="true" />
          </button>
          <button
            type="submit"
            data-ocid="home.send_button"
            aria-label="Send question"
            className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-subtle transition-smooth hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <ArrowUp className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Section B — connected-India visual                                  */
/* ------------------------------------------------------------------ */

function ConnectedIndia() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-xl">
      {/* Central sphere */}
      <div className="absolute inset-[18%] rounded-full bg-gradient-primary shadow-floating">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,oklch(0.7_0.16_292_/_0.55),transparent_60%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <Network className="mx-auto size-8" aria-hidden="true" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">
              National Grid
            </p>
          </div>
        </div>
      </div>

      {/* Orbit rings */}
      <div className="absolute inset-[8%] rounded-full border border-primary/20" />
      <div className="absolute inset-[2%] rounded-full border border-dashed border-primary/15" />

      {/* Network nodes + connecting lines */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <title>Connected energy network across India</title>
        {NETWORK_NODES.map((node, index) => {
          const next = NETWORK_NODES[(index + 1) % NETWORK_NODES.length];
          return (
            <line
              key={`line-${node.id}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              className="stroke-primary/30"
              strokeWidth="0.4"
              strokeDasharray="1.5 1.5"
            />
          );
        })}
      </svg>

      {NETWORK_NODES.map((node, index) => (
        <motion.span
          key={node.id}
          className="absolute flex items-center gap-1.5"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
        >
          <span className="size-2.5 rounded-full bg-accent shadow-[0_0_0_4px_oklch(0.78_0.14_72_/_0.2)]" />
          <span className="whitespace-nowrap rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground shadow-subtle">
            {node.label}
          </span>
        </motion.span>
      ))}

      {/* Orbiting data cards */}
      {ORBIT_CARDS.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            className={cn("absolute w-36", card.position)}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <Card className="rounded-2xl border-border bg-card/95 p-3 shadow-elevated backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  {card.label}
                </p>
              </div>
              <p className="mt-2 font-mono text-sm font-semibold text-foreground">
                {card.value}
              </p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stakeholder landing — headline + five role cards                    */
/* ------------------------------------------------------------------ */

function StakeholderLanding() {
  const { setRoleId } = useStakeholderRole();
  const navigate = useNavigate();

  const handleSelect = (id: string) => {
    setRoleId(id);
    const role = STAKEHOLDER_ROLES.find((candidate) => candidate.id === id);
    void navigate({ to: role?.to ?? "/dashboard" });
  };

  return (
    <section
      data-ocid="home.stakeholder_section"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Choose your path"
            title="Powering India's transition to a greener future"
            description="One platform for renewable energy intelligence, compliance, investment, and sustainable opportunities. Pick the role that fits you to open its portal."
            action={<SampleTag />}
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {STAKEHOLDER_ROLES.map((role, index) => (
            <Reveal key={role.id} delay={index * 0.06}>
              <StakeholderCard
                role={role}
                index={index}
                onSelect={handleSelect}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div data-ocid="home.page" className="flex flex-col">
      {/* ---------------- Hero ---------------- */}
      <section
        data-ocid="home.hero_section"
        className="relative isolate overflow-hidden bg-[oklch(0.16_0.03_292)]"
      >
        <img
          src="/assets/generated/hero-india-energy.dim_1920x1080.png"
          alt="Aerial night view of India's energy infrastructure with glowing city lights, transmission networks, solar arrays and wind turbines"
          className="absolute inset-0 size-full object-cover opacity-70"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.14_0.03_292_/_0.95)] via-[oklch(0.16_0.03_292_/_0.7)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.03_292_/_0.9)] via-transparent to-[oklch(0.14_0.03_292_/_0.5)]" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col justify-center px-4 py-20 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
              <span
                className="size-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />
              Energy · Services · Answers
            </span>

            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl">
              Namaskara, India
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl">
              Find public services, explore energy insights, and get useful
              information in one place.
            </p>

            <div className="mt-9">
              <AskInput />
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {HERO_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  data-ocid={`home.suggestion.${prompt
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                    .slice(0, 32)}`}
                  className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/85 backdrop-blur transition-smooth hover:border-white/35 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- Stakeholder landing ---------------- */}
      <StakeholderLanding />

      {/* ---------------- Section A — platform intro ---------------- */}
      <section
        data-ocid="home.intro_section"
        className="border-b border-border bg-background"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <Reveal className="max-w-4xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              One platform
            </p>
            <p className="mt-5 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl">
              From <span className="text-primary">public services</span> to{" "}
              <span className="text-success">energy markets</span>, make complex
              information{" "}
              <span className="text-accent-foreground underline decoration-accent decoration-2 underline-offset-4">
                easier to understand
              </span>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Section B — connected India ---------------- */}
      <section
        data-ocid="home.connected_section"
        className="border-b border-border bg-gradient-subtle"
      >
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Connected India"
              title="One network, every region"
              description="Public services, grid operations and renewable assets are woven into a single connected view — so a question about one place can draw on the whole country."
            />
            <div className="mt-8 flex flex-wrap gap-2">
              <StatusBadge tone="success">Grid stable</StatusBadge>
              <StatusBadge tone="primary">312 offices mapped</StatusBadge>
              <StatusBadge tone="warning">84 solar parks</StatusBadge>
            </div>
            <div className="mt-8">
              <SampleTag />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ConnectedIndia />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Section C — platform overview ---------------- */}
      <section
        data-ocid="home.overview_section"
        className="border-b border-border bg-background"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Platform overview"
              title="Four pillars, one experience"
              description="Everything Urja does is built on four capabilities that work together."
              action={<SampleTag />}
            />
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {OVERVIEW_PANELS.map((panel, index) => {
              const Icon = panel.icon;
              return (
                <Reveal key={panel.id} delay={index * 0.08}>
                  <Card
                    data-ocid={`home.overview_card.${index + 1}`}
                    className="flex h-full flex-col rounded-[18px] border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
                  >
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                      {panel.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {panel.description}
                    </p>
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                        {panel.value}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {panel.unit}
                      </p>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Section D — what Urja offers ---------------- */}
      <section
        data-ocid="home.offers_section"
        className="border-b border-border bg-muted/40"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="What Urja offers"
              title="Built for trust, clarity and reach"
            />
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {OFFER_CARDS.map((card, index) => {
              const Icon = card.icon;
              return (
                <Reveal key={card.id} delay={index * 0.1}>
                  <Card
                    data-ocid={`home.offer_card.${index + 1}`}
                    className="flex h-full flex-col rounded-[20px] border-border bg-card p-7 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
                  >
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                    <ul className="mt-6 space-y-3 border-t border-border pt-6">
                      {card.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-sm text-foreground/85"
                        >
                          <BadgeCheck
                            className="mt-0.5 size-4 shrink-0 text-success"
                            aria-hidden="true"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Section E — closing CTA ---------------- */}
      <section data-ocid="home.cta_section" className="bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[28px] bg-gradient-primary px-6 py-16 shadow-floating md:px-16 md:py-20">
              <div className="absolute -right-10 -top-10 size-48 rounded-full bg-accent/25 blur-2xl" />
              <div className="absolute -bottom-16 left-1/3 size-56 rounded-full bg-accent/15 blur-3xl" />
              <div className="absolute right-10 top-10 hidden size-3 rounded-full bg-accent md:block" />
              <div className="absolute bottom-12 right-24 hidden size-2 rounded-full bg-accent/70 md:block" />

              <div className="relative max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
                  <Compass className="size-3.5" aria-hidden="true" />
                  Start here
                </span>
                <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl">
                  Your information. Your energy. Your Urja.
                </h2>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80">
                  Explore public services, follow the national grid and ask
                  anything — all from one place.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    data-ocid="home.start_exploring_button"
                    className="h-12 rounded-full bg-white px-7 text-base font-semibold text-primary shadow-subtle transition-smooth hover:bg-white/90"
                  >
                    <Link to="/ask">
                      Start exploring
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    data-ocid="home.view_services_button"
                    className="h-12 rounded-full border-white/30 bg-transparent px-7 text-base font-medium text-white transition-smooth hover:bg-white/10 hover:text-white"
                  >
                    <Link to="/services">
                      <BookOpenCheck className="size-4" aria-hidden="true" />
                      Browse services
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
