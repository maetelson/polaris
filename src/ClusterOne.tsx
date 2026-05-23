import { useMemo, useState, type ElementType, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookmarkCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Columns3,
  Download,
  ExternalLink,
  Eye,
  FileText,
  FolderInput,
  Inbox,
  Link2,
  ListChecks,
  Mail,
  MoreHorizontal,
  Paperclip,
  PanelRightOpen,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload
} from 'lucide-react';
import { PolarisButton, PolarisTextarea } from './polaris-controls';

type ClusterOneStartProps = {
  onSendToPolaris: () => void;
};

type ClusterOneWorkspaceProps = {
  initialDetail?: boolean;
};

type WorkflowView = 'inbox' | 'task' | 'draft' | 'handoff';

type WorkflowTab = {
  id: WorkflowView;
  label: string;
  icon: ElementType;
  count: string;
};

type FileItem = {
  id: string;
  name: string;
  source: string;
  type: string;
  status: string;
  time: string;
  summary: string;
  extractionStatus: string;
  taskId: string;
  document: {
    name: string;
    status: string;
    questions: string;
    updated: string;
  };
  active?: boolean;
};

type ExtractedFact = {
  id: string;
  label: string;
  value: string;
  source: string;
  confidence: number;
  state: 'selected' | 'review' | 'ready';
};

type StepItem = {
  id: string;
  label: string;
  due: string;
  owner: string;
};

type FileSlot = {
  id: string;
  label: string;
  file: string;
  state: 'ready' | 'missing' | 'review';
};

type WorkCard = {
  id: string;
  title: string;
  category: string;
  source: string;
  due: string;
  status: string;
  progress: number;
  nextAction: string;
  files: number;
};

const workflowTabs: WorkflowTab[] = [
  { id: 'inbox', label: '자료함', icon: Inbox, count: '2' },
  { id: 'task', label: '연결된 작업', icon: ListChecks, count: '5' },
  { id: 'draft', label: '작성 문서', icon: FileText, count: '1' },
  { id: 'handoff', label: '제출', icon: ClipboardCheck, count: '80%' }
];

const files: FileItem[] = [
  {
    id: 'job-posting',
    name: '2026_상반기_마케팅직무_채용공고.pdf',
    source: '채용 사이트',
    type: 'PDF',
    status: '추출 완료',
    time: '방금 전',
    summary: '마감, 제출 서류, 자기소개서 문항이 감지된 채용 공고 자료입니다.',
    extractionStatus: '핵심 정보 4개 추출',
    taskId: 'job-application',
    document: {
      name: 'A기업_자기소개서_초안.docx',
      status: '초안 준비',
      questions: '문항 3개',
      updated: '방금 전'
    },
    active: true
  },
  {
    id: 'research-draft',
    name: '마케팅조사_리포트_초안.docx',
    source: 'Polaris Drive',
    type: 'DOC',
    status: '참고 가능',
    time: '오늘',
    summary: '수업 과제 리포트 초안으로 참고 자료 정리와 문단 보강이 필요한 자료입니다.',
    extractionStatus: '참고 문단 6개 감지',
    taskId: 'research-report',
    document: {
      name: '마케팅조사_개인리포트_수정본.docx',
      status: '작성 중',
      questions: '섹션 4개',
      updated: '오늘'
    }
  }
];

const extractedFacts: ExtractedFact[] = [
  {
    id: 'deadline',
    label: '접수 마감',
    value: '2026.06.10 18:00',
    source: '지원서 접수는 2026년 6월 10일 18:00까지 완료해야 합니다.',
    confidence: 98,
    state: 'selected'
  },
  {
    id: 'documents',
    label: '제출 서류',
    value: '자기소개서, 포트폴리오, 재학증명서',
    source: '제출 서류 항목에서 3개 첨부물을 확인했습니다.',
    confidence: 94,
    state: 'selected'
  },
  {
    id: 'questions',
    label: '자기소개서 문항',
    value: '지원 동기 · 관련 경험 · 직무 적합성',
    source: '자기소개서 문항 영역에서 3개 질문을 감지했습니다.',
    confidence: 86,
    state: 'review'
  },
  {
    id: 'role',
    label: '직무 키워드',
    value: '브랜드 전략, 소비자 리서치, 캠페인 운영',
    source: '모집 분야와 우대 사항에서 반복되는 역량을 묶었습니다.',
    confidence: 91,
    state: 'ready'
  }
];

const steps: StepItem[] = [
  { id: 'source', label: '공고 조건 저장', due: '완료', owner: 'Polaris' },
  { id: 'questions', label: '문항별 문서 틀 생성', due: '오늘', owner: 'NOVA' },
  { id: 'experience', label: '관련 경험 연결', due: 'D-16', owner: '사용자' },
  { id: 'draft', label: '초안 작성', due: 'D-12', owner: '사용자' },
  { id: 'submit', label: '첨부 검수', due: 'D-2', owner: 'Polaris' }
];

const fileSlots: FileSlot[] = [
  { id: 'essay', label: '자기소개서', file: 'A기업_마케팅_자기소개서_초안.docx', state: 'ready' },
  { id: 'portfolio', label: '포트폴리오', file: 'portfolio_2026.pdf', state: 'review' },
  { id: 'certificate', label: '재학증명서', file: '파일 필요', state: 'missing' }
];

const workCards: WorkCard[] = [
  {
    id: 'job-application',
    title: 'A기업 마케팅 직무 인턴',
    category: '취업/지원',
    source: '채용공고 PDF',
    due: 'D-18',
    status: '검토 중',
    progress: 20,
    nextAction: '추출 결과 확인',
    files: 2
  },
  {
    id: 'research-report',
    title: '마케팅조사 개인 리포트',
    category: '과제/보고서',
    source: '리포트 초안 DOCX',
    due: 'D-5',
    status: '진행 중',
    progress: 60,
    nextAction: '참고 자료 정리',
    files: 4
  },
  {
    id: 'contest-proposal',
    title: '서비스기획 공모전 제안서',
    category: '공모전',
    source: '모집요강 PDF',
    due: 'D-12',
    status: '분류 필요',
    progress: 35,
    nextAction: '작업 유형 선택',
    files: 3
  }
];

const draftSeed =
  'A기업 마케팅 직무 인턴에 지원하게 된 이유는 소비자 리서치를 바탕으로 브랜드 메시지를 설계하는 과정에 꾸준히 관심을 가져왔기 때문입니다.\n\n' +
  '최근 진행한 소비자 분석 프로젝트에서 저는 설문 결과와 인터뷰 내용을 함께 정리해 핵심 페르소나를 도출했고, 이를 기반으로 캠페인 메시지 우선순위를 제안했습니다.\n\n' +
  '입사 후에는 데이터를 해석하는 태도와 협업 과정에서 얻은 실행력을 바탕으로 팀이 빠르게 의사결정할 수 있는 자료를 만드는 데 기여하겠습니다.';

export function ClusterOneStart({ onSendToPolaris }: ClusterOneStartProps) {
  const [shareOpen, setShareOpen] = useState(false);

  const sendToPolaris = () => {
    setShareOpen(false);
    onSendToPolaris();
  };

  return (
    <section className="cl1-route-shell" aria-label="A기업 채용 공고">
      <div className="cl1-browser-window cl1-browser-product">
        <div className="cl1-browser-top">
          <div className="cl1-window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="cl1-browser-tabs" aria-label="브라우저 탭">
            <span className="cl1-browser-tab cl1-browser-tab-active">A기업 Careers</span>
            <span className="cl1-browser-tab">Polaris Office</span>
          </div>
          <div className="cl1-address-bar">
            <Search size={14} aria-hidden="true" />
            <span>https://careers.a-company.co.kr/recruit/2026-marketing-intern.pdf</span>
          </div>
          <div className="cl1-share-area">
            <PolarisButton className="cl1-icon-button" aria-label="공유 메뉴" onClick={() => setShareOpen((open) => !open)}>
              <ExternalLink size={18} aria-hidden="true" />
            </PolarisButton>
            {shareOpen && (
              <div className="cl1-share-menu" role="menu">
                <strong>공유</strong>
                <PolarisButton className="cl1-share-option" role="menuitem">
                  <Mail size={17} aria-hidden="true" />
                  <span>
                    메일
                    <small>원본 링크 공유</small>
                  </span>
                </PolarisButton>
                <PolarisButton className="cl1-share-option" role="menuitem">
                  <Link2 size={17} aria-hidden="true" />
                  <span>
                    링크 복사
                    <small>URL 복사</small>
                  </span>
                </PolarisButton>
                <PolarisButton className="cl1-share-option cl1-share-option-primary" role="menuitem" onClick={sendToPolaris}>
                  <FolderInput size={17} aria-hidden="true" />
                  <span>
                    Polaris
                    <small>자료함으로 보내기</small>
                  </span>
                </PolarisButton>
              </div>
            )}
          </div>
        </div>

        <div className="cl1-source-layout cl1-source-layout-product">
          <aside className="cl1-job-panel">
            <span className="cl1-company-badge">A기업 채용</span>
            <h1>2026 상반기 마케팅 직무 인턴</h1>

            <dl className="cl1-job-meta cl1-job-meta-compact">
              <div>
                <dt>마감</dt>
                <dd>2026.06.10 18:00</dd>
              </div>
              <div>
                <dt>서류</dt>
                <dd>자소서 · 포트폴리오 · 증명서</dd>
              </div>
              <div>
                <dt>직무</dt>
                <dd>브랜드 전략 · 소비자 리서치</dd>
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

          <main className="cl1-pdf-viewer" aria-label="채용 공고 PDF">
            <div className="cl1-pdf-toolbar">
              <span>2026_상반기_마케팅직무_채용공고.pdf</span>
              <div>
                <PolarisButton aria-label="보기 옵션">
                  <Eye size={16} aria-hidden="true" />
                </PolarisButton>
                <PolarisButton aria-label="더보기">
                  <MoreHorizontal size={16} aria-hidden="true" />
                </PolarisButton>
              </div>
            </div>

            <article className="cl1-pdf-page cl1-pdf-page-product">
              <header className="cl1-pdf-header">
                <span>A Company Careers</span>
                <h2>마케팅 직무 인턴 채용 공고</h2>
              </header>

              <section className="cl1-pdf-section">
                <h3>모집 분야</h3>
                <table>
                  <tbody>
                    <tr>
                      <th>직무</th>
                      <td>마케팅 전략 및 소비자 리서치 지원</td>
                    </tr>
                    <tr>
                      <th>근무 형태</th>
                      <td>인턴십 6개월, 서울 본사 근무</td>
                    </tr>
                    <tr>
                      <th>우대 사항</th>
                      <td>브랜드 캠페인, 설문조사, 데이터 정리 경험</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="cl1-pdf-section">
                <h3>지원 일정</h3>
                <p>지원서 접수는 2026년 6월 10일 18:00까지 완료해야 합니다.</p>
              </section>

              <section className="cl1-pdf-section">
                <h3>자기소개서 문항</h3>
                <ul>
                  <li>마케팅 직무에 지원한 동기를 작성해주세요.</li>
                  <li>소비자 관점에서 문제를 발견하고 해결한 경험을 작성해주세요.</li>
                  <li>입사 후 기여할 수 있는 역량을 구체적으로 작성해주세요.</li>
                </ul>
              </section>
            </article>
          </main>
        </div>
      </div>
    </section>
  );
}

export function ClusterOneWorkspace({ initialDetail = false }: ClusterOneWorkspaceProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialDetail ? workCards[0].id : null);
  const [activeView, setActiveView] = useState<WorkflowView>('inbox');
  const [selectedFileId, setSelectedFileId] = useState(files[0].id);
  const [selectedFactId, setSelectedFactId] = useState(extractedFacts[0].id);
  const [completedIds, setCompletedIds] = useState<string[]>(['source']);
  const [draftBody, setDraftBody] = useState(draftSeed);

  const completionRate = useMemo(() => Math.round((completedIds.length / steps.length) * 100), [completedIds]);
  const selectedTask = workCards.find((card) => card.id === selectedTaskId) ?? workCards[0];

  const completeStep = (stepId: string) => {
    setCompletedIds((ids) => (ids.includes(stepId) ? ids : [...ids, stepId]));
  };

  const goToTask = () => {
    completeStep('questions');
    setActiveView('task');
  };

  const toggleStep = (stepId: string) => {
    setCompletedIds((ids) =>
      ids.includes(stepId) ? ids.filter((id) => id !== stepId) : [...ids, stepId]
    );
  };

  const openWorkCard = (cardId: string, view?: WorkflowView) => {
    setSelectedTaskId(cardId);
    setActiveView(view ?? (cardId === 'job-application' ? 'inbox' : 'task'));
  };

  const backToWorkCards = () => {
    setSelectedTaskId(null);
    setActiveView('inbox');
  };

  if (!selectedTaskId) {
    return <WorkCardHome onOpenCard={openWorkCard} />;
  }

  return (
    <section className="cl1-workbench" aria-labelledby="cl1-workbench-title">
      <header className="cl1-command-bar">
        <div className="cl1-command-leading">
          <PolarisButton className="secondary-action compact-action" onClick={backToWorkCards}>
            <ArrowLeft size={16} aria-hidden="true" />
            이전
          </PolarisButton>
          <div className="cl1-command-title">
            <span>{selectedTask.category}</span>
            <h1 id="cl1-workbench-title">{selectedTask.title}</h1>
          </div>
        </div>
        <div className="cl1-command-meta" aria-label="작업 상태">
          <StatusChip icon={CalendarClock} label={selectedTask.due} tone="warning" />
          <StatusChip icon={CheckCircle2} label={`${completionRate}%`} tone="success" />
          <StatusChip icon={Bell} label={selectedTask.status} />
        </div>
        <div className="cl1-command-actions">
          <PolarisButton className="secondary-action">
            <ExternalLink size={16} aria-hidden="true" />
            원본
          </PolarisButton>
          <PolarisButton className="primary-action" onClick={goToTask}>
            <Sparkles size={16} aria-hidden="true" />
            연결 작업 생성
          </PolarisButton>
        </div>
      </header>

      <WorkflowTabs activeView={activeView} completionRate={completionRate} onSelect={setActiveView} />

      <main className="cl1-workbench-stage">
        {activeView === 'inbox' && (
          <InboxBoard
            selectedFileId={selectedFileId}
            selectedFactId={selectedFactId}
            onSelectFile={setSelectedFileId}
            onSelectFact={setSelectedFactId}
            onCreateTask={goToTask}
          />
        )}

        {activeView === 'task' && (
          <TaskBoard
            completedIds={completedIds}
            completionRate={completionRate}
            onToggleStep={toggleStep}
            onOpenDraft={() => {
              completeStep('experience');
              setActiveView('draft');
            }}
          />
        )}

        {activeView === 'draft' && (
          <DraftBoard
            draftBody={draftBody}
            onDraftBodyChange={setDraftBody}
            onSave={() => completeStep('draft')}
            onReview={() => {
              completeStep('submit');
              setActiveView('handoff');
            }}
          />
        )}

        {activeView === 'handoff' && (
          <HandoffBoard completionRate={completionRate} completedIds={completedIds} onToggleStep={toggleStep} />
        )}
      </main>
    </section>
  );
}

function WorkCardHome({ onOpenCard }: { onOpenCard: (cardId: string, view?: WorkflowView) => void }) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const selectedFile = selectedFileId ? files.find((file) => file.id === selectedFileId) ?? null : null;
  const selectedTask = selectedFile ? workCards.find((card) => card.id === selectedFile.taskId) ?? workCards[0] : null;
  const priorityCard = workCards[0];

  return (
    <section className="cl1-card-home" aria-labelledby="cl1-card-home-title">
      <header className="cl1-card-home-header">
        <div className="cl1-card-home-heading">
          <h1 id="cl1-card-home-title">작업 카드</h1>
          <p>자료를 선택해 연결된 작업과 작성 문서를 확인하세요.</p>
        </div>
        <div className="button-row">
          <PolarisButton className="primary-action">
            <FolderInput size={16} aria-hidden="true" />
            파일 가져오기
          </PolarisButton>
        </div>
      </header>

      <section className="cl1-home-overview" aria-label="자료 작업 요약">
        <div className="cl1-home-metrics" aria-label="작업 현황">
          <HomeMetric label="진행 중" value={`${workCards.length}건`} />
          <HomeMetric label="가장 가까운 마감" value={priorityCard.due} />
          <HomeMetric label="오늘 할 일" value={`${workCards.length}건`} helper={priorityCard.nextAction} />
        </div>
      </section>

      <section className="cl1-home-today-card" aria-labelledby="cl1-home-today-title">
        <PanelTitle id="cl1-home-today-title" title="오늘 할 일" />
        <div className="cl1-home-today-list">
          {workCards.map((card) => (
            <PolarisButton className="cl1-home-today-row" key={card.id} onClick={() => onOpenCard(card.id)}>
              <span className="cl1-work-card-type">{card.category}</span>
              <span className="cl1-home-today-main">
                <strong>{card.nextAction}</strong>
                <small>{card.title}</small>
              </span>
              <span className="cl1-today-due">{card.due}</span>
            </PolarisButton>
          ))}
        </div>
      </section>

      <div className="cl1-material-workspace">
        <section className="cl1-panel cl1-material-list-panel" aria-labelledby="cl1-material-list-title">
          <PanelTitle id="cl1-material-list-title" title="자료함" />
          <div className="cl1-search-control" role="search">
            <Search size={15} aria-hidden="true" />
            <span>파일명, 출처 검색</span>
          </div>

          <div className="cl1-material-list">
            {files.map((file) => {
              const linkedTask = workCards.find((card) => card.id === file.taskId) ?? workCards[0];
              const active = selectedFile?.id === file.id;

              return (
                <PolarisButton
                  className={`cl1-material-row ${active ? 'cl1-material-row-active' : ''}`}
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                >
                  <span className={`cl1-file-badge ${file.type === 'PDF' ? 'pdf' : 'doc'}`}>{file.type}</span>
                  <span className="cl1-material-main">
                    <strong>{file.name}</strong>
                    <small>{file.source} · {file.time}</small>
                    <em>연결된 작업: {linkedTask.title}</em>
                  </span>
                  <ChevronRight size={17} aria-hidden="true" />
                </PolarisButton>
              );
            })}
          </div>
        </section>

        {selectedFile && selectedTask ? (
          <section className="cl1-material-detail" aria-labelledby="cl1-material-detail-title">
            <div className="cl1-material-detail-header">
              <span className="cl1-mini-label">자료 요약</span>
              <h2 id="cl1-material-detail-title">{selectedFile.name}</h2>
              <p>{selectedFile.summary}</p>
            </div>

            <div className="cl1-material-summary-grid" aria-label="자료 상태">
              <MetaBox label="출처" value={selectedFile.source} />
              <MetaBox label="상태" value={selectedFile.status} />
              <MetaBox label="추출" value={selectedFile.extractionStatus} />
            </div>

            <div className="cl1-material-linked-grid">
              <article className="cl1-linked-section" aria-labelledby="cl1-linked-task-title">
                <div className="cl1-linked-section-title">
                  <span className="cl1-work-card-type">{selectedTask.category}</span>
                  <div>
                    <h3 id="cl1-linked-task-title">연결된 작업</h3>
                    <p>{selectedTask.title}</p>
                  </div>
                  <strong>{selectedTask.due}</strong>
                </div>

                <div className="cl1-work-card-progress" aria-label={`진행률 ${selectedTask.progress}%`}>
                  <i style={{ width: `${selectedTask.progress}%` }} />
                </div>

                <div className="cl1-next-action">
                  <span>다음 액션</span>
                  <strong>{selectedTask.nextAction}</strong>
                  <small>{selectedTask.status}</small>
                </div>

                <div className="cl1-linked-step-list">
                  {steps.slice(0, 3).map((step, index) => (
                    <div className="cl1-linked-step" key={step.id}>
                      <span>{index + 1}</span>
                      <strong>{step.label}</strong>
                      <small>{step.due}</small>
                    </div>
                  ))}
                </div>

                <PolarisButton className="secondary-action compact-action" onClick={() => onOpenCard(selectedTask.id, 'task')}>
                  <ListChecks size={16} aria-hidden="true" />
                  연결된 작업 보기
                </PolarisButton>
              </article>

              <article className="cl1-linked-section" aria-labelledby="cl1-linked-document-title">
                <div className="cl1-linked-section-title">
                  <span className="cl1-document-icon" aria-hidden="true">
                    <FileText size={17} />
                  </span>
                  <div>
                    <h3 id="cl1-linked-document-title">작성 문서</h3>
                    <p>{selectedFile.document.name}</p>
                  </div>
                  <strong>{selectedFile.document.status}</strong>
                </div>

                <div className="cl1-document-meta">
                  <MetaBox label="구성" value={selectedFile.document.questions} />
                  <MetaBox label="수정" value={selectedFile.document.updated} />
                </div>

                <div className="cl1-document-preview">
                  <strong>지원 동기</strong>
                  <p>자료에서 추출한 문항과 키워드를 바탕으로 초안 섹션을 준비했습니다.</p>
                </div>

                <PolarisButton className="primary-action compact-action" onClick={() => onOpenCard(selectedTask.id, 'draft')}>
                  <FileText size={16} aria-hidden="true" />
                  문서 열기
                </PolarisButton>
              </article>
            </div>
          </section>
        ) : (
          <section className="cl1-material-detail cl1-material-empty" aria-labelledby="cl1-material-empty-title">
            <div className="cl1-material-detail-header">
              <span className="cl1-mini-label">자료 구조</span>
              <h2 id="cl1-material-empty-title">자료를 선택하면 연결 흐름이 열립니다</h2>
              <p>첫 화면에서는 전체 자료와 연결 상태만 훑어보고, 자료를 클릭하면 작업과 문서 상세를 확인합니다.</p>
            </div>

            <div className="cl1-material-tree" aria-label="자료별 연결 구조">
              {files.map((file) => {
                const linkedTask = workCards.find((card) => card.id === file.taskId) ?? workCards[0];

                return (
                  <PolarisButton className="cl1-material-tree-row" key={file.id} onClick={() => setSelectedFileId(file.id)}>
                    <span className={`cl1-file-badge ${file.type === 'PDF' ? 'pdf' : 'doc'}`}>{file.type}</span>
                    <span className="cl1-material-tree-main">
                      <strong>{file.name}</strong>
                      <small>{file.source} · {file.status}</small>
                    </span>
                    <span className="cl1-material-tree-links">
                      <em>연결된 작업: {linkedTask.title}</em>
                      <em>작성 문서: {file.document.name}</em>
                    </span>
                  </PolarisButton>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function HomeMetric({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="cl1-home-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </div>
  );
}

function WorkflowTabs({
  activeView,
  completionRate,
  onSelect
}: {
  activeView: WorkflowView;
  completionRate: number;
  onSelect: (view: WorkflowView) => void;
}) {
  return (
    <nav className="cl1-workbench-tabs" aria-label="작업 단계">
      {workflowTabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeView === tab.id;

        return (
          <PolarisButton
            key={tab.id}
            className={`cl1-workbench-tab ${active ? 'cl1-workbench-tab-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelect(tab.id)}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{tab.label}</span>
            <strong>{tab.id === 'handoff' ? `${completionRate}%` : tab.count}</strong>
          </PolarisButton>
        );
      })}
    </nav>
  );
}

function InboxBoard({
  selectedFileId,
  selectedFactId,
  onSelectFile,
  onSelectFact,
  onCreateTask
}: {
  selectedFileId: string;
  selectedFactId: string;
  onSelectFile: (fileId: string) => void;
  onSelectFact: (factId: string) => void;
  onCreateTask: () => void;
}) {
  const selectedFact = extractedFacts.find((fact) => fact.id === selectedFactId) ?? extractedFacts[0];

  return (
    <div className="cl1-board cl1-inbox-board">
      <section className="cl1-panel cl1-file-panel" aria-labelledby="cl1-files-title">
        <PanelTitle
          id="cl1-files-title"
          title="자료함"
          action={
            <PolarisButton className="cl1-ghost-icon" aria-label="자료 필터">
              <SlidersHorizontal size={16} aria-hidden="true" />
            </PolarisButton>
          }
        />

        <div className="cl1-search-control" role="search">
          <Search size={15} aria-hidden="true" />
          <span>파일명, 출처 검색</span>
        </div>

        <div className="cl1-file-stack">
          {files.map((file) => (
            <PolarisButton
              key={file.id}
              className={`cl1-file-card ${selectedFileId === file.id ? 'cl1-file-card-active' : ''}`}
              onClick={() => onSelectFile(file.id)}
            >
              <span className={`cl1-file-badge ${file.type === 'PDF' ? 'pdf' : 'doc'}`}>{file.type}</span>
              <span>
                <strong>{file.name}</strong>
                <small>{file.source} · {file.time}</small>
              </span>
              <em>{file.status}</em>
            </PolarisButton>
          ))}
        </div>
      </section>

      <section className="cl1-panel cl1-extract-panel" aria-labelledby="cl1-facts-title">
        <PanelTitle
          id="cl1-facts-title"
          title="추출 결과"
          action={
            <PolarisButton className="primary-action compact-action" onClick={onCreateTask}>
              <Sparkles size={16} aria-hidden="true" />
              연결 작업 생성
            </PolarisButton>
          }
        />

        <div className="cl1-fact-table">
          {extractedFacts.map((fact) => (
            <PolarisButton
              key={fact.id}
              className={`cl1-fact-row ${selectedFactId === fact.id ? 'cl1-fact-row-active' : ''}`}
              onClick={() => onSelectFact(fact.id)}
            >
              <span className={`cl1-fact-state ${fact.state}`}>{getFactStateLabel(fact.state)}</span>
              <span className="cl1-fact-main">
                <strong>{fact.label}</strong>
                <small>{fact.value}</small>
              </span>
              <span className="cl1-confidence">
                <i style={{ width: `${fact.confidence}%` }} />
              </span>
              <ChevronRight size={16} aria-hidden="true" />
            </PolarisButton>
          ))}
        </div>

        <div className="cl1-selected-fact">
          <div>
            <span className={`cl1-fact-state ${selectedFact.state}`}>{getFactStateLabel(selectedFact.state)}</span>
            <strong>{selectedFact.label}</strong>
            <p>{selectedFact.value}</p>
          </div>
          <blockquote>{selectedFact.source}</blockquote>
          <PolarisButton className="primary-action" onClick={onCreateTask}>
            <ArrowRight size={16} aria-hidden="true" />
            연결된 작업에 반영
          </PolarisButton>
        </div>
      </section>
    </div>
  );
}

function TaskBoard({
  completedIds,
  completionRate,
  onToggleStep,
  onOpenDraft
}: {
  completedIds: string[];
  completionRate: number;
  onToggleStep: (stepId: string) => void;
  onOpenDraft: () => void;
}) {
  return (
    <div className="cl1-board cl1-task-board">
      <section className="cl1-panel cl1-task-card" aria-labelledby="cl1-task-title">
        <div className="cl1-task-card-top">
          <div>
            <span className="cl1-mini-label">연결된 작업</span>
            <h2 id="cl1-task-title">A기업 지원 준비</h2>
          </div>
          <strong>D-18</strong>
        </div>

        <div className="cl1-card-progress" aria-label={`진행률 ${completionRate}%`}>
          <i style={{ width: `${completionRate}%` }} />
        </div>

        <div className="cl1-task-meta-grid">
          <MetaBox label="원본" value="채용공고 PDF" />
          <MetaBox label="마감" value="06.10 18:00" />
          <MetaBox label="서류" value="3개" />
        </div>
      </section>

      <section className="cl1-panel" aria-labelledby="cl1-step-board-title">
        <PanelTitle
          id="cl1-step-board-title"
          title="진행 단계"
          action={
            <PolarisButton className="primary-action compact-action" onClick={onOpenDraft}>
              <FileText size={16} aria-hidden="true" />
              문서 열기
            </PolarisButton>
          }
        />

        <div className="cl1-stage-list">
          {steps.map((step, index) => {
            const done = completedIds.includes(step.id);

            return (
              <PolarisButton
                key={step.id}
                className={`cl1-stage-row ${done ? 'cl1-stage-row-done' : ''}`}
                onClick={() => onToggleStep(step.id)}
              >
                <span>{done ? <CheckCircle2 size={16} aria-hidden="true" /> : index + 1}</span>
                <strong>{step.label}</strong>
                <small>{step.owner}</small>
                <em>{step.due}</em>
              </PolarisButton>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function DraftBoard({
  draftBody,
  onDraftBodyChange,
  onSave,
  onReview
}: {
  draftBody: string;
  onDraftBodyChange: (value: string) => void;
  onSave: () => void;
  onReview: () => void;
}) {
  return (
    <div className="cl1-board cl1-draft-board">
      <section className="cl1-panel cl1-editor-panel" aria-labelledby="cl1-draft-title">
        <div className="cl1-editor-titlebar">
          <div>
            <span className="cl1-mini-label">문서</span>
            <h2 id="cl1-draft-title">A기업_자기소개서_초안.docx</h2>
          </div>
          <div className="button-row">
            <PolarisButton className="secondary-action compact-action" onClick={onSave}>
              <Upload size={16} aria-hidden="true" />
              저장
            </PolarisButton>
            <PolarisButton className="primary-action compact-action" onClick={onReview}>
              <ShieldCheck size={16} aria-hidden="true" />
              검수
            </PolarisButton>
          </div>
        </div>

        <div className="cl1-editor-toolbar" aria-label="문서 도구">
          <PolarisButton>지원 동기</PolarisButton>
          <PolarisButton>관련 경험</PolarisButton>
          <PolarisButton>직무 적합성</PolarisButton>
          <PolarisButton>
            <Sparkles size={15} aria-hidden="true" />
            다듬기
          </PolarisButton>
        </div>

        <PolarisTextarea
          label="본문"
          rows={14}
          value={draftBody}
          onChange={(event) => onDraftBodyChange(event.target.value)}
        />

        <div className="cl1-editor-footer">
          <span>{draftBody.length.toLocaleString('ko-KR')}자</span>
          <span>문항 1/3</span>
        </div>
      </section>
    </div>
  );
}

function HandoffBoard({
  completionRate,
  completedIds,
  onToggleStep
}: {
  completionRate: number;
  completedIds: string[];
  onToggleStep: (stepId: string) => void;
}) {
  return (
    <div className="cl1-board cl1-handoff-board">
      <section className="cl1-panel" aria-labelledby="cl1-slots-title">
        <PanelTitle
          id="cl1-slots-title"
          title="제출 파일"
          action={
            <span className="cl1-progress-pill">{completionRate}%</span>
          }
        />

        <div className="cl1-slot-list">
          {fileSlots.map((slot) => (
            <article className={`cl1-file-slot ${slot.state}`} key={slot.id}>
              <Paperclip size={17} aria-hidden="true" />
              <span>
                <strong>{slot.label}</strong>
                <small>{slot.file}</small>
              </span>
              <em>{getSlotStateLabel(slot.state)}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="cl1-panel" aria-labelledby="cl1-submit-title">
        <PanelTitle id="cl1-submit-title" title="최종 체크" />
        <div className="cl1-submit-list">
          {steps.map((step) => {
            const done = completedIds.includes(step.id);

            return (
              <PolarisButton
                key={step.id}
                className={`cl1-submit-row ${done ? 'cl1-submit-row-done' : ''}`}
                onClick={() => onToggleStep(step.id)}
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>{step.label}</span>
                <strong>{done ? '완료' : '확인'}</strong>
              </PolarisButton>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Inspector({
  activeView,
  selectedFile,
  selectedFact,
  completionRate,
  onCreateTask
}: {
  activeView: WorkflowView;
  selectedFile: FileItem;
  selectedFact: ExtractedFact;
  completionRate: number;
  onCreateTask: () => void;
}) {
  return (
    <aside className="cl1-inspector" aria-label="선택 정보">
      <div className="cl1-inspector-header">
        <span>{getInspectorTitle(activeView)}</span>
        <PolarisButton className="cl1-ghost-icon" aria-label="패널 옵션">
          <MoreHorizontal size={16} aria-hidden="true" />
        </PolarisButton>
      </div>

      {activeView === 'inbox' && (
        <>
          <div className="cl1-inspector-block">
            <small>선택 파일</small>
            <strong>{selectedFile.name}</strong>
            <p>{selectedFile.source} · {selectedFile.status}</p>
          </div>
          <div className="cl1-inspector-block">
            <small>추출 항목</small>
            <strong>{selectedFact.label}</strong>
            <p>{selectedFact.value}</p>
          </div>
          <blockquote>{selectedFact.source}</blockquote>
          <PolarisButton className="primary-action" onClick={onCreateTask}>
            <ArrowRight size={16} aria-hidden="true" />
            연결된 작업에 반영
          </PolarisButton>
        </>
      )}

      {activeView === 'task' && (
        <>
          <MetricRing value={completionRate} />
          <div className="cl1-inspector-block">
            <small>우선순위</small>
            <strong>문항 틀 생성</strong>
            <p>초안 작성 전에 3개 문항을 문서 섹션으로 나눕니다.</p>
          </div>
          <PolarisButton className="primary-action">
            <FileText size={16} aria-hidden="true" />
            문서 열기
          </PolarisButton>
        </>
      )}

      {activeView === 'draft' && (
        <>
          <div className="cl1-inspector-block">
            <small>추천 경험</small>
            <strong>소비자 분석 프로젝트</strong>
            <p>설문과 인터뷰를 연결해 캠페인 메시지 우선순위를 제안한 경험</p>
          </div>
          <div className="cl1-source-snippet">
            <BookmarkCheck size={16} aria-hidden="true" />
            <span>브랜드 전략, 소비자 리서치, 캠페인 운영 지원</span>
          </div>
          <PolarisButton className="secondary-action">
            <Columns3 size={16} aria-hidden="true" />
            경험 카드 보기
          </PolarisButton>
        </>
      )}

      {activeView === 'handoff' && (
        <>
          <div className="cl1-alert-box">
            <AlertTriangle size={18} aria-hidden="true" />
            <span>
              재학증명서가 아직 없습니다.
              <small>제출 전 첨부 슬롯을 채워야 합니다.</small>
            </span>
          </div>
          <PolarisButton className="primary-action">
            <PanelRightOpen size={16} aria-hidden="true" />
            패키지 저장
          </PolarisButton>
        </>
      )}
    </aside>
  );
}

function PanelTitle({ id, title, action }: { id: string; title: string; action?: ReactNode }) {
  return (
    <div className="cl1-panel-title">
      <h2 id={id}>{title}</h2>
      {action}
    </div>
  );
}

function StatusChip({
  icon: Icon,
  label,
  tone
}: {
  icon: ElementType;
  label: string;
  tone?: 'success' | 'warning';
}) {
  return (
    <span className={`cl1-status-chip ${tone ? `cl1-status-chip-${tone}` : ''}`}>
      <Icon size={15} aria-hidden="true" />
      {label}
    </span>
  );
}

function MetaBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="cl1-meta-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricRing({ value }: { value: number }) {
  return (
    <div className="cl1-metric-ring" aria-label={`진행률 ${value}%`}>
      <strong>{value}%</strong>
      <span>완료</span>
    </div>
  );
}

function getFactStateLabel(state: ExtractedFact['state']) {
  if (state === 'selected') {
    return '선택';
  }

  if (state === 'review') {
    return '검토';
  }

  return '대기';
}

function getSlotStateLabel(state: FileSlot['state']) {
  if (state === 'ready') {
    return '완료';
  }

  if (state === 'review') {
    return '검토';
  }

  return '필요';
}

function getInspectorTitle(view: WorkflowView) {
  if (view === 'task') {
    return '작업 세부';
  }

  if (view === 'draft') {
    return '작성 보조';
  }

  if (view === 'handoff') {
    return '제출 상태';
  }

  return '인스펙터';
}
