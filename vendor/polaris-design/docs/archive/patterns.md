# 자주 헷갈리는 패턴 정리

대부분 한두 줄짜리 결정이지만, 실제 코드에서 반복적으로 묻게 되는 것들.

---

## 1. Toast vs Alert

같은 5가지 status variant를 가지지만, 사용 의도가 다릅니다.

| | Toast | Alert |
|---|---|---|
| 수명 | ephemeral (4초 자동 dismiss) | persistent (사용자 dismiss 또는 페이지 변경) |
| 위치 | 우상단 viewport (overlay) | 인-라인 콘텐츠 영역 |
| 사용 상황 | "변경 직후 피드백" | "현재 상태 컨텍스트 통지" |
| 예시 | `저장됨`, `복사됨`, `변경 사항 적용` | `권한 부족 — 관리자에게 요청하세요`, `RPC 5xx — 잠시 후 재시도`, `구독 7일 후 만료` |
| 액션 | 1개까지 (`Undo`) | 0~2개 (Dismiss + 해결 액션) |

직접 호출 패턴:
```tsx
// Toast — 액션 직후
import { toast } from '@polaris/ui';
await save(); toast({ title: '저장됨', variant: 'success' });

// Alert — 페이지 컨텍스트
{!user.canEdit && (
  <Alert variant="warning">
    <AlertTitle>편집 권한이 없습니다</AlertTitle>
    <AlertDescription>관리자에게 권한을 요청하세요.</AlertDescription>
  </Alert>
)}
```

---

## 2. `border-surface-border` vs `border-surface-border-strong`

두 토큰 다 surface 위 분리선이지만 시각 강도가 다릅니다.

| 토큰 | 사용처 |
|---|---|
| `border-surface-border` | **Card·Dialog·Drawer·Table 등 컨테이너 외곽**. 내부 구획. 가장 흔한 default. |
| `border-surface-border-strong` | **Input·Textarea·Select·Checkbox 등 인터랙션 가능한 폼 요소의 idle 상태**. 사용자가 "여기 클릭/입력 가능" 인지하게 함. focus 시 `brand-primary`로 전환. |

라이트 모드에서 `border` = `neutral-200` (#E8E8EE), `border-strong` = `neutral-300` (#D5D5DE) — 약 한 단계 진함.

**규칙**: 컨테이너는 `border`, 폼 요소는 `border-strong`. 이 외에 직접 쓸 일은 거의 없습니다.

---

## 3. Opacity modifier 패턴 (`bg-status-success/15`)

상태 토큰을 배경/테두리에 약하게 깔고 싶을 때.

```tsx
// 5% — 가장 약한 배경 (banner, alert backdrop)
<div className="bg-status-success/5 ..." />

// 10-15% — 토스트, 알림 카드의 tinted bg
<div className="bg-status-success/10 border-l-2 border-status-success ..." />

// 30-50% — divider, accent border (덜 권장)
<div className="border-status-success/30 ..." />

// solid — 강조 액션, 인디케이터
<div className="bg-status-success text-fg-on-status ..." />
```

**가이드라인:**
- **/5 ~ /10** — 배경 (alert, toast tinted bg)
- **/15 ~ /20** — warning은 색이 약해서 한 단계 강하게 (`/15` ~ `/20`)
- **solid** — 카운트 인디케이터, 진행 상태 dot
- **테두리 + 배경 조합** — 항상 `border-color`를 `bg-color`보다 진하게 (예: `bg-status-success/10 border-status-success`)

`color-mix()` 기반이라 라이트/다크 모두 동작합니다.

### 자주 쓰이는 톤별 alias 후보 (v0.4+ 검토 중)

```
bg-status-success-subtle  ≡ bg-status-success/15
text-status-success-strong ≡ text-status-success
```

당분간은 alpha modifier 직접 사용을 권장. alias를 추가하면 4개 status × 2개 톤 = 토큰 8개가 늘어나서 surface 비용이 큼.

---

## 4. Card 사용 패턴

세 가지 패턴 중 하나 선택:

```tsx
// (A) 단순 — 한 블록, 자체 padding
<Card variant="padded">
  <h3>제목</h3>
  <p>본문</p>
</Card>

// (B) 섹션 분리 — header / body / footer
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardBody>본문</CardBody>
  <CardFooter><Button>액션</Button></CardFooter>
</Card>

// (C) asChild — semantic element 유지
<Card asChild>
  <article>
    <CardBody>전체 사용 콘텐츠</CardBody>
  </article>
</Card>
```

(A)는 빠르고 단순한 정보 카드, (B)는 액션이 있는 카드, (C)는 article·section 의미를 살려야 할 때.

---

## 5. Pagination — client state vs URL-driven

### Client state (SPA, 인페이지 페이징)
```tsx
const [page, setPage] = useState(1);

<Pagination>
  <PaginationPrev onClick={() => setPage(p => p - 1)} disabled={page === 1} />
  {pages.map(n => (
    <PaginationItem key={n} active={n === page} onClick={() => setPage(n)}>{n}</PaginationItem>
  ))}
  <PaginationNext onClick={() => setPage(p => p + 1)} disabled={page === lastPage} />
</Pagination>
```

### URL-driven (Next.js App Router, 서버 컴포넌트)
```tsx
import Link from 'next/link';

<Pagination>
  <PaginationItem asChild active={false}>
    <Link href={`?page=${page - 1}`}>이전</Link>
  </PaginationItem>
  {pages.map(n => (
    <PaginationItem key={n} asChild active={n === page}>
      <Link href={`?page=${n}`}>{n}</Link>
    </PaginationItem>
  ))}
</Pagination>
```

`asChild`를 쓰면 button 대신 NavLink/Link로 렌더되어 RSC + URL 페이징과 자연스럽게 연결됩니다.

### Ellipsis 계산 유틸리티

`pageNumberItems(current, total, siblings?)` — `[1, '…', 5, 6, 7, '…', 20]` 같은 sequence 반환:

```tsx
import { pageNumberItems, PAGE_ELLIPSIS } from '@polaris/ui';

{pageNumberItems(current, total).map((item, i) =>
  item === PAGE_ELLIPSIS
    ? <PaginationEllipsis key={`ell-${i}`} />
    : <PaginationItem key={item} active={item === current} onClick={() => setPage(item)}>{item}</PaginationItem>
)}
```

---

## 6. Drawer vs Dialog

같은 Radix Dialog 위에 만들었지만 시각·UX 의도가 다릅니다.

| | Dialog | Drawer |
|---|---|---|
| 위치 | 화면 중앙 | 가장자리 (right/left/top/bottom) |
| 폭 | 콘텐츠 따라 (max-w-lg default) | 한쪽 면 가득 차고 max-w-md |
| 사용 의도 | 결정 요구 (confirm/edit modal) | 보조 패널 (inspector / filter / nav) |
| 닫기 | 명시적 액션이 일반적 | overlay 클릭 + Esc로 가벼운 닫기 |
| 예시 | "삭제하시겠습니까?", 첨부 미리보기 | 테이블 행 상세, 모바일 sidebar, 필터 사이드패널 |

규칙: **사용자가 "결정"을 내려야 하면 Dialog**, **참고용 정보를 옆에서 보여주면 Drawer**. 한 화면에서 둘 다 띄우지 마세요 (focus trap이 stacking됨).

---

## 7. asChild 가능한 컴포넌트 목록

Polaris의 Radix Slot 패턴을 따라 `asChild` prop을 지원하는 컴포넌트:

| 컴포넌트 | 용도 |
|---|---|
| `Button` | `<Button asChild><Link href="...">텍스트</Link></Button>` |
| `Card` | semantic element 유지 (`<article>`, `<section>`) |
| `NavbarBrand` | 로고를 `<Link>`로 감쌀 때 |
| `PaginationItem` / `PaginationPrev` / `PaginationNext` | URL-driven pagination에서 `<Link>` |
| `Container` | `<main>`, `<section>` 등 semantic root |
| `Stack` / `HStack` / `VStack` | 같은 이유 |
| `BreadcrumbLink` | router Link 래핑 |
| `DialogTrigger` / `DropdownMenuTrigger` / `PopoverTrigger` / `DrawerTrigger` / `TooltipTrigger` (Radix 기본 제공) | trigger를 다른 컴포넌트(Button 등)로 |
| `SidebarItem` | 같은 이유 |
| `DropdownMenuItem` | 같은 이유 |

**asChild 사용 시 주의:**
- 자식은 정확히 하나의 React element여야 함 (string/array 안 됨)
- 자식 element에 `className`을 주면 `cn()`으로 자동 merge됨
- `ref`/`onClick` 등은 자식에 forward됨
