'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  Badge,
  FileCard,
  NovaInput,
  PromptChip,
} from '@polaris/ui';
import { PlusIcon, SearchIcon, ImageIcon } from '@polaris/ui/icons';
// Sparkles + FileText: no `@polaris/ui/icons` equivalent — keep lucide.
import { Sparkles, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <main className="min-h-screen">
      <header className="border-b border-line-neutral">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 rounded-polaris-md bg-accent-brand-normal text-label-inverse items-center justify-center font-bold text-polaris-caption1">
              P
            </span>
            <span className="text-polaris-heading4 font-semibold">Polaris App</span>
            <Badge variant="secondary">Tier 0</Badge>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-polaris-title mb-2">시작해보세요</h1>
          <p className="text-polaris-body1 text-label-neutral max-w-2xl">
            이 페이지는 폴라리스 디자인 시스템 템플릿입니다. <code className="font-polaris-mono text-label-normal">app/page.tsx</code>를 편집해서 본인 서비스에 맞게 바꾸세요. 모든 색상·폰트·간격은 토큰으로 강제되며 lint가 위반을 자동 차단합니다.
          </p>
        </div>

        <div className="mb-10 max-w-2xl">
          <NovaInput
            onSubmit={(v) => setSubmitted(v)}
            placeholder="NOVA에게 무엇이든 물어보기"
          />
          {submitted && (
            <p className="text-polaris-caption1 text-label-alternative mt-2">
              마지막 요청: <span className="text-label-normal">{submitted}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          <PromptChip icon={<SearchIcon size={16} />} onClick={() => setSubmitted('트렌드 조사')}>
            2025년 소비자 트렌드를 산업별로 조사해 줘
          </PromptChip>
          <PromptChip icon={<FileText className="h-4 w-4" />} onClick={() => setSubmitted('회의 요약')}>
            회의의 주요 내용을 한 장 분량으로 요약해 줘
          </PromptChip>
          <PromptChip icon={<ImageIcon size={16} />} onClick={() => setSubmitted('이미지 생성')}>
            보고서 주제에 맞는 키 비주얼 이미지를 만들어 줘
          </PromptChip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>최근 문서</CardTitle>
              <CardDescription>방금 열어본 파일들</CardDescription>
            </CardHeader>
            <CardBody className="space-y-2 !pt-2">
              <FileCard type="docx" name="보고서.docx" meta="2시간 전" />
              <FileCard type="xlsx" name="비용 정리.xlsx" meta="어제" />
              <FileCard type="pdf" name="계약서.pdf" meta="3일 전" />
            </CardBody>
            <CardFooter>
              <Button variant="ghost" size="sm">
                전체 보기
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>다음 단계</CardTitle>
              <CardDescription>이 템플릿을 본인 서비스로 만들어 가세요</CardDescription>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2 text-polaris-body2 text-label-neutral">
                <li>• <code className="font-polaris-mono text-label-normal">app/page.tsx</code>를 편집</li>
                <li>• 새 라우트는 <code className="font-polaris-mono text-label-normal">app/&lt;path&gt;/page.tsx</code></li>
                <li>• 컴포넌트는 <code className="font-polaris-mono text-label-normal">@polaris/ui</code>에서 import</li>
                <li>• <code className="font-polaris-mono text-label-normal">pnpm lint</code>로 토큰 준수 확인</li>
              </ul>
            </CardBody>
            <CardFooter>
              <Button size="sm">
                <PlusIcon size={16} /> 새 페이지 만들기
              </Button>
              <Button variant="secondary" size="sm">
                <Sparkles className="h-4 w-4" /> NOVA로 시작
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <footer className="border-t border-line-neutral">
        <div className="max-w-5xl mx-auto px-6 py-6 text-polaris-caption1 text-label-alternative text-center">
          Polaris Design System · template-next
        </div>
      </footer>
    </main>
  );
}
