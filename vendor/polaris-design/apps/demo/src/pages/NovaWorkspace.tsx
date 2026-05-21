import { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  NovaInput,
  PromptChip,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  SimpleTooltip,
  Avatar,
  AvatarFallback,
  cn,
} from '@polaris/ui';
import { ArrowRightIcon, ChevronDownIcon, DeleteIcon, HistoryIcon, ImageIcon, InfoCircleIcon, PlusIcon, SearchIcon, ShareIcon, TranslateIcon } from '@polaris/ui/icons';
import { Sparkles, FileText, Code2, Mic, Copy, Star } from 'lucide-react';

type Length = 'short' | 'medium' | 'long';
type Tone = 'formal' | 'friendly' | 'concise';

// Deterministic pseudo-random so star positions are stable across renders
// and reloads (no Math.random at runtime).
const pseudo = (n: number) => {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: pseudo(i + 1) * 1200,
  y: pseudo(i * 2 + 7) * 520,
  r: pseudo(i * 3 + 13) * 1.4 + 0.3,
  o: pseudo(i * 5 + 19) * 0.5 + 0.35,
}));

function NovaHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      {/* Base gradient — diagonal purple → canvas → blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-ai-hover via-background-base to-accent-brand-bg" />

      {/* Glow orbs — soft nebula-like blobs */}
      <div className="absolute top-0 left-1/4 h-72 w-72 rounded-polaris-pill bg-ai-normal opacity-25 blur-3xl" />
      <div className="absolute top-1/3 right-1/5 h-72 w-72 rounded-polaris-pill bg-polaris-blue opacity-15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-polaris-pill bg-polaris-purple opacity-20 blur-3xl" />

      {/* Starfield */}
      <svg
        className="absolute inset-0 w-full h-full text-ai-normal"
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMid slice"
      >
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="currentColor" opacity={s.o} />
        ))}
      </svg>

      {/* Bottom fade so the hero blends into the canvas before recent responses */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background-base" />
    </div>
  );
}

const PROMPT_TEMPLATES = [
  { icon: SearchIcon, label: '트렌드 조사', prompt: '2025년 소비자 트렌드를 산업별로 심층 조사해 줘' },
  { icon: FileText, label: '회의록 요약', prompt: '회의의 주요 내용을 한 장 분량으로 간결하게 요약해 줘' },
  { icon: ImageIcon, label: '키 비주얼', prompt: '보고서 주제에 맞는 키 비주얼 이미지를 만들어 줘' },
  { icon: TranslateIcon, label: '영문 번역', prompt: '이 문서를 자연스러운 영문으로 번역해 줘' },
] as const;

const MORE_TEMPLATES = [
  { icon: Code2, label: '코드 리뷰', prompt: '이 코드의 개선 포인트를 알려 줘' },
  { icon: Mic, label: '인터뷰 정리', prompt: '인터뷰 녹취록을 3가지 키 인사이트로 정리해 줘' },
];

type Feature = {
  id: string;
  title: string;
  desc: string;
  /** Filename under apps/demo/public/nova-features/. Resolved via BASE_URL. */
  image: string;
  isNew?: boolean;
};

const NOVA_FEATURES: Feature[] = [
  {
    id: 'style',
    title: '스타일 스튜디오',
    desc: '요즘 뜨는 밈도 클릭 한 번이면 스타일을 입혀요',
    image: 'style.png',
    isNew: true,
  },
  {
    id: 'nano',
    title: '나노 바나나 스튜디오',
    desc: '세상에 없는 이미지, 원하는 대로 만들어요',
    image: 'nano.png',
    isNew: true,
  },
  {
    id: 'ppt',
    title: 'AI PPT 생성',
    desc: '텍스트/문서만 넣으면 발표 자료가 완성돼요',
    image: 'ppt.png',
    isNew: true,
  },
  {
    id: 'dictation',
    title: '받아쓰기',
    desc: '회의나 강의 등 음성을 한 번에 텍스트로 바꿔요',
    image: 'dictation.png',
  },
  {
    id: 'translate',
    title: '다국어 번역',
    desc: '파일만 넣으면 형식 그대로 정확하게 번역해요',
    image: 'translate.png',
  },
  {
    id: 'imagegen',
    title: '이미지 생성',
    desc: '상상하는 이미지를 무엇이든 만들어요',
    image: 'imagegen.png',
  },
  {
    id: 'chat',
    title: 'AI 채팅',
    desc: '다양한 최신 모델로 질문을 똑똑하게 답해요',
    image: 'chat.png',
  },
  {
    id: 'bgremove',
    title: '배경 제거',
    desc: '이미지에서 배경만 깔끔하게 지워요',
    image: 'bgremove.png',
  },
];

const RECENT_RESPONSES = [
  {
    id: 1,
    prompt: '2025년 소비자 트렌드를 산업별로 정리해 줘',
    snippet:
      '소비재·금융·라이프스타일 3개 산업에서 공통적으로 "개인화된 가치 추구"가 강화되었습니다. 특히 30~40대 여성층에서…',
    when: '방금 전',
    tokens: 1240,
    starred: true,
  },
  {
    id: 2,
    prompt: '월간 경영회의록을 한 장 분량으로 요약',
    snippet:
      '핵심 의제 5건 중 3건이 승인됨. (1) Q2 영업 목표 상향 합의 (2) NOVA 베타 사용자 1,000명 확보 (3) …',
    when: '2시간 전',
    tokens: 480,
    starred: false,
  },
  {
    id: 3,
    prompt: '제안서 표지 이미지를 만들어 줘 — 폴라리스 톤',
    snippet:
      '제안서 표지 이미지 3종을 생성했습니다. (보라/파랑 그라데이션, 미니멀 라인, 은유적 우주 모티프).',
    when: '어제',
    tokens: 0,
    starred: false,
  },
];

export default function NovaWorkspace() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [length, setLength] = useState<Length>('medium');
  const [tone, setTone] = useState<Tone>('formal');

  const handleSubmit = (v: string) => {
    setSubmitted(v);
  };

  const fillPrompt = (p: string) => {
    setSubmitted(p);
  };

  return (
    <>
      {/* Hero band — gradient + nebula orbs + starfield, edge-to-edge */}
      <section className="relative isolate">
        <NovaHeroBackground />
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-10">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-polaris-pill bg-ai-hover text-ai-normal text-polaris-caption1 font-semibold mb-4 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI · NOVA
            </div>
            <h1 className="text-polaris-title mb-3">NOVA 워크스페이스</h1>
            <p className="text-polaris-body1 text-label-neutral max-w-2xl mx-auto">
              AI에게 무엇이든 묻고 결과를 한 곳에 모아보세요. 응답은 길이/톤을 조절할 수 있고,
              자주 쓰는 프롬프트는 저장됩니다.
            </p>
          </header>

          <div className="mb-6">
            <NovaInput
              onSubmit={handleSubmit}
              placeholder="NOVA에게 무엇이든 물어보기"
            />
          </div>

          {/* Settings row: Select + Tooltip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-8 text-polaris-body2">
            <div className="flex items-center gap-2">
              <span className="text-label-alternative">응답 길이</span>
              <SimpleTooltip label="응답의 분량을 조절합니다. 보통 = 한 화면 분량.">
                <InfoCircleIcon className="h-3.5 w-3.5 text-label-alternative" aria-hidden="true" />
              </SimpleTooltip>
              <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                <SelectTrigger className="!h-9 !w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">짧게</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="long">길게</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-label-alternative">톤</span>
              <SimpleTooltip label="응답의 어조. 사내 보고서면 정중함, 메모면 간결을 추천.">
                <InfoCircleIcon className="h-3.5 w-3.5 text-label-alternative" aria-hidden="true" />
              </SimpleTooltip>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger className="!h-9 !w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">정중함</SelectItem>
                  <SelectItem value="friendly">친근함</SelectItem>
                  <SelectItem value="concise">간결함</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="tertiary" size="sm">
                  <HistoryIcon className="h-4 w-4" /> 최근 설정
                  <ChevronDownIcon className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>최근 사용한 조합</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => { setLength('short'); setTone('concise'); }}>
                  짧게 + 간결함
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setLength('medium'); setTone('formal'); }}>
                  보통 + 정중함
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setLength('long'); setTone('friendly'); }}>
                  길게 + 친근함
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {submitted && (
              <Badge variant="info">
                마지막 요청: {submitted.slice(0, 30)}{submitted.length > 30 ? '…' : ''}
              </Badge>
            )}
          </div>

          {/* Prompt templates: PromptChip grid + DropdownMenu for "+더보기" */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-polaris-heading4">자주 쓰는 프롬프트</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <PlusIcon className="h-4 w-4" /> 템플릿 추가
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>추가 템플릿</DropdownMenuLabel>
                  {MORE_TEMPLATES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <DropdownMenuItem key={t.label} onSelect={() => fillPrompt(t.prompt)}>
                        <Icon className="h-4 w-4" /> {t.label}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => alert('새 템플릿 만들기')}>
                    <PlusIcon className="h-4 w-4" /> 새 템플릿 만들기
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {PROMPT_TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <PromptChip key={t.label} icon={<Icon className="h-4 w-4" />} onClick={() => fillPrompt(t.prompt)}>
                    {t.prompt}
                  </PromptChip>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* NOVA features grid — what you can do with NOVA */}
      <div className="max-w-5xl mx-auto px-6 pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-polaris-heading4">NOVA로 할 수 있는 것</h2>
          <Button variant="ghost" size="sm">
            전체 보기 <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NOVA_FEATURES.map((f) => (
            <Card
              key={f.id}
              role="button"
              tabIndex={0}
              onClick={() => alert(f.title)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  alert(f.title);
                }
              }}
              className="cursor-pointer hover:border-ai-normal hover:shadow-polaris-md transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai-normal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas"
            >
              <div className="relative h-36 overflow-hidden bg-fill-neutral">
                {f.isNew && (
                  <Badge
                    variant="danger"
                    tone="solid"
                    className="absolute top-2.5 left-2.5 z-10 shadow-polaris-sm"
                  >
                    NEW
                  </Badge>
                )}
                <img
                  src={`${import.meta.env.BASE_URL}nova-features/${f.image}`}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="text-polaris-heading4 mb-1">{f.title}</h3>
                <p className="text-polaris-body2 text-label-neutral line-clamp-2">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent responses (no background) */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-polaris-heading4">최근 응답</h2>
          <Button variant="ghost" size="sm">
            전체 보기
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECENT_RESPONSES.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <CardHeader className="!pb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Avatar size="sm">
                    <AvatarFallback className="!bg-ai-normal">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label="더보기" className="!h-7 !w-7 !px-0">
                        <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => alert('복사')}>
                        <Copy className="h-4 w-4" /> 복사
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => alert('공유')}>
                        <ShareIcon className="h-4 w-4" /> 공유
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => alert(r.starred ? '즐겨찾기 해제' : '즐겨찾기')}>
                        <Star className="h-4 w-4" /> {r.starred ? '즐겨찾기 해제' : '즐겨찾기'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onSelect={() => alert('삭제')}>
                        <DeleteIcon className="h-4 w-4" /> 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="!text-polaris-body2 line-clamp-2">{r.prompt}</CardTitle>
                <CardDescription>
                  {r.when} · {r.tokens > 0 ? `${r.tokens.toLocaleString()} tokens` : '이미지 생성'}
                  {r.starred && (
                    <span className="ml-2 inline-flex items-center gap-0.5 text-state-warning">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardBody className="!pt-0 flex-1">
                <p className="text-polaris-body2 text-label-neutral line-clamp-4">{r.snippet}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
