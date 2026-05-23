import { useMemo, useState, type ElementType, type ReactNode } from 'react';
import {
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  Eye,
  FileCheck2,
  FileText,
  LayoutDashboard,
  PackageCheck,
  PenLine,
  Plus,
  Puzzle,
  Save,
  Sparkles,
  Wand2
} from 'lucide-react';
import { DocxIcon, PdfIcon, PptxIcon } from '@polaris/ui/file-icons';
import { PolarisButton, PolarisFileDrop, PolarisInput, PolarisTextarea } from './polaris-controls';

// @polaris/ui/ribbon is reserved for the full document editor surface; this feature stays in workflow mode.

type CareerPassSectionId = 'dashboard' | 'track' | 'experience' | 'writing' | 'final';

type SupportTrack = {
  id: string;
  company: string;
  role: string;
  detail: string;
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

type SubmissionPackage = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

type CareerPassSection = {
  id: CareerPassSectionId;
  label: string;
  description: string;
  icon: ElementType;
  badge?: string;
};

const careerPassSections: CareerPassSection[] = [
  {
    id: 'dashboard',
    label: '홈',
    description: '공고 등록부터 제출 검수까지 연결된 취업 지원 워크플로우',
    icon: LayoutDashboard
  },
  {
    id: 'track',
    label: '지원 트랙 생성',
    description: '공고 링크, PDF, 자소서 문항을 기업별 트랙으로 정리',
    icon: BriefcaseBusiness,
    badge: '12'
  },
  {
    id: 'experience',
    label: '경험 카드',
    description: '활동 경험을 STAR 구조 기반 자산으로 변환',
    icon: Puzzle
  },
  {
    id: 'writing',
    label: '자소서 작성',
    description: '문항별 경험 추천과 작성 흐름 연결',
    icon: PenLine
  },
  {
    id: 'final',
    label: 'Final Room',
    description: '제출 직전 파일과 문항 누락을 검수',
    icon: PackageCheck
  }
];

const initialTracks: SupportTrack[] = [
  {
    id: 'hyundai-ux',
    company: '현대자동차',
    role: 'UX Designer',
    detail: '자소서 3문항 · 포트폴리오 제출',
    tags: ['공채 시즌', 'PDF 제출', 'D-4']
  },
  {
    id: 'kakao-product',
    company: '카카오',
    role: 'Product Designer',
    detail: '자소서 2문항 · 자유 양식 포트폴리오',
    tags: ['상시 채용', '링크 제출', 'D-9']
  }
];

const initialExperienceCards: ExperienceCard[] = [
  {
    id: 'branding-contest',
    title: '브랜딩 공모전',
    summary: '시장 분석 기반 전략 수정 경험과 팀 협업 과정을 중심으로 문제 해결 흐름이 구조화되었습니다.',
    tags: ['협업 경험', '갈등 해결', '전략 기획', '성과 중심'],
    role: '브랜드 전략 방향 수정 및 발표 구조 설계',
    action: '사용자 조사 데이터를 기반으로 전략 방향성을 재정리하고, 팀원 간 의견 충돌을 조율했습니다.',
    result: '최종 발표 우수상 수상 및 전략 완성도 개선'
  },
  {
    id: 'industry-project',
    title: '산학 프로젝트',
    summary: '사용자 리서치 기반 UX 개선 프로젝트를 역할, 문제 해결, 성과 중심으로 정리했습니다.',
    tags: ['협업 경험', '문제 해결', 'STAR 구조화'],
    role: '사용자 인터뷰 설계 및 UX 개선안 도출',
    action: '인터뷰 데이터를 다시 분류하고 핵심 pain point를 기준으로 화면 개선 우선순위를 정했습니다.',
    result: '프로토타입 채택률이 높아지고 최종 발표에서 개선 방향이 긍정 평가를 받았습니다.'
  }
];

const initialChecks: SubmissionCheck[] = [
  { id: 'length', label: '글자 수 제한 확인', status: 'complete', text: '완료' },
  { id: 'questions', label: '필수 문항 누락 여부', status: 'complete', text: '완료' },
  { id: 'attachments', label: '첨부 파일 확인', status: 'complete', text: '완료' },
  { id: 'filename', label: '파일명 규칙 점검', status: 'warning', text: '수정 필요' }
];

const initialPackages: SubmissionPackage[] = [
  {
    id: 'hyundai-final',
    title: '현대자동차 UX Designer',
    description: '최종 제출본 및 포트폴리오 업로드 완료',
    tags: ['최종 제출본', 'PDF 저장', 'D-1']
  },
  {
    id: 'kakao-final',
    title: '카카오 Product Designer',
    description: '첨부 파일 검수 완료 및 제출 준비 상태',
    tags: ['검수 완료', '수정 이력 저장', 'D-3']
  }
];

const initialEssay =
  '프로젝트 진행 과정에서 팀원 간 전략 방향성에 대한 의견 충돌이 발생했습니다. 초기에는 각자의 아이디어를 중심으로 논의가 이어지며 의사결정이 지연되었습니다. 저는 사용자 인터뷰 데이터를 다시 정리하여 객관적인 기준을 제시했고, 이를 기반으로 우선순위를 재조정하는 회의 구조를 제안했습니다. 이후 팀원들의 의견을 시각적으로 정리해 합의 과정을 단순화했고, 최종적으로 전략 방향을 빠르게 통합할 수 있었습니다. 그 결과 프로젝트 완성도를 높일 수 있었고, 최종 발표에서 우수상을 수상했습니다.';

export function CareerPass() {
  const [activeSection, setActiveSection] = useState<CareerPassSectionId>('dashboard');
  const [trackLink, setTrackLink] = useState('');
  const [trackQuestions, setTrackQuestions] = useState('');
  const [trackFileName, setTrackFileName] = useState('');
  const [trackNotice, setTrackNotice] = useState('현재 8개의 지원 트랙을 관리 중입니다.');
  const [supportTracks, setSupportTracks] = useState<SupportTrack[]>(initialTracks);
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityFileName, setActivityFileName] = useState('');
  const [experienceCards, setExperienceCards] = useState<ExperienceCard[]>(initialExperienceCards);
  const [essayDraft, setEssayDraft] = useState<EssayDraft>({
    question: '협업 과정에서 갈등을 해결했던 경험과, 이를 통해 얻은 인사이트를 작성해주세요.',
    body: initialEssay,
    status: '작성 중',
    finalApplied: false
  });
  const [finalFileName, setFinalFileName] = useState('');
  const [submissionChecks, setSubmissionChecks] = useState<SubmissionCheck[]>(initialChecks);
  const [submissionPackages, setSubmissionPackages] = useState<SubmissionPackage[]>(initialPackages);
  const [finalNotice, setFinalNotice] = useState('제출 직전 체크리스트 검수를 준비했습니다.');

  const currentSection = useMemo(
    () => careerPassSections.find((section) => section.id === activeSection) ?? careerPassSections[0],
    [activeSection]
  );

  const essayCharacterCount = essayDraft.body.length;
  const completedChecks = submissionChecks.filter((check) => check.status === 'complete').length;
  const completionRate = Math.round((completedChecks / submissionChecks.length) * 100);

  const createSupportTrack = () => {
    const company = inferCompanyName(trackLink);
    const questionCount = countQuestions(trackQuestions);
    const track: SupportTrack = {
      id: `track-${Date.now()}`,
      company,
      role: '지원 직무 정리 중',
      detail: `자소서 ${questionCount}문항 · ${trackFileName ? 'PDF 제출' : '링크 기반 정리'}`,
      tags: ['신규 트랙', trackFileName ? 'PDF 업로드' : '링크 입력', 'D-확인']
    };

    setSupportTracks((tracks) => [track, ...tracks]);
    setTrackNotice(`${company} 지원 트랙이 생성되었습니다.`);
  };

  const createExperienceCard = () => {
    const title = activityName.trim() || '신규 활동 경험';
    const description =
      activityDescription.trim() ||
      '프로젝트 배경, 역할, 문제 해결 과정이 입력되면 STAR 구조로 정리됩니다.';

    const card: ExperienceCard = {
      id: `experience-${Date.now()}`,
      title,
      summary: `${description.slice(0, 80)}${description.length > 80 ? '...' : ''}`,
      tags: ['신규 경험', activityFileName ? '자료 업로드' : '직접 입력', 'STAR 구조화'],
      role: '활동 내 핵심 역할을 정리 중입니다.',
      action: '문제 해결 과정과 의사결정 근거를 중심으로 구조화합니다.',
      result: '성과와 인사이트를 제출 문항에 재사용할 수 있도록 정리합니다.'
    };

    setExperienceCards((cards) => [card, ...cards]);
  };

  const structureEssay = () => {
    setEssayDraft((draft) => ({
      ...draft,
      body:
        'Situation: 프로젝트 진행 과정에서 팀원 간 전략 방향성에 대한 의견 충돌이 발생했습니다.\n\nTask: 저는 객관적인 기준으로 팀의 의사결정을 다시 정렬해야 했습니다.\n\nAction: 사용자 인터뷰 데이터를 재정리하고 우선순위 회의 구조를 제안해 의견을 시각적으로 정리했습니다.\n\nResult: 전략 방향을 빠르게 통합했고 프로젝트 완성도를 높여 최종 발표에서 우수상을 수상했습니다.',
      status: 'AI 구조화 적용됨',
      finalApplied: false
    }));
  };

  const polishEssay = () => {
    setEssayDraft((draft) => ({
      ...draft,
      body: draft.body.replace('저는', '이 과정에서 저는').replace('그 결과', '이를 통해'),
      status: '문장 다듬기 적용됨',
      finalApplied: false
    }));
  };

  const saveEssay = (status: string) => {
    setEssayDraft((draft) => ({ ...draft, status }));
  };

  const applyFinalEssay = () => {
    setEssayDraft((draft) => ({ ...draft, status: '최종 반영됨', finalApplied: true }));
  };

  const toggleSubmissionCheck = (checkId: string) => {
    setSubmissionChecks((checks) =>
      checks.map((check) =>
        check.id === checkId
          ? {
              ...check,
              status: check.status === 'complete' ? 'warning' : 'complete',
              text: check.status === 'complete' ? '재확인 필요' : '완료'
            }
          : check
      )
    );
  };

  const saveSubmissionPackage = () => {
    const nextPackage: SubmissionPackage = {
      id: `package-${Date.now()}`,
      title: '신규 제출 패키지',
      description: finalFileName ? `${finalFileName} 검수 상태 저장` : '파일 업로드 전 체크리스트 상태 저장',
      tags: [finalFileName ? '파일 연결' : '체크리스트 저장', `${completionRate}% 완료`, '방금 저장']
    };

    setSubmissionPackages((packages) => [nextPackage, ...packages]);
    setFinalNotice('최종 제출 패키지가 저장되었습니다.');
  };

  return (
    <section className="career-pass" aria-labelledby="career-pass-title">
      <div className="career-pass-heading">
        <div>
          <p className="eyebrow">Polaris Career Pass</p>
          <h1 id="career-pass-title">취업 지원 워크플로우를 하나로 연결하세요.</h1>
          <p>공고 등록, 경험 정리, 자소서 작성, 제출 검수까지 Polaris 안에서 이어집니다.</p>
        </div>
        <div className="career-pass-actions">
          <PolarisButton className="secondary-action" onClick={() => setActiveSection('dashboard')}>
            <Eye size={16} aria-hidden="true" />
            지원 현황 보기
          </PolarisButton>
          <PolarisButton className="primary-action" onClick={() => setActiveSection('track')}>
            <Plus size={16} aria-hidden="true" />
            새 공고 등록
          </PolarisButton>
        </div>
      </div>

      <nav className="career-tabs" aria-label="Career Pass 섹션">
        {careerPassSections.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;

          return (
            <PolarisButton
              key={section.id}
              className={`career-tab ${active ? 'career-tab-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => setActiveSection(section.id)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{section.label}</span>
              {section.badge && <strong>{section.badge}</strong>}
            </PolarisButton>
          );
        })}
      </nav>

      <section className="career-section-heading" aria-label={`${currentSection.label} 소개`}>
        <div>
          <p className="empty-kicker">Current Section</p>
          <h2>{currentSection.label}</h2>
          <p>{currentSection.description}</p>
        </div>
        <span className="status-pill">{activeSection === 'writing' ? essayDraft.status : 'State prototype'}</span>
      </section>

      {activeSection === 'dashboard' && (
        <DashboardSection
          tracks={supportTracks}
          experienceCards={experienceCards}
          completionRate={completionRate}
          onTrackSelect={() => setActiveSection('track')}
          onExperienceSelect={() => setActiveSection('experience')}
          onWritingSelect={() => setActiveSection('writing')}
          onFinalSelect={() => setActiveSection('final')}
        />
      )}

      {activeSection === 'track' && (
        <TrackSection
          trackLink={trackLink}
          trackQuestions={trackQuestions}
          trackFileName={trackFileName}
          trackNotice={trackNotice}
          tracks={supportTracks}
          onLinkChange={setTrackLink}
          onQuestionsChange={setTrackQuestions}
          onFileSelect={setTrackFileName}
          onCreateTrack={createSupportTrack}
        />
      )}

      {activeSection === 'experience' && (
        <ExperienceSection
          activityName={activityName}
          activityDescription={activityDescription}
          activityFileName={activityFileName}
          cards={experienceCards}
          onNameChange={setActivityName}
          onDescriptionChange={setActivityDescription}
          onFileSelect={setActivityFileName}
          onCreateCard={createExperienceCard}
        />
      )}

      {activeSection === 'writing' && (
        <WritingSection
          draft={essayDraft}
          characterCount={essayCharacterCount}
          onBodyChange={(body) => setEssayDraft((draft) => ({ ...draft, body, status: '작성 중', finalApplied: false }))}
          onStructure={structureEssay}
          onPolish={polishEssay}
          onSaveDraft={() => saveEssay('초안 저장됨')}
          onTempSave={() => saveEssay('임시 저장됨')}
          onApplyFinal={applyFinalEssay}
        />
      )}

      {activeSection === 'final' && (
        <FinalSection
          checks={submissionChecks}
          packages={submissionPackages}
          fileName={finalFileName}
          notice={finalNotice}
          completionRate={completionRate}
          onFileSelect={setFinalFileName}
          onToggleCheck={toggleSubmissionCheck}
          onSavePackage={saveSubmissionPackage}
        />
      )}
    </section>
  );
}

function DashboardSection({
  tracks,
  experienceCards,
  completionRate,
  onTrackSelect,
  onExperienceSelect,
  onWritingSelect,
  onFinalSelect
}: {
  tracks: SupportTrack[];
  experienceCards: ExperienceCard[];
  completionRate: number;
  onTrackSelect: () => void;
  onExperienceSelect: () => void;
  onWritingSelect: () => void;
  onFinalSelect: () => void;
}) {
  return (
    <div className="career-dashboard-grid">
      <div className="career-dashboard-main">
        <section className="career-hero">
          <div>
            <h2>문서 편집기를 넘어, 취준 워크플로우 플랫폼으로.</h2>
            <p>
              Career Pass는 흩어진 경험 자료를 구조화하고, 기업별 자소서 문항에 맞춰 경험을
              연결하며, 제출 직전 누락과 실수를 줄이는 데 집중합니다.
            </p>
            <div className="hero-stats">
              <MetricCard value="15" label="지원 트랙 관리" />
              <MetricCard value="48" label="경험 카드 자산화" />
              <MetricCard value={`${completionRate}%`} label="검수 완료율" />
            </div>
          </div>
          <div className="workflow-stack" aria-label="Career Pass 단계">
            <WorkflowStep title="1. 공고 등록" status="완료" description="현대자동차 UX기획 채용 공고 PDF 분석 및 제출 조건 자동 정리" />
            <WorkflowStep title="2. 경험 카드 생성" status="진행중" description="산학 프로젝트 · 공모전 · 인턴십 경험 요약 및 STAR 구조화" />
            <WorkflowStep title="3. Final Room 검수" status="대기" description="글자 수 · 파일 형식 · 제출 파일명 규칙 자동 점검 예정" />
          </div>
        </section>

        <div className="career-card-grid">
          <FeatureCard
            icon={BriefcaseBusiness}
            title="① 지원 트랙 생성"
            description="채용 공고 링크, 자소서 문항, PDF 파일을 기반으로 기업별 지원 트랙을 빠르게 생성합니다."
            actionLabel="지원 트랙 열기"
            onAction={onTrackSelect}
          >
            <div className="upload-preview">
              <strong>공고 & 문항 업로드</strong>
              <span>링크 · PDF · 문항 텍스트 입력 지원</span>
              <TagList tags={['기업명 정리', '직무 분류', '제출 조건 확인']} />
            </div>
          </FeatureCard>

          <FeatureCard
            icon={Puzzle}
            title="② 경험 카드 & 문서 작성"
            description="사용자의 활동 경험을 구조화하고, 문항에 맞는 경험 추천과 자소서 작성을 지원합니다."
            actionLabel="경험 카드 열기"
            onAction={onExperienceSelect}
          >
            <CompactList
              items={experienceCards.slice(0, 2).map((card) => ({
                title: card.title,
                description: card.summary,
                tags: card.tags.slice(0, 3)
              }))}
            />
          </FeatureCard>

          <FeatureCard
            icon={ClipboardCheck}
            title="③ Final Room 제출 관리"
            description="제출 직전 체크리스트 기반 검수를 통해 파일 누락과 오발송을 줄입니다."
            actionLabel="Final Room 열기"
            onAction={onFinalSelect}
          >
            <div className="checklist compact-checklist">
              <StatusRow label="글자 수 제한 확인" text="정상" status="complete" />
              <StatusRow label="필수 문항 누락 여부" text="완료" status="complete" />
              <StatusRow label="첨부 파일 확인" text="완료" status="complete" />
              <StatusRow label="파일명 규칙 점검" text="수정 필요" status="warning" />
            </div>
          </FeatureCard>

          <FeatureCard
            icon={BadgeCheck}
            title="시즌형 구독 플랜"
            description="취준 시즌의 집중 사용 패턴에 맞춰 기간형·지원 트랙 관리형 구조를 제공합니다."
            actionLabel="자소서 작성 열기"
            onAction={onWritingSelect}
          >
            <CompactList
              items={[
                { title: 'Career Pass 1개월', description: '단기 집중 지원용', tags: ['기간형'] },
                { title: 'Career Pass 3개월', description: '공채 시즌 집중 관리', tags: ['시즌형'] },
                { title: '15개 지원 트랙 관리', description: '다수 기업 통합 지원 관리', tags: ['트랙 관리'] }
              ]}
            />
          </FeatureCard>
        </div>
      </div>

      <aside className="nova-assistant" aria-label="NOVA AI Assistant">
        <div className="assistant-header">
          <div>
            <p className="empty-kicker">NOVA AI Assistant</p>
            <h2 className="nova-gradient-keyword bg-clip-text">AI ACTIVE</h2>
          </div>
          <Sparkles size={20} aria-hidden="true" />
        </div>

        <AssistantCard title="지원 문항 분석">
          <p>현대자동차 UX 기획 직무의 주요 역량은 협업, 데이터 기반 문제 해결, 사용자 경험 개선입니다.</p>
          <div className="recommendation-box">
            <strong>추천 경험 카드</strong>
            <span>브랜딩 공모전 전략 수정 경험이 협업 및 갈등 해결 문항과 높은 연관성을 가집니다.</span>
          </div>
        </AssistantCard>

        <AssistantCard title="STAR 구조 가이드">
          <div className="timeline">
            <TimelineItem title="Situation" description="프로젝트 방향성 충돌 발생" />
            <TimelineItem title="Task" description="팀 내 의견 조율 및 전략 재정비 필요" />
            <TimelineItem title="Action" description="사용자 데이터 기반 회의 구조 재설계" />
            <TimelineItem title="Result" description="최종 발표 우수상 수상 및 프로젝트 채택" />
          </div>
        </AssistantCard>

        <AssistantCard title="제출 패키지 상태">
          <div className="checklist compact-checklist">
            <StatusRow label="자소서 최종본" text="업로드 완료" status="complete" />
            <StatusRow label="포트폴리오 PDF" text="검수 완료" status="complete" />
            <StatusRow label="파일명 규칙" text="재확인 필요" status="warning" />
          </div>
        </AssistantCard>
      </aside>
    </div>
  );
}

function TrackSection({
  trackLink,
  trackQuestions,
  trackFileName,
  trackNotice,
  tracks,
  onLinkChange,
  onQuestionsChange,
  onFileSelect,
  onCreateTrack
}: {
  trackLink: string;
  trackQuestions: string;
  trackFileName: string;
  trackNotice: string;
  tracks: SupportTrack[];
  onLinkChange: (value: string) => void;
  onQuestionsChange: (value: string) => void;
  onFileSelect: (fileName: string) => void;
  onCreateTrack: () => void;
}) {
  return (
    <div className="career-two-column">
      <section className="career-card">
        <div className="section-card-header">
          <div>
            <h3>지원 트랙 생성</h3>
            <p>채용 공고 링크, PDF 또는 자소서 문항을 입력해 기업별 지원 트랙을 생성하세요.</p>
          </div>
          <PolarisButton className="primary-action" onClick={onCreateTrack}>
            <Plus size={16} aria-hidden="true" />
            새 지원 트랙 생성
          </PolarisButton>
        </div>

        <div className="form-panel">
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
            label="공고 PDF 업로드"
            description="PDF 파일을 드래그하거나 클릭하여 업로드하세요."
            fileName={trackFileName}
            accept=".pdf"
            onFileSelect={onFileSelect}
          />
          <FileIconSignals types={['pdf']} />
        </div>

        <p className="state-note">{trackNotice} 공고 마감 일정과 제출 상태를 확인하세요.</p>
      </section>

      <section className="career-card">
        <h3>생성된 지원 트랙</h3>
        <p>기업별 제출 조건과 문항이 자동 정리됩니다.</p>
        <div className="track-list">
          {tracks.map((track) => (
            <article className="track-item" key={track.id}>
              <h4>{track.company} {track.role}</h4>
              <p>{track.detail}</p>
              <TagList tags={track.tags} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExperienceSection({
  activityName,
  activityDescription,
  activityFileName,
  cards,
  onNameChange,
  onDescriptionChange,
  onFileSelect,
  onCreateCard
}: {
  activityName: string;
  activityDescription: string;
  activityFileName: string;
  cards: ExperienceCard[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileSelect: (fileName: string) => void;
  onCreateCard: () => void;
}) {
  return (
    <div className="career-two-column balanced">
      <section className="career-card">
        <div className="section-card-header">
          <div>
            <h3>활동 경험 입력</h3>
            <p>활동명과 관련 경험 내용을 입력하거나 발표 자료 및 문서를 업로드하세요.</p>
          </div>
          <PolarisButton className="primary-action" onClick={onCreateCard}>
            <Plus size={16} aria-hidden="true" />
            새 경험 카드 생성
          </PolarisButton>
        </div>

        <div className="form-panel">
          <PolarisInput
            label="활동명"
            placeholder="예: 브랜딩 공모전 프로젝트"
            value={activityName}
            onChange={(event) => onNameChange(event.target.value)}
          />
          <PolarisTextarea
            label="활동 설명"
            rows={8}
            placeholder="프로젝트 배경, 역할, 문제 해결 과정 등을 입력하세요."
            value={activityDescription}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
          <PolarisFileDrop
            label="관련 자료 업로드"
            description="PPT · PDF · 문서 파일 업로드 지원"
            fileName={activityFileName}
            accept=".ppt,.pptx,.pdf,.doc,.docx"
            onFileSelect={onFileSelect}
          />
          <FileIconSignals types={['pptx', 'pdf', 'docx']} />
        </div>
      </section>

      <section className="career-card">
        <h3>생성된 경험 카드</h3>
        <p>AI가 STAR 구조 기반으로 경험 내용을 정리합니다.</p>
        <div className="experience-stack">
          {cards.map((card) => (
            <article className="experience-card" key={card.id}>
              <h4>{card.title}</h4>
              <p>{card.summary}</p>
              <TagList tags={card.tags} />
              <InfoBlock title="역할" text={card.role} />
              <InfoBlock title="문제 해결 과정" text={card.action} />
              <InfoBlock title="성과" text={card.result} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function WritingSection({
  draft,
  characterCount,
  onBodyChange,
  onStructure,
  onPolish,
  onSaveDraft,
  onTempSave,
  onApplyFinal
}: {
  draft: EssayDraft;
  characterCount: number;
  onBodyChange: (value: string) => void;
  onStructure: () => void;
  onPolish: () => void;
  onSaveDraft: () => void;
  onTempSave: () => void;
  onApplyFinal: () => void;
}) {
  return (
    <div className="career-two-column writing-layout">
      <section className="career-card">
        <h3>AI 추천 경험</h3>
        <p>문항과 가장 연관성이 높은 경험을 추천합니다.</p>

        <div className="question-box">
          <strong>자소서 문항</strong>
          <p>{draft.question}</p>
        </div>

        <div className="recommendation-box strong">
          <strong>추천 경험</strong>
          <span>브랜딩 공모전 전략 수정 경험이 협업 및 갈등 해결 문항과 높은 연관성을 가집니다.</span>
          <TagList tags={['협업 경험', '갈등 해결', 'STAR 구조', '문제 해결']} />
        </div>

        <div className="guide-box">
          <strong>작성 가이드</strong>
          <TimelineItem title="Situation" description="갈등 상황 설명" />
          <TimelineItem title="Task" description="해결해야 했던 역할" />
          <TimelineItem title="Action" description="문제 해결 행동" />
          <TimelineItem title="Result" description="성과 및 인사이트" />
        </div>
      </section>

      <section className="career-card essay-card">
        <div className="section-card-header">
          <div>
            <h3>자소서 작성하기</h3>
            <p>{draft.finalApplied ? '최종 반영된 문안입니다.' : '문항별 추천 경험을 바탕으로 초안을 다듬으세요.'}</p>
          </div>
          <div className="button-row">
            <PolarisButton className="secondary-action" onClick={onStructure}>
              <Wand2 size={16} aria-hidden="true" />
              AI 구조화
            </PolarisButton>
            <PolarisButton className="secondary-action" onClick={onPolish}>
              <Sparkles size={16} aria-hidden="true" />
              문장 다듬기
            </PolarisButton>
          </div>
        </div>

        <PolarisTextarea
          label="작성 본문"
          rows={14}
          value={draft.body}
          onChange={(event) => onBodyChange(event.target.value)}
          helperText="공백 포함 글자 수가 아래에 실시간 반영됩니다."
        />

        <div className="essay-bottom-bar">
          <span>공백 포함 {characterCount.toLocaleString('ko-KR')}자</span>
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
              PDF 미리보기
            </PolarisButton>
            <PolarisButton className="primary-action" onClick={onApplyFinal}>
              <FileCheck2 size={16} aria-hidden="true" />
              최종 반영
            </PolarisButton>
          </div>
        </div>
      </section>
    </div>
  );
}

function FinalSection({
  checks,
  packages,
  fileName,
  notice,
  completionRate,
  onFileSelect,
  onToggleCheck,
  onSavePackage
}: {
  checks: SubmissionCheck[];
  packages: SubmissionPackage[];
  fileName: string;
  notice: string;
  completionRate: number;
  onFileSelect: (fileName: string) => void;
  onToggleCheck: (checkId: string) => void;
  onSavePackage: () => void;
}) {
  return (
    <div className="career-two-column">
      <section className="career-card">
        <div className="section-card-header">
          <div>
            <h3>최종 제출 파일 업로드</h3>
            <p>자소서, 포트폴리오, 첨부 파일을 업로드하여 제출 전 체크리스트 검수를 진행하세요.</p>
          </div>
          <PolarisButton className="primary-action" onClick={onSavePackage}>
            <PackageCheck size={16} aria-hidden="true" />
            최종 제출 패키지 저장
          </PolarisButton>
        </div>

        <PolarisFileDrop
          label="최종 제출 파일 업로드"
          description="PDF · 포트폴리오 · 첨부 문서 업로드 지원"
          fileName={fileName}
          accept=".pdf,.ppt,.pptx,.doc,.docx"
          onFileSelect={onFileSelect}
        />
        <FileIconSignals types={['pdf', 'pptx', 'docx']} />

        <div className="checklist">
          {checks.map((check) => (
            <PolarisButton
              key={check.id}
              className="check-row interactive-check"
              onClick={() => onToggleCheck(check.id)}
            >
              <span>{check.label}</span>
              <strong className={`check-status ${check.status}`}>{check.text}</strong>
            </PolarisButton>
          ))}
        </div>
        <p className="state-note">{notice} 현재 검수 완료율은 {completionRate}%입니다.</p>
      </section>

      <section className="career-card">
        <h3>저장된 제출 패키지</h3>
        <p>기업별 제출 이력과 최종 파일 상태를 저장합니다.</p>
        <div className="package-stack">
          {packages.map((item) => (
            <article className="package-card" key={item.id}>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <TagList tags={item.tags} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function WorkflowStep({ title, status, description }: { title: string; status: string; description: string }) {
  return (
    <article className="workflow-step">
      <div>
        <strong>{title}</strong>
        <span>{status}</span>
      </div>
      <p>{description}</p>
    </article>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children
}: {
  icon: ElementType;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
}) {
  return (
    <article className="career-card feature-card">
      <div className="feature-card-title">
        <span className="feature-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
      {children}
      <PolarisButton className="secondary-action" onClick={onAction}>
        <Eye size={16} aria-hidden="true" />
        {actionLabel}
      </PolarisButton>
    </article>
  );
}

function AssistantCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="assistant-card">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function TimelineItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="timeline-item">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function CompactList({ items }: { items: Array<{ title: string; description: string; tags: string[] }> }) {
  return (
    <div className="compact-list">
      {items.map((item) => (
        <article className="compact-item" key={`${item.title}-${item.description}`}>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          <TagList tags={item.tags} />
        </article>
      ))}
    </div>
  );
}

function StatusRow({ label, text, status }: { label: string; text: string; status: SubmissionCheck['status'] }) {
  return (
    <div className="check-row">
      <span>{label}</span>
      <strong className={`check-status ${status}`}>{text}</strong>
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="info-block">
      <strong>{title}</strong>
      <p>{text}</p>
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

function FileIconSignals({ types }: { types: Array<'pdf' | 'pptx' | 'docx'> }) {
  const config: Record<'pdf' | 'pptx' | 'docx', { label: string; icon: typeof PdfIcon }> = {
    pdf: { label: 'PDF', icon: PdfIcon },
    pptx: { label: 'PPTX', icon: PptxIcon },
    docx: { label: 'DOCX', icon: DocxIcon }
  };

  return (
    <div className="file-signals" aria-label="지원 파일 형식">
      {types.map((type) => {
        const Icon = config[type].icon;

        return (
          <span key={type}>
            <Icon size={22} aria-hidden="true" />
            {config[type].label}
          </span>
        );
      })}
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
