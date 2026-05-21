/**
 * DESIGN.md generator — emits a Stitch-compatible spec
 * (https://stitch.withgoogle.com/docs/design-md/specification/)
 * from `src/tokens/*.ts`.
 *
 * Output: `<repo-root>/DESIGN.md`
 *
 * Why we ship this: the Stitch spec is W3C Design Token Format-aligned,
 * so any tool that understands the format (Stitch, Figma Tokens Studio,
 * Style Dictionary, future agents) can consume Polaris's tokens
 * directly. Single source of truth stays at `tokens.ts` — everything
 * downstream is generated.
 *
 * The token system is single-mode (light values only). Dark-mode pairs
 * stay in `tokens.ts` / `tokens.css`; we mention them in the prose.
 *
 * Run with `tsx`:
 *   pnpm --filter @polaris/ui build:design-md
 *
 * CI compares the committed `DESIGN.md` against this script's output —
 * see `.github/workflows/ci.yml`.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  brandPalette,
  fileType,
  neutral,
  surface,
  radius,
  fontFamily,
  textStyle,
  spacing,
  bluePalette,
  greenPalette,
  orangePalette,
  redPalette,
  purplePalette,
  grayRamp,
  label,
  background,
  layer,
  fill,
  line,
  accentBrand,
  state,
  ai,
} from '../src/tokens';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '../../../DESIGN.md');

const camelToKebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

/* ---------- YAML emission helpers ---------- */

function emitColors(): string {
  // Map Polaris's nested color groups to flat Stitch token names. Light
  // values only — dark pairs live in tokens.ts.
  // 9-step ramps go first so consumers see the full color system before
  // semantic aliases.
  const colors: Record<string, string> = {};

  const ramps: Array<[string, Record<string, string>]> = [
    ['blue',   bluePalette],
    ['green',  greenPalette],
    ['orange', orangePalette],
    ['red',    redPalette],
    ['purple', purplePalette],
    ['gray',   grayRamp],
  ];
  for (const [name, ramp] of ramps) {
    for (const [step, hex] of Object.entries(ramp)) {
      colors[`${name}-${step}`] = hex;
    }
  }

  // Semantic v0.8 spec groups — flatten into Stitch's name space.
  // `accentBrand.normal` (blue) maps to Stitch's `primary`; `ai.normal`
  // (NOVA purple) maps to `secondary`. The 4-color file palette stays
  // grouped (file-docx / file-xlsx / …).
  colors.primary = accentBrand.normal.light;
  colors['primary-hover'] = accentBrand.strong.light;
  colors['primary-subtle'] = accentBrand.bg.light;
  colors.secondary = ai.normal.light;
  colors['secondary-hover'] = ai.strong.light;
  colors['secondary-subtle'] = ai.hover.light;

  // File-type accents
  for (const [k, v] of Object.entries(fileType)) {
    colors[`file-${k}`] = v.light;
  }

  // State (success / warning / error / info / new)
  for (const [k, v] of Object.entries(state)) {
    colors[`state-${camelToKebab(k)}`] = v.light;
  }

  // Neutral scale
  for (const [k, v] of Object.entries(neutral)) {
    colors[`neutral-${k}`] = v.light;
  }

  // Semantic foreground / surface / fill / line aliases
  for (const [k, v] of Object.entries(label)) {
    colors[`label-${camelToKebab(k)}`] = v.light;
  }
  for (const [k, v] of Object.entries(background)) {
    colors[`background-${camelToKebab(k)}`] = v.light;
  }
  for (const [k, v] of Object.entries(layer)) {
    colors[`layer-${camelToKebab(k)}`] = v.light;
  }
  for (const [k, v] of Object.entries(surface)) {
    colors[`surface-${camelToKebab(k)}`] = v.light;
  }
  for (const [k, v] of Object.entries(fill)) {
    colors[`fill-${camelToKebab(k)}`] = v.light;
  }
  for (const [k, v] of Object.entries(line)) {
    colors[`line-${camelToKebab(k)}`] = v.light;
  }

  // Brand palette base (raw color names — useful as a fallback alias)
  for (const [k, v] of Object.entries(brandPalette)) {
    colors[`palette-${k}`] = v.light;
  }

  return Object.entries(colors)
    .map(([k, v]) => `  ${k}: "${v}"`)
    .join('\n');
}

function emitTypography(): string {
  // Stitch typography tokens are composite objects.
  const lines: string[] = [];
  for (const [name, style] of Object.entries(textStyle)) {
    const tokenName = camelToKebab(name);
    // Convert lineHeight from "60px" against fontSize "48px" to a unitless
    // ratio, which is the recommended form.
    const fontSizePx = parseFloat(style.fontSize);
    const lineHeightPx = parseFloat(style.lineHeight);
    const ratio = (lineHeightPx / fontSizePx).toFixed(3).replace(/\.?0+$/, '');
    lines.push(`  ${tokenName}:`);
    lines.push(`    fontFamily: ${quoteIfNeeded(fontFamily.sans)}`);
    lines.push(`    fontSize: ${style.fontSize}`);
    lines.push(`    fontWeight: ${style.fontWeight}`);
    lines.push(`    lineHeight: ${ratio}`);
    if (style.letterSpacing && style.letterSpacing !== '0') {
      lines.push(`    letterSpacing: ${style.letterSpacing}`);
    }
  }
  return lines.join('\n');
}

function emitRounded(): string {
  return Object.entries(radius)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');
}

function emitSpacing(): string {
  // Map Polaris's full Tailwind scale to Stitch's named-level convention.
  // We pick representative values for the canonical xs/sm/md/lg/xl + gutter.
  const map: Record<string, string> = {
    xs: spacing['1'],
    sm: spacing['2'],
    md: spacing['4'],
    lg: spacing['8'],
    xl: spacing['16'],
    gutter: spacing['6'],
  };
  return Object.entries(map)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');
}

function emitComponents(): string {
  // Curated subset — the controls every Polaris consumer touches first.
  // Stitch lets us reference colors/rounded by token name. Spec names
  // (v0.8): primary = accent.brand.normal, layer-surface = card surface,
  // label-normal = primary text, etc.
  return `  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.label-inverse}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary-subtle}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: 12px
  card:
    backgroundColor: "{colors.layer-surface}"
    textColor: "{colors.label-normal}"
    rounded: "{rounded.lg}"
    padding: 20px
  input:
    backgroundColor: "{colors.layer-surface}"
    textColor: "{colors.label-normal}"
    rounded: "{rounded.md}"
    padding: 8px
  badge:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: 4px`;
}

function quoteIfNeeded(s: string): string {
  // YAML strings with commas / quotes / colons need quoting.
  if (/[,'":#]|^\s|\s$/.test(s)) return `"${s.replace(/"/g, '\\"')}"`;
  return s;
}

const yamlBlock = `---
version: alpha
name: Polaris Design System
description: Internal design system for Polaris Office's vibe-coding-ops React/Next.js services. 4-color brand palette + NOVA purple, Pretendard typography, Tailwind 4px spacing baseline, Radix UI primitives.

colors:
${emitColors()}

typography:
${emitTypography()}

rounded:
${emitRounded()}

spacing:
${emitSpacing()}

components:
${emitComponents()}
---`;

const proseBlock = `# Polaris Design System

> **Auto-generated.** This file is produced by \`packages/ui/scripts/build-design-md.ts\` from \`packages/ui/src/tokens/*.ts\`. Edit those source modules instead — CI fails on drift.
>
> The spec follows the [Stitch DESIGN.md format](https://stitch.withgoogle.com/docs/design-md/specification/) so any agent or tool that consumes the format (Stitch, Figma Tokens Studio, Style Dictionary downstream) can use Polaris's tokens directly.

## Overview

Polaris is the design system shared across Polaris Office's vibe-coding-ops services — services that LLMs help generate. The system's promise is **token-first, anti-bypass**: model output is constrained by tokens, components, and lint rules so screens stay visually consistent across every service in the company.

The tone is calm and professional with a 4-color brand identity (blue / green / orange / red — same palette the Polaris Office logo uses) plus a single NOVA purple reserved for AI / generative contexts. Documents always feel like Polaris.

## Colors

![Color spec](assets/figma-spec/foundation/color.png)

The palette is rooted in Polaris's 4-color brand identity. Each base color doubles as its file-type signal (DOCX = blue, XLSX = green, PPTX = orange, PDF = red). A NOVA purple is reserved for AI features.

- **Primary (Polaris Blue, #1D7FF9):** Headlines of action — buttons, links, focus, active nav. Same hex as \`fileType.docx\`. Token: \`accentBrand.normal\`.
- **Secondary (NOVA Purple, #6F3AD0):** AI / generative contexts only. Pairs with sparkle iconography. Never mix primary and secondary on the same screen — pick by context. Token: \`ai.normal\`.
- **State (success / warning / error / info):** Reserved for system feedback. Each has a \`Bg\` tint for banners + a \`Strong\` tier for body-size text.
- **Neutral (12 steps, 0 → 1000):** Light/dark inverted by \`data-theme\`. \`background.base\` (page bg), \`layer.surface\` (cards/modals), \`label.normal\` / \`label.neutral\` / \`label.alternative\` are the everyday aliases; reach for those before the raw scale.

Do not mix file-type colors as decorative accents — they carry semantic meaning (document type signals).

## Typography

![Typography spec](assets/figma-spec/foundation/typography.png)

Pretendard Variable for both display and body. Korean / Latin / numerals all use the same family. JetBrains Mono for code.

Eleven named levels (v0.8 spec): \`display\` (40), \`title\` (32), \`heading1\` (28), \`heading2\` (24), \`heading3\` (20), \`heading4\` (18) for heading hierarchy, \`body1\` (16), \`body2\` (14), \`body3\` (13) for paragraph copy, \`caption1\` (12), \`caption2\` (11) for labels and chrome. All headings + captions are weight 700 (Bold). Body is weight 400 (Regular).

(v0.7 rc.0 / v0.6 aliases — \`h1\`-\`h5\`, \`body\`, \`detail\`, \`meta\`, \`tiny\`, \`display-lg\`, \`heading-lg\`, \`body-lg\`, \`caption\` — were removed in v0.8. Run \`pnpm dlx @polaris/lint polaris-codemod-v08 --apply src\` to migrate.)

Line-heights: 1.4 headings, 1.5 body, 1.3 captions. NO letter-spacing — Pretendard's optical metrics are calibrated at the typeface level.

Mobile (≤ 767px): every level shifts down one step (Display 40→32, Title 32→28, etc.). Body3 / Caption1 / Caption2 unchanged. Auto-applied via media query in \`tokens.css\`.

Use \`text-polaris-*\` Tailwind utilities — never inline \`font-family\` or arbitrary \`text-[14px]\`. The lint rule \`no-direct-font-family\` blocks both.

## Layout

![Grid spec](assets/figma-spec/foundation/grid.png)

4px base scale, Tailwind defaults. Container widths cap at 1200px (xl). Mobile-first; \`sm: 640\`, \`md: 768\`, \`lg: 1024\`, \`xl: 1280\`, \`2xl: 1536\`.

No semantic spacing tokens (e.g., \`spacing.gutter\`, \`spacing.section-y\`) — Tailwind's numeric scale is already the standard, and abstracting on top of it raises the bar without payoff. Arbitrary values like \`p-[13px]\` are blocked by lint.

## Elevation & Depth

Four shadow levels for light mode (\`xs\`, \`sm\`, \`md\`, \`lg\`) plus a darker dark-mode pair. The \`shadow-polaris-*\` Tailwind utilities pick the right pair via \`data-theme\`. Use \`xs\` for hover lifts, \`sm\` for cards, \`md\` for menus / toasts, \`lg\` for modals.

In dark mode, shadows alone don't carry hierarchy — pair with \`layer.surface\` tonal layers (cards sit on a slightly lighter surface than the page background).

## Shapes

![Radius spec](assets/figma-spec/foundation/radius.png)

Eight radius levels (v0.8 spec): \`2xs\` (2) / \`xs\` (4) / \`sm\` (8) / \`md\` (12) / \`lg\` (16) / \`xl\` (24) / \`2xl\` (38) / \`pill\` (9999). Inputs use \`sm\` (8px). Buttons / cards / modals default to \`md\` (12px). Large CTAs use \`lg\` (16px), emphasis modals \`xl\` (24px), bottom sheets \`2xl\` (38px). \`pill\` for pills / avatars / switch thumbs. (The v0.7 \`full\` alias was removed in v0.8 — codemod-v08 rewrites it.)

Avoid mixing rounded and sharp corners in the same component. Don't introduce new \`px\` values — extend the scale instead.

## Iconography

![Iconography spec](assets/figma-spec/theme/iconography.png)

65 monochrome UI icons × 3 sizes (18 / 24 / 32 px) ship via \`@polaris/ui/icons\` — each component renders the design-team SVG and accepts \`size\` (number) + \`className\` (Tailwind \`text-{token}\` recolors). 29 multi-color file-type icons ship via \`@polaris/ui/file-icons\`. Logos via \`@polaris/ui/logos\` (\`PolarisLogo\` 3 variants × 2 tones, \`NovaLogo\` 2 tones).

\`@polaris/lint\`'s \`prefer-polaris-icon\` rule (warn) suggests polaris equivalents over \`lucide-react\` named imports.

## Components

![Button spec](assets/figma-spec/components/action-button.png) ![Input spec](assets/figma-spec/components/action-input.png)

The component layer is the \`@polaris/ui\` package — 37 React components built on Radix UI primitives. Tokens in this file describe the **base atoms** (button / card / input / badge); the package contains the full set (Dialog / Tabs / Form / FileCard / Toast / Tooltip / Sidebar / Navbar / Ribbon / etc.).

Reach for the package first. If a primitive is missing, compose with token-only inline styling — never reach for raw hex or styled-components.

For editor / document products, the \`@polaris/ui/ribbon\` subpath ships an Office-style ribbon family (Tabs / Group / Stack / Row / Button / SplitButton / MenuButton / ToggleGroup / Separator / RowDivider). The companion subpath \`@polaris/ui/ribbon-icons\` ships 91 multi-color design-team icons sized for ribbon buttons (57 big × 32 + 34 small × 16); use \`BoldIcon\`/\`PasteIcon\`/\`AiChatIcon\` etc. inside \`RibbonButton\` rather than reaching for \`@polaris/ui/icons\` (which is monochrome and tuned for general UI).

## Do's and Don'ts

- **Do** import from \`@polaris/ui\`, \`@polaris/ui/form\`, \`@polaris/ui/ribbon\`, or \`@polaris/ui/ribbon-icons\` — every component / icon is token-correct out of the box.
- **Do** use the \`label.normal\` / \`layer.surface\` / \`accentBrand.normal\` style aliases. The raw \`neutral.700\` / \`palette-blue\` exist for advanced cases only.
- **Do** pair status colors with their hover variants for any interactive surface (buttons, cells).
- **Do** use \`ai.normal\` (NOVA purple) only inside AI features. Mixing it with \`accentBrand.normal\` on the same screen muddies hierarchy.
- **Don't** introduce raw hex values, \`rgb(...)\`, or named CSS colors — \`@polaris/lint\`'s \`no-hardcoded-color\` blocks them.
- **Don't** use Tailwind arbitrary values (\`bg-[#xxx]\`, \`p-[13px]\`, \`font-['Inter']\`) — the lint rule \`no-arbitrary-tailwind\` blocks them.
- **Don't** write native \`<button>\` / \`<input>\` / \`<dialog>\` in feature code — \`prefer-polaris-component\` requires the Polaris equivalents.
- **Don't** edit this file by hand. Edit \`packages/ui/src/tokens/*.ts\` and run \`pnpm --filter @polaris/ui build:design-md\`.
`;

const final = `${yamlBlock}\n\n${proseBlock}`;

writeFileSync(OUTPUT, final);
console.log(`✓ wrote ${OUTPUT.replace(process.cwd() + '/', '')}`);
