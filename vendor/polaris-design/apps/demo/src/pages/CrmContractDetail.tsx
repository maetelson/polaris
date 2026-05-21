import {
  Card,
  CardBody,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  FileCard,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  cn,
} from '@polaris/ui';
import { ChevronRightIcon, DownloadIcon, MessageIcon, PencilLineIcon, SendIcon, UserIcon } from '@polaris/ui/icons';
import { Printer, Building2, Phone, Mail, Calendar, Banknote, FileText, CheckCircle2, Circle, Clock, MoreHorizontal, Copy, Archive, Link2 } from 'lucide-react';
import { useState } from 'react';

type TimelineStatus = 'done' | 'current' | 'pending';

const TIMELINE: { label: string; date?: string; by?: string; status: TimelineStatus }[] = [
  { label: '계약 작성', date: '2026/04/01 10:30', by: '이해석', status: 'done' },
  { label: '내부 검토', date: '2026/04/02 14:12', by: '김지수', status: 'done' },
  { label: '결재 요청', date: '2026/04/03 09:00', by: '이해석', status: 'done' },
  { label: '결재 진행', by: '박상우 (영업이사)', status: 'current' },
  { label: '계약 체결', status: 'pending' },
  { label: '진행 / 종료', status: 'pending' },
];

const ACTIVITY = [
  { who: '김지수', avatar: '김', when: '2026/04/03 09:14', text: '결재 요청을 박상우 이사에게 전달했습니다.' },
  { who: '이해석', avatar: '이', when: '2026/04/02 14:15', text: '검토 완료. 가격 조건 확인 부탁드립니다.' },
  { who: '시스템', avatar: 'S', when: '2026/04/01 10:31', text: '계약 작성이 시작되었습니다.' },
];

export default function CrmContractDetail() {
  const [toastOpen, setToastOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-polaris-body2 text-label-alternative flex items-center gap-1.5 mb-3" aria-label="Breadcrumb">
        <span>영업관리</span>
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        <span>계약</span>
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        <span className="text-label-normal">CTR-2026-0413</span>
      </nav>

      {/* Page header */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 pb-4 border-b border-line-neutral">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="warning">결재 진행</Badge>
            <Badge variant="neutral">신규</Badge>
            <span className="text-polaris-caption1 text-label-alternative">CTR-2026-0413</span>
          </div>
          <h1 className="text-polaris-heading2 mb-1">㈜핸디소프트 통합 라이선스 계약</h1>
          <p className="text-polaris-body2 text-label-neutral">
            2026 회계연도 통합 라이선스 갱신 · 책정 금액 ₩148,500,000
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="tertiary" size="sm">
            <Printer className="h-4 w-4" aria-hidden="true" /> 인쇄
          </Button>
          <Button variant="tertiary" size="sm">
            <PencilLineIcon className="h-4 w-4" aria-hidden="true" /> 수정
          </Button>
          <Button size="sm" onClick={() => setToastOpen(true)}>
            <SendIcon className="h-4 w-4" aria-hidden="true" /> 결재 독촉
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="tertiary" size="sm" aria-label="더보기">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>계약 액션</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => alert('계약 복제')}>
                <Copy className="h-4 w-4" /> 계약 복제
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => alert('첨부 일괄 다운로드')}>
                <DownloadIcon className="h-4 w-4" /> 첨부 일괄 다운로드
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => alert('공유 링크 복사')}>
                <Link2 className="h-4 w-4" /> 공유 링크 복사
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => alert('보관 처리')}>
                <Archive className="h-4 w-4" /> 보관 처리
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main */}
        <div className="lg:col-span-2 space-y-6">
          {/* 계약 정보 */}
          <Card>
            <CardBody>
              <h2 className="text-polaris-heading4 mb-4">계약 정보</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <Field icon={FileText} label="계약 유형" value="라이선스 / 연간" />
                <Field icon={Calendar} label="계약 기간" value="2026-05-01 ~ 2027-04-30" />
                <Field icon={Banknote} label="계약 금액" value="₩148,500,000 (VAT 별도)" />
                <Field icon={Calendar} label="결제 조건" value="분기 선납 / 4회 분할" />
                <Field icon={UserIcon} label="영업 담당" value="이해석" />
                <Field icon={UserIcon} label="검토 담당" value="김지수 (계약법무팀)" />
              </dl>
            </CardBody>
          </Card>

          {/* 거래처 */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-polaris-heading4">거래처</h2>
                <Button variant="ghost" size="sm">상세</Button>
              </div>
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-polaris-md bg-accent-brand-normal-subtle text-accent-brand-normal shrink-0">
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <div className="text-polaris-body1 font-semibold">㈜핸디소프트</div>
                  <div className="text-polaris-body2 text-label-neutral mb-3">대규모 SI · 임직원 약 1,200명 · 사업자번호 220-81-XXXXX</div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-polaris-body2 text-label-neutral">
                    <span className="inline-flex items-center gap-1.5"><UserIcon className="h-4 w-4" aria-hidden="true" /> 김민호 부장 (구매팀)</span>
                    <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" aria-hidden="true" /> 02-1234-5678</span>
                    <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" aria-hidden="true" /> minho.kim@handysoft.example</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 상태 타임라인 */}
          <Card>
            <CardBody>
              <h2 className="text-polaris-heading4 mb-4">결재 / 진행 상태</h2>
              <ol className="space-y-0">
                {TIMELINE.map((step, i) => (
                  <TimelineRow key={step.label} step={step} isLast={i === TIMELINE.length - 1} />
                ))}
              </ol>
            </CardBody>
          </Card>

          {/* 활동 이력 (Tabs) */}
          <Card>
            <CardBody>
              <Tabs defaultValue="activity">
                <TabsList>
                  <TabsTrigger value="activity">활동 이력</TabsTrigger>
                  <TabsTrigger value="comments">코멘트</TabsTrigger>
                  <TabsTrigger value="related">연관 계약</TabsTrigger>
                </TabsList>
                <TabsContent value="activity">
                  <ul className="space-y-4 mt-2">
                    {ACTIVITY.map((a, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Avatar size="sm"><AvatarFallback>{a.avatar}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-polaris-body2 font-semibold">{a.who}</span>
                            <span className="text-polaris-caption1 text-label-alternative">{a.when}</span>
                          </div>
                          <p className="text-polaris-body2 text-label-neutral mt-0.5">{a.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="comments">
                  <div className="text-polaris-body2 text-label-alternative mt-2 flex items-center gap-2">
                    <MessageIcon className="h-4 w-4" aria-hidden="true" /> 아직 코멘트가 없습니다.
                  </div>
                </TabsContent>
                <TabsContent value="related">
                  <div className="text-polaris-body2 text-label-alternative mt-2">연관 계약 0건</div>
                </TabsContent>
              </Tabs>
            </CardBody>
          </Card>
        </div>

        {/* Right side */}
        <aside className="space-y-6">
          {/* 결재선 */}
          <Card>
            <CardBody>
              <h2 className="text-polaris-heading4 mb-4">결재선</h2>
              <ul className="space-y-3">
                <ApproverRow name="이해석" role="기안자 · 영업1팀" status="done" />
                <ApproverRow name="김지수" role="검토 · 계약법무팀" status="done" />
                <ApproverRow name="박상우" role="결재 · 영업이사" status="current" />
                <ApproverRow name="최현지" role="최종 · 대표이사" status="pending" />
              </ul>
            </CardBody>
          </Card>

          {/* 첨부 파일 */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-polaris-heading4">첨부 파일</h2>
                <Badge variant="neutral">5</Badge>
              </div>
              <div className="space-y-2">
                <FileCard type="docx" name="계약서_초안_v3.docx" meta="2.1 MB" />
                <FileCard type="pdf" name="기존_계약서_2025.pdf" meta="876 KB" />
                <FileCard type="xlsx" name="라이선스_산출내역.xlsx" meta="142 KB" />
                <FileCard type="pptx" name="제안_요약.pptx" meta="3.4 MB" />
                <FileCard type="hwp" name="법무_검토의견.hwp" meta="98 KB" trailing={<Badge variant="info">신규</Badge>} />
              </div>
            </CardBody>
          </Card>

          {/* 위험 액션 */}
          <Card>
            <CardBody>
              <h2 className="text-polaris-heading4 mb-3">계약 종료</h2>
              <p className="text-polaris-body2 text-label-neutral mb-4">
                계약을 취소하거나 폐기합니다. 결재가 진행 중이면 결재선에도 통보됩니다.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="danger" size="sm" className="w-full">계약 취소 요청</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>이 계약을 취소할까요?</DialogTitle>
                    <DialogDescription>
                      취소하면 결재가 즉시 중단되고 거래처 담당자에게 알림이 전송됩니다. 이 작업은 되돌릴 수 없습니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="tertiary">취소</Button>
                    </DialogClose>
                    <Button variant="danger">계약 취소</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardBody>
          </Card>
        </aside>
      </div>

      {toastOpen && (
        <Toast variant="info" duration={3500} onOpenChange={(o) => !o && setToastOpen(false)}>
          <div className="flex flex-col gap-0.5 flex-1">
            <ToastTitle>결재 독촉 알림이 전송되었습니다</ToastTitle>
            <ToastDescription>박상우 이사에게 메일과 사내 메신저로 알림</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      )}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  // ElementType wide enough to accept both lucide and @polaris/ui/icons
  // — both render with `className` + `aria-hidden` so the call site stays
  // identical regardless of source.
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-polaris-caption1 text-label-alternative flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-polaris-body2 text-label-normal font-medium">{value}</dd>
    </div>
  );
}

function TimelineRow({ step, isLast }: { step: typeof TIMELINE[number]; isLast: boolean }) {
  const Icon = step.status === 'done' ? CheckCircle2 : step.status === 'current' ? Clock : Circle;
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-polaris-pill',
            step.status === 'done' && 'bg-state-success/15 text-state-success',
            step.status === 'current' && 'bg-state-warning/20 text-state-warning',
            step.status === 'pending' && 'bg-fill-neutral text-label-alternative'
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        {!isLast && <span className="w-px flex-1 bg-line-neutral my-1" />}
      </div>
      <div className={cn('pb-5 flex-1', isLast && 'pb-0')}>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-polaris-body2 font-semibold',
              step.status === 'pending' ? 'text-label-alternative' : 'text-label-normal'
            )}
          >
            {step.label}
          </span>
          {step.status === 'current' && <Badge variant="warning">진행 중</Badge>}
        </div>
        {(step.date || step.by) && (
          <div className="text-polaris-caption1 text-label-alternative mt-0.5">
            {step.date && <span>{step.date}</span>}
            {step.date && step.by && <span> · </span>}
            {step.by && <span>{step.by}</span>}
          </div>
        )}
      </div>
    </li>
  );
}

function ApproverRow({
  name,
  role,
  status,
}: {
  name: string;
  role: string;
  status: TimelineStatus;
}) {
  return (
    <li className="flex items-center gap-3">
      <Avatar size="sm">
        <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-polaris-body2 font-medium text-label-normal truncate">{name}</div>
        <div className="text-polaris-caption1 text-label-alternative truncate">{role}</div>
      </div>
      {status === 'done' && <Badge variant="success">완료</Badge>}
      {status === 'current' && <Badge variant="warning">진행</Badge>}
      {status === 'pending' && <Badge variant="neutral">대기</Badge>}
    </li>
  );
}
