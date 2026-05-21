# Next.js App Router 통합 가이드

`@polaris/ui` v0.3+를 Next.js 15 App Router (RSC + Server Actions) 환경에서 사용할 때의 패턴 모음.

---

## 1. RSC 호환

`@polaris/ui` 컴포넌트는 모두 **client component** (`'use client'` 자동 prepend). 이걸 RSC에서 import해도 안전합니다 — Next.js가 client boundary로 자동 처리.

```tsx
// app/dashboard/page.tsx — Server Component (default)
import { Card, CardBody, Button } from '@polaris/ui';

export default async function Dashboard() {
  const data = await fetchData(); // 서버에서 fetch
  return (
    <Card variant="padded">
      <h2>{data.title}</h2>
      <Button>액션</Button>  {/* 자동으로 client */}
    </Card>
  );
}
```

**주의 — children 패턴 활용:** Card나 Container 같은 layout 컴포넌트에 server component를 children으로 넘기면, children은 server에서 렌더되고 wrapper만 client로 hydrate됩니다.

```tsx
// 효율적 — DataPanel은 server에서 fetch + render
<Card variant="padded">
  <DataPanel /> {/* server component, 데이터 그대로 직렬화 */}
</Card>
```

---

## 2. Theme: SSR-safe 다크 모드

`packages/template-next`가 보여주는 패턴 — 쿠키 + DOM이 source of truth, React state 미사용.

```tsx
// app/layout.tsx
import { cookies } from 'next/headers';

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('polaris-theme')?.value === 'dark' ? 'dark' : 'light';
  return (
    <html lang="ko" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// components/theme-toggle.tsx
'use client';
export function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.cookie = `polaris-theme=${next}; path=/; max-age=31536000; samesite=lax`;
  };
  return <Button variant="tertiary" size="sm" onClick={toggle}>...</Button>;
}
```

장점: 첫 페인트부터 올바른 테마 (no flash), `useState`/`useEffect` 없음 (React 19의 `react-hooks/set-state-in-effect` 경고 회피).

---

## 3. Server Actions + Form

폴라리스 표준은 **react-hook-form + zod** (사내 합의 기준). 단, RSC에서 server action을 직접 form에 묶는 경우엔 RHF 없이 native form으로 충분.

### Native form + server action
```tsx
// app/contracts/[id]/page.tsx
import { Input, Button } from '@polaris/ui';

async function updateContract(formData: FormData) {
  'use server';
  await db.contract.update({ ... });
  revalidatePath(`/contracts/${id}`);
}

export default function ContractEdit() {
  return (
    <form action={updateContract}>
      <Input name="title" label="계약 제목" required />
      <Button type="submit">저장</Button>
    </form>
  );
}
```

`<button type="submit">`은 우리 lint가 `allowFormSubmit: true` (default)로 native 사용을 허용 — `<Button>`이 그대로 통과합니다.

### RHF + zod (client-side validation, 사내 표준)
복잡한 폼은 v0.4에 추가된 `Form`/`FormField` 컴포넌트 사용. **`@polaris/ui/form` subpath**에서 import (root barrel은 RHF 없이도 동작하도록 분리됨):

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@polaris/ui';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage,
} from '@polaris/ui/form';

const schema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않습니다'),
  password: z.string().min(8, '8자 이상'),
});

export function LoginForm() {
  const form = useForm({ resolver: zodResolver(schema) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl><Input type="password" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">로그인</Button>
      </form>
    </Form>
  );
}
```

`FormLabel`이 자동으로 input과 `htmlFor`를 wire-up하고, error 시 색이 status-danger로 전환됩니다. `<FormMessage />`는 RHF의 `errors`를 직접 읽어 표시.

> 단순 한 줄 입력은 `Input`의 `label`/`hint`/`error` props만 써도 충분 — Form 컴포넌트는 다중 필드일 때 가치가 큼.

---

## 4. DropdownMenu에서 Server Action submit

로그아웃, 세션 종료 같은 메뉴 항목이 server action을 트리거할 때:

```tsx
'use client';
import { signOut } from '@/auth/actions'; // server action
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuFormItem } from '@polaris/ui';
import { LogOut } from 'lucide-react';

<DropdownMenu>
  <DropdownMenuTrigger>...</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuFormItem
      action={signOut}
      destructive
      icon={<LogOut className="h-4 w-4" />}
    >
      로그아웃
    </DropdownMenuFormItem>
  </DropdownMenuContent>
</DropdownMenu>
```

`DropdownMenuFormItem`이 race condition (Radix의 close behavior vs form submit)을 자동으로 처리. 직접 form을 child로 넣으면 form이 unmount되어 submit이 누락될 수 있습니다.

---

## 5. URL-driven Pagination

Next.js searchParams 기반 페이지네이션 — `<Link>`로 RSC 호환:

```tsx
// app/contracts/page.tsx (Server Component)
import Link from 'next/link';
import { Pagination, PaginationItem, PaginationPrev, PaginationNext } from '@polaris/ui';

export default async function Contracts({ searchParams }) {
  const page = Number((await searchParams).page ?? 1);
  const { rows, total } = await fetchContracts(page);
  const lastPage = Math.ceil(total / 20);

  return (
    <>
      {/* ... rows ... */}
      <Pagination>
        <PaginationItem asChild>
          <Link
            href={`?page=${page - 1}`}
            aria-disabled={page === 1}
          >이전</Link>
        </PaginationItem>
        {[1, 2, 3, 4, 5].map(n => (
          <PaginationItem key={n} asChild active={n === page}>
            <Link href={`?page=${n}`}>{n}</Link>
          </PaginationItem>
        ))}
        <PaginationItem asChild>
          <Link
            href={`?page=${page + 1}`}
            aria-disabled={page === lastPage}
          >다음</Link>
        </PaginationItem>
      </Pagination>
    </>
  );
}
```

`asChild`를 쓰면 button이 아닌 anchor로 렌더되어 prefetch + RSC + 브라우저 history 통합이 자연스럽게 됩니다.

---

## 6. Loading & Suspense

`Skeleton`을 Suspense fallback으로:

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { Card, CardBody, Skeleton } from '@polaris/ui';

export default function Dashboard() {
  return (
    <Card variant="padded">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
```

---

## 7. Drawer for table-row detail (Inspector pattern)

테이블 행을 클릭하면 우측에 상세가 슬라이드 인 — 화면 navigation 없이 in-place 편집:

```tsx
'use client';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody } from '@polaris/ui';
import { Table, TableRow, TableCell } from '@polaris/ui';

<Table>
  <TableBody>
    {rows.map(row => (
      <Drawer key={row.id}>
        <DrawerTrigger asChild>
          <TableRow className="cursor-pointer">
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        </DrawerTrigger>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle>{row.name}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            {/* form, description list, etc. */}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    ))}
  </TableBody>
</Table>
```

---

## 8. 알려진 한계

- **Tailwind v3 only** — Next.js 16+ 기본인 Tailwind v4를 쓰려면 [tailwind-v4-migration.md](tailwind-v4.md) 참고. v0.4에서 v4-네이티브 preset 예정.
- **외부 클론 시 `workspace:*` 치환 필요** — `template-next`를 `npx tiged`로 클론한 경우 `package.json`의 `workspace:*` 의존성을 GitHub Release 타르볼 URL로 한 번 치환해야 합니다. `/polaris-init` 슬래시커맨드가 자동 수행하거나 [internal-consumer-setup.md](../../for-consumers/install.md) 참고.
- **react-hook-form 어댑터 없음** — 현재는 `register()` spread + `error` prop 직접 wiring. v0.4에서 wrapper 추가 예정.
