# @polaris/ui

폴라리스 디자인 시스템의 런타임 자산 — 토큰, CSS 변수, Tailwind preset, 59개 React 컴포넌트.

루트 [README](../../README.md)에 전체 시스템 설명이 있습니다. 이 문서는 패키지 사용법만 다룹니다.

## 설치

PolarisDesign이 사내 npm registry에 publish되기 전 단계라, `@polaris/ui`는 [GitHub Release](https://github.com/PolarisOffice/PolarisDesign/releases)의 `.tgz` 타르볼로 배포됩니다. Public repo이므로 인증 불요.

`package.json`에 직접 추가:

```jsonc
{
  "dependencies": {
    "@polaris/ui": "https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.7.7/polaris-ui-0.7.7.tgz"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0"
  }
}
```

그리고 `pnpm install`. 전체 셋업 절차(Tailwind preset 연결, tokens.css import, Renovate 자동 업그레이드, 트러블슈팅): [`docs/for-consumers/install.md`](../../docs/for-consumers/install.md). 새 프로젝트는 `/polaris-init <name>` 슬래시커맨드 한 줄로 부트스트랩 가능.

## 토큰

```ts
import {
  // 브랜드 / 액션 / AI
  accentBrand,  // accentBrand.normal/strong/bg/bgHover (PO Blue, 단일 소스 별칭 = fileType.docx)
  accentAction, // accentAction.normal/strong (Black 버튼, 다크모드 자동 반전)
  ai,           // ai.normal/strong/hover/pressed (NOVA Purple)
  // 라벨 / 배경 / 표면 / 보더 / 인터랙션
  label,        // label.normal/neutral/alternative/assistive/inverse/disabled
  background,   // background.base/disabled
  layer,        // layer.surface/overlay
  fill,         // fill.neutral/normal/strong
  line,         // line.neutral/normal/strong/disabled
  interaction,  // interaction.hover/pressed
  // 상태 / 포커스 / 정적
  state,        // state.success/warning/error/info/new (+ *Bg 페어)
  focus,        // focus.ring
  staticColors, // staticColors.white/black
  // 파일 / 컬러 램프
  fileType,     // fileType.docx (= accentBrand.normal), .xlsx, .pptx, .pdf, .hwp
  bluePalette, grayRamp, /* 등 11 family */
  // 그 외 토큰 시스템
  radius,       // radius.{2xs,xs,sm,md,lg,xl,2xl,pill}
  shadow,       // shadow.xs/sm/md/lg/ai/focus
  textStyle,    // display, title, heading1..heading4, body1..body3, caption1..caption2
  spacing,      // 4xs..4xl (named) + Tailwind 기본
  zIndex,       // base/dropdown/sticky/dim/modal/toast
  motion,       // duration + easing
  breakpoint,
  fontFamily,
  fontWeight,
} from '@polaris/ui/tokens';

accentBrand.normal; // { light: '#1D7FF9', dark: '#1D7FF9' } (다크모드도 동일 hue)
accentBrand.normal === fileType.docx; // true — 4-color 브랜드 = 파일 타입 단일 소스
```

## CSS 변수

```ts
import '@polaris/ui/styles/tokens.css';
```

`<html>` 또는 임의 ancestor에 `data-theme="dark"` 적용 시 다크 페어로 자동 전환. `prefers-color-scheme: dark` 폴백 포함.

## Tailwind preset

```ts
// tailwind.config.ts
import polarisPreset from '@polaris/ui/tailwind';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  presets: [polarisPreset],
} satisfies Config;
```

이후 다음 클래스가 자동 생성됩니다 (v0.7 spec 명명):

| 카테고리 | 클래스 |
|---|---|
| 라벨 (텍스트/아이콘) | `text-label-{normal,neutral,alternative,assistive,inverse,disabled}` |
| 배경 (페이지) | `bg-background-{base,disabled}` |
| 레이어 (raised) | `bg-layer-surface`, `bg-layer-overlay` |
| 인터랙션 | `bg-interaction-{hover,pressed}` |
| Fill | `bg-fill-{neutral,normal,strong}` |
| 보더 | `border-line-{neutral,normal,strong,disabled}` |
| Brand 액센트 | `bg-accent-brand-{normal,strong,bg,bg-hover}`, `text-accent-brand-normal` |
| Black 액션 | `bg-accent-action-{normal,strong}` (다크모드 자동 반전) |
| 포커스 / Static | `ring-focus-ring`, `bg-static-white`, `bg-static-black` |
| 상태 | `bg-state-{success,warning,error,info,new}`, `bg-state-{}-bg` |
| AI / NOVA | `bg-ai-{normal,strong,hover,pressed}` |
| 컬러 램프 (10단계) | `bg-blue-{05,10,...,90}`, `bg-purple-50`, `bg-green-30`, etc. |
| 서브 팔레트 (rc.1) | `bg-sky-blue-50`, `bg-violet-50`, `bg-cyan-50`, `bg-yellow-50`, `bg-blue-supplementary-50` |
| Gray | `bg-gray-{10,20,...,90}` |
| 폰트 | `font-polaris`, `font-polaris-mono` |
| 폰트 크기 | `text-polaris-{display,title,heading1-4,body1-3,caption1-2}` |
| Spacing (named) | `p-polaris-{4xs,3xs,2xs,xs,sm,md,lg,xl,2xl,3xl,4xl}` (named) + Tailwind 기본 |
| 반경 | `rounded-polaris-{2xs,xs,sm,md,lg,xl,2xl,pill}` (default `md` 12px) |
| 그림자 | `shadow-polaris-{xs,sm,md,lg,ai,focus}` (`ai` = AI 표면 보라 글로우, `focus` = 3px 시스템 포커스 링) |
| Z-index | `z-polaris-{base,dropdown,sticky,dim,modal,toast}` |
| Motion | `duration-polaris-{instant,fast,normal,slow}`, `ease-polaris-{in-out,out,in}` |

v0.6 / rc.0 / v0.7 alias (`bg-brand-primary`, `text-fg-primary`, `bg-surface-{canvas,raised,sunken,border}`, `bg-status-danger`, `bg-background-{normal,alternative}`, `text-polaris-display-lg` / `-h1`~`-h5` / `-body` / `-meta` / `-tiny`, `rounded-polaris-full`, `bg-blue-5` 등)는 **v0.8에서 제거됨** — 빌드 시 emit 안 되므로 dead-class. 자동 변환: `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src`. v0.7 → v0.8 자세히는 [`docs/for-consumers/migration/v0.7-to-v0.8.md`](../../docs/for-consumers/migration/v0.7-to-v0.8.md).

## 컴포넌트 (59개)

```tsx
import {
  // Tier 0 (12) — 기본 빌딩 블록
  Button, Input, Textarea, Card, Badge, Avatar, Dialog, Toast, Tabs,
  FileIcon, FileCard, NovaInput,
  // Tier 1 (6) — 셸 + 메뉴
  DropdownMenu, Tooltip, Select, Sidebar, Navbar, NavbarItem, PromptChip,
  // Tier 2 (7) — 보조 UI
  Checkbox, Switch, Skeleton, Alert, Pagination, Breadcrumb, EmptyState,
  // Tier 2.5 (5) — layout / structural
  Stack, Container, Drawer, Table, DescriptionList,
  // Tier 3 — date / overlay / command
  Popover, PopoverTrigger, PopoverContent,
  Calendar, DatePicker, DateRangePicker,                          // experimental
  CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem,  // experimental
  // Tier 3.5 (4) — feedback / utility (v0.7.4)
  Progress, CopyButton, Stat, StatGroup, Disclosure,
  // Tier 3.6 (4) — file / time inputs + pagination wrapper (v0.7.5)
  FileInput, FileDropZone,
  DateTimeInput, TimeInput,
  PaginationFooter,                                               // (Pagination 헬퍼)
  // Tier 3.7 (4) — Table helpers (v0.7.5)
  TableSearchInput, TableToolbar, TableSelectionBar, TableSkeleton,
  // Tier 3.8 (7) — page layout + extra primitives (v0.7.7)
  PageHeader, SectionHeader,
  CircularProgress,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Combobox,
  // v0.7.6 (additive props 13건은 기존 컴포넌트에 추가) + AvatarGroup 신규
  AvatarGroup,
  // 부속 (server-action friendly)
  DropdownMenuFormItem,
  // Toast imperative API
  Toaster, useToast, toast,
  // 헬퍼
  cn,
} from '@polaris/ui';
```

각 컴포넌트의 prop은 IDE에서 JSDoc으로 확인. 시각 사용 예시는 [컴포넌트 카탈로그](https://polarisoffice.github.io/PolarisDesign/#/components) 또는 [디자인 토큰 페이지](https://polarisoffice.github.io/PolarisDesign/#/tokens).

## 자주 놓치는 패턴 — discoverability cookbook

컨슈머 피드백에서 자주 “이 기능 없어서 직접 만들었어요”로 토로된 항목들. 다 이미 있습니다.

### Stack — `direction="row"`로 Inline·between 둘 다 처리

별도 `Inline`/`HStack` 없이 `Stack` 하나로 두 케이스 모두:

```tsx
import { Stack } from '@polaris/ui';

// 세로 스택
<Stack gap={3}>
  <Card>…</Card><Card>…</Card>
</Stack>

// 가로 + 양끝 정렬 (= shadcn의 `Inline`/Mantine의 `Group justify="between"`)
<Stack direction="row" justify="between" align="center">
  <h2>제목</h2>
  <Button>액션</Button>
</Stack>
```

`gap`, `align`, `justify`, `wrap`, `asChild` 모두 지원. 거의 모든 페이지 레이아웃이 `Stack` + `Container` + `Card` 셋으로 해결됩니다.

### Card — header/footer 슬롯

`<Card variant="padded">` 한 번에 끝내거나 기본(`bare`) variant + 슬롯 분리:

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from '@polaris/ui';

<Card>
  <CardHeader>
    <CardTitle>링크 분석</CardTitle>
    <CardDescription>지난 7일 기준</CardDescription>
  </CardHeader>
  <CardBody>{/* 본문 */}</CardBody>
  <CardFooter>{/* 액션 / 통계 */}</CardFooter>
</Card>
```

각 슬롯은 spec 토큰으로 패딩·텍스트 색을 정해두니, `.panel h2` 같은 자체 CSS를 쓸 필요 없습니다.

### Input — `label`·`helperText`·`error` 표준

```tsx
<Input
  label="묶음 이름"                 // floating label (rc.0의 above-label 대체)
  helperText="공유 시 상대에게 표시됨" // below input, label-alternative
  error={errors.name?.message}     // ⚠ 아이콘 + state-error 자동, ARIA invalid 자동
  placeholder="2025-Q4"
/>
```

v0.8에서 `hint` → `helperText`로 rename — Input / Textarea / Switch / Checkbox / FileInput / FileDropZone / DateTimeInput / TimeInput 8종 모두 동일. HTML spec / shadcn 컨벤션 정렬. 옛 코드는 `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` 한 번이면 자동 변환.

### Toast — imperative API 한 줄 호출

```tsx
import { toast } from '@polaris/ui';

toast({ title: '복사됨', description: '클립보드에 저장되었습니다.' });
toast({ variant: 'destructive', title: '저장 실패', description: err.message });
```

setup은 한 번:

```tsx
import { Toaster } from '@polaris/ui';
// app/layout.tsx
<Toaster />
```

`useToast()` hook으로 dismiss/update도 가능.

### EmptyState — `action` slot

```tsx
<EmptyState
  title="아직 업로드한 파일이 없어요"
  description="첫 파일을 업로드하면 분석이 시작됩니다."
  action={<Button>파일 업로드</Button>}
/>
```

CTA 버튼 전용 슬롯이 이미 있습니다.

### DropdownMenuFormItem — server action을 메뉴 안에서 안전하게

`DropdownMenuItem` 안에 form을 직접 넣으면 Radix가 form을 unmount해서 submit이 안 터지는 race가 있는데, `DropdownMenuFormItem`이 이를 처리해줍니다.

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuFormItem } from '@polaris/ui';

<DropdownMenu>
  <DropdownMenuTrigger>…</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuFormItem
      action={signOut}             // server action 또는 string URL
      destructive
      icon={<LogOut className="h-4 w-4" />}
    >
      로그아웃
    </DropdownMenuFormItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Disclosure — 셰브론 회전이 빌트인된 collapsible

```tsx
import { Disclosure } from '@polaris/ui';

<Disclosure title="고급 설정">
  <Stack gap={2}>{/* fields */}</Stack>
</Disclosure>
```

`<details>` + 자체 CSS 안 만들어도 됨. 키보드/ARIA + 셰브론 180° 회전 다 처리.

### CopyButton — clipboard + 1.5s 성공 피드백 + ARIA

```tsx
import { CopyButton } from '@polaris/ui';

<CopyButton text={shareUrl}>링크 복사</CopyButton>
<CopyButton text={shareUrl} iconOnly aria-label="공유 URL 복사" />
```

`navigator.clipboard` 폴백 처리 + `aria-live="polite"` + 자동 idle 복귀까지 일체.

### Progress — determinate / indeterminate

```tsx
<Progress value={47} aria-label="파일 업로드" />          {/* determinate */}
<Progress aria-label="문서 분석 중" />                     {/* indeterminate */}
<Progress value={100} tone="success" aria-label="완료" />  {/* tone */}
```

`tone`: `accent`(default) / `success` / `warning` / `danger` / `ai`.
`size`: `sm` / `md`(default) / `lg`. 인디터미네이트는 `prefers-reduced-motion`을 자동 존중.

### Stat — KPI 타일 + StatGroup

`Stat`은 카드 안에서 단일 KPI를 표시. 여러 개를 한 row에 가지런히 정렬할 땐 `<StatGroup>` (auto-rows-fr로 helper 텍스트 유무에 상관없이 같은 높이):

```tsx
import { Stat, StatGroup } from '@polaris/ui';

<StatGroup cols={4}>
  <Stat label="조회수" value={1234567} delta="+12%" deltaVariant="positive" />
  <Stat label="고유 방문" value={892} />
  <Stat label="매출" value={3500000} numberLocale="ko-KR"
        numberFormat={{ style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }} />
  <Stat label="차단" value={7} helper="지난 7일" />
</StatGroup>
```

`value`가 **number / bigint이면 `Intl.NumberFormat`으로 자동 포맷** — `1234567` → `"1,234,567"`. `numberLocale` / `numberFormat`으로 currency·percent 등 커스터마이즈. 이미 포맷한 string ("1.2M") 또는 ReactNode를 넘기면 그대로 통과.

### Disclosure — heading semantics

기본은 plain `<button>` 트리거이지만 FAQ / 설정 그룹 / docs 섹션처럼 **screen-reader heading 목록 (NVDA/JAWS의 H 키)에 노출되어야 하는** 경우 `headingLevel`로 시맨틱 wrap:

```tsx
<Disclosure title="결제 관련" headingLevel="h2">...</Disclosure>
<Disclosure title="보안 / 로그인" headingLevel="h2">...</Disclosure>
```

`<button>` 자체는 그대로라 `aria-expanded` / 키보드는 동일. heading은 layout-transparent (`className="contents"`).

### Badge — `outline` 톤

`subtle`(기본)·`solid` 외 **`outline`** 톤이 v0.7.5에 추가됐습니다. 비활성/초안/위반같은 *passive* 상태에 적합 — subtle처럼 사라지지 않고 solid처럼 무게 잡지도 않음:

```tsx
<Badge variant="danger" tone="outline">정책 위반</Badge>
<Badge variant="neutral" tone="outline">초안</Badge>
```

### Pagination — `<PaginationFooter>` 한 줄 통합

페이지 번호 + "X-Y of N" 인디케이터 + 페이지사이즈 셀렉터를 한 row로 묶어주는 wrapper. 컨트롤드 패턴:

```tsx
import { PaginationFooter } from '@polaris/ui';

<PaginationFooter
  page={page}
  pageSize={pageSize}
  total={total}
  onPageChange={setPage}
  onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

각 영역은 prop으로 끄기 가능 — `showTotal={false}`로 인디케이터 숨김, **`showPageSize={false}`로 셀렉터 숨김** (외부 컨트롤이 페이지 사이즈를 갖고 있을 때). 라벨은 `labels` prop으로 i18n.

### Table — `<TableHead sortable>` 빌트인

```tsx
import { TableHead, type TableSortDirection } from '@polaris/ui';

const [sort, setSort] = useState<{ key: string; dir: TableSortDirection }>({ key: 'name', dir: 'asc' });

<TableHead
  sortable
  sortDirection={sort.key === 'name' ? sort.dir : null}
  onSortChange={(dir) => setSort({ key: 'name', dir })}
>
  이름
</TableHead>
```

- `aria-sort`(`ascending`/`descending`/`none`)와 chevron 아이콘이 자동 동기화 (WCAG 1.4.1 — 색상만으로 sort 상태 전달 X)
- 사이클 기본값: `null → asc → desc → null`. `cycle={['asc', 'desc']}`로 2-state 강제 가능
- `sortable` 미전달 시 기존 동작 그대로 — 마이그레이션 없음

### Table — toolbar / selection / skeleton 패턴

업무용 SaaS 테이블의 표준 chrome:

```tsx
import { TableToolbar, TableSelectionBar, TableSkeleton } from '@polaris/ui';

// 검색 + 빠른 필터 chip + 우측 액션
<TableToolbar
  search={query} onSearchChange={setQuery}
  searchPlaceholder="이름·이메일 검색"
  searchDebounceMs={200}
  chips={[
    { value: 'all',    label: '전체',  count: 240 },
    { value: 'active', label: '활성',  count: 198 },
    { value: 'paused', label: '비활성', count: 42  },
  ]}
  activeChip={status} onChipChange={setStatus}
  actions={<Button size="sm"><PlusIcon />새 항목</Button>}
/>

// 행 선택 시 toolbar 자리에 교체
{selected.length > 0 && (
  <TableSelectionBar
    count={selected.length}
    onCancel={() => setSelected([])}
    actions={<>
      <Button variant="tertiary" size="sm">내보내기</Button>
      <Button variant="danger" size="sm">삭제</Button>
    </>}
  />
)}

// 로딩 상태
{loading ? <TableSkeleton rows={5} columns={4} /> : <Table>…</Table>}
```

`TableSearchInput`은 단독으로도 export됨 (카드 헤더 등에서 사용). `debounceMs` prop으로 라이브 검색 디바운스, `clearable`(기본 `true`)로 × 버튼 자동.

### Table cookbook — 자주 묻는 패턴 (별도 컴포넌트 X)

이미 있는 컴포넌트 조합으로 해결되니 신규 export 안 만들었습니다:

```tsx
// 1. 행별 ⋯ 액션 메뉴 — TableCell + DropdownMenu
<TableCell className="text-right">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" aria-label={`${row.name} 액션`}>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem><PencilLineIcon />수정</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive><DeleteIcon />삭제</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>

// 2. 행 선택 — TableHead + TableCell에 Checkbox
<TableHead className="w-12">
  <Checkbox
    checked={selected.length === rows.length ? true : selected.length > 0 ? 'indeterminate' : false}
    onCheckedChange={(v) => setSelected(v === true ? rows.map(r => r.id) : [])}
    aria-label="모두 선택"
  />
</TableHead>
// ...
<TableCell>
  <Checkbox checked={selected.includes(row.id)} onCheckedChange={(v) => /* ... */} aria-label={`${row.name} 선택`} />
</TableCell>

// 3. 빈 상태 — TableBody 안에 colSpan으로 EmptyState
<TableBody>
  {rows.length === 0 ? (
    <TableRow>
      <TableCell colSpan={columns.length} className="py-12">
        <EmptyState
          title="결과가 없습니다"
          description="필터 조건을 변경해보세요"
          action={<Button onClick={resetFilters}>필터 초기화</Button>}
        />
      </TableCell>
    </TableRow>
  ) : rows.map((row) => /* ... */)}
</TableBody>

// 4. 컬럼 가시성 토글 — TableToolbar actions 슬롯 + DropdownMenu + Checkbox
<TableToolbar
  search={...}
  actions={
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="tertiary" size="sm"><SettingsIcon />컬럼</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {columnDefs.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={visible.includes(col.key)}
            onCheckedChange={(v) => /* toggle */}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  }
/>
```

### FileInput / FileDropZone

**간단 케이스** — 트리거 버튼 + 선택 파일명:

```tsx
<FileInput
  label="첨부 파일"
  accept=".pdf,.docx"
  multiple
  onFilesChange={setFiles}
  error={errors.files?.message}
/>
```

**드래그&드롭 + 파일 형식/크기 검증**:

```tsx
<FileDropZone
  accept=".pdf,.docx"
  multiple
  maxSize={10 * 1024 * 1024}            // 10 MB
  onFilesChange={(files) => upload(files)}
  onReject={(rejections) => toast({ variant: 'destructive', title: rejections[0].reason })}
/>
```

`onReject` 콜백은 `{ file, code: 'file-too-large' | 'file-invalid-type', reason }` 배열 — toast로 띄우기 좋음. ARIA `role="button"` + Enter/Space 키로 picker 열기 + `:focus-visible`에 `shadow-polaris-focus` 자동.

### DateTimeInput / TimeInput

`<DatePicker>`(Popover + Calendar UI)와 별개로, **만료일 / 알림 시각** 같은 단순 case에는 native input wrapper 사용:

```tsx
<DateTimeInput label="만료일" helperText="브라우저 시간대 기준"
  value={value} onChange={(e) => setValue(e.target.value)} />
<TimeInput label="알림 시각" value="09:30" onChange={(e) => setT(e.target.value)} />
```

- 모바일에서 OS native picker (iOS 휠 / Android 시간 picker) 자동
- i18n / 12h vs 24h 표시는 브라우저가 처리
- 값 형식: datetime-local = `YYYY-MM-DDTHH:MM`, time = `HH:MM` (24h)

### Navbar — `<NavbarItem>` active 상태 빌트인

이전엔 `<NavbarNav>` 안에 raw `<a className="px-3 py-1.5 ... bg-accent-brand-normal-subtle text-accent-brand-normal">`를 매번 직접 작성했어요. `NavbarItem`은 SidebarItem과 같은 API:

```tsx
import { Navbar, NavbarBrand, NavbarNav, NavbarItem, NavbarActions } from '@polaris/ui';
// Next.js App Router
const pathname = usePathname();
const isActive = (href: string, exact = false) =>
  exact ? pathname === href : pathname.startsWith(href);

<Navbar>
  <NavbarBrand>...</NavbarBrand>
  <NavbarNav>
    <NavbarItem asChild active={isActive('/dashboard', true)}>
      <Link href="/dashboard">대시보드</Link>
    </NavbarItem>
    <NavbarItem asChild active={isActive('/docs')} icon={<Sparkles />}>
      <Link href="/docs">문서</Link>
    </NavbarItem>
  </NavbarNav>
  <NavbarActions>...</NavbarActions>
</Navbar>

// 또는 라우터 없이 정적 <a href>
<NavbarItem href="/dashboard" active={pathname === '/dashboard'}>대시보드</NavbarItem>
```

활성 매칭(exact vs prefix)은 컨슈머가 넘김 — 라우터 신호가 프레임워크별로 다르니 컴포넌트가 라우터에 결합되면 안 됨. `aria-current="page"` + brand 틴트 자동.

### `shadow-polaris-focus` — 커스텀 인터랙티브 요소의 시스템 포커스 링

`Button`/`Input` 외 직접 만든 클릭 가능한 요소에:

```tsx
<div
  role="button"
  tabIndex={0}
  className="rounded-polaris-md focus-visible:outline-none focus-visible:shadow-polaris-focus"
>
  …
</div>
```

`box-shadow: 0 0 0 3px ...` 패턴을 매번 손코드 짜지 않아도 됨. 다크모드는 자동 alpha 조정.

## 토큰 시맨틱 — `label.*` vs `state.*`

| 그룹 | 의미 | 사용 |
|---|---|---|
| `label.*` | 일반 텍스트·아이콘 색상 위계 | `text-label-{normal\|neutral\|alternative\|assistive\|inverse\|disabled}` |
| `state.*` | 상태(success/warning/error/info)를 나타내는 텍스트·배경 | `text-state-{success\|warning\|error\|info}`, `bg-state-{...}-bg` |

→ "위반 라벨"용으로 `label-danger` 같은 토큰은 **없습니다** (시맨틱 흐려짐). 위반/오류 텍스트 = `text-state-error`(혹은 `state-warning`). 단, **state 컬러 텍스트는 작은 텍스트 단독 사용 금지** — 반드시 아이콘 동반(WCAG 1.4.1). 이 규칙은 `@polaris/lint`의 `state-color-with-icon` 룰로 자동 검출됩니다.

## 다크모드

- **CSS 토큰은 모두 light/dark 페어로 정의**되어 있어서 `data-theme="dark"`만 토글하면 자동 전환됩니다. 컴포넌트가 토큰 클래스(`bg-background-base`, `text-label-normal` 등)만 쓰면 추가 작업 0.
- **자동 대응되지 않는 케이스**: `color-mix()`로 토큰을 즉석 합성하거나, `rgba(...)` 하드코딩, `style={{ color: '#fff' }}` 같은 인라인 스타일은 다크에서 깨집니다. → `@polaris/lint`의 `no-hardcoded-color` / `no-arbitrary-tailwind` 룰이 검출.
- **그림자도 light/dark 페어**: `shadow-polaris-md` 등은 두 테마 자동 매칭. 직접 `box-shadow: 0 4px ...` 쓰면 다크에서 안 보임.
- **포커스 링도 다크 자동 대응**: `shadow-polaris-focus`는 light에서 alpha 35%, dark에서 45%로 컨트라스트 자동 조정.

### Surface elevation 단계 (v0.7.5 → v0.8 정리)

다크모드에서 카드 위 카드 / popover 위 카드 같은 **계층 elevation**이 필요할 때 (light는 모두 흰색 — 깊이는 shadow로 표현):

| 클래스 | 역할 | dark mode | 비고 |
|---|---|---|---|
| `bg-background-base` | 페이지 배경 (가장 깊음) | `#0B0B12` | v0.7 alias `bg-surface-canvas` 제거됨 |
| `bg-fill-neutral` | 페이지 안 inset (well, code) | `#131320` | v0.7 alias `bg-surface-sunken` 제거됨 |
| `bg-layer-surface` | 카드, 패널 | `#1B1B2A` | v0.7 alias `bg-surface-raised` 제거됨 |
| `bg-surface-popover` | popover, 메뉴, 드롭다운 | `#232336` | v0.7.5 신규 elevation tier — v0.8에서도 유지 |
| `bg-surface-modal` | 모달, dialog, 시트 | `#2D2D45` | v0.7.5 신규 elevation tier — v0.8에서도 유지 |

→ `color-mix(...)`로 즉석 elevation 합성 안 해도 됨. `surface-popover` / `surface-modal`은 *진짜 elevation 토큰*이라 v0.8 alias 청소 대상이 아님 — `surface-canvas/raised/sunken`만 제거됐습니다.

### Subpath imports — 필요한 사람만

루트 bundle을 가볍게 유지하기 위해 일부 컴포넌트는 별도 subpath로 분리됩니다.

```tsx
// 폼 (react-hook-form + zod 의존)
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage,
} from '@polaris/ui/form';

// 리본 / 에디터 툴바 (Office 도큐먼트 · MD 에디터 · 스프레드시트 · PDF 등)
import {
  Ribbon, RibbonTabs, RibbonTabList, RibbonTab, RibbonContent,
  RibbonGroup, RibbonStack, RibbonRow,
  RibbonSeparator, RibbonRowDivider,
  RibbonButton, RibbonMenuButton, RibbonSplitButton,
  RibbonToggleGroup, RibbonToggleItem,
} from '@polaris/ui/ribbon';

// v0.7+ — 디자인팀 SVG 자산
// UI 아이콘 65종 × 18/24/32 px (모노크롬, currentColor)
import { ArrowDownIcon, ChevronRightIcon, SearchIcon, BellIcon } from '@polaris/ui/icons';
<ArrowDownIcon size={16} className="text-label-neutral" />

// 파일 타입 29종 (멀티컬러 baked-in)
import { DocxIcon, FolderIcon, ZipIcon } from '@polaris/ui/file-icons';
<DocxIcon size={40} />

// 로고
import { PolarisLogo, NovaLogo } from '@polaris/ui/logos';
<PolarisLogo variant="horizontal" size={32} />
<NovaLogo tone="white" />

// 리본 전용 아이콘 91종 (57 big × 32 + 34 small × 16 px, 멀티컬러 baked-in)
// 큰/작은 set은 별도로 디자인됨 — 같은 슬러그가 두 set에 동시에 존재하지 않음.
// `RIBBON_ICON_REGISTRY`로 슬러그→컴포넌트 동적 lookup, `RIBBON_ICON_BIG_SLUGS`/
// `RIBBON_ICON_SMALL_SLUGS` Set으로 어느 set에 속하는지 판별.
import { BoldIcon, AiChatIcon, PasteIcon } from '@polaris/ui/ribbon-icons';
<BoldIcon />              // 16 × 16 (small native — sm/md 리본 버튼용)
<AiChatIcon />            // 32 × 32 (big native — lg 리본 버튼용)
<PasteIcon size={20} />   // size prop으로 균등 스케일
```

전체 아이콘 카탈로그: [`/icons` 페이지](https://polarisoffice.github.io/PolarisDesign/#/icons).

### 글로벌 Provider

Toast / Tooltip을 쓰려면 앱 최상위에 Provider를 두세요:

```tsx
import { ToastProvider, ToastViewport, TooltipProvider } from '@polaris/ui';

<TooltipProvider delayDuration={200}>
  <ToastProvider swipeDirection="right">
    {children}
    <ToastViewport />
  </ToastProvider>
</TooltipProvider>
```

`packages/template-next/app/layout.tsx`에 동일 패턴이 들어있습니다.

### Next.js 호환

이 패키지의 dist는 `'use client'`로 시작합니다. RSC 환경에서 server component가 import해도 안전 (Next.js가 client boundary로 처리).

## 개발

이 패키지를 직접 빌드하려면:

```sh
pnpm --filter @polaris/ui build      # tsup ESM/CJS + .d.ts
pnpm --filter @polaris/ui typecheck
pnpm --filter @polaris/ui test       # vitest 18 + node:test 3 = 21건
```
