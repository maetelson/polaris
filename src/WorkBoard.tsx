import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Link2,
  PenLine,
  Play,
  ShieldCheck
} from 'lucide-react';
import { PolarisButton } from './polaris-controls';

type FilterId = 'all' | 'mine' | 'review';
type WorkStage = '자료 수집' | '근거 검증' | '초안 작성' | '최종 점검';
type WorkTone = 'default' | 'source' | 'review' | 'writing' | 'done';

type WorkItem = {
  id: string;
  stage: WorkStage;
  title: string;
  description: string;
  tag: string;
  due: string;
  owner: string;
  tone: WorkTone;
  review?: boolean;
  mine?: boolean;
};

const filters: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'mine', label: '내 작업' },
  { id: 'review', label: '검토 필요' }
];

const stages: WorkStage[] = ['자료 수집', '근거 검증', '초안 작성', '최종 점검'];

const workItems: WorkItem[] = [
  {
    id: 'ref-nature',
    stage: '자료 수집',
    title: 'Nature Research 자료 추가',
    description: 'Page 13-14 핵심 문장 표시',
    tag: '자료',
    due: '오늘',
    owner: '민지',
    tone: 'source',
    mine: true
  },
  {
    id: 'tag-trend',
    stage: '자료 수집',
    title: 'Trend Article 태그 정리',
    description: 'AI 활용, 생산성, 검증 태그 연결',
    tag: '태그',
    due: '내일',
    owner: '수빈',
    tone: 'default'
  },
  {
    id: 'claim-source',
    stage: '근거 검증',
    title: '핵심 주장 [2] 원문 대조',
    description: '원문 의미와 생성 문장 차이 확인',
    tag: '검토',
    due: '우선',
    owner: '준호',
    tone: 'review',
    review: true,
    mine: true
  },
  {
    id: 'similarity',
    stage: '근거 검증',
    title: '유사도 92% 문장 확인',
    description: '인용 가능한 문장만 Editor에 고정',
    tag: '출처',
    due: '오늘',
    owner: '민지',
    tone: 'done'
  },
  {
    id: 'report-page',
    stage: '근거 검증',
    title: 'McKinsey Report Page 22 검토',
    description: '시장 맥락 문단에 사용할 수치 확인',
    tag: '리포트',
    due: '대기',
    owner: '수빈',
    tone: 'default',
    review: true
  },
  {
    id: 'intro-draft',
    stage: '초안 작성',
    title: '서론 문단 확장',
    description: '문제 제기와 사용자 어려움 연결',
    tag: '작성',
    due: '오늘',
    owner: '준호',
    tone: 'writing',
    mine: true
  },
  {
    id: 'citation-format',
    stage: '초안 작성',
    title: '참고문헌 형식 맞추기',
    description: 'APA 형식으로 Citation Panel 반영',
    tag: '인용',
    due: '진행',
    owner: '민지',
    tone: 'done'
  },
  {
    id: 'missing-cite',
    stage: '최종 점검',
    title: '인용 누락 2건 처리',
    description: '본문 번호와 참고문헌 목록 동기화',
    tag: '필수',
    due: '마감 전',
    owner: '준호',
    tone: 'review',
    review: true,
    mine: true
  }
];

const priorities = ['핵심 주장 [2] 원문 대조', '인용 누락 2건 처리', '서론 문단 확장'];

const quickActions = [
  { label: 'Source Trace 열기', icon: Link2 },
  { label: 'Editor로 보내기', icon: PenLine },
  { label: '참고문헌 생성', icon: FileText }
];

export function WorkBoard() {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [selectedAction, setSelectedAction] = useState('다음 작업 시작');

  const visibleItems = useMemo(() => {
    if (activeFilter === 'mine') {
      return workItems.filter((item) => item.mine);
    }

    if (activeFilter === 'review') {
      return workItems.filter((item) => item.review);
    }

    return workItems;
  }, [activeFilter]);

  const reviewCount = workItems.filter((item) => item.review).length;
  const doneCount = workItems.filter((item) => item.tone === 'done').length + 10;

  return (
    <section className="work-board-page" aria-labelledby="work-board-title">
      <div className="wb-header">
        <div>
          <p className="eyebrow">Research Workspace</p>
          <h1 id="work-board-title">작업 보드</h1>
          <p>자료 수집부터 최종 인용 점검까지 진행 상태를 관리합니다.</p>
        </div>

        <div className="wb-filter" aria-label="작업 필터">
          {filters.map((filter) => (
            <PolarisButton
              className={`secondary-action compact-action ${activeFilter === filter.id ? 'wb-filter-active' : ''}`}
              key={filter.id}
              aria-pressed={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </PolarisButton>
          ))}
        </div>
      </div>

      <div className="wb-project-strip" aria-label="프로젝트 요약">
        <div>
          <strong>생성형 AI 활용 보고서</strong>
          <span>마감 D-3</span>
        </div>
        <div className="wb-project-state">
          <CheckCircle2 size={16} aria-hidden="true" />
          출처 연결률 92%
        </div>
      </div>

      <div className="wb-summary" aria-label="작업 현황">
        <MetricCard label="진행 중" value="8" />
        <MetricCard label="검토 필요" value={String(reviewCount)} tone="warning" />
        <MetricCard label="완료" value={String(doneCount)} tone="done" />
        <MetricCard label="출처 연결률" value="92%" />
      </div>

      <div className="wb-layout">
        <div className="wb-kanban" aria-label="작업 단계">
          {stages.map((stage, stageIndex) => {
            const stageItems = visibleItems.filter((item) => item.stage === stage);
            const stageTitleId = `wb-stage-${stageIndex + 1}`;

            return (
              <section className="wb-column" key={stage} aria-labelledby={stageTitleId}>
                <div className="wb-column-head">
                  <strong id={stageTitleId}>{stage}</strong>
                  <span>{stageItems.length}</span>
                </div>

                <div className="wb-card-list">
                  {stageItems.map((item) => (
                    <WorkCard item={item} key={item.id} />
                  ))}
                  {stageItems.length === 0 && <div className="wb-empty">표시할 작업이 없습니다.</div>}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="wb-side" aria-label="작업 도우미">
          <section className="wb-panel">
            <div className="wb-panel-head">
              <div>
                <AlertTriangle size={17} aria-hidden="true" />
                <h2>오늘의 우선순위</h2>
              </div>
              <span>3건</span>
            </div>

            <ol className="wb-priority-list">
              {priorities.map((priority, index) => (
                <li key={priority}>
                  <span>{index + 1}</span>
                  {priority}
                </li>
              ))}
            </ol>
          </section>

          <section className="wb-panel">
            <div className="wb-panel-head">
              <div>
                <Play size={17} aria-hidden="true" />
                <h2>빠른 실행</h2>
              </div>
            </div>

            <div className="wb-action-list">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <PolarisButton className="wb-quick-action" key={action.label} onClick={() => setSelectedAction(action.label)}>
                    <Icon size={16} aria-hidden="true" />
                    <span>{action.label}</span>
                  </PolarisButton>
                );
              })}
            </div>

            <PolarisButton className="primary-action wb-full-action" onClick={() => setSelectedAction('다음 작업 시작')}>
              다음 작업 시작
            </PolarisButton>
            <p className="wb-action-feedback">{selectedAction}</p>
          </section>
        </aside>
      </div>
    </section>
  );
}

function MetricCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warning' | 'done' }) {
  return (
    <div className={`wb-metric wb-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WorkCard({ item }: { item: WorkItem }) {
  return (
    <article className={`wb-card wb-card-${item.tone}`}>
      <div className="wb-card-title">
        <strong>{item.title}</strong>
        {item.review && <ShieldCheck size={15} aria-label="검토 필요" />}
      </div>
      <p>{item.description}</p>
      <div className="wb-card-meta">
        <span className={`wb-pill wb-pill-${item.tone}`}>{item.tag}</span>
        <span>{item.owner}</span>
        <span>{item.due}</span>
      </div>
    </article>
  );
}
