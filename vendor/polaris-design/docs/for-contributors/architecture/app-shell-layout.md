# AppShell layout 패턴

폴라리스 표준 앱 셸 — 좌측 Sidebar + 상단 Navbar + 메인 콘텐츠. 우리 데모(`apps/demo/src/Layout.tsx`)와 template-next가 동일 구조를 따릅니다.

---

## 기본 구조

```tsx
'use client';
import {
  Sidebar, SidebarHeader, SidebarBody, SidebarSection, SidebarItem, SidebarFooter,
  Navbar, NavbarBrand, NavbarNav, NavbarActions,
  Container,
  ToastProvider, ToastViewport, TooltipProvider, Toaster,
} from '@polaris/ui';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <ToastProvider>
        <div className="min-h-screen flex bg-background-base text-label-normal font-polaris">
          {/* 좌측 — desktop sticky, mobile drawer */}
          <Sidebar width="15rem" className="hidden md:flex sticky top-0 h-screen">
            <SidebarHeader>...</SidebarHeader>
            <SidebarBody>
              <SidebarSection>{/* nav items */}</SidebarSection>
            </SidebarBody>
            <SidebarFooter>{/* user info */}</SidebarFooter>
          </Sidebar>

          {/* 메인 영역 */}
          <div className="flex-1 flex flex-col min-w-0">
            <Navbar className="sticky top-0 z-30">
              <NavbarBrand asChild className="md:hidden">
                <Link href="/">Polaris</Link>
              </NavbarBrand>
              <NavbarNav>{/* search */}</NavbarNav>
              <NavbarActions>{/* notifications, user menu */}</NavbarActions>
            </Navbar>

            <main className="flex-1">
              <Container size="2xl" asChild>
                <div className="py-6">{children}</div>
              </Container>
            </main>
          </div>
        </div>
        <Toaster />
        <ToastViewport />
      </ToastProvider>
    </TooltipProvider>
  );
}
```

---

## 모바일 대응

`Sidebar`는 desktop에서 sticky, 모바일에서 drawer로 동작해야 합니다. 두 가지 패턴:

### (A) Sidebar + slide transform (현 demo 패턴)
```tsx
const [open, setOpen] = useState(false);

<Sidebar
  width="15rem"
  className={cn(
    'fixed md:sticky top-0 z-50 h-screen transition-transform duration-200 md:transition-none',
    !open && '-translate-x-full md:translate-x-0'
  )}
>...</Sidebar>

{open && (
  <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 z-40 bg-black/40" />
)}

<Navbar>
  <Button variant="ghost" className="md:hidden" onClick={() => setOpen(true)}>
    <Menu className="h-4 w-4" />
  </Button>
</Navbar>
```

### (B) Drawer 컴포넌트 활용 (v0.3+)
```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerTrigger asChild className="md:hidden">
    <Button variant="ghost"><Menu /></Button>
  </DrawerTrigger>
  <DrawerContent side="left" className="!w-72">
    <Sidebar className="!border-0 !static">...</Sidebar>
  </DrawerContent>
</Drawer>
```

(B)가 focus trap·Esc 닫기·overlay 클릭이 자동이라 더 권장. 데모는 점진적 전환 중.

---

## 라우트별 콘텐츠 폭 조정

`Container size`로 페이지마다 폭을 다르게:

| 페이지 종류 | size |
|---|---|
| 폼 / 설정 (좁아도 OK) | `md` (max-w-screen-md, ~768px) |
| 목록 / 대시보드 | `xl` (max-w-screen-xl, ~1280px) |
| 와이드 테이블 / 차트 | `2xl` (max-w-screen-2xl, ~1536px) |
| 풀폭 (커스텀 레이아웃) | `full` |

---

## 다크 모드 토글

쿠키 + DOM 패턴 — SSR 안전. `template-next/components/theme-toggle.tsx` 참고.

```tsx
// app/layout.tsx
import { cookies } from 'next/headers';
const theme = (await cookies()).get('polaris-theme')?.value === 'dark' ? 'dark' : 'light';
return <html data-theme={theme}>...</html>;

// components/theme-toggle.tsx
'use client';
const toggle = () => {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.cookie = `polaris-theme=${next}; path=/; max-age=31536000; samesite=lax`;
};
```

`next-themes`도 동작하지만 (a) 의존성 추가, (b) 첫 페인트 flash 방지 위해 자체 script tag 추가가 필요해서 권장하지 않습니다. 위 쿠키 패턴이 폴라리스 표준.

---

## CommandPalette 통합 (v0.4+, experimental)

Ctrl/Cmd+K로 빠른 navigation:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@polaris/ui';
import { useRouter } from 'next/navigation';

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const go = (path: string) => () => { router.push(path); setOpen(false); };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="명령 또는 페이지 검색" />
      <CommandList>
        <CommandEmpty>일치하는 결과가 없습니다.</CommandEmpty>
        <CommandGroup heading="페이지">
          <CommandItem onSelect={go('/dashboard')}>대시보드</CommandItem>
          <CommandItem onSelect={go('/contracts')}>계약 목록</CommandItem>
          <CommandItem onSelect={go('/customers')}>고객 관리</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

`<AppShell>` 안에 `<GlobalCommandPalette />`를 한 번 mount하면 모든 페이지에서 동작합니다.
