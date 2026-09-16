---
name: Kinetic Obsidian
colors:
  surface: '#121413'
  surface-dim: '#121413'
  surface-bright: '#383a38'
  surface-container-lowest: '#0d0f0e'
  surface-container-low: '#1a1c1b'
  surface-container: '#1e201f'
  surface-container-high: '#282a29'
  surface-container-highest: '#333534'
  on-surface: '#e2e3e0'
  on-surface-variant: '#c4c9b0'
  inverse-surface: '#e2e3e0'
  inverse-on-surface: '#2f312f'
  outline: '#8e937c'
  outline-variant: '#444936'
  surface-tint: '#a9d631'
  primary: '#ffffff'
  on-primary: '#273500'
  primary-container: '#c4f34d'
  on-primary-container: '#526d00'
  inverse-primary: '#4d6700'
  secondary: '#7cd1fc'
  on-secondary: '#003548'
  secondary-container: '#00789f'
  on-secondary-container: '#eaf6ff'
  tertiary: '#ffffff'
  on-tertiary: '#442b00'
  tertiary-container: '#ffddb1'
  on-tertiary-container: '#885c06'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4f34d'
  primary-fixed-dim: '#a9d631'
  on-primary-fixed: '#151f00'
  on-primary-fixed-variant: '#3a4d00'
  secondary-fixed: '#c1e8ff'
  secondary-fixed-dim: '#7cd1fc'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d67'
  tertiary-fixed: '#ffddb1'
  tertiary-fixed-dim: '#f6bc64'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#121413'
  on-background: '#e2e3e0'
  surface-variant: '#333534'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  title-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  metric-display:
    fontFamily: Space Grotesk
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 48px
  metric-display-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system establishes an unapologetically serious, high-performance athletic identity tailored for Gulf and Saudi users. Moving away from casual gamification, pastel trackers, and decorative gimmickry, this interface takes cues from elite biomechanics suites, tactical chronographs, and precision telemetry gear.

The visual style blends **Dark Industrial Minimalism** with **Technical Precision**:
- **Atmosphere:** Deep obsidian surfaces tinged with a sub-perceptual forest undertone, delivering maximum optical contrast against an electric kinetic lime accent.
- **RTL-First Architecture:** Engineered natively for Right-to-Left Arabic reading patterns, ensuring biological visual flow from right-anchored metrics to left-oriented trend terminations.
- **Tone & Demeanor:** Disciplined, commanding, and clinical. The product speaks like an elite strength and conditioning coach—authoritative, focused on actionable outputs, metric density, and zero clutter.
- **Visual Discipline:** Pure stroke iconography (fixed 1.6px stroke weight), structural hairline dividers, and zero emoji or decorative illustrations. Every pixel serves numeric tracking and performance diagnostics.

## Colors

The palette is anchored in an ultra-deep charcoal black, paired with specialized functional tokens that map directly to metabolic tracking and telemetry feedback.

### Core Canvas & Structure
- **Page Canvas (`#0A0C0B`):** Pure deep obsidian with a green-black bias.
- **Card Surface (`#131715`):** Tier-1 elevated containers for metrics, workout blocks, and daily meal plans.
- **Inner Surface (`#1A201D`):** Nested modules within cards (e.g., input rows, macronutrient breakdowns, split sets).
- **Hairline Borders (`rgba(255, 255, 255, 0.07)`): Subtle structural containment without visual heaviness.

### Accent & Ergonomics
- **Primary Accent (`#C8F751` - Kinetic Lime):** High-visibility punch reserved for primary actions, completion states, and active telemetry. Text rendered on top of this color must strictly use `#0A0C0B` for WCAG AAA legibility.
- **Surface Highlight (`rgba(200, 247, 81, 0.12)`): Translucent green wash used exclusively for selected states, active chip containers, and target completion bands.

### Metabolic Tracking Spectrum
- **Protein (`#C8F751` - Lime):** Reinforces target muscle repair, primary focus of daily targets.
- **Carbohydrates (`#7FD4FF` - Sky Blue):** Glycogen and energy availability indicators.
- **Lipids / Fat (`#FFC46B` - Warm Amber):** Essential hormonal and dense caloric metric tracking.

### Typography Levels
- **Text Primary (`#EDF2EE`):** Crisp off-white; maximum contrast for primary values and Arabic headers.
- **Text Secondary (`#A9B5AE`):** Neutralized sage-slate; used for contextual units, section labels, and timestamps.
- **Text Muted (`#74807A`):** Low-salience carbon; reserved for placeholder text, disabled states, and auxiliary technical guidelines.

## Typography

The typographic hierarchy implements an intentional bilingual strategy:
1. **Arabic Context & Core System Typography:** When loading native Arabic scripts, the system pairs natively with Readex Pro for all text titles, running paragraphs, nutritional lists, and Arabic button copy. Its geometric sans-serif construction aligns with technical telemetry while maintaining optimal legibility at compact sizes in RTL.
2. **Numeric Data & Tabular Metrics:** All numeric values, macros (grams, kcal, reps, kg), and timestamps utilize **Space Grotesk** with `font-feature-settings: "tnum" 1` enabled. This guarantees rigid columnar alignment in dashboards, eliminating layout wobble during live weight logging and timer intervals.

### Directional & Typographic Behaviors
- **Mixed Content:** In RTL views, English units (e.g., `g`, `kcal`, `kg`) sit to the left of the numeric value when numerals read left-to-right, maintaining standard athletic telemetry conventions.
- **Tracking & Kern:** Maintain standard kerning (`letter-spacing: 0`) for Arabic copy; apply `letter-spacing: -0.02em` exclusively on Space Grotesk display weights to keep large metrics tightly knit.

## Layout & Spacing

The layout is built upon an 8pt base grid with specialized structural containers tailored for single-hand mobile use during training sessions.

### Grid Architecture & Reflow Rules
- **Mobile Handheld (320px – 767px):** Single-column layout. Gaps are locked to `space-md` (12px) to `space-lg` (16px), with outer canvas margins of `16px`. Primary actions and quick-log bars pin to the bottom thumb zone with standard safe area insets.
- **Tablet / In-Gym Slate (768px – 1023px):** 6-column fluid system. Gaps scale to `space-lg` (16px), margins expand to `24px`. Allows meal log lists and daily macro telemetry to sit side-by-side in a 3:3 ratio.
- **Desktop Dashboard (1024px+):** 12-column fixed grid with an absolute max-width container of `1280px` centered. Outer margins set to `40px` (`margin-desktop`), gutters fixed at `24px`.

### RTL Layout Conventions
- **Flow Orientation:** Grid columns and flex elements initialize from `right` to `left`. Primary metric anchors (e.g., Target vs. Consumed labels) sit top-right; action items (edit, disclose) sit top-left.
- **Touch Target Density:** All interactive logging buttons retain an absolute minimum vertical bounding box of `48px` to ensure effortless gym-floor interaction with sweaty or chalked hands.

## Elevation & Depth

This design system avoids blurry drop shadows, soft lighting, and heavy skeuomorphic extrusions. Instead, depth is articulated through **Calibrated Tonal Stratification** paired with **Precision Luminescence**.

### Tonal Stratification (The 3-Tier Canvas)
- **Base Canvas (`#0A0C0B`):** The structural ground floor. No borders or elevation.
- **Tier 1 - Functional Cards (`#131715`):** Raised elements hosting self-contained functional entities (e.g., Macro Rings, Daily Workout Routine). Bound by a continuous `1px` border of `rgba(255, 255, 255, 0.07)`.
- **Tier 2 - Nested Insets (`#1A201D`):** Embedded components inside cards (e.g., individual ingredient breakdowns, set/rep counters). Bound by an internal hairline border of `rgba(255, 255, 255, 0.04)`.

### Precision Luminescence (Active Glows)
- **Focus & Peak Performance Rings:** When a user surpasses a workout target or hits their exact daily protein macro, cards emit a tightly constrained, highly-diffused ambient glow:
  `box-shadow: 0 0 24px -4px rgba(200, 247, 81, 0.16)`.
- **Floating Modals & Bottom Sheets:** Backdrops apply a high-density blur (`backdrop-filter: blur(20px) saturate(140%)`) combined with `#0A0C0B` at `80%` opacity, maintaining stark visual focus on the active tracking input.

## Shapes

The design system employs an exact, purposeful corner radius hierarchy tailored to ergonomic handheld devices. Roundedness balances technical hardware precision with tactical fluidity:

- **Cards & Primary Blocks:** `22px` corner radius. Softens substantial visual blocks on mobile viewports while retaining architectural structure.
- **Inner Nesting Surfaces:** `16px` corner radius. Mathematically offsets within `22px` parent cards to maintain harmonic concentric rounding.
- **Interactive Action Buttons:** `18px` corner radius. Delivers a weighted, pressable athletic profile distinct from pills and hard rectangles.
- **Tags, Chips & Indicators:** `12px` corner radius. Compact and structural for macro markers, set counters, and category pills.
- **Input Fields:** `16px` corner radius, aligning seamlessly with inner nested cards.

## Components

### Buttons
- **Primary Athletic Button:** High-contrast Kinetic Lime (`#C8F751`) background, solid `#0A0C0B` typography (Space Grotesk, bold), fixed radius of `18px`. Height is `52px` on mobile with `space-xl` lateral padding.
- **Secondary Ghost Button:** Translucent canvas (`#1A201D`), hairline border `rgba(255, 255, 255, 0.07)`, text in Primary Off-White (`#EDF2EE`). Hover/Active state introduces `rgba(200, 247, 81, 0.08)` fill.
- **Icon Actions:** Clean stroke icons (1.6px stroke width) inside a `44x44px` touch bounding container, centered.

### Chips & Filter Tabs
- **Height:** `36px` compact container with `12px` border radius.
- **Inactive State:** Surface `#131715`, border `rgba(255, 255, 255, 0.07)`, text Secondary (`#A9B5AE`).
- **Active State:** Surface tinted with Lime accent (`rgba(200, 247, 81, 0.12)`), solid border `#C8F751` at `1px`, text `#C8F751` with bold weight.

### Form Inputs & Telemetry Fields
- **Container:** `#1A201D` inner surface, radius `16px`, height `56px`. Text typed is `#EDF2EE` with right-aligned Arabic text or left-aligned tabular numerals depending on entry type.
- **Focus State:** Stroke transitions cleanly from subtle hairline to `1.5px solid #C8F751`. Zero outward blur rings; focus remains razor-sharp.
- **Prefix / Suffix Units:** Metric tags (e.g., `كجم`, `سعرة`, `جم`) render in Space Grotesk / Readex Pro at Text Muted (`#74807A`).

### Telemetry Cards & Macro Rings
- **Macro Bar Trackers:** Unfilled background rails use `#1A201D` with inner hairline borders. Progress fills use solid single-color macro tokens: Protein (`#C8F751`), Carbs (`#7FD4FF`), Fat (`#FFC46B`). Rail ends use square-capped or `4px` subtle radii, avoiding fully circular bubbly ends.
- **List Items (Meal & Workout Logs):** Stored within Tier-1 cards. Separators between rows use `1px` hairlines with `margin-inline: 12px`. Swiping actions in RTL slide inward from the left margin to reveal quick-delete or duplicate triggers.

### Checkboxes & Radios
- **Control Shell:** `20x20px` square with `6px` radius (checkbox) or `20x20px` circle (radio). Border `1.6px solid #74807A`.
- **Selected State:** Fill `#C8F751`, border `#C8F751`. Check mark or radio pip rendered in `#0A0C0B` with an unbroken `1.6px` vector weight.

### Iconography Guidelines
- **Stroke Width:** Universally locked to `1.6px`. No fills, no dual-tone shapes, no decorative emojis.
- **RTL Swapping:** Direction-dependent icons (arrows, chevrons, progression graphs) mirror along the Y-axis automatically in RTL contexts. Telemetry dials (stopwatches, concentric rings) preserve clockwise metric progression.