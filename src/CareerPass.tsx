import { useState, type ElementType } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  BriefcaseBusiness,
  ChevronRight,
  Eye,
  FileText,
  PackageCheck,
  PenLine,
  Plus,
  Puzzle,
  Save,
  X
} from 'lucide-react';
import { Ribbon, RibbonButton, RibbonGroup, RibbonRow, RibbonSeparator, RibbonStack } from '@polaris/ui/ribbon';
import {
  AiChatIcon,
  AiWriteIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  ApplyIcon,
  BoldIcon,
  ItalicIcon,
  Underline01Icon,
  WordCountIcon
} from '@polaris/ui/ribbon-icons';
import { PolarisButton, PolarisFileDrop, PolarisInput, PolarisTextarea } from './polaris-controls';

const LIST_PREVIEW_LIMIT = 2;

type CareerPassSectionId = 'track' | 'experience' | 'final';

type ExperienceSortMode = 'recent' | 'title';

type SupportTrack = {
  id: string;
  company: string;
  role: string;
  detail: string;
  deadline: string;
  status: string;
  tags: string[];
};

type ExperienceCard = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  role: string;
  action: string;
  result: string;
};

type EssayDraft = {
  question: string;
  body: string;
  status: string;
  finalApplied: boolean;
};

type SubmissionCheck = {
  id: string;
  label: string;
  status: 'complete' | 'warning';
  text: string;
};

type CareerPassSection = {
  id: CareerPassSectionId;
  label: string;
  icon: ElementType;
};

const careerPassSections: CareerPassSection[] = [
  { id: 'track', label: '지원 현황', icon: BriefcaseBusiness },
  { id: 'experience', label: '경험 카드', icon: Puzzle },
  { id: 'final', label: '최종 검수', icon: PackageCheck }
];

const initialTracks: SupportTrack[] = [
  {
    id: 'hyundai-ux',
    company: '현대자동차',
    role: 'UX Designer',
    detail: '자소서 3문항 · 포트폴리오 제출',
    deadline: 'D-4',
    status: '작성 중',
    tags: ['공채 시즌', '파일 제출']
  },
  {
    id: 'kakao-product',
    company: '카카오',
    role: 'Product Designer',
    detail: '자소서 2문항 · 자유 양식 포트폴리오',
    deadline: 'D-9',
    status: '초안 완료',
    tags: ['상시 채용', '링크 제출']
  }
];

const initialExperienceCards: ExperienceCard[] = [
  {
    id: 'branding-contest',
    title: '브랜딩 공모전',
    summary: '시장 분석 기반 전략 수정 경험과 팀 협업 과정',
    tags: ['협업 경험', '갈등 해결', '전략 기획', '성과 중심'],
    role: '브랜드 전략 방향 수정 및 발표 구조 설계',
    action: '사용자 조사 데이터를 기반으로 전략 방향성을 재정리하고 팀원 간 의견 충돌을 조율',
    result: '최종 발표 우수상 수상 및 전략 완성도 개선'
  },
  {
    id: 'industry-project',
    title: '산학 프로젝트',
    summary: '사용자 리서치 기반 UX 개선 프로젝트',
    tags: ['협업 경험', '문제 해결', 'STAR 구조화'],
    role: '사용자 인터뷰 설계 및 UX 개선안 도출',
    action: '인터뷰 데이터를 분류하고 핵심 pain point 기준으로 화면 개선 우선순위 산정',
    result: '프로토타입 채택률 상승 및 개선 방향 긍정 평가'
  },
  {
    id: 'service-sprint',
    title: '서비스 디자인 스프린트',
    summary: '짧은 기간 안에 문제 정의부터 프로토타입 검증까지 진행',
    tags: ['기획 경험', '검증', '프로토타입'],
    role: '문제 정의와 사용자 여정 맵 설계 담당',
    action: '가설을 기능 단위로 쪼개고 빠른 와이어프레임 검증을 반복',
    result: '핵심 플로우 이탈 지점을 발견하고 개선안 우선순위 도출'
  },
  {
    id: 'club-operation',
    title: '동아리 운영 개선',
    summary: '신입 구성원 온보딩과 행사 운영 프로세스를 정리한 경험',
    tags: ['운영 경험', '리더십', '프로세스'],
    role: '운영 일정 관리와 역할 분담 체계 설계',
    action: '반복 문의를 문서화하고 체크리스트 기반 운영 방식으로 전환',
    result: '행사 준비 리드타임 단축 및 신규 구성원 참여율 개선'
  },
  {
    id: 'intern-dashboard',
    title: '인턴 대시보드 개선',
    summary: '업무 현황을 빠르게 파악할 수 있도록 내부 대시보드를 정리',
    tags: ['인턴 경험', '데이터 정리', '업무 개선'],
    role: '지표 구조 정리와 화면 정보 위계 제안',
    action: '사용 빈도가 높은 지표를 상단에 배치하고 필터 기준을 단순화',
    result: '팀 내 주간 공유 시간 단축 및 데이터 확인 오류 감소'
  },
  {
    id: 'volunteer-campaign',
    title: '지역 캠페인 홍보',
    summary: '지역 행사 참여율을 높이기 위한 홍보 메시지와 채널 운영',
    tags: ['대외 활동', '콘텐츠', '커뮤니케이션'],
    role: '홍보 문구 작성과 채널별 콘텐츠 운영',
    action: '타깃별 메시지를 나누고 카드뉴스와 짧은 안내문을 병행 배포',
    result: '행사 사전 신청 수 증가 및 현장 문의 감소'
  },
  {
    id: 'product-research',
    title: '제품 리서치 분석',
    summary: '경쟁 서비스 기능을 비교하고 개선 기회를 도출한 경험',
    tags: ['리서치', '분석', '문제 정의'],
    role: '경쟁사 벤치마크와 사용자 니즈 정리 담당',
    action: '핵심 기능을 사용 맥락별로 분류하고 개선 가설을 문서화',
    result: '기획 회의에서 우선 개선 항목으로 채택'
  },
  {
    id: 'hackathon-prototype',
    title: '해커톤 프로토타입',
    summary: '제한 시간 안에 아이디어를 기능 흐름으로 구현한 경험',
    tags: ['프로토타입', '협업', '실행력'],
    role: '화면 플로우 설계와 발표 스토리라인 담당',
    action: '핵심 사용 시나리오를 줄이고 팀원이 구현 가능한 범위를 조율',
    result: '완성도 높은 데모로 본선 발표 진출'
  },
  {
    id: 'customer-interview',
    title: '고객 인터뷰 운영',
    summary: '잠재 고객 인터뷰를 설계하고 인사이트를 구조화한 경험',
    tags: ['인터뷰', 'UX', '인사이트'],
    role: '질문지 작성과 인터뷰 진행 담당',
    action: '응답을 니즈, 불편, 기대 가치로 나누어 패턴을 정리',
    result: '핵심 타깃의 구매 망설임 요인을 발견'
  },
  {
    id: 'data-cleanup',
    title: '데이터 정제 자동화',
    summary: '반복 정리 업무를 줄이기 위해 데이터 처리 방식을 개선',
    tags: ['업무 개선', '데이터', '자동화'],
    role: '정제 규칙 정의와 검수 기준 정리',
    action: '중복 항목과 누락 값을 기준화하고 체크리스트를 도입',
    result: '주간 정리 시간이 줄고 검수 오류가 감소'
  },
  {
    id: 'presentation-redesign',
    title: '발표 자료 리디자인',
    summary: '복잡한 메시지를 설득력 있는 발표 흐름으로 재구성',
    tags: ['커뮤니케이션', '디자인', '스토리텔링'],
    role: '정보 위계 재정리와 슬라이드 구조 개선',
    action: '핵심 메시지를 한 장당 하나로 제한하고 시각 자료를 재배치',
    result: '발표 이해도와 질의응답 대응력이 개선'
  },
  {
    id: 'onboarding-guide',
    title: '온보딩 가이드 제작',
    summary: '새 구성원이 빠르게 적응하도록 업무 안내 체계를 만든 경험',
    tags: ['문서화', '운영', '온보딩'],
    role: '업무 절차 정리와 안내 문서 작성 담당',
    action: '자주 묻는 질문과 필수 도구 사용법을 단계별로 정리',
    result: '신규 구성원 초기 적응 시간이 단축'
  }
];

const initialChecks: SubmissionCheck[] = [
  { id: 'length', label: '글자 수 제한', status: 'complete', text: '완료' },
  { id: 'questions', label: '필수 문항', status: 'complete', text: '완료' },
  { id: 'attachments', label: '첨부 파일', status: 'complete', text: '완료' },
  { id: 'filename', label: '파일명 규칙', status: 'warning', text: '수정 필요' }
];

const initialEssay =
  '프로젝트 진행 과정에서 팀원 간 전략 방향성에 대한 의견 충돌이 발생했습니다. 초기에는 각자의 아이디어를 중심으로 논의가 이어지며 의사결정이 지연되었습니다. 저는 사용자 인터뷰 데이터를 다시 정리하여 객관적인 기준을 제시했고, 이를 기반으로 우선순위를 재조정하는 회의 구조를 제안했습니다. 이후 팀원들의 의견을 시각적으로 정리해 합의 과정을 단순화했고, 최종적으로 전략 방향을 빠르게 통합할 수 있었습니다. 그 결과 프로젝트 완성도를 높일 수 있었고, 최종 발표에서 우수상을 수상했습니다.';

export function CareerPass() {
  const [activeSection, setActiveSection] = useState<CareerPassSectionId>('track');
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [applicationsExpanded, setApplicationsExpanded] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [trackLink, setTrackLink] = useState('');
  const [trackQuestions, setTrackQuestions] = useState('');
  const [trackFileName, setTrackFileName] = useState('');
  const [trackNotice, setTrackNotice] = useState('지원 관리 중');
  const [supportTracks, setSupportTracks] = useState<SupportTrack[]>(initialTracks);
  const [essayCardsPanelOpen, setEssayCardsPanelOpen] = useState(true);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [experienceSortMode, setExperienceSortMode] = useState<ExperienceSortMode>('recent');
  const [experienceCards, setExperienceCards] = useState<ExperienceCard[]>(initialExperienceCards);
  const [selectedExperienceCardId, setSelectedExperienceCardId] = useState<string | null>(initialExperienceCards[0]?.id ?? null);
  const [essayDraft, setEssayDraft] = useState<EssayDraft>({
    question: '협업 과정에서 갈등을 해결했던 경험과, 이를 통해 얻은 인사이트를 작성해주세요.',
    body: initialEssay,
    status: '작성 중',
    finalApplied: false
  });
  const [finalFileName, setFinalFileName] = useState('');
  const [submissionChecks, setSubmissionChecks] = useState<SubmissionCheck[]>(initialChecks);
  const finalNotice = '검수 대기';

  const essayCharacterCount = essayDraft.body.length;
  const completedChecks = submissionChecks.filter((check) => check.status === 'complete').length;
  const completionRate = Math.round((completedChecks / submissionChecks.length) * 100);
  const getSectionBadge = (sectionId: CareerPassSectionId) => {
    if (sectionId === 'track') {
      return String(supportTracks.length);
    }

    if (sectionId === 'experience') {
      return String(experienceCards.length);
    }

    return `${completionRate}%`;
  };

  const createSupportTrack = () => {
    const company = inferCompanyName(trackLink);
    const questionCount = countQuestions(trackQuestions);
    const track: SupportTrack = {
      id: `track-${Date.now()}`,
      company,
      role: '지원 직무',
      detail: `자소서 ${questionCount}문항 · ${trackFileName ? '파일 제출' : '링크 제출'}`,
      deadline: 'D-확인',
      status: '신규',
      tags: [trackFileName ? '공고 업로드' : '링크 입력']
    };

    setSupportTracks((tracks) => [track, ...tracks]);
    setTrackNotice(`${company} 지원 추가`);
    setTrackLink('');
    setTrackQuestions('');
    setTrackFileName('');
    setActiveSection('track');
    setSelectedApplicationId(null);
    setTrackModalOpen(false);
  };

  const createExperienceCard = () => {
    const trimmedTitle = activityName.trim();
    const trimmedDescription = activityDescription.trim();

    if (!trimmedTitle && !trimmedDescription) {
      return;
    }

    const title = trimmedTitle || '신규 활동 경험';
    const description = trimmedDescription || '역할, 문제 해결 과정, 성과';

    const card: ExperienceCard = {
      id: `experience-${Date.now()}`,
      title,
      summary: `${description.slice(0, 72)}${description.length > 72 ? '...' : ''}`,
      tags: ['신규 경험', '직접 입력', 'STAR'],
      role: '핵심 역할 입력 필요',
      action: '문제 해결 과정 입력 필요',
      result: '성과 입력 필요'
    };

    setExperienceCards((cards) => [card, ...cards]);
    setSelectedExperienceCardId(card.id);
    setActivityName('');
    setActivityDescription('');
    setExperienceModalOpen(false);
  };

  const structureEssay = () => {
    setEssayDraft((draft) => ({
      ...draft,
      body:
        'Situation: 프로젝트 진행 과정에서 팀원 간 전략 방향성에 대한 의견 충돌이 발생했습니다.\n\nTask: 저는 객관적인 기준으로 팀의 의사결정을 다시 정렬해야 했습니다.\n\nAction: 사용자 인터뷰 데이터를 재정리하고 우선순위 회의 구조를 제안해 의견을 시각적으로 정리했습니다.\n\nResult: 전략 방향을 빠르게 통합했고 프로젝트 완성도를 높여 최종 발표에서 우수상을 수상했습니다.',
      status: 'AI 구조화',
      finalApplied: false
    }));
  };

  const polishEssay = () => {
    setEssayDraft((draft) => ({
      ...draft,
      body: draft.body.replace('저는', '이 과정에서 저는').replace('그 결과', '이를 통해'),
      status: '문장 다듬기',
      finalApplied: false
    }));
  };

  const saveEssay = (status: string) => {
    setEssayDraft((draft) => ({ ...draft, status }));
  };

  const applyFinalEssay = () => {
    setEssayDraft((draft) => ({ ...draft, status: '최종 반영', finalApplied: true }));
  };

  const toggleSubmissionCheck = (checkId: string) => {
    setSubmissionChecks((checks) =>
      checks.map((check) =>
        check.id === checkId
          ? {
              ...check,
              status: check.status === 'complete' ? 'warning' : 'complete',
              text: check.status === 'complete' ? '재확인' : '완료'
            }
          : check
      )
    );
  };

  const toggleExperienceSort = () => {
    setExperienceSortMode((mode) => (mode === 'recent' ? 'title' : 'recent'));
  };

  const selectSection = (sectionId: CareerPassSectionId) => {
    setActiveSection(sectionId);
    setSelectedApplicationId(null);
  };

  const openEssayEditor = (applicationId: string) => {
    setActiveSection('track');
    setSelectedApplicationId(applicationId);
    setEssayCardsPanelOpen(true);
  };

  const openEditorWithExperience = (experienceCardId: string) => {
    const firstTrack = supportTracks[0];

    if (!firstTrack) {
      return;
    }

    setSelectedExperienceCardId(experienceCardId);
    setActiveSection('track');
    setSelectedApplicationId(firstTrack.id);
    setEssayCardsPanelOpen(true);
    setEssayDraft((draft) => ({ ...draft, status: '경험 연결', finalApplied: false }));
  };

  const selectedApplication = supportTracks.find((application) => application.id === selectedApplicationId) ?? null;
  const selectedExperienceCard =
    experienceCards.find((card) => card.id === selectedExperienceCardId) ?? experienceCards[0] ?? null;

  return (
    <section className="career-pass" aria-labelledby="career-pass-title">
      <div className="career-pass-heading">
        <h1 id="career-pass-title">Career Pass</h1>
        <PolarisButton className="primary-action" onClick={() => setTrackModalOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          지원 추가
        </PolarisButton>
      </div>

      <nav className="career-tabs" aria-label="Career Pass">
        {careerPassSections.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;
          const badge = getSectionBadge(section.id);

          return (
            <PolarisButton
              key={section.id}
              className={`career-tab ${active ? 'career-tab-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => selectSection(section.id)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{section.label}</span>
              <strong>{badge}</strong>
            </PolarisButton>
          );
        })}
      </nav>

      {activeSection === 'track' && selectedApplication && (
        <WritingSection
          application={selectedApplication}
          experienceCards={experienceCards}
          selectedExperienceCard={selectedExperienceCard}
          draft={essayDraft}
          characterCount={essayCharacterCount}
          cardsPanelOpen={essayCardsPanelOpen}
          onBack={() => setSelectedApplicationId(null)}
          onToggleCardsPanel={() => setEssayCardsPanelOpen((open) => !open)}
          onBodyChange={(body) => setEssayDraft((draft) => ({ ...draft, body, status: '작성 중', finalApplied: false }))}
          onStructure={structureEssay}
          onPolish={polishEssay}
          onSaveDraft={() => saveEssay('초안 저장')}
          onTempSave={() => saveEssay('임시 저장')}
          onApplyFinal={applyFinalEssay}
        />
      )}

      {activeSection === 'track' && !selectedApplication && (
        <TrackSection
          trackNotice={trackNotice}
          tracks={supportTracks}
          showAll={applicationsExpanded}
          onToggleList={() => setApplicationsExpanded((expanded) => !expanded)}
          onOpenEssay={openEssayEditor}
        />
      )}

      {activeSection === 'experience' && (
        <ExperienceSection
          cards={experienceCards}
          sortMode={experienceSortMode}
          onToggleSort={toggleExperienceSort}
          onOpenInput={() => setExperienceModalOpen(true)}
          onOpenEditor={openEditorWithExperience}
        />
      )}

      {experienceModalOpen && (
        <ExperienceCreateModal
          activityName={activityName}
          activityDescription={activityDescription}
          onNameChange={setActivityName}
          onDescriptionChange={setActivityDescription}
          onCreateCard={createExperienceCard}
          onClose={() => setExperienceModalOpen(false)}
          canSave={Boolean(activityName.trim() || activityDescription.trim())}
        />
      )}

      {activeSection === 'final' && (
        <FinalSection
          checks={submissionChecks}
          fileName={finalFileName}
          notice={finalNotice}
          completionRate={completionRate}
          onFileSelect={setFinalFileName}
          onToggleCheck={toggleSubmissionCheck}
        />
      )}

      {trackModalOpen && (
        <TrackCreateModal
          trackLink={trackLink}
          trackQuestions={trackQuestions}
          trackFileName={trackFileName}
          onLinkChange={setTrackLink}
          onQuestionsChange={setTrackQuestions}
          onFileSelect={setTrackFileName}
          onCreateTrack={createSupportTrack}
          onClose={() => setTrackModalOpen(false)}
        />
      )}
    </section>
  );
}

function TrackSection({
  trackNotice,
  tracks,
  showAll,
  onToggleList,
  onOpenEssay
}: {
  trackNotice: string;
  tracks: SupportTrack[];
  showAll: boolean;
  onToggleList: () => void;
  onOpenEssay: (applicationId: string) => void;
}) {
  const visibleTracks = showAll ? tracks : tracks.slice(0, LIST_PREVIEW_LIMIT);

  return (
    <section className="career-card track-board">
      <div className="section-card-header">
        <h3>지원 목록</h3>
        <div className="button-row">
          <span className="status-pill">{trackNotice}</span>
          {tracks.length > LIST_PREVIEW_LIMIT && (
            <PolarisButton className="secondary-action compact-action" onClick={onToggleList}>
              <ChevronRight size={16} aria-hidden="true" />
              {showAll ? '접기' : '더보기'}
            </PolarisButton>
          )}
        </div>
      </div>
      <div className="track-list case-card-grid">
        {visibleTracks.map((track) => (
          <PolarisButton className="case-card track-case-card" key={track.id} onClick={() => onOpenEssay(track.id)}>
            <div className="case-card-visual track-case-visual">
              <span className="case-card-kicker">{track.deadline}</span>
              <strong>{track.company}</strong>
              <span>{track.role}</span>
            </div>
            <div className="case-card-body">
              <p className="case-card-copy">{track.detail}</p>
              <div className="case-card-footer">
                <span>{track.company}</span>
                <strong>{track.status}</strong>
              </div>
              <div className="case-card-action">
                <PenLine size={15} aria-hidden="true" />
                자소서 편집기 열기
                <ChevronRight size={15} aria-hidden="true" />
              </div>
            </div>
          </PolarisButton>
        ))}
      </div>
    </section>
  );
}

function TrackCreateModal({
  trackLink,
  trackQuestions,
  trackFileName,
  onLinkChange,
  onQuestionsChange,
  onFileSelect,
  onCreateTrack,
  onClose
}: {
  trackLink: string;
  trackQuestions: string;
  trackFileName: string;
  onLinkChange: (value: string) => void;
  onQuestionsChange: (value: string) => void;
  onFileSelect: (fileName: string) => void;
  onCreateTrack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="career-modal" role="dialog" aria-modal="true" aria-labelledby="track-create-title">
        <div className="section-card-header modal-header">
          <h3 id="track-create-title">지원 추가</h3>
          <PolarisButton className="icon-button" aria-label="닫기" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </PolarisButton>
        </div>

        <div className="form-panel modal-form">
          <PolarisInput
            label="채용 공고 링크"
            placeholder="https://company.com/recruit"
            value={trackLink}
            onChange={(event) => onLinkChange(event.target.value)}
          />
          <PolarisTextarea
            label="자소서 문항"
            rows={6}
            placeholder="문항을 붙여넣으세요."
            value={trackQuestions}
            onChange={(event) => onQuestionsChange(event.target.value)}
          />
          <PolarisFileDrop
            label="공고 파일"
            description="pdf 선택"
            fileName={trackFileName}
            accept=".pdf"
            onFileSelect={onFileSelect}
          />
        </div>

        <div className="modal-actions">
          <PolarisButton className="secondary-action" onClick={onClose}>
            취소
          </PolarisButton>
          <PolarisButton className="primary-action" onClick={onCreateTrack}>
            추가
          </PolarisButton>
        </div>
      </section>
    </div>
  );
}

function ExperienceSection({
  cards,
  sortMode,
  onToggleSort,
  onOpenInput,
  onOpenEditor
}: {
  cards: ExperienceCard[];
  sortMode: ExperienceSortMode;
  onToggleSort: () => void;
  onOpenInput: () => void;
  onOpenEditor: (cardId: string) => void;
}) {
  const sortedCards =
    sortMode === 'title'
      ? [...cards].sort((a, b) => a.title.localeCompare(b.title, 'ko-KR'))
      : cards;
  const sortLabel = sortMode === 'title' ? '가나다순' : '최신순';

  return (
    <div className="experience-workspace">
      <section className="experience-list-card" aria-labelledby="experience-list-title">
        <div className="section-card-header">
          <h3 id="experience-list-title">카드 목록</h3>
          <div className="button-row">
            <span className="status-pill">총 {cards.length}개</span>
            <PolarisButton className="secondary-action compact-action" onClick={onToggleSort}>
              <ArrowUpDown size={16} aria-hidden="true" />
              정렬: {sortLabel}
            </PolarisButton>
            <PolarisButton className="primary-action compact-action" onClick={onOpenInput}>
              <Plus size={16} aria-hidden="true" />
              경험 입력
            </PolarisButton>
          </div>
        </div>
        <div className="experience-stack case-card-grid">
          {sortedCards.map((card) => (
            <PolarisButton className="case-card experience-case-card" key={card.id} onClick={() => onOpenEditor(card.id)}>
              <div className="case-card-visual experience-case-visual">
                <span className="case-card-kicker">{card.tags[0]}</span>
                <strong>{card.title}</strong>
                <span>{card.tags[1] ?? '경험 소재'}</span>
              </div>
              <div className="case-card-body">
                <p className="case-card-copy">{card.summary}</p>
                <dl className="case-card-detail-list">
                  <CaseCardDetail title="역할" text={card.role} />
                  <CaseCardDetail title="행동" text={card.action} />
                  <CaseCardDetail title="성과" text={card.result} />
                </dl>
                <div className="case-card-footer">
                  <span>{card.tags[0]}</span>
                  <strong>{card.tags[1] ?? card.tags[2]}</strong>
                </div>
                <div className="case-card-action">
                  <PenLine size={15} aria-hidden="true" />
                  편집기로 연결
                  <ChevronRight size={15} aria-hidden="true" />
                </div>
              </div>
            </PolarisButton>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExperienceCreateModal({
  activityName,
  activityDescription,
  onNameChange,
  onDescriptionChange,
  onCreateCard,
  onClose,
  canSave
}: {
  activityName: string;
  activityDescription: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCreateCard: () => void;
  onClose: () => void;
  canSave: boolean;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="career-modal" role="dialog" aria-modal="true" aria-labelledby="experience-create-title">
        <div className="section-card-header modal-header">
          <h3 id="experience-create-title">경험 입력</h3>
          <PolarisButton className="icon-button" aria-label="닫기" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </PolarisButton>
        </div>

        <div className="form-panel modal-form">
          <PolarisInput
            label="활동명"
            placeholder="예: 브랜딩 공모전 프로젝트"
            value={activityName}
            onChange={(event) => onNameChange(event.target.value)}
          />
          <PolarisTextarea
            label="활동 내용"
            rows={6}
            placeholder="배경, 역할, 행동, 성과"
            value={activityDescription}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </div>

        <div className="modal-actions">
          <PolarisButton className="secondary-action" onClick={onClose}>
            취소
          </PolarisButton>
          <PolarisButton className="primary-action" disabled={!canSave} onClick={onCreateCard}>
            <Save size={16} aria-hidden="true" />
            저장하기
          </PolarisButton>
        </div>
      </section>
    </div>
  );
}

function WritingSection({
  application,
  experienceCards,
  selectedExperienceCard,
  draft,
  characterCount,
  cardsPanelOpen,
  onBack,
  onToggleCardsPanel,
  onBodyChange,
  onStructure,
  onPolish,
  onSaveDraft,
  onTempSave,
  onApplyFinal
}: {
  application: SupportTrack;
  experienceCards: ExperienceCard[];
  selectedExperienceCard: ExperienceCard | null;
  draft: EssayDraft;
  characterCount: number;
  cardsPanelOpen: boolean;
  onBack: () => void;
  onToggleCardsPanel: () => void;
  onBodyChange: (value: string) => void;
  onStructure: () => void;
  onPolish: () => void;
  onSaveDraft: () => void;
  onTempSave: () => void;
  onApplyFinal: () => void;
}) {
  return (
    <div className={`essay-editor-workspace ${cardsPanelOpen ? 'essay-editor-split' : ''}`}>
      <section className="career-card essay-card document-editor">
        <div className="section-card-header">
          <div>
            <h3>{application.company} 자소서</h3>
            <p>{application.role} · {application.deadline}</p>
          </div>
          <div className="button-row">
            <span className="status-pill">{draft.status}</span>
            <PolarisButton className="secondary-action compact-action experience-panel-toggle" onClick={onToggleCardsPanel}>
              <Puzzle size={16} aria-hidden="true" />
              {cardsPanelOpen ? '경험 카드 닫기' : '경험 카드 열기'}
            </PolarisButton>
            <PolarisButton className="secondary-action compact-action" onClick={onBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              지원 현황
            </PolarisButton>
          </div>
        </div>

        <div className="editor-context-grid">
          <div className="question-box">
            <strong>문항</strong>
            <p>{draft.question}</p>
          </div>

          <div className="recommendation-box strong">
            <strong>추천 경험</strong>
            <span>{selectedExperienceCard?.title ?? '저장된 경험 카드'}</span>
            <TagList tags={selectedExperienceCard?.tags ?? ['협업', '갈등 해결', 'STAR', '문제 해결']} />
          </div>

          <div className="guide-box compact-guide">
            <div className="star-guide-header">
              <strong>STAR</strong>
              <span>추천 경험 기준</span>
            </div>
            <div className="star-guide-grid">
              <StarGuideStep label="S" title="상황" description="방향성 충돌" />
              <StarGuideStep label="T" title="과제" description="의견 조율" />
              <StarGuideStep label="A" title="행동" description="데이터 기반 재정렬" />
              <StarGuideStep label="R" title="결과" description="우수상" />
            </div>
          </div>
        </div>

        <Ribbon className="essay-ribbon" aria-label="자소서 편집 리본">
          <RibbonGroup label="AI">
            <RibbonButton size="lg" icon={<AiWriteIcon />} onClick={onStructure}>
              구조화
            </RibbonButton>
            <RibbonButton size="lg" icon={<AiChatIcon />} onClick={onPolish}>
              다듬기
            </RibbonButton>
          </RibbonGroup>
          <RibbonSeparator />
          <RibbonGroup label="서식">
            <RibbonStack>
              <RibbonRow>
                <RibbonButton size="sm" icon={<BoldIcon />} aria-label="굵게" />
                <RibbonButton size="sm" icon={<ItalicIcon />} aria-label="기울임" />
                <RibbonButton size="sm" icon={<Underline01Icon />} aria-label="밑줄" />
              </RibbonRow>
              <RibbonRow>
                <RibbonButton size="sm" icon={<AlignLeftIcon />} aria-label="왼쪽 정렬" />
                <RibbonButton size="sm" icon={<AlignCenterIcon />} aria-label="가운데 정렬" />
              </RibbonRow>
            </RibbonStack>
          </RibbonGroup>
          <RibbonSeparator />
          <RibbonGroup label="검토">
            <RibbonButton size="lg" icon={<WordCountIcon />}>
              글자 수
            </RibbonButton>
            <RibbonButton size="lg" icon={<ApplyIcon />} onClick={onApplyFinal}>
              최종 반영
            </RibbonButton>
          </RibbonGroup>
        </Ribbon>

        <PolarisTextarea
          label="본문"
          rows={14}
          value={draft.body}
          onChange={(event) => onBodyChange(event.target.value)}
        />

        <div className="essay-bottom-bar">
          <span>{characterCount.toLocaleString('ko-KR')}자</span>
          <div className="button-row">
            <PolarisButton className="secondary-action" onClick={onTempSave}>
              <Save size={16} aria-hidden="true" />
              임시 저장
            </PolarisButton>
            <PolarisButton className="secondary-action" onClick={onSaveDraft}>
              <FileText size={16} aria-hidden="true" />
              초안 저장
            </PolarisButton>
            <PolarisButton className="secondary-action" onClick={onSaveDraft}>
              <Eye size={16} aria-hidden="true" />
              미리보기
            </PolarisButton>
          </div>
        </div>
      </section>

      {cardsPanelOpen && (
        <ExperienceReferencePanel cards={experienceCards} selectedCardId={selectedExperienceCard?.id ?? null} onClose={onToggleCardsPanel} />
      )}
    </div>
  );
}

function ExperienceReferencePanel({
  cards,
  selectedCardId,
  onClose
}: {
  cards: ExperienceCard[];
  selectedCardId: string | null;
  onClose: () => void;
}) {
  return (
    <aside className="career-card experience-reference-panel" aria-label="저장된 경험 카드">
      <div className="section-card-header">
        <div>
          <h3>저장된 경험 카드</h3>
          <p>{cards.length}개 경험을 보며 작성</p>
        </div>
        <PolarisButton className="secondary-action compact-action" onClick={onClose}>
          닫기
        </PolarisButton>
      </div>

      <div className="experience-reference-list">
        {cards.map((card, index) => {
          const selected = selectedCardId ? card.id === selectedCardId : index === 0;

          return (
          <article
            className={`experience-reference-card ${selected ? 'experience-reference-card-primary' : ''}`}
            key={card.id}
          >
            <div className="experience-reference-top">
              {selected && <span>추천</span>}
              <strong>{card.tags[2] ?? 'STAR'}</strong>
            </div>

            <div className="experience-reference-copy">
              <strong>{card.title}</strong>
              <p>{card.summary}</p>
            </div>

            <div className="experience-reference-tags">
              {card.tags.slice(0, 2).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <dl className="experience-reference-detail-list">
              <CaseCardDetail title="역할" text={card.role} />
              <CaseCardDetail title="행동" text={card.action} />
              <CaseCardDetail title="성과" text={card.result} />
            </dl>
          </article>
          );
        })}
      </div>
    </aside>
  );
}

function FinalSection({
  checks,
  fileName,
  notice,
  completionRate,
  onFileSelect,
  onToggleCheck
}: {
  checks: SubmissionCheck[];
  fileName: string;
  notice: string;
  completionRate: number;
  onFileSelect: (fileName: string) => void;
  onToggleCheck: (checkId: string) => void;
}) {
  return (
    <section className="career-card final-review-card">
      <div className="section-card-header">
        <div>
          <h3>최종 검수</h3>
          <p>첨부 파일과 제출 조건을 한 번에 확인하세요.</p>
        </div>
      </div>

      <PolarisFileDrop
        label="첨부 파일"
        description="pdf · pptx · docx 선택"
        fileName={fileName}
        accept=".pdf,.ppt,.pptx,.doc,.docx"
        onFileSelect={onFileSelect}
      />

      <div className="checklist final-review-checklist">
        {checks.map((check) => (
          <PolarisButton key={check.id} className="check-row interactive-check" onClick={() => onToggleCheck(check.id)}>
            <span>{check.label}</span>
            <strong className={`check-status ${check.status}`}>{check.text}</strong>
          </PolarisButton>
        ))}
      </div>
      <p className="state-note">{notice} · {completionRate}%</p>
    </section>
  );
}

function StarGuideStep({
  label,
  title,
  description
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="star-guide-step">
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function CaseCardDetail({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <dt>{title}</dt>
      <dd>{text}</dd>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <span className="tag" key={tag}>{tag}</span>
      ))}
    </div>
  );
}

function inferCompanyName(link: string) {
  if (!link.trim()) {
    return '신규 기업';
  }

  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^www\./, '');
    const company = host.split('.')[0];
    return company ? company.toUpperCase() : '신규 기업';
  } catch {
    return '신규 기업';
  }
}

function countQuestions(questions: string) {
  const trimmed = questions.trim();
  if (!trimmed) {
    return 1;
  }

  const lineCount = trimmed.split(/\n+/).filter(Boolean).length;
  return Math.max(1, lineCount);
}
