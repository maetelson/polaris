import { useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  Badge,
  Button,
  Input,
  Avatar,
  AvatarFallback,
  FileIcon,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  cn,
} from '@polaris/ui';
import { BellIcon, ChevronRightIcon, DeleteIcon, PlusIcon, SearchIcon, SendIcon } from '@polaris/ui/icons';
import { MoreVertical, Inbox, CheckCircle2, Clock3, Eye, Copy } from 'lucide-react';

type ContractStatus = 'in_progress' | 'completed' | 'expiring' | 'declined';

type Contract = {
  id: string;
  type: 'docx' | 'pdf' | 'hwp';
  title: string;
  counterparty: { name: string; email: string };
  status: ContractStatus;
  sentAt: string;
  dueAt: string;
  signed: number;
  total: number;
};

const CONTRACTS: Contract[] = [
  {
    id: 'PSI-2026-0411',
    type: 'pdf',
    title: '㈜핸디소프트 통합 라이선스 계약서',
    counterparty: { name: '김민호 부장', email: 'minho.kim@handysoft.example' },
    status: 'in_progress',
    sentAt: '2026/04/11',
    dueAt: '2026/04/18',
    signed: 2,
    total: 4,
  },
  {
    id: 'PSI-2026-0408',
    type: 'docx',
    title: '디자인 시스템 컨설팅 위임장',
    counterparty: { name: '이주연 팀장', email: 'jy.lee@orion-design.example' },
    status: 'expiring',
    sentAt: '2026/03/28',
    dueAt: '2026/04/05',
    signed: 1,
    total: 2,
  },
  {
    id: 'PSI-2026-0402',
    type: 'pdf',
    title: 'NDA — 노바 베타 프로그램',
    counterparty: { name: '박상우 이사', email: 'sw.park@inhouse.example' },
    status: 'completed',
    sentAt: '2026/03/20',
    dueAt: '2026/03/27',
    signed: 3,
    total: 3,
  },
  {
    id: 'PSI-2026-0331',
    type: 'docx',
    title: '판매 대리점 협력 계약서 v2',
    counterparty: { name: '신영주 대표', email: 'yj.shin@partner.example' },
    status: 'in_progress',
    sentAt: '2026/03/31',
    dueAt: '2026/04/14',
    signed: 0,
    total: 2,
  },
  {
    id: 'PSI-2026-0322',
    type: 'pdf',
    title: '용역 계약서 — 디자인 가이드 제작',
    counterparty: { name: '권혜린 디렉터', email: 'hr.kwon@studio.example' },
    status: 'declined',
    sentAt: '2026/03/22',
    dueAt: '2026/03/29',
    signed: 0,
    total: 2,
  },
  {
    id: 'PSI-2026-0315',
    type: 'hwp',
    title: '제안서 비밀유지서약 (관공서)',
    counterparty: { name: '문정숙 사무관', email: 'js.moon@gov.example' },
    status: 'completed',
    sentAt: '2026/03/15',
    dueAt: '2026/03/22',
    signed: 2,
    total: 2,
  },
];

const FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'expiring', label: '만료 임박' },
  { value: 'completed', label: '완료' },
  { value: 'declined', label: '거절됨' },
] as const;

export default function SignContractList() {
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  const stats = useMemo(() => {
    const counts = { all: CONTRACTS.length, in_progress: 0, expiring: 0, completed: 0, declined: 0 };
    for (const c of CONTRACTS) counts[c.status]++;
    return counts;
  }, []);

  const visible = useMemo(() => {
    return CONTRACTS.filter((c) => filter === 'all' || c.status === filter).filter((c) =>
      query ? `${c.title} ${c.counterparty.name} ${c.counterparty.email} ${c.id}`.toLowerCase().includes(query.toLowerCase()) : true
    );
  }, [filter, query]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-6">
        <div className="flex items-end justify-between mb-2 flex-wrap gap-3">
          <div>
            <h1 className="text-polaris-heading2 mb-1">전자계약</h1>
            <p className="text-polaris-body2 text-label-neutral">
              발송한 계약서를 한 곳에서 관리하고 서명 현황을 확인하세요.
            </p>
          </div>
          <Button>
            <PlusIcon className="h-4 w-4" aria-hidden="true" /> 새 계약 보내기
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Inbox} label="전체" value={stats.all} tone="neutral" />
        <StatCard icon={Clock3} label="진행 중" value={stats.in_progress} tone="info" />
        <StatCard icon={Clock3} label="만료 임박" value={stats.expiring} tone="warning" />
        <StatCard icon={CheckCircle2} label="완료" value={stats.completed} tone="success" />
      </div>

      {/* SearchIcon + Filter */}
      <Card className="mb-4">
        <CardBody className="!py-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1 min-w-0">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-label-alternative pointer-events-none" aria-hidden="true" />
              <Input
                placeholder="계약명, 거래처, 이메일로 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                containerClassName="flex-1"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {FILTERS.map((f) => {
                const active = filter === f.value;
                const count = f.value === 'all' ? stats.all : stats[f.value as keyof typeof stats];
                return (
                  <Button
                    key={f.value}
                    variant={active ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(f.value)}
                    className={cn(
                      'rounded-polaris-pill whitespace-nowrap',
                      !active && 'bg-fill-neutral hover:bg-fill-neutral hover:text-label-normal'
                    )}
                  >
                    {f.label}
                    <span className={cn('text-polaris-caption1', active ? 'opacity-90' : 'text-label-alternative')}>
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* List */}
      {visible.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <Inbox className="h-10 w-10 text-label-alternative mx-auto mb-3" aria-hidden="true" />
            <p className="text-polaris-body2 text-label-neutral">조건에 맞는 계약서가 없습니다.</p>
          </CardBody>
        </Card>
      ) : (
        <ul className="space-y-2">
          {visible.map((c) => (
            <ContractRow key={c.id} contract={c} />
          ))}
        </ul>
      )}

      <p className="text-polaris-caption1 text-label-alternative mt-6 text-center">
        {visible.length} / {CONTRACTS.length} 건 표시
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  tone: 'neutral' | 'info' | 'warning' | 'success';
}) {
  const toneClasses = {
    neutral: 'bg-fill-neutral text-label-neutral',
    info: 'bg-state-info/15 text-state-info',
    warning: 'bg-state-warning/20 text-state-warning',
    success: 'bg-state-success/15 text-state-success',
  } as const;
  return (
    <Card>
      <CardBody className="!py-4 flex items-center gap-3">
        <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-polaris-md', toneClasses[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="text-polaris-caption1 text-label-alternative">{label}</div>
          <div className="text-polaris-heading3 text-label-normal leading-none mt-0.5">{value}</div>
        </div>
      </CardBody>
    </Card>
  );
}

function ContractRow({ contract: c }: { contract: Contract }) {
  const statusBadge =
    c.status === 'in_progress' ? (
      <Badge variant="info">진행 중</Badge>
    ) : c.status === 'completed' ? (
      <Badge variant="success">완료</Badge>
    ) : c.status === 'expiring' ? (
      <Badge variant="warning">만료 임박</Badge>
    ) : (
      <Badge variant="danger">거절됨</Badge>
    );

  const progress = c.total === 0 ? 0 : Math.round((c.signed / c.total) * 100);
  const progressTone = c.status === 'declined' ? 'bg-state-error' : 'bg-accent-brand-normal';

  return (
    <li>
      <Card className="hover:border-accent-brand-normal transition-colors">
        <CardBody className="!py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <FileIcon type={c.type} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-polaris-body2 font-semibold text-label-normal truncate">{c.title}</span>
                  {statusBadge}
                </div>
                <div className="text-polaris-caption1 text-label-alternative truncate mt-0.5">
                  {c.id} · 발송 {c.sentAt} · 마감 {c.dueAt}
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 shrink-0 w-48 min-w-0">
              <Avatar size="sm">
                <AvatarFallback>{c.counterparty.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-polaris-body2 text-label-normal truncate">{c.counterparty.name}</div>
                <div className="text-polaris-caption1 text-label-alternative truncate">{c.counterparty.email}</div>
              </div>
            </div>

            <div className="hidden md:block shrink-0 w-36">
              <div className="flex items-center justify-between mb-1">
                <span className="text-polaris-caption1 text-label-alternative">서명</span>
                <span className="text-polaris-caption1 text-label-neutral font-medium">
                  {c.signed} / {c.total}
                </span>
              </div>
              <div className="h-1.5 rounded-polaris-pill bg-fill-neutral overflow-hidden">
                <div
                  className={cn('h-full rounded-polaris-pill transition-all', progressTone)}
                  style={{ width: `${progress}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 md:justify-end shrink-0">
              <Button variant="ghost" size="sm">
                보기 <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="더보기">
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => alert(`상세 보기: ${c.id}`)}>
                    <Eye className="h-4 w-4" /> 상세 보기
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => alert(`복제: ${c.id}`)}>
                    <Copy className="h-4 w-4" /> 복제해서 새로 보내기
                  </DropdownMenuItem>
                  {c.status === 'in_progress' && (
                    <DropdownMenuItem onSelect={() => alert(`독촉: ${c.id}`)}>
                      <BellIcon className="h-4 w-4" /> 서명 독촉
                    </DropdownMenuItem>
                  )}
                  {c.status === 'expiring' && (
                    <DropdownMenuItem onSelect={() => alert(`재발송: ${c.id}`)}>
                      <SendIcon className="h-4 w-4" /> 재발송
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onSelect={() => alert(`취소: ${c.id}`)}>
                    <DeleteIcon className="h-4 w-4" /> 계약 취소
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardBody>
      </Card>
    </li>
  );
}
