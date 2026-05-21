import { Link } from 'react-router-dom';
import { Card, CardBody, Badge, cn } from '@polaris/ui';
import { ArrowRightIcon } from '@polaris/ui/icons';
import { Layers, FileText, Mail, Palette, Sparkles, FileSpreadsheet } from 'lucide-react';

const CARDS = [
  {
    to: '/nova',
    icon: Sparkles,
    title: 'NOVA 워크스페이스',
    desc: 'AI 컨텍스트 시연. NovaInput·PromptChip·Select·Tooltip·DropdownMenu가 보라(ai.normal) 톤으로 묶이는 화면',
    badge: 'AI 예시',
    accent: 'secondary' as const,
  },
  {
    to: '/crm/contract',
    icon: FileText,
    title: '폴라리스 영업관리 — 계약 상세',
    desc: 'CRM 화면을 폴라리스 토큰만으로 구성. 상태 타임라인, 결재선, 첨부 파일, 더보기 메뉴까지',
    badge: '업무 예시 1',
    accent: 'primary' as const,
  },
  {
    to: '/sign/contracts',
    icon: Mail,
    title: '폴라리스 사인 — 계약서 목록',
    desc: '전자계약 SaaS의 계약서 관리 화면. 필터·진행률·서명자·행별 액션 메뉴까지 토큰 기반으로 구현',
    badge: '업무 예시 2',
    accent: 'primary' as const,
  },
  {
    to: '/polaris-office',
    icon: FileSpreadsheet,
    title: '폴라리스 오피스 — 워드 리본',
    desc: '@polaris/ui/ribbon으로 재현한 워드 에디터 리본. 5개 탭(홈·삽입·레이아웃·검토·AI 도구)의 그룹·버튼·split·toggle 구성',
    badge: '에디터 예시',
    accent: 'primary' as const,
  },
  {
    to: '/components',
    icon: Layers,
    title: '컴포넌트 카탈로그',
    desc: '37개 컴포넌트(Tier 0 ~ Tier 4)의 모든 variant·상태·조합을 한 페이지에서 확인',
    badge: '레퍼런스',
    accent: 'primary' as const,
  },
] as const;

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="mb-12">
        <Badge variant="secondary" className="mb-4">v0.1.0 · 사내 공개 alpha</Badge>
        <h1 className="text-polaris-title mb-3">
          Polaris Design System
        </h1>
        <p className="text-polaris-body1 text-label-neutral max-w-2xl">
          바이브코딩옵스로 만들어지는 폴라리스 웹 서비스들의 디자인을 일관되게 만드는 시스템.
          토큰·컴포넌트·린트·Claude Code 플러그인까지 묶어서 모델이 우회 못하게 하는 게 목표.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const isAi = card.accent === 'secondary';
          return (
            <Link key={card.to} to={card.to} className="group">
              <Card className={cn(
                'h-full transition-colors group-focus-visible:ring-2',
                isAi
                  ? 'hover:border-ai-normal group-focus-visible:ring-ai-normal'
                  : 'hover:border-accent-brand-normal group-focus-visible:ring-accent-brand-normal'
              )}>
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      'inline-flex h-9 w-9 items-center justify-center rounded-polaris-md',
                      isAi ? 'bg-ai-hover text-ai-normal' : 'bg-accent-brand-normal-subtle text-accent-brand-normal'
                    )}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <Badge variant={isAi ? 'secondary' : 'neutral'}>{card.badge}</Badge>
                  </div>
                  <h3 className="text-polaris-heading4 mb-1.5">{card.title}</h3>
                  <p className="text-polaris-body2 text-label-neutral mb-4">{card.desc}</p>
                  <span className={cn(
                    'inline-flex items-center gap-1 text-polaris-body2',
                    isAi ? 'text-ai-normal' : 'text-accent-brand-normal'
                  )}>
                    살펴보기 <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <Link to="/tokens" className="group">
          <Card className="h-full transition-colors hover:border-accent-brand-normal">
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-polaris-md bg-ai-hover text-ai-normal">
                  <Palette className="h-5 w-5" aria-hidden="true" />
                </span>
                <Badge variant="secondary">Tokens</Badge>
              </div>
              <h3 className="text-polaris-heading4 mb-1.5">디자인 토큰</h3>
              <p className="text-polaris-body2 text-label-neutral mb-4">
                4색 브랜드 팔레트와 NOVA 보라, 뉴트럴, 타이포·반경·그림자까지 한 페이지에서.
              </p>
              <span className="inline-flex items-center gap-1 text-polaris-body2 text-ai-normal">
                토큰 보기 <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </CardBody>
          </Card>
        </Link>

        <Card>
          <CardBody>
            <h3 className="text-polaris-heading4 mb-3">아키텍처</h3>
            <ul className="text-polaris-body2 text-label-neutral space-y-2">
              <li>
                <code className="text-label-normal font-polaris-mono">@polaris/ui</code> — 토큰 + 37개 컴포넌트
              </li>
              <li>
                <code className="text-label-normal font-polaris-mono">@polaris/lint</code> — 4가지 ESLint 룰
              </li>
              <li>
                <code className="text-label-normal font-polaris-mono">polaris-design</code> — Claude Code 플러그인
              </li>
            </ul>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
