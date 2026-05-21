/**
 * Design assets reference — surfaces existing Polaris-made assets from
 * polarisoffice.com (logos, favicon, icons, NOVA cosmic backgrounds, AI
 * model logos) alongside the lucide-react fallback icon set we use for
 * everything else. Goal: surface what's already shipped so contributors
 * reuse Polaris's own iconography first instead of inventing new marks.
 *
 * Polaris assets are loaded directly from `polink-static-contents.polarisoffice.com`
 * — they're the canonical source. If the static host moves, update
 * `POLARIS_CDN` below.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardBody, Input, SimpleTooltip, cn } from '@polaris/ui';
import {
  // common UI
  Home, Search, Settings, Bell, Plus, X, Check, Trash2, Edit, Copy,
  Download, Upload, Filter, MoreHorizontal, RefreshCw,
  // file & document
  File, FileText, FileSpreadsheet, Image as ImageIcon, Folder,
  Paperclip, Save, Printer, FileCode, FileJson,
  // user & people
  User, Users, UserPlus, UserCheck, UserX,
  // navigation
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowUpRight, ExternalLink, Menu as MenuIcon,
  // status
  CheckCircle2, XCircle, AlertCircle, AlertTriangle, Info, Loader2, Clock,
  // media & input
  Camera, Mic, Video, Volume2, Play, Pause,
  // AI / generative
  Sparkles, Wand2, Bot, Brain, Lightbulb, Zap, Stars, MessageSquare,
  // editor / format
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List,
  ListOrdered, Type, Palette, Brush, Layout as LayoutIcon,
  // communication
  Mail, Send, Phone, Share2, Link as LinkIcon, AtSign,
  // time
  Calendar, History,
  type LucideIcon,
} from 'lucide-react';

const POLARIS_CDN = 'https://polink-static-contents.polarisoffice.com/nova/assets';

/* ================================================================== *
 * Polaris Office assets — canonical brand marks, AI logos, NOVA bg.
 * ================================================================== */

const POLARIS_LOGOS = [
  { name: 'polarisoffice.svg', label: '워드마크', url: `${POLARIS_CDN}/img/common/logo/polarisoffice.svg`, w: 'w-48' },
  { name: 'favicon.svg', label: 'Favicon', url: `${POLARIS_CDN}/favicon.svg`, w: 'w-12' },
];

const POLARIS_ICONS = [
  { name: 'credit.svg', label: 'Credit', url: `${POLARIS_CDN}/img/common/icon/nav/credit.svg` },
  { name: 'paperclip.svg', label: 'Paperclip (첨부)', url: `${POLARIS_CDN}/img/common/icon/form/paperclip.svg` },
];

const NOVA_BACKGROUNDS = [
  { name: 'main-top-bg-left.svg', label: 'NOVA Hero Left (코스믹)', url: `${POLARIS_CDN}/img/contents/home/main-top-bg-left.svg` },
  { name: 'main-top-bg-right.svg', label: 'NOVA Hero Right (코스믹)', url: `${POLARIS_CDN}/img/contents/home/main-top-bg-right.svg` },
];

const AI_MODEL_LOGOS = [
  { name: 'gpt.svg', label: 'OpenAI GPT', url: `${POLARIS_CDN}/img/common/logo/gpt.svg` },
  { name: 'claude.svg', label: 'Anthropic Claude', url: `${POLARIS_CDN}/img/common/logo/claude.svg` },
  { name: 'perplexity.svg', label: 'Perplexity', url: `${POLARIS_CDN}/img/common/logo/perplexity.svg` },
  { name: 'clova.svg', label: 'Naver CLOVA', url: `${POLARIS_CDN}/img/common/logo/clova.svg` },
  { name: 'solar.svg', label: 'Upstage Solar', url: `${POLARIS_CDN}/img/common/logo/solar.svg` },
];

/* ================================================================== *
 * Lucide categories — curated subset of the ~1500 lucide icons that
 * actually show up across the demo (NOVA workspace, CRM, Sign,
 * Polaris Office ribbon, etc.).
 * ================================================================== */

type LucideCategory = { title: string; description: string; icons: Array<{ name: string; icon: LucideIcon }> };

const LUCIDE_CATEGORIES: LucideCategory[] = [
  {
    title: '공통 UI',
    description: '화면 어디든 자주 등장하는 기본 액션·표시',
    icons: [
      { name: 'Home', icon: Home }, { name: 'Search', icon: Search },
      { name: 'Settings', icon: Settings }, { name: 'Bell', icon: Bell },
      { name: 'Plus', icon: Plus }, { name: 'X', icon: X },
      { name: 'Check', icon: Check }, { name: 'Trash2', icon: Trash2 },
      { name: 'Edit', icon: Edit }, { name: 'Copy', icon: Copy },
      { name: 'Download', icon: Download }, { name: 'Upload', icon: Upload },
      { name: 'Filter', icon: Filter }, { name: 'MoreHorizontal', icon: MoreHorizontal },
      { name: 'RefreshCw', icon: RefreshCw },
    ],
  },
  {
    title: '파일·문서',
    description: '문서 타입별 마크. 색상 토큰(`fileType.docx/xlsx/pptx/pdf`)과 함께 사용',
    icons: [
      { name: 'File', icon: File }, { name: 'FileText', icon: FileText },
      { name: 'FileSpreadsheet', icon: FileSpreadsheet },
      { name: 'Image', icon: ImageIcon }, { name: 'Folder', icon: Folder },
      { name: 'Paperclip', icon: Paperclip }, { name: 'Save', icon: Save },
      { name: 'Printer', icon: Printer }, { name: 'FileCode', icon: FileCode },
      { name: 'FileJson', icon: FileJson },
    ],
  },
  {
    title: '사용자·사람',
    description: '계정·멤버·아바타 컨텍스트',
    icons: [
      { name: 'User', icon: User }, { name: 'Users', icon: Users },
      { name: 'UserPlus', icon: UserPlus }, { name: 'UserCheck', icon: UserCheck },
      { name: 'UserX', icon: UserX },
    ],
  },
  {
    title: '네비게이션',
    description: '뒤로/앞으로·페이지네이션·외부링크',
    icons: [
      { name: 'ArrowLeft', icon: ArrowLeft }, { name: 'ArrowRight', icon: ArrowRight },
      { name: 'ChevronLeft', icon: ChevronLeft }, { name: 'ChevronRight', icon: ChevronRight },
      { name: 'ChevronUp', icon: ChevronUp }, { name: 'ChevronDown', icon: ChevronDown },
      { name: 'ArrowUpRight', icon: ArrowUpRight }, { name: 'ExternalLink', icon: ExternalLink },
      { name: 'Menu', icon: MenuIcon },
    ],
  },
  {
    title: '상태·피드백',
    description: 'Toast·Alert·Badge에서 status 토큰과 페어로 사용',
    icons: [
      { name: 'CheckCircle2', icon: CheckCircle2 }, { name: 'XCircle', icon: XCircle },
      { name: 'AlertCircle', icon: AlertCircle }, { name: 'AlertTriangle', icon: AlertTriangle },
      { name: 'Info', icon: Info }, { name: 'Loader2', icon: Loader2 }, { name: 'Clock', icon: Clock },
    ],
  },
  {
    title: '미디어·입력',
    description: '카메라·마이크·비디오·오디오 컨트롤',
    icons: [
      { name: 'Camera', icon: Camera }, { name: 'Mic', icon: Mic },
      { name: 'Video', icon: Video }, { name: 'Volume2', icon: Volume2 },
      { name: 'Play', icon: Play }, { name: 'Pause', icon: Pause },
    ],
  },
  {
    title: 'AI · 생성',
    description: 'NOVA 컨텍스트. ai.normal(보라) 토큰과 함께 사용',
    icons: [
      { name: 'Sparkles', icon: Sparkles }, { name: 'Wand2', icon: Wand2 },
      { name: 'Bot', icon: Bot }, { name: 'Brain', icon: Brain },
      { name: 'Lightbulb', icon: Lightbulb }, { name: 'Zap', icon: Zap },
      { name: 'Stars', icon: Stars }, { name: 'MessageSquare', icon: MessageSquare },
    ],
  },
  {
    title: '에디터·서식',
    description: '리본/툴바 컨트롤. 폴라리스 오피스 데모 ribbon에서 사용',
    icons: [
      { name: 'Bold', icon: Bold }, { name: 'Italic', icon: Italic },
      { name: 'Underline', icon: Underline }, { name: 'AlignLeft', icon: AlignLeft },
      { name: 'AlignCenter', icon: AlignCenter }, { name: 'AlignRight', icon: AlignRight },
      { name: 'List', icon: List }, { name: 'ListOrdered', icon: ListOrdered },
      { name: 'Type', icon: Type }, { name: 'Palette', icon: Palette },
      { name: 'Brush', icon: Brush }, { name: 'Layout', icon: LayoutIcon },
    ],
  },
  {
    title: '커뮤니케이션',
    description: '메일·메시지·전화·공유',
    icons: [
      { name: 'Mail', icon: Mail }, { name: 'Send', icon: Send },
      { name: 'Phone', icon: Phone }, { name: 'Share2', icon: Share2 },
      { name: 'Link', icon: LinkIcon }, { name: 'AtSign', icon: AtSign },
    ],
  },
  {
    title: '시간',
    description: '일정·이력·기간',
    icons: [
      { name: 'Calendar', icon: Calendar }, { name: 'Clock', icon: Clock },
      { name: 'History', icon: History },
    ],
  },
];

/* ================================================================== *
 * Building blocks
 * ================================================================== */

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="!h-7 gap-1 text-polaris-caption1"
    >
      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      {copied ? '복사됨' : '복사'}
    </Button>
  );
}

function PolarisAssetCard({
  preview,
  name,
  url,
  label,
  variant = 'default',
}: {
  preview: React.ReactNode;
  name: string;
  url: string;
  label: string;
  variant?: 'default' | 'wide';
}) {
  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          'flex items-center justify-center p-6 bg-fill-neutral border-b border-line-neutral',
          variant === 'wide' ? 'min-h-32' : 'min-h-24'
        )}
      >
        {preview}
      </div>
      <CardBody className="!py-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-polaris-body2 font-semibold truncate">{label}</span>
          <CopyButton value={url} />
        </div>
        <code className="block text-polaris-caption1 text-label-alternative font-polaris-mono truncate" title={name}>
          {name}
        </code>
      </CardBody>
    </Card>
  );
}

function LucideIconCard({ name, icon: Icon }: { name: string; icon: LucideIcon }) {
  return (
    <SimpleTooltip label={`import { ${name} } from 'lucide-react'`}>
      <Button
        variant="ghost"
        onClick={() => navigator.clipboard.writeText(name)}
        aria-label={`Copy lucide icon name: ${name}`}
        className="group !h-auto !flex-col items-center gap-1.5 !p-3 border border-line-neutral hover:border-accent-brand-normal"
      >
        <Icon className="h-5 w-5 text-label-normal group-hover:text-accent-brand-normal" aria-hidden="true" />
        <span className="text-polaris-caption1 text-label-alternative truncate w-full text-center">{name}</span>
      </Button>
    </SimpleTooltip>
  );
}

/* ================================================================== *
 * Sections
 * ================================================================== */

function PolarisLogosSection() {
  return (
    <section>
      <h2 className="text-polaris-heading3 mb-1">폴라리스 로고</h2>
      <p className="text-polaris-body2 text-label-neutral mb-4">
        폴라리스 오피스 공식 워드마크와 favicon. <code className="font-polaris-mono text-polaris-body2 bg-fill-neutral px-1 rounded-polaris-sm">polink-static-contents.polarisoffice.com</code>에 호스팅된 SVG를 그대로 참조합니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {POLARIS_LOGOS.map((logo) => (
          <PolarisAssetCard
            key={logo.name}
            preview={<img src={logo.url} alt={logo.label} className={cn(logo.w, 'h-auto')} />}
            name={logo.url}
            url={logo.url}
            label={logo.label}
            variant="wide"
          />
        ))}
      </div>
    </section>
  );
}

function PolarisIconsSection() {
  return (
    <section>
      <h2 className="text-polaris-heading3 mb-1">폴라리스 자체 제작 아이콘</h2>
      <p className="text-polaris-body2 text-label-neutral mb-4">
        폴라리스 오피스 페이지에서 발견된 자체 제작 SVG 아이콘. 새 아이콘이 필요하기 전에 이쪽을 먼저 확인 — 브랜드 일관성 유지에 가장 안전합니다.
        <span className="block mt-1 text-label-alternative">
          ⚠️ 디자인 팀에 전체 아이콘 라이브러리 요청은 <code className="font-polaris-mono text-polaris-caption1 bg-fill-neutral px-1 rounded-polaris-sm">docs/design-assets-v07.md</code> 참조.
        </span>
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {POLARIS_ICONS.map((icon) => (
          <PolarisAssetCard
            key={icon.name}
            preview={<img src={icon.url} alt={icon.label} className="h-10 w-10" />}
            name={icon.url}
            url={icon.url}
            label={icon.label}
          />
        ))}
      </div>
    </section>
  );
}

function NovaBackgroundsSection() {
  return (
    <section>
      <h2 className="text-polaris-heading3 mb-1">NOVA 코스믹 시각 자산</h2>
      <p className="text-polaris-body2 text-label-neutral mb-4">
        NOVA 워크스페이스 hero에 사용하는 우주 테마 배경 SVG. <Link to="/nova" className="text-accent-brand-normal hover:underline">/nova 라우트</Link>의 hero 영역에서 같은 자산을 볼 수 있습니다.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {NOVA_BACKGROUNDS.map((bg) => (
          <PolarisAssetCard
            key={bg.name}
            preview={<img src={bg.url} alt={bg.label} className="w-full h-32 object-cover rounded-polaris-sm" />}
            name={bg.url}
            url={bg.url}
            label={bg.label}
            variant="wide"
          />
        ))}
      </div>
    </section>
  );
}

function AIModelLogosSection() {
  return (
    <section>
      <h2 className="text-polaris-heading3 mb-1">통합 AI 모델 로고</h2>
      <p className="text-polaris-body2 text-label-neutral mb-4">
        NOVA가 통합한 외부 LLM 로고들. AI 모델 선택 UI에서 사용 (NOVA 워크스페이스 select 등).
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {AI_MODEL_LOGOS.map((logo) => (
          <PolarisAssetCard
            key={logo.name}
            preview={<img src={logo.url} alt={logo.label} className="h-10 w-10" />}
            name={logo.url}
            url={logo.url}
            label={logo.label}
          />
        ))}
      </div>
    </section>
  );
}

function LucideSection({ filter }: { filter: string }) {
  const q = filter.trim().toLowerCase();
  const filtered = LUCIDE_CATEGORIES.map((cat) => ({
    ...cat,
    icons: cat.icons.filter((i) => !q || i.name.toLowerCase().includes(q)),
  })).filter((cat) => cat.icons.length > 0);

  return (
    <section>
      <h2 className="text-polaris-heading3 mb-1">lucide 아이콘 (fallback)</h2>
      <p className="text-polaris-body2 text-label-neutral mb-4">
        브랜드 마크가 아닌 일반 UI 아이콘은 <a href="https://lucide.dev" target="_blank" rel="noreferrer" className="text-accent-brand-normal hover:underline">lucide-react</a>를 사용합니다. 24×24 viewBox · 1.5px stroke · `currentColor`로 색이 자동 적용 (text-label-normal 등).
        <span className="block mt-1 text-label-alternative">
          아이콘 클릭 시 컴포넌트명이 클립보드에 복사됩니다 — 그대로 import해서 사용.
        </span>
      </p>
      <div className="space-y-8">
        {filtered.map((cat) => (
          <div key={cat.title}>
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-polaris-heading4">{cat.title}</h3>
              <span className="text-polaris-caption1 text-label-alternative">{cat.icons.length}개</span>
            </div>
            <p className="text-polaris-caption1 text-label-alternative mb-3">{cat.description}</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-2">
              {cat.icons.map((i) => (
                <LucideIconCard key={i.name} name={i.name} icon={i.icon} />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-polaris-body2 text-label-alternative text-center py-12">검색 결과가 없습니다.</p>
        )}
      </div>
    </section>
  );
}

/* ================================================================== *
 * Page
 * ================================================================== */

export default function Assets() {
  const [filter, setFilter] = useState('');

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <header>
        <Badge variant="primary" className="mb-4">시스템 레퍼런스</Badge>
        <h1 className="text-polaris-title mb-3">디자인 자산</h1>
        <p className="text-polaris-body1 text-label-neutral max-w-2xl">
          폴라리스 자체 제작 자산 + lucide-react 아이콘을 한 페이지에서 미리 보고 복사할 수 있는 레퍼런스. 새 자산이 필요할 때 <strong>먼저 폴라리스에서 찾고, 없으면 lucide</strong>를 쓰는 게 브랜드 일관성을 지키는 가장 빠른 길입니다.
        </p>
      </header>

      <PolarisLogosSection />
      <PolarisIconsSection />
      <NovaBackgroundsSection />
      <AIModelLogosSection />

      <div className="border-t border-line-neutral pt-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-polaris-body2 text-label-alternative">
            아래는 lucide-react 아이콘 모음. 카테고리별로 자주 쓰는 것만 추렸습니다 — 전체 1500+ 아이콘은 <a href="https://lucide.dev" target="_blank" rel="noreferrer" className="text-accent-brand-normal hover:underline">lucide.dev</a> 참고.
          </p>
          <div className="relative w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-label-alternative pointer-events-none" aria-hidden="true" />
            <Input
              type="search"
              placeholder="아이콘 이름 검색"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 !h-9"
            />
          </div>
        </div>
        <LucideSection filter={filter} />
      </div>
    </div>
  );
}
