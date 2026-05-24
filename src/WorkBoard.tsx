import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  FolderArchive,
  Link2,
  PenLine,
  Quote,
  Target
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
  source: string;
  claim: string;
  status: string;
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
    description: '13-14쪽 핵심 문장 표시',
    source: 'Nature Research',
    claim: '자료 후보',
    status: '수집 중',
    tag: '자료',
    due: '오늘',
    owner: '민지',
    tone: 'source',
    mine: true
  },
  {
    id: 'tag-trend',
    stage: '자료 수집',
    title: '트렌드 아티클 태그 정리',
    description: '인공지능 활용, 생산성, 검증 태그 연결',
    source: '트렌드 아티클',
    claim: '태그 후보',
    status: '분류 대기',
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
    source: 'Nature Research 13쪽',
    claim: '문장 [2]',
    status: '검토 필요',
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
    description: '인용 가능한 문장만 편집기에 고정',
    source: 'Nature Research 14쪽',
    claim: '문장 [2]',
    status: '출처 연결',
    tag: '출처',
    due: '오늘',
    owner: '민지',
    tone: 'done'
  },
  {
    id: 'report-page',
    stage: '근거 검증',
    title: 'McKinsey Report 22쪽 검토',
    description: '시장 맥락 문단에 사용할 수치 확인',
    source: 'McKinsey Report 22쪽',
    claim: '문장 [3]',
    status: '검토 필요',
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
    source: '편집기 초안',
    claim: '초안 블록 04',
    status: '작성 중',
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
    description: 'APA 형식으로 인용 패널 반영',
    source: '인용 패널',
    claim: '참고문헌',
    status: '검증 완료',
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
    source: '인용 패널',
    claim: '문장 [1], [3]',
    status: '검토 필요',
    tag: '필수',
    due: '마감 전',
    owner: '준호',
    tone: 'review',
    review: true,
    mine: true
  }
];

const quickActions = [
  { label: '출처 대조 열기', icon: Link2 },
  { label: '편집기에 삽입', icon: PenLine },
  { label: '참고문헌 생성', icon: FileText }
];

const knowledgeStats = [
  { label: '참고자료', value: '38' },
  { label: '인사이트', value: '74' },
  { label: '인용', value: '26' },
  { label: '초안 블록', value: '19' }
];

export function WorkBoard() {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [selectedAction, setSelectedAction] = useState('출처 대조 대기');

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
  const focusItem = workItems.find((item) => item.id === 'claim-source') ?? workItems[0];

  return (
    <section className="work-board-page" aria-labelledby="work-board-title">
      <div className="wb-project-hero">
        <div>
          <p className="eyebrow">검증 작업공간</p>
          <h1 id="work-board-title">
            생성형 인공지능 활용 보고서
          </h1>
          <p>출처 검증, 초안 작성, 참고문헌 생성을 한 흐름에서 관리합니다.</p>
        </div>

        <div className="wb-project-status" aria-label="프로젝트 상태">
          <span>마감 D-3</span>
          <strong>72%</strong>
          <div className="wb-progress" aria-hidden="true">
            <i />
          </div>
          <small>근거 검증 후 편집기 반영 단계</small>
        </div>
      </div>

      <div className="wb-metric-list" aria-label="리서치 상태 지표">
        <MetricCard label="출처 연결률" value="92%" tone="done" />
        <MetricCard label="검토 필요" value={`${reviewCount}건`} tone="warning" />
        <MetricCard label="작성 중 문단" value="8개" />
        <MetricCard label="저장된 인사이트" value="74개" />
      </div>

      <div className="wb-verification" aria-label="오늘의 우선 검증">
        <div className="wb-verify-head">
          <div>
            <p className="eyebrow">우선 검증</p>
            <h2>오늘의 우선 검증</h2>
          </div>
          <span>{focusItem.status}</span>
        </div>

        <div className="wb-verify-grid">
          <section className="wb-verify-card">
            <div>
              <BookOpenCheck size={17} aria-hidden="true" />
              <strong>원문 출처</strong>
            </div>
            <p>Participants reported that organizing information was more difficult than locating it.</p>
            <small>{focusItem.source}</small>
          </section>

          <section className="wb-verify-card">
            <div>
              <Quote size={17} aria-hidden="true" />
              <strong>생성 문장</strong>
            </div>
            <p>사용자는 정보를 찾는 것보다 정리하고 구조화하는 과정에서 더 큰 어려움을 경험한다.</p>
            <small>{focusItem.claim}</small>
          </section>

          <section className="wb-verify-card wb-verify-card-status">
            <div>
              <CheckCircle2 size={17} aria-hidden="true" />
              <strong>검증 상태</strong>
            </div>
            <p>의미 유사도 92%</p>
            <ul>
              <li>출처 연결 완료</li>
              <li>의미 일치 검토 중</li>
              <li>인용 가능 여부 확인 필요</li>
            </ul>
          </section>
        </div>
      </div>

      <div className="wb-board-section">
        <div className="wb-board-head">
          <div>
            <p className="eyebrow">작업 보드</p>
            <h2>작업 단계</h2>
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
                <FolderArchive size={17} aria-hidden="true" />
                <h2>지식 보관함</h2>
              </div>
              <span>재사용</span>
            </div>

            <div className="wb-vault-grid">
              {knowledgeStats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="wb-panel">
            <div className="wb-panel-head">
              <div>
                <AlertTriangle size={17} aria-hidden="true" />
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

            <p className="wb-action-feedback">{selectedAction}</p>
          </section>
        </aside>
        </div>
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
      </div>
      <p>{item.description}</p>
      <div className="wb-card-link">
        <span>{item.source}</span>
        <span>{item.claim}</span>
      </div>
      <div className="wb-card-meta">
        <span className={`wb-pill wb-pill-${item.tone}`}>{item.tag}</span>
        <span>{item.status}</span>
        <span>{item.owner}</span>
        <span>{item.due}</span>
      </div>
    </article>
  );
}
