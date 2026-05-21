import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ToastProvider,
  ToastViewport,
  TooltipProvider,
  SimpleTooltip,
  Button,
  Badge,
  Input,
  Avatar,
  AvatarFallback,
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  Navbar,
  NavbarBrand,
  NavbarNav,
  NavbarActions,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  cn,
} from '@polaris/ui';
import { BellIcon, ImageIcon, MenuIcon, SearchIcon, SettingsIcon, UserIcon } from '@polaris/ui/icons';
import { Home as HomeIcon, Sparkles, Briefcase, PenSquare, Layers, Palette, HelpCircle, LogOut, FileText, FilePen, X as XIcon } from 'lucide-react';

type Theme = 'light' | 'dark';

const APP_NAV: { to: string; label: string; icon: React.ElementType; end?: boolean; trailing?: React.ReactNode }[] = [
  { to: '/', label: '홈', icon: HomeIcon, end: true },
  { to: '/nova', label: 'NOVA 워크스페이스', icon: Sparkles, trailing: <Badge variant="secondary">AI</Badge> },
  { to: '/crm/contract', label: '영업관리', icon: Briefcase },
  { to: '/sign/contracts', label: '사인', icon: PenSquare },
  { to: '/polaris-office', label: '폴라리스 오피스 (리본)', icon: FileText },
  { to: '/proposal-platform', label: '제안서 플랫폼 (브랜딩)', icon: FilePen, trailing: <Badge variant="secondary">AI</Badge> },
];

const REFERENCE_NAV: { to: string; label: string; icon: React.ElementType; end?: boolean }[] = [
  { to: '/components', label: '컴포넌트 카탈로그', icon: Layers },
  { to: '/tokens', label: '디자인 토큰', icon: Palette },
  { to: '/icons', label: '아이콘 카탈로그', icon: ImageIcon },
  { to: '/assets', label: '디자인 자산', icon: ImageIcon },
];

export function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('polaris-demo-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('polaris-demo-theme', theme);
  }, [theme]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const isActive = (to: string, end?: boolean) =>
    end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <TooltipProvider delayDuration={200}>
      <ToastProvider swipeDirection="right">
        <div className="min-h-screen flex bg-fill-neutral text-label-normal font-polaris">
          {/* Sidebar — desktop persistent, mobile drawer */}
          {mobileOpen && (
            <div
              role="button"
              tabIndex={-1}
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/40 cursor-pointer"
            />
          )}
          <Sidebar
            width="15rem"
            className={cn(
              'fixed md:sticky top-0 z-50 h-screen md:h-screen',
              'transition-transform duration-200 md:transition-none',
              !mobileOpen && '-translate-x-full md:translate-x-0'
            )}
          >
            <SidebarHeader>
              <div className="flex items-center justify-between gap-2">
                <NavLink to="/" className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex h-8 w-8 shrink-0 rounded-polaris-md bg-accent-brand-normal text-label-inverse items-center justify-center font-bold text-polaris-body2">
                    P
                  </span>
                  <span className="text-polaris-heading4 font-semibold truncate">Polaris</span>
                </NavLink>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                  className="md:hidden !h-8 !w-8 !px-0"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </SidebarHeader>
            <SidebarBody>
              <SidebarSection>
                {APP_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarItem
                      key={item.to}
                      icon={<Icon className="h-4 w-4" />}
                      label={item.label}
                      trailing={item.trailing}
                      active={isActive(item.to, item.end)}
                      onClick={() => navigate(item.to)}
                    />
                  );
                })}
              </SidebarSection>
              <SidebarSection title="시스템 레퍼런스">
                {REFERENCE_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarItem
                      key={item.to}
                      icon={<Icon className="h-4 w-4" />}
                      label={item.label}
                      active={isActive(item.to, item.end)}
                      onClick={() => navigate(item.to)}
                    />
                  );
                })}
              </SidebarSection>
            </SidebarBody>
            <SidebarFooter>
              <div className="flex items-center justify-between gap-2">
                <span className="text-polaris-caption1 text-label-alternative truncate">크레딧 6,805</span>
                <Button variant="tertiary" size="sm" onClick={toggleTheme} className="!px-2.5">
                  {theme === 'dark' ? '☀' : '🌙'}
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main column */}
          <div className="flex-1 flex flex-col min-w-0">
            <Navbar className="sticky top-0 z-30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                className="md:hidden"
              >
                <MenuIcon className="h-4 w-4" />
              </Button>
              <NavbarBrand className="md:hidden">
                <span className="inline-flex h-7 w-7 rounded-polaris-md bg-accent-brand-normal text-label-inverse items-center justify-center font-bold text-polaris-caption1">
                  P
                </span>
                <span className="text-polaris-heading4 font-semibold">Polaris</span>
              </NavbarBrand>
              <NavbarNav>
                <div className="hidden md:block relative w-full max-w-md">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-label-alternative pointer-events-none z-10" aria-hidden="true" />
                  <Input
                    type="search"
                    placeholder="문서·계약·NOVA 응답 검색"
                    className="pl-9 !h-9 bg-fill-neutral border-line-neutral"
                  />
                </div>
              </NavbarNav>
              <NavbarActions>
                <SimpleTooltip label="도움말" side="bottom">
                  <Button variant="ghost" size="sm" aria-label="도움말">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </SimpleTooltip>
                <SimpleTooltip label="알림 (3건)" side="bottom">
                  <Button variant="ghost" size="sm" aria-label="알림" className="relative">
                    <BellIcon className="h-4 w-4" />
                    <span
                      aria-hidden="true"
                      className="absolute top-1 right-1 inline-flex h-1.5 w-1.5 rounded-polaris-pill bg-state-error"
                    />
                  </Button>
                </SimpleTooltip>
                <SimpleTooltip label="설정" side="bottom">
                  <Button variant="ghost" size="sm" aria-label="설정">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </SimpleTooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="사용자 메뉴"
                      className="!h-8 !w-8 !px-0 !rounded-polaris-pill"
                    >
                      <Avatar size="sm">
                        <AvatarFallback>이</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    <DropdownMenuLabel>이해석</DropdownMenuLabel>
                    <div className="px-2.5 pb-1.5 text-polaris-caption1 text-label-alternative">miles@polaris.example</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => alert('계정 설정')}>
                      <UserIcon className="h-4 w-4" /> 계정 설정
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={toggleTheme}>
                      {theme === 'dark' ? '☀ 라이트 모드로' : '🌙 다크 모드로'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onSelect={() => alert('로그아웃')}>
                      <LogOut className="h-4 w-4" /> 로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavbarActions>
            </Navbar>

            <main className="flex-1">
              <Outlet />
            </main>

            <footer className="border-t border-line-neutral">
              <div className="max-w-6xl mx-auto px-6 py-6 text-polaris-caption1 text-label-alternative flex flex-wrap items-center justify-between gap-3">
                <div>Polaris Design System · v0.1.0</div>
                <a
                  href="https://github.com/PolarisOffice/PolarisDesign"
                  className="text-accent-brand-normal hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  github.com/PolarisOffice/PolarisDesign
                </a>
              </div>
            </footer>
          </div>

          <ToastViewport />
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}
