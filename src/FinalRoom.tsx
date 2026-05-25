import { useEffect, useState } from 'react';
import { FileSearch } from 'lucide-react';
import { PolarisButton, PolarisFileDrop } from './polaris-controls';
import type { SupportTrack } from './CareerPass';

type RestrictionId = 'length' | 'questions' | 'attachments' | 'filename';

type SubmissionCheck = {
  id: string;
  label: string;
  status: 'complete' | 'warning';
  text: string;
  detail: string;
};

type RestrictionOption = {
  id: RestrictionId;
  label: string;
  placeholder: string;
};

const restrictionOptions: RestrictionOption[] = [
  {
    id: 'length',
    label: '글자 수 제한',
    placeholder: '예: 1,000자 이내'
  },
  {
    id: 'questions',
    label: '필수 문항',
    placeholder: '예: 지원 동기, 협업 경험, 입사 후 포부'
  },
  {
    id: 'attachments',
    label: '첨부 파일 조건',
    placeholder: '예: 포트폴리오 PDF 필수, 20MB 이하'
  },
  {
    id: 'filename',
    label: '파일명 규칙',
    placeholder: '예: 이름_직무_지원서.pdf'
  }
];

const currentDocumentCharacterCount = 862;
const emptyRestrictionValues: Record<RestrictionId, string> = {
  length: '',
  questions: '',
  attachments: '',
  filename: ''
};

export type FinalRoomHandoff = {
  fileName: string;
  submittedAt: number;
};

export function FinalRoom({
  applications,
  handoff
}: {
  applications: SupportTrack[];
  handoff?: FinalRoomHandoff | null;
}) {
  const [finalFileName, setFinalFileName] = useState(handoff?.fileName ?? '');
  const [selectedRestrictionIds, setSelectedRestrictionIds] = useState<RestrictionId[]>([]);
  const [restrictionValues, setRestrictionValues] = useState<Record<RestrictionId, string>>(emptyRestrictionValues);
  const [submissionChecks, setSubmissionChecks] = useState<SubmissionCheck[]>([]);
  const [reviewStarted, setReviewStarted] = useState(false);

  useEffect(() => {
    if (!handoff?.fileName) {
      return;
    }

    setFinalFileName(handoff.fileName);
    setSelectedRestrictionIds([]);
    setRestrictionValues(emptyRestrictionValues);
    setSubmissionChecks([]);
    setReviewStarted(false);
  }, [handoff?.fileName, handoff?.submittedAt]);

  const completedChecks = submissionChecks.filter((check) => check.status === 'complete').length;
  const completionRate = submissionChecks.length > 0 ? Math.round((completedChecks / submissionChecks.length) * 100) : 0;
  const finalNotice = reviewStarted
    ? completedChecks === submissionChecks.length
      ? '검수 완료'
      : '수정 필요'
    : '검수 대기';

  void finalNotice;
  void completionRate;

  const updateRestrictionValue = (restrictionId: RestrictionId, value: string) => {
    setRestrictionValues((values) => ({ ...values, [restrictionId]: value }));
    setReviewStarted(false);
  };

  const toggleRestrictionSelection = (restrictionId: RestrictionId) => {
    setSelectedRestrictionIds((restrictionIds) =>
      restrictionIds.includes(restrictionId)
        ? restrictionIds.filter((id) => id !== restrictionId)
        : [...restrictionIds, restrictionId]
    );
    setReviewStarted(false);
  };

  const updateFinalFileName = (fileName: string) => {
    setFinalFileName(fileName);
    setReviewStarted(false);
  };

  const selectApplicationForReview = (application: SupportTrack) => {
    setFinalFileName(buildApplicationFileName(application));
    setSelectedRestrictionIds([]);
    setRestrictionValues(emptyRestrictionValues);
    setSubmissionChecks([]);
    setReviewStarted(false);
  };

  const startReview = () => {
    setSubmissionChecks(buildSubmissionChecks(finalFileName, selectedRestrictionIds, restrictionValues));
    setReviewStarted(true);
  };

  return (
    <section className="career-pass final-room" aria-labelledby="final-room-title">
      <div className="career-pass-heading">
        <div className="career-pass-heading-copy">
          <h1 id="final-room-title">파이널룸</h1>
          <p>새로운 프로젝트와 제출 조건을 한 번에 확인하세요.</p>
        </div>
      </div>

      <div className="final-room-layout">
        <FinalApplicationsPanel
          applications={applications}
          activeFileName={finalFileName}
          onSelectApplication={selectApplicationForReview}
        />
        <FinalReviewCard
          checks={submissionChecks}
          fileName={finalFileName}
          selectedRestrictionIds={selectedRestrictionIds}
          restrictionValues={restrictionValues}
          reviewStarted={reviewStarted}
          onFileSelect={updateFinalFileName}
          onRestrictionToggle={toggleRestrictionSelection}
          onRestrictionValueChange={updateRestrictionValue}
          onStartReview={startReview}
        />
      </div>
    </section>
  );
}

function FinalApplicationsPanel({
  applications,
  activeFileName,
  onSelectApplication
}: {
  applications: SupportTrack[];
  activeFileName: string;
  onSelectApplication: (application: SupportTrack) => void;
}) {
  return (
    <aside className="final-application-panel" aria-label="지원 현황 기업 목록">
      <div className="final-application-panel-head">
        <strong>지원 현황</strong>
        <span>{applications.length}</span>
      </div>
      <div className="final-application-list">
        {applications.map((application) => {
          const fileName = buildApplicationFileName(application);
          const active = activeFileName === fileName;

          return (
            <PolarisButton
              key={application.id}
              className={`final-application-item ${active ? 'final-application-item-active' : ''}`}
              aria-current={active ? 'true' : undefined}
              onClick={() => onSelectApplication(application)}
            >
              <span className="final-application-company">{application.company}</span>
              <span className="final-application-meta">{application.role} · {application.deadline}</span>
              <span className="final-application-detail">{application.detail}</span>
            </PolarisButton>
          );
        })}
      </div>
    </aside>
  );
}

function FinalReviewCard({
  checks,
  fileName,
  selectedRestrictionIds,
  restrictionValues,
  reviewStarted,
  onFileSelect,
  onRestrictionToggle,
  onRestrictionValueChange,
  onStartReview
}: {
  checks: SubmissionCheck[];
  fileName: string;
  selectedRestrictionIds: RestrictionId[];
  restrictionValues: Record<RestrictionId, string>;
  reviewStarted: boolean;
  onFileSelect: (fileName: string) => void;
  onRestrictionToggle: (restrictionId: RestrictionId) => void;
  onRestrictionValueChange: (restrictionId: RestrictionId, value: string) => void;
  onStartReview: () => void;
}) {
  const selectedRestrictionCount = selectedRestrictionIds.length;
  const hasFile = Boolean(fileName);
  const canStartReview =
    hasFile &&
    selectedRestrictionIds.length > 0 &&
    selectedRestrictionIds.every((restrictionId) => restrictionValues[restrictionId].trim());

  return (
    <section className={`final-review-card ${hasFile ? 'final-review-card-ready' : 'final-review-card-empty'}`} aria-label="최종 검수">
      <div className="final-review-input-grid">
        <section className="final-flow-section final-file-section" aria-labelledby="final-file-field-title">
          <div className="final-section-heading">
            <h2 id="final-file-field-title">새로운 프로젝트</h2>
            <p>{hasFile ? '선택된 파일을 기준으로 제출 조건을 검수합니다.' : '검수할 최종본을 먼저 선택하세요.'}</p>
          </div>
          <PolarisFileDrop
            label="파일 선택"
            description="pdf · pptx · docx"
            fileName={fileName}
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            onFileSelect={onFileSelect}
          />
          {hasFile && (
            <div className="final-file-summary">
              <span>선택됨</span>
              <strong>{fileName}</strong>
            </div>
          )}
        </section>

        {hasFile && (
          <section className="final-flow-section final-condition-section" aria-labelledby="final-restriction-field-title">
            <div className="final-section-heading final-section-heading-row">
              <div>
                <h2 id="final-restriction-field-title">점검사항</h2>
                <p>검수할 조건을 체크하면 기준 입력란이 열립니다.</p>
              </div>
              <span>{selectedRestrictionCount}개 적용</span>
            </div>

            <div className="final-condition-list">
              {restrictionOptions.map((option) => {
                const checked = selectedRestrictionIds.includes(option.id);

                return (
                  <div className={`final-condition-row ${checked ? 'final-condition-row-active' : ''}`} key={option.id}>
                    <label className="final-condition-check">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onRestrictionToggle(option.id)}
                      />
                      <span>{option.label}</span>
                    </label>
                    {checked && (
                      <input
                        className="text-field final-condition-input"
                        aria-label={`${option.label} 입력`}
                        placeholder={option.placeholder}
                        value={restrictionValues[option.id]}
                        onChange={(event) => onRestrictionValueChange(option.id, event.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {hasFile && reviewStarted && (
        <div className="final-review-result-panel" aria-label="최종 검수 결과">
          <div className="final-result-heading">
            <strong>검수 결과</strong>
            <span>{checks.filter((check) => check.status === 'complete').length}/{checks.length}</span>
          </div>
          <div className="final-result-list">
            {checks.map((check) => (
              <div key={check.id} className="final-result-row">
                <div>
                  <span>{check.label}</span>
                  <p>{check.detail}</p>
                </div>
                <strong className={`check-status ${check.status}`}>{check.text}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasFile && (
        <div className="modal-actions final-review-actions">
        <PolarisButton className="primary-action" disabled={!canStartReview} onClick={onStartReview}>
          <FileSearch size={16} aria-hidden="true" />
          검수 시작
        </PolarisButton>
        </div>
      )}
    </section>
  );
}

function buildSubmissionChecks(
  fileName: string,
  selectedRestrictionIds: RestrictionId[],
  restrictionValues: Record<RestrictionId, string>
): SubmissionCheck[] {
  const selectedRestrictions = restrictionOptions.filter((option) => selectedRestrictionIds.includes(option.id));
  const checks: SubmissionCheck[] = [
    {
      id: 'file',
      label: '첨부 파일',
      status: fileName ? 'complete' : 'warning',
      text: fileName ? '선택 완료' : '파일 필요',
      detail: fileName || '검수할 파일을 먼저 첨부하세요.'
    }
  ];

  if (selectedRestrictions.length === 0) {
    return [
      ...checks,
      {
        id: 'restriction-empty',
        label: '제한 사항',
        status: 'warning',
        text: '선택 필요',
        detail: '검수할 제한 사항을 하나 이상 선택하세요.'
      }
    ];
  }

  return [
    ...checks,
    ...selectedRestrictions.map((restriction) => {
      const restrictionValue = restrictionValues[restriction.id].trim();

      if (!restrictionValue) {
        return {
          id: restriction.id,
          label: restriction.label,
          status: 'warning' as const,
          text: '입력 필요',
          detail: `${restriction.label} 기준을 입력하세요.`
        };
      }

      return buildRestrictionCheck(restriction, restrictionValue, fileName);
    })
  ];
}

function buildRestrictionCheck(restriction: RestrictionOption, value: string, fileName: string): SubmissionCheck {
  if (restriction.id === 'length') {
    const limit = parseFirstNumber(value);
    const passes = Boolean(limit && currentDocumentCharacterCount <= limit);

    return {
      id: restriction.id,
      label: restriction.label,
      status: passes ? 'complete' : 'warning',
      text: !limit ? '기준 확인' : passes ? '통과' : '초과',
      detail: limit
        ? `${currentDocumentCharacterCount.toLocaleString('ko-KR')} / ${limit.toLocaleString('ko-KR')}자`
        : `${value} · 숫자 기준을 포함해 주세요.`
    };
  }

  if (restriction.id === 'questions') {
    const questionCount = value.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean).length;

    return {
      id: restriction.id,
      label: restriction.label,
      status: questionCount > 0 ? 'complete' : 'warning',
      text: questionCount > 0 ? '등록됨' : '확인 필요',
      detail: questionCount > 0 ? `${questionCount}개 필수 문항 기준 입력됨` : '확인할 문항을 입력하세요.'
    };
  }

  if (restriction.id === 'attachments') {
    const fileExtension = getFileExtension(fileName);
    const requiresPdf = value.toLowerCase().includes('pdf');
    const formatMatches = !requiresPdf || fileExtension === 'pdf';
    const passes = Boolean(fileName && formatMatches);

    return {
      id: restriction.id,
      label: restriction.label,
      status: passes ? 'complete' : 'warning',
      text: !fileName ? '파일 필요' : formatMatches ? '통과' : '형식 확인',
      detail: fileName ? `${fileName} · ${value}` : `${value} · 첨부 파일을 선택하세요.`
    };
  }

  const requiresUnderscore = value.includes('_');
  const hasNoSpaces = Boolean(fileName && !/\s/.test(fileName));
  const hasRequiredSeparator = !requiresUnderscore || fileName.includes('_');
  const passes = hasNoSpaces && hasRequiredSeparator;

  return {
    id: restriction.id,
    label: restriction.label,
    status: passes ? 'complete' : 'warning',
    text: !fileName ? '파일 필요' : passes ? '통과' : '수정 필요',
    detail: fileName ? `${fileName} · 기준: ${value}` : `${value} · 파일명 확인을 위해 파일을 첨부하세요.`
  };
}

function parseFirstNumber(value: string) {
  const match = value.replace(/,/g, '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function buildApplicationFileName(application: SupportTrack) {
  return `${application.company}_${application.role}.docx`;
}
