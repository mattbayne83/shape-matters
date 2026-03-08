# Design System — Shape Matters

Generated: 2026-03-08
Mood: Intellectual warmth — a research publication that feels like a literary magazine meets modern tech blog. Dark navigation shell frames light, spacious reading surfaces. Content-first, zero decorative noise.

---

## Color Palette

### Primary Colors
| Role | Name | Hex | Tailwind Class | Usage |
|------|------|-----|----------------|-------|
| Primary | Ember | #E05A1B | `bg-[#E05A1B]` | CTAs, primary buttons, key interactive elements, active nav indicators |
| Primary Light | Ember Glow | #F4A261 | `bg-[#F4A261]` | Hover states, selected backgrounds, highlighted badges |
| Primary Dark | Ember Deep | #B84515 | `bg-[#B84515]` | Active/pressed states, emphasis borders |

### Secondary Colors
| Role | Name | Hex | Tailwind Class | Usage |
|------|------|-----|----------------|-------|
| Secondary | Slate Navy | #1E293B | `bg-slate-800` | Nav shell, dark surfaces, footer background |
| Secondary Light | Slate Charcoal | #334155 | `bg-slate-700` | Nav hover states, dark card surfaces |
| Accent | Warm Stone | #A8967A | `bg-[#A8967A]` | Subtle accents, metadata text, decorative dividers |

### Neutral Scale
| Step | Hex | Tailwind | Usage |
|------|-----|---------|-------|
| 50 | #FAFAF9 | `stone-50` | Page backgrounds, alternating sections |
| 100 | #F5F5F4 | `stone-100` | Card backgrounds, alternating rows |
| 200 | #E7E5E4 | `stone-200` | Borders, dividers |
| 300 | #D6D3D1 | `stone-300` | Disabled states, placeholder text |
| 400 | #A8A29E | `stone-400` | Muted text, icons |
| 500 | #78716C | `stone-500` | Secondary text, captions |
| 600 | #57534E | `stone-600` | Body text on light surfaces |
| 700 | #44403C | `stone-700` | Headings, emphasis |
| 800 | #292524 | `stone-800` | High-contrast text |
| 900 | #1C1917 | `stone-900` | Maximum contrast text |
| 950 | #0F0E0D | `stone-950` | Near-black, dark mode surfaces |

**Why stone instead of slate for neutrals:** The warm stone grays complement the orange primary and prevent the clinical coldness that blue-gray (slate) creates. The existing slate-50 alternating backgrounds should migrate to stone-50 for full palette coherence.

### Semantic Colors
| Role | Hex | Tailwind | Usage |
|------|-----|---------|-------|
| Success | #16A34A | `green-600` | Confirmations, positive indicators, high-fidelity signals |
| Warning | #D97706 | `amber-600` | Alerts, caution states, mid-range fidelity |
| Error | #DC2626 | `red-600` | Validation errors, low-fidelity signals, destructive actions |
| Info | #0891B2 | `cyan-600` | Informational callouts, methodology links |

**Note:** These intentionally match the existing `org-*` functional colors in `index.css` — those are domain-specific data visualization colors and should remain as-is. The semantic colors above are for UI chrome only.

### Palette Rationale
The warm orange primary against warm stone neutrals creates a cohesive temperature — everything feels like it belongs in the same room. The split-complementary relationship between ember orange and slate navy (the nav shell) provides contrast without tension. This mirrors Every.to's approach: warm accent punching through a cool-dark frame, with generous light surfaces that let content breathe.

### Accessibility Notes
- Ember (#E05A1B) on white (#FFFFFF): 3.8:1 — **AA Large Text only**. For small text CTAs, use Ember Deep (#B84515) at 5.2:1 (AA pass)
- Stone-600 (#57534E) on white: 7.2:1 — **AAA pass** (body text)
- Stone-700 (#44403C) on white: 9.6:1 — **AAA pass** (headings)
- White (#FFFFFF) on Slate Navy (#1E293B): 12.6:1 — **AAA pass** (nav text)
- Ember (#E05A1B) on Slate Navy (#1E293B): 3.5:1 — **AA Large Text** (nav accent highlights)

---

## Typography

### Font Pairing
| Role | Font | Weight(s) | Import |
|------|------|-----------|--------|
| Headings | Source Serif 4 | 600, 700 | `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,600;0,8..60,700;1,8..60,600&display=swap')` |
| Body | Inter | 400, 500 | `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap')` |
| Mono/Code | DM Mono | 400 | `@import url('https://fonts.googleapis.com/css2?family=DM+Mono&display=swap')` |

### Why This Pairing Works
Source Serif 4 for headings signals "this is research worth reading" — it carries the authority of academic publishing without the stuffiness. Its optical sizing (8–60pt) means it looks refined at both display and H4 sizes. Paired with Inter for body text, you get the contrast principle at work: serif warmth draws you in at the heading level, then sans-serif clarity takes over for sustained reading. This is the Every.to formula — literary gravitas meets modern legibility. DM Mono stays for code/data, providing a clean third voice.

### Type Scale
| Element | Size | Weight | Line Height | Letter Spacing | Tailwind |
|---------|------|--------|-------------|----------------|----------|
| Display | 3rem / 48px | 700 | 1.1 | -0.02em | `text-5xl font-bold leading-tight tracking-tight font-serif` |
| H1 | 2.25rem / 36px | 700 | 1.2 | -0.01em | `text-4xl font-bold leading-snug font-serif` |
| H2 | 1.875rem / 30px | 600 | 1.25 | -0.01em | `text-3xl font-semibold font-serif` |
| H3 | 1.5rem / 24px | 600 | 1.3 | 0 | `text-2xl font-semibold font-serif` |
| H4 | 1.25rem / 20px | 600 | 1.4 | 0 | `text-xl font-semibold font-serif` |
| Body | 1.125rem / 18px | 400 | 1.7 | 0 | `text-lg leading-relaxed` |
| Body Standard | 1rem / 16px | 400 | 1.6 | 0 | `text-base` |
| Body Small | 0.875rem / 14px | 400 | 1.5 | 0 | `text-sm` |
| Caption | 0.75rem / 12px | 500 | 1.4 | 0.04em | `text-xs font-medium tracking-wider` |
| Section Label | 0.75rem / 12px | 600 | 1.4 | 0.08em | `text-xs font-semibold uppercase tracking-widest` |

**Note:** Body text is 18px (text-lg), not 16px. This is a deliberate editorial choice — long-form research content reads better at 18px with 1.7 line-height. Use 16px (text-base) for UI chrome, form labels, and metadata only.

### Alternative Pairings
1. **Newsreader + Inter** — More traditional editorial feel, slightly warmer serifs with ink-trap details that work beautifully at large sizes. Swap if Source Serif feels too "tech documentation."
2. **Fraunces + Inter** — Bolder, quirkier serif with optical sizing. Creates a more opinionated, almost playful-intellectual vibe. Swap if you want more personality in the headings.

---

## Spacing & Layout

### Spacing Scale
Base unit: 4px. Use Tailwind's default scale:
| Token | Value | Common Usage |
|-------|-------|-------------|
| 1 | 4px | Tight icon gaps |
| 2 | 8px | Inline element spacing, badge padding |
| 3 | 12px | Compact card padding, list gaps |
| 4 | 16px | Standard padding, form field spacing |
| 6 | 24px | Card internal padding, section heading gaps |
| 8 | 32px | Card gaps, content column gutters |
| 12 | 48px | Section padding (top/bottom) |
| 16 | 64px | Major section breaks — the "breathing room" layer |
| 20 | 80px | Hero section vertical padding |
| 24 | 96px | Page-level section separation |

**Spacing philosophy:** Err toward MORE whitespace, not less. When in doubt, go one step up the scale. The Every.to feel comes from sections that breathe — 48px minimum section padding, 64-96px between major sections.

### Content Width
| Context | Max Width | Tailwind |
|---------|-----------|----------|
| Prose/reading column | 680px | `max-w-[680px]` |
| Content with sidebar | 1120px | `max-w-[1120px]` |
| Full layout | 1280px | `max-w-7xl` |
| Nav bar | 1280px | `max-w-7xl` |

### Border Radius
| Element | Radius | Tailwind |
|---------|--------|----------|
| Buttons | 8px | `rounded-lg` |
| Cards | 12px | `rounded-xl` |
| Inputs | 8px | `rounded-lg` |
| Badges/Pills | 9999px | `rounded-full` |
| Modals/Panels | 16px | `rounded-2xl` |
| Nav bar | 0 | Edge-to-edge, no radius |

**Radius language:** Consistently rounded — friendly, approachable, not corporate. This matches the "intellectual but warm" brief. Never mix sharp and rounded corners.

### Shadows
| Level | CSS | Tailwind | Usage |
|-------|-----|----------|-------|
| Subtle | `0 1px 2px rgba(28, 25, 23, 0.05)` | `shadow-sm` | Cards at rest on white backgrounds |
| Default | `0 1px 3px rgba(28, 25, 23, 0.08), 0 1px 2px rgba(28, 25, 23, 0.04)` | `shadow` | Dropdowns, popovers |
| Medium | `0 4px 12px rgba(28, 25, 23, 0.08)` | `shadow-md` | Floating metric cards, sticky headers |
| Large | `0 12px 32px rgba(28, 25, 23, 0.12)` | `shadow-lg` | Modals, overlay panels |

**Shadow color:** Using stone-900 rgba (not pure black) keeps shadows warm and cohesive with the palette.

---

## Component Styles

### Buttons
```
Primary:     bg-[#E05A1B] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[#B84515] active:bg-[#963A12] transition-colors duration-150
Secondary:   bg-transparent border border-stone-300 text-stone-700 font-medium px-5 py-2.5 rounded-lg hover:bg-stone-50 hover:border-stone-400 transition-colors duration-150
Ghost:       bg-transparent text-[#E05A1B] font-medium px-5 py-2.5 rounded-lg hover:bg-[#E05A1B]/5 transition-colors duration-150
Danger:      bg-red-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-150
```

### Cards
```
Default:     bg-white border border-stone-200 rounded-xl shadow-sm p-6
Elevated:    bg-white rounded-xl shadow-md p-6
Interactive: bg-white border border-stone-200 rounded-xl shadow-sm p-6 hover:shadow-md hover:border-stone-300 transition-all duration-200 cursor-pointer
Dark:        bg-slate-800 border border-slate-700 rounded-xl p-6 text-white
```

### Metric Cards (project-specific)
```
Primary:     bg-white border border-stone-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200
Flippable:   [same as primary] + preserve-3d cursor-pointer
Secondary:   bg-stone-50 border border-stone-200 rounded-xl p-4
```

### Inputs
```
Default:     bg-white border border-stone-300 rounded-lg px-3.5 py-2.5 text-base text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-[#E05A1B]/20 focus:border-[#E05A1B] outline-none transition-all duration-150
Error:       border-red-500 ring-2 ring-red-500/20 focus:ring-red-500/20 focus:border-red-500
```

### Sliders (project-specific)
```
Track:       bg-stone-200 rounded-full h-2
Fill:        bg-[#E05A1B] rounded-full h-2
Thumb:       w-5 h-5 bg-white border-2 border-[#E05A1B] rounded-full shadow-sm
```

### Navigation (dark shell)
```
Bar:         bg-slate-800 border-b border-slate-700 sticky top-0 z-50
Link:        text-stone-300 hover:text-white transition-colors duration-150
Active:      text-white font-medium
Accent:      text-[#F4A261]
Logo:        font-serif font-bold text-white text-xl
```

---

## Animation & Motion

### Timing
| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 150ms | ease-out | Button hover, toggle, icon change |
| Standard | 250ms | ease-in-out | Tab switch, fade, border color |
| Emphasis | 350ms | cubic-bezier(0.16, 1, 0.3, 1) | Card flip, section reveal, scroll-triggered entrance |
| Exit | 200ms | ease-in | Closing panels, dismissing toasts |
| Slow breathe | 4-6s | ease-in-out | SVG glow pulses, shape overlays (existing animations) |

### Transitions to Use
- **Hover states**: `transition-colors duration-150`
- **Card interactions**: `transition-all duration-200`
- **Section entrances**: `animate-[fade-in_0.4s_ease-out_both]` with staggered `animationDelay`
- **SVG draw-on**: Existing `shape-draw` keyframe (stroke-dashoffset)

### Motion Philosophy
Keep the existing SVG visualization animations (cascade-pulse, gap-breathe, float-subtle, ring-pulse) — they're well-calibrated and essential to the research tool's storytelling. UI motion should be minimal and fast (150-250ms) so it never competes with the data visualizations.

---

## Section Backgrounds

Maintain the alternating pattern but shift to warm stone:

| Section | Background | Tailwind |
|---------|-----------|----------|
| Odd sections (Problem, Shape, Model) | White | `bg-white` |
| Even sections (Proof, Evidence, Methodology) | Warm off-white | `bg-stone-50` |
| Nav shell | Dark slate | `bg-slate-800` |
| Footer | Dark slate | `bg-slate-800` |
| Hero/above-fold | White | `bg-white` |

---

## Tailwind Config Changes

To implement this design system, update `index.css` theme block:

```css
@theme {
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-serif: 'Source Serif 4', Georgia, serif;
  --font-mono: 'DM Mono', monospace;

  /* Existing org-* colors remain for data visualization */
  --color-org-green: #16a34a;
  --color-org-blue: #2563eb;
  --color-org-purple: #7c3aed;
  --color-org-amber: #d97706;
  --color-org-red: #dc2626;
  --color-org-cyan: #0891b2;

  /* New design system colors */
  --color-ember: #E05A1B;
  --color-ember-light: #F4A261;
  --color-ember-deep: #B84515;
  --color-warm-stone: #A8967A;
}
```

---

## Anti-Patterns — Do NOT

1. **Don't use pure black (#000000) for text** — use stone-800 (#292524) or stone-900 (#1C1917). Pure black on white creates harsh vibration on screens.
2. **Don't apply the orange accent to large surfaces** — ember is for accents, CTAs, and indicators only. A full orange background screams "warning" rather than "warmth."
3. **Don't mix serif and sans-serif within the same hierarchy level** — headings are always Source Serif 4, body is always Inter. Never swap them.
4. **Don't reduce whitespace to "fit more in"** — the generous spacing IS the design. If something doesn't fit, remove content, don't compress spacing.
5. **Don't add decorative borders AND shadows to the same element** — pick one elevation method per card. Default cards use border; elevated cards use shadow.
6. **Don't use cold blue-grays (slate) for content surfaces** — slate is only for the dark nav shell and footer. Content surfaces use warm stone neutrals.
7. **Don't animate body content on scroll** — section-level fade-ins are fine, but parallax, sliding, or bouncing paragraph text undermines the reading experience.
8. **Don't use more than 2 accent colors on a single screen** — ember orange + one semantic color (green for good, red for bad) is the maximum. The palette's restraint is what makes the orange powerful.
