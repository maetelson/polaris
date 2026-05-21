---
description: 기존 프로젝트를 폴라리스 디자인 시스템으로 점진적 마이그레이션
---

이 프로젝트가 폴라리스 웹 서비스인데 아직 디자인 시스템이 적용되지 않은 상태(예: 직접 hex 색상, 임의 Tailwind 값을 쓰고 있음)거나 v0.6 이전 버전을 쓰고 있다면 다음을 순서대로 진행하세요. 각 단계 끝마다 사용자에게 결과를 짧게 보고하고 다음으로 넘어갑니다.

## 1. 진단 (audit)

```sh
npx polaris-audit
```

이 명령은 ESLint를 `@polaris/lint` recommended 프리셋으로 돌려서 다음을 출력합니다:
- 총 위반 수 + 룰별 카운트 (`no-hardcoded-color`, `no-arbitrary-tailwind`, `no-direct-font-family`, `prefer-polaris-component`, `state-color-with-icon` warn, `prefer-polaris-icon` warn)
- 자주 등장하는 hex 컬러 top 10 (브랜드 색상 후보)
- 자주 등장하는 Tailwind 임의값 top 10
- 위반이 가장 많은 파일 top 10

`@polaris/lint` 가 없으면 먼저 설치:
```sh
pnpm add -D @polaris/lint @polaris/ui
```

## 2. 자동 codemod — 옛 토큰 / 컴포넌트 일괄 변환

쓰고 있는 폴라리스 버전에 따라 codemod를 단계적으로 돌립니다. v0.6 이전 / rc.0 → v0.7 이행이 끝났다면 v0.8 codemod 한 번이면 충분합니다.

### v0.7 → v0.8 (가장 최신 — BREAKING 정리)

```sh
# 미리 확인
pnpm dlx @polaris/lint polaris-codemod-v08 src

# 적용
pnpm dlx @polaris/lint polaris-codemod-v08 --apply src
```

처리 범위:
- **토큰 / Tailwind / CSS 변수**: 잔여 v0.6/rc.0 alias (`brand-*`, `text-*`, `surface-canvas/raised/sunken/border`, `status-*`, `primary-*`, `background-normal/alternative`) → spec 이름. typography legacy (`text-polaris-display-lg`, `-h1`~`-h5`, `-body`, `-meta`, `-tiny`) → spec (`text-polaris-display`, `-heading{1..4}`, `-body{1..3}`, `-caption{1,2}`). `rounded-polaris-full` → `-pill`. ramp `5` → `05`.
- **JSX prop / component**:
  - `<Button variant="outline">` → `<Button variant="tertiary">`
  - `hint` → `helperText` (Input/Textarea/Switch/Checkbox/FileInput/FileDropZone/DateTimeInput/TimeInput)
  - `<Progress tone=>` → `<Progress variant=>`
  - `<Stat deltaTone=>` → `<Stat deltaVariant=>`
  - `<HStack>` → `<Stack direction="row">`, `<VStack>` → `<Stack>`
  - `@polaris/ui` import에서 `HStack`/`VStack` → `Stack`

자세히 → [`docs/for-consumers/migration/v0.7-to-v0.8.md`](https://github.com/PolarisOffice/PolarisDesign/blob/main/docs/for-consumers/migration/v0.7-to-v0.8.md).

### v0.6 → v0.7 (이전 단계만 끝내야 한다면)

```sh
pnpm dlx @polaris/lint polaris-codemod-v07 --apply src
```

자세히 → [`docs/for-consumers/migration/v0.6-to-v0.7.md`](https://github.com/PolarisOffice/PolarisDesign/blob/main/docs/for-consumers/migration/v0.6-to-v0.7.md).

> **적용 범위 주의** — codemod는 consumer 코드 (`src/`, `apps/`, `app/`)에만 돌리세요. `@polaris/ui` 자체 소스 (특히 `packages/ui/src/{tokens,styles,tailwind}`)는 마이그레이션 안내용으로 옛 alias 이름이 docstring/주석에 들어있어서 false-positive를 보입니다.

## 3. lint 자동 수정

```sh
pnpm lint --fix
```

(프로젝트 root에 eslint 바이너리가 없어도 동작하도록 항상 `pnpm lint --fix` 를 사용. 모노레포면 `pnpm --filter <pkg> lint --fix`.)

자동 수정 전후 audit을 비교해서 줄어든 위반 수를 사용자에게 보고하세요.

## 4. 매핑 합의

audit의 "Top recurring hex colors" 결과를 토대로 사용자에게 다음을 확인:

> 자주 쓰이는 hex 색상이 다음과 같이 잡혔습니다. 각 색상이 어떤 폴라리스 v0.7 토큰에 매핑되는지 알려주세요. 그 외 색상은 어떻게 처리할지(가까운 토큰으로 흡수 / 새 토큰 추가 / 그대로 유지)도 함께 결정해야 합니다.

매핑 결정에는 다음 v0.7 spec 토큰을 사용 가능:

**브랜드 / 액션**
- `accentBrand.normal/strong/bg/bgHover` (PO Blue)
- `accentAction.normal/strong` (Black 버튼)
- `ai.normal/strong/hover/pressed` (AI Purple — NOVA 전용)

**라벨 (텍스트 / 아이콘)**
- `label.normal` (1차 텍스트)
- `label.neutral` (보조 텍스트)
- `label.alternative` (캡션, 메타)
- `label.assistive` (placeholder)
- `label.inverse` (반전 — 다크 배경 위)
- `label.disabled`

**표면 / 보더 / 인터랙션**
- `background.base/disabled` (페이지 레벨)
- `layer.surface/overlay` (카드 / 모달)
- `interaction.hover/pressed`
- `fill.neutral/normal/strong` (틴트)
- `line.neutral/normal/strong/disabled`

**상태**
- `state.success/warning/error/info` (텍스트 / 아이콘)
- `state.successBg/warningBg/errorBg/infoBg` (뱃지·배너 배경)
- `state.new` (신규 알림 dot)

**파일 타입 / 포커스 / 정적**
- `fileType.docx/hwp/xlsx/pptx/pdf` (또는 `<FileIcon type="..." />` 권장)
- `focus.ring`
- `staticColors.white/black` (모드 무관)

**컬러 램프 (시맨틱으로 표현 안 되는 경우만)**
- `bluePalette / darkBluePalette / greenPalette / orangePalette / redPalette / purplePalette` (10 step)
- 서브: `skyBluePalette / blueSupplementaryPalette / violetPalette / cyanPalette / yellowPalette`
- `grayRamp` (UI 백본)

## 5. 페이지 단위 마이그레이션 (Strangler-fig)

빅뱅 금지. 한 번에 한 페이지씩:

a. 가장 위반이 적은 파일부터 시작 (audit "Worst offender files" 역순)
b. 그 파일의 위반을 토큰으로 교체:
   - hex `#1D7FF9` → `var(--polaris-accent-brand-normal)` 또는 `bg-accent-brand-normal` 클래스
   - `bg-[#xxx]` / `p-[13px]` → 토큰 기반 클래스 (`bg-accent-brand-normal`, `p-4` / `p-polaris-md`)
   - `font-family: ...` → `font-polaris` 또는 `var(--polaris-font-sans)`
   - `<button>` → `<Button>` from `@polaris/ui`
   - state 컬러 본문 사용은 아이콘 동반 추가 (`<ErrorIcon /> 잘못된 형식입니다`)
c. `npx polaris-audit <file>` 로 그 파일만 재검증
d. 0건이면 다음 파일로

각 페이지가 끝날 때마다 사용자에게 진행 상황을 짧게 보고:
> `app/dashboard/page.tsx` 마이그레이션 완료. 위반 47건 → 0건. 다음은 `app/settings/page.tsx` (위반 32건).

## 6. 강제 전환

모든 페이지가 0건이 되면 `eslint.config.mjs` 의 룰을 그대로 두면 됩니다 (recommended 프리셋이 이미 error). 그리고 사용자에게:

> 마이그레이션 완료. 이제부터 hex 색상·임의값·직접 폰트는 lint에서 차단됩니다. CI에 lint를 추가하면 PR 단계에서도 자동 차단됩니다.

## 7. PostToolUse 훅 활성화

이 프로젝트에서 Claude Code로 작업할 때 자동 검증이 작동하도록 `polaris-design` 플러그인이 설치돼 있는지 확인:
- `~/.claude/plugins/polaris-design` 이 존재하는지
- 없으면 사용자에게 설치 방법 안내 (`packages/plugin/README.md`)

## 주의

- **시각 회귀 검증 필수**: 토큰 교체 후 페이지가 시각적으로 달라질 수 있습니다 (특히 v0.6→v0.7은 다크모드 hex / radius / 컴포넌트 크기 모두 변경됨). 페이지마다 before/after 스크린샷을 사용자에게 보여주거나, Playwright 같은 도구로 비교를 권장.
- **대량 자동치환 금지**: codemod 외에 regex로 `#xxx` → `var(--polaris-...)` 일괄치환은 위험. 같은 hex라도 컨텍스트(글자색 vs 배경색 vs 보더)에 따라 다른 토큰일 수 있음.
- **`/* eslint-disable */` 로 우회 금지**: 룰을 끄면 마이그레이션의 의미가 사라집니다. 정 안 되는 케이스(예: 외부 라이브러리 색)는 사용자에게 보고해서 토큰 추가 여부를 결정.
