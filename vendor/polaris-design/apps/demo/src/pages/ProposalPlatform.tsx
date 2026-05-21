/**
 * 제안서 플랫폼 — Polaris signature 브랜드 자산을 적극적으로 노출하는
 * 데모 페이지. 외부 사이트 검수(2026-05-08, kcas-platform.vercel.app /
 * jane-h-oh.github.io/design-test) 결과 "Polaris 토큰을 load만 하고
 * 실제 사용은 Tailwind 기본 컴포넌트만 쓰는" 패턴이 반복 발견됨 — 시각
 * 정체성이 안 드러나는 문제.
 *
 * 이 페이지는 GovChance 스타일의 R&D 제안서 작성 플랫폼을 동일 도메인
 * 으로 재현하되, Polaris가 시장에서 (거의) 유일하게 갖는 자산들을 모두
 * 적용한 "참고 구현"이다:
 *
 *   1. <PolarisLogo>            — Footer 브랜드 마크
 *   2. <NovaLogo> + AI Purple   — 공고문 분석 / 초안 자동 작성 CTA
 *   3. <FileIcon type="hwp|docx|pdf"> — STEP 05 파일 형식
 *   4. <Button variant="ai">    — NOVA AI 기능 CTA (Purple 그라디언트)
 *   5. <PromptChip>             — Coverage 분야 칩
 *   6. <Ribbon> 미니 미리보기   — 문서 편집 핵심 자산
 *   7. NOVA 그라디언트 텍스트   — Hero 헤드라인 강조
 *   8. 사이드바 active 패턴은 Layout.tsx에서 이미 적용됨
 *
 * 외부 컨슈머에게 "이 페이지처럼 Polaris를 쓰면 된다"는 참고 구현으로
 * 공유 가능. 시각 정체성이 약한 사이트의 마이그레이션 가이드 역할도.
 */
import { useState, type CSSProperties } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FileIcon,
  PromptChip,
  cn,
} from '@polaris/ui';
import { NovaLogo, PolarisLogo } from '@polaris/ui/logos';
import {
  Ribbon,
  RibbonTabs,
  RibbonTabList,
  RibbonTab,
  RibbonContent,
  RibbonGroup,
  RibbonStack,
  RibbonRow,
  RibbonRowDivider,
  RibbonButton,
  RibbonToggleGroup,
  RibbonToggleItem,
} from '@polaris/ui/ribbon';
import {
  BoldIcon, ItalicIcon, Underline01Icon as UnderlineIcon,
  FontSizeLargeIcon, FontSizeSmallIcon,
  AlignLeftIcon, AlignCenterIcon, AlignRightIcon, JustifyIcon,
  ClearFormatIcon, PasteIcon, FindIcon, TextReplaceIcon,
  AiWriteIcon, AiChatIcon,
} from '@polaris/ui/ribbon-icons';
import {
  ArrowRightIcon, CheckIcon,
} from '@polaris/ui/icons';

/* ================================================================== *
 * Hero — NOVA 그라디언트 타이틀 + AI CTA + Tertiary CTA
 * ================================================================== */

/** NOVA 그라디언트 텍스트 — DESIGN.md §4 NOVA spec(`#9D75EC → #6F3AD0`).
 *  Tailwind preset의 `purple-40` (`#9D75EC`) → `purple-50` (`#6F3AD0` =
 *  `ai-normal`)이라 클래스로 깔끔하게 표현. */
const NOVA_GRADIENT_STYLE: CSSProperties = {
  backgroundImage:
    'linear-gradient(135deg, var(--polaris-purple-40), var(--polaris-ai-normal))',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

function Hero() {
  return (
    <header className="relative">
      {/* 우측 상단 stats — GovChance 레퍼런스의 "14 작성 중 / 5 등록된 양식" */}
      <div className="absolute top-0 right-0 hidden md:flex gap-polaris-2xl">
        <Stat value="14" label="작성 중" />
        <Stat value="5"  label="등록된 양식" tone="ai" />
      </div>

      <div className="text-polaris-caption1 text-label-alternative tracking-widest uppercase mb-polaris-md">
        국책과제 · R&amp;D 제안서 작성 플랫폼
      </div>

      <h1 className="text-polaris-display font-bold text-label-normal leading-tight mb-polaris-lg">
        공고문 하나로,<br />
        <span style={NOVA_GRADIENT_STYLE}>AI가 제안서 작성</span>까지
      </h1>

      <p className="text-polaris-body1 text-label-neutral max-w-2xl mb-polaris-2xl">
        공고문 분석 · 항목별 초안 · 검토·편집 · 최종 문서 생성을 하나의 워크스페이스에서.
        NOVA AI가 제안서 작성의 모든 단계를 함께 합니다.
      </p>

      <div className="flex flex-wrap gap-polaris-xs">
        {/* AI variant — NOVA Purple 솔리드 + NovaLogo. 다른 제안서 플랫폼들과
            가장 명확하게 차별되는 한 줄. */}
        <Button variant="ai" size="lg" className="gap-polaris-2xs">
          <NovaLogo tone="white" size={20} />
          공고문 분석하기
        </Button>
        <Button variant="tertiary" size="lg">
          바로 작성하기
        </Button>
      </div>
    </header>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone?: 'ai' }) {
  return (
    <div className="text-right">
      <div
        className={cn(
          'text-polaris-display font-bold leading-none',
          tone === 'ai' ? '' : 'text-label-normal'
        )}
        style={tone === 'ai' ? NOVA_GRADIENT_STYLE : undefined}
      >
        {value}
      </div>
      <div className="text-polaris-caption1 text-label-alternative mt-polaris-2xs">
        {label}
      </div>
    </div>
  );
}

/* ================================================================== *
 * Workflow — 5 step cards
 *   STEP 04 (초안 자동 작성)   = NOVA Purple accent + AiWriteIcon
 *   STEP 05 (문서 생성)        = FileIcon trio (hwp / docx / pdf)
 * ================================================================== */

function Workflow() {
  const steps: WorkflowStep[] = [
    {
      no: '01',
      title: '공고 분석',
      desc: '평가기준 · 배점 파악',
      tag: { label: '선택', tone: 'neutral' as const },
    },
    {
      no: '02',
      title: '양식 등록',
      desc: '제출 양식 파일 등록',
    },
    {
      no: '03',
      title: '내용 입력',
      desc: '항목별 핵심 정보 입력',
    },
    {
      no: '04',
      title: '초안 자동 작성',
      desc: '항목별 초안 생성·편집',
      // ← 이 카드만 NOVA 색
      tone: 'ai' as const,
      icon: <AiWriteIcon size={32} />,
      tag: { label: 'NOVA', tone: 'ai' as const },
    },
    {
      no: '05',
      title: '문서 생성',
      desc: 'HWP·DOCX·PDF 다운로드',
      // ← FileIcon trio. GovChance는 텍스트만 있어 평범했음.
      icon: (
        <div className="flex items-end gap-polaris-3xs -mb-polaris-3xs">
          <FileIcon type="hwp" size={32} />
          <FileIcon type="docx" size={32} />
          <FileIcon type="pdf" size={32} />
        </div>
      ),
    },
  ];
  return (
    <Section eyebrow="WORKFLOW" title="작성 진행 단계" desc="공고문 분석부터 최종 문서까지 다섯 단계">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-polaris-sm">
        {steps.map((s) => (
          <WorkflowCard key={s.no} {...s} />
        ))}
      </div>
    </Section>
  );
}

interface WorkflowStep {
  no: string;
  title: string;
  desc: string;
  tone?: 'ai';
  icon?: React.ReactNode;
  tag?: { label: string; tone: 'neutral' | 'ai' };
}

function WorkflowCard({ no, title, desc, tone, icon, tag }: WorkflowStep) {
  const isAi = tone === 'ai';
  return (
    <Card
      className={cn(
        'transition-shadow hover:shadow-polaris-sm',
        // NOVA step만 brand-tinted background — 나머지는 기본 surface
        isAi && 'border-ai-normal/30 bg-ai-hover/40'
      )}
    >
      <CardBody className="space-y-polaris-2xs">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-polaris-caption1 tracking-widest uppercase',
              isAi ? 'text-ai-normal' : 'text-label-alternative'
            )}
          >
            STEP {no}
          </span>
          {tag && (
            <Badge variant={tag.tone === 'ai' ? 'secondary' : 'neutral'}>
              {tag.label}
            </Badge>
          )}
        </div>
        <h3 className={cn(
          'text-polaris-heading4 font-bold',
          isAi ? 'text-ai-strong' : 'text-label-normal'
        )}>
          {title}
        </h3>
        <p className="text-polaris-body3 text-label-neutral">{desc}</p>
        {icon && <div className="pt-polaris-xs">{icon}</div>}
      </CardBody>
    </Card>
  );
}

/* ================================================================== *
 * Coverage — PromptChip array (분야 / 카테고리 필터)
 * GovChance는 평범한 chip이었음. PromptChip은 Polaris 고유 컴포넌트로
 * NOVA 색 hover와 AI 친화 디자인이 차별 포인트.
 * ================================================================== */

const COVERAGE = [
  '국가R&D·연구개발',
  '창업·벤처 지원',
  '중소기업 기술개발',
  '산학협력 과제',
  '지역혁신 사업',
  '스마트공장 구축',
  '수출지원 사업',
  'ESG·탄소중립',
  '문화·콘텐츠 지원',
  '농식품 혁신 사업',
];

function Coverage() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Section eyebrow="COVERAGE" title="지원 사업 분야" desc="국책과제 · R&D · 창업지원 등 다양한 사업계획서 작성에 사용">
      <div className="flex flex-wrap gap-polaris-2xs">
        {COVERAGE.map((c) => (
          <PromptChip
            key={c}
            onClick={() => setSelected(selected === c ? null : c)}
            className={cn(selected === c && 'bg-accent-brand-bg text-accent-brand-normal')}
          >
            {c}
          </PromptChip>
        ))}
      </div>
      {selected && (
        <p className="mt-polaris-md text-polaris-body3 text-label-alternative">
          <span className="text-accent-brand-normal font-medium">{selected}</span> 분야의 양식 라이브러리를 불러옵니다.
        </p>
      )}
    </Section>
  );
}

/* ================================================================== *
 * Editor preview — Polaris's distinctive asset (<Ribbon>).
 * 시장에서 거의 유일하게 Polaris만 갖는 Office 스타일 ribbon. 데모로
 * 작은 미리보기 패널 노출 — 핵심 4 그룹(붙여넣기 / 텍스트 포맷 / 정렬
 * / NOVA AI)만 보여줌. 풀 ribbon 데모는 /polaris-office.
 * ================================================================== */

function EditorPreview() {
  const [marks, setMarks] = useState<string[]>(['bold']);
  const [align, setAlign] = useState('justify');
  return (
    <Section
      eyebrow="EDITOR PREVIEW"
      title="초안 작성 시 — Polaris 리본 에디터"
      desc="NOVA AI 도구가 통합된 Office-style 리본. 풀 데모는 /polaris-office에서."
    >
      <Card variant="padded" className="overflow-hidden p-0">
        <Ribbon>
          <RibbonTabs defaultValue="home">
            <RibbonTabList>
              <RibbonTab value="home">홈</RibbonTab>
              <RibbonTab value="ai" className="relative pr-3">
                AI 도구
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-polaris-pill bg-state-error" aria-hidden="true" />
              </RibbonTab>
            </RibbonTabList>

            <RibbonContent value="home">
              {/* Paste */}
              <RibbonGroup>
                <RibbonButton
                  size="lg"
                  icon={<PasteIcon size={24} />}
                  tooltip="붙여넣기 (⌘V)"
                >
                  붙여넣기
                </RibbonButton>
              </RibbonGroup>

              {/* Format */}
              <RibbonGroup>
                <RibbonStack>
                  <RibbonRow>
                    <RibbonButton tooltip="글자 크게" icon={<FontSizeLargeIcon />} />
                    <RibbonButton tooltip="글자 작게" icon={<FontSizeSmallIcon />} />
                    <RibbonRowDivider />
                    <RibbonButton tooltip="서식 지우기" icon={<ClearFormatIcon />} />
                  </RibbonRow>
                  <RibbonRow>
                    <RibbonToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
                      <RibbonToggleItem value="bold" tooltip="굵게" icon={<BoldIcon />} />
                      <RibbonToggleItem value="italic" tooltip="기울임" icon={<ItalicIcon />} />
                      <RibbonToggleItem value="underline" tooltip="밑줄" icon={<UnderlineIcon />} />
                    </RibbonToggleGroup>
                  </RibbonRow>
                </RibbonStack>
              </RibbonGroup>

              {/* Alignment */}
              <RibbonGroup>
                <RibbonRow>
                  <RibbonToggleGroup type="single" value={align} onValueChange={(v) => v && setAlign(v)}>
                    <RibbonToggleItem value="left" tooltip="왼쪽" icon={<AlignLeftIcon />} />
                    <RibbonToggleItem value="center" tooltip="가운데" icon={<AlignCenterIcon />} />
                    <RibbonToggleItem value="right" tooltip="오른쪽" icon={<AlignRightIcon />} />
                    <RibbonToggleItem value="justify" tooltip="양쪽" icon={<JustifyIcon />} />
                  </RibbonToggleGroup>
                </RibbonRow>
              </RibbonGroup>

              {/* NOVA AI 도구 — Polaris 시각 정체성의 정점 */}
              <RibbonGroup>
                <RibbonButton size="lg" icon={<AiWriteIcon size={24} />}>AI{'\n'}작성</RibbonButton>
                <RibbonButton size="lg" icon={<AiChatIcon size={24} />}>NOVA{'\n'}질문</RibbonButton>
              </RibbonGroup>

              {/* Find */}
              <RibbonGroup>
                <RibbonStack>
                  <RibbonButton size="sm" icon={<FindIcon size={14} />}>찾기</RibbonButton>
                  <RibbonButton size="sm" icon={<TextReplaceIcon size={14} />}>바꾸기</RibbonButton>
                </RibbonStack>
              </RibbonGroup>
            </RibbonContent>

            <RibbonContent value="ai">
              <div className="px-polaris-md py-polaris-sm text-polaris-body3 text-label-alternative">
                AI 도구 패널 — 풀 데모는 <a href="#/polaris-office" className="text-accent-brand-normal underline">/polaris-office</a> 참고.
              </div>
            </RibbonContent>
          </RibbonTabs>
        </Ribbon>
      </Card>
    </Section>
  );
}

/* ================================================================== *
 * Identity audit — 이 페이지가 적용한 자산 체크리스트. 외부 컨슈머가
 * 자기 사이트에 어느 만큼 적용됐는지 비교할 수 있는 참고 표.
 * ================================================================== */

const IDENTITY_ITEMS = [
  { asset: '<PolarisLogo>',    where: 'Footer + 사이드바 brand mark' },
  { asset: '<NovaLogo>',       where: 'AI CTA 버튼 안 (이번 hero)' },
  { asset: '<FileIcon type="hwp/docx/pdf">', where: 'STEP 05 카드' },
  { asset: 'Button variant="ai"', where: '"공고문 분석하기" CTA — NOVA Purple solid' },
  { asset: 'NOVA 그라디언트',   where: 'Hero 타이틀 "AI가 제안서 작성" / Stat 등록 양식' },
  { asset: '<PromptChip>',     where: 'Coverage 분야 칩 (NOVA hover)' },
  { asset: '<Ribbon>',         where: 'Editor preview — Polaris의 "거의 유일한" 자산' },
  { asset: '@polaris/ui/ribbon-icons', where: 'Ribbon 안 91 아이콘 (Bold/PasteIcon/AiWriteIcon 등)' },
  { asset: 'bg-accent-brand-bg active 패턴', where: 'Layout 사이드바 active state' },
];

function IdentityAudit() {
  return (
    <Section
      eyebrow="IDENTITY CHECKLIST"
      title="이 페이지가 적용한 Polaris signature 자산"
      desc="평범한 SaaS와 시각적으로 구별되는 9가지 — 외부 컨슈머가 자기 사이트에 비교 적용 가능"
    >
      <Card>
        <CardBody className="p-0">
          <ul className="divide-y divide-line-neutral">
            {IDENTITY_ITEMS.map(({ asset, where }) => (
              <li key={asset} className="flex items-start gap-polaris-sm px-polaris-md py-polaris-xs">
                {/* eslint-disable-next-line @polaris/state-color-with-icon -- CheckIcon 자체가 success 의미 전달 (icon = 아이콘 companion) */}
                <CheckIcon size={18} className="shrink-0 mt-0.5 text-state-success" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <code className="font-polaris-mono text-polaris-body3 bg-fill-neutral px-polaris-3xs py-0.5 rounded-polaris-xs">
                    {asset}
                  </code>
                  <p className="text-polaris-body3 text-label-neutral mt-polaris-3xs">{where}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </Section>
  );
}

/* ================================================================== *
 * Section primitive — eyebrow + title + desc + slot
 * GovChance 페이지가 사용하던 hierarchy를 그대로 차용 (caption1 uppercase
 * label + heading + body neutral). 시각 자산만 다르고 구조는 동일.
 * ================================================================== */

function Section({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line-neutral pt-polaris-2xl mt-polaris-2xl">
      <header className="mb-polaris-lg">
        <p className="text-polaris-caption1 text-label-alternative tracking-widest uppercase mb-polaris-2xs">
          {eyebrow}
        </p>
        <h2 className="text-polaris-heading2 font-bold text-label-normal mb-polaris-2xs">
          {title}
        </h2>
        {desc && <p className="text-polaris-body2 text-label-alternative">{desc}</p>}
      </header>
      {children}
    </section>
  );
}

/* ================================================================== *
 * Footer — Powered by Polaris (브랜드 마크 노출)
 * ================================================================== */

function Footer() {
  return (
    <footer className="border-t border-line-neutral mt-polaris-3xl pt-polaris-xl pb-polaris-2xl">
      <div className="flex items-center justify-between gap-polaris-md flex-wrap">
        <div className="flex items-center gap-polaris-2xs text-polaris-caption1 text-label-alternative">
          <span>Powered by</span>
          <PolarisLogo variant="horizontal" size={16} />
        </div>
        <a
          href="https://polarisoffice.github.io/PolarisDesign"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-polaris-3xs text-polaris-caption1 text-accent-brand-normal hover:text-accent-brand-strong transition-colors"
        >
          디자인 시스템 카탈로그
          <ArrowRightIcon size={14} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

/* ================================================================== *
 * Page composition
 * ================================================================== */

export default function ProposalPlatform() {
  return (
    <div className="max-w-6xl mx-auto px-polaris-lg py-polaris-2xl">
      <Hero />
      <Workflow />
      <Coverage />
      <EditorPreview />
      <IdentityAudit />
      <Footer />
    </div>
  );
}
