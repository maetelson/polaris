# `@polaris/ui` — 컴포넌트 카탈로그

> **AUTO-GENERATED** — `pnpm --filter @polaris/ui build:component-catalog` 또는 매 `pnpm build` 시 자동 갱신. 본문 직접 수정 금지 — `packages/ui/src/components/*.tsx` 의 JSDoc 또는 `components/index.ts` 의 Tier 주석을 수정하세요.

현재 45 family export. 자세한 spec / variant axis 는 [`/DESIGN.md`](../../DESIGN.md) §4 참조.

---

## Tier 0 — basic blocks

| Component | 설명 |
|---|---|
| `<Button>` | Button — v0.7-rc.1 spec (DESIGN.md §4). |
| `<Input>` | Floating title — appears as a small label inside the input on focus or when the field has a value. |
| `<Textarea>` | Auto-resize the textarea to fit its content (between `minRows` and `maxRows`). |
| `<Card>` | Render the child element instead of a `<div>` (Radix Slot pattern). |
| `<Badge>` | Tinted background + colored text. |
| `<Avatar>` | Maximum visible avatars before collapsing into `+N`. |
| `<Dialog>` | Dialog — v0.7-rc.1 spec (DESIGN.md §4 "Modals & Dialogs"). |
| `<Toast>` | Anchor position. |
| `<Tabs>` | Tabs — Radix-backed tab group. |
| `<FileIcon>` | FileIcon — dispatches to the correct file-type SVG from the design team's icon set. |
| `<FileCard>` | File type — drives the FileIcon color (file.docx, file.xlsx, etc.). |
| `<NovaInput>` | Called when the user presses Enter or clicks the send button. |
| `<DropdownMenu>` | Render the item with status-danger color (for delete / destructive actions). |
| `<Tooltip>` | Convenience: standalone Tooltip with text content. |
| `<Select>` | — |
| `<Sidebar>` | Collapse to icon-only mode (4rem wide). |
| `<Navbar>` | Render the child element instead of `<div>`. |
| `<PromptChip>` | Optional icon shown at the start (typically a lucide icon at h-4 w-4). |

## Tier 2

| Component | 설명 |
|---|---|
| `<Checkbox>` | Checkbox visual variants. |
| `<Switch>` | Visible label rendered to the right of the switch. |
| `<Skeleton>` | Shape preset. |
| `<Alert>` | Hide the leading icon. |
| `<Pagination>` | Current page indicator. |
| `<Breadcrumb>` | — |
| `<EmptyState>` | Leading icon. |

## Tier 2.5 — layout / structural

| Component | 설명 |
|---|---|
| `<Stack>` | `column` (default) — stacks vertically. |
| `<Container>` | Max width. |
| `<Drawer>` | Side-anchored panel built on Radix Dialog. |
| `<Table>` | Polaris table primitive — semantic `<table>` with token-driven styling and a `density` axis. |
| `<DescriptionList>` | `inline` (default) — `<dt>`/`<dd>` pair on the same row above `sm`, auto-stacks on narrow viewports to prevent label/value squeeze. |

## Tier 3 — Date / Command / Popover (v0.4)

| Component | 설명 |
|---|---|
| `<Popover>` | — |
| `<Calendar>` | — |
| `<DatePicker>` | — |
| `<Command>` | — |

## Tier 3.5 — feedback / utility (v0.7.4)

| Component | 설명 |
|---|---|
| `<Progress>` | Progress — linear progress bar. |
| `<CopyButton>` | CopyButton — copies a string to the clipboard with a transient "copied" affordance. |
| `<Stat>` | Stat — KPI / metric tile. |
| `<Disclosure>` | Disclosure — single show/hide section, built on Radix Collapsible. |

## Tier 3.6 — file / time inputs (v0.7.5)

| Component | 설명 |
|---|---|
| `<FileInput>` | Visible label rendered above the trigger. |
| `<DateTimeInput>` | Floating-style label rendered above the input. |

## Tier 3.7 — Table helpers (toolbar / selection bar / skeleton, v0.7.5)

| Component | 설명 |
|---|---|
| `<TableHelpers>` | **Controlled mode** — current search value. |

## Tier 3.8 — page layout + extra primitives (v0.7.7)

| Component | 설명 |
|---|---|
| `<PageHeader>` | Page title. |
| `<CircularProgress>` | CircularProgress — radial progress indicator. |
| `<Accordion>` | Accordion — multi-item disclosure group. |
| `<Combobox>` | Optional description rendered below the label in the popover. |

---

## Subpath imports

루트 barrel 외에 다음 subpath 가 9개 운영 중입니다:

| Subpath | 내용 | server-safe? |
|---|---|---|
| `@polaris/ui` (root) | 모든 컴포넌트 + 토큰 + `cn` | client (use client) |
| `@polaris/ui/tokens` | 토큰 객체 (`label`, `accentBrand`, …) | ✓ server-safe |
| `@polaris/ui/tailwind` | Tailwind preset | ✓ server-safe |
| `@polaris/ui/utils` | 순수 함수 (`pageNumberItems`, …) — v0.8.0-rc.8 신규 | ✓ server-safe |
| `@polaris/ui/form` | `<Form>` + react-hook-form 통합 | client |
| `@polaris/ui/ribbon` | Ribbon family (25+ subcomponents) | client |
| `@polaris/ui/icons` | 65 UI 아이콘 (18/24/32 px) | client |
| `@polaris/ui/file-icons` | 29 파일 타입 SVG | client |
| `@polaris/ui/logos` | PolarisLogo + NovaLogo | client |
| `@polaris/ui/ribbon-icons` | 91 ribbon-icons (57 big × 32 + 34 small × 16) | client |

RSC 환경 사용 시 server-safe subpath 우선. 자세히 → [`/docs/for-consumers/migration/rsc-patterns.md`](../../docs/for-consumers/migration/rsc-patterns.md).
