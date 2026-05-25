import { useState, type ElementType } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  FileText,
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
  BoldIcon,
  ItalicIcon,
  Underline01Icon,
  WordCountIcon
} from '@polaris/ui/ribbon-icons';
import { PolarisButton, PolarisFileDrop, PolarisInput, PolarisTextarea } from './polaris-controls';

const LIST_PREVIEW_LIMIT = 2;

type CareerPassSectionId = 'track' | 'experience';

type ExperienceSortMode = 'recent' | 'title';

type SupportTrack = {
  id: string;
  company: string;
  role: string;
  detail: string;
  deadline: string;
  status: string;
  tags: string[];
  questions: string[];
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

type TrackQuestionItem = {
  id: string;
  text: string;
};

type CareerPassSection = {
  id: CareerPassSectionId;
  label: string;
  icon: ElementType;
};

const careerPassSections: CareerPassSection[] = [
  { id: 'track', label: '지원 현황', icon: BriefcaseBusiness },
  { id: 'experience', label: '경험 카드', icon: Puzzle }
];

const experienceLabelOptions = ['협업 경험', '문제 해결', '전략 기획', '성과 중심', '리더십', '리서치', '커뮤니케이션', '운영 경험'];

const initialTracks: SupportTrack[] = [
  {
    id: 'hyundai-ux',
    company: '현대자동차',
    role: 'UX Designer',
    detail: '자소서 3문항 · 포트폴리오 제출',
    deadline: 'D-4',
    status: '작성 중',
    tags: ['공채 시즌', '파일 제출'],
    questions: [
      '협업 과정에서 갈등을 해결했던 경험과, 이를 통해 얻은 인사이트를 작성해주세요.',
      '현대자동차 UX Designer 직무에 지원한 동기와 입사 후 기여 방안을 작성해주세요.',
      '사용자 문제를 발견하고 개선안을 설계했던 경험을 구체적으로 작성해주세요.'
    ]
  },
  {
    id: 'kakao-product',
    company: '카카오',
    role: 'Product Designer',
    detail: '자소서 2문항 · 자유 양식 포트폴리오',
    deadline: 'D-9',
    status: '초안 완료',
    tags: ['상시 채용', '링크 제출'],
    questions: [
      '사용자의 문제를 정의하고 제품 개선으로 연결했던 경험을 작성해주세요.',
      '카카오 서비스 중 개선하고 싶은 UX를 고르고, 그 이유와 접근 방식을 작성해주세요.'
    ]
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

const initialEssay =
  '프로젝트 진행 과정에서 팀원 간 전략 방향성에 대한 의견 충돌이 발생했습니다. 초기에는 각자의 아이디어를 중심으로 논의가 이어지며 의사결정이 지연되었습니다. 저는 사용자 인터뷰 데이터를 다시 정리하여 객관적인 기준을 제시했고, 이를 기반으로 우선순위를 재조정하는 회의 구조를 제안했습니다. 이후 팀원들의 의견을 시각적으로 정리해 합의 과정을 단순화했고, 최종적으로 전략 방향을 빠르게 통합할 수 있었습니다. 그 결과 프로젝트 완성도를 높일 수 있었고, 최종 발표에서 우수상을 수상했습니다.';

export function CareerPass({ onFinalReview }: { onFinalReview?: (fileName: string) => void }) {
  const [activeSection, setActiveSection] = useState<CareerPassSectionId | null>(null);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [applicationsExpanded, setApplicationsExpanded] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [trackLink, setTrackLink] = useState('');
  const [trackQuestions, setTrackQuestions] = useState<TrackQuestionItem[]>([{ id: 'question-1', text: '' }]);
  const [trackFileName, setTrackFileName] = useState('');
  const [trackNotice, setTrackNotice] = useState('지원 관리 중');
  const [supportTracks, setSupportTracks] = useState<SupportTrack[]>(initialTracks);
  const [essayCardsPanelOpen, setEssayCardsPanelOpen] = useState(true);
  const [essayGuideOpen, setEssayGuideOpen] = useState(true);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [activityLabel, setActivityLabel] = useState(experienceLabelOptions[0]);
  const [activityRole, setActivityRole] = useState('');
  const [activityAction, setActivityAction] = useState('');
  const [activityResult, setActivityResult] = useState('');
  const [experienceSortMode, setExperienceSortMode] = useState<ExperienceSortMode>('recent');
  const [experienceCards, setExperienceCards] = useState<ExperienceCard[]>(initialExperienceCards);
  const [selectedExperienceCardId, setSelectedExperienceCardId] = useState<string | null>(initialExperienceCards[0]?.id ?? null);
  const [essayDraft, setEssayDraft] = useState<EssayDraft>({
    question: '협업 과정에서 갈등을 해결했던 경험과, 이를 통해 얻은 인사이트를 작성해주세요.',
    body: initialEssay,
    status: '작성 중',
    finalApplied: false
  });
  const essayCharacterCount = essayDraft.body.length;
  const getSectionBadge = (sectionId: CareerPassSectionId) => {
    if (sectionId === 'track') {
      return String(supportTracks.length);
    }

    return String(experienceCards.length);
  };

  const createSupportTrack = () => {
    const company = inferCompanyName(trackLink);
    const questions = normalizeTrackQuestions(trackQuestions);
    const questionCount = questions.length;
    const questionDetail = questionCount > 0 ? `자소서 ${questionCount}문항` : '문항 확인 필요';
    const track: SupportTrack = {
      id: `track-${Date.now()}`,
      company,
      role: '지원 직무',
      detail: `${questionDetail} · ${trackFileName ? '파일 제출' : '링크 제출'}`,
      deadline: 'D-확인',
      status: '신규',
      tags: [trackFileName ? '공고 업로드' : '링크 입력'],
      questions
    };

    setSupportTracks((tracks) => [track, ...tracks]);
    setTrackNotice(`${company} 지원 추가`);
    setTrackLink('');
    setTrackQuestions([{ id: `question-${Date.now()}`, text: '' }]);
    setTrackFileName('');
    setActiveSection(null);
    setSelectedApplicationId(null);
    setSelectedQuestionIndex(0);
    setTrackModalOpen(false);
  };

  const updateTrackQuestion = (questionId: string, value: string) => {
    setTrackQuestions((questions) =>
      questions.map((question) => (question.id === questionId ? { ...question, text: value } : question))
    );
  };

  const addTrackQuestion = () => {
    setTrackQuestions((questions) => [...questions, { id: `question-${Date.now()}`, text: '' }]);
  };

  const removeTrackQuestion = (questionId: string) => {
    setTrackQuestions((questions) => {
      if (questions.length === 1) {
        return [{ ...questions[0], text: '' }];
      }

      return questions.filter((question) => question.id !== questionId);
    });
  };

  const createExperienceCard = () => {
    const trimmedTitle = activityName.trim();
    const trimmedRole = activityRole.trim();
    const trimmedAction = activityAction.trim();
    const trimmedResult = activityResult.trim();

    if (!trimmedTitle && !trimmedRole && !trimmedAction && !trimmedResult) {
      return;
    }

    const title = trimmedTitle || '신규 활동 경험';
    const description = [trimmedAction, trimmedResult, trimmedRole].find(Boolean) || '역할, 행동, 성과를 정리해 주세요.';

    const card: ExperienceCard = {
      id: `experience-${Date.now()}`,
      title,
      summary: `${description.slice(0, 72)}${description.length > 72 ? '...' : ''}`,
      tags: [activityLabel, '직접 입력', 'STAR'],
      role: trimmedRole || '핵심 역할 입력 필요',
      action: trimmedAction || '문제 해결 과정 입력 필요',
      result: trimmedResult || '성과 입력 필요'
    };

    setExperienceCards((cards) => [card, ...cards]);
    setSelectedExperienceCardId(card.id);
    setActivityName('');
    setActivityLabel(experienceLabelOptions[0]);
    setActivityRole('');
    setActivityAction('');
    setActivityResult('');
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

  const previewEssay = () => {
    saveEssay('미리보기');
  };

  const applyFinalEssay = () => {
    setEssayDraft((draft) => ({ ...draft, status: '최종 검수', finalApplied: true }));
    if (selectedApplication) {
      onFinalReview?.(`${selectedApplication.company}_${selectedApplication.role}.docx`);
    }
  };

  const toggleExperienceSort = () => {
    setExperienceSortMode((mode) => (mode === 'recent' ? 'title' : 'recent'));
  };

  const selectSection = (sectionId: CareerPassSectionId) => {
    if (sectionId === 'track') {
      setActiveSection(null);
      setSelectedApplicationId(null);
      setSelectedQuestionIndex(0);
      return;
    }

    setActiveSection(sectionId);
    setSelectedApplicationId(null);
    setSelectedQuestionIndex(0);
  };

  const backToTabs = () => {
    setActiveSection(null);
    setSelectedApplicationId(null);
    setSelectedQuestionIndex(0);
  };

  const openEssayEditor = (applicationId: string) => {
    setActiveSection('track');
    setSelectedApplicationId(applicationId);
    setSelectedQuestionIndex(0);
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
    setSelectedQuestionIndex(0);
    setEssayCardsPanelOpen(true);
    setEssayDraft((draft) => ({ ...draft, status: '경험 연결', finalApplied: false }));
  };

  const selectedApplication = supportTracks.find((application) => application.id === selectedApplicationId) ?? null;
  const selectedExperienceCard =
    experienceCards.find((card) => card.id === selectedExperienceCardId) ?? experienceCards[0] ?? null;
  const currentSection = activeSection ?? 'track';

  return (
    <section className="career-pass" aria-label="커리어 패스">
      <div className="career-pass-heading">
        {selectedApplication ? (
          <div className="career-detail-heading">
            <PolarisButton className="secondary-action compact-action career-heading-back" onClick={backToTabs}>
              <ArrowLeft size={16} aria-hidden="true" />
              이전
            </PolarisButton>
            <div className="career-detail-title">
              <h1>{selectedApplication.company} 자소서</h1>
              <p>{selectedApplication.role} · {selectedApplication.deadline}</p>
            </div>
          </div>
        ) : (
          <h1 id="career-pass-title">커리어 패스</h1>
        )}
        <PolarisButton className="primary-action" onClick={() => setTrackModalOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          지원 추가
        </PolarisButton>
      </div>

      {!selectedApplication && (
        <nav className="career-tabs" aria-label="커리어 패스">
          {careerPassSections.map((section) => {
            const Icon = section.icon;
            const badge = getSectionBadge(section.id);
            const active = section.id === currentSection;

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
      )}

      {activeSection === 'track' && selectedApplication && (
        <WritingSection
          application={selectedApplication}
          experienceCards={experienceCards}
          selectedExperienceCard={selectedExperienceCard}
          draft={essayDraft}
          characterCount={essayCharacterCount}
          selectedQuestionIndex={selectedQuestionIndex}
          cardsPanelOpen={essayCardsPanelOpen}
          contextOpen={essayGuideOpen}
          onToggleContext={() => setEssayGuideOpen((open) => !open)}
          onQuestionSelect={setSelectedQuestionIndex}
          onToggleCardsPanel={() => setEssayCardsPanelOpen((open) => !open)}
          onBodyChange={(body) => setEssayDraft((draft) => ({ ...draft, body, status: '작성 중', finalApplied: false }))}
          onStructure={structureEssay}
          onPolish={polishEssay}
          onTempSave={() => saveEssay('임시 저장')}
          onPreview={previewEssay}
          onApplyFinal={applyFinalEssay}
        />
      )}

      {currentSection === 'track' && !selectedApplication && (
        <TrackSection
          trackNotice={trackNotice}
          tracks={supportTracks}
          showAll={applicationsExpanded}
          showBackToTabs={false}
          onBackToTabs={backToTabs}
          onToggleList={() => setApplicationsExpanded((expanded) => !expanded)}
          onOpenEssay={openEssayEditor}
        />
      )}

      {currentSection === 'experience' && !selectedApplication && (
        <ExperienceSection
          cards={experienceCards}
          sortMode={experienceSortMode}
          onToggleSort={toggleExperienceSort}
          onOpenInput={() => setExperienceModalOpen(true)}
        />
      )}

      {experienceModalOpen && (
        <ExperienceCreateModal
          activityName={activityName}
          activityLabel={activityLabel}
          activityRole={activityRole}
          activityAction={activityAction}
          activityResult={activityResult}
          onNameChange={setActivityName}
          onLabelChange={setActivityLabel}
          onRoleChange={setActivityRole}
          onActionChange={setActivityAction}
          onResultChange={setActivityResult}
          onCreateCard={createExperienceCard}
          onClose={() => setExperienceModalOpen(false)}
          canSave={Boolean(activityName.trim() || activityRole.trim() || activityAction.trim() || activityResult.trim())}
        />
      )}

      {trackModalOpen && (
        <TrackCreateModal
          trackLink={trackLink}
          trackQuestions={trackQuestions}
          trackFileName={trackFileName}
          onLinkChange={setTrackLink}
          onQuestionChange={updateTrackQuestion}
          onAddQuestion={addTrackQuestion}
          onRemoveQuestion={removeTrackQuestion}
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
  showBackToTabs,
  onBackToTabs,
  onToggleList,
  onOpenEssay
}: {
  trackNotice: string;
  tracks: SupportTrack[];
  showAll: boolean;
  showBackToTabs: boolean;
  onBackToTabs: () => void;
  onToggleList: () => void;
  onOpenEssay: (applicationId: string) => void;
}) {
  const visibleTracks = showAll ? tracks : tracks.slice(0, LIST_PREVIEW_LIMIT);

  return (
    <section className="career-card track-board">
      {showBackToTabs && (
        <div className="section-back-row">
          <PolarisButton className="secondary-action compact-action" onClick={onBackToTabs}>
            <ArrowLeft size={16} aria-hidden="true" />
            이전
          </PolarisButton>
        </div>
      )}
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
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
  onFileSelect,
  onCreateTrack,
  onClose
}: {
  trackLink: string;
  trackQuestions: TrackQuestionItem[];
  trackFileName: string;
  onLinkChange: (value: string) => void;
  onQuestionChange: (questionId: string, value: string) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionId: string) => void;
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
          <div className="question-builder" aria-labelledby="track-question-builder-title">
            <div className="question-builder-head">
              <div>
                <strong id="track-question-builder-title">자소서 문항</strong>
                <small>문항 하나를 입력란 하나에 등록하세요.</small>
              </div>
              <PolarisButton className="secondary-action compact-action" onClick={onAddQuestion}>
                <Plus size={16} aria-hidden="true" />
                문항 추가
              </PolarisButton>
            </div>
            <div className="question-list">
              {trackQuestions.map((question, index) => (
                <div className="question-row" key={question.id}>
                  <PolarisInput
                    className="question-input"
                    label={`문항 ${index + 1}`}
                    placeholder="예: 지원 동기와 입사 후 기여 방안을 작성해주세요."
                    value={question.text}
                    onChange={(event) => onQuestionChange(question.id, event.target.value)}
                  />
                  <PolarisButton
                    className="icon-button question-delete-button"
                    aria-label={`문항 ${index + 1} 삭제`}
                    onClick={() => onRemoveQuestion(question.id)}
                  >
                    <X size={17} aria-hidden="true" />
                  </PolarisButton>
                </div>
              ))}
            </div>
          </div>
          <div className="file-field-group">
            <span>공고 파일</span>
            <PolarisFileDrop
              label="파일 선택"
              description="pdf 선택"
              fileName={trackFileName}
              accept=".pdf"
              onFileSelect={onFileSelect}
            />
          </div>
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
  onOpenInput
}: {
  cards: ExperienceCard[];
  sortMode: ExperienceSortMode;
  onToggleSort: () => void;
  onOpenInput: () => void;
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
            <article className="case-card experience-case-card" key={card.id}>
              <div className="case-card-visual experience-case-visual">
                <span className="case-card-kicker">{card.tags[0]}</span>
                <strong>{card.title}</strong>
              </div>
              <div className="case-card-body">
                <p className="case-card-copy">{card.summary}</p>
                <dl className="case-card-detail-list">
                  <CaseCardDetail title="역할" text={card.role} />
                  <CaseCardDetail title="행동" text={card.action} />
                  <CaseCardDetail title="성과" text={card.result} />
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExperienceCreateModal({
  activityName,
  activityLabel,
  activityRole,
  activityAction,
  activityResult,
  onNameChange,
  onLabelChange,
  onRoleChange,
  onActionChange,
  onResultChange,
  onCreateCard,
  onClose,
  canSave
}: {
  activityName: string;
  activityLabel: string;
  activityRole: string;
  activityAction: string;
  activityResult: string;
  onNameChange: (value: string) => void;
  onLabelChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onResultChange: (value: string) => void;
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
          <label className="field-control">
            <span>상단 라벨</span>
            <select className="text-field" value={activityLabel} onChange={(event) => onLabelChange(event.target.value)}>
              {experienceLabelOptions.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <PolarisTextarea
            label="역할"
            rows={3}
            placeholder="예: 브랜드 전략 방향 수정 및 발표 구조 설계"
            value={activityRole}
            onChange={(event) => onRoleChange(event.target.value)}
          />
          <PolarisTextarea
            label="행동"
            rows={4}
            placeholder="예: 사용자 조사 데이터를 기반으로 방향성을 재정리하고 의견 충돌을 조율"
            value={activityAction}
            onChange={(event) => onActionChange(event.target.value)}
          />
          <PolarisTextarea
            label="성과"
            rows={3}
            placeholder="예: 최종 발표 우수상 수상 및 전략 완성도 개선"
            value={activityResult}
            onChange={(event) => onResultChange(event.target.value)}
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
  selectedQuestionIndex,
  cardsPanelOpen,
  contextOpen,
  onToggleContext,
  onQuestionSelect,
  onToggleCardsPanel,
  onBodyChange,
  onStructure,
  onPolish,
  onTempSave,
  onPreview,
  onApplyFinal
}: {
  application: SupportTrack;
  experienceCards: ExperienceCard[];
  selectedExperienceCard: ExperienceCard | null;
  draft: EssayDraft;
  characterCount: number;
  selectedQuestionIndex: number;
  cardsPanelOpen: boolean;
  contextOpen: boolean;
  onToggleContext: () => void;
  onQuestionSelect: (index: number) => void;
  onToggleCardsPanel: () => void;
  onBodyChange: (value: string) => void;
  onStructure: () => void;
  onPolish: () => void;
  onTempSave: () => void;
  onPreview: () => void;
  onApplyFinal: () => void;
}) {
  const questions = getTrackQuestionTexts(application, draft.question);
  const currentQuestionIndex = Math.min(selectedQuestionIndex, questions.length - 1);
  const currentQuestion = questions[currentQuestionIndex];
  const hasMultipleQuestions = questions.length > 1;

  return (
    <div className={`essay-editor-workspace ${cardsPanelOpen ? 'essay-editor-split' : ''}`}>
      <section className="essay-card document-editor">
        <div className="editor-guide-panel">
          <div className="editor-guide-header">
            <strong>가이드</strong>
            <PolarisButton
              className="secondary-action compact-action editor-context-toggle"
              aria-expanded={contextOpen}
              onClick={onToggleContext}
            >
              {contextOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
              {contextOpen ? '가이드 접기' : '가이드 열기'}
            </PolarisButton>
          </div>

          {contextOpen && (
          <div className="editor-context-grid" aria-label="작성 가이드">
          <div className="question-box">
            <div className="question-box-header">
              <strong>문항</strong>
              {hasMultipleQuestions && (
                <div className="question-stepper" aria-label="자소서 문항 이동">
                  <PolarisButton
                    className="icon-button question-step-button"
                    aria-label="이전 문항"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => onQuestionSelect(currentQuestionIndex - 1)}
                  >
                    <ChevronLeft size={15} aria-hidden="true" />
                  </PolarisButton>
                  <span>{currentQuestionIndex + 1}/{questions.length}</span>
                  <PolarisButton
                    className="icon-button question-step-button"
                    aria-label="다음 문항"
                    disabled={currentQuestionIndex === questions.length - 1}
                    onClick={() => onQuestionSelect(currentQuestionIndex + 1)}
                  >
                    <ChevronRight size={15} aria-hidden="true" />
                  </PolarisButton>
                </div>
              )}
            </div>
            <p>{currentQuestion}</p>
            {hasMultipleQuestions && (
              <div className="question-indicator" aria-label="문항 목록">
                {questions.map((question, index) => (
                  <PolarisButton
                    key={`${question}-${index}`}
                    className={`question-indicator-dot ${index === currentQuestionIndex ? 'question-indicator-dot-active' : ''}`}
                    aria-label={`문항 ${index + 1} 보기`}
                    aria-current={index === currentQuestionIndex ? 'step' : undefined}
                    onClick={() => onQuestionSelect(index)}
                  >
                    <span>{index + 1}</span>
                  </PolarisButton>
                ))}
              </div>
            )}
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
          )}
        </div>

        <div className="essay-file-stage">
          <article className="essay-file-page" aria-label="자소서 문서 편집기">
            <div className="essay-file-head">
              <strong>{application.company}_{application.role}.docx</strong>
              {!cardsPanelOpen && (
                <PolarisButton
                  className="secondary-action compact-action experience-panel-toggle"
                  onClick={onToggleCardsPanel}
                >
                  <Puzzle size={16} aria-hidden="true" />
                  경험 카드 열기
                </PolarisButton>
              )}
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
            <RibbonButton size="lg" icon={<Eye size={18} aria-hidden="true" />} onClick={onPreview}>
              미리보기
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
            <PolarisButton className="primary-action" onClick={onApplyFinal}>
              <FileText size={16} aria-hidden="true" />
              최종 검수
            </PolarisButton>
          </div>
        </div>
          </article>
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
    const hostParts = url.hostname
      .replace(/^www\./, '')
      .split('.')
      .filter(Boolean);
    const company = hostParts.find((part) => !['career', 'careers', 'job', 'jobs', 'recruit'].includes(part)) ?? hostParts[0];
    return company ? company.toUpperCase() : '신규 기업';
  } catch {
    return '신규 기업';
  }
}

function normalizeTrackQuestions(questions: TrackQuestionItem[]) {
  return questions.map((question) => question.text.trim()).filter(Boolean);
}

function getTrackQuestionTexts(application: SupportTrack, fallbackQuestion: string) {
  return application.questions.length > 0 ? application.questions : [fallbackQuestion];
}
