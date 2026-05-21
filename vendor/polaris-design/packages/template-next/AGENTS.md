# Agent instructions — Polaris template app

Codex / Cursor / 기타 코드 에이전트가 이 프로젝트(이 템플릿에서 시작된 폴라리스 웹 서비스)에서 작업할 때 따라야 할 절차입니다. 이 파일은 `tiged`로 클론될 때 함께 복사되어, 사용자가 모노레포에서 분리해 새 앱으로 발전시킬 때 디자인 시스템 제약이 사라지지 않도록 보장합니다.

원본은 [`@polaris/PolarisDesign/AGENTS.md`](https://github.com/PolarisOffice/PolarisDesign/blob/main/AGENTS.md). 시스템 전체 맥락이 필요하면 그쪽을 보세요.

## 0. 시작 전 — DESIGN.md를 1차 spec으로 읽기

작업 시작 전에 두 DESIGN.md를 모두 읽으세요:

1. **시스템 spec** — 폴라리스 모노레포 루트의 [`DESIGN.md`](https://github.com/PolarisOffice/PolarisDesign/blob/main/DESIGN.md) ([Stitch 형식](https://stitch.withgoogle.com/docs/design-md/specification/)). 토큰·타이포·기본 컴포넌트가 기계가 읽는 YAML과 사람이 읽는 prose로 정의되어 있습니다.
2. **제품 spec** — 이 프로젝트 root의 [`DESIGN.md`](DESIGN.md). 이 제품 고유의 색상·레이아웃·composite 컴포넌트가 적혀 있습니다.

제품 DESIGN.md의 `{polaris.<group>.<name>}` reference는 시스템 DESIGN.md의 토큰을 가리킵니다. **두 파일은 함께 읽어야 의미가 완성**됩니다.

DESIGN.md에 없는 사항을 결정해야 한다면 우선 사용자에게 확인. 임의로 추가하거나 우회하지 마세요.

## 이 프로젝트의 정체

이 앱은 **`@polaris/ui` 디자인 시스템 위에 만들어진 폴라리스 웹 서비스**입니다. 따라서:

- 색상은 토큰만 사용 (hex/rgb/CSS named color 금지)
- 컴포넌트는 `@polaris/ui` 우선 (native `<button>`/`<input>` 등 금지)
- 폰트는 Pretendard, 타이포 스케일은 `text-polaris-*` 클래스
- `pnpm lint`가 위반을 자동 차단하며, 작업 완료 보고 전 반드시 0건이어야 함

## 핵심 규칙 (요약)

```ts
// ✓ 컴포넌트
import { Button, Input, Card, NovaInput, FileCard, FileIcon } from '@polaris/ui';
import { ArrowDownIcon, SearchIcon, BellIcon } from '@polaris/ui/icons';
import { PolarisLogo, NovaLogo } from '@polaris/ui/logos';

// ✓ v0.7 spec 컬러 클래스
'bg-accent-brand-normal text-label-normal border-line-normal bg-state-error-bg'
'bg-layer-surface' (Card/Dialog)  'bg-background-base' (Page)
'text-label-{normal,neutral,alternative,assistive,inverse,disabled}'
'rounded-polaris-md' (Button/Card/Modal default = 12px)

// ✗ 금지
'#FF0000', 'rgb(...)',
'bg-[#fff]', 'p-[13px]', "font-['Inter']",
<button>...</button>, <input ... />,
style={{ color: 'red' }}
```

v0.6 / rc.0 / v0.7 alias (`bg-brand-primary`, `text-fg-primary`, `bg-surface-{canvas,raised,sunken,border}`, `bg-status-danger`, `bg-background-{normal,alternative}`, `text-polaris-{display-lg,h1..h5,body,meta,tiny}`, `rounded-polaris-full`, `bg-blue-5` 등)는 **v0.8에서 제거됨** — 빌드 시 emit 안 되므로 dead-class. 자동 변환:
```sh
pnpm dlx @polaris/lint polaris-codemod-v08 --apply src
```
한 번에 token / Tailwind / CSS 변수 / JSX prop / `<HStack>`·`<VStack>` 까지 정리. 자세히 → [`docs/for-consumers/migration/v0.7-to-v0.8.md`](../../docs/for-consumers/migration/v0.7-to-v0.8.md).

### AI / NOVA 컨텍스트 (`ai.*` 보라)

- AI 기능(생성/요약/자동완성/NOVA 진입점) → `bg-ai-normal text-label-inverse` + `shadow-polaris-ai`
- 일반 기능 → `bg-accent-brand-normal` (파랑)
- 같은 화면에서 둘을 섞지 마세요

### State 컬러는 색상 단독 사용 금지 (WCAG 1.4.1)

`text-state-error/-warning/-success` 작은 텍스트 단독 사용은 contrast AA 미달입니다.
- ✅ 아이콘 동반: `<ErrorIcon /> 형식이 올바르지 않습니다`
- ✅ 18px+ Bold
- ✅ 뱃지 (`bg-state-error-bg` + Caption1 12 / 700)
- ❌ 14px 본문 단독 (lint 룰 `@polaris/state-color-with-icon` 가 경고)

### 파일 타입 — `<FileIcon>` 또는 직접 import

```tsx
<FileIcon type="docx" size={40} />              // dispatcher (29 타입)
import { DocxIcon, FolderIcon } from '@polaris/ui/file-icons';  // direct (tree-shaking)
```

색상은 SVG에 baked-in. `text-{color}` 로 색상 변경 불가.

## 작업 종료 전 검증

```sh
pnpm lint        # @polaris/lint — 0건 필수
pnpm typecheck
```

위반이 남아 있으면 작업 완료 보고 금지. 자동 수정 가능 항목은 `pnpm lint --fix`.

## 사용 가능한 컴포넌트 (36개)

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
  // Tier 3 (5) — date / overlay / command (Calendar·Command은 experimental)
  Popover, Calendar, DatePicker, DateRangePicker,
  CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem,
  // Server-action friendly
  DropdownMenuFormItem,
  // Toast imperative API
  Toaster, useToast, toast,
} from '@polaris/ui';

// Form/FormField는 react-hook-form이 함께 필요하므로 subpath import:
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage,
} from '@polaris/ui/form';

// 에디터 / 문서 제품(Office 리본 / MD 에디터 등)을 만들 때만 subpath:
import {
  // tabs + content
  Ribbon, RibbonTabs, RibbonTabList, RibbonTab, RibbonContent,
  // layout primitives
  RibbonGroup, RibbonStack, RibbonRow,
  RibbonSeparator, RibbonRowDivider,
  // controls
  RibbonButton, RibbonMenuButton, RibbonSplitButton,
  RibbonToggleGroup, RibbonToggleItem,
} from '@polaris/ui/ribbon';
//
// 컨트롤 선택 가이드:
// - RibbonButton          — 단순 액션 (저장, 새 페이지, …)
// - RibbonMenuButton      — chevron 클릭 시 메뉴만 열림 (여백, 용지 방향, …)
// - RibbonSplitButton     — 메인 액션 + 옆/아래 chevron (붙여넣기, 글머리 기호, …)
// - RibbonToggleGroup/Item — 토글 상태 (B/I/U, 정렬, 변경 추적, …)
//
// 레이아웃 가이드:
// - RibbonGroup           — 그룹 컨테이너. 여러 컨트롤을 묶음
// - RibbonStack           — 그룹 안 세로 컬럼 (잘라내기/복사/서식복사 같은 stack)
// - RibbonRow             — Stack 안 가로 행 (Office 클래식 2-row 구성)
// - RibbonSeparator       — 그룹 사이 풀-높이 세로선
// - RibbonRowDivider      — 같은 Row 안 클러스터 사이 짧은 세로선 (B I U S | X₁ X² …)
```

새 컴포넌트가 필요하면 임의로 만들지 말고 사용자에게 보고. 단순 한 번 쓰는 조합은 토큰만 써서 인라인으로 만들어도 됨.

## 안티 패턴 — 절대 하지 말 것

- "사용자가 #FF5500을 언급했으니 그대로 박자" → ❌. 가까운 토큰 사용. 없으면 토큰 추가 여부 사용자 확인.
- "shadcn/MUI에 비슷한 게 있으니 가져다 쓰자" → ❌. `@polaris/ui`에 없으면 토큰만으로 인라인 구현.
- "lint 룰을 disable로 우회하자" → ❌. 룰을 끄면 시스템의 의미가 사라짐.
- "임의값이 더 짧다" → 무관. 토큰 클래스가 항상 우선.
