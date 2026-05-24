import { useMemo, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  Home,
  ListChecks,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  Search,
  Settings,
  UserRound,
  X
} from 'lucide-react';
import { CareerPass } from './CareerPass';
import { ClusterOneStart, ClusterOneWorkspace } from './ClusterOne';
import { PolarisButton } from './polaris-controls';
import { ReviewRoom } from './ReviewRoom';
import { WorkBoard } from './WorkBoard';

// Polaris contract reference: use @polaris/ui/ribbon when the document editor surface becomes functional.

type NavItem = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  ai?: boolean;
};

const POLARIS_HOME_URL = 'https://www.polarisoffice.com/ko';

const workspaceNav: NavItem[] = [
  {
    id: 'home',
    label: '홈',
    description: '작업 현황과 최근 문서',
    icon: Home
  },
  {
    id: 'career-pass',
    label: '커리어 패스',
    description: '공고 등록부터 제출 검수까지 취업 지원 워크플로우',
    icon: ClipboardList
  },
  {
    id: 'cluster-one',
    label: '작업 카드',
    description: '외부 공고를 Polaris 작업 카드로 전환',
    icon: ListChecks
  },
  {
    id: 'review-room',
    label: '리뷰룸',
    description: '댓글부터 최종본까지 연결하는 문서 리뷰 흐름',
    icon: MessageSquareText
  },
  {
    id: 'work-board',
    label: '작업 보드',
    description: '근거 검증부터 인용 점검까지 이어지는 진행 현황',
    icon: ListChecks
  }
];

export function App() {
  const startsOnClusterOne = isClusterOneRoute();
  const startsOnReviewRoom = isReviewRoomRoute();
  const startsOnWorkBoard = isWorkBoardRoute();
  const clusterOneView = getClusterOneView();
  const startsInClusterOneWorkspace = startsOnClusterOne && (clusterOneView === 'workspace' || clusterOneView === 'detail');
  const [activeId, setActiveId] = useState(startsOnClusterOne ? 'cluster-one' : startsOnReviewRoom ? 'review-room' : startsOnWorkBoard ? 'work-board' : 'home');
  const [showClusterOneStart, setShowClusterOneStart] = useState(startsOnClusterOne && !startsInClusterOneWorkspace);
  const [clusterOneStartsInDetail, setClusterOneStartsInDetail] = useState(startsOnClusterOne && clusterOneView === 'detail');
  const [clusterOneResetKey, setClusterOneResetKey] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = useMemo(
    () => workspaceNav.find((item) => item.id === activeId) ?? workspaceNav[0],
    [activeId]
  );

  const selectItem = (itemId: string) => {
    if (itemId === 'home') {
      window.location.assign(POLARIS_HOME_URL);
      return;
    }

    setActiveId(itemId);
    setShowClusterOneStart(false);
    if (itemId === 'cluster-one') {
      setClusterOneStartsInDetail(false);
      setClusterOneResetKey((key) => key + 1);
    }
    setMobileOpen(false);
    syncRouteForNav(itemId);
  };

  const enterClusterOneWorkspace = () => {
    setActiveId('cluster-one');
    setShowClusterOneStart(false);
    setClusterOneStartsInDetail(true);
    setClusterOneResetKey((key) => key + 1);
    syncRouteForNav('cluster-one');
  };

  if (showClusterOneStart) {
    return <ClusterOneStart onSendToPolaris={enterClusterOneWorkspace} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="주요 메뉴">
        <div className="sidebar-header">
          <a className="brand-link" href="https://www.polarisoffice.com/ko" aria-label="Polaris Office 홈페이지">
            <span className="brand-mark" aria-hidden="true">
              P
            </span>
            <span className="brand-copy">
              <strong>DECK A팀</strong>
              <span>Office Workbench</span>
            </span>
          </a>
          <PolarisButton className="icon-button mobile-only" aria-label="메뉴 닫기" onClick={() => setMobileOpen(false)}>
            <X size={18} aria-hidden="true" />
          </PolarisButton>
        </div>

        <nav className="sidebar-body" aria-label="DECK A팀 작업 영역">
          <NavSection items={workspaceNav} activeId={activeId} title="Workspace" onSelect={selectItem} />
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
              <span className="profile-copy">DECK A팀</span>
              <ChevronDown size={15} aria-hidden="true" />
            </PolarisButton>
          </div>
        </header>

        <main
          className={`content-shell ${activeId === 'career-pass' ? 'content-shell-career' : ''} ${activeId === 'cluster-one' ? 'content-shell-cl1' : ''} ${activeId === 'review-room' ? 'content-shell-review' : ''} ${activeId === 'work-board' ? 'content-shell-workboard' : ''}`}
          aria-label={`${activeItem.label} 화면`}
        >
          {activeId === 'career-pass' ? (
            <CareerPass />
          ) : activeId === 'cluster-one' ? (
            <ClusterOneWorkspace key={`${clusterOneResetKey}-${clusterOneStartsInDetail}`} initialDetail={clusterOneStartsInDetail} />
          ) : activeId === 'review-room' ? (
            <ReviewRoom />
          ) : activeId === 'work-board' ? (
            <WorkBoard />
          ) : (
            <>
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
                    <h2>새 문서를 선택하거나 작업 보드에서 이어서 시작하세요.</h2>
                    <p>
                      최근 작업과 팀 문서가 이 공간에 표시됩니다.
                      진행 중인 검토와 작성 흐름도 같은 작업대에서 이어집니다.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function isClusterOneRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.pathname.replace(/\/$/, '').endsWith('/cl1');
}

function isReviewRoomRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.pathname.replace(/\/$/, '').endsWith('/review-room');
}

function isWorkBoardRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.pathname.replace(/\/$/, '').endsWith('/cl2');
}

function syncRouteForNav(itemId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const targetPath = itemId === 'cluster-one' ? '/cl1' : itemId === 'review-room' ? '/review-room' : itemId === 'work-board' ? '/cl2' : '/';

  if (window.location.pathname !== targetPath) {
    window.history.pushState(null, '', targetPath);
  }
}

function getClusterOneView() {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get('view');
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
