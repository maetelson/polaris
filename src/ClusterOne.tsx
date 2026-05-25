import { createElement, useEffect, useMemo, useReducer, useState, type ChangeEvent } from 'react';
import { FileIcon, type FileType } from '@polaris/ui';
import { Ribbon, RibbonButton, RibbonContent, RibbonGroup, RibbonRow, RibbonTab, RibbonTabList, RibbonTabs } from '@polaris/ui/ribbon';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileCheck2,
  FileText,
  FolderInput,
  Inbox,
  Link2,
  Mail,
  MoreHorizontal,
  Search,
  Send,
  Share2,
  Upload,
  X
} from 'lucide-react';
import { PolarisButton, PolarisInput, PolarisTextarea } from './polaris-controls';

type ClusterOneStartProps = {
  onSendToPolaris: () => void;
};

export type KeepToPolarisView =
  | 'home'
  | 'inbox'
  | 'purpose'
  | 'candidates'
  | 'task'
  | 'document'
  | 'records'
  | 'recent'
  | 'drive';

type PurposeKind = '과제/보고서' | '발표/PPT' | '취업/지원' | '공모전/프로젝트';
type InboxSortMode = 'latest' | 'oldest';
type ExportFormat = 'PDF' | 'DOCX' | 'PPTX' | 'HWP';
type TaskStatus = '시작 전' | '초안 작성' | '수정 중' | '완료';

type PurposeMeta = {
  desc: string;
  docType: string;
  title: string;
  dDay: string;
  deadline: string;
  req: string[];
  source: string;
  tag: PurposeKind;
};

type KeepFile = {
  id: string;
  name: string;
  source: string;
  type: 'PDF' | 'DOCX' | 'PPTX' | 'HWP';
  savedAt: string;
  timestamp: number;
  tag: PurposeKind | '분류 필요';
  status: string;
  shared: boolean;
};

type ExtractedCandidate = {
  id: 'deadline' | 'docs' | 'result';
  type: string;
  tag: 'red' | 'blue' | 'orange';
  title: string;
  desc: string;
  quote: string;
  selected: boolean;
};

type TodoItem = {
  id: string;
  title: string;
  done: boolean;
};

type KeepTask = {
  title: string;
  purpose: PurposeKind;
  dDay: string;
  sourceFile: string;
  source: string;
  deadline: string;
  requirements: string[];
  todos: TodoItem[];
  status: TaskStatus;
  exportFormat: ExportFormat;
  finalOutput: string;
  docContent: string;
};

type CompletedRecord = {
  title: string;
  type: PurposeKind;
  sourceFile: string;
  finalOutput: string;
  submittedAt: string;
  requirements: string[];
  completedTodos: string[];
};

type ToastState = {
  id: number;
  title: string;
  message: string;
  actionText?: string;
  actionView?: KeepToPolarisView;
};

type KeepToPolarisState = {
  view: KeepToPolarisView;
  selectedFileId: string;
  selectedPurpose: PurposeKind;
  inboxSort: InboxSortMode;
  homeIndex: number;
  homeAlertDismissed: boolean;
  files: KeepFile[];
  candidates: ExtractedCandidate[];
  currentTask: KeepTask | null;
  completedRecords: CompletedRecord[];
  exportModalOpen: boolean;
  originalPreviewOpen: boolean;
  toast: ToastState | null;
};

type KeepAction =
  | { type: 'navigate'; view: KeepToPolarisView }
  | { type: 'dismiss-home-alert' }
  | { type: 'set-home-index'; index: number }
  | { type: 'set-sort'; sort: InboxSortMode }
  | { type: 'organize-file'; fileId: string }
  | { type: 'select-purpose'; purpose: PurposeKind }
  | { type: 'toggle-candidate'; candidateId: ExtractedCandidate['id'] }
  | { type: 'create-task' }
  | { type: 'create-task-for-purpose'; purpose: PurposeKind }
  | { type: 'set-task-status'; status: TaskStatus }
  | { type: 'add-todo'; title: string }
  | { type: 'toggle-todo'; todoId: string }
  | { type: 'delete-todo'; todoId: string }
  | { type: 'open-document' }
  | { type: 'update-doc'; content: string }
  | { type: 'prime-doc' }
  | { type: 'open-export' }
  | { type: 'close-export' }
  | { type: 'confirm-export'; format: ExportFormat; name: string }
  | { type: 'save-completion' }
  | { type: 'open-original' }
  | { type: 'close-original' }
  | { type: 'dismiss-toast' };

const fileTemplates: Record<PurposeKind, string[]> = {
  '과제/보고서': ['요구사항 확인', '자료 수집', '개요 작성', '초안 작성', '최종본 내보내기'],
  '발표/PPT': ['핵심 메시지 정리', '목차 구성', '슬라이드 초안 작성', '발표본 검토', '최종본 내보내기'],
  '취업/지원': ['공고 조건 확인', '문항 분석', '관련 경험 정리', '자소서 초안 작성', '최종본 내보내기'],
  '공모전/프로젝트': ['모집요강 조건 확인', '제출 서류 준비', '기획서 목차 작성', '발표자료 초안 작성', '최종본 내보내기']
};

const purposeMeta: Record<PurposeKind, PurposeMeta> = {
  '과제/보고서': {
    desc: '과제 공지, 리포트 제출 안내',
    docType: '과제 공지',
    title: '마케팅조사 개인 리포트',
    dDay: 'D-7',
    deadline: '2026년 5월 13일 23:59 · 개인 리포트 제출 마감',
    req: ['PDF 형식 제출', '3페이지 이내', 'LMS 과제함 제출'],
    source: '마케팅조사_과제공지.pdf',
    tag: '과제/보고서'
  },
  '발표/PPT': {
    desc: '발표 안내문, 팀플 발표자료',
    docType: '발표 안내문',
    title: '팀플 발표자료',
    dDay: 'D-5',
    deadline: '2026년 6월 18일 · 팀 발표 진행',
    req: ['최종 PDF 제출', '발표 시간 10분', '팀원 검토 완료'],
    source: '팀플_발표안내.pdf',
    tag: '발표/PPT'
  },
  '취업/지원': {
    desc: '채용 공고, 인턴 모집 공고',
    docType: '채용 공고',
    title: 'A기업 인턴 지원',
    dDay: 'D-3',
    deadline: '2026년 6월 10일 18:00 · 지원서 접수 마감',
    req: ['자기소개서 및 포트폴리오 제출 필요', '재학증명서 제출', 'PDF 형식 포트폴리오'],
    source: '2026_상반기_마케팅직무_채용공고.pdf',
    tag: '취업/지원'
  },
  '공모전/프로젝트': {
    desc: '공모전 요강, 프로젝트 안내문',
    docType: '공모전 모집요강',
    title: '서비스 기획 공모전',
    dDay: 'D-12',
    deadline: '2026년 6월 24일 17:00 · 접수 마감',
    req: ['기획서 PDF 및 발표자료 제출 필요', '팀 정보 제출', '기획서 10페이지 이내'],
    source: '2026_서비스기획_공모전_모집요강.pdf',
    tag: '공모전/프로젝트'
  }
};

const initialFiles: KeepFile[] = [
  {
    id: 'file1',
    name: '2026_서비스기획_공모전_모집요강.pdf',
    source: '공모전 플랫폼',
    type: 'PDF',
    savedAt: '방금 전',
    timestamp: 140,
    tag: '공모전/프로젝트',
    status: '정리 필요',
    shared: true
  },
  {
    id: 'file2',
    name: '마케팅조사_과제공지.pdf',
    source: 'LMS',
    type: 'PDF',
    savedAt: '2시간 전',
    timestamp: 80,
    tag: '과제/보고서',
    status: '작업 카드 생성됨',
    shared: false
  },
  {
    id: 'file3',
    name: '팀플_발표안내.pdf',
    source: '카카오톡',
    type: 'PDF',
    savedAt: '3일 전',
    timestamp: 40,
    tag: '발표/PPT',
    status: '작업 카드 생성됨',
    shared: false
  },
  {
    id: 'file4',
    name: '생활계약_체크리스트.pdf',
    source: '메일',
    type: 'PDF',
    savedAt: '지난주',
    timestamp: 20,
    tag: '분류 필요',
    status: '정리 필요',
    shared: false
  }
];

const initialCandidates: ExtractedCandidate[] = [
  {
    id: 'deadline',
    type: '마감일',
    tag: 'red',
    title: '2026년 6월 24일 17:00',
    desc: '제안서 접수 마감',
    quote: '제안서는 2026년 6월 24일 17:00까지 제출해야 합니다.',
    selected: true
  },
  {
    id: 'docs',
    type: '제출 서류',
    tag: 'blue',
    title: '기획서 PDF 및 발표자료 제출 필요',
    desc: '기획서 PDF, 발표자료, 팀 정보',
    quote: '제출 서류: 기획서 PDF, 발표자료, 팀 정보',
    selected: true
  },
  {
    id: 'result',
    type: '결과 발표일',
    tag: 'orange',
    title: '2026년 7월 5일',
    desc: '본선 진출팀 발표 예정',
    quote: '본선 진출팀은 2026년 7월 5일 발표 예정입니다.',
    selected: false
  }
];

const initialCompletedRecords: CompletedRecord[] = [
  {
    title: '서비스 기획 공모전',
    type: '공모전/프로젝트',
    sourceFile: '2026_서비스기획_공모전_모집요강.pdf',
    finalOutput: '서비스기획_공모전_제안서.pdf',
    submittedAt: '2026.06.24',
    requirements: ['기획서 PDF 및 발표자료 제출 필요', '팀 정보 제출', '기획서 10페이지 이내'],
    completedTodos: ['모집요강 조건 확인', '제출 서류 준비', '기획서 목차 작성', '발표자료 초안 작성', '최종본 내보내기']
  },
  {
    title: '마케팅조사 개인 리포트',
    type: '과제/보고서',
    sourceFile: '마케팅조사_과제공지.pdf',
    finalOutput: '마케팅조사_리포트.pdf',
    submittedAt: '2026.05.13',
    requirements: ['PDF 형식 제출', '3페이지 이내', 'LMS 과제함 제출'],
    completedTodos: ['요구사항 확인', '자료 수집', '개요 작성', '초안 작성', '최종본 내보내기']
  },
  {
    title: '팀플 발표자료',
    type: '발표/PPT',
    sourceFile: '팀플_발표안내.pdf',
    finalOutput: '소비자분석_최종발표.pdf',
    submittedAt: '2026.05.20',
    requirements: ['최종 PDF 제출', '발표 시간 10분', '팀원 검토 완료'],
    completedTodos: ['핵심 메시지 정리', '목차 구성', '슬라이드 초안 작성', '발표본 검토']
  }
];

const upcomingTasks = [
  {
    title: '서비스 기획 공모전',
    purpose: '공모전/프로젝트' as PurposeKind,
    dday: 'D-12',
    deadline: '2026.06.24 17:00',
    output: '기획서 PDF · 발표자료 · 팀 정보',
    progress: '조건 2개 확인 완료',
    condition: '기획서 PDF와 발표자료 제출 조건을 확인해보세요.',
    action: '모집요강 확인'
  },
  {
    title: '마케팅조사 개인 리포트',
    purpose: '과제/보고서' as PurposeKind,
    dday: 'D-7',
    deadline: '2026.06.30 23:59',
    output: '3페이지 이내 PDF 리포트',
    progress: '목차 초안 필요',
    condition: '공지 기반으로 목차와 최종 제출 형식을 확인해보세요.',
    action: '목차 작성'
  },
  {
    title: '팀플 발표자료',
    purpose: '발표/PPT' as PurposeKind,
    dday: 'D-5',
    deadline: '2026.06.18 발표 전',
    output: '최종 PDF · 발표용 PPTX',
    progress: '팀원 검토 대기',
    condition: '발표본 검토와 최종 파일 정리를 확인해보세요.',
    action: '발표본 검토'
  }
];

const recentDocuments = [
  { name: '서비스기획_공모전_제안서.pdf', date: '오늘', type: '문서' },
  { name: '서비스기획_공모전_발표자료.pptx', date: '오늘', type: '발표' },
  { name: '마케팅조사_리포트.pdf', date: '5월 13일', type: '문서' },
  { name: '소비자분석_최종발표.pdf', date: '5월 20일', type: '발표' }
];

const keepViewLabels: Record<KeepToPolarisView, string> = {
  home: '홈',
  inbox: '받은 자료',
  purpose: '작업 목적 선택',
  candidates: '마감·조건 후보 확인',
  task: '작업 카드',
  document: '작성 문서',
  records: '완료 기록',
  recent: '최근 문서',
  drive: 'Polaris Drive'
};

const keepNavItems: Array<{ view: KeepToPolarisView; label: string; icon: React.ElementType }> = [
  { view: 'home', label: '킵 투 폴라리스', icon: FolderInput },
  { view: 'inbox', label: '받은 자료', icon: Inbox },
  { view: 'records', label: '완료 기록', icon: FileCheck2 }
];

const flowSteps: Array<{ view: KeepToPolarisView; label: string }> = [
  { view: 'inbox', label: '받은 자료' },
  { view: 'purpose', label: '목적 선택' },
  { view: 'candidates', label: '후보 확인' },
  { view: 'task', label: '작업 카드' },
  { view: 'document', label: '문서 작성' },
  { view: 'records', label: '완료 기록' }
];

export function ClusterOneStart({ onSendToPolaris }: ClusterOneStartProps) {
  const [shareOpen, setShareOpen] = useState(false);

  const sendToPolaris = () => {
    setShareOpen(false);
    onSendToPolaris();
  };

  return (
    <section className="cl1-route-shell" aria-label="공모전 모집요강 PDF">
      <div className="cl1-browser-window cl1-browser-product">
        <div className="cl1-browser-top">
          <div className="cl1-window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="cl1-browser-tabs" aria-label="브라우저 탭">
            <span className="cl1-browser-tab cl1-browser-tab-active">Contest Notice</span>
            <span className="cl1-browser-tab">Polaris Office</span>
          </div>
          <div className="cl1-address-bar">
            <Search size={14} aria-hidden="true" />
            <span>https://contest-platform.co.kr/competition/service-idea-2026.pdf</span>
          </div>
          <div className="cl1-share-area">
            <PolarisButton className="cl1-icon-button" aria-label="공유 메뉴" onClick={() => setShareOpen((open) => !open)}>
              <Share2 size={18} aria-hidden="true" />
            </PolarisButton>
            {shareOpen && (
              <div className="cl1-share-menu" role="menu">
                <strong>공유하기</strong>
                <PolarisButton className="cl1-share-option" role="menuitem">
                  <Mail size={17} aria-hidden="true" />
                  <span>
                    메일
                    <small>파일 첨부</small>
                  </span>
                </PolarisButton>
                <PolarisButton className="cl1-share-option" role="menuitem">
                  <Link2 size={17} aria-hidden="true" />
                  <span>
                    링크 복사
                    <small>문서 URL 복사</small>
                  </span>
                </PolarisButton>
                <PolarisButton className="cl1-share-option cl1-share-option-primary" role="menuitem" onClick={sendToPolaris}>
                  <FolderInput size={17} aria-hidden="true" />
                  <span>
                    Polaris Office
                    <small>킵 투 폴라리스로 보내기</small>
                  </span>
                </PolarisButton>
              </div>
            )}
          </div>
        </div>

        <div className="cl1-source-layout cl1-source-layout-product">
          <aside className="cl1-job-panel">
            <span className="cl1-company-badge">대학생 공모전</span>
            <h1>일상 속 생산성 서비스 아이디어 제안 공모전</h1>

            <dl className="cl1-job-meta cl1-job-meta-compact">
              <div>
                <dt>접수 마감</dt>
                <dd>2026.06.24 17:00</dd>
              </div>
              <div>
                <dt>제출 서류</dt>
                <dd>기획서 PDF · 발표자료 · 팀 정보</dd>
              </div>
              <div>
                <dt>참가 대상</dt>
                <dd>대학생 및 휴학생 팀</dd>
              </div>
            </dl>

            <div className="cl1-source-actions">
              <PolarisButton className="primary-action cl1-send-button" onClick={sendToPolaris}>
                <Send size={16} aria-hidden="true" />
                Polaris로 보내기
              </PolarisButton>
              <PolarisButton className="secondary-action">
                <Download size={16} aria-hidden="true" />
                PDF 저장
              </PolarisButton>
            </div>
          </aside>

          <main className="cl1-pdf-viewer" aria-label="공모전 모집요강 PDF">
            <div className="cl1-pdf-toolbar">
              <span>2026_서비스기획_공모전_모집요강.pdf</span>
              <div>
                <PolarisButton aria-label="보기 옵션">
                  <Eye size={16} aria-hidden="true" />
                </PolarisButton>
                <PolarisButton aria-label="더보기">
                  <MoreHorizontal size={16} aria-hidden="true" />
                </PolarisButton>
              </div>
            </div>

            <ContestPdfPage />
          </main>
        </div>
      </div>
    </section>
  );
}

export function ClusterOneWorkspace({ initialView = 'home' }: { initialView?: KeepToPolarisView }) {
  const [state, dispatch] = useReducer(keepReducer, initialView, createInitialKeepState);

  const selectedFile = state.files.find((file) => file.id === state.selectedFileId) ?? state.files[0];
  const currentTask = state.currentTask ?? buildTask(state.selectedPurpose, state.candidates);
  const isTopLevelTab = ['home', 'inbox', 'records'].includes(state.view);
  const isInboxDetail = ['purpose', 'candidates', 'task', 'document'].includes(state.view);
  const commandTitle = isInboxDetail
    ? '받은 자료'
    : state.view === 'records'
      ? '완료 기록'
      : state.view === 'inbox'
        ? '받은 자료'
        : '킵 투 폴라리스';
  const backTarget: KeepToPolarisView = isInboxDetail ? 'inbox' : 'home';
  const sortedFiles = useMemo(() => {
    return [...state.files].sort((a, b) => (state.inboxSort === 'latest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
  }, [state.files, state.inboxSort]);

  useEffect(() => {
    if (!state.toast) {
      return;
    }

    const timer = window.setTimeout(() => dispatch({ type: 'dismiss-toast' }), 7000);
    return () => window.clearTimeout(timer);
  }, [state.toast]);

  const goToToastAction = () => {
    if (!state.toast?.actionView) {
      dispatch({ type: 'dismiss-toast' });
      return;
    }

    dispatch({ type: 'navigate', view: state.toast.actionView });
    dispatch({ type: 'dismiss-toast' });
  };

  return (
    <section className="keep-workbench" aria-labelledby="keep-workbench-title">
      <header className="keep-command-bar">
        <div className="keep-command-leading">
          {!isTopLevelTab && (
            <PolarisButton className="secondary-action compact-action keep-command-back" onClick={() => dispatch({ type: 'navigate', view: backTarget })}>
              <ArrowLeft size={16} aria-hidden="true" />
              이전
            </PolarisButton>
          )}
          <div className="keep-command-title">
            <h1 id="keep-workbench-title">{commandTitle}</h1>
          </div>
        </div>

        <div className="keep-command-status" aria-label="작업 상태">
          <StatusChip icon={CalendarClock} label={currentTask.dDay} tone="warning" />
          <StatusChip icon={CheckCircle2} label={`${currentTask.todos.filter((todo) => todo.done).length}/${currentTask.todos.length}`} tone="success" />
          <StatusChip icon={Bell} label={currentTask.status} />
        </div>
      </header>

      <div className="keep-shell">
        <main className="keep-stage">
          {isTopLevelTab && (
            <KeepTopTabs
              activeView={state.view}
              fileCount={state.files.length}
              recordCount={state.completedRecords.length}
              onNavigate={(view) => dispatch({ type: 'navigate', view })}
            />
          )}

          {['purpose', 'candidates', 'task', 'document'].includes(state.view) && (
            <FlowStepper activeView={state.view} onNavigate={(view) => dispatch({ type: 'navigate', view })} />
          )}

          {state.view === 'home' && <HomeBoard state={state} dispatch={dispatch} />}
          {state.view === 'inbox' && <InboxBoard files={sortedFiles} sort={state.inboxSort} dispatch={dispatch} />}
          {state.view === 'purpose' && <PurposeBoard selectedPurpose={state.selectedPurpose} dispatch={dispatch} />}
          {state.view === 'candidates' && <CandidateBoard state={state} selectedFile={selectedFile} dispatch={dispatch} />}
          {state.view === 'task' && <TaskBoard task={currentTask} dispatch={dispatch} />}
          {state.view === 'document' && <DocumentBoard task={currentTask} dispatch={dispatch} />}
          {state.view === 'records' && <RecordsBoard records={state.completedRecords} dispatch={dispatch} />}
          {state.view === 'recent' && <RecentBoard records={state.completedRecords} dispatch={dispatch} />}
          {state.view === 'drive' && <DriveBoard currentTask={currentTask} records={state.completedRecords} dispatch={dispatch} />}
        </main>
      </div>

      {state.originalPreviewOpen && <OriginalPreview onClose={() => dispatch({ type: 'close-original' })} />}
      {state.exportModalOpen && <ExportModal task={currentTask} onClose={() => dispatch({ type: 'close-export' })} onConfirm={(format, name) => dispatch({ type: 'confirm-export', format, name })} />}
      {state.toast && <KeepToast toast={state.toast} onDismiss={() => dispatch({ type: 'dismiss-toast' })} onAction={goToToastAction} />}
    </section>
  );
}

function KeepTopTabs({
  activeView,
  fileCount,
  recordCount,
  onNavigate
}: {
  activeView: KeepToPolarisView;
  fileCount: number;
  recordCount: number;
  onNavigate: (view: KeepToPolarisView) => void;
}) {
  const countByView: Partial<Record<KeepToPolarisView, number>> = {
    inbox: fileCount,
    records: recordCount
  };

  return (
    <section className="keep-top-tabs" aria-label="킵 투 폴라리스 주요 탭">
      <nav>
        {keepNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            activeView === item.view ||
            (item.view === 'inbox' && ['purpose', 'candidates', 'task', 'document', 'recent', 'drive'].includes(activeView));
          const count = countByView[item.view];

          return (
            <PolarisButton
              key={item.view}
              className={`keep-top-tab ${active ? 'keep-top-tab-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate(item.view)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{item.label}</span>
              {typeof count === 'number' && <strong>{count}</strong>}
            </PolarisButton>
          );
        })}
      </nav>
    </section>
  );
}

function HomeBoard({ state, dispatch }: { state: KeepToPolarisState; dispatch: React.Dispatch<KeepAction> }) {
  const item = upcomingTasks[state.homeIndex];
  const nextIndex = (state.homeIndex + 1) % upcomingTasks.length;
  const prevIndex = (state.homeIndex + upcomingTasks.length - 1) % upcomingTasks.length;
  const taskCount = state.files.filter((file) => file.status.includes('작업') || file.shared).length;

  return (
    <div className="keep-board keep-home-board">
      {!state.homeAlertDismissed && <HomeDeadlineAlert dispatch={dispatch} />}

      <div className="keep-summary-row" aria-label="작업 요약">
        <MetricCard label="가장 가까운 마감" value="D-12" />
        <MetricCard label="킵 투 폴라리스 작업" value={`${taskCount}`} />
        <MetricCard label="완료 기록" value={`${state.completedRecords.length}`} />
      </div>

      <section className="keep-card keep-carousel-card" aria-labelledby="keep-upcoming-title">
        <div className="keep-card-head">
          <div>
            <h3 id="keep-upcoming-title">다가오는 작업</h3>
            <p className="keep-card-subcopy">저장된 자료에서 추출한 마감과 제출 조건을 기준으로 오늘 확인할 일을 보여줘요.</p>
          </div>
          <span className="keep-tag">{state.homeIndex + 1} / {upcomingTasks.length}</span>
        </div>

        <PolarisButton className="keep-upcoming-card" onClick={() => dispatch({ type: 'create-task-for-purpose', purpose: item.purpose })}>
          <div className="keep-upcoming-hero">
            <div className="keep-upcoming-copy">
              <small className="keep-upcoming-kicker">가장 먼저 챙길 작업</small>
              <span className="keep-tag keep-tag-inverse">{item.purpose}</span>
              <strong>{item.title}</strong>
              <p>{item.condition}</p>
            </div>
            <em>{item.dday}</em>
          </div>

          <div className="keep-upcoming-details" aria-label="다가오는 작업 세부 정보">
            <span>
              <CalendarClock size={15} aria-hidden="true" />
              <small>마감</small>
              <b>{item.deadline}</b>
            </span>
            <span>
              <FileCheck2 size={15} aria-hidden="true" />
              <small>제출물</small>
              <b>{item.output}</b>
            </span>
            <span>
              <CheckCircle2 size={15} aria-hidden="true" />
              <small>진행</small>
              <b>{item.progress}</b>
            </span>
          </div>

          <div className="keep-upcoming-next">
            <span>다음 작업</span>
            <strong>{item.action}</strong>
            <ChevronRight size={17} aria-hidden="true" />
          </div>
        </PolarisButton>

        <div className="keep-carousel-controls" aria-label="다가오는 작업 이동">
          <PolarisButton className="keep-icon-button" aria-label="이전 작업" onClick={() => dispatch({ type: 'set-home-index', index: prevIndex })}>
            <ArrowLeft size={16} aria-hidden="true" />
          </PolarisButton>
          <div>
            {upcomingTasks.map((task, index) => (
              <PolarisButton
                key={task.title}
                className={`keep-dot ${index === state.homeIndex ? 'keep-dot-active' : ''}`}
                aria-label={`${index + 1}번째 작업`}
                onClick={() => dispatch({ type: 'set-home-index', index })}
              />
            ))}
          </div>
          <PolarisButton className="keep-icon-button" aria-label="다음 작업" onClick={() => dispatch({ type: 'set-home-index', index: nextIndex })}>
            <ArrowRight size={16} aria-hidden="true" />
          </PolarisButton>
        </div>
      </section>

      <div className="keep-home-grid">
        <section className="keep-card" aria-labelledby="keep-recent-tasks-title">
          <div className="keep-card-head">
            <h3 id="keep-recent-tasks-title">최근 작업</h3>
          </div>
          <MiniTaskRow title="서비스 기획 공모전" type="공모전/프로젝트" status="진행중" />
          <MiniTaskRow title="마케팅조사 개인 리포트" type="과제/보고서" status="완료" />
        </section>

        <section className="keep-card" aria-labelledby="keep-recent-docs-title">
          <div className="keep-card-head">
            <h3 id="keep-recent-docs-title">최근 문서</h3>
            <div className="keep-action-row">
              <PolarisButton className="secondary-action compact-action" onClick={() => dispatch({ type: 'navigate', view: 'recent' })}>
                전체 보기
              </PolarisButton>
              <PolarisButton className="secondary-action compact-action" onClick={() => dispatch({ type: 'navigate', view: 'drive' })}>
                파일함
              </PolarisButton>
            </div>
          </div>
          {recentDocuments.slice(0, 3).map((doc) => (
            <DocumentRow key={doc.name} name={doc.name} date={doc.date} tag={doc.type} />
          ))}
        </section>
      </div>
    </div>
  );
}

function HomeDeadlineAlert({ dispatch }: { dispatch: React.Dispatch<KeepAction> }) {
  return (
    <section className="keep-deadline-alert" role="alert" aria-label="마감 알림">
      <div>
        <span>마감 알림 · D-12</span>
        <strong>서비스 기획 공모전 제출 마감이 12일 남았습니다.</strong>
        <p>기획서 PDF와 발표자료 제출 조건을 확인하고, 작업 카드에서 남은 일을 정리해보세요.</p>
      </div>
      <div className="keep-alert-actions">
        <PolarisButton className="primary-action compact-action" onClick={() => dispatch({ type: 'create-task-for-purpose', purpose: '공모전/프로젝트' })}>
          작업 카드 열기
        </PolarisButton>
        <PolarisButton className="secondary-action compact-action" onClick={() => dispatch({ type: 'navigate', view: 'inbox' })}>
          받은 자료 보기
        </PolarisButton>
        <PolarisButton className="keep-icon-button" aria-label="알림 닫기" onClick={() => dispatch({ type: 'dismiss-home-alert' })}>
          <X size={15} aria-hidden="true" />
        </PolarisButton>
      </div>
    </section>
  );
}

function InboxBoard({ files, sort, dispatch }: { files: KeepFile[]; sort: InboxSortMode; dispatch: React.Dispatch<KeepAction> }) {
  const contestCount = files.filter((file) => file.tag === '공모전/프로젝트').length;
  const reportCount = files.filter((file) => file.tag === '과제/보고서').length;

  return (
    <div className="keep-board">
      <section className="keep-screen-heading">
        <div>
          <h2>받은 자료</h2>
          <p>정리할 파일을 선택해보세요.</p>
        </div>
      </section>

      <div className="keep-toolbar">
        <div className="keep-tag-row">
          <span className="keep-tag">전체 {files.length}</span>
          <span className="keep-tag keep-tag-warn">공모전 {contestCount}</span>
          <span className="keep-tag">과제 {reportCount}</span>
        </div>
        <KeepSelect
          label="정렬"
          value={sort}
          options={[
            { value: 'latest', label: '최신순' },
            { value: 'oldest', label: '오래된 순' }
          ]}
          onChange={(value) => dispatch({ type: 'set-sort', sort: value })}
        />
      </div>

      <div className="keep-file-list">
        {files.map((file) => (
          <article className="keep-file-card" key={file.id}>
            <FileIcon className="keep-file-icon" type={getFileIconType(file.type)} size={42} />
            <div className="keep-file-main">
              <strong>{file.name}</strong>
              <span>
                {file.source} · {file.savedAt}
                <em className={tagClass(file.tag)}>{file.tag}</em>
                <em>{file.status}</em>
              </span>
            </div>
            <PolarisButton className="primary-action compact-action" onClick={() => dispatch({ type: 'organize-file', fileId: file.id })}>
              작업으로 정리
            </PolarisButton>
          </article>
        ))}
      </div>
    </div>
  );
}

function PurposeBoard({ selectedPurpose, dispatch }: { selectedPurpose: PurposeKind; dispatch: React.Dispatch<KeepAction> }) {
  const meta = purposeMeta[selectedPurpose];

  return (
    <div className="keep-board">
      <section className="keep-screen-heading keep-screen-heading-row">
        <div>
          <p className="eyebrow">Purpose</p>
          <h2>작업 목적 선택</h2>
          <p>파일에 맞는 작업 흐름을 골라보세요.</p>
        </div>
        <PolarisButton className="secondary-action" onClick={() => dispatch({ type: 'navigate', view: 'inbox' })}>
          받은 자료로 돌아가기
        </PolarisButton>
      </section>

      <div className="keep-purpose-layout">
        <div className="keep-purpose-grid">
          {Object.entries(purposeMeta).map(([purpose, item]) => (
            <PolarisButton
              key={purpose}
              className={`keep-purpose-card ${purpose === selectedPurpose ? 'keep-purpose-card-active' : ''}`}
              aria-pressed={purpose === selectedPurpose}
              onClick={() => dispatch({ type: 'select-purpose', purpose: purpose as PurposeKind })}
            >
              <strong>{purpose}</strong>
              <span>{item.desc}</span>
            </PolarisButton>
          ))}
        </div>

        <aside className="keep-card keep-recommend-card">
          <span className="keep-kicker">추천 문서 유형</span>
          <h3>{meta.docType}</h3>
          <div className="keep-recommend-box">
            <strong>{selectedPurpose}</strong> 목적이 가장 적합해 보여요.
            <ul>
              <li>문서 안에 접수 마감일 후보가 있어요.</li>
              <li>제출 서류와 파일 형식 조건이 포함되어 있어요.</li>
              <li>후속 작업을 카드로 정리할 수 있어요.</li>
            </ul>
          </div>
          <PolarisButton className="primary-action" onClick={() => dispatch({ type: 'navigate', view: 'candidates' })}>
            이 목적으로 만들기
          </PolarisButton>
        </aside>
      </div>
    </div>
  );
}

function CandidateBoard({
  state,
  selectedFile,
  dispatch
}: {
  state: KeepToPolarisState;
  selectedFile: KeepFile;
  dispatch: React.Dispatch<KeepAction>;
}) {
  return (
    <div className="keep-board">
      <section className="keep-screen-heading keep-screen-heading-row">
        <div>
          <p className="eyebrow">Extracted Conditions</p>
          <h2>마감·조건 후보 확인</h2>
          <p>작업 카드에 넣을 항목만 체크해보세요.</p>
        </div>
        <PolarisButton className="secondary-action" onClick={() => dispatch({ type: 'navigate', view: 'purpose' })}>
          이전
        </PolarisButton>
      </section>

      <div className="keep-candidate-layout">
        <div className="keep-candidate-list">
          {state.candidates.map((candidate) => (
            <label className="keep-candidate-card" key={candidate.id}>
              <KeepCheckbox checked={candidate.selected} onChange={() => dispatch({ type: 'toggle-candidate', candidateId: candidate.id })} />
              <span>
                <em className={`keep-candidate-tag keep-candidate-tag-${candidate.tag}`}>{candidate.type}</em>
                <strong>{candidate.title}</strong>
                <small>{candidate.desc}</small>
                <blockquote>{candidate.quote}</blockquote>
              </span>
            </label>
          ))}
        </div>

        <aside className="keep-card keep-selected-file-card">
          <h3>선택된 파일</h3>
          <dl className="keep-meta-list">
            <div>
              <dt>파일명</dt>
              <dd>{selectedFile.name}</dd>
            </div>
            <div>
              <dt>작업 목적</dt>
              <dd>{state.selectedPurpose}</dd>
            </div>
            <div>
              <dt>원본 출처</dt>
              <dd>{selectedFile.source}</dd>
            </div>
          </dl>
          <PolarisButton className="primary-action" onClick={() => dispatch({ type: 'create-task' })}>
            작업 카드로 만들기
          </PolarisButton>
        </aside>
      </div>
    </div>
  );
}

function TaskBoard({ task, dispatch }: { task: KeepTask; dispatch: React.Dispatch<KeepAction> }) {
  const doneCount = task.todos.filter((todo) => todo.done).length;
  const [todoDraft, setTodoDraft] = useState('');

  const submitTodo = () => {
    if (!todoDraft.trim()) {
      return;
    }

    dispatch({ type: 'add-todo', title: todoDraft });
    setTodoDraft('');
  };

  return (
    <div className="keep-board">
      <section className="keep-task-summary">
        <div className="keep-task-summary-top">
          <div>
            <div className="keep-task-status-row">
              <span className={`keep-tag ${tagClass(task.purpose)}`}>{task.purpose}</span>
              <KeepSelect
                className="keep-status-select"
                label="상태"
                value={task.status}
                options={[
                  { value: '시작 전', label: '시작 전' },
                  { value: '초안 작성', label: '초안 작성' },
                  { value: '수정 중', label: '수정 중' },
                  { value: '완료', label: '완료' }
                ]}
                onChange={(value) => dispatch({ type: 'set-task-status', status: value })}
              />
            </div>
            <h2>{task.title}</h2>
          </div>
          <strong>{task.dDay}</strong>
        </div>

        <div className="keep-task-info-grid">
          <PolarisButton className="keep-info-box keep-info-box-clickable" onClick={() => dispatch({ type: 'open-original' })}>
            <span>원본 파일</span>
            <strong>{task.sourceFile}</strong>
            <small>클릭해 원본 보기</small>
          </PolarisButton>
          <div className="keep-info-box">
            <span>마감 및 일정</span>
            <strong>{task.deadline}</strong>
          </div>
          <div className="keep-info-box">
            <span>저장된 조건</span>
            <strong>{task.requirements.join(', ')}</strong>
          </div>
        </div>
      </section>

      <section className="keep-card">
        <div className="keep-card-head">
          <h3>확인할 일</h3>
          <span className="keep-tag">{doneCount}/{task.todos.length}</span>
        </div>
        <div className="keep-todo-input-row">
          <PolarisInput
            label="확인할 일"
            className="keep-todo-input"
            value={todoDraft}
            placeholder="확인할 일을 입력하세요"
            onChange={(event) => setTodoDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                submitTodo();
              }
            }}
          />
          <PolarisButton className="primary-action" onClick={submitTodo}>
            추가
          </PolarisButton>
        </div>
        <TodoList todos={task.todos} dispatch={dispatch} />
      </section>

      <section className="keep-card keep-doc-launch-card">
        <div>
          <h3>작성 문서</h3>
          <p>원본과 확인할 일을 보면서 작성해보세요.</p>
        </div>
        <div className="keep-action-row">
          <PolarisButton className="primary-action" onClick={() => dispatch({ type: 'open-document' })}>
            <FileText size={16} aria-hidden="true" />
            {task.docContent ? '작성 중 문서 보기' : '새 문서 만들기'}
          </PolarisButton>
          <PolarisButton className="secondary-action" onClick={() => dispatch({ type: 'open-export' })}>
            <Upload size={16} aria-hidden="true" />
            내보내기
          </PolarisButton>
          <PolarisButton className="secondary-action" onClick={() => dispatch({ type: 'save-completion' })}>
            완료 기록 저장
          </PolarisButton>
        </div>
      </section>
    </div>
  );
}

function DocumentBoard({ task, dispatch }: { task: KeepTask; dispatch: React.Dispatch<KeepAction> }) {
  const content = task.docContent || buildDefaultDocument(task.title);

  return (
    <div className="keep-board keep-document-board">
      <section className="keep-document-editor" aria-labelledby="keep-document-title">
        <div className="keep-document-titlebar">
          <div>
            <span className="keep-kicker">문서</span>
            <h2 id="keep-document-title">{task.finalOutput || `${task.title}_제안서.docx`}</h2>
          </div>
          <div className="keep-action-row">
            <PolarisButton className="secondary-action compact-action" onClick={() => dispatch({ type: 'navigate', view: 'task' })}>
              작업 카드
            </PolarisButton>
            <PolarisButton className="secondary-action compact-action" onClick={() => dispatch({ type: 'open-export' })}>
              내보내기
            </PolarisButton>
            <PolarisButton className="primary-action compact-action" onClick={() => dispatch({ type: 'save-completion' })}>
              완료 기록 저장
            </PolarisButton>
          </div>
        </div>

        <Ribbon className="keep-doc-ribbon" aria-label="문서 작성 도구">
          <RibbonTabs defaultValue="home">
            <RibbonTabList>
              <RibbonTab value="home">홈</RibbonTab>
              <RibbonTab value="insert">삽입</RibbonTab>
              <RibbonTab value="review">검토</RibbonTab>
            </RibbonTabList>
            <RibbonContent value="home">
              <RibbonGroup label="문서">
                <RibbonRow>
                  <RibbonButton size="sm" icon={<FileText size={15} aria-hidden="true" />} onClick={() => dispatch({ type: 'prime-doc' })}>
                    목차
                  </RibbonButton>
                  <RibbonButton size="sm" icon={<Upload size={15} aria-hidden="true" />} onClick={() => dispatch({ type: 'open-export' })}>
                    내보내기
                  </RibbonButton>
                </RibbonRow>
              </RibbonGroup>
              <RibbonGroup label="검토">
                <RibbonRow>
                  <RibbonButton size="sm" icon={<Eye size={15} aria-hidden="true" />} onClick={() => dispatch({ type: 'open-original' })}>
                    원본
                  </RibbonButton>
                  <RibbonButton size="sm" icon={<CheckCircle2 size={15} aria-hidden="true" />} onClick={() => dispatch({ type: 'save-completion' })}>
                    완료 기록
                  </RibbonButton>
                </RibbonRow>
              </RibbonGroup>
            </RibbonContent>
            <RibbonContent value="insert">
              <RibbonGroup label="자료">
                <RibbonRow>
                  <RibbonButton size="sm" icon={<FolderInput size={15} aria-hidden="true" />} onClick={() => dispatch({ type: 'navigate', view: 'inbox' })}>
                    받은 자료
                  </RibbonButton>
                </RibbonRow>
              </RibbonGroup>
            </RibbonContent>
            <RibbonContent value="review">
              <RibbonGroup label="조건">
                <RibbonRow>
                  <RibbonButton size="sm" icon={<FileCheck2 size={15} aria-hidden="true" />} onClick={() => dispatch({ type: 'navigate', view: 'task' })}>
                    작업 카드
                  </RibbonButton>
                </RibbonRow>
              </RibbonGroup>
            </RibbonContent>
          </RibbonTabs>
        </Ribbon>

        <PolarisTextarea
          label="본문"
          className="keep-doc-editor"
          rows={18}
          value={content}
          onFocus={() => dispatch({ type: 'prime-doc' })}
          onChange={(event) => dispatch({ type: 'update-doc', content: event.target.value })}
        />
      </section>

      <aside className="keep-document-side">
        <section className="keep-card">
          <span className="keep-kicker">원본</span>
          <strong>{task.sourceFile}</strong>
          <p>{task.source}</p>
          <PolarisButton className="secondary-action" onClick={() => dispatch({ type: 'open-original' })}>
            원본 보기
          </PolarisButton>
        </section>
        <section className="keep-card">
          <div className="keep-card-head">
            <h3>확인할 일</h3>
          </div>
          <div className="keep-doc-todo-list">
            {task.todos.map((todo) => (
              <div className={`keep-doc-todo ${todo.done ? 'keep-doc-todo-done' : ''}`} key={todo.id}>
                <CheckCircle2 size={15} aria-hidden="true" />
                <span>{todo.title}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function RecordsBoard({ records, dispatch }: { records: CompletedRecord[]; dispatch: React.Dispatch<KeepAction> }) {
  return (
    <div className="keep-board">
      <section className="keep-screen-heading">
        <div>
          <p className="eyebrow">Records</p>
          <h2>완료 기록</h2>
          <p>원본과 최종본을 함께 확인해보세요.</p>
        </div>
      </section>

      <div className="keep-record-list">
        {records.map((record, index) => (
          <article className={`keep-record-card ${index === 0 ? 'keep-record-card-featured' : ''}`} key={`${record.title}-${record.finalOutput}`}>
            <span className="keep-record-icon">
              <CheckCircle2 size={18} aria-hidden="true" />
            </span>
            <div className="keep-record-main">
              <h3>{record.title}</h3>
              <p>원본: {record.sourceFile}<br />최종본: {record.finalOutput}<br />제출일: {record.submittedAt} · 유형: {record.type}</p>
              <div className="keep-tag-row">
                {record.completedTodos.slice(0, 4).map((todo) => (
                  <span className="keep-tag" key={todo}>{todo}</span>
                ))}
              </div>
            </div>
            <div className="keep-record-actions">
              <PolarisButton className="secondary-action compact-action" onClick={() => dispatch({ type: 'open-document' })}>
                최종본 열기
              </PolarisButton>
              <PolarisButton className="secondary-action compact-action" onClick={() => dispatch({ type: 'open-original' })}>
                원본 보기
              </PolarisButton>
              <PolarisButton className="secondary-action compact-action" onClick={() => dispatch({ type: 'select-purpose', purpose: record.type })}>
                같은 유형 작업 만들기
              </PolarisButton>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function RecentBoard({ records, dispatch }: { records: CompletedRecord[]; dispatch: React.Dispatch<KeepAction> }) {
  const mergedDocs = [
    ...records.map((record) => ({ name: record.finalOutput, date: record.submittedAt, type: record.type })),
    ...recentDocuments
  ];

  return (
    <div className="keep-board">
      <section className="keep-screen-heading">
        <div>
          <p className="eyebrow">Files</p>
          <h2>최근 문서</h2>
          <p>최근에 열었던 문서입니다.</p>
        </div>
        <PolarisButton className="secondary-action" onClick={() => dispatch({ type: 'navigate', view: 'drive' })}>
          파일함 보기
        </PolarisButton>
      </section>

      <section className="keep-card">
        {mergedDocs.map((doc) => (
          <PolarisButton className="keep-doc-row" key={`${doc.name}-${doc.date}`} onClick={() => dispatch({ type: 'navigate', view: 'document' })}>
            <FileIcon className="keep-doc-file-icon" type={getFileIconType(doc.name)} size={36} />
            <span>
              <strong>{doc.name}</strong>
              <small>{doc.date}</small>
            </span>
            <em>{doc.type}</em>
          </PolarisButton>
        ))}
      </section>
    </div>
  );
}

function DriveBoard({
  currentTask,
  records,
  dispatch
}: {
  currentTask: KeepTask;
  records: CompletedRecord[];
  dispatch: React.Dispatch<KeepAction>;
}) {
  const keepDocs = [
    currentTask.sourceFile,
    currentTask.finalOutput || '서비스기획_공모전_제안서.pdf'
  ];

  return (
    <div className="keep-board">
      <section className="keep-screen-heading">
        <div>
          <p className="eyebrow">Drive</p>
          <h2>Polaris Drive</h2>
          <p>드라이브에 저장된 파일입니다.</p>
        </div>
      </section>

      <div className="keep-drive-grid">
        <section className="keep-card">
          <div className="keep-card-head">
            <h3>킵 투 폴라리스</h3>
            <span className="keep-tag">{keepDocs.length}</span>
          </div>
          {keepDocs.map((name) => (
            <PolarisButton
              className="keep-doc-row"
              key={name}
              onClick={() => {
                if (name === currentTask.sourceFile) {
                  dispatch({ type: 'open-original' });
                  return;
                }

                dispatch({ type: 'navigate', view: 'document' });
              }}
            >
              <FileIcon className="keep-doc-file-icon" type={getFileIconType(name)} size={36} />
              <span>
                <strong>{name}</strong>
                <small>업데이트: 오늘</small>
              </span>
              <ChevronRight size={16} aria-hidden="true" />
            </PolarisButton>
          ))}
        </section>

        <section className="keep-card">
          <div className="keep-card-head">
            <h3>프로젝트</h3>
            <span className="keep-tag">{records.length}</span>
          </div>
          {records.slice(1).map((record) => (
            <PolarisButton className="keep-doc-row" key={record.finalOutput} onClick={() => dispatch({ type: 'navigate', view: 'document' })}>
              <FileIcon className="keep-doc-file-icon" type={getFileIconType(record.finalOutput)} size={36} />
              <span>
                <strong>{record.finalOutput}</strong>
                <small>업데이트: {record.submittedAt}</small>
              </span>
              <ChevronRight size={16} aria-hidden="true" />
            </PolarisButton>
          ))}
        </section>
      </div>
    </div>
  );
}

function TodoList({ todos, dispatch }: { todos: TodoItem[]; dispatch: React.Dispatch<KeepAction> }) {
  return (
    <div className="keep-todo-list">
      {todos.map((todo) => (
        <div className={`keep-todo-row ${todo.done ? 'keep-todo-row-done' : ''}`} key={todo.id}>
          <label>
            <KeepCheckbox checked={todo.done} onChange={() => dispatch({ type: 'toggle-todo', todoId: todo.id })} />
            <span>{todo.title}</span>
          </label>
          <PolarisButton className="keep-delete-button" aria-label={`${todo.title} 삭제`} onClick={() => dispatch({ type: 'delete-todo', todoId: todo.id })}>
            <X size={15} aria-hidden="true" />
          </PolarisButton>
        </div>
      ))}
    </div>
  );
}

function FlowStepper({ activeView, onNavigate }: { activeView: KeepToPolarisView; onNavigate: (view: KeepToPolarisView) => void }) {
  const activeIndex = flowSteps.findIndex((step) => step.view === activeView);

  return (
    <nav className="keep-flow-stepper" aria-label="킵 투 폴라리스 작업 단계">
      {flowSteps.map((step, index) => {
        const active = step.view === activeView;
        const complete = activeIndex > index;

        return (
          <PolarisButton
            key={step.view}
            className={`keep-flow-step ${active ? 'keep-flow-step-active' : ''} ${complete ? 'keep-flow-step-complete' : ''}`}
            onClick={() => onNavigate(step.view)}
          >
            <span>{complete ? <CheckCircle2 size={14} aria-hidden="true" /> : index + 1}</span>
            {step.label}
          </PolarisButton>
        );
      })}
    </nav>
  );
}

function OriginalPreview({ onClose }: { onClose: () => void }) {
  return (
    <div className="keep-drawer-backdrop" role="presentation">
      <aside className="keep-source-drawer" role="dialog" aria-modal="true" aria-labelledby="keep-source-title">
        <header className="keep-source-header">
          <div>
            <span className="keep-kicker">원본 미리보기</span>
            <h2 id="keep-source-title">2026_서비스기획_공모전_모집요강.pdf</h2>
          </div>
          <PolarisButton className="keep-icon-button" aria-label="원본 미리보기 닫기" onClick={onClose}>
            <X size={16} aria-hidden="true" />
          </PolarisButton>
        </header>
        <div className="keep-source-url">
          <span>https://contest-platform.co.kr/competition/service-idea-2026.pdf</span>
        </div>
        <ContestPdfPage />
      </aside>
    </div>
  );
}

function ExportModal({
  task,
  onClose,
  onConfirm
}: {
  task: KeepTask;
  onClose: () => void;
  onConfirm: (format: ExportFormat, name: string) => void;
}) {
  const [format, setFormat] = useState<ExportFormat>(task.exportFormat);
  const [name, setName] = useState((task.finalOutput || '서비스기획_공모전_제안서').replace(/\.(pdf|docx|pptx|hwp)$/i, ''));

  return (
    <div className="keep-modal-backdrop" role="presentation">
      <section className="keep-modal" role="dialog" aria-modal="true" aria-labelledby="keep-export-title">
        <div className="keep-modal-head">
          <h2 id="keep-export-title">내보내기</h2>
          <PolarisButton className="keep-icon-button" aria-label="내보내기 닫기" onClick={onClose}>
            <X size={16} aria-hidden="true" />
          </PolarisButton>
        </div>
        <p>추출할 문서 형식을 선택하세요.</p>
        <div className="keep-export-options">
          {(['PDF', 'DOCX', 'PPTX', 'HWP'] as ExportFormat[]).map((item) => (
            <label className={`keep-export-option ${item === format ? 'keep-export-option-active' : ''}`} key={item}>
              <KeepRadio name="export-format" checked={item === format} onChange={() => setFormat(item)} />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <PolarisInput label="파일명" value={name} onChange={(event) => setName(event.target.value)} />
        <div className="keep-modal-actions">
          <PolarisButton className="secondary-action" onClick={onClose}>
            취소
          </PolarisButton>
          <PolarisButton className="primary-action" onClick={() => onConfirm(format, name)}>
            내보내기
          </PolarisButton>
        </div>
      </section>
    </div>
  );
}

function KeepToast({ toast, onDismiss, onAction }: { toast: ToastState; onDismiss: () => void; onAction: () => void }) {
  return (
    <div className="keep-toast" role="status" aria-live="polite">
      <div>
        <strong>{toast.title}</strong>
        <p>{toast.message}</p>
      </div>
      {toast.actionText && (
        <PolarisButton onClick={onAction}>
          {toast.actionText}
        </PolarisButton>
      )}
      <PolarisButton className="keep-toast-close" aria-label="토스트 닫기" onClick={onDismiss}>
        <X size={14} aria-hidden="true" />
      </PolarisButton>
    </div>
  );
}

function ContestPdfPage() {
  return (
    <article className="cl1-pdf-page cl1-pdf-page-product keep-pdf-page">
      <header className="cl1-pdf-header">
        <span>2026 대학생 서비스 기획 공모전</span>
        <h2>일상 속 생산성 서비스 아이디어 제안 공모전</h2>
      </header>

      <section className="cl1-pdf-section">
        <h3>1. 공모전 개요</h3>
        <table>
          <tbody>
            <tr>
              <th>공모 주제</th>
              <td>대학생의 일상 속 생산성 문제를 해결하는 서비스 아이디어 제안</td>
            </tr>
            <tr>
              <th>참가 대상</th>
              <td>국내 대학 재학생 및 휴학생 개인 또는 4인 이하 팀</td>
            </tr>
            <tr>
              <th>주최</th>
              <td>서비스기획협회 · 대학생 연합 운영사무국</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="cl1-pdf-section">
        <h3>2. 제출 일정</h3>
        <table>
          <tbody>
            <tr>
              <th>접수 마감</th>
              <td>제안서는 2026년 6월 24일 17:00까지 제출해야 합니다.</td>
            </tr>
            <tr>
              <th>본선 발표</th>
              <td>본선 진출팀은 2026년 7월 5일 발표 예정입니다.</td>
            </tr>
            <tr>
              <th>최종 발표</th>
              <td>최종 발표는 2026년 7월 18일 오프라인으로 진행됩니다.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="cl1-pdf-section">
        <h3>3. 제출 서류</h3>
        <ul>
          <li>제출 서류: 기획서 PDF, 발표자료, 팀 정보</li>
          <li>기획서는 10페이지 이내 PDF 형식으로 제출</li>
          <li>발표자료는 PPTX 또는 PDF 형식 제출 가능</li>
        </ul>
      </section>

      <section className="cl1-pdf-section">
        <h3>4. 심사 기준</h3>
        <ul>
          <li>문제 정의의 명확성 및 타깃 이해도</li>
          <li>서비스 아이디어의 실현 가능성</li>
          <li>사용자 경험 설계와 확장 가능성</li>
          <li>최종 발표자료의 전달력</li>
        </ul>
      </section>
    </article>
  );
}

function keepReducer(state: KeepToPolarisState, action: KeepAction): KeepToPolarisState {
  switch (action.type) {
    case 'navigate':
      if ((action.view === 'task' || action.view === 'document') && !state.currentTask) {
        return {
          ...state,
          currentTask: buildTask(state.selectedPurpose, state.candidates),
          view: action.view
        };
      }

      return { ...state, view: action.view };
    case 'dismiss-home-alert':
      return { ...state, homeAlertDismissed: true };
    case 'set-home-index':
      return { ...state, homeIndex: action.index };
    case 'set-sort':
      return { ...state, inboxSort: action.sort };
    case 'organize-file': {
      const file = state.files.find((item) => item.id === action.fileId) ?? state.files[0];
      const purpose = file.tag === '분류 필요' ? '공모전/프로젝트' : file.tag;
      return { ...state, selectedFileId: file.id, selectedPurpose: purpose, view: 'purpose' };
    }
    case 'select-purpose':
      return { ...state, selectedPurpose: action.purpose, view: 'purpose' };
    case 'toggle-candidate':
      return {
        ...state,
        candidates: state.candidates.map((candidate) =>
          candidate.id === action.candidateId ? { ...candidate, selected: !candidate.selected } : candidate
        )
      };
    case 'create-task': {
      const task = buildTask(state.selectedPurpose, state.candidates);
      return {
        ...state,
        currentTask: task,
        files: markSelectedFileOrganized(state.files, state.selectedFileId),
        view: 'task',
        toast: buildToast('작업 카드 생성', `${task.title} 카드가 만들어졌습니다.`, '작업 카드 열기', 'task')
      };
    }
    case 'create-task-for-purpose': {
      const task = buildTask(action.purpose, state.candidates);
      return {
        ...state,
        selectedPurpose: action.purpose,
        currentTask: task,
        view: 'task',
        toast: buildToast('작업 카드 열기', `${task.title} 작업을 이어갑니다.`, '작성 문서 열기', 'document')
      };
    }
    case 'set-task-status':
      return updateTask(state, (task) => ({ ...task, status: action.status }));
    case 'add-todo':
      return updateTask(state, (task) => ({
        ...task,
        todos: [...task.todos, { id: `todo-${Date.now()}`, title: action.title.trim(), done: false }]
      }));
    case 'toggle-todo':
      return updateTask(state, (task) => ({
        ...task,
        todos: task.todos.map((todo) => (todo.id === action.todoId ? { ...todo, done: !todo.done } : todo))
      }));
    case 'delete-todo':
      return updateTask(state, (task) => ({ ...task, todos: task.todos.filter((todo) => todo.id !== action.todoId) }));
    case 'open-document':
      return {
        ...updateTask(state, (task) => ({ ...task, docContent: task.docContent || buildDefaultDocument(task.title) })),
        view: 'document'
      };
    case 'update-doc':
      return updateTask(state, (task) => ({ ...task, docContent: action.content }));
    case 'prime-doc':
      return updateTask(state, (task) => ({ ...task, docContent: task.docContent || buildDefaultDocument(task.title) }));
    case 'open-export':
      return { ...state, exportModalOpen: true };
    case 'close-export':
      return { ...state, exportModalOpen: false };
    case 'confirm-export': {
      const name = normalizeExportName(action.name);
      return {
        ...updateTask(state, (task) => ({
          ...task,
          exportFormat: action.format,
          finalOutput: `${name}.${action.format.toLowerCase()}`,
          todos: task.todos.map((todo) => (todo.title.includes('내보내기') ? { ...todo, done: true } : todo))
        })),
        exportModalOpen: false,
        view: 'document',
        toast: buildToast('내보내기 완료', `${name}.${action.format.toLowerCase()} 파일이 준비되었습니다.`, '작업 카드 보기', 'task')
      };
    }
    case 'save-completion': {
      const task = state.currentTask ?? buildTask(state.selectedPurpose, state.candidates);
      const finalOutput = task.finalOutput || '서비스기획_공모전_제안서.pdf';
      const nextTask = { ...task, status: '완료' as TaskStatus, finalOutput };
      const exists = state.completedRecords.some((record) => record.title === nextTask.title && record.finalOutput === finalOutput);
      const record: CompletedRecord = {
        title: nextTask.title,
        type: nextTask.purpose,
        sourceFile: nextTask.sourceFile,
        finalOutput,
        submittedAt: formatDeadline(nextTask.deadline),
        requirements: nextTask.requirements,
        completedTodos: nextTask.todos.filter((todo) => todo.done).map((todo) => todo.title)
      };

      return {
        ...state,
        currentTask: nextTask,
        completedRecords: exists ? state.completedRecords : [record, ...state.completedRecords],
        view: 'records',
        toast: buildToast('완료 기록 저장', '원본 파일과 최종본이 연결되었습니다.', '완료 기록 보기', 'records')
      };
    }
    case 'open-original':
      return { ...state, originalPreviewOpen: true };
    case 'close-original':
      return { ...state, originalPreviewOpen: false };
    case 'dismiss-toast':
      return { ...state, toast: null };
    default:
      return state;
  }
}

function createInitialKeepState(initialView: KeepToPolarisView): KeepToPolarisState {
  return {
    view: initialView,
    selectedFileId: 'file1',
    selectedPurpose: '공모전/프로젝트',
    inboxSort: 'latest',
    homeIndex: 0,
    homeAlertDismissed: false,
    files: initialFiles,
    candidates: initialCandidates,
    currentTask: null,
    completedRecords: initialCompletedRecords,
    exportModalOpen: false,
    originalPreviewOpen: false,
    toast:
      initialView === 'purpose'
        ? buildToast('킵 투 폴라리스 저장', '서비스 기획 공모전 모집요강이 Polaris에 저장되었습니다.', '이 목적으로 만들기', 'purpose')
        : null
  };
}

function updateTask(state: KeepToPolarisState, updater: (task: KeepTask) => KeepTask): KeepToPolarisState {
  const task = state.currentTask ?? buildTask(state.selectedPurpose, state.candidates);
  return { ...state, currentTask: updater(task) };
}

function buildTask(purpose: PurposeKind, candidates: ExtractedCandidate[]): KeepTask {
  const meta = purposeMeta[purpose] ?? purposeMeta['공모전/프로젝트'];
  const selectedCandidates = candidates.filter((candidate) => candidate.selected);
  const selectedRequirements = selectedCandidates.filter((candidate) => candidate.id === 'docs').map((candidate) => candidate.title);
  const requirements = selectedRequirements.length > 0 ? selectedRequirements : meta.req;
  const deadlineCandidate = selectedCandidates.find((candidate) => candidate.id === 'deadline');
  const deadline = deadlineCandidate ? `${deadlineCandidate.title} · ${deadlineCandidate.desc}` : meta.deadline;

  return {
    title: meta.title,
    purpose,
    dDay: meta.dDay,
    sourceFile: meta.source,
    source: purpose === '공모전/프로젝트' ? '공모전 플랫폼' : 'Polaris Drive',
    deadline,
    requirements,
    todos: fileTemplates[purpose].map((title, index) => ({ id: `todo-${purpose}-${index}`, title, done: false })),
    status: '시작 전',
    exportFormat: 'PDF',
    finalOutput: '',
    docContent: ''
  };
}

function markSelectedFileOrganized(files: KeepFile[], selectedFileId: string) {
  return files.map((file) => (file.id === selectedFileId ? { ...file, status: '작업 카드 생성됨' } : file));
}

function buildDefaultDocument(title: string) {
  return `${title} 제안서\n\n1. 문제 정의\n여기를 클릭해 내용을 직접 입력하세요.\n\n2. 서비스 아이디어\n공모전 주제에 맞는 해결 방안을 정리하세요.\n\n3. 실행 방안\n제출 형식과 평가 기준에 맞춰 실행 방안을 작성하세요.`;
}

function buildToast(title: string, message: string, actionText?: string, actionView?: KeepToPolarisView): ToastState {
  return { id: Date.now(), title, message, actionText, actionView };
}

function normalizeExportName(name: string) {
  const normalized = name.trim().replace(/\.(pdf|docx|pptx|hwp)$/i, '');
  return normalized || '서비스기획_공모전_제안서';
}

function formatDeadline(deadline: string) {
  return deadline
    .split('·')[0]
    .trim()
    .replace('년 ', '.')
    .replace('월 ', '.')
    .replace('일', '');
}

function tagClass(tag: string) {
  if (tag.includes('지원')) {
    return 'keep-tag-green';
  }

  if (tag.includes('공모전')) {
    return 'keep-tag-orange';
  }

  if (tag.includes('분류')) {
    return 'keep-tag-gray';
  }

  return '';
}

function getFileExtensionLabel(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? 'DOC';
}

function getFileIconType(nameOrType: string): FileType {
  const extension = nameOrType.includes('.') ? nameOrType.split('.').pop()?.toLowerCase() : nameOrType.toLowerCase();
  const supported = new Set(['docx', 'hwp', 'xlsx', 'pptx', 'pdf', 'folder', 'image', 'video', 'zip', 'txt', 'csv']);
  return supported.has(extension ?? '') ? (extension as FileType) : 'unknown';
}

function KeepSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  className
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <label className={`keep-select-control ${className ?? ''}`}>
      <span>{label}</span>
      {createElement(
        'select',
        {
          value,
          onChange: (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as T)
        },
        options.map((option) => createElement('option', { key: option.value, value: option.value }, option.label))
      )}
    </label>
  );
}

function KeepCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return createElement('input', {
    type: 'checkbox',
    checked,
    onChange
  });
}

function KeepRadio({ name, checked, onChange }: { name: string; checked: boolean; onChange: () => void }) {
  return createElement('input', {
    type: 'radio',
    name,
    checked,
    onChange
  });
}

function StatusChip({
  icon: Icon,
  label,
  tone
}: {
  icon: React.ElementType;
  label: string;
  tone?: 'success' | 'warning';
}) {
  return (
    <span className={`keep-status-chip ${tone ? `keep-status-chip-${tone}` : ''}`}>
      <Icon size={15} aria-hidden="true" />
      {label}
    </span>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="keep-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniTaskRow({ title, type, status }: { title: string; type: string; status: string }) {
  return (
    <div className="keep-mini-row">
      <span>
        <strong>{title}</strong>
        <small>{type}</small>
      </span>
      <em className={status === '완료' ? 'keep-tag-green' : 'keep-tag-orange'}>{status}</em>
    </div>
  );
}

function DocumentRow({ name, date, tag }: { name: string; date: string; tag: string }) {
  return (
    <div className="keep-mini-row">
      <span>
        <strong>{name}</strong>
        <small>{date}</small>
      </span>
      <em>{tag}</em>
    </div>
  );
}
