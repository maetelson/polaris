import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock3,
  FileText,
  History,
  MessageSquareText,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PolarisButton } from './polaris-controls';

type DocumentId = 'word' | 'ppt' | 'sheet';
type PanelId = 'comments' | 'ai' | 'tasks' | 'versions' | 'final';
type CommentStatus = '미확인' | '확인' | '해결 완료';
type Importance = '높음' | '중간' | '낮음';
type TaskStatus = '대기' | '진행 중' | '완료';

type ReviewDocument = {
  id: DocumentId;
  label: string;
  title: string;
  unit: string;
};

type ReviewComment = {
  id: string;
  documentId: DocumentId;
  author: string;
  target: string;
  content: string;
  status: CommentStatus;
  importance?: Importance;
  category?: string;
};

type MeetingMinute = {
  id: string;
  sourceCommentId: string;
  target: string;
  owner: string;
  decision: string;
  due: string;
  importance: Importance;
};

type ReviewTask = {
  id: string;
  sourceCommentId: string;
  title: string;
  owner: string;
  target: string;
  due: string;
  status: TaskStatus;
};

type ReviewVersion = {
  id: string;
  documentId: DocumentId;
  name: string;
  tag: string;
  memo: string;
  createdAt: string;
};

const reviewDocuments: ReviewDocument[] = [
  { id: 'word', label: 'Word', title: '팀 프로젝트 제안서.docx', unit: '문단' },
  { id: 'ppt', label: 'PPT', title: '문서 협업 리뷰룸.pptx', unit: '슬라이드' },
  { id: 'sheet', label: 'Sheet', title: '팀 프로젝트 작업 현황.xlsx', unit: '셀' }
];

const initialComments: ReviewComment[] = [
  {
    id: 'w1',
    documentId: 'word',
    author: '준호',
    target: '협업 병목 문장',
    content: '@민지 협업 병목 설명에 실제 팀플 사례를 하나 추가하면 좋겠어.',
    status: '미확인'
  },
  {
    id: 'w2',
    documentId: 'word',
    author: '수빈',
    target: '제출 안정성 문장',
    content: '@준호 제출 안정성 부분은 기존 사용자 반복 사용과 연결해서 표현하면 좋겠어.',
    status: '확인'
  },
  {
    id: 'w3',
    documentId: 'word',
    author: '민지',
    target: '일정 연결 문장',
    content: '@수빈 담당자와 일정의 연결 관계가 더 명확하면 좋겠어.',
    status: '미확인'
  },
  {
    id: 'p1',
    documentId: 'ppt',
    author: '민지',
    target: '피드백 분산 카드',
    content: '@준호 피드백 분산 카드가 더 직관적으로 보이면 좋겠어.',
    status: '미확인'
  },
  {
    id: 's1',
    documentId: 'sheet',
    author: '준호',
    target: '마감일 셀',
    content: '@민지 마감일이 실제 최종 마감과 맞는지 확인 필요해.',
    status: '미확인'
  }
];

const panelTabs: Array<{ id: PanelId; label: string; icon: typeof MessageSquareText }> = [
  { id: 'comments', label: '댓글', icon: MessageSquareText },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'tasks', label: '작업', icon: Check },
  { id: 'versions', label: '버전', icon: History },
  { id: 'final', label: '최종본', icon: ShieldCheck }
];

const formatChips = ['파일', '편집', '삽입', '보기', '스타일', '본문', '줄간격'];

export function ReviewRoom() {
  const [activeDocumentId, setActiveDocumentId] = useState<DocumentId>('word');
  const [activePanelId, setActivePanelId] = useState<PanelId>('comments');
  const [selectedCommentId, setSelectedCommentId] = useState('w1');
  const [commentFocusVersion, setCommentFocusVersion] = useState(0);
  const [comments, setComments] = useState<ReviewComment[]>(initialComments);
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [versions, setVersions] = useState<ReviewVersion[]>([
    {
      id: 'v-seed',
      documentId: 'word',
      name: 'Word 저장본 1',
      tag: '초안',
      memo: '초기 문서 상태',
      createdAt: '오전 10:17'
    }
  ]);
  const [finalized, setFinalized] = useState<Record<DocumentId, boolean>>({
    word: false,
    ppt: false,
    sheet: false
  });

  const activeDocument = reviewDocuments.find((document) => document.id === activeDocumentId) ?? reviewDocuments[0];
  const documentComments = comments.filter((comment) => comment.documentId === activeDocumentId);
  const documentMinutes = minutes.filter((minute) => {
    const source = comments.find((comment) => comment.id === minute.sourceCommentId);
    return source?.documentId === activeDocumentId;
  });
  const documentTasks = tasks.filter((task) => {
    const source = comments.find((comment) => comment.id === task.sourceCommentId);
    return source?.documentId === activeDocumentId;
  });
  const documentVersions = versions.filter((version) => version.documentId === activeDocumentId);
  const selectedComment = documentComments.find((comment) => comment.id === selectedCommentId) ?? documentComments[0];
  const unresolvedCount = documentComments.filter((comment) => comment.status !== '해결 완료').length;
  const highOpenCount = documentComments.filter((comment) => comment.importance === '높음' && comment.status !== '해결 완료').length;
  const undoneCount = documentTasks.filter((task) => task.status !== '완료').length;

  const doneCount = useMemo(() => {
    return [
      documentComments.length > 0,
      documentComments.some((comment) => comment.importance),
      documentMinutes.length > 0,
      documentTasks.length > 0 && documentTasks.every((task) => task.status === '완료'),
      documentVersions.length > 0,
      finalized[activeDocumentId]
    ].filter(Boolean).length;
  }, [activeDocumentId, documentComments, documentMinutes, documentTasks, documentVersions, finalized]);

  const selectDocument = (documentId: DocumentId) => {
    setActiveDocumentId(documentId);
    setSelectedCommentId(comments.find((comment) => comment.documentId === documentId)?.id ?? '');
    setCommentFocusVersion((current) => current + 1);
  };

  const selectComment = (commentId: string) => {
    setSelectedCommentId(commentId);
    setCommentFocusVersion((current) => current + 1);
  };

  const runAiSummary = () => {
    setComments((current) =>
      current.map((comment) => {
        if (comment.documentId !== activeDocumentId || comment.status === '해결 완료') {
          return comment;
        }

        return { ...comment, ...classifyComment(comment.content) };
      })
    );
    setActivePanelId('ai');
  };

  const createMinutes = () => {
    const analyzedComments = comments.map((comment) => {
      if (comment.documentId !== activeDocumentId || comment.status === '해결 완료') {
        return comment;
      }

      return comment.importance ? comment : { ...comment, ...classifyComment(comment.content) };
    });
    const candidates = analyzedComments.filter(
      (comment) => comment.documentId === activeDocumentId && comment.status !== '해결 완료' && (comment.importance === '높음' || comment.importance === '중간')
    );

    setComments(analyzedComments);
    setMinutes((current) => {
      const existingSourceIds = new Set(current.map((minute) => minute.sourceCommentId));
      const nextMinutes = candidates
        .filter((comment) => !existingSourceIds.has(comment.id))
        .map((comment, index) => ({
          id: `m-${comment.id}-${index}`,
          sourceCommentId: comment.id,
          target: comment.target,
          owner: extractMention(comment.content),
          decision: defaultDecision(comment.content),
          due: '5/26',
          importance: comment.importance ?? '낮음'
        }));

      return [...current, ...nextMinutes];
    });
    setActivePanelId('ai');
  };

  const createTasks = () => {
    let sourceMinutes = documentMinutes;
    if (!sourceMinutes.length) {
      const generatedMinutes = buildMinutes(comments, minutes, activeDocumentId);
      sourceMinutes = generatedMinutes;
      setComments((current) =>
        current.map((comment) =>
          comment.documentId === activeDocumentId && comment.status !== '해결 완료' && !comment.importance
            ? { ...comment, ...classifyComment(comment.content) }
            : comment
        )
      );
      setMinutes((current) => [...current, ...generatedMinutes]);
    }

    if (!sourceMinutes.length) {
      return;
    }

    setTasks((current) => {
      const existingSourceIds = new Set(current.map((task) => task.sourceCommentId));
      const nextTasks = sourceMinutes
        .filter((minute) => !existingSourceIds.has(minute.sourceCommentId))
        .map((minute) => ({
          id: `t-${minute.id}`,
          sourceCommentId: minute.sourceCommentId,
          title: minute.decision,
          owner: minute.owner,
          target: minute.target,
          due: minute.due,
          status: '대기' as TaskStatus
        }));

      return [...current, ...nextTasks];
    });
    setActivePanelId('tasks');
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const sourceCommentId = tasks.find((task) => task.id === taskId)?.sourceCommentId;
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));

    if (status === '완료' && sourceCommentId) {
      setComments((current) =>
        current.map((comment) => (comment.id === sourceCommentId ? { ...comment, status: '해결 완료' } : comment))
      );
      saveVersion('작업 완료 저장본', '작업 완료', '작업 완료 자동 저장');
    }
  };

  const resolveSelectedComment = () => {
    if (!selectedComment) {
      return;
    }

    setComments((current) =>
      current.map((comment) => (comment.id === selectedComment.id ? { ...comment, status: '해결 완료' } : comment))
    );
  };

  const saveVersion = (name = `${activeDocument.label} 저장본 ${documentVersions.length + 1}`, tag = '수동 저장', memo = '현재 문서 상태') => {
    const now = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' }).format(new Date());
    setVersions((current) => [
      {
        id: `v-${Date.now()}`,
        documentId: activeDocumentId,
        name: name.startsWith(activeDocument.label) ? name : `${activeDocument.label} ${name}`,
        tag,
        memo,
        createdAt: now
      },
      ...current
    ]);
  };

  const confirmFinal = () => {
    saveVersion('최종본', '최종본', '최종본 확정');
    setFinalized((current) => ({ ...current, [activeDocumentId]: true }));
    setActivePanelId('final');
  };

  return (
    <section className="review-room" aria-label="리뷰룸">
      <header className="rr-topbar">
        <div className="rr-doc-switch" role="tablist" aria-label="문서">
          {reviewDocuments.map((document) => (
            <PolarisButton
              key={document.id}
              className={`rr-doc-tab ${activeDocumentId === document.id ? 'rr-doc-tab-active' : ''}`}
              onClick={() => selectDocument(document.id)}
            >
              {document.label}
            </PolarisButton>
          ))}
        </div>
        <div className="rr-file-title">
          <strong>{activeDocument.title}</strong>
          <span>{activeDocument.unit}</span>
        </div>
        <div className="rr-top-actions">
          <PolarisButton className="secondary-action compact-action" onClick={runAiSummary}>
            <Sparkles size={15} aria-hidden="true" />
            AI 정리
          </PolarisButton>
          <PolarisButton className="secondary-action compact-action" onClick={() => saveVersion()}>
            <History size={15} aria-hidden="true" />
            버전 저장
          </PolarisButton>
          <PolarisButton className="primary-action compact-action" onClick={confirmFinal}>
            <ShieldCheck size={15} aria-hidden="true" />
            최종본
          </PolarisButton>
        </div>
      </header>

      <div className="rr-workbench">
        <section className="rr-editor" aria-label="문서 편집 영역">
          <div className="rr-ribbon" aria-label="문서 도구">
            {formatChips.map((chip) => (
              <PolarisButton className="rr-ribbon-chip" key={chip}>
                {chip}
              </PolarisButton>
            ))}
          </div>

          <div className={`rr-canvas rr-canvas-${activeDocumentId}`}>
            {activeDocumentId === 'ppt' ? (
              <SlideCanvas selectedComment={selectedComment} focusVersion={commentFocusVersion} unresolvedCount={unresolvedCount} />
            ) : activeDocumentId === 'sheet' ? (
              <SheetCanvas selectedComment={selectedComment} focusVersion={commentFocusVersion} />
            ) : (
              <WordCanvas selectedComment={selectedComment} focusVersion={commentFocusVersion} />
            )}
          </div>
        </section>

        <aside className="rr-review-panel" aria-label="리뷰 패널">
          <div className="rr-progress-strip" aria-label="진행 상태">
            <span style={{ width: `${(doneCount / 6) * 100}%` }} />
          </div>
          <div className="rr-panel-tabs" role="tablist" aria-label="리뷰룸 탭">
            {panelTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <PolarisButton
                  key={tab.id}
                  className={`rr-panel-tab ${activePanelId === tab.id ? 'rr-panel-tab-active' : ''}`}
                  onClick={() => setActivePanelId(tab.id)}
                >
                  <Icon size={15} aria-hidden="true" />
                  {tab.label}
                </PolarisButton>
              );
            })}
          </div>

          <div className="rr-panel-body">
            {activePanelId === 'comments' && (
              <PanelBlock title="댓글" action={`${unresolvedCount}개`}>
                <div className="rr-button-row">
                  <PolarisButton className="secondary-action compact-action" onClick={resolveSelectedComment}>
                    해결 완료
                  </PolarisButton>
                </div>
                <div className="rr-list">
                  {documentComments.map((comment) => (
                    <button
                      className={`rr-item rr-comment-card ${selectedComment?.id === comment.id ? 'rr-item-selected' : ''}`}
                      key={comment.id}
                      type="button"
                      onClick={() => selectComment(comment.id)}
                    >
                      <span>
                        <strong>{comment.author}</strong>
                        <em className={comment.status === '해결 완료' ? 'rr-chip rr-chip-done' : 'rr-chip'}>{comment.status}</em>
                      </span>
                      <p>{comment.content}</p>
                      <small>{comment.target} · {extractMention(comment.content)}</small>
                    </button>
                  ))}
                </div>
              </PanelBlock>
            )}

            {activePanelId === 'ai' && (
              <PanelBlock title="AI 정리" action={`${documentComments.filter((comment) => comment.importance).length}건`}>
                <div className="rr-button-row">
                  <PolarisButton className="primary-action compact-action" onClick={runAiSummary}>
                    AI 정리 실행
                  </PolarisButton>
                  <PolarisButton className="secondary-action compact-action" onClick={createMinutes}>
                    회의록 만들기
                  </PolarisButton>
                </div>
                <div className="rr-list">
                  {documentComments.filter((comment) => comment.importance).length ? (
                    documentComments
                      .filter((comment) => comment.importance)
                      .map((comment) => (
                        <article className="rr-item" key={`ai-${comment.id}`}>
                          <span>
                            <strong>{comment.category}</strong>
                            <em className={`rr-chip ${getImportanceClass(comment.importance)}`}>{comment.importance}</em>
                          </span>
                          <p>{comment.content}</p>
                        </article>
                      ))
                  ) : (
                    <EmptyLine label="분류 결과 없음" />
                  )}
                </div>
              </PanelBlock>
            )}

            {activePanelId === 'tasks' && (
              <PanelBlock title="작업" action={`${undoneCount}개`}>
                <div className="rr-button-row">
                  <PolarisButton className="primary-action compact-action" onClick={createTasks}>
                    수정 작업 만들기
                  </PolarisButton>
                </div>
                <div className="rr-list">
                  {documentTasks.length ? (
                    documentTasks.map((task) => (
                      <article className="rr-item" key={task.id}>
                        <span>
                          <strong>{task.title}</strong>
                          <select value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}>
                            <option>대기</option>
                            <option>진행 중</option>
                            <option>완료</option>
                          </select>
                        </span>
                        <small>{task.owner} · {task.target} · {task.due}</small>
                      </article>
                    ))
                  ) : (
                    <EmptyLine label="작업 없음" />
                  )}
                </div>
              </PanelBlock>
            )}

            {activePanelId === 'versions' && (
              <PanelBlock title="버전" action={`${documentVersions.length}개`}>
                <div className="rr-button-row">
                  <PolarisButton className="primary-action compact-action" onClick={() => saveVersion()}>
                    새 버전 저장
                  </PolarisButton>
                </div>
                <div className="rr-list">
                  {documentVersions.map((version) => (
                    <article className="rr-item" key={version.id}>
                      <span>
                        <strong>{version.name}</strong>
                        <em className="rr-chip">{version.tag}</em>
                      </span>
                      <p>{version.memo}</p>
                      <small>{version.createdAt}</small>
                    </article>
                  ))}
                </div>
              </PanelBlock>
            )}

            {activePanelId === 'final' && (
              <PanelBlock title="최종본" action={finalized[activeDocumentId] ? '확정됨' : '미확정'}>
                <div className="rr-final-grid">
                  <Metric label="미해결 댓글" value={`${unresolvedCount}개`} />
                  <Metric label="미완료 작업" value={`${undoneCount}개`} />
                  <Metric label="중요 피드백" value={`${highOpenCount}개`} />
                  <Metric label="저장된 버전" value={`${documentVersions.length}개`} />
                </div>
                <PolarisButton className="primary-action rr-full-button" onClick={confirmFinal}>
                  최종본 확정
                </PolarisButton>
              </PanelBlock>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function PanelBlock({ title, action, children }: { title: string; action: string; children: React.ReactNode }) {
  return (
    <section className="rr-panel-section">
      <div className="rr-panel-head">
        <h2>{title}</h2>
        <span>{action}</span>
      </div>
      {children}
    </section>
  );
}

function WordCanvas({ selectedComment, focusVersion }: { selectedComment?: ReviewComment; focusVersion: number }) {
  useScrollToCommentAnchor(selectedComment, focusVersion);

  return (
    <article className="rr-word-page">
      <h1>팀 프로젝트 제안서</h1>
      <p>이번 학기 팀 프로젝트는 캠퍼스 구성원의 문서 협업 과정을 조사하고, 반복되는 업무 병목을 줄이는 방안을 제안합니다.</p>
      <p>
        팀 문서 작업에서는 자료 조사, 역할 분담, 회의 기록이 여러 채널에 흩어지면서
        <span data-comment-anchor="w1" className={getCommentAnchorClass('w1', selectedComment)}>
          핵심 수정 요청을 다시 확인해야 하는 부담
        </span>
        이 발생합니다.
      </p>
      <p>
        조사 방식은 팀별 인터뷰와 작업 로그 비교를 함께 사용합니다. 각 팀원이 남긴 메모와 회의 기록을 같은 기준으로 정리해
        실제로 시간이 많이 쓰이는 구간을 확인합니다.
      </p>
      <p>
        문서 초안은 공동 편집 파일에서 작성하고, 발표 자료와 수치 표는 같은 회의록을 기준으로 업데이트합니다. 변경 사항은
        작업 단위로 분리해 담당자가 확인할 수 있게 합니다.
      </p>
      <p>
        자료 수집은 민지, 발표 자료 정리는 준호, 수치 검토는 수빈이 담당하며
        <span data-comment-anchor="w3" className={getCommentAnchorClass('w3', selectedComment)}>
          담당자별 작업과 마감일을 함께 확인합니다.
        </span>
      </p>
      <p>
        회의 후에는 남은 댓글을 다시 열어 결정된 항목과 아직 확인이 필요한 항목을 구분합니다. 완료된 작업은 연결된 댓글과
        함께 닫아 이후 검토에서 같은 피드백이 반복되지 않도록 합니다.
      </p>
      <p>
        최종본은 제출 직전에 저장본으로 남기고, 이전 버전과 비교할 수 있도록 변경 요약을 함께 기록합니다. 제출 이후에는
        사본을 열어 발표용 문구와 문서 원문을 따로 확인합니다.
      </p>
      <p>
        초안 검토는 5월 24일, 발표 자료 정리는 5월 25일에 진행하고
        <span data-comment-anchor="w2" className={getCommentAnchorClass('w2', selectedComment)}>
          최종 제출 전 반복 사용과 제출 안정성을 기준으로 문장을 정리합니다.
        </span>
      </p>
    </article>
  );
}

function SlideCanvas({
  selectedComment,
  focusVersion,
  unresolvedCount
}: {
  selectedComment?: ReviewComment;
  focusVersion: number;
  unresolvedCount: number;
}) {
  useScrollToCommentAnchor(selectedComment, focusVersion);

  return (
    <div className="rr-slide-stage">
      <aside className="rr-slide-thumbs">
        {[1, 2, 3].map((slide) => (
          <button className={`rr-slide-thumb ${slide === 1 ? 'rr-slide-thumb-active' : ''}`} key={slide} type="button">
            {slide}
          </button>
        ))}
      </aside>
      <article className="rr-slide">
        <h2>문서 협업 과정의 병목</h2>
        <p>피드백 분산 · 작업 누락 · 버전 혼선</p>
        <div>
          <span data-comment-anchor="p1" className={getCommentAnchorClass('p1', selectedComment)}>
            피드백 분산
          </span>
          <span>AI 정리</span>
          <span>버전</span>
        </div>
        <em>{unresolvedCount}</em>
      </article>
    </div>
  );
}

function SheetCanvas({ selectedComment, focusVersion }: { selectedComment?: ReviewComment; focusVersion: number }) {
  useScrollToCommentAnchor(selectedComment, focusVersion);

  const rows = [
    ['담당자', '문서', '작업', '마감일'],
    ['민지', 'Word', '협업 병목 사례 보완', '5/24'],
    ['준호', 'PPT', '피드백 분산 카드 정리', '5/25'],
    ['수빈', 'Sheet', '최종 마감일 확인', '5/26']
  ];

  return (
    <div className="rr-sheet">
      {rows.flatMap((row, rowIndex) =>
        row.map((cell, cellIndex) => {
          const isCommentCell = rowIndex === 3 && cellIndex === 3;
          const className = [
            rowIndex === 0 ? 'rr-sheet-head' : '',
            isCommentCell ? getCommentAnchorClass('s1', selectedComment) : ''
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <span className={className} data-comment-anchor={isCommentCell ? 's1' : undefined} key={`${rowIndex}-${cellIndex}`}>
              {cell}
            </span>
          );
        })
      )}
    </div>
  );
}

function useScrollToCommentAnchor(selectedComment: ReviewComment | undefined, focusVersion: number) {
  useEffect(() => {
    if (!selectedComment) {
      return;
    }

    const anchor = document.querySelector<HTMLElement>(`[data-comment-anchor="${selectedComment.id}"]`);
    const canvas = anchor?.closest<HTMLElement>('.rr-canvas');
    if (!anchor || !canvas) {
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const nextTop = canvas.scrollTop + anchorRect.top - canvasRect.top - canvas.clientHeight / 2 + anchorRect.height / 2;

    canvas.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
  }, [focusVersion, selectedComment?.id]);
}

function getCommentAnchorClass(commentId: string, selectedComment?: ReviewComment) {
  return `rr-comment-anchor ${selectedComment?.id === commentId ? 'rr-comment-anchor-active' : ''}`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rr-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyLine({ label }: { label: string }) {
  return <div className="rr-empty-line">{label}</div>;
}

function buildMinutes(comments: ReviewComment[], minutes: MeetingMinute[], activeDocumentId: DocumentId) {
  const existingMinuteSourceIds = new Set(minutes.map((minute) => minute.sourceCommentId));
  return comments
    .filter((comment) => {
      const nextComment = comment.importance ? comment : { ...comment, ...classifyComment(comment.content) };
      return (
        nextComment.documentId === activeDocumentId &&
        nextComment.status !== '해결 완료' &&
        (nextComment.importance === '높음' || nextComment.importance === '중간') &&
        !existingMinuteSourceIds.has(nextComment.id)
      );
    })
    .map((comment, index) => {
      const nextComment = comment.importance ? comment : { ...comment, ...classifyComment(comment.content) };
      return {
        id: `m-${nextComment.id}-${index}`,
        sourceCommentId: nextComment.id,
        target: nextComment.target,
        owner: extractMention(nextComment.content),
        decision: defaultDecision(nextComment.content),
        due: '5/26',
        importance: nextComment.importance ?? '낮음'
      };
    });
}

function classifyComment(content: string): Pick<ReviewComment, 'importance' | 'category'> {
  if (/구조|흐름|결론|최종본|기능|방향|관계|통일|메시지/.test(content)) {
    return { importance: '높음', category: '회의 필요' };
  }
  if (/근거|자료|수치|일정|마감|확인|계산|기준/.test(content)) {
    return { importance: '중간', category: '담당자 확인' };
  }
  return { importance: '낮음', category: '단순 수정' };
}

function extractMention(content: string) {
  const mention = content.match(/@([가-힣A-Za-z0-9_]+)/);
  return mention?.[1] ?? '-';
}

function defaultDecision(content: string) {
  if (/근거|자료/.test(content)) {
    return '근거 자료 보완';
  }
  if (/수치|계산|기준|일정|마감/.test(content)) {
    return '수치와 일정 기준 확인';
  }
  if (/흐름|구조|관계|방향|메시지|기능/.test(content)) {
    return '문서 흐름과 표현 정리';
  }
  return '피드백 반영';
}

function getImportanceClass(importance?: Importance) {
  if (importance === '높음') {
    return 'rr-chip-high';
  }
  if (importance === '중간') {
    return 'rr-chip-mid';
  }
  return 'rr-chip-low';
}
