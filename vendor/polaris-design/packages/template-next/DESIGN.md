---
version: alpha
name: My Polaris App
description: Replace this template with the actual product spec. Inherits Polaris's system tokens; overrides only what's product-specific.

# Most products inherit Polaris's color palette as-is. Override only the
# tokens that are genuinely product-specific (e.g., a single domain
# accent color for status pills your product uses everywhere).
#
# Polaris's full color set lives in the root /DESIGN.md — reference it
# from your prose ("uses Polaris primary") rather than duplicating
# every value here.
colors:
  accent-brand-normal: "{polaris.colors.accent-brand-normal}"   # Polaris blue (was rc.0 `primary`)
  ai-normal: "{polaris.colors.ai-normal}"                       # NOVA purple (only if your product has AI features)
  background-base: "{polaris.colors.background-base}"           # page bg (was v0.7 alias `surface-canvas`)
  layer-surface: "{polaris.colors.layer-surface}"               # raised cards/dialogs (was `surface-raised`)
  label-normal: "{polaris.colors.label-normal}"                 # primary text (was `text-primary`)
  # Add product-specific accents below if needed:
  # contract-active: "#16A34A"   # state.success
  # contract-warning: "#EAB308"  # state.warning

# Most products use Polaris's full typography scale unchanged. List the
# levels your product actually uses; the rest are still available via
# the @polaris/ui Tailwind preset. v0.8 spec names — see /DESIGN.md §3.
typography:
  display: "{polaris.typography.display}"     # 40 / Bold (was rc.0 `display-lg`)
  title: "{polaris.typography.title}"         # 32 / Bold (was `display-md`)
  heading2: "{polaris.typography.heading2}"   # 24 / Bold (was `heading-lg`)
  heading3: "{polaris.typography.heading3}"   # 20 / Bold (was `heading-md`)
  body1: "{polaris.typography.body1}"         # 16 / Regular (was `body-lg`)
  body2: "{polaris.typography.body2}"         # 14 / Regular (was `body-sm`)
  caption1: "{polaris.typography.caption1}"   # 12 / Bold (was bare `caption`)

# Polaris's radius scale unchanged in 95% of cases.
rounded:
  sm: "{polaris.rounded.sm}"
  md: "{polaris.rounded.md}"
  lg: "{polaris.rounded.lg}"
  xl: "{polaris.rounded.xl}"
  pill: "{polaris.rounded.pill}"             # circular avatar / chip (was v0.7 alias `full`)

spacing:
  xs: "{polaris.spacing.xs}"
  sm: "{polaris.spacing.sm}"
  md: "{polaris.spacing.md}"
  lg: "{polaris.spacing.lg}"
  xl: "{polaris.spacing.xl}"
  gutter: "{polaris.spacing.gutter}"

# Define product-specific composite components here. Atoms (button /
# card / input / badge) are already defined in Polaris's DESIGN.md —
# no need to redefine them.
components:
  # Example: a contract status pill specific to this product
  # contract-status-pill:
  #   backgroundColor: "{colors.contract-active}"
  #   textColor: "{colors.label-inverse}"     # v0.8: was `text-on-brand` in v0.7
  #   rounded: "{rounded.pill}"               # v0.8: was `rounded.full` in v0.7
  #   padding: 4px
---

# My Polaris App — Design Spec

> This file is the **product-level** design spec. It inherits the
> [Polaris design system](../../DESIGN.md) (system-level tokens +
> primitive components) and adds anything specific to this product.
>
> Edit this file by hand — it is **not** auto-generated.
> Reference Polaris tokens with `{polaris.<group>.<name>}`. Define
> only what's genuinely product-specific.

## Overview

Replace this section with a one-paragraph description of the product.

What is the product? Who uses it? What's the dominant tone — calm /
energetic / dense / spacious? What problem does it solve in the Polaris
ecosystem?

> **Example for the Polaris CRM product:**
> Polaris 영업관리 is a B2B contract management dashboard. Sales reps and
> approvers spend 4+ hours/day in the app — density and quick scanning
> matter more than visual flair. Tone is professional but warm; the layout
> uses Polaris's standard cards and tables, with a single accent color
> (status.success / warning / danger) for contract states.

## Colors

Inherits Polaris's full palette. Add product-specific notes here:

- The product's primary action is **contract approval** — uses
  `{polaris.colors.accent-brand-normal}` (Polaris blue) for the approve
  button on every contract detail page.
- Contract states map to Polaris state colors: 진행중 → `state.info`,
  완료 → `state.success`, 만료 → `state.error`, 결재 대기 → `state.warning`.
  (v0.8 renamed `status.danger` → `state.error`.)
- No new color tokens introduced in this product.

## Typography

Inherits Polaris's 11-level scale (v0.8 spec). The product uses:

- `title` for page titles (e.g., "계약 상세")
- `heading2` / `heading3` for sections (e.g., "결재선", "첨부 파일")
- `body1` / `body2` for content
- `caption1` for metadata (작성일, 결재자, 파일 크기)

## Layout

Polaris's 4px Tailwind base. Product-specific decisions:

- Contract detail page uses a 3-column grid on desktop (`lg:grid-cols-3`):
  main content (2 cols) + side panel (1 col, sticky).
- Mobile collapses to single column with a tab nav.
- Maximum content width: 1200px (Polaris `container.xl`).

## Components

Inherits all Polaris primitives. Product-specific composite components:

- **ContractStatusPill** — wraps `<Badge tone="success|warning|error|info">`
  with consistent contract state mapping. Avoids each page deciding
  state-to-tone mapping ad hoc. (v0.8: Badge uses `tone`, and `danger` →
  `error`.)
- **ApprovalLine** — vertical timeline of approvers using `<Card>` +
  `<Avatar>` + `<Badge>`. Reused on contract detail / approval inbox /
  notification email previews.

## Do's and Don'ts

- **Do** import Polaris atoms from `@polaris/ui`. Custom components live
  in this product's `components/` directory and document themselves
  here.
- **Do** reuse `ContractStatusPill` and `ApprovalLine` everywhere a
  contract state or approver list appears.
- **Don't** introduce new colors outside Polaris's palette. If a need
  emerges, raise it for inclusion in Polaris itself rather than forking.
- **Don't** override Polaris primitives (Button, Card, etc.) — wrap or
  compose. Style customization belongs in this product's component
  layer, not in Polaris's.
