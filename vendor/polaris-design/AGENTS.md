# Agent instructions — Polaris Design System

이 파일은 **Codex / Cursor / 기타 코드 에이전트**가 이 프로젝트(또는 이 프로젝트의 디자인 시스템을 적용하는 다른 프로젝트)에서 작업할 때 따라야 할 절차를 담습니다. Claude Code는 같은 내용을 [`packages/plugin/skills/polaris-web/SKILL.md`](packages/plugin/skills/polaris-web/SKILL.md)와 PostToolUse 훅으로 강제하지만, 다른 에이전트는 이 파일을 읽고 자가 강제해야 합니다.

## 0. 시작 전 — DESIGN.md를 1차 spec으로 읽기

작업 시작 전에 다음 두 파일이 있으면 **반드시** 먼저 읽으세요:

1. **시스템 spec (auto-generated)** — 저장소 루트의 [`DESIGN.md`](DESIGN.md). 폴라리스 시스템의 토큰·타이포·컴포넌트 표준이 [Stitch DESIGN.md 형식](https://stitch.withgoogle.com/docs/design-md/specification/)으로 정의되어 있습니다. YAML front matter는 기계가 읽고 prose는 사람이 읽지만, 에이전트는 **둘 다** 읽어야 합니다.
2. **제품 spec (있으면)** — 작업 중인 프로젝트 root의 `DESIGN.md`. 그 제품 고유의 컴포넌트·색상·레이아웃 결정이 적혀 있습니다 (예: [`packages/template-next/DESIGN.md`](packages/template-next/DESIGN.md)).

규칙:
- DESIGN.md의 토큰 값과 prose 가이드는 **권장이 아니라 spec**입니다. 우회하려면 사용자에게 확인.
- 제품 DESIGN.md의 토큰 reference(`{polaris.colors.primary}` 등)는 시스템 DESIGN.md의 토큰을 가리킵니다. 두 파일은 함께 읽어야 의미가 완성됩니다.
- 시스템 DESIGN.md는 `tokens.ts`에서 자동 생성되므로 직접 편집하지 마세요. 토큰을 바꿔야 하면 `packages/ui/src/tokens/*.ts`를 수정 후 `pnpm --filter @polaris/ui build:design-md`.

## 어떤 프로젝트에서 적용되나

**Polaris Office 웹 서비스**(React/Next.js 앱)를 만들거나 수정할 때만 이 규칙을 따릅니다. 무관한 React 프로젝트에는 적용하지 마세요.

판단 기준:
- `package.json`에 `@polaris/ui` 또는 `@polaris/lint`가 의존성으로 있으면 적용
- `eslint.config.*`에 `@polaris/lint`가 있으면 적용
- 위 둘 다 없는데 사용자가 "폴라리스 디자인 시스템 적용" 등을 요청하면 적용

## 핵심 규칙

### 1. UI 요소는 `@polaris/ui` 우선

```ts
import {
  // Tier 0 (12) — basic blocks
  Button, Input, Textarea, Card, Badge, Avatar, Dialog, Toast, Tabs,
  FileIcon, FileCard, NovaInput,
  // Tier 1 (6) — shell + menus
  DropdownMenu, Tooltip, Select, Sidebar, Navbar, PromptChip,
  // Tier 2 (7) — auxiliary UI
  Checkbox, Switch, Skeleton, Alert, Pagination, Breadcrumb, EmptyState,
  // Tier 2.5 (4) — layout / structural
  Stack, Container, Drawer, Table, DescriptionList,
  // (v0.8: HStack/VStack 제거 — `<Stack direction="row">` / `<Stack>` 으로 통합)
  // Tier 3 — date / overlay / command (Calendar · Command은 experimental)
  Popover, Calendar, DatePicker, DateRangePicker,
  CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem,
  // Server-action friendly
  DropdownMenuFormItem,
  // Toast imperative API
  Toaster, useToast, toast,
} from '@polaris/ui';

// Form/FormField는 react-hook-form 의존이므로 subpath:
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage,
} from '@polaris/ui/form';

// 에디터 / 도큐먼트 제품(MS Office 스타일 리본 + MD 에디터 등):
import {
  Ribbon, RibbonTabs, RibbonTabList, RibbonTab, RibbonContent,
  RibbonGroup, RibbonStack, RibbonRow,
  RibbonSeparator, RibbonRowDivider,
  RibbonButton, RibbonMenuButton, RibbonSplitButton,
  RibbonToggleGroup, RibbonToggleItem,
} from '@polaris/ui/ribbon';

// v0.7+ — 디자인팀 SVG 자산 (65 UI 아이콘 + 29 파일 + 로고 + 91 리본)
import { ArrowDownIcon, ChevronRightIcon, SearchIcon } from '@polaris/ui/icons';
import { DocxIcon, FolderIcon, ZipIcon } from '@polaris/ui/file-icons';
import { PolarisLogo, NovaLogo } from '@polaris/ui/logos';
// 리본 전용 (Office 리본 버튼용 멀티컬러 아이콘 — 57 big × 32 + 34 small × 16):
import { BoldIcon, PasteIcon, AiChatIcon } from '@polaris/ui/ribbon-icons';
```

native `<button>`, `<input>`, `<textarea>`, `<select>`, `<dialog>`은 **feature 코드에서 금지**. ESLint 룰 `@polaris/prefer-polaris-component`가 차단합니다 (단, `<button type="submit">`는 form-control 패턴이라 허용).

### 2. 색상 — v0.7 spec 토큰 우선

**v0.7부터 시맨틱 토큰이 spec 명명으로 재정렬됐고, v0.8에서 v0.6/rc.0/v0.7 alias가 모두 제거됐습니다.** 새 코드는 아래 표 기준 spec 이름만 사용. 옛 alias가 남아 있는 코드는 codemod 한 번으로 자동 변환: `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` (v0.6→v0.8 점프도 한 번에 처리). 자세히 → [`docs/for-consumers/migration/v0.7-to-v0.8.md`](docs/for-consumers/migration/v0.7-to-v0.8.md).

| 역할 | Tailwind class | TS 토큰 |
|---|---|---|
| 1차 텍스트 | `text-label-normal` | `label.normal` |
| 보조 텍스트 | `text-label-neutral` | `label.neutral` |
| Placeholder | `text-label-assistive` | `label.assistive` |
| 비활성 | `text-label-disabled` | `label.disabled` |
| 페이지 배경 | `bg-background-base` | `background.base` |
| Card / Dialog 표면 | `bg-layer-surface` | `layer.surface` |
| Modal dim | `bg-layer-overlay` | `layer.overlay` |
| Hover 표면 | `bg-interaction-hover` | `interaction.hover` |
| 보더 (약/일반/강조) | `border-line-{neutral,normal,strong}` | `line.*` |
| Brand 강조 (CTA) | `bg-accent-brand-normal` / `text-accent-brand-normal` | `accentBrand.normal` |
| Brand hover | `bg-accent-brand-strong` | `accentBrand.strong` |
| Brand 틴트 | `bg-accent-brand-bg` | `accentBrand.bg` |
| Black 버튼 | `bg-accent-action-normal text-static-white` | `accentAction.normal` |
| 포커스 | `ring-focus-ring` | `focus.ring` |
| 상태 텍스트/아이콘 | `text-state-{success,warning,error,info}` | `state.*` |
| 상태 배너 배경 | `bg-state-{}-bg` | `state.{}Bg` |
| AI / NOVA | `bg-ai-normal` (+ `shadow-polaris-ai`) | `ai.normal` |

```ts
import { label, background, layer, line, accentBrand, state, ai } from '@polaris/ui/tokens';
```

**금지**:
- hex/rgb/hsl 직접 사용 (`#fff`, `rgb(...)`, `hsl(...)`)
- inline style의 CSS named color (`style={{ color: 'red' }}`)
- Tailwind 임의값 (`bg-[#fff]`, `text-[red]`, `border-[#ccc]`)
- WCAG 1.4.1 위반: `state-error`/`-warning`/`-success` 작은 텍스트 단독 사용 (반드시 아이콘 동반 또는 18px+ Bold)

### 3. AI / NOVA 컨텍스트는 `ai.*` 토큰 (보라)

- AI 기능(생성/요약/자동완성/NOVA 진입점) → `bg-ai-normal text-label-inverse` + `shadow-polaris-ai` (퍼플 글로우)
- 일반 기능 → `bg-accent-brand-normal`
- 같은 화면에서 둘을 섞지 마세요

### 3-1. 시각적 브랜드 정체성 — Polaris signature 자산 적극 노출

토큰만 정확히 쓰면 *시각적으론 평범한 SaaS로 보일 수 있는* 함정이 있습니다 (외부 사이트 검수 2건 — kcas-platform.vercel.app, jane-h-oh.github.io/design-test). Polaris가 시장에서 거의 유일하게 갖는 자산을 **적극적으로 노출**해야 정체성이 드러납니다. 도메인별 매핑:

| 도메인 단서 | 사용할 자산 |
|---|---|
| AI / NOVA / 자동 작성 / 분석 | `<Button variant="ai">` + `<NovaLogo tone="white" size={16~20} />` |
| 헤로 / 핵심 stat에 AI 강조 | NOVA 그라디언트 텍스트 (`from-purple-40 to-ai-normal` + `bg-clip-text text-transparent`) — 한 단어만 |
| 파일 / 다운로드 표시 | `<FileIcon type="docx|hwp|pdf|...">` (29종) — 텍스트 "DOCX" 대신 |
| 문서 편집 / 보고서 / 제안서 작성 | `<Ribbon>` + `@polaris/ui/ribbon-icons` (91종) — Polaris의 가장 큰 차별 자산 |
| 필터 / 카테고리 chip | `<PromptChip>` (평범한 button chip 대신) |
| 사이드바 active state | `bg-accent-brand-bg` 브랜드 틴트 |
| Footer / login / 브랜드 영역 | `<PolarisLogo>` / `<NovaLogo>` |

**원칙**: (1) AI는 명시(평범 blue로 위장 ❌), (2) 파일은 아이콘으로(텍스트 ❌), (3) 편집 use case면 Ribbon 검토, (4) brand 색은 1~2 지점에만(도배 ❌).

**참고 구현**: `/proposal-platform` 데모 — 9가지 signature 자산 적용된 reference 페이지. 하단 IDENTITY CHECKLIST 섹션 참고.

### 4. 파일 타입 색상 — 컴포넌트 사용

29개 파일 타입 SVG가 `@polaris/ui` 에서 제공됩니다:

```ts
<FileIcon type="docx" size={40} />              // dispatcher
import { DocxIcon, XlsxIcon } from '@polaris/ui/file-icons';  // direct import (tree-shaking)
```

색상은 SVG 안에 baked-in. `text-file-*` 같은 v0.6 alias 클래스는 v0.8에서 제거됐습니다 — `<FileIcon>` / file-icon import만 사용.

### 5. 타이포그래피 (v0.7 spec)

- 패밀리: `font-polaris` (Tailwind) 또는 `var(--polaris-font-sans)` (CSS)
- 스케일: `text-polaris-display` (40) / `-title` (32) / `-heading1`~`-heading4` (28/24/20/18) / `-body1`~`-body3` (16/14/13) / `-caption1` (12) / `-caption2` (11)
- 모든 heading + caption은 weight 700. body는 400.
- 모바일 (≤767px) 자동 한 단계 축소 (tokens.css의 @media)
- v0.6 / rc.0 alias (`text-polaris-display-lg`, `-h1`~`-h5`, `-body`, `-meta`, `-tiny`) 은 **v0.8에서 제거** — Tailwind 빌드 시 dead-class. 잔존 코드는 `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` 로 변환.
- `font-family: ...` 직접 지정 금지
- `font-['Inter']` Tailwind 임의값 금지
- letter-spacing 수정 금지 — Pretendard 자체 메트릭 사용

### 6. 스페이싱·반경·그림자·모션·z-index

- **Spacing**: `p-polaris-{4xs,3xs,2xs,xs,sm,md,lg,xl,2xl,3xl,4xl}` (named) 또는 Tailwind 기본 (`p-4`, `gap-6`). `p-[13px]` 같은 임의값 금지.
- **Radius**: `rounded-polaris-{2xs,xs,sm,md,lg,xl,2xl,pill}`. **기본값 `md` (12px)** — Button/Card/Modal default. Input은 `sm` (8). Large CTA `lg` (16). Modal `xl` (24).
- **Shadow**: `shadow-polaris-{xs,sm,md,lg,ai}`. AI 표면 (NovaInput / AI response 카드)은 `ai` (퍼플 글로우).
- **Motion**: `duration-polaris-{instant,fast,normal,slow}` + `ease-polaris-{in-out,out,in}`.
- **Z-index**: `z-polaris-{base,dropdown,sticky,dim,modal,toast}`. `z-[숫자]` 임의값 금지.

### 7. 마침 검증

작업을 완료로 보고하기 전에 반드시:

```sh
pnpm lint
```

(폴라리스 모노레포는 root에 eslint 바이너리가 없으므로 `pnpm exec eslint .`은 실패합니다 — 항상 `pnpm lint` 또는 `pnpm --filter <pkg> lint`를 사용하세요.)

위반이 있으면 **모두 수정한 후** 보고. 자동 수정 가능한 것은 패키지 단위로:

```sh
pnpm --filter <pkg> lint --fix
```

## 새 프로젝트를 만들 때

Claude Code에서:

```
/polaris-init my-app
```

이 명령이 (1) `template-next` 클론 (2) `package.json`의 `workspace:*`를 GitHub Release 타르볼 URL로 자동 치환 (3) `pnpm install` (4) `pnpm dev`까지 한 번에 수행합니다. 수동 절차는 [`docs/for-consumers/install.md`](docs/for-consumers/install.md) 참고.

> 모노레포 내부에 새 디렉토리를 추가하는 경우는 디자인 시스템 자체의 부속 페이지(데모, 토큰 viewer, 카탈로그)일 때만. 진짜 제품 코드는 별도 repo에 두고 위 흐름으로 install.

## 기존 프로젝트를 폴라리스로 마이그레이션

진단 → 자동 수정 → 페이지 단위 수동 수정 → 강제 전환 순서:

```sh
# 1. 진단: 어디에 얼마나 위반이 있는지
npx polaris-audit

# 2. 자동 수정 가능한 항목 처리 (대상 프로젝트의 lint 스크립트로)
pnpm lint --fix

# 3. 남은 위반은 페이지 단위로 토큰으로 교체
#    - hex → var(--polaris-*) 또는 bg-brand-* 클래스
#    - 임의값 → 토큰 기반 클래스
#    - native HTML → @polaris/ui 컴포넌트

# 4. 0건 달성 후 lint를 CI에 추가
```

자세한 절차는 [`packages/plugin/commands/polaris-migrate.md`](packages/plugin/commands/polaris-migrate.md) 참고.

## 안티 패턴 — 절대 하지 말 것

- "사용자가 #FF5500을 언급했으니 그대로 박자" → ❌. 가까운 토큰을 사용하거나, 없으면 사용자에게 토큰 추가 여부 확인.
- "shadcn/MUI에 비슷한 게 있으니 가져다 쓰자" → ❌. `@polaris/ui`에 없으면 토큰만 써서 인라인 구현.
- "lint 룰을 disable로 우회하자" → ❌. 룰을 끄면 디자인 시스템의 의미가 사라집니다. 룰이 false-positive면 사용자에게 보고.
- "임의값이 더 짧다" → 무관. 토큰 클래스가 무조건 우선.

## 푸시 전 검증

CI를 깨뜨리는 회귀를 막으려면 push 전에 `pnpm verify`를 한 번 돌리세요. CI의 14개 step을 동일 순서로 실행 — 첫 실패에서 멈추고 stdout/stderr 마지막 부분을 출력합니다.

```sh
pnpm verify             # ~30s (e2e 제외)
pnpm verify --with-e2e  # +30s (Playwright 28 시각 회귀)
```

자동화 (opt-in git pre-push hook):

```sh
pnpm verify:install-hook  # 한 번만 실행
# 이후 git push가 자동으로 verify를 거침. 실패 시 push 차단.
# 비상 우회: git push --no-verify
# 제거: rm .git/hooks/pre-push
```

## 추가 자료

- [DESIGN.md](DESIGN.md) — 시스템 spec (Stitch 형식, auto-generated)
- [메인 README](README.md) — 시스템 전체 개요
- [tokens.md](tokens.md) — 토큰 사양 (사람용 reference)
- 라이브 데모: https://polarisoffice.github.io/PolarisDesign/
- 컴포넌트 카탈로그: https://polarisoffice.github.io/PolarisDesign/#/components
- 디자인 토큰: https://polarisoffice.github.io/PolarisDesign/#/tokens
- 디자인 자산 (로고/아이콘): https://polarisoffice.github.io/PolarisDesign/#/assets
