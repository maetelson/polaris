import { useState } from 'react';
import { PolarisButton, PolarisFileDrop } from './polaris-controls';

type SubmissionCheck = {
  id: string;
  label: string;
  status: 'complete' | 'warning';
  text: string;
};

const initialChecks: SubmissionCheck[] = [
  { id: 'length', label: '글자 수 제한', status: 'complete', text: '완료' },
  { id: 'questions', label: '필수 문항', status: 'complete', text: '완료' },
  { id: 'attachments', label: '첨부 파일', status: 'complete', text: '완료' },
  { id: 'filename', label: '파일명 규칙', status: 'warning', text: '수정 필요' }
];

const finalNotice = '검수 대기';

export function FinalRoom() {
  const [finalFileName, setFinalFileName] = useState('');
  const [submissionChecks, setSubmissionChecks] = useState<SubmissionCheck[]>(initialChecks);

  const completedChecks = submissionChecks.filter((check) => check.status === 'complete').length;
  const completionRate = Math.round((completedChecks / submissionChecks.length) * 100);

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

  return (
    <section className="career-pass final-room" aria-labelledby="final-room-title">
      <div className="career-pass-heading">
        <h1 id="final-room-title">파이널룸</h1>
        <span className="status-pill">{finalNotice} · {completionRate}%</span>
      </div>

      <FinalReviewCard
        checks={submissionChecks}
        fileName={finalFileName}
        notice={finalNotice}
        completionRate={completionRate}
        onFileSelect={setFinalFileName}
        onToggleCheck={toggleSubmissionCheck}
      />
    </section>
  );
}

function FinalReviewCard({
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
      <p className="state-note">
        {notice} · {completionRate}%
      </p>
    </section>
  );
}
