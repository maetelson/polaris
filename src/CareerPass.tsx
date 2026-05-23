import { useState, type ElementType } from 'react';
import {
  BriefcaseBusiness,
  Eye,
  FileCheck2,
  FileText,
  PackageCheck,
  PenLine,
  Plus,
  Puzzle,
  Save,
  Sparkles,
  Wand2,
  X
} from 'lucide-react';
import { DocxIcon, PdfIcon, PptxIcon } from '@polaris/ui/file-icons';
import { PolarisButton, PolarisFileDrop, PolarisInput, PolarisTextarea } from './polaris-controls';

// @polaris/ui/ribbon is reserved for the full document editor surface; this feature stays in workflow mode.

type CareerPassSectionId = 'track' | 'experience' | 'writing' | 'final';

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

type SubmissionPackage = {
  id: string;
  title: string;
  detail: string;
  tags: string[];
};

type CareerPassSection = {
  id: CareerPassSectionId;
  label: string;
  icon: ElementType;
};

const careerPassSections: CareerPassSection[] = [
  { id: 'track', label: '지원 트랙', icon: BriefcaseBusiness },
  { id: 'experience', label: '경험 카드', icon: Puzzle },
  { id: 'writing', label: '자소서', icon: PenLine },
  { id: 'final', label: 'Final Room', icon: PackageCheck }
];

const initialTracks: SupportTrack[] = [
  {
    id: 'hyundai-ux',
    company: '현대자동차',
    role: 'UX Designer',
    detail: '자소서 3문항 · 포트폴리오 제출',
    deadline: 'D-4',
    status: '작성 중',
    tags: ['공채 시즌', 'PDF 제출']
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
  }
];

const initialChecks: SubmissionCheck[] = [
  { id: 'length', label: '글자 수 제한', status: 'complete', text: '완료' },
  { id: 'questions', label: '필수 문항', status: 'complete', text: '완료' },
  { id: 'attachments', label: '첨부 파일', status: 'complete', text: '완료' },
  { id: 'filename', label: '파일명 규칙', status: 'warning', text: '수정 필요' }
];

const initialPackages: SubmissionPackage[] = [
  {
    id: 'hyundai-final',
    title: '현대자동차 UX Designer',
    detail: '최종 제출본 · 포트폴리오 업로드 완료',
    tags: ['최종 제출본', 'PDF 저장', 'D-1']
  },
  {
    id: 'kakao-final',
    title: '카카오 Product Designer',
    detail: '첨부 파일 검수 완료',
    tags: ['검수 완료', '수정 이력', 'D-3']
  }
];

const initialEssay =
  '프로젝트 진행 과정에서 팀원 간 전략 방향성에 대한 의견 충돌이 발생했습니다. 초기에는 각자의 아이디어를 중심으로 논의가 이어지며 의사결정이 지연되었습니다. 저는 사용자 인터뷰 데이터를 다시 정리하여 객관적인 기준을 제시했고, 이를 기반으로 우선순위를 재조정하는 회의 구조를 제안했습니다. 이후 팀원들의 의견을 시각적으로 정리해 합의 과정을 단순화했고, 최종적으로 전략 방향을 빠르게 통합할 수 있었습니다. 그 결과 프로젝트 완성도를 높일 수 있었고, 최종 발표에서 우수상을 수상했습니다.';

export function CareerPass() {
  const [activeSection, setActiveSection] = useState<CareerPassSectionId>('track');
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackLink, setTrackLink] = useState('');
  const [trackQuestions, setTrackQuestions] = useState('');
  const [trackFileName, setTrackFileName] = useState('');
  const [trackNotice, setTrackNotice] = useState('트랙 관리 중');
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
  const [finalNotice, setFinalNotice] = useState('검수 대기');

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

    if (sectionId === 'writing') {
      return essayDraft.status;
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
      detail: `자소서 ${questionCount}문항 · ${trackFileName ? 'PDF 제출' : '링크 제출'}`,
      deadline: 'D-확인',
      status: '신규',
      tags: [trackFileName ? 'PDF 업로드' : '링크 입력']
    };

    setSupportTracks((tracks) => [track, ...tracks]);
    setTrackNotice(`${company} 트랙 생성`);
    setTrackLink('');
    setTrackQuestions('');
    setTrackFileName('');
    setActiveSection('track');
    setTrackModalOpen(false);
  };

  const createExperienceCard = () => {
    const title = activityName.trim() || '신규 활동 경험';
    const description = activityDescription.trim() || '역할, 문제 해결 과정, 성과';

    const card: ExperienceCard = {
      id: `experience-${Date.now()}`,
      title,
      summary: `${description.slice(0, 72)}${description.length > 72 ? '...' : ''}`,
      tags: ['신규 경험', activityFileName ? '자료 업로드' : '직접 입력', 'STAR'],
      role: '핵심 역할 입력 필요',
      action: '문제 해결 과정 입력 필요',
      result: '성과 입력 필요'
    };

    setExperienceCards((cards) => [card, ...cards]);
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

  const saveSubmissionPackage = () => {
    const nextPackage: SubmissionPackage = {
      id: `package-${Date.now()}`,
      title: '신규 제출 패키지',
      detail: finalFileName || '파일 미선택',
      tags: [`${completionRate}% 완료`, '방금 저장']
    };

    setSubmissionPackages((packages) => [nextPackage, ...packages]);
    setFinalNotice('패키지 저장됨');
  };

  return (
    <section className="career-pass" aria-labelledby="career-pass-title">
      <div className="career-pass-heading">
        <h1 id="career-pass-title">Career Pass</h1>
        <PolarisButton className="primary-action" onClick={() => setTrackModalOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          트랙 생성
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
              onClick={() => setActiveSection(section.id)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{section.label}</span>
              <strong>{badge}</strong>
            </PolarisButton>
          );
        })}
      </nav>

      {activeSection === 'track' && (
        <TrackSection
          trackNotice={trackNotice}
          tracks={supportTracks}
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
          onSaveDraft={() => saveEssay('초안 저장')}
          onTempSave={() => saveEssay('임시 저장')}
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
  tracks
}: {
  trackNotice: string;
  tracks: SupportTrack[];
}) {
  return (
    <section className="career-card track-board">
      <div className="section-card-header">
        <h3>트랙 목록</h3>
        <span className="status-pill">{trackNotice}</span>
      </div>
      <div className="track-list">
        {tracks.map((track) => (
          <article className="track-item" key={track.id}>
            <div className="row-title">
              <h4>{track.company} {track.role}</h4>
              <strong className="deadline-pill">{track.deadline}</strong>
            </div>
            <p>{track.detail}</p>
            <TagList tags={[track.status, ...track.tags]} />
          </article>
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
          <h3 id="track-create-title">트랙 생성</h3>
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
            description="PDF 선택"
            fileName={trackFileName}
            accept=".pdf"
            onFileSelect={onFileSelect}
          />
          <FileIconSignals types={['pdf']} />
        </div>

        <div className="modal-actions">
          <PolarisButton className="secondary-action" onClick={onClose}>
            취소
          </PolarisButton>
          <PolarisButton className="primary-action" onClick={onCreateTrack}>
            생성
          </PolarisButton>
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
          <h3>경험 입력</h3>
          <PolarisButton className="primary-action" onClick={onCreateCard}>
            <Plus size={16} aria-hidden="true" />
            카드 생성
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
            label="활동 내용"
            rows={8}
            placeholder="배경, 역할, 행동, 성과"
            value={activityDescription}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
          <PolarisFileDrop
            label="자료"
            description="PPT · PDF · DOCX 선택"
            fileName={activityFileName}
            accept=".ppt,.pptx,.pdf,.doc,.docx"
            onFileSelect={onFileSelect}
          />
          <FileIconSignals types={['pptx', 'pdf', 'docx']} />
        </div>
      </section>

      <section className="career-card">
        <h3>카드 목록</h3>
        <div className="experience-stack">
          {cards.map((card) => (
            <article className="experience-card" key={card.id}>
              <h4>{card.title}</h4>
              <p>{card.summary}</p>
              <TagList tags={card.tags} />
              <InfoBlock title="역할" text={card.role} />
              <InfoBlock title="행동" text={card.action} />
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
        <h3>문항 매칭</h3>

        <div className="question-box">
          <strong>문항</strong>
          <p>{draft.question}</p>
        </div>

        <div className="recommendation-box strong">
          <strong>추천 경험</strong>
          <span>브랜딩 공모전 전략 수정 경험</span>
          <TagList tags={['협업', '갈등 해결', 'STAR', '문제 해결']} />
        </div>

        <div className="guide-box">
          <strong>STAR</strong>
          <TimelineItem title="S" description="방향성 충돌" />
          <TimelineItem title="T" description="의견 조율" />
          <TimelineItem title="A" description="데이터 기반 재정렬" />
          <TimelineItem title="R" description="우수상" />
        </div>
      </section>

      <section className="career-card essay-card">
        <div className="section-card-header">
          <h3>작성 본문</h3>
          <div className="button-row">
            <PolarisButton className="secondary-action" onClick={onStructure}>
              <Wand2 size={16} aria-hidden="true" />
              구조화
            </PolarisButton>
            <PolarisButton className="secondary-action" onClick={onPolish}>
              <Sparkles size={16} aria-hidden="true" />
              다듬기
            </PolarisButton>
          </div>
        </div>

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
          <h3>제출 파일</h3>
          <PolarisButton className="primary-action" onClick={onSavePackage}>
            <PackageCheck size={16} aria-hidden="true" />
            패키지 저장
          </PolarisButton>
        </div>

        <PolarisFileDrop
          label="첨부 파일"
          description="PDF · PPTX · DOCX 선택"
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
        <p className="state-note">{notice} · {completionRate}%</p>
      </section>

      <section className="career-card">
        <h3>제출 패키지</h3>
        <div className="package-stack">
          {packages.map((item) => (
            <article className="package-card" key={item.id}>
              <h4>{item.title}</h4>
              <p>{item.detail}</p>
              <TagList tags={item.tags} />
            </article>
          ))}
        </div>
      </section>
    </div>
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
