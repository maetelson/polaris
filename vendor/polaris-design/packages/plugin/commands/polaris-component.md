---
description: @polaris/ui 컴포넌트·아이콘·로고 사용/추가 가이드
argument-hint: <컴포넌트 이름>
---

요청한 컴포넌트: $ARGUMENTS

### 1. @polaris/ui에 이미 있는지 확인

```sh
grep -E "^export (const|function|interface|type) $ARGUMENTS\b" node_modules/@polaris/ui/dist/index.d.ts || echo "Not found in root"
```

루트에 없으면 subpath도 확인:
```sh
grep -E "$ARGUMENTS\b" node_modules/@polaris/ui/dist/{form,ribbon,icons,file-icons,logos}/index.d.ts 2>/dev/null
```

또는 데모 카탈로그에서 시각 확인:
- 컴포넌트 — <https://polarisoffice.github.io/PolarisDesign/#/components>
- 아이콘 / 파일 아이콘 / 로고 — <https://polarisoffice.github.io/PolarisDesign/#/icons>
- 토큰 (색상·타이포·radius·shadow·motion·z·breakpoint) — <https://polarisoffice.github.io/PolarisDesign/#/tokens>

### 2. 있다면 — 그대로 import

```tsx
// 일반 컴포넌트
import { $ARGUMENTS } from '@polaris/ui';

// 폼
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@polaris/ui/form';

// 에디터 리본
import {
  Ribbon, RibbonTabs, RibbonTabList, RibbonTab, RibbonContent,
  RibbonGroup, RibbonStack, RibbonRow, RibbonRowDivider, RibbonSeparator,
  RibbonButton, RibbonMenuButton, RibbonSplitButton,
  RibbonToggleGroup, RibbonToggleItem,
} from '@polaris/ui/ribbon';

// v0.7+ 디자인팀 SVG 자산
import { ArrowDownIcon, ChevronRightIcon, SearchIcon } from '@polaris/ui/icons';
import { DocxIcon, FolderIcon, ZipIcon } from '@polaris/ui/file-icons';
import { PolarisLogo, NovaLogo } from '@polaris/ui/logos';
// 리본 전용 아이콘 (Office 리본 버튼 안에서만 사용 — 57 big × 32 + 34 small × 16):
import { BoldIcon, PasteIcon, AiChatIcon } from '@polaris/ui/ribbon-icons';
```

prop·variants를 임의로 추가하지 말 것. 부족하다고 느끼면 4번으로.

### 3. 없다면 — 인라인으로 만들되 v0.7 토큰만 사용

이 프로젝트에서 한 번만 쓰는 단순 컴포넌트라면 로컬 파일에 만들어도 됩니다. 단:

| 카테고리 | v0.7 spec 클래스 |
|---|---|
| 텍스트 | `text-label-{normal,neutral,alternative,assistive,inverse,disabled}` |
| 페이지 배경 | `bg-background-base`, `bg-background-disabled` |
| Card / Dialog 표면 | `bg-layer-surface` |
| Modal dim | `bg-layer-overlay` |
| Hover / Pressed | `bg-interaction-{hover,pressed}` |
| Fill (틴트) | `bg-fill-{neutral,normal,strong}` |
| 보더 | `border-line-{neutral,normal,strong,disabled}` |
| Brand 강조 | `bg-accent-brand-{normal,strong,bg,bg-hover}`, `text-accent-brand-normal` |
| Black 액션 | `bg-accent-action-normal text-static-white` |
| 포커스 ring | `ring-focus-ring` |
| 상태 (+ 아이콘 동반!) | `text-state-{success,warning,error,info}`, `bg-state-{}-bg` |
| AI / NOVA | `bg-ai-normal text-label-inverse` + `shadow-polaris-ai` |
| 폰트 크기 | `text-polaris-{display,title,heading1-4,body1-3,caption1-2}` |
| Spacing (named) | `p-polaris-{4xs..4xl}` (또는 Tailwind 기본) |
| Radius | `rounded-polaris-{2xs,xs,sm,md,lg,xl,2xl,pill}` (default `md` 12px) |
| Shadow | `shadow-polaris-{xs,sm,md,lg,ai}` |
| Motion | `duration-polaris-{instant,fast,normal,slow}`, `ease-polaris-{in-out,out,in}` |
| Z-index | `z-polaris-{base,dropdown,sticky,dim,modal,toast}` |

v0.6 / rc.0 / v0.7 alias (`bg-brand-primary`, `text-fg-primary`, `bg-surface-{canvas,raised,sunken,border}`, `bg-status-danger`, `bg-background-{normal,alternative}`, `text-polaris-{display-lg,h1..h5,body,meta,tiny}`, `rounded-polaris-full`, `bg-blue-5` 등)은 **v0.8에서 제거**. 새 코드는 위 spec 이름만 사용. 자동 변환: `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` (token / Tailwind / CSS 변수 / JSX prop / `<HStack>`·`<VStack>` 한 번에). 자세히 → `docs/for-consumers/migration/v0.7-to-v0.8.md`.

`@polaris/ui` 안에 들어가야 할 정도로 재사용성이 있다면 4번으로.

### 4. @polaris/ui에 추가가 필요하면

사용자에게 알리세요: "이 컴포넌트는 재사용 가치가 있어서 `@polaris/ui` 패키지에 추가하는 게 좋겠습니다. 추가 PR을 띄울까요?"

단독 프로젝트에서 임의로 만들고 끝내지 말 것 — 다음 프로젝트에서 또 누군가가 같은 걸 만들면 결국 일관성이 깨집니다.
