# Legacy CSS Patterns → Polaris 컴포넌트 매핑

**의도**: 폴라리스 도입 전에 자체 utility CSS (`.surface`, `.primary-button`, `.field`, `.data-table` 등)를 만들어 쓰던 프로젝트가 codemod 만으로는 자동 변환되지 않는 *프로젝트 자체* 패턴을 정리. codemod 까진 아니어도 **grep + 수동 치환 cheat sheet** 로 마이그레이션 부담을 크게 줄임.

> codemod-v08 은 **`@polaris/ui` 의 토큰 / 클래스 / prop / 컴포넌트 이름** 만 자동 변환. 컨슈머 프로젝트 안에 정의된 자체 utility는 grep + 손으로 옮겨야 합니다 — 이 문서가 그 가이드.

---

## 1. Utility class → 폴라리스 컴포넌트 매핑

가장 자주 쓰던 패턴 9개. 각 항목에 *grep 명령*과 *치환 방향* 표시.

### `.surface` / `.card-surface` → `<Card>`

```bash
# 찾기
rg 'className=.*\b(surface|card-surface)\b' src/
# 또는 (Tailwind 임의 클래스로 흩어진 경우)
rg '\b(bg-white|bg-gray-50).*\b(rounded|border).*\b(p-[0-9]|padding)' src/
```

```diff
- <div className="surface">
+ <Card variant="padded">
    <h2>제목</h2>
    <p>내용</p>
- </div>
+ </Card>
```

**옵션 선택**:
- 패딩 포함 → `<Card variant="padded">`
- 헤더 / 푸터 슬롯 필요 → `<Card variant="bare"><CardHeader><CardTitle>` 조합
- 클릭 가능 카드 → `<Card interactive asChild><Link>...</Link></Card>`

### `.primary-button` / `.btn-primary` → `<Button variant="primary">`

```bash
rg 'className=.*\b(primary-button|btn-primary|cta-button)\b' src/
```

```diff
- <button className="primary-button">저장</button>
+ <Button variant="primary">저장</Button>
```

**Variant 매핑**:
- 기본 액션 → `variant="primary"` (PO Blue)
- 보조 액션 / 취소 → `variant="tertiary"` (gray fill) 또는 `variant="ghost"` (transparent)
- 강조 검정 → `variant="dark"`
- 삭제 / 영구 액션 → `variant="danger"`
- AI / NOVA 기능 → `variant="ai"`

> v0.8에서 `variant="outline"` 제거됨. outline 패턴 사용했다면 `tertiary` 로.

### `.field` / `.form-field` / `.input` → `<Input>`

```bash
rg 'className=.*\b(field|form-field|text-input)\b' src/
rg '<input\s+type=["\x27]text["\x27]' src/   # raw native input
```

```diff
- <label>이름</label>
- <input type="text" className="field" />
- <span className="error">{error}</span>
+ <Input
+   label="이름"
+   helperText="공유 시 표시됨"     // v0.8: hint → helperText
+   error={error}                  // ⚠ 아이콘 자동
+ />
```

**자주 함께 따라오는 것**:
- floating-label 패턴 → `<Input label>` 이 자동
- error 메시지 + 아이콘 → `<Input error>` 가 자동 prepend
- 통화 / 단위 prefix/suffix → `<Input prefix="₩" suffix="KRW">`
- clear 버튼 → `<Input clearable>`

### `.textarea-field` → `<Textarea>`

```bash
rg 'className=.*\b(textarea-field|text-area)\b' src/
rg '<textarea' src/   # raw native
```

```diff
- <textarea className="textarea-field" rows={4} />
+ <Textarea
+   label="메모"
+   helperText="최대 500자"
+   autoResize={{ minRows: 4, maxRows: 8 }}    // scrollHeight 기반 자동 확장
+   showCount maxLength={500}                  // 카운터
+ />
```

### `.pill` / `.tag` / `.chip` → `<Badge>` 또는 `<PromptChip>`

```bash
rg 'className=.*\b(pill|tag|chip|label-pill)\b' src/
```

상태 표시 / 분류 → `<Badge>`:
```diff
- <span className="pill pill-success">완료</span>
+ <Badge variant="success">완료</Badge>
```

필터 / 빠른 액션 chip (NOVA hover) → `<PromptChip>`:
```diff
- <button className="chip active">필터</button>
+ <PromptChip active>필터</PromptChip>
```

> `<Badge>` 의 variant + tone 결정 가이드는 [`docs/for-consumers/component-use-cases/badge.md`](../component-use-cases/badge.md) 참조.

### `.data-table` / `.table-wrapper` → `<Table>` + helpers

```bash
rg 'className=.*\b(data-table|table-wrapper)\b' src/
rg '<table\b' src/   # raw native
```

```diff
- <div className="table-wrapper">
-   <input className="search" placeholder="검색" />
-   <table className="data-table">...
+ <>
+   <TableToolbar search={query} onSearchChange={setQuery} chips={...} actions={...} />
+   <Table>
+     <TableHeader>...</TableHeader>
+     <TableBody>...</TableBody>
+   </Table>
+   <PaginationFooter page={p} pageSize={ps} total={t} onPageChange={...} />
+ </>
```

**Table 묶음 컴포넌트 (v0.7.5)**:
- 검색 + 필터 chip + actions → `<TableToolbar>`
- 선택 행 액션 → `<TableSelectionBar count={...} onCancel actions={...}>` (toolbar 대체)
- 로딩 상태 → `<TableSkeleton rows={5} columns={4}>`
- 정렬 가능 header → `<TableHead sortable sortDirection onSortChange>`
- 단일라인 셀 (날짜/금액/ID) → `<TableCell nowrap>` + `<TableHead nowrap>` (v0.8.0-rc.6+)

### `.modal-overlay` + `.modal-content` → `<Dialog>`

```bash
rg 'className=.*\b(modal-overlay|modal-content|modal-backdrop)\b' src/
```

```diff
- {open && (
-   <>
-     <div className="modal-overlay" onClick={() => setOpen(false)} />
-     <div className="modal-content">
-       <h2>제목</h2>
-       <p>내용</p>
-       <button onClick={save}>저장</button>
-     </div>
-   </>
- )}
+ <Dialog open={open} onOpenChange={setOpen}>
+   <DialogContent>
+     <DialogHeader><DialogTitle>제목</DialogTitle></DialogHeader>
+     <p>내용</p>
+     <DialogFooter>
+       <DialogClose asChild><Button variant="tertiary">취소</Button></DialogClose>
+       <Button onClick={save}>저장</Button>
+     </DialogFooter>
+   </DialogContent>
+ </Dialog>
```

**얻는 것**:
- 모바일 바텀 시트 자동 전환
- ESC / focus trap / aria-modal 자동
- v0.8.0 `DialogFooter fullWidthButtons` 로 narrow modal 두 액션 half-width 페어

### `.dropdown` / `.menu` → `<DropdownMenu>`

```bash
rg 'className=.*\b(dropdown|menu-list|popup-menu)\b' src/
```

```diff
- <button onClick={toggle}>⋯</button>
- {open && (
-   <ul className="dropdown">
-     <li onClick={edit}>수정</li>
-     <li onClick={delete}>삭제</li>
-   </ul>
- )}
+ <DropdownMenu>
+   <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">⋯</Button></DropdownMenuTrigger>
+   <DropdownMenuContent>
+     <DropdownMenuItem onSelect={edit} icon={<EditIcon />}>수정</DropdownMenuItem>
+     <DropdownMenuItem onSelect={delete} destructive>삭제</DropdownMenuItem>
+   </DropdownMenuContent>
+ </DropdownMenu>
```

> Server action 안에서 form submit하는 메뉴는 `<DropdownMenuFormItem action={signOut} destructive>` — Radix unmount-before-submit race 회피.

### `.sidebar` + `.nav-item` → `<Sidebar>` + `<NavbarItem>`

```bash
rg 'className=.*\b(sidebar|nav-item|sidenav)\b' src/
```

```diff
- <aside className="sidebar">
-   <a className={active ? 'nav-item active' : 'nav-item'} href="/docs">문서</a>
- </aside>
+ <Sidebar width="15rem">
+   <SidebarSection>
+     <SidebarItem active={pathname.startsWith('/docs')} asChild>
+       <Link href="/docs">문서</Link>
+     </SidebarItem>
+   </SidebarSection>
+ </Sidebar>
```

> `bg-accent-brand-bg` 브랜드 틴트 + brand-normal text/icon 이 자동. 단순 text-color 변경이 아니라 *브랜드 틴트 배경* 이 active 상태 핵심.

---

## 2. 전역 CSS / 자체 토큰 → 폴라리스 토큰

```bash
# Find your own design tokens
rg '^\s*--(color|font|spacing|radius)-' src/styles/ src/app/globals.css
```

| 우리 자체 토큰 (예시) | 폴라리스 대응 |
|---|---|
| `--brand-blue` / `--primary` | `var(--polaris-accent-brand-normal)` |
| `--text-primary` | `var(--polaris-label-normal)` |
| `--text-secondary` | `var(--polaris-label-neutral)` |
| `--text-muted` | `var(--polaris-label-alternative)` |
| `--bg-page` | `var(--polaris-background-base)` |
| `--bg-card` | `var(--polaris-layer-surface)` |
| `--border-color` | `var(--polaris-line-neutral)` |
| `--border-strong` | `var(--polaris-line-normal)` |
| `--success` | `var(--polaris-state-success)` |
| `--warning` | `var(--polaris-state-warning)` |
| `--error` / `--danger` | `var(--polaris-state-error)` |
| `--font-sans` / `--font-family-base` | `var(--polaris-font-sans)` |
| `--radius-default` | `var(--polaris-radius-md)` |
| `--shadow-card` | `var(--polaris-shadow-sm)` |

**대량 치환은 위험** — 같은 hex라도 컨텍스트(text vs bg vs border)에 따라 다른 토큰일 수 있음. `polaris-audit` 의 "top recurring hex" 결과를 기반으로 한 항목씩 결정.

---

## 3. 단계적 마이그레이션 절차 (큰 프로젝트)

이미 자체 utility가 50줄+ 인 프로젝트는 *빅뱅 금지*. strangler-fig 패턴 권장:

```bash
# Step 1 — audit
pnpm dlx @polaris/lint polaris-audit
# 위반 top 10 파일 식별

# Step 2 — 폴라리스 자체 alias가 잔존하면 codemod-v08 먼저
pnpm dlx @polaris/lint polaris-codemod-v08 --apply src

# Step 3 — 자체 utility cheat sheet (이 문서) 로 page 단위 grep + 치환
rg 'className=.*\bsurface\b' src/pages/  # 1 페이지씩
# 한 페이지의 .surface → <Card> 모두 옮기고 lint 통과 확인

# Step 4 — 자체 토큰 한 그룹씩 (예: --text-* → --polaris-label-*) global find/replace
# global replace 전에 SR / 다크 모드 / 시각 회귀 한 번 점검

# Step 5 — 자체 utility CSS 클래스 정의를 globals.css 에서 제거
# Step 6 — `polaris-audit` 재실행, 위반 0 확인
```

### 페이지 단위 진행 보고 형식

각 페이지 끝낼 때:
```
src/pages/contracts/[id].tsx 마이그레이션 완료
- .surface → <Card> 12 곳
- .primary-button → <Button> 4 곳
- .field → <Input> 6 곳
- 위반 47건 → 0건
다음: src/pages/contracts/list.tsx (위반 32건)
```

---

## 4. 자동화 도구 — grep + sed 한 줄 (위험! 검토 필수)

대량 케이스가 있고 컨텍스트가 균일하면 *제한적* 자동 치환 가능. **반드시 PR diff 확인 후 commit**:

```bash
# .surface → "Card variant=\"padded\"" — 위험: <div> wrap 구조도 같이 바꿔야
sed -i '' 's/className="surface"/[REPLACE BY HAND]/g' src/**/*.tsx
# 위 sed 는 *경고만* 박아 놓는 용도. 한 곳씩 손으로.

# 더 안전한 패턴: comment marker 박기
rg -l 'className=.*\bsurface\b' src/ | xargs sed -i '' 's|className="surface"|className="surface" /* TODO: → <Card variant="padded"> */|g'
```

> **권장 안 함** — 대량 치환은 시각 회귀 / 구조 변형 위험. cheat sheet 보면서 한 곳씩이 안전합니다. ESLint 의 `prefer-polaris-component` 룰을 *warning* 으로 켜 두면 PR 마다 누적 진행 상황이 자동 보임.

---

## 5. 자주 등장하는 wrapper 패턴 (자체 구현 → 폴라리스)

| 자체 구현 패턴 | 폴라리스 대응 |
|---|---|
| `function StatCard({ label, value })` | `<Stat label value>` + `<StatGroup cols={4}>` |
| `function ExpiryDateField` (50줄 wrapper) | `<DatePicker name valueFormat required form>` (hidden input 자동) |
| `function ConfirmDialog` | `<Dialog>` + `<DialogFooter fullWidthButtons>` |
| `function FormField` (label + input + error 조합) | `<Form>` (subpath: `@polaris/ui/form`) + `<FormField>` + `<FormItem>` |
| `function NotificationDot` | `<Avatar>` corner 의 `state-new` dot 또는 `<Badge variant="danger" tone="solid">●</Badge>` |
| `function FileTypeIcon` (확장자 → 색) | `<FileIcon type="docx|...">` (29 타입) |
| `function AIBadge` | `<Badge variant="secondary">` 또는 `<NovaLogo size={16}>` |
| `function PageTitle` (h1 + description + actions) | `<PageHeader title description actions>` |

자체 wrapper 가 폴라리스의 컴포넌트 + props 조합으로 1:1 대응되는 경우가 70%+. 마이그레이션 후 wrapper 자체를 통째로 삭제 가능 → 코드 라인 줄어듦.

---

## 6. 마이그레이션 후 검증 — `polaris-audit` 0건

```bash
pnpm dlx @polaris/lint polaris-audit
```

기대 결과:
```
✓ no-hardcoded-color: 0
✓ no-arbitrary-tailwind: 0
✓ no-direct-font-family: 0
✓ no-deprecated-polaris-token: 0
✓ prefer-polaris-component: 0
✓ state-color-with-icon: 0
```

남는 케이스가 있으면:
- "정 안 되는" 케이스는 외부 라이브러리 색 (차트 / 3rd party 위젯). 이 경우 `// eslint-disable-next-line @polaris/no-hardcoded-color` 한 줄 + commit 메시지에 사유. 우회 남발 금지.
- 자체 utility 가 *디자인 시스템 외부* (예: docs 사이트의 marketing copy) 의도라면 그 파일을 lint scope에서 제외 (`.eslintignore` 또는 overrides).

---

이 문서는 컨슈머 마이그레이션 시 *한 페이지 cheat sheet* 입니다. 새 패턴이 발견되면 이 문서에 추가해 다음 마이그레이션의 friction 을 추가로 줄이세요.
