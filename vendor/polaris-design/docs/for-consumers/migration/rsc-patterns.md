# RSC (React Server Components) — 폴라리스 사용 가이드

**대상**: Next.js 13+ App Router, Astro server components 등 RSC 환경 컨슈머. 페이지네이션 / 검색 / 필터 / 탭 등을 **URL state로 풀고** `<Link href>` / `<form action>`으로 트리거하는 패턴.

**v0.8.0-rc.8 부터** 핵심 5개 컴포넌트 + 1개 utils subpath가 RSC 친화 모드를 일급 지원합니다. controlled API는 그대로 유지 — 기존 client SPA는 코드 변경 0.

> **언제 RSC 모드를 써야 하나** — 새로고침해도 상태가 유지되어야 하거나 (URL 공유 가능), SEO / 검색 인덱싱이 필요하거나, 초기 페이로드를 가볍게 유지하고 싶을 때. interactive client island가 필요한 부분은 여전히 `'use client'` 컴포넌트로 격리.

---

## 1. `@polaris/ui/utils` — server-safe 순수 함수 (rc.8 신규)

기존: `pageNumberItems` 같은 순수 함수를 import만 해도 `@polaris/ui` 본 barrel의 `"use client"` 가 따라와서 RSC 경계 침범.

이제: 별도 subpath에서 import하면 RSC 안전.

```tsx
// app/contracts/page.tsx — SERVER COMPONENT
import { pageNumberItems, PAGE_ELLIPSIS } from '@polaris/ui/utils';
import Link from 'next/link';

export default async function ContractsPage({ searchParams }) {
  const page = Number(searchParams.page ?? 1);
  const totalPages = await getTotalPages();

  // 100% server, no "use client" barrier
  const items = pageNumberItems(page, totalPages);

  return (
    <nav aria-label="Pagination">
      {items.map((it, i) =>
        it === PAGE_ELLIPSIS
          ? <span key={`e${i}`} aria-hidden>…</span>
          : <Link key={it} href={`?page=${it}`} aria-current={it === page}>{it}</Link>
      )}
    </nav>
  );
}
```

현재 utils export: `pageNumberItems`, `PAGE_ELLIPSIS`, `PageNumberItem` 타입. 추가는 PR로 (조건: React / Radix / Tailwind 의존 없는 순수 함수).

---

## 2. `<PaginationFooter>` — anchor mode (rc.8 신규)

가장 자주 막히던 컴포넌트. 두 가지 새 prop: `buildHref` / `linkAs`.

### ⚠ Server Component에서 직접 호출은 불가

**`@polaris/ui` 루트 번들은 `"use client"`** — `<PaginationFooter>` 자체가 client component입니다. 따라서:

```tsx
// 🚫 깨짐 — Next.js App Router server component
export default async function Page({ searchParams }) {
  return <PaginationFooter buildHref={(p) => `?page=${p}`} linkAs={Link} />;
  //                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^
  //   "Functions cannot be passed directly to Client Components ...
  //    unless you explicitly expose it by marking it with 'use server'."
}
```

함수 (`buildHref`) 와 React 컴포넌트 (`linkAs={Link}`) 는 RSC boundary를 못 넘습니다. 직렬화 불가.

### ✅ 패턴 A — client island (간단)

페이지네이션 전체를 `'use client'` 파일에 격리. server는 `page` / `pageSize` / `total` 같은 *serializable* 값만 전달:

```tsx
// app/contracts/page.tsx (SERVER COMPONENT)
import { ContractsPagination } from './pagination-island';

export default async function Page({ searchParams }) {
  const page = Number(searchParams.page ?? 1);
  const total = await getTotalCount();

  return (
    <main>
      <h1>계약 목록</h1>
      {/* server-rendered list ... */}
      <ContractsPagination page={page} total={total} pageSize={20} />
    </main>
  );
}

// app/contracts/pagination-island.tsx (CLIENT COMPONENT)
'use client';
import Link from 'next/link';
import { PaginationFooter } from '@polaris/ui';

export function ContractsPagination({ page, total, pageSize }) {
  return (
    <PaginationFooter
      page={page} pageSize={pageSize} total={total}
      buildHref={(p) => `?page=${p}`}  // OK — client island scope
      linkAs={Link}
    />
  );
}
```

**장점**: server가 모든 state (`page` / `total` / fetch) 를 결정. client island는 단순 렌더 + 클릭 navigation. URL이 바뀌면 server가 새 `page` 로 island 다시 렌더.

**단점**: 작은 wrapper 파일 하나 추가됨. 단 파일 5줄짜리라 부담은 거의 0.

### ✅ 패턴 B — pure RSC + utils (PaginationFooter 안 씀)

`@polaris/ui/utils` 의 `pageNumberItems`로 server에서 직접 `<Link>` 조립. PaginationFooter 시각을 *원하는 그대로* 흉내 내야 하지만, client boundary 자체가 사라짐:

```tsx
// app/contracts/page.tsx (SERVER COMPONENT)
import { pageNumberItems, PAGE_ELLIPSIS } from '@polaris/ui/utils';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export default async function Page({ searchParams }) {
  const page = Number(searchParams.page ?? 1);
  const pageSize = 20;
  const total = await getTotalCount();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = pageNumberItems(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1 font-polaris">
      <Link
        href={`?page=${Math.max(1, page - 1)}`}
        aria-label="이전 페이지"
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-polaris-md px-3 text-polaris-body2 font-medium text-label-normal hover:bg-accent-brand-normal-subtle"
        aria-disabled={page <= 1}
      >
        ‹
      </Link>
      {items.map((it, i) =>
        it === PAGE_ELLIPSIS ? (
          <span key={`e${i}`} aria-hidden className="px-2">…</span>
        ) : (
          <Link
            key={it}
            href={`?page=${it}`}
            aria-current={it === page ? 'page' : undefined}
            className={cn(
              'inline-flex h-9 min-w-9 items-center justify-center rounded-polaris-md px-3 text-polaris-body2 font-medium',
              it === page
                ? 'bg-accent-brand-normal text-label-inverse'
                : 'text-label-normal hover:bg-accent-brand-normal-subtle',
            )}
          >
            {it}
          </Link>
        )
      )}
      <Link
        href={`?page=${Math.min(totalPages, page + 1)}`}
        aria-label="다음 페이지"
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-polaris-md px-3 text-polaris-body2 font-medium text-label-normal hover:bg-accent-brand-normal-subtle"
        aria-disabled={page >= totalPages}
      >
        ›
      </Link>
    </nav>
  );
}
```

**장점**: server가 끝까지 책임짐. JS 페이로드 0 (Link 만 client 추후 hydrate).

**단점**: 시각 결정을 *직접 className으로* 해야 함. PaginationFooter 의 pageSize 셀렉터 / "X-Y of N" 인디케이터 / 디자인팀 spec 정합은 직접 maintain.

### 어떤 패턴을 선택할까

| 우선순위 | 선택 |
|---|---|
| **시각 일관성 + 빠른 적용** | 패턴 A (client island) — 5줄 wrapper로 끝 |
| **server boundary 끝까지 / JS bundle 최소화 / SEO** | 패턴 B (utils + raw Link) |
| **혼용** | 같은 페이지에서 일부는 A, 일부는 B — 카드 lists 마다 다르게 |

> 두 패턴 모두 작동. 폴라리스 시스템이 강제하지 않습니다 — use case 따라 선택.

### controlled mode + anchor mode 동시 사용 (client island 안에서)

```tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PaginationFooter } from '@polaris/ui';

export function ContractsPagination({ page, total, pageSize }) {
  const router = useRouter();
  return (
    <PaginationFooter
      page={page} pageSize={pageSize} total={total}
      buildHref={(p) => `?page=${p}`}
      onPageChange={(p) => {
        // 추가 동작 — optimistic UI / 스크롤 / 분석 등.
        // 기본 anchor navigation은 그대로 일어남.
        router.refresh();
      }}
    />
  );
}
```

---

## 3. `<PaginationPrev>` / `<PaginationNext>` — asChild fix (rc.8)

이전: `<PaginationPrev asChild><Link>...</Link></PaginationPrev>` 가 `React.Children.only` 폭사 (chevron + children 두 child를 Slot에 spread해서).

이제: Radix `Slottable` 패턴 + 새 `icon` prop. asChild 깨끗하게 작동.

```tsx
// Standalone Pagination primitive with <Link>
<Pagination>
  <PaginationPrev asChild>
    <Link href="?page=1" rel="prev">이전</Link>
  </PaginationPrev>
  <PaginationItem asChild active={page === 2}>
    <Link href="?page=2">2</Link>
  </PaginationItem>
  <PaginationNext asChild>
    <Link href="?page=3" rel="next">다음</Link>
  </PaginationNext>
</Pagination>
```

**커스텀 chevron** — `icon` prop 으로 override (또는 `icon={null}` 로 제거):
```tsx
<PaginationPrev asChild icon={<ArrowLeftIcon />}>
  <Link href="?page=1">처음</Link>
</PaginationPrev>
```

---

## 4. `<TableSearchInput>` — 자동 controlled/uncontrolled 감지 (rc.8)

URL query 검색 = `<form action method="get">` 패턴. 새 props:

```tsx
// SERVER COMPONENT
export default async function ContractsPage({ searchParams }) {
  const q = String(searchParams.q ?? '');

  return (
    <form action="">
      <TableSearchInput
        name="q"                   // ← FormData 키
        defaultValue={q}            // ← 서버에서 현재 값 주입
        placeholder="계약 검색"
        // value / onValueChange 없음 — 자동으로 uncontrolled 모드
      />
      <button type="submit" hidden />
    </form>
  );
}
```

사용자가 Enter 치면 native form submit → URL이 `?q=새검색어` 로 → server 재렌더링.

**모드 자동 감지**:
- `value` 가 set이면 controlled (기존 패턴, 변동 없음)
- `value` 가 undefined면 uncontrolled — `defaultValue` 사용 + `name` 으로 form submission

**clear 버튼** — uncontrolled 모드에서도 작동. native input value를 imperatively 리셋.

---

## 5. `<TableToolbar>` — searchProps (rc.8)

TableSearchInput 을 통째로 감싸는 경우. `searchProps` 객체로 uncontrolled 모드 활성화:

```tsx
<form action="">
  <TableToolbar
    searchProps={{ name: 'q', defaultValue: q }}
    chips={[
      { value: 'all', label: '전체', count: 142 },
      { value: 'active', label: '활성', count: 89 },
    ]}
    activeChip={chip}
    // chips/actions 영역은 여전히 client interactive 또는 별도 form 로 풀음
    actions={<Button asChild><Link href="/contracts/new">+ 추가</Link></Button>}
  />
  <button type="submit" hidden />
</form>
```

**chip 영역도 RSC로 풀려면** — `activeChip` 를 searchParams에서 읽고 각 chip을 `<Link href="?chip=...">` 으로 렌더 (현재는 chip 자체는 controlled callback만 지원 — chip RSC 모드는 v0.9 후보).

---

## 6. `<Tabs>` — TabsTrigger asChild + URL routed tabs

Radix Tabs는 `asChild` 가 이미 prop으로 통과됨. RSC 패턴:

```tsx
// SERVER COMPONENT
export default async function Page({ searchParams }) {
  const tab = (searchParams.tab as string) ?? 'docs';

  return (
    <Tabs value={tab}>
      <TabsList variant="underline">
        <TabsTrigger value="docs" asChild>
          <Link href="?tab=docs">문서</Link>
        </TabsTrigger>
        <TabsTrigger value="settings" asChild>
          <Link href="?tab=settings">설정</Link>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="docs">{/* server-rendered */}</TabsContent>
      <TabsContent value="settings">{/* server-rendered */}</TabsContent>
    </Tabs>
  );
}
```

**중요**: `<Tabs value={tab}>` 가 *controlled* 라서 `value` 에 따라 어느 TabsContent 가 보일지 결정. URL 바뀌면 server 재렌더링 → 새 `value` 가 들어옴 → 자동 반영.

`<TabsTrigger asChild><Link>` 가 navigation 발생시키고, server가 새 `tab` 으로 다시 렌더.

---

## 7. 기존 RSC 친화 컴포넌트 (rc.8 이전부터 작동)

| 컴포넌트 | RSC 사용 패턴 |
|---|---|
| `<Input>` / `<Textarea>` | `<form action><Input name="title" defaultValue={...}/></form>` — native form submission |
| `<Checkbox>` / `<Switch>` | 동일. form 안에서 native submit. `defaultChecked` 사용 |
| `<Select>` (Radix) | uncontrolled `defaultValue` + `name` 또는 hidden input 패턴 — 단 모바일 RSC 시 client island 권장 |
| `<DatePicker>` | v0.7.6 부터 `name` + `valueFormat` + 자동 hidden input — `<form action>` 직결 |
| `<NavbarItem>` / `<SidebarItem>` | `asChild` + `<Link>` 자연스러움. active 상태는 server에서 `usePathname()` 대신 `<NavbarItem active={pathname.startsWith('/docs')}>` 로 결정 |
| `<Breadcrumb>` | 정적 — 모든 항목 server 렌더 가능 |
| `<Stat>` / `<StatGroup>` | 정적 — value / delta server 렌더 |
| `<Card>` / `<Container>` / `<Stack>` | 정적 — layout primitive |

---

## 8. RSC에 적합하지 않은 컴포넌트 (client island로 분리)

다음은 본질적으로 client 컴포넌트라 `'use client'` 경계 안에서 사용:

| 컴포넌트 | 이유 | RSC에서 어떻게? |
|---|---|---|
| `<Dialog>` / `<Drawer>` | open state + focus trap + 키보드 trap | trigger를 server에 두고 `<DialogContent>` 만 client island. 또는 통째로 `<form action>` 안에 두고 router-based open state |
| `<DropdownMenu>` | open/close state | client island. 메뉴 아이템들이 `<form action>` 으로 submit하는 경우 `<DropdownMenuFormItem>` (v0.7.6 신규) |
| `<Tooltip>` | hover state | client island — typically 사소한 부분이라 wrapping 부담 적음 |
| `<Combobox>` | search + cmdk client logic | client island. URL filter는 `<TableSearchInput>` 또는 별도 form |
| `<Toast>` / `<Toaster>` | imperative API + portal | 진입점에 한 번만 `<Toaster />` 두고 client island에서 `toast(...)` 호출 |
| `<Calendar>` (raw) | dayPicker 로직 | client island 또는 `<DatePicker>` (hidden input이 form 친화) |

---

## 9. 다음 단계 — v0.9 minor 후보

이 가이드는 *현재 작동 패턴*. 더 깊은 RSC 친화는 v0.9에서:

- **`<NavbarItem>` / `<TabsTrigger>` 의 `buildHref` 통일** — `asChild` 대신 더 짧은 API
- **chip 필터 RSC 모드** — `<TableToolbar chips>` 의 각 chip 을 `<Link>` 로 렌더
- **`<Combobox>` server-prefetch** — 옵션 server 렌더 + 클라이언트 hydrate 패턴
- **`<DialogTrigger>` server-friendly variant** — URL `?dialog=confirm` 기반 open state

이 항목들은 [`docs/for-contributors/roadmap.md`](../../for-contributors/roadmap.md) v0.9 섹션에 있습니다.

---

## 10. 마이그레이션 체크리스트 — controlled → uncontrolled

기존 client 컨슈머가 RSC로 점진 옮기는 경우:

- [ ] `pageNumberItems` import를 `'@polaris/ui'` → `'@polaris/ui/utils'` 로 (server에서도 사용 시)
- [ ] PaginationFooter `onPageChange` → `buildHref` + `linkAs={Link}` (필요 시 동시 유지)
- [ ] TableSearchInput `value` + `onValueChange` → `name` + `defaultValue` + `<form action>`
- [ ] TableToolbar `search/onSearchChange` → `searchProps={{ name, defaultValue }}`
- [ ] Tabs trigger 에 `<Link>` wrap (asChild)
- [ ] `'use client'` directive를 *정말 필요한* 곳에만 — Dialog / DropdownMenu / Tooltip 만
- [ ] `polaris-audit` 재실행 — 위반 0건 유지 확인
- [ ] 시각 회귀 점검 (탭 / 페이지네이션 prev-next disabled 상태 등)

각 패턴이 작동하는 작은 PR 단위로 옮기는 게 안전. 한 번에 다 옮기지 말 것.
