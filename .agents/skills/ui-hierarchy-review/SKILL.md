---
name: ui-hierarchy-review
description: Use whenever Codex creates, edits, refactors, or reviews UI/frontend screens, components, layouts, CSS, design-system usage, visual polish, responsive states, or Figma-to-code work. Requires a UI/UX designer pass focused on visual hierarchy, information architecture, interaction priority, accessibility, responsive density, and evidence before finalizing UI changes. Trigger for Korean prompts about UI, UX, design, or hierarchy/wigye.
---

# UI Hierarchy Review

Use this skill as a design gate whenever UI is being touched. Pair it with the repo's existing frontend/design-system skills and rules; in Polaris projects, keep `@polaris/ui`, semantic tokens, and the Polaris brand rules as the implementation source of truth.

## Workflow

1. State the screen's job in one sentence before editing: target user, primary task, and the moment in the workflow.
2. Identify the hierarchy: primary content/action, secondary support, tertiary metadata, and anything that should recede or disappear.
3. Inspect every affected surface: page, component, responsive breakpoint, loading state, empty state, error state, success state, disabled state, hover/focus state, and dark mode when supported.
4. Implement or request the smallest change that improves hierarchy while staying consistent with the local design system.
5. Verify visually before reporting done. Prefer live browser or screenshot checks across desktop and mobile when the app can run.

## Hierarchy Checklist

- Information architecture: the user can tell what the screen is, what changed, and what to do next within a few seconds.
- Layout: alignment, spacing, grouping, density, and reading order guide the eye from the primary task to supporting details.
- Typography: heading levels are semantic and visually distinct; compact panels avoid hero-scale text; labels, captions, and body copy have clear roles.
- Action priority: primary CTA is obvious, secondary actions are available but quieter, destructive actions are restrained, and repeated controls are predictable.
- Color and contrast: color reinforces hierarchy without becoming the only signal; status colors include text or icons; brand and AI accents are used sparingly and intentionally.
- Component choice: use established components and tokens first; avoid custom primitives when the design system already provides an accessible pattern.
- Responsive behavior: content reflows without overlap, clipped labels, cramped hit targets, or reordered actions that break the task flow.
- Accessibility: focus states, labels, landmarks, keyboard order, contrast, and reduced-motion behavior remain intact.

## Review Output

When reviewing or finishing UI work, include a short `UI hierarchy pass` note only when meaningful:

- What was strengthened in the hierarchy.
- What evidence was checked, such as screenshot, browser viewport, or visual scan.
- Any remaining hierarchy risk, especially if visual verification could not run.

Do not call UI work complete if the primary task is visually ambiguous, text overlaps, controls compete for attention, or the responsive view is unverified.
