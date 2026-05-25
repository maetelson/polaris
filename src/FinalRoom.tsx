import { useEffect, useState } from 'react';
import { Archive, FileSearch, X } from 'lucide-react';
import { PolarisButton, PolarisFileDrop } from './polaris-controls';
import type { SupportTrack } from './CareerPass';

type RestrictionId =
  | 'length'
  | 'questions'
  | 'attachments'
  | 'filename'
  | 'slideCount'
  | 'template'
  | 'speakerNotes'
  | 'pdfPages'
  | 'pdfSecurity'
  | 'docxStyle'
  | 'docxTrackChanges';

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

type FinalFileType = 'ppt' | 'docx' | 'pdf' | 'other';

type FinalFileState = {
  id: string;
  fileName: string;
  selectedRestrictionIds: RestrictionId[];
  restrictionValues: Record<RestrictionId, string>;
  submissionChecks: SubmissionCheck[];
  reviewStarted: boolean;
};

type FinalProject = {
  id: string;
  title: string;
  status: string;
  detail: string;
  fileName: string;
};

const commonRestrictionOptions: RestrictionOption[] = [
  {
    id: 'filename',
    label: '파일명 규칙',
    placeholder: '예: 이름_직무_지원서.pdf'
  },
  {
    id: 'attachments',
    label: '첨부 파일 조건',
    placeholder: '예: PDF 필수, 20MB 이하'
  }
];

const restrictionOptionsByType: Record<FinalFileType, RestrictionOption[]> = {
  ppt: [
    {
      id: 'slideCount',
      label: '슬라이드 수',
      placeholder: '예: 20장 이하'
    },
    {
      id: 'template',
      label: '템플릿 준수',
      placeholder: '예: 회사 양식, 16:9 비율, 폰트 포함'
    },
    {
      id: 'speakerNotes',
      label: '발표 노트',
      placeholder: '예: 핵심 슬라이드 발표 노트 포함'
    },
    ...commonRestrictionOptions
  ],
  docx: [
    {
      id: 'length',
      label: '글자 수 제한',
      placeholder: '예: 1,000자 이내'
    },
    {
      id: 'questions',
      label: '필수 문항',
      placeholder: '예: 지원 동기, 직무 경험, 입사 후 계획'
    },
    {
      id: 'docxStyle',
      label: '문서 서식',
      placeholder: '예: 맑은 고딕 11pt, 줄간격 160%'
    },
    {
      id: 'docxTrackChanges',
      label: '변경 내용 정리',
      placeholder: '예: 메모/변경 내용 제거'
    },
    ...commonRestrictionOptions
  ],
  pdf: [
    {
      id: 'pdfPages',
      label: '페이지 수',
      placeholder: '예: 5페이지 이하'
    },
    {
      id: 'pdfSecurity',
      label: 'PDF 보안',
      placeholder: '예: 암호 없음, 복사 가능'
    },
    {
      id: 'attachments',
      label: '첨부 파일 조건',
      placeholder: '예: PDF 단일 파일, 20MB 이하'
    },
    {
      id: 'filename',
      label: '파일명 규칙',
      placeholder: '예: 이름_직무_최종본.pdf'
    }
  ],
  other: [
    {
      id: 'filename',
      label: '파일명 규칙',
      placeholder: '예: 이름_직무_최종본'
    },
    {
      id: 'attachments',
      label: '첨부 파일 조건',
      placeholder: '예: 제출 가능 확장자, 20MB 이하'
    }
  ]
};

const currentDocumentCharacterCount = 862;
const finalProjects: FinalProject[] = [
  {
    id: 'portfolio-package',
    title: '포트폴리오 제출 패키지',
    status: '최종 검수 중',
    detail: 'PDF 포트폴리오와 DOCX 자기소개서를 함께 점검',
    fileName: 'portfolio_package.pdf'
  },
  {
    id: 'interview-deck',
    title: '면접 발표 자료',
    status: '제출 전 확인',
    detail: 'PPT 발표본, 발표 노트, 회사 템플릿 조건 검수',
    fileName: 'interview_presentation.pptx'
  },
  {
    id: 'application-docs',
    title: '입사지원 문서 묶음',
    status: '조건 입력 필요',
    detail: '지원서, 경력기술서, PDF 변환본 검수',
    fileName: 'application_documents.docx'
  }
];
const emptyRestrictionValues = {
  length: '',
  questions: '',
  attachments: '',
  filename: '',
  slideCount: '',
  template: '',
  speakerNotes: '',
  pdfPages: '',
  pdfSecurity: '',
  docxStyle: '',
  docxTrackChanges: ''
} satisfies Record<RestrictionId, string>;

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
  const [files, setFiles] = useState<FinalFileState[]>(() => (handoff?.fileName ? [createFinalFileState(handoff.fileName)] : []));
  const [activeFileId, setActiveFileId] = useState(files[0]?.id ?? '');

  useEffect(() => {
    if (!handoff?.fileName) {
      return;
    }

    const file = createFinalFileState(handoff.fileName);
    setFiles([file]);
    setActiveFileId(file.id);
  }, [handoff?.fileName, handoff?.submittedAt]);

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0] ?? null;
  const activeFileName = activeFile?.fileName ?? '';

  const addFiles = (fileNames: string[]) => {
    const incomingFiles = fileNames.map(createFinalFileState);

    setFiles((currentFiles) => [...currentFiles, ...incomingFiles]);

    if (incomingFiles[0]) {
      setActiveFileId(incomingFiles[0].id);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((currentFiles) => {
      const nextFiles = currentFiles.filter((file) => file.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(nextFiles[0]?.id ?? '');
      }
      return nextFiles;
    });
  };

  const updateActiveFile = (updater: (file: FinalFileState) => FinalFileState) => {
    if (!activeFile) {
      return;
    }

    setFiles((currentFiles) => currentFiles.map((file) => (file.id === activeFile.id ? updater(file) : file)));
  };

  const updateRestrictionValue = (restrictionId: RestrictionId, value: string) => {
    updateActiveFile((file) => ({
      ...file,
      restrictionValues: { ...file.restrictionValues, [restrictionId]: value },
      reviewStarted: false
    }));
  };

  const toggleRestrictionSelection = (restrictionId: RestrictionId) => {
    updateActiveFile((file) => ({
      ...file,
      selectedRestrictionIds: file.selectedRestrictionIds.includes(restrictionId)
        ? file.selectedRestrictionIds.filter((id) => id !== restrictionId)
        : [...file.selectedRestrictionIds, restrictionId],
      reviewStarted: false
    }));
  };

  const selectApplicationForReview = (application: SupportTrack) => {
    addFiles([buildApplicationFileName(application)]);
  };

  const startReview = () => {
    updateActiveFile((file) => ({
      ...file,
      submissionChecks: buildSubmissionChecks(file),
      reviewStarted: true
    }));
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
          activeFileName={activeFileName}
          projects={finalProjects}
          onSelectApplication={selectApplicationForReview}
          onSelectProject={(project) => addFiles([project.fileName])}
        />
        <FinalReviewCard
          activeFile={activeFile}
          files={files}
          onFilesSelect={addFiles}
          onFileSelect={setActiveFileId}
          onFileRemove={removeFile}
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
  projects,
  onSelectApplication,
  onSelectProject
}: {
  applications: SupportTrack[];
  activeFileName: string;
  projects: FinalProject[];
  onSelectApplication: (application: SupportTrack) => void;
  onSelectProject: (project: FinalProject) => void;
}) {
  const [showApplications, setShowApplications] = useState(false);

  return (
    <aside className="final-application-panel" aria-label="진행 중인 프로젝트 목록">
      <div className="final-application-panel-head">
        <strong>진행 중인 프로젝트</strong>
        <span>{projects.length}</span>
      </div>
      <div className="final-application-list">
        {projects.map((project) => {
          const active = activeFileName === project.fileName;

          return (
            <PolarisButton
              key={project.id}
              className={`final-application-item ${active ? 'final-application-item-active' : ''}`}
              aria-current={active ? 'true' : undefined}
              onClick={() => onSelectProject(project)}
            >
              <span className="final-application-company">{project.title}</span>
              <span className="final-application-meta">{project.status}</span>
              <span className="final-application-detail">{project.detail}</span>
            </PolarisButton>
          );
        })}
      </div>

      <PolarisButton className="secondary-action compact-action final-load-applications" onClick={() => setShowApplications((visible) => !visible)}>
        지원현황 불러오기
      </PolarisButton>

      {showApplications && (
        <div className="final-support-panel" aria-label="불러온 지원 현황">
          <div className="final-support-panel-head">
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
                  className={`final-application-item final-support-item ${active ? 'final-application-item-active' : ''}`}
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
        </div>
      )}
    </aside>
  );
}

function FinalReviewCard({
  activeFile,
  files,
  onFilesSelect,
  onFileSelect,
  onFileRemove,
  onRestrictionToggle,
  onRestrictionValueChange,
  onStartReview
}: {
  activeFile: FinalFileState | null;
  files: FinalFileState[];
  onFilesSelect: (fileNames: string[]) => void;
  onFileSelect: (fileId: string) => void;
  onFileRemove: (fileId: string) => void;
  onRestrictionToggle: (restrictionId: RestrictionId) => void;
  onRestrictionValueChange: (restrictionId: RestrictionId, value: string) => void;
  onStartReview: () => void;
}) {
  const hasFile = Boolean(activeFile);
  const fileType = activeFile ? getFinalFileType(activeFile.fileName) : 'other';
  const restrictionOptions = restrictionOptionsByType[fileType];
  const selectedRestrictionCount = activeFile?.selectedRestrictionIds.length ?? 0;
  const canStartReview = activeFile
    ? selectedRestrictionCount > 0 &&
      activeFile.selectedRestrictionIds.every((restrictionId) => activeFile.restrictionValues[restrictionId].trim())
    : false;

  return (
    <section className={`final-review-card ${hasFile ? 'final-review-card-ready' : 'final-review-card-empty'}`} aria-label="최종 검수">
      <div className="final-review-input-grid">
        <section className="final-flow-section final-file-section" aria-labelledby="final-file-field-title">
          <div className="final-section-heading">
            <h2 id="final-file-field-title">새로운 프로젝트</h2>
            <p>{hasFile ? '파일을 선택하면 해당 파일 전용 검수 조건을 설정합니다.' : '검수할 최종본을 먼저 선택하세요.'}</p>
          </div>
          <PolarisFileDrop
            label="파일 선택"
            description="pdf · pptx · docx 여러 개 선택 가능"
            fileName={files.length > 0 ? `${files.length}개 파일` : undefined}
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            multiple
            onFilesSelect={onFilesSelect}
          />
          {files.length > 0 && (
            <div className="final-file-list" aria-label="검수 파일 목록">
              {files.map((file) => {
                const active = activeFile?.id === file.id;
                const type = getFinalFileType(file.fileName).toUpperCase();

                return (
                  <div className={`final-file-item ${active ? 'final-file-item-active' : ''}`} key={file.id}>
                    <PolarisButton
                      className="final-file-select"
                      aria-pressed={active}
                      onClick={() => onFileSelect(file.id)}
                    >
                      <span>{type}</span>
                      <strong>{file.fileName}</strong>
                      <small>{file.reviewStarted ? `${file.submissionChecks.filter((check) => check.status === 'complete').length}/${file.submissionChecks.length} 통과` : '검수 대기'}</small>
                    </PolarisButton>
                    <PolarisButton
                      className="icon-button final-file-remove"
                      aria-label={`${file.fileName} 삭제`}
                      onClick={() => onFileRemove(file.id)}
                    >
                      <X size={15} aria-hidden="true" />
                    </PolarisButton>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {activeFile && (
          <section className="final-flow-section final-condition-section" aria-labelledby="final-restriction-field-title">
            <div className="final-section-heading final-section-heading-row">
              <div>
                <h2 id="final-restriction-field-title">{getFinalFileTypeLabel(fileType)} 검수 목록</h2>
                <p>{activeFile.fileName}에만 적용되는 검수 조건입니다.</p>
              </div>
              <span>{selectedRestrictionCount}개 적용</span>
            </div>

            <div className="final-condition-list">
              {restrictionOptions.map((option) => {
                const checked = activeFile.selectedRestrictionIds.includes(option.id);

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
                        value={activeFile.restrictionValues[option.id]}
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

      {activeFile?.reviewStarted && (
        <div className="final-review-result-panel" aria-label="최종 검수 결과">
          <div className="final-result-heading">
            <strong>{activeFile.fileName} 검수 결과</strong>
            <span>{activeFile.submissionChecks.filter((check) => check.status === 'complete').length}/{activeFile.submissionChecks.length}</span>
          </div>
          <div className="final-result-list">
            {activeFile.submissionChecks.map((check) => (
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

      {activeFile && (
        <div className="modal-actions final-review-actions">
          {activeFile.reviewStarted ? (
            <PolarisButton className="primary-action">
              <Archive size={16} aria-hidden="true" />
              zip 파일로 내보내기
            </PolarisButton>
          ) : (
            <PolarisButton className="primary-action" disabled={!canStartReview} onClick={onStartReview}>
              <FileSearch size={16} aria-hidden="true" />
              검수 시작
            </PolarisButton>
          )}
        </div>
      )}
    </section>
  );
}

function buildSubmissionChecks(file: FinalFileState): SubmissionCheck[] {
  const fileType = getFinalFileType(file.fileName);
  const options = restrictionOptionsByType[fileType];
  const selectedRestrictions = options.filter((option) => file.selectedRestrictionIds.includes(option.id));
  const checks: SubmissionCheck[] = [
    {
      id: 'file',
      label: '첨부 파일',
      status: file.fileName ? 'complete' : 'warning',
      text: file.fileName ? '선택 완료' : '파일 필요',
      detail: file.fileName || '검수할 파일을 먼저 첨부하세요.'
    },
    {
      id: 'file-type',
      label: '파일 유형',
      status: fileType === 'other' ? 'warning' : 'complete',
      text: getFinalFileTypeLabel(fileType),
      detail: `${file.fileName} · ${getFinalFileTypeLabel(fileType)} 전용 검수 목록 적용`
    }
  ];

  if (selectedRestrictions.length === 0) {
    return [
      ...checks,
      {
        id: 'restriction-empty',
        label: '검수 조건',
        status: 'warning',
        text: '선택 필요',
        detail: '검수할 조건을 하나 이상 선택하세요.'
      }
    ];
  }

  return [
    ...checks,
    ...selectedRestrictions.map((restriction) => {
      const restrictionValue = file.restrictionValues[restriction.id].trim();

      if (!restrictionValue) {
        return {
          id: restriction.id,
          label: restriction.label,
          status: 'warning' as const,
          text: '입력 필요',
          detail: `${restriction.label} 기준을 입력하세요.`
        };
      }

      return buildRestrictionCheck(restriction, restrictionValue, file.fileName);
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
    const questionCount = value.split(/[,·\n]/).map((item) => item.trim()).filter(Boolean).length;

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

    return {
      id: restriction.id,
      label: restriction.label,
      status: formatMatches ? 'complete' : 'warning',
      text: formatMatches ? '통과' : '형식 확인',
      detail: `${fileName} · ${value}`
    };
  }

  if (restriction.id === 'filename') {
    const requiresUnderscore = value.includes('_');
    const hasNoSpaces = Boolean(fileName && !/\s/.test(fileName));
    const hasRequiredSeparator = !requiresUnderscore || fileName.includes('_');
    const passes = hasNoSpaces && hasRequiredSeparator;

    return {
      id: restriction.id,
      label: restriction.label,
      status: passes ? 'complete' : 'warning',
      text: passes ? '통과' : '수정 필요',
      detail: `${fileName} · 기준: ${value}`
    };
  }

  if (restriction.id === 'slideCount' || restriction.id === 'pdfPages') {
    const limit = parseFirstNumber(value);
    return {
      id: restriction.id,
      label: restriction.label,
      status: limit ? 'complete' : 'warning',
      text: limit ? '기준 등록' : '기준 확인',
      detail: limit ? `${limit}개 이하 기준 적용` : `${value} · 숫자 기준을 포함해 주세요.`
    };
  }

  return {
    id: restriction.id,
    label: restriction.label,
    status: value ? 'complete' : 'warning',
    text: value ? '기준 등록' : '입력 필요',
    detail: `${fileName} · ${value}`
  };
}

function createFinalFileState(fileName: string): FinalFileState {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`,
    fileName,
    selectedRestrictionIds: [],
    restrictionValues: { ...emptyRestrictionValues },
    submissionChecks: [],
    reviewStarted: false
  };
}

function parseFirstNumber(value: string) {
  const match = value.replace(/,/g, '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function getFinalFileType(fileName: string): FinalFileType {
  const extension = getFileExtension(fileName);

  if (extension === 'ppt' || extension === 'pptx') {
    return 'ppt';
  }

  if (extension === 'doc' || extension === 'docx') {
    return 'docx';
  }

  if (extension === 'pdf') {
    return 'pdf';
  }

  return 'other';
}

function getFinalFileTypeLabel(fileType: FinalFileType) {
  if (fileType === 'ppt') {
    return 'PPT';
  }

  if (fileType === 'docx') {
    return 'DOCX';
  }

  if (fileType === 'pdf') {
    return 'PDF';
  }

  return '기타 파일';
}

function buildApplicationFileName(application: SupportTrack) {
  return `${application.company}_${application.role}.docx`;
}
