# @polaris/lint

폴라리스 디자인 시스템 토큰 우회를 차단하는 ESLint 9 플러그인 + `polaris-audit` CLI.

루트 [README](../../README.md)에 전체 시스템 설명이 있습니다. 이 문서는 패키지 사용법만 다룹니다.

## 설치

PolarisDesign이 사내 npm registry에 publish되기 전 단계라, `@polaris/lint`는 [GitHub Release](https://github.com/PolarisOffice/PolarisDesign/releases)의 `.tgz` 타르볼로 배포됩니다. Public repo이므로 인증 불요.

`package.json`에 직접 추가:

```jsonc
{
  "devDependencies": {
    "@polaris/lint": "https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.7.7/polaris-lint-0.7.7.tgz",
    "eslint": "^9.0.0"
  }
}
```

그리고 `pnpm install`. 전체 셋업: [`docs/for-consumers/install.md`](../../docs/for-consumers/install.md).

## ESLint 설정

ESLint 9 flat config 기준:

```js
// eslint.config.mjs
import polaris from '@polaris/lint';

export default [
  ...polaris.configs.recommended,
  // 기존 룰 추가는 여기에
];
```

`recommended` 프리셋이 다음을 포함합니다:
- TypeScript 파일(`*.ts`, `*.tsx`, `*.mts`, `*.cts`)에 `@typescript-eslint/parser` 자동 적용
- 4가지 룰을 `error` 레벨로 설정

## 룰

### `@polaris/no-hardcoded-color`

다음을 차단합니다:
- hex 색상 — `#fff`, `#1D4ED8`, `#80808080`
- CSS 색상 함수 — `rgb(...)`, `rgba(...)`, `hsl(...)`, `hsla(...)`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`
- inline style의 CSS named color — `style={{ color: 'red' }}`, `style={{ background: 'blue' }}`

허용되는 값: `transparent`, `currentColor`, `inherit`, `initial`, `unset`, `revert`, `none`, `var(--polaris-*)`.

### `@polaris/no-arbitrary-tailwind`

`bg-[#xxx]`, `p-[13px]`, `text-[24px]`, `rounded-[14px]` 같은 Tailwind 임의값(arbitrary value) 차단. 토큰 기반 클래스로 교체하도록 강제 (`bg-brand-primary`, `p-4`, `text-polaris-heading-lg`, `rounded-polaris-lg`).

### `@polaris/no-direct-font-family`

다음을 차단합니다:
- inline style의 `fontFamily` (`var(--polaris-font-*)` 외)
- CSS 텍스트의 `font-family: ...` 선언
- Tailwind 임의 폰트 클래스 `font-['Inter']`

대체: `var(--polaris-font-sans)` / `var(--polaris-font-mono)` 또는 `font-polaris` / `font-polaris-mono` 클래스.

### `@polaris/prefer-polaris-component`

native HTML 요소를 `@polaris/ui` 컴포넌트로 교체하도록 강제:

| Native | 대체 |
|---|---|
| `<button>` | `<Button>` |
| `<input>` | `<Input>` |
| `<textarea>` | `<Textarea>` |
| `<select>` | `<Select>` |
| `<dialog>` | `<Dialog>` |

`@polaris/ui` 내부 또는 primitive 레이어에서는 `// eslint-disable-next-line` 허용.

## `polaris-audit` CLI

기존 프로젝트의 토큰 비준수율을 정량 측정:

```sh
npx polaris-audit [target-dir]
```

다음을 출력합니다:
- 스캔 파일 수, 위반 있는 파일 수, 총 위반 수
- 룰별 카운트 (4가지 모두)
- 자주 등장하는 hex 색상 top 10 (브랜드 색상 후보)
- 자주 등장하는 Tailwind 임의값 top 10
- 위반이 가장 많은 파일 top 10

프로젝트에 `eslint.config.*`이 없으면 임시 설정을 생성해서 동작합니다 — `@polaris/lint`만 설치돼 있으면 즉시 실행 가능.

종료 코드: 위반 0건이면 0, 있으면 1 (CI에서 활용 가능).

## `polaris-codemod-v07` CLI

v0.6 → v0.7 토큰명·Tailwind 클래스·CSS 변수 일괄 변환:

```sh
# 사전 확인 (변경하지 않음)
npx polaris-codemod-v07 src

# 적용
npx polaris-codemod-v07 --apply src

# CI: 마이그레이션이 남아 있으면 실패
npx polaris-codemod-v07 --check src
```

처리 항목 (자세한 매핑은 [v0.6→v0.7 가이드](../../docs/for-consumers/migration/v0.6-to-v0.7.md) 참조):
- TS/TSX 토큰 멤버 접근: `text.primary` → `label.normal` 등
- Tailwind 유틸리티: `text-fg-primary` → `text-label-normal`, `rounded-polaris-full` → `rounded-polaris-pill`
- CSS 커스텀 속성: `--polaris-text-primary` → `--polaris-label-normal`

`node_modules`, `dist`, `.next`, `.turbo` 등은 자동으로 건너뜁니다. 동적으로 조립된 클래스명(`\`text-${tone}-primary\``)은 처리되지 않으니 codemod 적용 후 IDE에서 정의되지 않은 import를 함께 정리하세요.

## 개발

```sh
pnpm --filter @polaris/lint build
pnpm --filter @polaris/lint test  # RuleTester 기반 42건
```
