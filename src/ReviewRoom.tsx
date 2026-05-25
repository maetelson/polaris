import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  MessageSquareText,
  Sparkles,
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
import { PolarisButton } from './polaris-controls';

type DocumentId = 'word' | 'ppt' | 'sheet' | 'minutes';
type PanelId = 'comments' | 'ai';
type CommentStatus = '미확인' | '확인' | '해결 완료';
type Importance = '높음' | '중간' | '낮음';

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

const minutesDocument: ReviewDocument = { id: 'minutes', label: '회의록', title: 'AI 회의록.docx', unit: '문단' };

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
    id: 'w4',
    documentId: 'word',
    author: '준호',
    target: '회의록 연결 문장',
    content: '@민지 회의록에서 작업으로 이어지는 흐름이 한 문장 더 보이면 좋겠어.',
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
  { id: 'ai', label: 'AI', icon: Sparkles }
];

const reviewProgressStepCount = 4;

type ReviewRoomProps = {
  onDocumentChange?: (document: { title: string; unit: string }) => void;
};

export function ReviewRoom({ onDocumentChange }: ReviewRoomProps) {
  const [activeDocumentId, setActiveDocumentId] = useState<DocumentId>('word');
  const [activePanelId, setActivePanelId] = useState<PanelId>('comments');
  const [isReviewPanelOpen, setReviewPanelOpen] = useState(false);
  const [isVersionPanelOpen, setVersionPanelOpen] = useState(false);
  const [isVersionModalOpen, setVersionModalOpen] = useState(false);
  const [draftVersionName, setDraftVersionName] = useState('');
  const [draftVersionMemo, setDraftVersionMemo] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState('w1');
  const [commentFocusVersion, setCommentFocusVersion] = useState(0);
  const toastTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>(initialComments);
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [hasMinutesDocument, setHasMinutesDocument] = useState(false);
  const [versions, setVersions] = useState<ReviewVersion[]>([
    {
      id: 'v-seed',
      documentId: 'word',
      name: 'Word 저장본 1',
      tag: '초안',
      memo: '초기 문서 상태',
      createdAt: '2026년 5월 24일 오전 10:17'
    }
  ]);

  const availableDocuments = useMemo(
    () => (hasMinutesDocument ? [...reviewDocuments, minutesDocument] : reviewDocuments),
    [hasMinutesDocument]
  );
  const activeDocument = availableDocuments.find((document) => document.id === activeDocumentId) ?? availableDocuments[0];
  const documentComments = comments.filter((comment) => comment.documentId === activeDocumentId);
  const documentMinutes = minutes.filter((minute) => {
    const source = comments.find((comment) => comment.id === minute.sourceCommentId);
    return source?.documentId === activeDocumentId;
  });
  const documentVersions = versions.filter((version) => version.documentId === activeDocumentId);
  const openDocumentComments = documentComments.filter((comment) => comment.status !== '해결 완료');
  const openCommentIds = new Set(openDocumentComments.map((comment) => comment.id));
  const selectedComment = openDocumentComments.find((comment) => comment.id === selectedCommentId) ?? openDocumentComments[0];
  const unresolvedCount = openDocumentComments.length;
  const hasAiSummary = documentComments.some((comment) => comment.importance);

  const openPanel = (panelId: PanelId) => {
    setActivePanelId(panelId);
    setReviewPanelOpen(true);
    setVersionPanelOpen(false);
  };

  const toggleReviewPanel = () => {
    setReviewPanelOpen((open) => {
      const nextOpen = !open;
      if (nextOpen) {
        setVersionPanelOpen(false);
      }
      return nextOpen;
    });
  };

  const doneCount = useMemo(() => {
    return [
      documentComments.length > 0,
      documentComments.some((comment) => comment.importance),
      documentMinutes.length > 0,
      documentVersions.length > 0
    ].filter(Boolean).length;
  }, [documentComments, documentMinutes, documentVersions]);

  const selectDocument = (documentId: DocumentId) => {
    setActiveDocumentId(documentId);
    setSelectedCommentId(comments.find((comment) => comment.documentId === documentId && comment.status !== '해결 완료')?.id ?? '');
    setCommentFocusVersion((current) => current + 1);
  };

  const selectComment = (commentId: string) => {
    setSelectedCommentId(commentId);
    openPanel('comments');
    setCommentFocusVersion((current) => current + 1);
  };

  useEffect(() => {
    if (activePanelId !== 'comments' || !selectedComment) {
      return;
    }

    document
      .querySelector<HTMLElement>(`[data-comment-card="${selectedComment.id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activePanelId, commentFocusVersion, selectedComment]);

  const runAiSummary = () => {
    setComments((current) =>
      current.map((comment) => {
        if (comment.documentId !== activeDocumentId || comment.status === '해결 완료') {
          return comment;
        }

        return { ...comment, ...classifyComment(comment.content) };
      })
    );
    openPanel('ai');
  };

  const createMinutes = () => {
    const sourceDocumentId = activeDocumentId;
    const analyzedComments = comments.map((comment) => {
      if (comment.documentId !== sourceDocumentId || comment.status === '해결 완료') {
        return comment;
      }

      return comment.importance ? comment : { ...comment, ...classifyComment(comment.content) };
    });
    const candidates = analyzedComments.filter(
      (comment) => comment.documentId === sourceDocumentId && comment.status !== '해결 완료' && (comment.importance === '높음' || comment.importance === '중간')
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
    setHasMinutesDocument(true);
    setActiveDocumentId('minutes');
    setSelectedCommentId('');
    openPanel('ai');
  };

  const resolveComment = (commentId: string) => {
    const nextComment = comments.find(
      (comment) => comment.documentId === activeDocumentId && comment.id !== commentId && comment.status !== '해결 완료'
    );
    setComments((current) =>
      current.map((comment) => (comment.id === commentId ? { ...comment, status: '해결 완료' } : comment))
    );

    if (selectedCommentId === commentId) {
      setSelectedCommentId(nextComment?.id ?? '');
      setCommentFocusVersion((current) => current + 1);
    }
  };

  const getDefaultVersionName = () => `${activeDocument.label} 저장본 ${documentVersions.length + 1}`;

  const showVersionToast = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToastMessage('버전이 저장되었습니다');
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 2200);
  };

  const saveVersion = (
    name = getDefaultVersionName(),
    tag = '수동 저장',
    memo = '현재 문서 상태',
    keepName = false
  ) => {
    const now = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date());
    setVersions((current) => [
      {
        id: `v-${Date.now()}`,
        documentId: activeDocumentId,
        name: keepName || name.startsWith(activeDocument.label) ? name : `${activeDocument.label} ${name}`,
        tag,
        memo,
        createdAt: now
      },
      ...current
    ]);
    showVersionToast();
  };

  const confirmFinal = () => {
    saveVersion('최종본', '최종본', '최종본 확정');
  };

  const openVersionSavePanel = () => {
    saveVersion();
    setReviewPanelOpen(false);
    setVersionModalOpen(false);
    setVersionPanelOpen(true);
  };

  const openVersionModal = () => {
    setDraftVersionName(getDefaultVersionName());
    setDraftVersionMemo('');
    setVersionModalOpen(true);
  };

  const closeVersionModal = () => {
    setVersionModalOpen(false);
  };

  const saveDraftVersion = () => {
    const versionName = draftVersionName.trim() || getDefaultVersionName();
    const versionMemo = draftVersionMemo.trim() || '사용자 설명 없음';

    saveVersion(versionName, '수동 저장', versionMemo, true);
    setVersionModalOpen(false);
    setVersionPanelOpen(true);
  };

  useEffect(() => {
    onDocumentChange?.({ title: activeDocument.title, unit: activeDocument.unit });
  }, [activeDocument.title, activeDocument.unit, onDocumentChange]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleSaveVersion = () => openVersionSavePanel();
    const handleConfirmFinal = () => confirmFinal();

    window.addEventListener('review-room:save-version', handleSaveVersion);
    window.addEventListener('review-room:confirm-final', handleConfirmFinal);

    return () => {
      window.removeEventListener('review-room:save-version', handleSaveVersion);
      window.removeEventListener('review-room:confirm-final', handleConfirmFinal);
    };
  }, [confirmFinal, openVersionSavePanel]);

  return (
    <section className="review-room" aria-label="리뷰룸">
      <div className={`rr-workbench ${isReviewPanelOpen ? 'rr-workbench-panel-open' : 'rr-workbench-panel-closed'}`}>
        <section className="rr-editor" aria-label="문서 편집 영역">
          <Ribbon className="rr-ribbon essay-ribbon" aria-label="작업 리본">
            <RibbonGroup label="AI">
              <RibbonButton size="lg" icon={<AiWriteIcon />} onClick={createMinutes}>
                구조화
              </RibbonButton>
              <RibbonButton size="lg" icon={<AiChatIcon />} onClick={runAiSummary}>
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
              <RibbonButton size="md" icon={<WordCountIcon />} onClick={() => openPanel('comments')}>
                글자 수
              </RibbonButton>
            </RibbonGroup>
            <div className="rr-ribbon-spacer" aria-hidden="true" />
            <RibbonSeparator />
            <RibbonGroup label="패널" className="rr-review-room-group">
              <RibbonButton
                size="md"
                icon={<MessageSquareText size={18} aria-hidden="true" />}
                aria-pressed={isReviewPanelOpen}
                className={`rr-review-toggle ${isReviewPanelOpen ? 'rr-review-toggle-active' : ''}`}
                onClick={toggleReviewPanel}
              >
                리뷰룸
              </RibbonButton>
            </RibbonGroup>
          </Ribbon>

          <div className="rr-floating-doc-tabs" aria-label="문서 미니탭">
            <div className="rr-doc-switch" role="tablist" aria-label="문서">
              {availableDocuments.map((document) => (
                <PolarisButton
                  key={document.id}
                  className={`rr-doc-tab ${activeDocumentId === document.id ? 'rr-doc-tab-active' : ''}`}
                  onClick={() => selectDocument(document.id)}
                >
                  {document.label}
                </PolarisButton>
              ))}
            </div>
          </div>

          <ReviewScrollArea className="rr-canvas-scroll-area" viewportClassName={`rr-canvas rr-canvas-${activeDocumentId}`}>
            {activeDocumentId === 'minutes' ? (
              <MeetingMinutesCanvas minutes={minutes} comments={comments} />
            ) : activeDocumentId === 'ppt' ? (
              <SlideCanvas
                selectedComment={selectedComment}
                activeCommentIds={openCommentIds}
                focusVersion={commentFocusVersion}
                onCommentSelect={selectComment}
                unresolvedCount={unresolvedCount}
              />
            ) : activeDocumentId === 'sheet' ? (
              <SheetCanvas
                selectedComment={selectedComment}
                activeCommentIds={openCommentIds}
                focusVersion={commentFocusVersion}
                onCommentSelect={selectComment}
              />
            ) : (
              <WordCanvas
                selectedComment={selectedComment}
                activeCommentIds={openCommentIds}
                focusVersion={commentFocusVersion}
                onCommentSelect={selectComment}
              />
            )}
          </ReviewScrollArea>
        </section>

        {isReviewPanelOpen && (
          <aside className="rr-review-panel" aria-label="리뷰 패널">
            <div className="rr-progress-strip" aria-label="진행 상태">
              <span style={{ width: `${(doneCount / reviewProgressStepCount) * 100}%` }} />
            </div>
            <div className="rr-panel-toolbar">
              <strong>리뷰룸</strong>
              <PolarisButton className="rr-panel-close" aria-label="리뷰 패널 닫기" onClick={() => setReviewPanelOpen(false)}>
                <X size={15} aria-hidden="true" />
              </PolarisButton>
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
                <PanelBlock title="댓글" action={`${unresolvedCount}개`} className="rr-comments-section">
                  {openDocumentComments.length > 0 ? (
                    <ReviewScrollArea className="rr-comment-scroll-area" viewportClassName="rr-list rr-comment-list">
                      {openDocumentComments.map((comment) => (
                        <article
                          className={`rr-item rr-comment-card ${selectedComment?.id === comment.id ? 'rr-item-selected' : ''}`}
                          data-comment-card={comment.id}
                          key={comment.id}
                        >
                          <button className="rr-comment-main" type="button" onClick={() => selectComment(comment.id)}>
                            <span>
                              <strong>{comment.author}</strong>
                              <em className="rr-chip">{comment.status}</em>
                            </span>
                            <p>{comment.content}</p>
                            <small>{comment.target} · {extractMention(comment.content)}</small>
                          </button>
                          <PolarisButton
                            aria-label={`${comment.author} 댓글 해결 완료`}
                            className="rr-comment-resolve"
                            title="해결 완료"
                            onClick={() => resolveComment(comment.id)}
                          >
                            <Check size={14} aria-hidden="true" />
                          </PolarisButton>
                        </article>
                      ))}
                    </ReviewScrollArea>
                  ) : (
                    <p className="rr-comment-empty">남은 댓글이 없습니다</p>
                  )}
                </PanelBlock>
              )}

            {activePanelId === 'ai' && (
              <PanelBlock title="AI 정리" action={`${documentComments.filter((comment) => comment.importance).length}건`} scrollable>
                <div className="rr-button-row">
                  <PolarisButton className="primary-action compact-action" onClick={hasAiSummary ? createMinutes : runAiSummary}>
                    {hasAiSummary ? '회의록 만들기' : 'AI 정리 실행'}
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

            </div>
          </aside>
        )}
      </div>
      {isVersionPanelOpen && (
        <aside className="rr-version-drawer" aria-label="버전 저장 패널">
          <div className="rr-version-drawer-tab" aria-hidden="true">
            버전 저장
          </div>
          <div className="rr-version-drawer-head">
            <strong>버전 저장</strong>
            <PolarisButton className="rr-panel-close" aria-label="버전 저장 패널 닫기" onClick={() => setVersionPanelOpen(false)}>
              <X size={15} aria-hidden="true" />
            </PolarisButton>
          </div>
          <div className="rr-version-drawer-body">
            <PanelBlock
              title="저장된 버전"
              action={
                <PolarisButton className="primary-action compact-action" onClick={openVersionModal}>
                  새 버전 저장
                </PolarisButton>
              }
              scrollable
            >
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
          </div>
        </aside>
      )}
      {isVersionModalOpen && (
        <div className="rr-modal-backdrop" role="presentation">
          <section className="rr-version-modal" role="dialog" aria-modal="true" aria-labelledby="rr-version-modal-title">
            <div className="rr-version-modal-head">
              <h2 id="rr-version-modal-title">새 버전 저장</h2>
              <PolarisButton className="rr-panel-close" aria-label="새 버전 저장 팝업 닫기" onClick={closeVersionModal}>
                <X size={15} aria-hidden="true" />
              </PolarisButton>
            </div>
            <label className="rr-field">
              <span>버전명</span>
              <input
                value={draftVersionName}
                onChange={(event) => setDraftVersionName(event.target.value)}
                placeholder={`${activeDocument.label} 저장본 ${documentVersions.length + 1}`}
              />
            </label>
            <label className="rr-field">
              <span>설명</span>
              <textarea
                value={draftVersionMemo}
                onChange={(event) => setDraftVersionMemo(event.target.value)}
                placeholder="변경 내용이나 저장 이유를 입력"
                rows={4}
              />
            </label>
            <div className="rr-version-modal-actions">
              <PolarisButton className="secondary-action compact-action" onClick={closeVersionModal}>
                취소
              </PolarisButton>
              <PolarisButton className="primary-action compact-action" onClick={saveDraftVersion}>
                저장
              </PolarisButton>
            </div>
          </section>
        </div>
      )}
      {toastMessage && (
        <div className="rr-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </section>
  );
}

function PanelBlock({
  title,
  action,
  children,
  className = '',
  scrollable = false
}: {
  title: string;
  action: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}) {
  return (
    <section className={`rr-panel-section ${className}`}>
      <div className="rr-panel-head">
        <h2>{title}</h2>
        <div className="rr-panel-action">{typeof action === 'string' ? <span className="rr-panel-badge">{action}</span> : action}</div>
      </div>
      {scrollable ? (
        <ReviewScrollArea className="rr-panel-scroll-area" viewportClassName="rr-panel-scroll-viewport">
          {children}
        </ReviewScrollArea>
      ) : (
        children
      )}
    </section>
  );
}

function ReviewScrollArea({
  children,
  className = '',
  viewportClassName = ''
}: {
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ pointerId: number; startY: number; startScrollTop: number } | null>(null);
  const [metrics, setMetrics] = useState({ clientHeight: 1, scrollHeight: 1, scrollTop: 0 });

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    setMetrics({
      clientHeight: viewport.clientHeight,
      scrollHeight: viewport.scrollHeight,
      scrollTop: viewport.scrollTop
    });
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    updateMetrics();
    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(viewport);
    const contentFrame = requestAnimationFrame(updateMetrics);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(contentFrame);
    };
  }, [children, updateMetrics]);

  const hasOverflow = metrics.scrollHeight > metrics.clientHeight + 1;
  const trackHeight = Math.max(1, metrics.clientHeight);
  const thumbHeight = hasOverflow ? Math.max(44, (metrics.clientHeight / metrics.scrollHeight) * trackHeight) : 0;
  const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
  const maxScrollTop = Math.max(1, metrics.scrollHeight - metrics.clientHeight);
  const thumbTop = hasOverflow ? (metrics.scrollTop / maxScrollTop) * maxThumbTop : 0;

  const scrollToClientY = (clientY: number, track: HTMLElement) => {
    const viewport = viewportRef.current;
    if (!viewport || !hasOverflow) {
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const nextThumbTop = Math.min(Math.max(clientY - trackRect.top - thumbHeight / 2, 0), maxThumbTop);
    viewport.scrollTop = (nextThumbTop / Math.max(1, maxThumbTop)) * maxScrollTop;
  };

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    scrollToClientY(event.clientY, event.currentTarget);
  };

  const handleThumbPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: viewport.scrollTop
    };
  };

  const handleThumbPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const viewport = viewportRef.current;
    const dragState = dragStateRef.current;
    if (!viewport || !dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaY = event.clientY - dragState.startY;
    viewport.scrollTop = dragState.startScrollTop + (deltaY / Math.max(1, maxThumbTop)) * maxScrollTop;
  };

  const handleThumbPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
    }
  };

  return (
    <div className={`rr-scroll-area ${className}`}>
      <div className={`rr-scroll-viewport ${viewportClassName}`} onScroll={updateMetrics} ref={viewportRef}>
        {children}
      </div>
      {hasOverflow && (
        <div className="rr-scrollbar" onPointerDown={handleTrackPointerDown}>
          <button
            aria-label="댓글 목록 스크롤"
            className="rr-scroll-thumb"
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbTop}px)`
            }}
            type="button"
          />
        </div>
      )}
    </div>
  );
}

function WordCanvas({
  selectedComment,
  activeCommentIds,
  focusVersion,
  onCommentSelect
}: {
  selectedComment?: ReviewComment;
  activeCommentIds: Set<string>;
  focusVersion: number;
  onCommentSelect: (commentId: string) => void;
}) {
  useScrollToCommentAnchor(selectedComment, focusVersion);

  return (
    <article className="rr-word-page">
      <h1>팀 프로젝트 제안서</h1>
      <p>이번 학기 팀 프로젝트는 캠퍼스 구성원의 문서 협업 과정을 조사하고, 반복되는 업무 병목을 줄이는 방안을 제안합니다.</p>
      <p>
        팀 문서 작업에서는 자료 조사, 역할 분담, 회의 기록이 여러 채널에 흩어지면서
        <CommentAnchor
          commentId="w1"
          selectedComment={selectedComment}
          activeCommentIds={activeCommentIds}
          onCommentSelect={onCommentSelect}
        >
          핵심 수정 요청을 다시 확인해야 하는 부담
        </CommentAnchor>
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
        <CommentAnchor
          commentId="w3"
          selectedComment={selectedComment}
          activeCommentIds={activeCommentIds}
          onCommentSelect={onCommentSelect}
        >
          담당자별 작업과 마감일을 함께 확인합니다.
        </CommentAnchor>
      </p>
      <p>
        회의 후에는 남은 댓글을 다시 열어 결정된 항목과 아직 확인이 필요한 항목을 구분합니다. 완료된 작업은 연결된 댓글과
        함께 닫아 이후 검토에서 같은 피드백이 반복되지 않도록 합니다.
        <CommentAnchor
          commentId="w4"
          selectedComment={selectedComment}
          activeCommentIds={activeCommentIds}
          onCommentSelect={onCommentSelect}
        >
          회의록에서 작업 카드로 이어지는 수정 흐름을 함께 남깁니다.
        </CommentAnchor>
      </p>
      <p>
        최종본은 제출 직전에 저장본으로 남기고, 이전 버전과 비교할 수 있도록 변경 요약을 함께 기록합니다. 제출 이후에는
        사본을 열어 발표용 문구와 문서 원문을 따로 확인합니다.
      </p>
      <p>
        초안 검토는 5월 24일, 발표 자료 정리는 5월 25일에 진행하고
        <CommentAnchor
          commentId="w2"
          selectedComment={selectedComment}
          activeCommentIds={activeCommentIds}
          onCommentSelect={onCommentSelect}
        >
          최종 제출 전 반복 사용과 제출 안정성을 기준으로 문장을 정리합니다.
        </CommentAnchor>
      </p>
    </article>
  );
}

function MeetingMinutesCanvas({
  minutes,
  comments
}: {
  minutes: MeetingMinute[];
  comments: ReviewComment[];
}) {
  const createdAt = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <article className="rr-word-page rr-minutes-page">
      <h1>AI 회의록</h1>
      <p className="rr-minutes-meta">작성일 {createdAt} · 리뷰룸 AI 정리 기반</p>
      <h2>주요 논의</h2>
      {minutes.length > 0 ? (
        <div className="rr-minutes-list">
          {minutes.map((minute, index) => {
            const sourceComment = comments.find((comment) => comment.id === minute.sourceCommentId);

            return (
              <section className="rr-minutes-item" key={minute.id}>
                <strong>{index + 1}. {minute.target}</strong>
                <p>{sourceComment?.content ?? minute.decision}</p>
                <dl>
                  <div>
                    <dt>담당</dt>
                    <dd>{minute.owner}</dd>
                  </div>
                  <div>
                    <dt>결정/작업</dt>
                    <dd>{minute.decision}</dd>
                  </div>
                  <div>
                    <dt>기한</dt>
                    <dd>{minute.due}</dd>
                  </div>
                  <div>
                    <dt>우선도</dt>
                    <dd>{minute.importance}</dd>
                  </div>
                </dl>
              </section>
            );
          })}
        </div>
      ) : (
        <p>AI 정리 결과를 바탕으로 회의록을 생성하면 주요 논의와 작업 항목이 여기에 정리됩니다.</p>
      )}
      <h2>후속 작업</h2>
      <p>위 항목을 기준으로 담당자별 작업을 확인하고, 다음 검토 전까지 결정/작업 내용을 문서에 반영합니다.</p>
    </article>
  );
}

function SlideCanvas({
  selectedComment,
  activeCommentIds,
  focusVersion,
  onCommentSelect,
  unresolvedCount
}: {
  selectedComment?: ReviewComment;
  activeCommentIds: Set<string>;
  focusVersion: number;
  onCommentSelect: (commentId: string) => void;
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
          <CommentAnchor
            commentId="p1"
            selectedComment={selectedComment}
            activeCommentIds={activeCommentIds}
            onCommentSelect={onCommentSelect}
          >
            피드백 분산
          </CommentAnchor>
          <span>AI 정리</span>
          <span>버전</span>
        </div>
        <em>{unresolvedCount}</em>
      </article>
    </div>
  );
}

function SheetCanvas({
  selectedComment,
  activeCommentIds,
  focusVersion,
  onCommentSelect
}: {
  selectedComment?: ReviewComment;
  activeCommentIds: Set<string>;
  focusVersion: number;
  onCommentSelect: (commentId: string) => void;
}) {
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
            isCommentCell ? getCommentAnchorClass('s1', selectedComment, activeCommentIds) : ''
          ]
            .filter(Boolean)
            .join(' ');

          if (isCommentCell) {
            return (
              <CommentAnchor
                commentId="s1"
                selectedComment={selectedComment}
                activeCommentIds={activeCommentIds}
                onCommentSelect={onCommentSelect}
                key={`${rowIndex}-${cellIndex}`}
              >
                {cell}
              </CommentAnchor>
            );
          }

          return (
            <span className={className} key={`${rowIndex}-${cellIndex}`}>
              {cell}
            </span>
          );
        })
      )}
    </div>
  );
}

function CommentAnchor({
  commentId,
  selectedComment,
  activeCommentIds,
  onCommentSelect,
  children
}: {
  commentId: string;
  selectedComment?: ReviewComment;
  activeCommentIds: Set<string>;
  onCommentSelect: (commentId: string) => void;
  children: React.ReactNode;
}) {
  const className = getCommentAnchorClass(commentId, selectedComment, activeCommentIds);

  if (!activeCommentIds.has(commentId)) {
    return (
      <span data-comment-anchor={commentId} className={className}>
        {children}
      </span>
    );
  }

  return (
    <button
      className={className}
      data-comment-anchor={commentId}
      onClick={() => onCommentSelect(commentId)}
      type="button"
    >
      {children}
    </button>
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

function getCommentAnchorClass(commentId: string, selectedComment: ReviewComment | undefined, activeCommentIds: Set<string>) {
  if (!activeCommentIds.has(commentId)) {
    return '';
  }

  return `rr-comment-anchor ${selectedComment?.id === commentId ? 'rr-comment-anchor-active' : ''}`;
}

function EmptyLine({ label }: { label: string }) {
  return <div className="rr-empty-line">{label}</div>;
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
