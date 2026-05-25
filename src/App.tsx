import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  Home,
  History,
  Kanban,
  ListChecks,
  Menu,
  MessageSquareText,
  PackageCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  X
} from 'lucide-react';
import { CareerPass, initialSupportTracks, type SupportTrack } from './CareerPass';
import { ClusterOneStart, ClusterOneWorkspace, type KeepToPolarisView } from './ClusterOne';
import { FinalRoom, type FinalRoomHandoff } from './FinalRoom';
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
  externalHref?: string;
};

const defaultReviewRoomDocument = { title: '팀 프로젝트 제안서.docx', unit: '문단' };
const deckHomeUrl = 'https://www.deck-ewha.com/';
const companyARoute = '/company-A';
const workCardDetailRoute = '/work-card/job-application';
const workspaceRoutes: Record<string, string> = {
  home: '/',
  'career-pass': '/career-pass',
  'final-room': '/final-room',
  'cluster-one': '/work-card',
  'review-room': '/review-room',
  'work-board': '/work-board'
};

const routeAliases: Record<string, string> = {
  '/cl1': companyARoute,
  '/cl2': workspaceRoutes['work-board']
};

const workspaceNav: NavItem[] = [
  {
    id: 'home',
    label: '홈',
    description: '킵 투 폴라리스 작업 현황과 최근 문서',
    icon: Home,
    externalHref: deckHomeUrl
  },
  {
    id: 'career-pass',
    label: '커리어 패스',
    description: '공고 등록부터 자기소개서 작성까지 취업 지원 워크플로우',
    icon: ClipboardList
  },
  {
    id: 'final-room',
    label: '파이널룸',
    description: '첨부 파일과 제출 조건을 한 번에 확인',
    icon: PackageCheck
  },
  {
    id: 'cluster-one',
    label: '킵 투 폴라리스',
    description: '외부 문서를 저장하고 작업 카드와 완료 기록으로 연결',
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
    label: 'AI 리서치 보드',
    description: '자료를 검증 가능한 근거로 정리하고 문서 초안으로 연결',
    icon: Kanban
  }
];

export function App() {
  const startsOnCompanyA = isCompanyARoute();
  const startsOnClusterOne = isClusterOneRoute();
  const startsOnCareerPass = isCareerPassRoute();
  const startsOnFinalRoom = isFinalRoomRoute();
  const startsOnReviewRoom = isReviewRoomRoute();
  const startsOnWorkBoard = isWorkBoardRoute();
  const [activeId, setActiveId] = useState(
    startsOnCompanyA || startsOnClusterOne
      ? 'cluster-one'
      : startsOnCareerPass
        ? 'career-pass'
        : startsOnFinalRoom
          ? 'final-room'
          : startsOnReviewRoom
            ? 'review-room'
            : startsOnWorkBoard
              ? 'work-board'
              : 'home'
  );
  const [showClusterOneStart, setShowClusterOneStart] = useState(startsOnCompanyA);
  const [clusterOneResetKey, setClusterOneResetKey] = useState(0);
  const [clusterOneEntryView, setClusterOneEntryView] = useState<KeepToPolarisView>('home');
  const [reviewRoomDocument, setReviewRoomDocument] = useState(defaultReviewRoomDocument);
  const [supportTracks, setSupportTracks] = useState<SupportTrack[]>(initialSupportTracks);
  const [finalRoomHandoff, setFinalRoomHandoff] = useState<FinalRoomHandoff | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeItem = useMemo(
    () => workspaceNav.find((item) => item.id === activeId) ?? workspaceNav[0],
    [activeId]
  );
  const isCareerPassView = activeId === 'career-pass' || isCareerPassRoute();
  const isFinalRoomView = activeId === 'final-room' || isFinalRoomRoute();
  const isKeepToPolarisView = activeId === 'cluster-one' || activeId === 'home';

  const selectItem = (itemId: string) => {
    if (itemId === 'home') {
      window.location.assign(deckHomeUrl);
      return;
    }

    setActiveId(itemId);
    setShowClusterOneStart(false);
    if (itemId === 'cluster-one') {
      setClusterOneEntryView('home');
      setClusterOneResetKey((key) => key + 1);
    }
    setMobileOpen(false);
    syncRouteForNav(itemId);
  };

  const enterClusterOneWorkspace = () => {
    setActiveId('cluster-one');
    setShowClusterOneStart(false);
    setClusterOneEntryView('purpose');
    setClusterOneResetKey((key) => key + 1);
    syncRouteTo(workspaceRoutes['cluster-one']);
  };

  const openFinalRoomWithFile = (fileName: string) => {
    setFinalRoomHandoff({ fileName, submittedAt: Date.now() });
    setActiveId('final-room');
    setShowClusterOneStart(false);
    setMobileOpen(false);
    syncRouteForNav('final-room');
  };

  useEffect(() => {
    canonicalizeCurrentRoute();

    const handlePopState = () => {
      const nextIsCompanyA = isCompanyARoute();
      const nextId = getCurrentNavId();

      setActiveId(nextId);
      setShowClusterOneStart(nextIsCompanyA);
      setMobileOpen(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (showClusterOneStart) {
    return <ClusterOneStart onSendToPolaris={enterClusterOneWorkspace} />;
  }

  return (
    <div className={`app-shell ${isCareerPassView ? 'app-shell-career-pass' : ''} ${sidebarCollapsed ? 'app-shell-sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="주요 메뉴">
        <div className="sidebar-header">
          <a className="brand-link" href="https://www.polarisoffice.com/ko" aria-label="Polaris Office 홈페이지">
            <span className="brand-mark" aria-hidden="true">
              P
            </span>
            <span className="brand-copy">
              <strong>DECK A팀</strong>
              <span>오피스 작업대</span>
            </span>
          </a>
          <div className="sidebar-header-actions">
            <PolarisButton
              className="icon-button sidebar-collapse-button"
              aria-label="사이드바 접기"
              onClick={() => {
                setSidebarCollapsed(true);
                setMobileOpen(false);
              }}
            >
              <PanelLeftClose size={17} aria-hidden="true" />
            </PolarisButton>
            <PolarisButton className="icon-button mobile-only" aria-label="메뉴 닫기" onClick={() => setMobileOpen(false)}>
              <X size={18} aria-hidden="true" />
            </PolarisButton>
          </div>
        </div>

        <nav className="sidebar-body" aria-label="DECK A팀 작업 영역">
          <NavSection items={workspaceNav} activeId={activeId} title="작업 영역" onSelect={selectItem} />
        </nav>

        <div className="sidebar-credit">
          made by{' '}
          <a href="https://github.com/maetelson" target="_blank" rel="noreferrer">
            maetelson
          </a>
        </div>
      </aside>

      {sidebarCollapsed && (
        <PolarisButton
          className="icon-button sidebar-restore-button"
          aria-label="사이드바 열기"
          onClick={() => setSidebarCollapsed(false)}
        >
          <PanelLeftOpen size={17} aria-hidden="true" />
        </PolarisButton>
      )}

      {mobileOpen && <PolarisButton className="scrim" aria-label="메뉴 닫기" onClick={() => setMobileOpen(false)} />}

      <div className="main-column">
        {!isCareerPassView && !isFinalRoomView && !isKeepToPolarisView && (
        <header className="gnb">
          <div className="gnb-left">
            <PolarisButton
              className="icon-button mobile-only"
              aria-label="메뉴 열기"
              onClick={() => {
                setSidebarCollapsed(false);
                setMobileOpen(true);
              }}
            >
              <Menu size={18} aria-hidden="true" />
            </PolarisButton>
            {activeId === 'review-room' ? (
              <div className="gnb-document-area" aria-label="현재 문서">
                <div className="gnb-document-title">
                  <strong>{reviewRoomDocument.title}</strong>
                  <span>{reviewRoomDocument.unit}</span>
                </div>
              </div>
            ) : (
              <div className="search-field" role="search">
                <Search size={16} aria-hidden="true" />
                <span>문서, 계약, NOVA 작업 검색</span>
              </div>
            )}
          </div>

          {activeId === 'review-room' ? (
            <div className="gnb-document-actions" aria-label="버전 작업">
              <PolarisButton
                className="secondary-action compact-action"
                onClick={() => window.dispatchEvent(new Event('review-room:save-version'))}
              >
                <History size={15} aria-hidden="true" />
                버전 저장
              </PolarisButton>
              <PolarisButton
                className="primary-action compact-action"
                onClick={() => window.dispatchEvent(new Event('review-room:confirm-final'))}
              >
                <ShieldCheck size={15} aria-hidden="true" />
                최종 반영
              </PolarisButton>
            </div>
          ) : (
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
          )}
        </header>
        )}

        <main
          className={`content-shell ${isCareerPassView || isFinalRoomView ? 'content-shell-career' : ''} ${isKeepToPolarisView ? 'content-shell-cl1' : ''} ${activeId === 'review-room' ? 'content-shell-review' : ''} ${activeId === 'work-board' ? 'content-shell-workboard' : ''}`}
          aria-label={`${activeItem.label} 화면`}
        >
          {isCareerPassView ? (
            <CareerPass
              supportTracks={supportTracks}
              setSupportTracks={setSupportTracks}
              onFinalReview={openFinalRoomWithFile}
            />
          ) : activeId === 'final-room' ? (
            <FinalRoom applications={supportTracks} handoff={finalRoomHandoff} />
          ) : activeId === 'cluster-one' ? (
            <ClusterOneWorkspace key={clusterOneResetKey} initialView={clusterOneEntryView} />
          ) : activeId === 'review-room' ? (
            <ReviewRoom onDocumentChange={setReviewRoomDocument} />
          ) : activeId === 'work-board' ? (
            <WorkBoard />
          ) : activeId === 'home' ? (
            <ClusterOneWorkspace initialView="home" />
          ) : (
            <>
              <section className="page-heading">
                <div>
                  <p className="eyebrow">Polaris Office</p>
                  <h1>{activeItem.label}</h1>
                  <p>{activeItem.description}</p>
                </div>
                <span className={activeItem.ai ? 'status-pill ai-pill' : 'status-pill'}>
                  {activeItem.ai ? 'NOVA 영역' : '페이지 준비 완료'}
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
                    <p className="empty-kicker">빈 작업공간</p>
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

function isCompanyARoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  const path = getRoutePathname();
  const clusterOneView = getClusterOneView();
  return (path === companyARoute || path === '/cl1') && !clusterOneView;
}

function isClusterOneRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  const path = getRoutePathname();
  const clusterOneView = getClusterOneView();
  return (
    path === workspaceRoutes['cluster-one'] ||
    path === workCardDetailRoute ||
    (path === '/cl1' && (clusterOneView === 'workspace' || clusterOneView === 'detail')) ||
    (path === companyARoute && (clusterOneView === 'workspace' || clusterOneView === 'detail'))
  );
}

function isCareerPassRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  return getRoutePathname() === workspaceRoutes['career-pass'];
}

function isFinalRoomRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  return getRoutePathname() === workspaceRoutes['final-room'];
}

function isReviewRoomRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  return getRoutePathname() === workspaceRoutes['review-room'];
}

function isWorkBoardRoute() {
  if (typeof window === 'undefined') {
    return false;
  }

  const path = getRoutePathname();
  return path === workspaceRoutes['work-board'] || path === '/cl2';
}

function syncRouteForNav(itemId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const targetRoute = workspaceRoutes[itemId] ?? workspaceRoutes.home;
  syncRouteTo(targetRoute);
}

function syncRouteTo(targetRoute: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const targetPath = toBrowserPath(targetRoute);
  const currentPath = getRoutePathname();

  if (currentPath !== targetRoute || window.location.search || window.location.hash) {
    window.history.pushState(null, '', targetPath);
  }
}

function canonicalizeCurrentRoute() {
  if (typeof window === 'undefined') {
    return;
  }

  const path = getRoutePathname();
  const clusterOneView = getClusterOneView();
  let canonicalPath = routeAliases[path];
  let canonicalSearch = window.location.search;

  if ((path === '/cl1' || path === companyARoute) && clusterOneView === 'detail') {
    canonicalPath = workspaceRoutes['cluster-one'];
    canonicalSearch = getSearchWithout('view');
  } else if ((path === '/cl1' || path === companyARoute) && clusterOneView === 'workspace') {
    canonicalPath = workspaceRoutes['cluster-one'];
    canonicalSearch = getSearchWithout('view');
  }

  if (canonicalPath) {
    window.history.replaceState(null, '', `${toBrowserPath(canonicalPath)}${canonicalSearch}${window.location.hash}`);
  }
}

function getCurrentNavId() {
  const path = getRoutePathname();

  if (path === workspaceRoutes['career-pass']) {
    return 'career-pass';
  }

  if (path === workspaceRoutes['final-room']) {
    return 'final-room';
  }

  if (path === workspaceRoutes['cluster-one'] || path === workCardDetailRoute || path === companyARoute || path === '/cl1') {
    return 'cluster-one';
  }

  if (path === workspaceRoutes['review-room']) {
    return 'review-room';
  }

  if (path === workspaceRoutes['work-board'] || path === '/cl2') {
    return 'work-board';
  }

  return 'home';
}

function getNormalizedPathname() {
  if (typeof window === 'undefined') {
    return '/';
  }

  const normalized = window.location.pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function getRoutePathname() {
  const path = getNormalizedPathname();
  const basePath = getAppBasePath();

  if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) {
    const routePath = path.slice(basePath.length) || '/';
    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }

  return path;
}

function toBrowserPath(routePath: string) {
  const basePath = getAppBasePath();

  if (!basePath) {
    return routePath;
  }

  return routePath === '/' ? `${basePath}/` : `${basePath}${routePath}`;
}

function getAppBasePath() {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return baseUrl === '' ? '' : baseUrl;
}

function getClusterOneView() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (getRoutePathname() === workCardDetailRoute) {
    return 'detail';
  }

  return new URLSearchParams(window.location.search).get('view');
}

function getSearchWithout(name: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  const params = new URLSearchParams(window.location.search);
  params.delete(name);
  const nextSearch = params.toString();
  return nextSearch ? `?${nextSearch}` : '';
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
              {item.externalHref ? (
                <a
                  className={`nav-item ${active ? 'nav-item-active' : ''} ${item.ai ? 'nav-item-ai' : ''}`}
                  href={item.externalHref}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge && <strong>{item.badge}</strong>}
                </a>
              ) : (
                <PolarisButton
                  className={`nav-item ${active ? 'nav-item-active' : ''} ${item.ai ? 'nav-item-ai' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onSelect(item.id)}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge && <strong>{item.badge}</strong>}
                </PolarisButton>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
