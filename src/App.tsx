import { useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  FilePenLine,
  FileText,
  HelpCircle,
  Home,
  LayoutGrid,
  Menu,
  Palette,
  PanelLeftClose,
  Search,
  Settings,
  Sparkles,
  UserRound,
  X
} from 'lucide-react';
import { PolarisButton } from './polaris-controls';

// Polaris contract reference: use @polaris/ui/ribbon when the document editor surface becomes functional.

type NavItem = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  ai?: boolean;
};

const workspaceNav: NavItem[] = [
  {
    id: 'home',
    label: '홈',
    description: '작업 현황과 최근 문서',
    icon: Home
  },
  {
    id: 'office',
    label: '오피스 문서',
    description: '문서 편집과 리본 작업대',
    icon: FileText
  },
  {
    id: 'proposal',
    label: '제안서',
    description: '보고서와 제안서 제작',
    icon: FilePenLine
  },
  {
    id: 'crm',
    label: '계약/CRM',
    description: '계약, 고객, 운영 목록',
    icon: BriefcaseBusiness
  },
  {
    id: 'nova',
    label: 'NOVA',
    description: '요약, 생성, 자동화',
    icon: Sparkles,
    badge: 'AI',
    ai: true
  }
];

const systemNav: NavItem[] = [
  {
    id: 'components',
    label: '컴포넌트',
    description: 'Polaris UI catalog',
    icon: LayoutGrid
  },
  {
    id: 'tokens',
    label: '토큰',
    description: 'Color, Type, Grid',
    icon: Palette
  },
  {
    id: 'guides',
    label: '가이드',
    description: '톤앤매너 계약',
    icon: BookOpen
  }
];

export function App() {
  const [activeId, setActiveId] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = useMemo(
    () => [...workspaceNav, ...systemNav].find((item) => item.id === activeId) ?? workspaceNav[0],
    [activeId]
  );

  const selectItem = (itemId: string) => {
    setActiveId(itemId);
    setMobileOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="주요 메뉴">
        <div className="sidebar-header">
          <a className="brand-link" href="/" aria-label="Polaris 홈">
            <span className="brand-mark" aria-hidden="true">
              P
            </span>
            <span className="brand-copy">
              <strong>Polaris</strong>
              <span>Office Workbench</span>
            </span>
          </a>
          <PolarisButton className="icon-button mobile-only" aria-label="메뉴 닫기" onClick={() => setMobileOpen(false)}>
            <X size={18} aria-hidden="true" />
          </PolarisButton>
        </div>

        <nav className="sidebar-body" aria-label="Polaris 작업 영역">
          <NavSection items={workspaceNav} activeId={activeId} title="Workspace" onSelect={selectItem} />
          <NavSection items={systemNav} activeId={activeId} title="Design System" onSelect={selectItem} />
        </nav>

        <div className="sidebar-footer">
          <div>
            <span className="footer-label">PolarisDesign</span>
            <strong>v0.8.0-rc.8</strong>
          </div>
          <PolarisButton className="icon-button" aria-label="사이드바 접기">
            <PanelLeftClose size={17} aria-hidden="true" />
          </PolarisButton>
        </div>
      </aside>

      {mobileOpen && <PolarisButton className="scrim" aria-label="메뉴 닫기" onClick={() => setMobileOpen(false)} />}

      <div className="main-column">
        <header className="gnb">
          <div className="gnb-left">
            <PolarisButton className="icon-button mobile-only" aria-label="메뉴 열기" onClick={() => setMobileOpen(true)}>
              <Menu size={18} aria-hidden="true" />
            </PolarisButton>
            <div className="search-field" role="search">
              <Search size={16} aria-hidden="true" />
              <span>문서, 계약, NOVA 작업 검색</span>
            </div>
          </div>

          <div className="gnb-actions" aria-label="사용자 메뉴">
            <PolarisButton className="icon-button" aria-label="도움말">
              <HelpCircle size={18} aria-hidden="true" />
            </PolarisButton>
            <PolarisButton className="icon-button notification-button" aria-label="알림 3건">
              <Bell size={18} aria-hidden="true" />
              <span aria-hidden="true" />
            </PolarisButton>
            <PolarisButton className="icon-button" aria-label="설정">
              <Settings size={18} aria-hidden="true" />
            </PolarisButton>
            <PolarisButton className="profile-button" aria-label="사용자 프로필">
              <span className="avatar" aria-hidden="true">
                <UserRound size={16} />
              </span>
              <span className="profile-copy">기획 A팀</span>
              <ChevronDown size={15} aria-hidden="true" />
            </PolarisButton>
          </div>
        </header>

        <main className="content-shell" aria-label={`${activeItem.label} 화면`}>
          <section className="page-heading">
            <div>
              <p className="eyebrow">Polaris Office</p>
              <h1>{activeItem.label}</h1>
              <p>{activeItem.description}</p>
            </div>
            <span className={activeItem.ai ? 'status-pill ai-pill' : 'status-pill'}>
              {activeItem.ai ? 'NOVA 영역' : 'Pages ready'}
            </span>
          </section>

          <section className="document-stage" aria-label="빈 문서 작업대">
            <div className="ribbon-strip" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="document-canvas">
              <div className="canvas-ruler" aria-hidden="true" />
              <div className="empty-state">
                <p className="empty-kicker">Blank workspace</p>
                <h2>다음 기획안은 이 작업대 안에서 Polaris UI로 확장합니다.</h2>
                <p>
                  GNB와 사이드바는 PolarisDesign Pages 구조를 기준으로 고정했습니다.
                  화면별 콘텐츠만 교체해도 같은 톤앤매너가 유지됩니다.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function NavSection({
  title,
  items,
  activeId,
  onSelect
}: {
  title: string;
  items: NavItem[];
  activeId: string;
  onSelect: (itemId: string) => void;
}) {
  return (
    <section className="nav-section" aria-labelledby={`${title}-nav`}>
      <h2 id={`${title}-nav`}>{title}</h2>
      <ul>
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeId === item.id;

          return (
            <li key={item.id}>
              <PolarisButton
                className={`nav-item ${active ? 'nav-item-active' : ''} ${item.ai ? 'nav-item-ai' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelect(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge && <strong>{item.badge}</strong>}
              </PolarisButton>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
