# polaris-design (Claude Code plugin)

폴라리스 디자인 시스템 준수를 모델 측에서 강제하는 [Claude Code](https://claude.com/claude-code) 플러그인. 스킬·슬래시커맨드·PostToolUse 훅을 한 묶음으로 제공합니다.

루트 [README](../../README.md)에 전체 시스템 설명이 있습니다.

## 설치

### 옵션 A: 로컬 마켓플레이스 (개발 / 파일럿 — Claude Code CLI)

PolarisDesign repo 자체가 mini-marketplace로 동작하도록 루트에 [`.claude-plugin/marketplace.json`](../../.claude-plugin/marketplace.json)을 둡니다. **로컬 심링크 방식은 현재 Claude Code에서 동작하지 않으니** 다음 흐름을 사용하세요:

```sh
git clone https://github.com/PolarisOffice/PolarisDesign.git
cd PolarisDesign
```

Claude Code(CLI) 세션 안에서:

```
/plugin marketplace add .              # 현재 디렉토리의 marketplace.json 등록
/plugin install polaris-design@polaris-design
```

> ⚠️ Claude **데스크탑** 앱은 plugin 시스템을 노출하지 않습니다 — 플러그인을 활용하려면 Claude Code CLI 세션을 사용해야 합니다.

레포에 변경이 들어오면 다음으로 갱신:

```
/plugin marketplace update
/plugin install polaris-design@polaris-design     # 최신 버전 재설치
```

(설치된 플러그인은 `~/.claude/plugins/cache/` 안에 복사본으로 보관되며 source repo 변경이 자동으로 반영되지 않습니다.)

### 옵션 B: 원격 마켓플레이스 (배포 단계)

사내 마켓플레이스 git URL이 정해지면 — 또는 PolarisDesign repo URL 자체를 직접 register할 수도 있습니다:

```
/plugin marketplace add PolarisOffice/PolarisDesign
/plugin install polaris-design@polaris-design
```

GitHub repo URL은 그대로 인식됩니다 (`https://github.com/PolarisOffice/PolarisDesign` 또는 shorthand `PolarisOffice/PolarisDesign`).

## 구성

### 스킬 — `polaris-web`

설명: "Use when creating, editing, or adding features to a Polaris Office web service."

폴라리스 웹 서비스를 만들/수정할 때 자동 트리거되어 모델에게 다음을 강제합니다 (v0.7+ spec):
- 신규는 `/polaris-init`, 기존은 `/polaris-migrate` (codemod 단계 포함)로 시작
- UI 요소는 `@polaris/ui` 컴포넌트 우선 — 신규 v0.7 entry: `@polaris/ui/icons` (65 × 18/24/32 px) · `/file-icons` (29 타입) · `/logos`
- 색상은 v0.7 시맨틱 토큰만 (`label.*` / `background.*` / `layer.*` / `accentBrand.*` / `state.*` / `ai.*`) — hex·rgb·임의값 금지
- AI / NOVA 컨텍스트는 `ai.*` (`bg-ai-normal` + `shadow-polaris-ai`), 일반은 `accentBrand.*` (`bg-accent-brand-normal`)
- State 컬러 (`text-state-error` 등)는 작은 텍스트 단독 사용 금지 — 아이콘 동반 필수 (WCAG 1.4.1)
- 변경 후 `/polaris-check`로 검증

### 슬래시커맨드

| 커맨드 | 용도 |
|---|---|
| `/polaris-init <name>` | 새 프로젝트를 `template-next`로 1줄 부트스트랩 |
| `/polaris-migrate` | 기존 프로젝트 점진적 마이그레이션 (audit → fix → enforce) |
| `/polaris-check` | 현재 프로젝트의 lint 위반 검증 (mechanical) |
| `/polaris-brand-audit` | signature 자산 적용 기회 식별 — NOVA / FileIcon / Ribbon / PromptChip (휴리스틱) |
| `/polaris-component <이름>` | 컴포넌트 사용/추가 가이드 |

### PostToolUse 훅

`Edit`/`Write`/`MultiEdit` 발생 시 변경 파일에 `npx eslint`를 실행해서 결과를 다음 턴 모델 컨텍스트에 주입합니다.

| eslint 결과 | 훅 동작 |
|---|---|
| 0 (clean) | 무동작 (silent) |
| 1 (violations) | `additionalContext`에 위반 내역 + 수정 가이드 주입 |
| 2 (config error) | 1시간당 1회 "ESLint 미설정" 안내 (cwd 해시 기반 marker) |

훅 스크립트: `scripts/post-edit-lint.mjs`. 스모크 테스트: `pnpm --filter @polaris/plugin test` (17건).

## 동작 흐름 예시

1. 모델이 `<div style={{ color: '#FF0000' }}>` 작성
2. `Edit` 도구 호출 후 PostToolUse 훅 발화
3. ESLint가 `no-hardcoded-color` 위반 탐지 (hex `#FF0000`)
4. 훅이 다음 턴 컨텍스트에 위반 내역 + 수정 가이드 주입
5. 다음 턴에 모델이 자동으로 `var(--polaris-state-error)` 또는 적절한 v0.7 토큰으로 교체

이 루프가 모델이 매 토큰 결정마다 SKILL을 떠올릴 필요를 없애주는 핵심 메커니즘입니다.

## 의존성 (대상 프로젝트 측)

이 플러그인은 PostToolUse 훅에서 `npx eslint`를 호출합니다. 대상 프로젝트에 다음이 필요:

- `eslint` 설치
- `@polaris/lint` 설치
- `eslint.config.mjs`에 `polaris.configs.recommended` 적용

`/polaris-init`이 자동 세팅하지만, 기존 프로젝트는 `/polaris-migrate`의 1단계가 이를 처리합니다.
