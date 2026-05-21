---
version: alpha
name: Polaris Design System
description: Internal design system for Polaris Office's vibe-coding-ops React/Next.js services. 4-color brand palette + NOVA purple, Pretendard typography, Tailwind 4px spacing baseline, Radix UI primitives.

colors:
  blue-10: "#D9EAFF"
  blue-20: "#BBD8FD"
  blue-30: "#8EBFFC"
  blue-40: "#60A5FA"
  blue-50: "#1D7FF9"
  blue-60: "#186CD3"
  blue-70: "#1458AD"
  blue-80: "#0F4588"
  blue-90: "#0B3263"
  blue-05: "#E8F2FE"
  green-10: "#DCF1D1"
  green-20: "#CAE8BA"
  green-30: "#A8D98D"
  green-40: "#85CA5F"
  green-50: "#51B41B"
  green-60: "#449916"
  green-70: "#387D12"
  green-80: "#2C620E"
  green-90: "#20480A"
  green-05: "#EDF7E8"
  orange-10: "#FDE5C8"
  orange-20: "#FEDBB2"
  orange-30: "#FEC47F"
  orange-40: "#FDAC4C"
  orange-50: "#FD8900"
  orange-60: "#D77400"
  orange-70: "#B05F00"
  orange-80: "#8A4B00"
  orange-90: "#653600"
  orange-05: "#FEF3E5"
  red-10: "#FFE3E3"
  red-20: "#FDCECE"
  red-30: "#FCADAD"
  red-40: "#FA8C8C"
  red-50: "#F95C5C"
  red-60: "#D34E4E"
  red-70: "#AD4040"
  red-80: "#883232"
  red-90: "#632424"
  red-05: "#FEEEEE"
  purple-10: "#EDE5FE"
  purple-20: "#E0D1FF"
  purple-30: "#C6A9FF"
  purple-40: "#9D75EC"
  purple-50: "#6F3AD0"
  purple-60: "#602BC1"
  purple-70: "#511BB2"
  purple-80: "#3E0F8D"
  purple-90: "#20075C"
  purple-05: "#F5F1FD"
  gray-10: "#F7F8F9"
  gray-20: "#F2F4F6"
  gray-30: "#E8EBED"
  gray-40: "#C9CDD2"
  gray-50: "#B3B8BD"
  gray-60: "#9EA4AA"
  gray-70: "#72787F"
  gray-80: "#454C53"
  gray-90: "#26282B"
  primary: "#1D7FF9"
  primary-hover: "#1458AD"
  primary-subtle: "#D9EAFF"
  secondary: "#6F3AD0"
  secondary-hover: "#511BB2"
  secondary-subtle: "#F5F1FD"
  file-docx: "#1D7FF9"
  file-hwp: "#1D7FF9"
  file-xlsx: "#51B41B"
  file-pptx: "#FD8900"
  file-pdf: "#F95C5C"
  state-new: "#FB4949"
  state-success: "#51B41B"
  state-success-bg: "#EDF7E8"
  state-warning: "#FD8900"
  state-warning-bg: "#FEF3E5"
  state-error: "#F95C5C"
  state-error-bg: "#FEEEEE"
  state-info: "#1D7FF9"
  state-info-bg: "#E8F2FE"
  state-success-strong: "#387D12"
  state-warning-strong: "#B05F00"
  state-error-strong: "#AD4040"
  state-info-strong: "#1458AD"
  neutral-0: "#FFFFFF"
  neutral-50: "#FAFAFB"
  neutral-100: "#F4F4F7"
  neutral-200: "#E8E8EE"
  neutral-300: "#D5D5DE"
  neutral-400: "#B5B5C4"
  neutral-500: "#8C8CA0"
  neutral-600: "#6E6E84"
  neutral-700: "#4F4F63"
  neutral-800: "#2F2F40"
  neutral-900: "#1A1A26"
  neutral-1000: "#0B0B12"
  label-normal: "#26282B"
  label-neutral: "#454C53"
  label-alternative: "#72787F"
  label-assistive: "#9EA4AA"
  label-inverse: "#FFFFFF"
  label-disabled: "#C9CDD2"
  background-base: "#FFFFFF"
  background-disabled: "#F2F4F6"
  layer-surface: "#FFFFFF"
  layer-overlay: "rgba(0, 0, 0, 0.5)"
  surface-popover: "#FFFFFF"
  surface-modal: "#FFFFFF"
  fill-neutral: "#F7F8F9"
  fill-normal: "#F2F4F6"
  fill-strong: "#E8EBED"
  line-neutral: "#E8EBED"
  line-normal: "#C9CDD2"
  line-strong: "#B3B8BD"
  line-disabled: "#F2F4F6"
  palette-blue: "#1D7FF9"
  palette-green: "#51B41B"
  palette-orange: "#FD8900"
  palette-red: "#F95C5C"
  palette-purple: "#6F3AD0"

typography:
  display:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.375
  heading1:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.429
  heading2:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.417
  heading3:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.4
  heading4:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.444
  body1:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body2:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body3:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.538
  caption1:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.333
  caption2:
    fontFamily: "\"Pretendard Variable\", Pretendard, -apple-system, BlinkMacSystemFont, \"Apple SD Gothic Neo\", \"Malgun Gothic\", system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.273

rounded:
  2xs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 38px
  pill: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  gutter: 24px

components:
  button-primary:
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
    padding: 4px
---

# Polaris Design System

> **Auto-generated.** This file is produced by `packages/ui/scripts/build-design-md.ts` from `packages/ui/src/tokens/*.ts`. Edit those source modules instead — CI fails on drift.
>
> The spec follows the [Stitch DESIGN.md format](https://stitch.withgoogle.com/docs/design-md/specification/) so any agent or tool that consumes the format (Stitch, Figma Tokens Studio, Style Dictionary downstream) can use Polaris's tokens directly.

## Overview

Polaris is the design system shared across Polaris Office's vibe-coding-ops services — services that LLMs help generate. The system's promise is **token-first, anti-bypass**: model output is constrained by tokens, components, and lint rules so screens stay visually consistent across every service in the company.

The tone is calm and professional with a 4-color brand identity (blue / green / orange / red — same palette the Polaris Office logo uses) plus a single NOVA purple reserved for AI / generative contexts. Documents always feel like Polaris.

## Colors

![Color spec](assets/figma-spec/foundation/color.png)

The palette is rooted in Polaris's 4-color brand identity. Each base color doubles as its file-type signal (DOCX = blue, XLSX = green, PPTX = orange, PDF = red). A NOVA purple is reserved for AI features.

- **Primary (Polaris Blue, #1D7FF9):** Headlines of action — buttons, links, focus, active nav. Same hex as `fileType.docx`. Token: `accentBrand.normal`.
- **Secondary (NOVA Purple, #6F3AD0):** AI / generative contexts only. Pairs with sparkle iconography. Never mix primary and secondary on the same screen — pick by context. Token: `ai.normal`.
- **State (success / warning / error / info):** Reserved for system feedback. Each has a `Bg` tint for banners + a `Strong` tier for body-size text.
- **Neutral (12 steps, 0 → 1000):** Light/dark inverted by `data-theme`. `background.base` (page bg), `layer.surface` (cards/modals), `label.normal` / `label.neutral` / `label.alternative` are the everyday aliases; reach for those before the raw scale.

Do not mix file-type colors as decorative accents — they carry semantic meaning (document type signals).

## Typography

![Typography spec](assets/figma-spec/foundation/typography.png)

Pretendard Variable for both display and body. Korean / Latin / numerals all use the same family. JetBrains Mono for code.

Eleven named levels (v0.8 spec): `display` (40), `title` (32), `heading1` (28), `heading2` (24), `heading3` (20), `heading4` (18) for heading hierarchy, `body1` (16), `body2` (14), `body3` (13) for paragraph copy, `caption1` (12), `caption2` (11) for labels and chrome. All headings + captions are weight 700 (Bold). Body is weight 400 (Regular).

(v0.7 rc.0 / v0.6 aliases — `h1`-`h5`, `body`, `detail`, `meta`, `tiny`, `display-lg`, `heading-lg`, `body-lg`, `caption` — were removed in v0.8. Run `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` to migrate.)

Line-heights: 1.4 headings, 1.5 body, 1.3 captions. NO letter-spacing — Pretendard's optical metrics are calibrated at the typeface level.

Mobile (≤ 767px): every level shifts down one step (Display 40→32, Title 32→28, etc.). Body3 / Caption1 / Caption2 unchanged. Auto-applied via media query in `tokens.css`.

Use `text-polaris-*` Tailwind utilities — never inline `font-family` or arbitrary `text-[14px]`. The lint rule `no-direct-font-family` blocks both.

## Layout

![Grid spec](assets/figma-spec/foundation/grid.png)

4px base scale, Tailwind defaults. Container widths cap at 1200px (xl). Mobile-first; `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`, `2xl: 1536`.

No semantic spacing tokens (e.g., `spacing.gutter`, `spacing.section-y`) — Tailwind's numeric scale is already the standard, and abstracting on top of it raises the bar without payoff. Arbitrary values like `p-[13px]` are blocked by lint.

## Elevation & Depth

Four shadow levels for light mode (`xs`, `sm`, `md`, `lg`) plus a darker dark-mode pair. The `shadow-polaris-*` Tailwind utilities pick the right pair via `data-theme`. Use `xs` for hover lifts, `sm` for cards, `md` for menus / toasts, `lg` for modals.

In dark mode, shadows alone don't carry hierarchy — pair with `layer.surface` tonal layers (cards sit on a slightly lighter surface than the page background).

## Shapes

![Radius spec](assets/figma-spec/foundation/radius.png)

Eight radius levels (v0.8 spec): `2xs` (2) / `xs` (4) / `sm` (8) / `md` (12) / `lg` (16) / `xl` (24) / `2xl` (38) / `pill` (9999). Inputs use `sm` (8px). Buttons / cards / modals default to `md` (12px). Large CTAs use `lg` (16px), emphasis modals `xl` (24px), bottom sheets `2xl` (38px). `pill` for pills / avatars / switch thumbs. (The v0.7 `full` alias was removed in v0.8 — codemod-v08 rewrites it.)

Avoid mixing rounded and sharp corners in the same component. Don't introduce new `px` values — extend the scale instead.

## Iconography

![Iconography spec](assets/figma-spec/theme/iconography.png)

65 monochrome UI icons × 3 sizes (18 / 24 / 32 px) ship via `@polaris/ui/icons` — each component renders the design-team SVG and accepts `size` (number) + `className` (Tailwind `text-{token}` recolors). 29 multi-color file-type icons ship via `@polaris/ui/file-icons`. Logos via `@polaris/ui/logos` (`PolarisLogo` 3 variants × 2 tones, `NovaLogo` 2 tones).

`@polaris/lint`'s `prefer-polaris-icon` rule (warn) suggests polaris equivalents over `lucide-react` named imports.

## Components

![Button spec](assets/figma-spec/components/action-button.png) ![Input spec](assets/figma-spec/components/action-input.png)

The component layer is the `@polaris/ui` package — 37 React components built on Radix UI primitives. Tokens in this file describe the **base atoms** (button / card / input / badge); the package contains the full set (Dialog / Tabs / Form / FileCard / Toast / Tooltip / Sidebar / Navbar / Ribbon / etc.).

Reach for the package first. If a primitive is missing, compose with token-only inline styling — never reach for raw hex or styled-components.

For editor / document products, the `@polaris/ui/ribbon` subpath ships an Office-style ribbon family (Tabs / Group / Stack / Row / Button / SplitButton / MenuButton / ToggleGroup / Separator / RowDivider). The companion subpath `@polaris/ui/ribbon-icons` ships 91 multi-color design-team icons sized for ribbon buttons (57 big × 32 + 34 small × 16); use `BoldIcon`/`PasteIcon`/`AiChatIcon` etc. inside `RibbonButton` rather than reaching for `@polaris/ui/icons` (which is monochrome and tuned for general UI).

## Do's and Don'ts

- **Do** import from `@polaris/ui`, `@polaris/ui/form`, `@polaris/ui/ribbon`, or `@polaris/ui/ribbon-icons` — every component / icon is token-correct out of the box.
- **Do** use the `label.normal` / `layer.surface` / `accentBrand.normal` style aliases. The raw `neutral.700` / `palette-blue` exist for advanced cases only.
- **Do** pair status colors with their hover variants for any interactive surface (buttons, cells).
- **Do** use `ai.normal` (NOVA purple) only inside AI features. Mixing it with `accentBrand.normal` on the same screen muddies hierarchy.
- **Don't** introduce raw hex values, `rgb(...)`, or named CSS colors — `@polaris/lint`'s `no-hardcoded-color` blocks them.
- **Don't** use Tailwind arbitrary values (`bg-[#xxx]`, `p-[13px]`, `font-['Inter']`) — the lint rule `no-arbitrary-tailwind` blocks them.
- **Don't** write native `<button>` / `<input>` / `<dialog>` in feature code — `prefer-polaris-component` requires the Polaris equivalents.
- **Don't** edit this file by hand. Edit `packages/ui/src/tokens/*.ts` and run `pnpm --filter @polaris/ui build:design-md`.
