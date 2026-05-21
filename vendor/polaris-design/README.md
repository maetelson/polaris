# Polaris Design System

폴라리스오피스 **바이브코딩옵스**(LLM 기반 React/Next.js 자동 생성)에서 회사 단위 일관된 디자인을 강제하는 시스템. 토큰·컴포넌트·린트·Claude Code 플러그인 한 묶음.

> 권고가 아니라 **기본값 + 자동 차단**. 토큰 쓰는 게 가장 쉬운 길이 되도록 설계 — 모델이 우회할 수 있는 경로를 4 레이어(자산 / 시작점 / 검증 / 온보딩)에서 줄입니다.

## Live demo

GitHub Pages — **<https://polarisoffice.github.io/PolarisDesign/>**

| 라우트 | 내용 |
|---|---|
| `/` | 인덱스 + 아키텍처 |
| `/#/components` | 컴포넌트 카탈로그 (37개) |
| `/#/tokens` | 디자인 토큰 — 시맨틱·램프·서브 팔레트·Spacing·Radius·Shadow·Motion·Z-index·Breakpoint |
| `/#/icons` | 65 UI 아이콘 + 29 파일 + 4 로고 |
| `/#/nova` · `/#/crm/contract` · `/#/sign/contracts` · `/#/polaris-office` | 실제 제품 시나리오 (NOVA / CRM / Sign / Office Ribbon) |

## Architecture

```
packages/
├── ui/             @polaris/ui     — 토큰 + 37 컴포넌트 + Ribbon family + 65 아이콘 + 29 파일 + 로고
├── lint/           @polaris/lint   — ESLint 6 룰 + polaris-audit + polaris-codemod-v07/v08
├── plugin/         polaris-design  — Claude Code 플러그인 (skill + 슬래시커맨드 + PostToolUse 훅)
└── template-next/  polaris-template-next — Next.js 15 부트스트랩 템플릿
apps/demo/                          — Vite 데모 (라이브 카탈로그 + 제품 시나리오)
assets/                             — 디자인팀 figma export (PNG spec + SVG 자산)
```

상세는 각 패키지 README 참조: [`packages/ui`](packages/ui/README.md) · [`packages/lint`](packages/lint/README.md) · [`packages/plugin`](packages/plugin/README.md).

## Quick start

### 모노레포 안에서 작업

```sh
git clone https://github.com/PolarisOffice/PolarisDesign.git
cd PolarisDesign
pnpm install                              # @polaris/ui prepare hook이 토큰/아이콘 source 자동 생성
pnpm --filter polaris-template-next dev   # → :3000 — 본인 앱 출발점
pnpm --filter demo dev                    # → :5173 — 컴포넌트/토큰/아이콘 카탈로그
```

> 모노레포 내부 작업은 디자인 시스템 자체의 데모 / 토큰 viewer / 카탈로그 같은 *시스템 부속물*용입니다. 사내 제품 코드는 별도 repo에 두고 아래 install 흐름을 사용하세요.

### 외부 사내 제품 repo에서 install

`@polaris/ui` / `@polaris/lint`는 [GitHub Release](https://github.com/PolarisOffice/PolarisDesign/releases)에 첨부되는 `.tgz` 타르볼로 배포됩니다. PolarisDesign이 public repo이므로 인증 / PAT 셋업 없이 `pnpm install` 한 번으로 끝납니다.

```jsonc
// 제품 repo의 package.json
{
  "dependencies": {
    "@polaris/ui": "https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.7.7/polaris-ui-0.7.7.tgz"
  },
  "devDependencies": {
    "@polaris/lint": "https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.7.7/polaris-lint-0.7.7.tgz"
  }
}
```

전체 절차(Tailwind preset 연결, ESLint config, Renovate 자동 업그레이드, 트러블슈팅): [`docs/for-consumers/install.md`](docs/for-consumers/install.md).

### Claude Code에서 부트스트랩

```
/polaris-init <name>          # 새 프로젝트 — 타르볼 URL을 자동으로 박아줌
/polaris-migrate              # 기존 코드 점진 마이그레이션
/polaris-check                # 현재 상태 lint (mechanical 위반)
/polaris-brand-audit          # signature 자산 적용 기회 (휴리스틱 — NOVA / FileIcon / Ribbon 등)
/polaris-component <name>     # 특정 컴포넌트 가이드
```

`tailwind.config.ts`에 preset, `eslint.config.mjs`에 recommended config, 진입점에 `import '@polaris/ui/styles/tokens.css'`. 자세히 → [`packages/ui/README.md`](packages/ui/README.md).

## What's new in v0.8 (rc.0)

v0.7에서 누적된 alias / 미세 비일관성을 한 번에 정리한 BREAKING 릴리스. 사내 컨슈머가 아직 소수일 때 구조적 변경을 끝내는 게 목표.

- **Alias 청소** — `bg-fg-*` / `bg-surface-{canvas,raised,sunken,border}` / `bg-brand-*` / `bg-status-*` / `bg-primary-*` / `bg-background-{normal,alternative}` / `text-polaris-{display-lg,h1..h5,body,meta,tiny,caption}` / `rounded-polaris-full` / ramp `5` 모두 v0.8 빌드에서 emit 제거
- **컴포넌트 prop 정규화** — `<Button variant="outline">` → `tertiary` / `hint` → `helperText` (Input/Textarea/Switch/Checkbox/FileInput/FileDropZone/DateTimeInput/TimeInput) / `<Progress tone>` → `variant` / `<Stat deltaTone>` → `deltaVariant`
- **HStack/VStack 단일화** — `<HStack>` / `<VStack>` 제거 → `<Stack direction="row">` / `<Stack>` (column 기본)
- **포커스 링 통일** — Button `ai` variant 별도 outline ring 제거, 모든 variant 공통 `shadow-polaris-focus` (3px). Calendar/Drawer/Pagination/Ribbon 등 일원화
- **신규 enhancement** — `Checkbox variant="ai"` (NOVA Purple) · `DialogFooter fullWidthButtons` (모바일 narrow modal에서 두 액션 half-width 페어)
- **자동 codemod** — `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` 한 번으로 token / Tailwind / CSS 변수 / JSX prop / HStack-VStack 모두 변환

마이그레이션 가이드: [`docs/for-consumers/migration/v0.7-to-v0.8.md`](docs/for-consumers/migration/v0.7-to-v0.8.md). v0.6 이전이라면 [v0.6-to-v0.7](docs/for-consumers/migration/v0.6-to-v0.7.md) 먼저 (또는 v0.8 codemod 한 번이면 v0.6→v0.8 점프도 가능).

## What's in v0.7

디자인팀 v1 (2026.05) 정의서 완전 정렬:

- **시맨틱 토큰 19개 신설** — `label.*` / `background.*` / `layer.*` / `interaction.*` / `fill.*` / `line.*` / `accentBrand.*` / `accentAction.*` / `focus.ring` / `staticColors.*` / `state.*`
- **컬러 primitive 확장** — 10단계 (`05`/`90`) × 11 family (브랜드 6 + Sky Blue/Blue/Violet/Cyan/Yellow + Gray)
- **Typography 11레벨 spec 명명** — `display`/`title`/`heading1-4`/`body1-3`/`caption1-2` + 모바일 자동 축소
- **새 토큰 시스템 4개** — Spacing (12 named) · Z-index (6) · Motion (duration + easing) · Breakpoint
- **디자인팀 SVG 자산 통합** — `@polaris/ui/icons` (65 × 3 사이즈) · `/file-icons` (29 타입) · `/logos` (Polaris + Nova)

변경 자세히: 각 패키지의 [CHANGELOG.md](packages/ui/CHANGELOG.md).

## 핵심 원칙

**4색 + NOVA = 브랜드 아이덴티티**
폴라리스 로고 4색(파·초·주·빨)이 동시에 파일 타입(DOCX·XLSX·PPTX·PDF). 토큰에서도 분리하지 않고 별칭으로 묶음(`accentBrand.normal` ≡ `fileType.docx`). NOVA 보라(`ai.*`)는 AI 컨텍스트 전용.

**권고 → 기본값 + 자동 차단**
- 자산 — 토큰을 import만 하면 자동 준수
- 시작점 — `/polaris-init` + `template-next` 가 처음부터 정렬
- 검증 — `@polaris/lint` 6 룰 + PostToolUse 훅이 우회를 즉시 잡음
- 온보딩 — `/polaris-migrate` + `polaris-audit` + `polaris-codemod-v07/v08`

## 개발

```sh
pnpm install                       # prepare 훅이 토큰/아이콘 source 생성
pnpm --filter @polaris/ui build    # tsup dist (consumer가 dist 의존)
pnpm --filter demo dev             # 라이브 카탈로그 (ui source HMR)

pnpm -r typecheck                  # 5 패키지
pnpm --filter @polaris/ui test     # 84
pnpm --filter @polaris/lint test   # 50 + 11 codemod
pnpm -w lint                       # 워크스페이스 ESLint
pnpm exec playwright test          # 28 visual baselines

# 변경사항 기록
pnpm changeset                     # PR마다 사용자 영향 있는 변경에 첨부
```

CI는 `.github/workflows/ci.yml`, 데모 배포는 `.github/workflows/deploy.yml` (main push 시 GitHub Pages).

## 문서

- [DESIGN.md](DESIGN.md) — 토큰·타이포·컴포넌트 spec (auto-generated, Stitch 형식)
- [AGENTS.md](AGENTS.md) — Codex/Cursor 등 비-Claude 에이전트 절차
- [docs/for-contributors/roadmap.md](docs/for-contributors/roadmap.md) — 릴리즈별 계획
- [docs/migration/](docs/for-consumers/migration/) — 버전별 마이그레이션 가이드
- [assets/README.md](assets/README.md) — Figma export 갱신 절차

## 로드맵 — 한눈에

| 버전 | 핵심 |
|---|---|
| v0.5.0 | Ribbon family (subpath `@polaris/ui/ribbon`) |
| v0.6.0 | Ribbon 정비 + 데모 SPA 통합 + Vite source alias HMR |
| v0.7.0 | DESIGN.md 완전 정렬 + 19 시맨틱 토큰 + 4 토큰 시스템 + 디자인팀 SVG 자산 통합 |
| v0.7.1 | `@polaris/ui/ribbon-icons` 91종 (57 big × 32 + 34 small × 16) + 폴라리스 오피스 데모 재구성 + SVG id 격리 |
| v0.7.3 | 🐛 hotfix — `accent-brand-normal-subtle` Tailwind alias 누락으로 12+ 컴포넌트 hover/active 배경 silently broken 정정 + 디자인팀 재검수 (`polaris-helper` 토큰 / FormMessage 자동 ErrorIcon / 신규 lint 룰 3종 / `/proposal-platform` / `/polaris-brand-audit` / `pnpm verify`) |
| v0.7.5 | 컨슈머(DocFlow) 피드백 + v0.8 후보를 한 번에 — 신규 컴포넌트 14종 (Progress · CopyButton · Stat · Disclosure · FileInput · FileDropZone · DateTimeInput · TimeInput · PaginationFooter · TableSearchInput · TableToolbar · TableSelectionBar · TableSkeleton + Tabs sortable). `state-*-strong` AA 토큰 / `surface.popover`·`modal` elevation / `shadow-polaris-focus` util. (37 → 51) |
| v0.7.7 | 컴포넌트 완성도 리뷰 + 코덱스 리뷰 9건 — 신규 7종 (`Combobox` · `PageHeader` · `SectionHeader` · `Accordion` · `CircularProgress` · `AvatarGroup` · `NavbarItem`) + Tabs underline variant + 13개 컴포넌트 props 추가 (autoResize / prefix-suffix / clearable / dismissible / iconLeft+Right / interactive 등). a11y/state-sync fix 9건. Demo 카탈로그 51 → 45 섹션 통합 + 6 카테고리 탭. (51 → 58 family · 235 tests) |
| v0.8.0-rc.0 | **BREAKING 청소** — deprecated alias 제거 (Tailwind/TS 토큰, `bg-status-*`, `bg-primary-*`, `bg-background-{normal,alternative}`, typography legacy, `rounded-polaris-full`, ramp `5`) + Button `outline` → `tertiary` + `hint` → `helperText` (form 컴포넌트 8종) + `<Progress tone>`·`<Stat deltaTone>` → `variant`/`deltaVariant` + `<HStack>`·`<VStack>` 제거 (Stack 단일화) + 포커스 링 통일 (`shadow-polaris-focus`). 신규: `Checkbox variant="ai"`, `DialogFooter fullWidthButtons` |
| v0.8.0-rc.1 | **Codex 리뷰 8건 fix** — `@polaris/ui` 잔존 dead-class 5곳 (Table/DropdownMenu/Select/Command/Switch) 정리, v3 preset `accent-brand-normal-subtle` CSS var 매핑 fix (v3↔v4 hover 강도 일치), codemod-v08 보강 (`@polaris/ui/tokens` import + `surface-border` 전 utility prefix), DatePicker `required` jsdoc 정확히 + `disabled` mirror, template-next/DESIGN.md / 공개 문서 v0.8 명명 갱신, e2e Ribbon locator stale fix (`data-polaris-ribbon`). verify 14/14 (release-gate에 ui-source dead-alias scan 추가) |
| v0.8.0-rc.2 | Codex 후속 리뷰 5건 fix — codemod-v08의 `brand.secondary` import 깨짐 fix, agent-facing docs v0.8 일괄 정렬, `no-deprecated-polaris-token` 룰을 typography/radius/ramp 제거 alias까지 확장, DatePicker `required` jsdoc 사실관계 정정, 공개 코드 샘플의 `hint=`/`variant="outline"` 잔존 fix |
| v0.8.0-rc.3 | Codex 추가 후속 3건 fix — codemod-v08의 `import type`에 값 namespace 추가하던 버그 fix, 잔여 "alias 아직 작동" 안내 정리, e2e visual baseline 12건 enumerate |
| v0.8.0-rc.4 | Codex 후속 리뷰 P1 1건 fix + P2/P3 정리 + e2e baseline 사인오프 흡수 — codemod-v08의 검사 namespace가 brand-family만 보던 누락 fix, `background.normal/alternative` / `radius.full` TS rewrite 추가, lint 룰 메시지 / v4-migration snippet의 v0.8 alias 정리 |
| v0.8.0-rc.5 | Codex P1 1건 fix — codemod idempotency 안전망 (rewrite gate + local declaration 충돌 검사) |
| v0.8.0-rc.6 | Codex P1 2건 + P2 1건 fix — codemod의 `<HStack>`/`<VStack>` rewrite 후 import dedupe 누락 + multi-line import body corruption fix, `<TableHead nowrap>` 추가 |
| v0.8.0-rc.7 | 실전 컨슈머 마이그레이션 P1 2건 fix — codemod 동작 모델 "best effort"에서 "fail-loud on conflict"로 전환 (silent semantic bug 차단, parseImportBody alias 인식 + dedupe by binding). codemod 29→33 |
| **v0.8.0-rc.8 (현재)** | **RSC (React Server Components) 친화 6건 묶음 + Codex P1/P2 fix** — `@polaris/ui/utils` 신규 subpath (`pageNumberItems` server-safe), `<PaginationFooter>` anchor mode (`buildHref` + `linkAs`), `<PaginationPrev/Next>` asChild fix (Slottable + `icon` prop), `<TableSearchInput>` 자동 controlled/uncontrolled 감지, `<TableToolbar searchProps>` 주입, `<TabsTrigger asChild>` URL-routed 패턴 JSDoc. `PaginationFooterProps` 타입을 discriminated union으로 강제 (controlled \| anchor 중 하나 필수, rc.7 inert-toolbar footgun 차단). `docs/for-consumers/migration/rsc-patterns.md` 신규. tests 267→**279** (+12). Server Component 직접 호출 caveat 명시 (함수/컴포넌트 prop 직렬화 불가 → client island 또는 utils raw `<Link>` 패턴) |
| v0.8.x | 디자인팀 컨펌 결과 반영 (Checkbox AI tone / DialogFooter spacing 토큰 수치 — API 변경 없음) + 코덱스 리뷰 후속 patch |
| v1.0 | NumberInput · Slider · CodeBlock · DataTable 안정화 + 디자인팀 follow-up 6건 (Tertiary 2종 / Modal 풀 너비 / Checkbox 4종 + AI Purple / Alert 결정) + 사인오프 |

자세히 → [docs/for-contributors/roadmap.md](docs/for-contributors/roadmap.md).

## License

사내용 — Polaris Office. 외부 공개 시 라이선스 정책 별도 결정.
