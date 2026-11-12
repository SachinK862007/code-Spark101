# Design Brief

## Direction

URJA — Warm Editorial Civic — a calm, premium public information and energy intelligence platform that reads like a trusted broadsheet, not a government portal.

## Tone

Warm, premium, editorial: cream paper, deep violet ink, marigold highlights; restrained and authoritative with generous whitespace.

## Differentiation

Editorial serif headlines over cream paper with monospace data readouts — a newspaper-of-record feel applied to live energy intelligence.

## Color Palette

| Token      | OKLCH        | Role                                          |
| ---------- | ------------ | --------------------------------------------- |
| background | 0.975 0.006 85 | Warm cream canvas (#FAF8F5)                 |
| foreground | 0.22 0.012 60  | Primary ink text (#1C1A17)                  |
| card       | 1.0 0 0        | White panels and cards                      |
| primary    | 0.52 0.19 292  | Deep violet — main interactive colour       |
| accent     | 0.78 0.14 72   | Marigold — sparing highlights only          |
| muted      | 0.955 0.008 85 | Secondary surfaces, section alternation     |
| border     | 0.905 0.012 80 | Thin warm hairlines (#E8E2D9)               |
| success    | 0.55 0.13 152  | Positive status (meaning only)              |
| warning    | 0.66 0.13 68   | Caution status (meaning only)               |
| destructive| 0.55 0.19 25   | Negative status (meaning only)              |

## Typography

- Display: Fraunces — editorial serif for hero and section headlines, tight tracking (-0.02em)
- Body: General Sans — UI, paragraphs, labels (humanist sans closest to Inter)
- Mono: JetBrains Mono — numbers, metrics, technical labels, code
- Scale: hero `text-5xl md:text-7xl font-semibold tracking-tight`, h2 `text-3xl md:text-5xl font-semibold tracking-tight`, label `text-xs font-semibold tracking-[0.18em] uppercase font-mono`, body `text-base md:text-lg leading-relaxed`

## Elevation & Depth

Layered paper: cream background, white cards with hairline borders, three soft low-opacity shadow tiers (subtle / elevated / floating); no glow, no glassmorphism.

## Structural Zones

| Zone    | Background            | Border    | Notes                                             |
| ------- | --------------------- | --------- | ------------------------------------------------- |
| Sidebar | `bg-sidebar`          | `border-r` | Persistent app shell; grouped nav, violet active pill, role selector at base |
| Top bar | `bg-card/90 backdrop-blur` | `border-b` | Sticky page title + breadcrumb, search, notifications, help, profile |
| Content | `bg-background`       | —         | Alternate `bg-muted/40` sections for editorial rhythm |
| Footer  | `bg-muted/50`         | `border-t` | Attribution, service links, monospace legal line  |

Shell: sidebar visible on `lg+`, collapses to a drawer under `lg`; content column `max-w-7xl`. Public pages (home, method, services) use the marketing header instead of the app sidebar.

## Spacing & Rhythm

Sections use `py-16 md:py-24`; cards `p-6 md:p-8`; grid gaps `gap-5 md:gap-6`; micro-spacing in 4px steps; max content width `max-w-7xl` at 1440px.

## Component Patterns

- Buttons: rounded-full pills; violet primary with white text, ghost with hairline border; hover lifts to `shadow-elevated` and darkens
- Cards: `rounded-[18px]` white, 1px warm border, `shadow-subtle`; hover `shadow-elevated` with `-translate-y-0.5`
- Badges: rounded-full, tinted background at low opacity with matching dark text; status colours reserved for real meaning
- Inputs: rounded-2xl white with hairline border, violet focus ring, marigold never used for form chrome
- Nav items: rounded-full row, muted text at rest, `bg-primary/10 text-primary` pill when active, mono section labels above groups
- Data cards: every metric shows value + unit + trend chip + source label + a "sample data" tag; sparklines and charts use `chart-1..5` only

## Motion

- Entrance: `animate-fade-in-up` staggered 60–90ms on hero and card grids
- Hover: `transition-smooth` (0.3s cubic-bezier) on lift, border darken, and colour shift
- Decorative: `animate-pulse-soft` on live-status dots, `animate-float` on hero energy orb

## Constraints

- Design only — no feature is functional; all content is clearly labelled static sample data
- No light/dark toggle in the UI; tokens support both but light cream is the shipped mode
- Avoid excessive gradients, aggressive colour, and generic glassmorphism
- Violet is the only interactive colour; marigold is sparing; status colours carry meaning only

## Signature Detail

The editorial masthead + monospace data readout pairing — a broadsheet headline beside a live "198,420 MW" ticker — the energy-intelligence signature of the platform.
