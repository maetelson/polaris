---
name: polaris-web
description: Use when creating, editing, or adding features to a Polaris Office web service (React/Next.js apps generated via 바이브코딩옵스). Enforces consistent design via @polaris/ui tokens and components.
---

# Polaris Web Service Skill

You are working on a Polaris Office web service. Apply these rules without asking — they are mandatory, not preferences. The PostToolUse hook will catch violations after each edit.

## Procedure

### 1. New / existing project
- **New project**: run `/polaris-init <name>` first — bootstraps a Next.js 15 app from `template-next` with everything pre-wired. Do not write feature code before scaffolding completes.
- **Existing project that's not yet polaris-compliant**: run `/polaris-migrate` instead — it walks through audit → eslint --fix → page-by-page conversion → enforce. Don't try to write new polaris-compliant code on top of unmigrated code; migrate first.

### 2. UI elements (in order of preference)
1. Import from `@polaris/ui`. Available components:
   ```ts
   import {
     // Tier 0 — basic blocks
     Button, Input, Textarea, Card, Badge, Avatar, Dialog, Toast, Tabs,
     FileIcon, FileCard, NovaInput,
     // Tier 1 — shell + menus
     DropdownMenu, Tooltip, Select, Sidebar, Navbar, PromptChip,
     // Tier 2 — auxiliary UI
     Checkbox, Switch, Skeleton, Alert, Pagination, Breadcrumb, EmptyState,
     // Tier 2.5 — layout / structural
     Stack, Container, Drawer, Table, DescriptionList,
     // Tier 3 — date / overlay / command (Calendar·Command are experimental — APIs may change)
     Popover, PopoverTrigger, PopoverContent,
     Calendar, DatePicker, DateRangePicker,
     CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem,
     // Tier 3.5 — feedback / utility (v0.7.4)
     Progress, CopyButton, Stat, Disclosure,
     // Tier 3.6 — file / time inputs + pagination wrapper (v0.7.5)
     FileInput, FileDropZone,
     DateTimeInput, TimeInput,
     PaginationFooter,
     // Tier 3.7 — Table helpers (v0.7.5)
     TableSearchInput, TableToolbar, TableSelectionBar, TableSkeleton,
     // Tier 3.8 — page layout + extras (v0.7.7)
     PageHeader, SectionHeader,
     CircularProgress,
     Accordion, AccordionItem, AccordionTrigger, AccordionContent,
     Combobox,
     // v0.7.6 — AvatarGroup 신규 (props 추가는 기존 컴포넌트에)
     AvatarGroup,
     // Server-action friendly (Next.js App Router)
     DropdownMenuFormItem,
     // Toast imperative API (call toast({...}) anywhere; mount <Toaster /> once)
     Toaster, useToast, toast,
   } from '@polaris/ui';
   ```
2. If a needed component doesn't exist in `@polaris/ui`, build it inline using ONLY Polaris tokens (rule 3). Don't bring in shadcn/Radix/MUI directly.

   **Don't roll your own when these exist** (frequently re-implemented by mistake):
   - **Inline / HStack / `justify="between"` row** → `<Stack direction="row" justify="between" align="center">`. The v0.7-era `<HStack>` / `<VStack>` exports were removed in v0.8 — there is one `<Stack>`, you pick `direction` (default column).
   - **Card with header/footer slots** → use `bare` Card + `<CardHeader>`/`<CardTitle>`/`<CardDescription>`/`<CardBody>`/`<CardFooter>` slots (already exported).
   - **Helper text / description below input** → `<Input helperText="…" error="…" />`. As of v0.8 the prop is `helperText` across every form component (Input/Textarea/Switch/Checkbox/FileInput/FileDropZone/DateTimeInput/TimeInput); the v0.7 `hint` alias was renamed for HTML-spec consistency.
   - **Toast imperative call** → `import { toast } from '@polaris/ui'; toast({ title, description, variant })`. Mount `<Toaster />` once.
   - **EmptyState CTA button** → `<EmptyState action={<Button>…</Button>} />`.
   - **Dropdown item that submits a form / server action** → `<DropdownMenuFormItem action={signOut} destructive>` (avoids Radix unmount-before-submit race).
   - **Collapsible / Disclosure with chevron rotation** → `<Disclosure title="…">…</Disclosure>` (compound: `DisclosureRoot/Trigger/Content`). Don't roll your own `<details>` + CSS.
   - **Copy-to-clipboard button with success feedback** → `<CopyButton text={…} />` (clipboard API + 1.5s success state + ARIA live).
   - **Linear progress bar** → `<Progress value={…} />` for determinate, `<Progress />` for indeterminate. ARIA + `prefers-reduced-motion` baked in.
   - **KPI tile (label / value / delta)** → `<Card variant="padded"><Stat label="조회수" value="1,234" delta="+12%" deltaVariant="positive" /></Card>`. As of v0.8 the prop is `deltaVariant` (was `deltaTone` in v0.7).
   - **Custom interactive element's focus ring** → `focus-visible:shadow-polaris-focus` (3px system focus ring, light/dark auto). Don't hand-write `box-shadow: 0 0 0 3px ...`.
   - **Page numbers + page-size selector + total indicator** → `<PaginationFooter page={...} pageSize={...} total={...} onPageChange={...} onPageSizeChange={...} />`. Don't compose `<Pagination>` + `<Select>` + manual "X-Y of N" by hand.
   - **Sortable column header** → `<TableHead sortable sortDirection={dir} onSortChange={setDir}>이름</TableHead>` — `aria-sort` + chevron auto-synced. Don't roll your own button/icon inside `<TableHead>`.
   - **File picker** → `<FileInput>` (button trigger) for simple, `<FileDropZone>` (drag-and-drop) for richer UX. Both share `onFilesChange` shape, both handle `accept`/`maxSize`. Don't style `::file-selector-button` by hand.
   - **datetime / time-of-day picker** → `<DateTimeInput>` / `<TimeInput>` (native input wrapper, mobile-OS picker auto). Use `<DatePicker>` only when you need a calendar grid. Don't roll your own datetime UI.
   - **Passive status badge** ("비활성", "초안", "정책 위반") → `<Badge tone="outline">` — sits between `subtle` (can disappear) and `solid` (demands attention).
   - **Layered elevation in dark mode** (popover-on-card, modal-on-popover) → `bg-surface-popover` / `bg-surface-modal` (v0.7.5 new tiers). Don't `color-mix()` your way around `surface.raised`.
   - **Page heading row** (title + description + breadcrumb + actions) → `<PageHeader>`; section heading inside a page → `<SectionHeader>`. Both have eyebrow / actions slots and consistent type sizes — don't roll your own h1+description+button row.
   - **Searchable Select with > ~15 options** → `<Combobox>` (cmdk-backed). `<Select>` stays for short option lists (≤ ~10). `<Combobox multiple>` for tag-chip multi-select.
   - **Grouped show/hide (FAQ, settings groups)** → `<Accordion type="single|multiple">`. `<Disclosure>` is the *single* show/hide primitive — Accordion handles groups with arrow-key nav.
   - **Underline-style page tabs** → `<TabsList variant="underline">`. Default `pill` is for in-card segmented controls; `underline` for page navigation.
   - **Inline / compact spinner** → `<CircularProgress />` (radial, 4 sizes, indeterminate by default). Use `<Progress>` for full-width upload bars, `<CircularProgress>` for status chips / async cards / "동기화 중 47%" inline.
   - **Multi-line / auto-expanding textarea** → `<Textarea autoResize maxLength={N} showCount>`. Don't watch `scrollHeight` by hand.
   - **Currency / search / unit inputs** → `<Input prefix="₩" suffix="KRW" clearable />`. Don't compose icon + input in a flex row by hand.
   - **Form-toggle Switch with label** → `<Switch label="…" helperText="…" error="…" />`. Mirrors Checkbox API. (v0.8: was `hint`.)
   - **Filter / removable chip** → `<Badge dismissible icon={<i/>} onDismiss={...}>`.
   - **Alert with retry CTA / dismiss** → `<Alert action={<Button>재시도</Button>} dismissible onDismiss={...}>`.
   - **Multi-line / circular skeleton** → `<Skeleton shape="text" lines={3} />` / `<Skeleton shape="circle" className="h-10 w-10" />`. Don't stack divs by hand.
   - **Avatar cluster + +N overflow** → `<AvatarGroup max={4}>...</AvatarGroup>`. size auto-propagates to children.
   - **Stat tile loading** → `<Stat label="…" value={n} loading />` (Skeleton placeholder, 타일 높이 stable).
   - **Button leading/trailing icon** → `<Button iconLeft={<PlusIcon />} iconRight={<ChevronRightIcon />}>`. `<Button fullWidth>` for form CTAs.
   - **Clickable card surface** → `<Card interactive asChild><Link>...</Link></Card>` (hover shadow + focus ring).
   - **DropdownMenuItem with icon** → `<DropdownMenuItem icon={<EditIcon />}>수정</DropdownMenuItem>`.
   - **Selected/clickable table row** → `<TableRow selected clickable onClick={...}>`.
   - **Toast default duration** → `<Toaster defaultDuration={5000} />` once at app root.
   - **Navbar nav links with active state** → `<NavbarItem active={pathname.startsWith('/docs')} asChild><Link href="/docs">문서</Link></NavbarItem>`. Don't render raw `<a>` with hand-written `bg-accent-brand-normal-subtle text-accent-brand-normal` className — `NavbarItem` mirrors `<SidebarItem>`'s API (active/asChild/icon/href) so navbar/sidebar feel symmetric. Active matching (exact vs prefix) stays the consumer's call so we don't couple to a specific router.
   - **KPI grid (3-4 stat tiles equal heights)** → `<StatGroup cols={4}><Stat .../><Stat .../></StatGroup>`. Auto-wraps each Stat in a `<Card variant="padded" h-full>` so helper-text-having tiles align with helper-less tiles. Don't write `grid grid-cols-4 gap-4` + `<Card>` 4 times by hand.
   - **Numeric Stat value** → pass `value={1234567}` (number) directly. `Intl.NumberFormat` runs automatically with the user locale. Currency: `numberFormat={{ style: 'currency', currency: 'KRW' }}`. Don't pre-format the string unless you need a non-locale presentation.
   - **Heading-list-navigable Disclosure (FAQ / settings groups)** → `<Disclosure title="..." headingLevel="h2">`. Without `headingLevel` the trigger is just a button — screen-reader users can't navigate via the H key. Use h2/h3/etc. matching the surrounding heading hierarchy.
   - **TableCell with single-line content (date / amount / id columns)** → `<TableCell nowrap>`. Don't add `className="whitespace-nowrap"` everywhere.
   - **Hide page-size selector in PaginationFooter** → `<PaginationFooter showPageSize={false}>` (explicit). Don't use `pageSizeOptions={undefined}` — that reads like "no options" rather than "hide".
   - **DatePicker in a `<form action={...}>` server action** → `<DatePicker name="expiry" required />`. Renders a hidden `<input>` with `yyyy-MM-dd` so server actions / FormData get the value. Override format with `valueFormat="yyyyMMdd"` when needed. Don't wrap DatePicker in a 50-line ExpiryDateField helper.
   - **Data-table chrome** (search bar, filter chips, "+ 추가") → `<TableToolbar>` with `search`/`onSearchChange` + `chips`/`activeChip`/`onChipChange` + `actions` slot. Don't compose Search input + filter chips by hand.
   - **Bulk-action bar when rows selected** → `<TableSelectionBar count={...} onCancel={...} actions={...} />` *in place of* the toolbar (conditional render). Don't roll your own brand-tinted strip.
   - **Async-loading table placeholder** → `<TableSkeleton rows={5} columns={4} />` (ARIA `aria-busy=true` + Skeleton shimmer). Don't manually render a `<Table>` of `<Skeleton>` cells.
   - **Row-level ⋯ menu / row selection / empty state inside table** → no new component needed; compose `<DropdownMenu>` in last `<TableCell>` / `<Checkbox>` in first cell / `<EmptyState>` inside `<TableCell colSpan>`. Patterns documented in the @polaris/ui README cookbook.

   **Subpath imports** — keep root barrel light:
   ```ts
   // Forms with react-hook-form + zod
   import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@polaris/ui/form';

   // Editor / document toolbars (Office ribbon, MD editor, spreadsheet, PDF, …)
   import {
     Ribbon, RibbonTabs, RibbonTabList, RibbonTab, RibbonContent,
     RibbonGroup, RibbonStack, RibbonRow, RibbonRowDivider,
     RibbonSeparator,
     RibbonButton, RibbonSplitButton, RibbonMenuButton,
     RibbonToggleGroup, RibbonToggleItem,
   } from '@polaris/ui/ribbon';

   // v0.7 — Design-team SVG assets (65 UI icons + 29 file-type + logos + 91 ribbon)
   import { ArrowDownIcon, ChevronRightIcon, SearchIcon } from '@polaris/ui/icons';
   import { DocxIcon, FolderIcon, ZipIcon } from '@polaris/ui/file-icons';
   import { PolarisLogo, NovaLogo } from '@polaris/ui/logos';
   // Ribbon-only icons (multi-color, native 16/32; for use INSIDE Ribbon buttons):
   import { BoldIcon, PasteIcon, AiChatIcon } from '@polaris/ui/ribbon-icons';
   ```
3. Native `<button>`, `<input>`, `<textarea>`, `<select>`, `<dialog>` are forbidden in feature code — the lint rule `@polaris/prefer-polaris-component` blocks them. (They're allowed inside `@polaris/ui` itself.)

### 3. Colors — the most common violation (v0.7 spec names)

**Always reach for v0.7 semantic tokens first.** They are organized by role and auto-switch in dark mode.

| Role | Tailwind class | Token |
|---|---|---|
| 1차 텍스트 | `text-label-normal` | `label.normal` |
| 보조 텍스트 | `text-label-neutral` | `label.neutral` |
| 캡션 | `text-label-alternative` | `label.alternative` |
| Placeholder | `text-label-assistive` | `label.assistive` |
| 반전 텍스트 | `text-label-inverse` | `label.inverse` |
| 비활성 텍스트 | `text-label-disabled` | `label.disabled` |
| 페이지 배경 | `bg-background-base` | `background.base` |
| 비활성 배경 | `bg-background-disabled` | `background.disabled` |
| Card / Dialog surface | `bg-layer-surface` | `layer.surface` |
| Modal dim | `bg-layer-overlay` | `layer.overlay` |
| Hover surface | `bg-interaction-hover` | `interaction.hover` |
| Pressed surface | `bg-interaction-pressed` | `interaction.pressed` |
| 약한 보더 | `border-line-neutral` | `line.neutral` |
| 일반 보더 | `border-line-normal` | `line.normal` |
| 강조 보더 | `border-line-strong` | `line.strong` |
| Brand 강조 (CTA) | `bg-accent-brand-normal` / `text-accent-brand-normal` | `accentBrand.normal` |
| Brand hover | `bg-accent-brand-strong` | `accentBrand.strong` |
| Brand 틴트 (Secondary 버튼) | `bg-accent-brand-bg` | `accentBrand.bg` |
| Black 버튼 | `bg-accent-action-normal text-static-white` | `accentAction.normal` |
| 포커스 ring | `ring-focus-ring` | `focus.ring` |
| 항상 흰색/검정 (모드 무관) | `bg-static-white` / `bg-static-black` | `staticColors.white/black` |
| 성공 텍스트 / 아이콘 | `text-state-success` (+ icon!) | `state.success` |
| 성공 배너 배경 | `bg-state-success-bg` | `state.successBg` |
| 경고 / 에러 / 정보 | `state-warning` / `-error` / `-info` (+ `-bg`) | `state.*` |
| 신규 알림 dot | `bg-state-new` | `state.new` |
| AI / NOVA | `bg-ai-normal text-label-inverse` (+ `shadow-polaris-ai`) | `ai.normal` |

**TS imports**:
```ts
import { label, background, layer, fill, line, accentBrand, state, ai } from '@polaris/ui/tokens';
```

**v0.6 / rc.0 / v0.7 alias는 v0.8에서 제거됨** — `bg-brand-primary` / `text-fg-primary` / `bg-surface-raised` / `bg-status-danger` / `bg-background-normal` / `rounded-polaris-full` 같은 alias 클래스는 v0.7에서 계속 작동했지만 v0.8 패키지엔 더 이상 emit되지 않음 (Tailwind 빌드 시 사라짐). 새 코드는 spec 이름 사용. v0.7 → v0.8 일괄 변환은 **`pnpm dlx @polaris/lint polaris-codemod-v08 --apply`** (token / Tailwind / CSS variable / JSX prop 모두 한 번에 처리).

NEVER write any of:
- Hex colors: `#fff`, `#1D4ED8`
- CSS color functions: `rgb(...)`, `rgba(...)`, `hsl(...)`
- Tailwind arbitrary values: `bg-[#fff]`, `text-[red]`, `border-[#ccc]`

### 4. AI / NOVA contexts
- AI features (generation, summarization, NOVA entry points) → `bg-ai-normal` + `shadow-polaris-ai` (purple glow)
- Everything else → `bg-accent-brand-normal` (blue)
- Don't mix accent-brand and ai on the same screen.

### 4-1. 시각적 브랜드 정체성 — Polaris signature 자산 적극 노출

토큰만 정확히 써도 *시각적으론 평범한 SaaS로 보일 수 있다*는 함정이 있습니다 (외부 사이트 검수 2건에서 확인된 패턴). Polaris가 시장에서 거의 유일하게 갖는 자산을 **적극적으로 노출**해야 시각 정체성이 드러납니다. 코드 생성 시 다음 도메인 매핑을 의식적으로 적용하세요:

| 도메인 단서 | 사용할 자산 | 비고 |
|---|---|---|
| AI / NOVA / 자동 작성 / 분석 / 요약 / 챗 | `<Button variant="ai">` + `<NovaLogo tone="white" size={16~20} />` 동반 | 평범한 brand-blue 버튼으로 만들지 말 것 — 사용자가 AI 기능인지 인지 못 함 |
| 헤로 / 핵심 stat에 AI 강조 | NOVA 그라디언트 텍스트 (`linear-gradient(135deg, var(--polaris-purple-40), var(--polaris-ai-normal))` + `bg-clip-text text-transparent`) | 한 단어 / 한 수치만 그라디언트 — 도배 금지 |
| 파일 / 다운로드 / 형식 표시 | `<FileIcon type="docx|hwp|pdf|xlsx|pptx|...">` (29종) | 텍스트 "DOCX" 대신 시각 아이콘. 멀티컬러 baked-in |
| 문서 편집 / 보고서 / 제안서 작성 페이지 | `<Ribbon>` + `@polaris/ui/ribbon-icons` (91종) | Polaris의 가장 큰 차별 자산 — Office-style ribbon은 사실상 Polaris만 갖춤 |
| 필터 / 카테고리 / 빠른 액션 chip | `<PromptChip>` | 평범한 `<button>` chip 대신 — NOVA hover로 시각 차별 |
| 사이드바 / nav active state | `bg-accent-brand-bg` 브랜드 틴트 (DESIGN.md §4 Navigation) | 단순 `text-color` change가 아니라 배경에 brand tint |
| Footer / login / 브랜드 영역 | `<PolarisLogo variant="horizontal|symbol|favicon">` / `<NovaLogo>` | "Powered by Polaris" 같은 attribution, 또는 메인 브랜드 마크 |

**핵심 원칙**:
1. **AI는 명시한다** — AI 기능이면 AI Purple로 시각화. 평범 brand-blue로 위장하면 안 됨.
2. **파일은 아이콘으로** — 텍스트 "DOCX/HWP/PDF" 표시 ❌. `<FileIcon>` ✓.
3. **편집 use case면 Ribbon** — 문서/보고서/제안서/스프레드시트/PDF 편집은 무조건 `<Ribbon>` 검토.
4. **brand 색은 1~2 지점에만** — primary 색을 모든 곳에 도배하면 brand 색이 평범해짐. 핵심 CTA / 핵심 stat에만.

**참고 구현**: `/proposal-platform` 데모 페이지가 이 9가지 자산을 한 페이지에 모두 적용한 reference. 페이지 하단 "IDENTITY CHECKLIST" 섹션이 항목별 적용 위치를 명시. 새 페이지 만들 때 비교용으로 사용.

### 5. State 컬러 — 색상만으로 정보 전달 금지 (WCAG 1.4.1)

`state.success / warning / error` 는 작은 텍스트에서 contrast AA를 만족하지 않습니다. 다음 룰 준수:

- ✅ 아이콘 동반 (`<ErrorIcon />` `<CheckIcon />` etc.) + 텍스트 라벨
- ✅ 18px+ Bold 텍스트
- ✅ 뱃지 (`bg-state-{}-bg` + Caption1 12 / 700)
- ❌ 14px 본문에서 `text-state-error` 단독 사용 (lint 룰 `@polaris/state-color-with-icon` 가 경고)

**`label.*` vs `state.*` 의미 분리** — 흔한 혼동:
- `label.*` = 일반 텍스트의 위계(`normal/neutral/alternative/assistive/inverse/disabled`). 상태 의미 없음.
- `state.*` = "이 텍스트는 success/warning/error를 의미한다"는 시맨틱.
- → "위반 라벨"용으로 `label-danger` 같은 토큰은 **없습니다**(시맨틱이 흐려지므로 추가 안 함). 위반/오류 색은 `text-state-error` + 아이콘. 

### 6. File-type contexts (Polaris-specific)

29개 파일 타입 SVG가 `@polaris/ui` 에서 제공됩니다 — `<FileIcon type="docx" />` 또는 직접 import:
```ts
import { DocxIcon, XlsxIcon, PptxIcon, PdfIcon, FolderIcon } from '@polaris/ui/file-icons';
```
색상은 SVG 안에 baked-in — `text-{color}` 로 변경 불가 (의도된 디자인).

### 7. Typography (v0.7 spec)
- Family: `font-polaris` (Tailwind) or `var(--polaris-font-sans)` (CSS)
- Scale: `text-polaris-display` (40) / `-title` (32) / `-heading1` ~ `-heading4` (28/24/20/18) / `-body1` ~ `-body3` (16/14/13) / `-caption1` (12) / `-caption2` (11). 모든 heading + caption은 weight 700.
- 모바일 (≤767px) 자동 축소 — `tokens.css` 에 @media 자동 적용.
- NEVER `font-family: ...` 직접 지정.
- NEVER `font-['Inter']` 임의값.
- NEVER letter-spacing 수정 — Pretendard 자체 메트릭 사용.
- v0.6 / rc.0 alias (`text-polaris-display-lg`, `-h1`~`-h5`, `-body`, `-meta`, `-tiny`) 은 **v0.8에서 제거**. 남아 있다면 `pnpm dlx @polaris/lint polaris-codemod-v08 --apply` 로 spec 이름(`-display`, `-heading{1..4}`, `-body{1..3}`, `-caption{1,2}`)으로 변환.

### 8. Spacing / radius / shadow / motion / z-index
- **Spacing** (v0.7 named): `p-polaris-md`, `gap-polaris-lg` 등 (4xs/3xs/2xs/xs/sm/md/lg/xl/2xl/3xl/4xl). Tailwind 기본 `p-4` 도 OK. Never `p-[13px]`.
- **Radius**: `rounded-polaris-{2xs,xs,sm,md,lg,xl,2xl,pill}`. Default for buttons/cards/modals = `md` (12px). Input = `sm` (8). Large CTA = `lg` (16). Modal = `xl` (24).
- **Shadow**: `shadow-polaris-{xs,sm,md,lg,ai,focus}`. AI surfaces (NovaInput / response cards) = `ai` (purple glow). Custom interactive elements = `focus-visible:shadow-polaris-focus` for the system focus ring (3px, light/dark auto).
- **Motion**: `duration-polaris-{instant,fast,normal,slow}` + `ease-polaris-{in-out,out,in}`.
- **Z-index**: `z-polaris-{base,dropdown,sticky,dim,modal,toast}`. Never `z-[999]`.

### 8-1. Dark mode — what's automatic vs. what breaks

- **Automatic**: every CSS token (`label.*`, `background.*`, `layer.*`, `accentBrand.*`, `state.*`, `ai.*`, `shadow-polaris-*`, `shadow-polaris-focus`) has a light/dark pair in `tokens.css`. Toggling `data-theme="dark"` on `<html>` switches everything automatically *as long as components use token classes*.
- **Breaks in dark**:
  - `style={{ color: '#fff' }}` / inline hex / `rgba(0,0,0,0.5)` — caught by `@polaris/no-hardcoded-color`.
  - Tailwind arbitrary values (`bg-[#fff]`, `border-[hsl(...)]`, `p-[13px]`) — caught by `@polaris/no-arbitrary-tailwind`.
  - Direct `box-shadow: 0 4px 12px rgba(0,0,0,0.1)` — invisible on dark surfaces. Use `shadow-polaris-md` instead.
  - `color-mix(in srgb, #1D7FF9 20%, transparent)` with hex inputs — use the token: `color-mix(in srgb, var(--polaris-accent-brand-normal) 20%, transparent)`.
- **Verify in dark**: temporarily set `<html data-theme="dark">` and visually scan the page before reporting done. The lint rules catch most issues, but pixel-level checks (e.g. low-contrast borders) still need a human eyeball.

### 8. Verify before reporting done
After meaningful changes, run `/polaris-check`. Don't tell the user the task is complete while violations remain.

## Single source of truth

Color/font/radius values live ONLY in `@polaris/ui`. If you genuinely need a token that doesn't exist, propose it in `tokens.md` first; do not invent values in component code.

## Anti-patterns to actively avoid

- "I'll just hardcode #FF5500 since the user mentioned it" — wrong. Use the closest token; if none fits, ask before adding.
- "Material/shadcn has a nice X component, let me use it" — wrong. Wrap in `@polaris/ui` first or build inline with tokens.
- "I'll disable the lint rule for this one case" — wrong. Disabling rules defeats the purpose. Fix the root cause.
- "The arbitrary value is shorter to write" — irrelevant. Token classes are mandatory regardless of brevity.
