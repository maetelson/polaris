# 컴포넌트 진화 매트릭스 (v0.4 → v0.8)

> **현재 수동 유지** (Phase 4-b backlog — `packages/ui/src/components/*.tsx` 의 JSDoc `@since v0.x` annotation 파싱으로 auto-gen 예정). 새 컴포넌트 추가 / breaking 변경 시 이 파일도 함께 갱신.

**의도**: v0.4 또는 v0.6에서 곧장 v0.8로 점프하는 컨슈머가 *컴포넌트별 진화*를 한 페이지에서 파악할 수 있도록 정리. CHANGELOG 1000+ 줄을 traverse하지 않아도 됨.

**범례**:
- 🆕 **Added** — 해당 버전에서 신규 등장
- 🛠 **Hardened** — additive props / a11y / state-sync 강화 (소비자 코드 무변경)
- 💥 **Breaking** — API 이름 변경 / variant 제거 / prop 이름 변경 (codemod-v08로 자동 변환)
- 🎨 **Visual** — 토큰 / 스타일이 미세하게 바뀌어 시각 회귀 가능

**v0.8 codemod** — 어느 점프든 한 번에 정리: `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src`

---

## 한눈 요약 — v0.4 → v0.8 점프 시 무엇이 바뀌나

| 변화 종류 | 개수 | 처리 방법 |
|---|---|---|
| 신규 컴포넌트 | 30+ | 도입 결정 — `docs/for-consumers/getting-started.md` 의 9~10가지 시각 자산 참조 |
| 컴포넌트 prop rename (BREAKING) | 5건 | codemod-v08 자동 |
| variant rename (BREAKING) | 3건 | codemod-v08 자동 |
| `<HStack>` / `<VStack>` 제거 | 1건 | codemod-v08 자동 |
| 토큰 alias 제거 | ~60 | codemod-v08 자동 |
| 시각 회귀 가능 (의도된 변경) | ~10 컴포넌트 | `v0.7-to-v0.8-visual-diff.md` 참조 |

---

## Tier 0 — 기본 빌딩 블록 (12 family)

| Component | Added | 주요 진화 | Current API |
|---|---|---|---|
| **Button** | v0.4 | v0.7.0 6 sizes / 7 variants / Black variant · v0.7.6 `iconLeft`/`iconRight`/`fullWidth`/`loading` 🛠 · **v0.8.0 `variant="outline"` 제거 → `tertiary` 💥** · v0.8.0 모든 variant 공통 `shadow-polaris-focus` 🎨 | `variant`, `size`, `iconLeft`, `iconRight`, `loading`, `fullWidth`, `asChild` |
| **Input** | v0.4 | v0.7.0 52px floating-label · v0.7.6 `prefix`/`suffix`/`clearable` 🛠 · **v0.8.0 `hint` → `helperText` 💥** | `label`, `helperText`, `error`, `prefix`, `suffix`, `clearable`, `onClear` |
| **Textarea** | v0.4 | v0.7.6 `autoResize` + `showCount` 🛠 · **v0.8.0 `hint` → `helperText` 💥** | `label`, `helperText`, `error`, `autoResize`, `showCount`, `maxLength` |
| **Card** | v0.4 | v0.7.6 `interactive` (cursor-pointer + hover shadow + focus ring) 🛠 · v0.7.7 `bare` variant + `CardHeader/Title/Description/Body/Footer` slot | `variant="bare"`, `interactive`, `asChild` |
| **Badge** | v0.4 | v0.7.6 `dismissible` + `icon` slot 🛠 · v0.7.7 solid tone hover bg tone-aware fix | `tone`, `variant` (subtle/solid/outline), `dismissible`, `icon`, `onDismiss` |
| **Avatar** | v0.4 | v0.7.7 `AvatarGroup` 신규 🆕 | size, fallback, src |
| **Dialog** | v0.4 | v0.7.0 24px radius / overlay rgba 0.5 · **v0.8.0 `DialogFooter fullWidthButtons` 🆕** | header / body / footer slot, fullWidthButtons |
| **Toast** | v0.4 | v0.7.6 `Toaster defaultDuration` 🛠 · v0.7.5 imperative `toast({…})` API | `useToast`, `toast(...)`, `<Toaster defaultDuration>` |
| **Tabs** | v0.4 | **v0.7.7 underline variant 🆕** (page-nav 용) | `variant="pill"` (default) \| `"underline"` |
| **FileIcon** | v0.7.0 🆕 | 29 file types — 디자인팀 SVG 통합 | `type="docx" \| ...` |
| **FileCard** | v0.7.0 🆕 | 파일 카드 (FileIcon + 이름 + 메타) | name, type, meta |
| **NovaInput** | v0.7.0 🆕 | NOVA chat composer (AI Purple + shadow-ai) | placeholder, onSubmit |

## Tier 1 — 셸 + 메뉴 (7 family)

| Component | Added | 주요 진화 | Current API |
|---|---|---|---|
| **DropdownMenu** | v0.4 | v0.7.6 `DropdownMenuFormItem` (server action) 🆕 · v0.7.7 `icon` slot 🛠 · v0.8.0 `bg-surface-border` → `bg-line-neutral` 🎨 | items, icon, asChild |
| **Tooltip** | v0.4 | (안정) | content, side, delayDuration |
| **Select** | v0.4 | v0.8.0 separator color 토큰 정합 🎨 | options, value, onValueChange |
| **Sidebar** | v0.4 | v0.7.0 active 상태 brand-bg + accent-brand-normal 🎨 | Header / Body / Footer slot |
| **Navbar** | v0.4 | v0.7.7 `<NavbarItem>` 신규 🆕 (active / asChild / icon / href) | Brand / Nav / Actions slot |
| **NavbarItem** | v0.7.7 🆕 | active 상태 brand 틴트 + Sidebar 패턴 미러링 | active, asChild, icon, href |
| **PromptChip** | v0.7.0 🆕 | NOVA hover chip — 필터 / 빠른 액션 | label, active |

## Tier 2 — 보조 UI (7 family)

| Component | Added | 주요 진화 | Current API |
|---|---|---|---|
| **Checkbox** | v0.4 | v0.7.6 `helperText`/`error` 🛠 · **v0.8.0 `hint` → `helperText` 💥** · **v0.8.0 `variant="ai"` 🆕 (NOVA Purple)** | `variant="default" \| "ai"`, `helperText`, `error` |
| **Switch** | v0.4 | v0.7.6 `label` / `helperText` / `error` (Checkbox 일관성) 🛠 · v0.8.0 `bg-surface-border-strong` → `bg-line-normal` 🎨 · **v0.8.0 `hint` → `helperText` 💥** | label, helperText, error |
| **Skeleton** | v0.4 | v0.7.6 `shape="rect/text/circle/bare"` + `lines={N}` 🛠 | shape, lines |
| **Alert** | v0.4 | v0.7.3 토큰 정합 (state-*) · v0.7.6 `dismissible` + `action` slot 🛠 · ⚠️ 디자인팀 유지/제거 결정 대기 | variant, dismissible, action |
| **Pagination** | v0.4 | v0.7.5 `<PaginationFooter>` 헬퍼 신규 (Tier 3.6) | items, current, onPageChange |
| **Breadcrumb** | v0.4 | (안정) | items |
| **EmptyState** | v0.4 | v0.7.7 `action` slot 🛠 | icon, title, description, action |

## Tier 2.5 — Layout primitives (5 family)

| Component | Added | 주요 진화 | Current API |
|---|---|---|---|
| **Stack** | v0.5 | **v0.8.0 `<HStack>` / `<VStack>` 제거 → `<Stack direction>` 단일화 💥** | direction, gap, align, justify, wrap |
| **Container** | v0.5 | (안정) — max-width 1200px | maxWidth |
| **Drawer** | v0.4 | v0.7.0 모바일 바텀시트 자동 전환 🎨 · v0.8.0 focus ring 통일 🎨 | side, open, onOpenChange |
| **Table** | v0.4 | v0.7.0 sticky header / sortable TableHead 🛠 · v0.7.7 `<TableCell nowrap>` 🛠 · **v0.8.0-rc.6 `<TableHead nowrap>` 🆕** · v0.8.0 `divide-surface-border` → `divide-line-neutral` 🎨 | Sortable head, density, selected row |
| **DescriptionList** | v0.7.0 🆕 | term-description 쌍 | terms |

## Tier 3 — date / overlay / command (🧪 experimental)

| Component | Added | 주요 진화 | Current API |
|---|---|---|---|
| **Popover** | v0.4 | (안정) | open, onOpenChange |
| **Calendar** | v0.4 | 🧪 v0.8.0 focus ring 통일 🎨 | mode, selected, onSelect |
| **DatePicker** | v0.4 | 🧪 v0.7.6 `name`/`valueFormat`/`required`/`form` 🛠 (server-action friendly) · v0.8.0 jsdoc 정정 + `disabled` mirror 🛠 | name, valueFormat, required, disabled |
| **DateRangePicker** | v0.4 | 🧪 (안정) | range, onRangeChange |
| **Command** | v0.4 | 🧪 v0.8.0 separator color 토큰 정합 🎨 | items |

## Tier 3.5 — feedback / utility (v0.7.5)

| Component | Added | 주요 진화 | Current API |
|---|---|---|---|
| **Progress** | v0.7.5 🆕 | linear progress · **v0.8.0 `tone` → `variant` 💥** | value, variant |
| **CircularProgress** | v0.7.7 🆕 | radial progress · 4 sizes / 5 tones · `prefers-reduced-motion` | size, tone, value |
| **CopyButton** | v0.7.5 🆕 | clipboard + 1.5s success state + ARIA live | text |
| **Stat** | v0.7.5 🆕 | KPI tile · v0.7.6 `loading` skeleton 🛠 · v0.7.7 `value: number\|bigint` `Intl.NumberFormat` 자동 🛠 · **v0.8.0 `deltaTone` → `deltaVariant` 💥** | label, value, delta, deltaVariant, numberFormat, loading |
| **StatGroup** | v0.7.7 🆕 | 4-up KPI grid + auto-rows-fr + Stat 자식 자동 Card wrap | cols, unwrapped |
| **Disclosure** | v0.7.5 🆕 | single-item collapsible · v0.7.7 `headingLevel="h2..h6"` 🛠 (SR heading nav) | title, headingLevel |

## Tier 3.6 — file / time inputs (v0.7.5)

| Component | Added | 주요 진화 | Current API |
|---|---|---|---|
| **FileInput** | v0.7.5 🆕 | button trigger 파일 picker · **v0.8.0 `hint` → `helperText` 💥** | accept, maxSize, onFilesChange |
| **FileDropZone** | v0.7.5 🆕 | drag-and-drop · 동일 API · **v0.8.0 `hint` → `helperText` 💥** | accept, maxSize, onFilesChange |
| **DateTimeInput** | v0.7.5 🆕 | native `datetime-local` wrapper · **v0.8.0 `hint` → `helperText` 💥** | label, helperText, error |
| **TimeInput** | v0.7.5 🆕 | native `time` wrapper · **v0.8.0 `hint` → `helperText` 💥** | label, helperText, error |
| **PaginationFooter** | v0.7.5 🆕 | Pagination + page-size + "X-Y of N" · v0.7.7 `showPageSize` 명시 boolean 🛠 | page, pageSize, total, onPageChange, onPageSizeChange |

## Tier 3.7 — Table helpers (v0.7.5)

| Component | Added | 주요 진화 | Current API |
|---|---|---|---|
| **TableSearchInput** | v0.7.5 🆕 | 검색 + 디바운스 | onSearchChange |
| **TableToolbar** | v0.7.5 🆕 | search + filter chips + actions slot | search, chips, actions |
| **TableSelectionBar** | v0.7.5 🆕 | 선택 행 액션 — toolbar 대체 | count, onCancel, actions |
| **TableSkeleton** | v0.7.5 🆕 | rows×columns skeleton + `aria-busy` | rows, columns |

## Tier 3.8 — page layout + extras (v0.7.7)

| Component | Added | 주요 진화 | Current API |
|---|---|---|---|
| **PageHeader** | v0.7.7 🆕 | title + description + breadcrumb + eyebrow + actions | as, divider |
| **SectionHeader** | v0.7.7 🆕 | h2 (default) / h3 — PageHeader card-외부 sibling | as |
| **Accordion** | v0.7.7 🆕 | group disclosure · Radix-backed · `type="single\|multiple"` | type, collapsible |
| **Combobox** | v0.7.7 🆕 | cmdk-backed searchable Select · `multiple` 모드 | options, value, multiple |
| **AvatarGroup** | v0.7.6 🆕 | overlap + `+N` 인디케이터 — size 자동 propagate | max, size |

## Subpath / 부속

| Component | Subpath | Added | 주요 진화 |
|---|---|---|---|
| **Form family** | `@polaris/ui/form` | v0.7.0 🆕 | react-hook-form + zod 통합 · v0.7.4 FormMessage 자동 ErrorIcon 🛠 |
| **Ribbon family** (25+ subcomponents) | `@polaris/ui/ribbon` | v0.7.0 🆕 | Office-style 리본 · v0.7.1 91 ribbon-icons 추가 🛠 · v0.8.0 `data-polaris-ribbon` attribute 🛠 |
| **DropdownMenuFormItem** | root | v0.7.6 🆕 | server action `<form action>` 통합 (Radix unmount race 회피) |

## 디자인팀 SVG 자산 (v0.7.0 통합)

| 자산 | Subpath | 개수 | 비고 |
|---|---|---|---|
| UI 아이콘 | `@polaris/ui/icons` | 65 × 3 sizes (18/24/32) | ArrowDownIcon, ChevronRightIcon, SearchIcon, ErrorIcon, … |
| 파일 아이콘 | `@polaris/ui/file-icons` | 29 types | DocxIcon, XlsxIcon, PptxIcon, PdfIcon, FolderIcon, ZipIcon, … (멀티컬러 baked-in) |
| 로고 | `@polaris/ui/logos` | PolarisLogo (h/symbol/favicon) + NovaLogo | variant / size |
| 리본 아이콘 | `@polaris/ui/ribbon-icons` | 91 (57 big × 32 + 34 small × 16) | BoldIcon, PasteIcon, AiChatIcon, … (Ribbon 안에서만 사용) |

---

## 💥 Breaking 변경 한 줄 요약 (v0.7 → v0.8)

다음 5건이 codemod-v08의 변환 대상. 컨슈머 코드에서 *원래 형태*를 grep으로 찾고 싶으면:

```bash
# 원래 형태 → 변환 후
rg 'variant=["\x27]outline["\x27]'        # → variant="tertiary"
rg '\bhint='                              # → helperText=
rg '<Progress[^>]*\btone='                # → variant=
rg '<Stat[^>]*\bdeltaTone='               # → deltaVariant=
rg '<(H|V)Stack'                          # → <Stack direction="row"|"">
```

이외 토큰 / Tailwind 클래스 / CSS 변수 alias 제거는 codemod 한 번이면 모두 정리. 자세히: [`docs/for-consumers/migration/v0.7-to-v0.8.md`](../for-consumers/migration/v0.7-to-v0.8.md).

---

## 도입 결정 — 컨슈머 use case별 권장 묶음

| Use case | 필수 컴포넌트 묶음 |
|---|---|
| **B2B 계약 / 영업 대시보드** | Stat + StatGroup + Table + TableToolbar + TableSelectionBar + PageHeader + Badge + Card |
| **AI 챗 / NOVA 진입 화면** | NovaInput + PromptChip + `<Button variant="ai">` + NovaLogo + `<Checkbox variant="ai">` + AvatarGroup |
| **노트 / 문서 편집기** | Ribbon family + ribbon-icons + Tabs underline + FileCard + Dialog |
| **파일 / 다운로드 표시** | FileIcon (29 types) + FileCard — *텍스트로 "DOCX" 라벨 달지 말 것* |
| **랜딩 / 마케팅** | PageHeader + Stat + Card + PolarisLogo + Toast + Sidebar / Navbar |
| **데이터 테이블 (CRUD)** | Table + TableToolbar + TableSelectionBar + TableSkeleton + PaginationFooter + Combobox + DropdownMenu |
| **폼 / 신청서** | Form (subpath) + Input + Textarea + Select + Checkbox + Switch + DatePicker + Button |

---

이 문서는 새 컴포넌트 추가 또는 BREAKING 변경 시 한 줄 update — 매트릭스 한 페이지에 모든 진화가 살아있게 유지.
