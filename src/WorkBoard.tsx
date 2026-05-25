import { useMemo, useState } from 'react';
import { FileIcon, type FileType } from '@polaris/ui';
import { Ribbon, RibbonButton, RibbonContent, RibbonGroup, RibbonTab, RibbonTabList, RibbonTabs } from '@polaris/ui/ribbon';
import { AiWriteIcon, BoldIcon, BulletIcon, PasteIcon } from '@polaris/ui/ribbon-icons';
import {
  Archive,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  FolderOpen,
  Link2,
  ListChecks,
  PanelRightOpen,
  Plus,
  Quote,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Upload
} from 'lucide-react';
import { PolarisButton } from './polaris-controls';

type ResearchView = 'home' | 'dashboard' | 'sources' | 'source-detail' | 'evidence' | 'verification' | 'outline' | 'draft' | 'editor' | 'export';
type SourceStatus = '분석 완료' | '분석 중' | '검토 필요';
type EvidenceStatus = '사용 가능' | '검토 필요' | '사용 비추천';
type EvidenceTag = '시장 분석' | '소비자 분석' | '경쟁사 분석' | '문제 정의' | '솔루션 근거';
type TagFilter = EvidenceTag | '전체';

type ResearchProject = {
  id: string;
  title: string;
  due: string;
  progress: number;
  sourceCount: number;
  reviewNeeded: number;
  description: string;
  nextAction: string;
};

type ResearchSource = {
  id: string;
  title: string;
  type: string;
  icon: FileType;
  origin: string;
  status: SourceStatus;
  analyzedAt: string;
};

type EvidenceCardData = {
  id: string;
  title: string;
  summary: string;
  quote: string;
  source: string;
  tag: EvidenceTag;
  status: EvidenceStatus;
};

type OutlineSection = {
  id: string;
  title: string;
  claim: string;
  evidenceIds: string[];
  warning?: string;
};

const projects: ResearchProject[] = [
  {
    id: 'deck-a',
    title: 'DECK A팀 최종발표',
    due: 'D-14',
    progress: 62,
    sourceCount: 24,
    reviewNeeded: 5,
    description: '팀플 발표자료용 시장·사용자 근거를 모아 초안으로 연결합니다.',
    nextAction: '출처 불명확 근거 2건 확인'
  },
  {
    id: 'thesis',
    title: '졸업논문',
    due: 'D-3',
    progress: 84,
    sourceCount: 42,
    reviewNeeded: 3,
    description: '논문 본문에 들어갈 선행연구와 수치 근거를 검증합니다.',
    nextAction: '최신성 부족 근거 교체'
  },
  {
    id: 'ai-report',
    title: '생성형 AI 활용 보고서',
    due: 'D-10',
    progress: 45,
    sourceCount: 17,
    reviewNeeded: 8,
    description: '보고서 초안 전에 자료를 근거 카드와 인용 후보로 정리합니다.',
    nextAction: 'AI 근거 추출 실행'
  }
];

const initialSources: ResearchSource[] = [
  {
    id: 'mckinsey',
    title: 'McKinsey AI Report.pdf',
    type: 'PDF',
    icon: 'pdf',
    origin: '업로드 문서',
    status: '분석 완료',
    analyzedAt: '핵심 문장 18개 추출'
  },
  {
    id: 'stanford',
    title: 'Stanford AI Index',
    type: 'URL',
    icon: 'unknown',
    origin: '저장된 웹 리포트',
    status: '분석 완료',
    analyzedAt: '수치 근거 9개 추출'
  },
  {
    id: 'interview-03',
    title: '사용자 인터뷰 #03',
    type: '인터뷰',
    icon: 'txt',
    origin: '음성 전사본',
    status: '분석 완료',
    analyzedAt: '사용자 발화 12개 추출'
  },
  {
    id: 'competitor-link',
    title: '경쟁사 분석 링크',
    type: 'URL',
    icon: 'unknown',
    origin: '외부 링크',
    status: '검토 필요',
    analyzedAt: '게시일 확인 필요'
  },
  {
    id: 'meeting-note',
    title: '팀 회의록',
    type: 'DOCX',
    icon: 'docx',
    origin: '회의록 업로드',
    status: '분석 중',
    analyzedAt: '요약 생성 중'
  }
];

const baseEvidence: EvidenceCardData[] = [
  {
    id: 'ai-adoption',
    title: '생성형 AI 활용률 증가',
    summary: '생성형 AI 도구 사용이 학습·업무 문서 작성 영역까지 빠르게 확산되고 있습니다.',
    quote: 'Organizations are moving from pilot use to daily workflow adoption.',
    source: 'McKinsey AI Report.pdf · p.12',
    tag: '시장 분석',
    status: '사용 가능'
  },
  {
    id: 'writing-time',
    title: '반복 문서 작성 시간 절감',
    summary: '반복적인 초안 작성과 요약 업무에서 AI 보조가 가장 먼저 체감되는 효율을 만듭니다.',
    quote: 'Document drafting and summarization are among the highest-frequency use cases.',
    source: 'Stanford AI Index · 2025',
    tag: '솔루션 근거',
    status: '사용 가능'
  },
  {
    id: 'research-fatigue',
    title: '자료 탐색 피로도 증가',
    summary: '사용자는 자료를 찾는 일보다 다시 찾고 정리하는 과정에서 더 큰 피로를 느낍니다.',
    quote: '자료는 많은데 어디에 쓸 수 있는 문장인지 다시 찾는 시간이 제일 길어요.',
    source: '사용자 인터뷰 #03 · 14:21',
    tag: '문제 정의',
    status: '검토 필요'
  }
];

const generatedEvidence: EvidenceCardData[] = [
  {
    id: 'source-burden',
    title: '출처 확인 부담',
    summary: 'AI 초안을 신뢰하지 못하는 가장 큰 이유는 원자료와 생성 문장의 연결이 끊기기 때문입니다.',
    quote: 'AI가 쓴 문장이 어디에서 온 건지 확인하려면 결국 원문을 다시 열어봐야 한다.',
    source: '사용자 인터뷰 #03 · 18:04',
    tag: '소비자 분석',
    status: '검토 필요'
  },
  {
    id: 'merge-inefficiency',
    title: '팀플 문서 병합 과정의 비효율',
    summary: '팀원이 각자 모은 자료와 문단을 병합할 때 근거 중복과 출처 누락이 반복됩니다.',
    quote: '마지막에 문서를 합치면 같은 자료가 두 번 들어가거나 출처가 빠지는 일이 생긴다.',
    source: '팀 회의록 · 3차 회의',
    tag: '경쟁사 분석',
    status: '사용 가능'
  }
];

const evidenceTags: TagFilter[] = ['전체', '시장 분석', '소비자 분석', '경쟁사 분석', '문제 정의', '솔루션 근거'];

const workflowSteps = [
  { label: '자료 수집', view: 'sources' as ResearchView },
  { label: '근거 추출', view: 'evidence' as ResearchView },
  { label: '출처 검증', view: 'verification' as ResearchView },
  { label: '아웃라인', view: 'outline' as ResearchView },
  { label: '초안 작성', view: 'draft' as ResearchView },
  { label: '문서 연동', view: 'editor' as ResearchView }
];

const boardNav = [
  { id: 'dashboard' as ResearchView, label: '프로젝트 대시보드', icon: BarChart3 },
  { id: 'sources' as ResearchView, label: '자료 보관함', icon: FolderOpen },
  { id: 'evidence' as ResearchView, label: '근거 보관함', icon: Quote },
  { id: 'verification' as ResearchView, label: '출처 검증 센터', icon: ShieldCheck },
  { id: 'outline' as ResearchView, label: '아웃라인 보드', icon: ListChecks },
  { id: 'draft' as ResearchView, label: 'AI 초안 생성', icon: Sparkles },
  { id: 'editor' as ResearchView, label: '문서 편집 연동', icon: PanelRightOpen },
  { id: 'export' as ResearchView, label: '최종 점검 / 내보내기', icon: Archive }
];

const outlineSections: OutlineSection[] = [
  {
    id: 'problem',
    title: '1. 문제 정의',
    claim: '자료 수집 이후 근거를 다시 찾고 출처를 확인하는 시간이 문서 작성 병목입니다.',
    evidenceIds: ['research-fatigue', 'source-burden']
  },
  {
    id: 'market',
    title: '2. 시장 변화',
    claim: '생성형 AI 활용은 확산되고 있지만, 신뢰 가능한 문서 작성 흐름은 아직 분리되어 있습니다.',
    evidenceIds: ['ai-adoption', 'writing-time']
  },
  {
    id: 'competition',
    title: '3. 경쟁 환경',
    claim: '기존 AI 작성 도구는 출처 검증과 팀 문서 병합을 한 흐름에서 다루지 못합니다.',
    evidenceIds: ['merge-inefficiency'],
    warning: '경쟁사 직접 비교 근거 1건 부족'
  },
  {
    id: 'solution',
    title: '4. 솔루션 제안',
    claim: 'AI 리서치 보드는 자료를 검증 가능한 근거로 바꾸고 초안의 문장 단위까지 연결합니다.',
    evidenceIds: ['writing-time', 'source-burden']
  }
];

export function WorkBoard() {
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null);
  const [activeView, setActiveView] = useState<ResearchView>('home');
  const [sources, setSources] = useState<ResearchSource[]>(initialSources);
  const [evidence, setEvidence] = useState<EvidenceCardData[]>(baseEvidence);
  const [verificationRan, setVerificationRan] = useState(false);
  const [activeOutlineSection, setActiveOutlineSection] = useState(outlineSections[0].id);
  const [editorSent, setEditorSent] = useState(false);
  const [tagFilter, setTagFilter] = useState<TagFilter>('전체');
  const [activityMessage, setActivityMessage] = useState('프로젝트를 선택하면 리서치 흐름을 시작할 수 있습니다.');

  const currentProject = selectedProject ?? projects[0];
  const activeSection = outlineSections.find((section) => section.id === activeOutlineSection) ?? outlineSections[0];
  const activeEvidenceIds = new Set(activeSection.evidenceIds);

  const visibleEvidence = useMemo(() => {
    if (tagFilter === '전체') {
      return evidence;
    }

    return evidence.filter((item) => item.tag === tagFilter);
  }, [evidence, tagFilter]);

  const statusCounts = useMemo(() => {
    const usable = evidence.filter((item) => item.status === '사용 가능').length;
    const review = evidence.filter((item) => item.status === '검토 필요').length;
    const blocked = evidence.filter((item) => item.status === '사용 비추천').length;

    return {
      usable: verificationRan ? usable + 1 : usable,
      review: Math.max(verificationRan ? review - 1 : review, 0),
      blocked,
      duplicate: verificationRan ? 1 : 0
    };
  }, [evidence, verificationRan]);

  const selectProject = (project: ResearchProject) => {
    setSelectedProject(project);
    setSelectedSource(null);
    setActiveView('dashboard');
    setActivityMessage(`${project.title} 프로젝트의 자료-근거-초안 흐름을 열었습니다.`);
  };

  const openSourceDetail = (source: ResearchSource) => {
    setSelectedSource(source);
    setActiveView('source-detail');
    setActivityMessage(`${source.title} 자료 상세를 열었습니다.`);
  };

  const addDummySource = () => {
    if (sources.some((source) => source.id === 'added-stat')) {
      setActivityMessage('이미 추가된 더미 자료가 자료 리스트에 있습니다.');
      return;
    }

    setSources((items) => [
      {
        id: 'added-stat',
        title: 'AI 도입 설문 통계.xlsx',
        type: 'XLSX',
        icon: 'xlsx',
        origin: '파일 업로드',
        status: '분석 중',
        analyzedAt: '수치 근거 추출 대기'
      },
      ...items
    ]);
    setActivityMessage('더미 자료가 추가되었습니다. 분석 상태가 자료 보관함에 반영되었습니다.');
  };

  const addGeneratedEvidence = () => {
    const missing = generatedEvidence.filter((item) => !evidence.some((current) => current.id === item.id));

    if (missing.length === 0) {
      setActivityMessage('AI가 추출한 근거 카드가 이미 근거 보관함에 정리되어 있습니다.');
      return;
    }

    setEvidence((items) => [...items, ...missing]);
    setActivityMessage('AI가 출처 확인이 가능한 근거 카드 2개를 새로 만들었습니다.');
  };

  const runVerification = () => {
    setVerificationRan(true);
    setEvidence((items) =>
      items.map((item) =>
        item.id === 'source-burden'
          ? {
              ...item,
              status: '사용 가능'
            }
          : item
      )
    );
    setActivityMessage('검증을 실행했습니다. 사용 가능 근거와 중복 감지 수치가 업데이트되었습니다.');
  };

  const updateEvidenceStatus = (id: string, status: EvidenceStatus) => {
    setEvidence((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    setActivityMessage(`근거 상태를 '${status}'로 변경했습니다.`);
  };

  const sendToEditor = () => {
    setEditorSent(true);
    setActiveView('editor');
    setActivityMessage('초안을 Polaris 문서 편집기 미리보기로 보냈습니다.');
  };

  const goProjectHome = () => {
    setActiveView('home');
    setSelectedProject(null);
    setSelectedSource(null);
    setActivityMessage('프로젝트 홈으로 돌아왔습니다.');
  };

  const goPreviousFromTopbar = () => {
    if (activeView === 'source-detail') {
      setActiveView('sources');
      return;
    }

    goProjectHome();
  };

  const topbarTitle = activeView === 'source-detail' && selectedSource ? selectedSource.title : currentProject.title;

  return (
    <section className="research-board-page" aria-labelledby="research-board-title">
      <header className={`research-topbar ${activeView !== 'home' ? 'research-project-topbar' : ''}`}>
        {activeView === 'home' ? (
          <>
            <div>
              <h1 id="research-board-title">AI 리서치 보드</h1>
            </div>
            <div className="research-topbar-actions">
              <PolarisButton className="primary-action compact-action">
                <Plus size={16} aria-hidden="true" />
                새 프로젝트 시작
              </PolarisButton>
            </div>
          </>
        ) : (
          <>
            <PolarisButton className="secondary-action compact-action" onClick={goPreviousFromTopbar}>
              <ArrowLeft size={15} aria-hidden="true" />
              이전
            </PolarisButton>
            <h1 id="research-board-title">{topbarTitle}</h1>
          </>
        )}
      </header>

      {activeView === 'home' ? (
        <ProjectHome onSelectProject={selectProject} />
      ) : (
        <div className="research-workspace">
          <nav className="research-tabbar" aria-label="AI 리서치 보드 메뉴">
            <div role="tablist" aria-label="AI 리서치 보드 단계">
              {boardNav.map((item) => {
                const Icon = item.icon;

                return (
                  <PolarisButton
                    className={`research-nav-item ${activeView === item.id ? 'research-nav-item-active' : ''}`}
                    key={item.id}
                    role="tab"
                    aria-selected={activeView === item.id}
                    onClick={() => setActiveView(item.id)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label}</span>
                  </PolarisButton>
                );
              })}
            </div>
          </nav>

          <main className="research-main">
            {activeView === 'dashboard' && (
              <DashboardView project={currentProject} sources={sources} evidence={evidence} statusCounts={statusCounts} setActiveView={setActiveView} />
            )}
            {activeView === 'sources' && <SourcesView sources={sources} onAddSource={addDummySource} onSelectSource={openSourceDetail} />}
            {activeView === 'source-detail' && selectedSource && <SourceDetailView source={selectedSource} />}
            {activeView === 'evidence' && (
              <EvidenceView
                evidence={visibleEvidence}
                tagFilter={tagFilter}
                setTagFilter={setTagFilter}
                onExtract={addGeneratedEvidence}
              />
            )}
            {activeView === 'verification' && (
              <VerificationView
                evidence={evidence}
                statusCounts={statusCounts}
                verificationRan={verificationRan}
                onRunVerification={runVerification}
                onUpdateStatus={updateEvidenceStatus}
              />
            )}
            {activeView === 'outline' && (
              <OutlineView
                evidence={evidence}
                activeSection={activeSection}
                activeEvidenceIds={activeEvidenceIds}
                onSelectSection={setActiveOutlineSection}
              />
            )}
            {activeView === 'draft' && <DraftView evidence={evidence} onSendToEditor={sendToEditor} />}
            {activeView === 'editor' && <EditorView evidence={evidence} editorSent={editorSent} onBackToDraft={() => setActiveView('draft')} />}
            {activeView === 'export' && <ExportView project={currentProject} statusCounts={statusCounts} />}
          </main>

          <aside className="research-summary" aria-label="작업 요약">
            <SummaryPanel project={currentProject} sources={sources} evidence={evidence} statusCounts={statusCounts} activityMessage={activityMessage} />
          </aside>
        </div>
      )}
    </section>
  );
}

function ProjectHome({ onSelectProject }: { onSelectProject: (project: ResearchProject) => void }) {
  return (
    <div className="research-home">
      <h2 className="research-list-label" id="research-project-list-title">
        프로젝트 리스트
      </h2>

      <div className="research-project-grid" aria-labelledby="research-project-list-title">
        {projects.map((project) => (
          <PolarisButton className="research-project-card" key={project.id} onClick={() => onSelectProject(project)}>
            <span>{project.due}</span>
            <strong>{project.title}</strong>
            <p>{project.description}</p>
            <div className="research-project-progress" aria-label={`${project.title} 진행률 ${project.progress}%`}>
              <i style={{ width: `${project.progress}%` }} />
            </div>
            <dl>
              <div>
                <dt>진행률</dt>
                <dd>{project.progress}%</dd>
              </div>
              <div>
                <dt>자료 수</dt>
                <dd>{project.sourceCount}</dd>
              </div>
              <div>
                <dt>검증 필요</dt>
                <dd>{project.reviewNeeded}</dd>
              </div>
            </dl>
          </PolarisButton>
        ))}
      </div>
    </div>
  );
}

function DashboardView({
  project,
  sources,
  evidence,
  statusCounts,
  setActiveView
}: {
  project: ResearchProject;
  sources: ResearchSource[];
  evidence: EvidenceCardData[];
  statusCounts: { usable: number; review: number; blocked: number; duplicate: number };
  setActiveView: (view: ResearchView) => void;
}) {
  const currentWorkflowStepIndex = 3;

  return (
    <div className="research-view">
      <section className="research-dashboard-hero">
        <div>
          <span>{project.due}</span>
          <strong>{project.progress}%</strong>
          <p>전체 진행률 · 근거 검증 후 아웃라인 매칭 단계</p>
          <div className="research-progress-bar">
            <i style={{ width: `${project.progress}%` }} />
          </div>
        </div>
        <ol className="research-flow" aria-label="리서치 진행 단계">
          {workflowSteps.map((step, index) => (
            <li key={step.label}>
              <PolarisButton
                className={
                  index < currentWorkflowStepIndex
                    ? 'research-flow-complete'
                    : index === currentWorkflowStepIndex
                      ? 'research-flow-current'
                      : undefined
                }
                onClick={() => setActiveView(step.view)}
              >
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
              </PolarisButton>
            </li>
          ))}
        </ol>
      </section>

      <div className="research-metric-grid">
        <MetricCard label="수집 자료" value={`${sources.length}건`} note="PDF · URL · 인터뷰 · 회의록" />
        <MetricCard label="근거 카드" value={`${evidence.length}개`} note="태그별 분류 완료" />
        <MetricCard label="검증 필요" value={`${statusCounts.review}건`} note="출처 또는 최신성 확인" tone="warning" />
        <MetricCard label="문서 활용 가능" value={`${statusCounts.usable}개`} note="초안 연결 가능" tone="success" />
      </div>
    </div>
  );
}

function SourcesView({
  sources,
  onAddSource,
  onSelectSource
}: {
  sources: ResearchSource[];
  onAddSource: () => void;
  onSelectSource: (source: ResearchSource) => void;
}) {
  return (
    <div className="research-view">
      <ViewHeader
        kicker="자료 보관함"
        title="PDF, URL, 인터뷰, 회의록을 한 프로젝트에 모읍니다."
        description="자료는 유형별로 분류되고, AI 분석 상태가 함께 표시됩니다."
      />

      <div className="research-source-actions">
        <section className="research-upload-card">
          <span className="research-upload-icons" aria-hidden="true">
            <FileIcon type="pdf" size={24} />
            <FileIcon type="docx" size={24} />
            <FileIcon type="hwp" size={24} />
          </span>
          <div>
            <strong>PDF / DOCX / HWP 업로드</strong>
            <p>보고서, 논문, 과제 자료를 올리면 핵심 문장과 수치 근거를 추출합니다.</p>
          </div>
          <PolarisButton className="primary-action compact-action" onClick={onAddSource}>
            <Upload size={15} aria-hidden="true" />
            자료 업로드
          </PolarisButton>
        </section>

        <section className="research-upload-card">
          <Link2 size={22} aria-hidden="true" />
          <div>
            <strong>URL 저장</strong>
            <p>웹 리포트, 기사, 경쟁사 분석 링크를 저장하고 최신성을 함께 확인합니다.</p>
          </div>
          <PolarisButton className="secondary-action compact-action">URL 추가</PolarisButton>
        </section>
      </div>

      <section className="research-card">
        <div className="research-section-head">
          <div>
            <h3>자료 리스트</h3>
            <p>자료 유형과 분석 상태를 기준으로 다음 작업을 결정합니다.</p>
          </div>
          <span>{sources.length}건</span>
        </div>
        <div className="research-source-list">
          {sources.map((source) => (
            <PolarisButton className="research-source-row" key={source.id} onClick={() => onSelectSource(source)}>
              <FileIcon type={source.icon} size={24} aria-hidden="true" />
              <div>
                <strong>{source.title}</strong>
                <span>{source.origin}</span>
              </div>
              <small>{source.type}</small>
              <StatusBadge status={source.status} />
              <p>{source.analyzedAt}</p>
            </PolarisButton>
          ))}
        </div>
      </section>
    </div>
  );
}

function SourceDetailView({ source }: { source: ResearchSource }) {
  return (
    <div className="research-view">
      <section className="research-card research-source-detail">
        <div className="research-section-head">
          <div>
            <h3>{source.title}</h3>
            <p>{source.origin}</p>
          </div>
          <StatusBadge status={source.status} />
        </div>

        <div className="research-source-detail-grid">
          <MetricCard label="자료 유형" value={source.type} note="받은 자료 분류" />
          <MetricCard label="분석 상태" value={source.status} note={source.analyzedAt} />
          <MetricCard label="연결 근거" value="3개" note="초안에 사용할 후보" tone="success" />
        </div>

        <div className="research-source-preview">
          <FileIcon type={source.icon} size={32} aria-hidden="true" />
          <div>
            <strong>핵심 내용 미리보기</strong>
            <p>
              이 자료에서 추출한 핵심 문장, 수치 근거, 인용 후보를 검토하고 다음 단계에서 근거 카드로 연결할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function EvidenceView({
  evidence,
  tagFilter,
  setTagFilter,
  onExtract
}: {
  evidence: EvidenceCardData[];
  tagFilter: TagFilter;
  setTagFilter: (tag: TagFilter) => void;
  onExtract: () => void;
}) {
  return (
    <div className="research-view">
      <ViewHeader
        kicker="근거 보관함"
        title="AI가 핵심 문장, 수치 근거, 사용자 발화, 사례 요약을 카드로 정리합니다."
        description="각 근거는 원문 일부와 출처를 유지해 초안에서 다시 확인할 수 있습니다."
        action={
          <PolarisButton className="primary-action compact-action" onClick={onExtract}>
            <Sparkles size={15} aria-hidden="true" />
            AI 근거 추출
          </PolarisButton>
        }
      />

      <div className="research-filter-row" aria-label="태그 필터">
        {evidenceTags.map((tag) => (
          <PolarisButton
            className={`secondary-action compact-action ${tagFilter === tag ? 'research-filter-active' : ''}`}
            key={tag}
            aria-pressed={tagFilter === tag}
            onClick={() => setTagFilter(tag)}
          >
            {tag}
          </PolarisButton>
        ))}
      </div>

      <div className="research-evidence-grid">
        {evidence.map((item) => (
          <EvidenceCard item={item} key={item.id} />
        ))}
      </div>
    </div>
  );
}

function VerificationView({
  evidence,
  statusCounts,
  verificationRan,
  onRunVerification,
  onUpdateStatus
}: {
  evidence: EvidenceCardData[];
  statusCounts: { usable: number; review: number; blocked: number; duplicate: number };
  verificationRan: boolean;
  onRunVerification: () => void;
  onUpdateStatus: (id: string, status: EvidenceStatus) => void;
}) {
  const staleItems = evidence.filter((item) => item.id === 'ai-adoption' || item.id === 'merge-inefficiency');
  const unclearItems = evidence.filter((item) => item.status === '검토 필요');

  return (
    <div className="research-view">
      <ViewHeader
        kicker="출처 검증 센터"
        title="신뢰도, 최신성, 중복, 출처 누락을 확인합니다."
        description="초안에 들어갈 수 있는 근거와 검토해야 할 근거를 분리합니다."
        action={
          <PolarisButton className="primary-action compact-action" onClick={onRunVerification}>
            <SearchCheck size={15} aria-hidden="true" />
            검증 실행
          </PolarisButton>
        }
      />

      <div className="research-metric-grid research-metric-grid-three">
        <MetricCard label="검증 완료" value={`${statusCounts.usable}건`} note={verificationRan ? '방금 검증 반영' : '검증 실행 전'} tone="success" />
        <MetricCard label="검토 필요" value={`${statusCounts.review}건`} note="출처 또는 맥락 확인" tone="warning" />
        <MetricCard label="중복 감지" value={`${statusCounts.duplicate}건`} note="유사 주장 병합 후보" />
      </div>

      <div className="research-verify-grid">
        <VerificationList
          title="최신성 부족 근거"
          description="작성 시점이 오래되었거나 게시일 확인이 필요한 근거입니다."
          items={staleItems}
          onUpdateStatus={onUpdateStatus}
        />
        <VerificationList
          title="출처 불명확 근거"
          description="원문 위치 또는 발화 맥락 확인이 필요한 근거입니다."
          items={unclearItems}
          onUpdateStatus={onUpdateStatus}
        />
      </div>
    </div>
  );
}

function OutlineView({
  evidence,
  activeSection,
  activeEvidenceIds,
  onSelectSection
}: {
  evidence: EvidenceCardData[];
  activeSection: OutlineSection;
  activeEvidenceIds: Set<string>;
  onSelectSection: (id: string) => void;
}) {
  return (
    <div className="research-view research-outline-view">
      <ViewHeader
        kicker="아웃라인 보드"
        title="목차마다 주장과 근거가 연결되어 있는지 확인합니다."
        description="근거 부족 섹션은 초안 생성 전에 보강 대상으로 표시됩니다."
      />

      <div className="research-outline-layout">
        <section className="research-card">
          <div className="research-section-head">
            <div>
              <h3>문서 목차</h3>
              <p>섹션을 클릭하면 연결된 근거가 강조됩니다.</p>
            </div>
          </div>
          <div className="research-outline-list">
            {outlineSections.map((section) => (
              <PolarisButton
                className={`research-outline-item ${activeSection.id === section.id ? 'research-outline-item-active' : ''}`}
                key={section.id}
                onClick={() => onSelectSection(section.id)}
              >
                <strong>{section.title}</strong>
                <span>{section.claim}</span>
                {section.warning && (
                  <small>
                    <TriangleAlert size={13} aria-hidden="true" />
                    {section.warning}
                  </small>
                )}
              </PolarisButton>
            ))}
          </div>
        </section>

        <section className="research-card">
          <div className="research-section-head">
            <div>
              <h3>연결된 근거</h3>
              <p>{activeSection.title}에 연결된 근거 카드입니다.</p>
            </div>
            <span>{activeSection.evidenceIds.length}개</span>
          </div>
          <div className="research-evidence-grid research-evidence-grid-compact">
            {evidence.map((item) => (
              <EvidenceCard item={item} key={item.id} highlighted={activeEvidenceIds.has(item.id)} muted={!activeEvidenceIds.has(item.id)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function DraftView({ evidence, onSendToEditor }: { evidence: EvidenceCardData[]; onSendToEditor: () => void }) {
  const citation = (id: string) => evidence.find((item) => item.id === id);

  return (
    <div className="research-view">
      <ViewHeader
        kicker="AI 초안 생성"
        title="선택된 아웃라인과 검증된 근거를 기준으로 초안을 만듭니다."
        description="문단 옆에서 어떤 근거와 출처가 연결되었는지 바로 확인할 수 있습니다."
        action={
          <PolarisButton className="primary-action compact-action" onClick={onSendToEditor}>
            <Send size={15} aria-hidden="true" />
            Polaris 문서로 보내기
          </PolarisButton>
        }
      />

      <section className="research-draft">
        <div className="research-draft-meta">
          <span>초안 v0.3</span>
          <strong>DECK A팀 최종발표 리서치 초안</strong>
          <small>검증된 근거 기반 문장 생성 · 인용 자동 삽입</small>
        </div>
        <DraftParagraph
          title="문제 정의"
          body="보고서와 발표자료를 작성하는 사용자는 문서 작성 전에 PDF, 웹 리포트, 인터뷰, 회의록을 따로 모은다. 하지만 실제 작성 단계에서는 어떤 문장을 근거로 쓸 수 있는지 다시 찾고, 출처를 확인하는 데 많은 시간을 사용한다."
          evidenceItem={citation('research-fatigue')}
        />
        <DraftParagraph
          title="시장 변화"
          body="생성형 AI는 문서 초안과 요약 업무에서 빠르게 확산되고 있다. 다만 AI가 생성한 문장이 어떤 원자료에 근거했는지 확인하기 어렵다면, 사용자는 초안을 그대로 신뢰하기보다 원문을 다시 열어 검증하게 된다."
          evidenceItem={citation('ai-adoption')}
        />
        <DraftParagraph
          title="솔루션 제안"
          body="AI 리서치 보드는 자료를 단순 보관하지 않고, 문서에 바로 활용 가능한 근거 카드로 바꾼다. 각 문단은 연결 근거와 출처를 함께 유지하므로 Polaris 문서 편집기로 이동한 뒤에도 검증 흐름이 끊기지 않는다."
          evidenceItem={citation('writing-time')}
        />
      </section>
    </div>
  );
}

function EditorView({
  evidence,
  editorSent,
  onBackToDraft
}: {
  evidence: EvidenceCardData[];
  editorSent: boolean;
  onBackToDraft: () => void;
}) {
  const usedEvidence = evidence.filter((item) => ['research-fatigue', 'ai-adoption', 'writing-time', 'source-burden'].includes(item.id));

  return (
    <div className="research-view">
      <ViewHeader
        kicker="문서 편집 연동"
        title="Polaris 문서 편집기 안에서도 사용된 근거를 확인합니다."
        description="초안 문단과 근거 패널이 동기화되어 출처 검증 맥락을 잃지 않습니다."
        action={
          <PolarisButton className="secondary-action compact-action" onClick={onBackToDraft}>
            초안으로 돌아가기
          </PolarisButton>
        }
      />

      <div className="research-editor-layout">
        <section className="research-document-preview" aria-label="Polaris 문서 편집기 미리보기">
          <EditorRibbon />
          <article className="research-page-preview">
            <h2>DECK A팀 최종발표</h2>
            <h3>AI 리서치 보드를 활용한 근거 기반 문서 작성</h3>
            <p>
              사용자는 문서 작성 전에 다양한 자료를 수집하지만, 실제 작성 단계에서 인용 가능한 근거와 출처를 다시 확인하는 데 큰 시간을 사용한다.
              AI 리서치 보드는 이 과정을 자료 보관, 근거 추출, 출처 검증, 초안 생성의 흐름으로 연결한다.
            </p>
            <p>
              생성형 AI 활용이 확대될수록 초안 생성보다 중요한 것은 생성 문장이 어떤 원자료와 연결되는지 확인하는 일이다.
              따라서 초안의 각 문단은 검증된 근거와 출처 상태를 함께 유지해야 한다.
            </p>
          </article>
        </section>

        <aside className="research-evidence-panel">
          <div className="research-section-head">
            <div>
              <h3>편집기 내 근거 패널</h3>
              <p>{editorSent ? '초안에서 사용된 근거가 동기화되었습니다.' : '초안을 보내면 사용 근거가 이곳에 표시됩니다.'}</p>
            </div>
          </div>
          <div className="research-used-list">
            {usedEvidence.map((item) => (
              <article key={item.id}>
                <StatusBadge status={item.status} />
                <strong>{item.title}</strong>
                <span>{item.source}</span>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function EditorRibbon() {
  return (
    <Ribbon className="research-editor-ribbon">
      <RibbonTabs defaultValue="home">
        <RibbonTabList>
          <RibbonTab value="home">홈</RibbonTab>
          <RibbonTab value="insert">삽입</RibbonTab>
          <RibbonTab value="review">검토</RibbonTab>
        </RibbonTabList>
        <RibbonContent value="home">
          <RibbonGroup label="클립보드">
            <RibbonButton size="lg" icon={<PasteIcon />}>
              붙여넣기
            </RibbonButton>
          </RibbonGroup>
          <RibbonGroup label="서식">
            <RibbonButton size="md" icon={<BoldIcon />}>
              굵게
            </RibbonButton>
            <RibbonButton size="md" icon={<BulletIcon />}>
              목록
            </RibbonButton>
          </RibbonGroup>
          <RibbonGroup label="AI 근거">
            <RibbonButton size="lg" icon={<AiWriteIcon />}>
              근거 패널
            </RibbonButton>
          </RibbonGroup>
        </RibbonContent>
        <RibbonContent value="insert">
          <RibbonGroup label="리서치">
            <RibbonButton size="lg" icon={<AiWriteIcon />}>
              인용 삽입
            </RibbonButton>
          </RibbonGroup>
        </RibbonContent>
        <RibbonContent value="review">
          <RibbonGroup label="검토">
            <RibbonButton size="lg" icon={<AiWriteIcon />}>
              출처 점검
            </RibbonButton>
          </RibbonGroup>
        </RibbonContent>
      </RibbonTabs>
    </Ribbon>
  );
}

function ExportView({
  project,
  statusCounts
}: {
  project: ResearchProject;
  statusCounts: { usable: number; review: number; blocked: number; duplicate: number };
}) {
  return (
    <div className="research-view">
      <ViewHeader
        kicker="최종 점검 / 내보내기"
        title="출처 누락과 근거 부족을 마지막으로 확인합니다."
        description="완성도 요약을 확인한 뒤 PDF, DOCX, PPT로 내보내거나 프로젝트를 아카이브합니다."
      />

      <div className="research-export-layout">
        <section className="research-card">
          <div className="research-section-head">
            <div>
              <h3>문서 완성도 요약</h3>
              <p>{project.title}의 최종 점검 상태입니다.</p>
            </div>
            <span>{project.progress + 18}%</span>
          </div>
          <div className="research-check-list">
            <CheckRow label="출처 누락 점검" value={`${statusCounts.review}건 확인 필요`} tone="warning" />
            <CheckRow label="근거 부족 점검" value="경쟁 환경 섹션 1건 보강 권장" tone="warning" />
            <CheckRow label="사용 가능 근거" value={`${statusCounts.usable}개 연결됨`} tone="success" />
            <CheckRow label="문서 완성도" value="발표 초안으로 사용 가능" tone="success" />
          </div>
        </section>

        <section className="research-card">
          <div className="research-section-head">
            <div>
              <h3>내보내기</h3>
              <p>발표 준비 단계에 맞춰 문서 형식을 선택합니다.</p>
            </div>
          </div>
          <div className="research-export-actions">
            <PolarisButton className="secondary-action">PDF 내보내기</PolarisButton>
            <PolarisButton className="secondary-action">DOCX 내보내기</PolarisButton>
            <PolarisButton className="secondary-action">PPT 내보내기</PolarisButton>
            <PolarisButton className="primary-action">프로젝트 아카이브</PolarisButton>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryPanel({
  project,
  sources,
  evidence,
  statusCounts,
  activityMessage
}: {
  project: ResearchProject;
  sources: ResearchSource[];
  evidence: EvidenceCardData[];
  statusCounts: { usable: number; review: number; blocked: number; duplicate: number };
  activityMessage: string;
}) {
  return (
    <div className="research-summary-inner">
      <section>
        <p className="research-kicker">작업 요약</p>
        <h2>{project.title}</h2>
        <div className="research-progress-bar">
          <i style={{ width: `${project.progress}%` }} />
        </div>
      </section>

      <dl className="research-summary-list">
        <div>
          <dt>자료</dt>
          <dd>{sources.length}건</dd>
        </div>
        <div>
          <dt>근거</dt>
          <dd>{evidence.length}개</dd>
        </div>
        <div>
          <dt>검증 필요</dt>
          <dd>{statusCounts.review}건</dd>
        </div>
        <div>
          <dt>문서 활용 가능</dt>
          <dd>{statusCounts.usable}개</dd>
        </div>
      </dl>

      <section className="research-next-panel">
        <strong>다음 작업</strong>
        <p>{project.nextAction}</p>
      </section>

      <section className="research-activity">
        <strong>최근 반응</strong>
        <p>{activityMessage}</p>
      </section>
    </div>
  );
}

function ViewHeader({
  kicker,
  title,
  description,
  action
}: {
  kicker: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="research-view-header">
      <div>
        <p className="research-kicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action && <div className="research-view-action">{action}</div>}
    </header>
  );
}

function MetricCard({ label, value, note, tone = 'default' }: { label: string; value: string; note: string; tone?: 'default' | 'warning' | 'success' }) {
  return (
    <article className={`research-metric-card research-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function EvidenceCard({ item, highlighted = false, muted = false }: { item: EvidenceCardData; highlighted?: boolean; muted?: boolean }) {
  return (
    <article className={`research-evidence-card ${highlighted ? 'research-evidence-highlighted' : ''} ${muted ? 'research-evidence-muted' : ''}`}>
      <div className="research-evidence-head">
        <span>{item.tag}</span>
        <StatusBadge status={item.status} />
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <blockquote>{item.quote}</blockquote>
      <div className="research-source-link">
        <BookOpenCheck size={14} aria-hidden="true" />
        <span>{item.source}</span>
      </div>
    </article>
  );
}

function VerificationList({
  title,
  description,
  items,
  onUpdateStatus
}: {
  title: string;
  description: string;
  items: EvidenceCardData[];
  onUpdateStatus: (id: string, status: EvidenceStatus) => void;
}) {
  return (
    <section className="research-card">
      <div className="research-section-head">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{items.length}건</span>
      </div>
      <div className="research-verification-list">
        {items.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.source}</span>
            </div>
            <div className="research-status-actions">
              <PolarisButton className="secondary-action compact-action" onClick={() => onUpdateStatus(item.id, '사용 가능')}>
                사용 가능
              </PolarisButton>
              <PolarisButton className="secondary-action compact-action" onClick={() => onUpdateStatus(item.id, '검토 필요')}>
                검토 필요
              </PolarisButton>
              <PolarisButton className="secondary-action compact-action" onClick={() => onUpdateStatus(item.id, '사용 비추천')}>
                사용 비추천
              </PolarisButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DraftParagraph({ title, body, evidenceItem }: { title: string; body: string; evidenceItem?: EvidenceCardData }) {
  return (
    <article className="research-draft-row">
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <aside>
        <span>연결 근거</span>
        {evidenceItem ? (
          <>
            <strong>{evidenceItem.title}</strong>
            <small>{evidenceItem.source}</small>
          </>
        ) : (
          <strong>근거 연결 필요</strong>
        )}
      </aside>
    </article>
  );
}

function CheckRow({ label, value, tone }: { label: string; value: string; tone: 'warning' | 'success' }) {
  return (
    <div className={`research-check-row research-check-${tone}`}>
      {tone === 'success' ? <CheckCircle2 size={16} aria-hidden="true" /> : <TriangleAlert size={16} aria-hidden="true" />}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }: { status: SourceStatus | EvidenceStatus }) {
  const tone = status === '분석 완료' || status === '사용 가능' ? 'success' : status === '분석 중' ? 'progress' : status === '사용 비추천' ? 'danger' : 'warning';

  return <span className={`research-badge research-badge-${tone}`}>{status}</span>;
}
