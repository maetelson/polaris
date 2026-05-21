# @polaris/lint

## 0.7.7

### Patch Changes

- `meta.version` `0.7.5` → `0.7.7` (sync-root-version에 의한 자동 갱신).

## 0.7.5

### Patch Changes

- `polaris-audit` CLI temp config가 임시 디렉토리(`/tmp/polaris-audit-*/`)에 `node_modules`가 없어 `import polaris from '@polaris/lint'` resolve 실패하던 버그 fix. `createRequire(import.meta.url).resolve('@polaris/lint', { paths: [target] })` + `pathToFileURL`로 절대 file URL을 inject. target 우선, audit 스크립트 자체 location fallback. 미설치 시 친절한 안내 메시지로 종료.

- `meta.version` `0.7.3` → `0.7.5` (sync-root-version에 의한 자동 갱신).

## 0.7.3

### Patch Changes

- 96ad78a: 디자인팀 v0.7.2 재검수의 자동 처리 가능 항목 6건 정리. 디자인 조율이 필요한 7건은 [`docs/for-design-team/followup.md`](../../docs/for-design-team/followup.md)로 분리.

  **`variant="outline"` (deprecated) → `variant="tertiary"` 일괄 마이그레이션 (22곳)**

  `apps/demo` 21곳 + `packages/ui/src/components/DatePicker.tsx` 2곳 (Button trigger). Components 카탈로그의 `<Button variant="tertiary">Outline</Button>` showcase 줄도 라벨을 "Tertiary"로 정정 — outline은 더 이상 표면에 노출되지 않음.

  **`status-*` v1 토큰 → `state-*` v2 토큰 (24줄, 6 컴포넌트)**

  `Alert`, `Badge`, `DropdownMenu`, `Checkbox`, `Textarea`, `Form` 컴포넌트에서 `text-status-{success,warning,info,danger}`, `bg-status-X/<alpha>`, `border-status-X`, `outline-status-X`, `ring-status-X` 등을 모두 v0.7 spec의 `state-*`로 마이그레이션. 매핑:

  - `success`/`warning`/`info` → 동명
  - `danger` → `error` (rename)
  - `bg-status-X/N` (alpha-blended) → `bg-state-X-bg` (디자인된 light tint)

  `DropdownMenu`의 destructive variant도 같이 정합. 옛 alpha 기반 추정 색이 디자인팀 spec의 정식 `*-bg` 토큰으로 교체되어 다크 모드에서도 의도한 색이 정확히 나옵니다.

  **Form helper / error / floating-label 텍스트 weight 정정 (7곳)**

  `polaris-caption1` 토큰은 spec상 weight 700이지만, form 컨텍스트의 helper / error / description / floating-label은 Regular(400)이 정확. 토큰 자체는 그대로 두고 사용처에 `font-normal` 명시:

  - `Form.tsx`: FormDescription, FormMessage
  - `Input.tsx`: 플로팅 라벨, error message, helper message
  - `Checkbox.tsx`: error / description text
  - `Textarea.tsx`: error / description text

  caption1 토큰을 통째로 Regular로 바꿀지(다른 사용처 영향) 별도 helper 토큰을 만들지는 디자인팀 follow-up 항목 #6.

  **Test / Visual 회귀**

  - 테스트 89/89 통과 (`Alert.test`, `Badge.test`의 status-* 어서션도 state-*로 갱신)
  - Playwright 28/28 통과 (마이그레이션으로 인한 시각 변화는 baseline에 반영)
  - `pnpm -r typecheck` 깨끗

  **Follow-up — 디자인 조율 필요한 7건**

  [`docs/for-design-team/followup.md`](../../docs/for-design-team/followup.md):

  1. Button Tertiary 2종 분리 (흰 배경 + 회색 배경)
  2. Modal/Dialog 풀 너비 버튼 레이아웃
  3. Checkbox 4가지 형태 분리 (사각/원/체크마크/라디오)
  4. Checkbox AI Purple variant
  5. Alert 제거 vs 별도 분류 결정
  6. Helper text weight: caption1 토큰 변경 vs 별도 helper 토큰 신설
  7. FormMessage 에러 아이콘 일관성 (+ 보너스: 디자인팀 검수 절차 확립)

  각 항목별 답변 후 컴포넌트 단위 PR로 진행. 자동 처리분만 v0.7.3에 우선 반영해 회귀 차단.

- 252cbde: DESIGN.md §4 Inputs & Forms에 명시된 폼 helper / error 텍스트 spec 정합.

  **`polaris-helper` 타이포그래피 토큰 신설** — 12px / weight 400 / lh 1.3.

  DESIGN.md가 Floating Title과 Error Text 모두 `--font-size-xxs (12px) / --weight-regular`로 명시. 기존 `polaris-caption1` 토큰은 spec상 weight 700 (badges, tags 용도)이라 그대로 유지. 의미상 다른 두 사용처를 별도 토큰으로 분리해 향후 단일 변경으로 모든 폼 helper 텍스트가 따라가도록 정합.

  마이그레이션 (7곳):

  - `Form.tsx` FormDescription, FormMessage
  - `Input.tsx` floating label / error / helper
  - `Checkbox.tsx` error / hint
  - `Textarea.tsx` error / hint

  이전 v0.7.3의 임시 `text-polaris-caption1 font-normal` 패치를 `text-polaris-helper`로 정식 토큰화. caption1 token 자체는 무변경.

  **`FormMessage` 자동 ErrorIcon prepend** — DESIGN.md §4 명시:

  > 필수: 아이콘 동반 (X 또는 ⚠️, 16px) — 텍스트 좌측에 4px gap. 색상만으로 에러를 전달하지 않음 (WCAG 1.4.1)
  >
  > 레이아웃: `[icon] Error message text` — 아이콘과 텍스트 모두 `--state-error` 색상

  `Form.tsx`의 `FormMessage`가 자동으로 `<ErrorIcon size={16} />`을 prepend. `flex items-start gap-polaris-3xs`, `role="alert"` 적용. react-hook-form 컨트롤러 흐름에서 모든 폼 에러가 일관된 시각/접근성 패턴으로 표시됨.

  **`Checkbox` / `Textarea` 에러 상태 일관성** — 같은 ErrorIcon + flex 레이아웃 적용. hint 상태는 텍스트만(아이콘 없음). 폼 컴포넌트 패밀리 전체가 동일 spec.

  **시각 회귀 baseline**: components-catalog (desktop + mobile) 갱신.

  **나머지 디자인팀 답이 필요한 5+1건은 docs/for-design-team/followup.md로 분리**:

  - Tertiary / Ghost 정합 (DESIGN.md 부분 답)
  - Modal 풀 너비 버튼 layout (DESIGN.md 미정)
  - Checkbox 4가지 형태 + RadioGroup 신설 (DESIGN.md 미정)
  - Checkbox AI Purple variant (DESIGN.md 일반 룰만)
  - Alert 유지/제거 결정 (DESIGN.md에 Alert 미존재 — Toast 단일)
  - 디자인팀 검수 절차 확립 (메타)

  검증: typecheck 4/4 Done, vitest 89/89, playwright 28/28 (catalog baseline 갱신).

- 8918872: 🛡️ `@polaris/lint`에 신규 룰 3개 — 외부 사이트 검수에서 발견된 사각지대를 회귀 차단으로 막음.

  **배경**: 2026-05-08 `jane-h-oh.github.io/design-test/dashboard` 검수에서 Polaris 토큰을 *load*만 하고 실제 사용은 Tailwind 기본 palette + 자체 `--color-*` alias 레이어 + rc.0 deprecated 토큰을 쓰는 사이트 발견. 기존 lint 룰 6종(`no-hardcoded-color`, `no-arbitrary-tailwind` 등)으로는 어느 것도 잡지 못함 — bracket-arbitrary 패턴, hex literal에만 반응하는 한계.

  **신규 룰**:

  1. **`@polaris/no-tailwind-default-color`** (warn, v0.8 → error 예정)
     Tailwind 기본 22 palette(`slate-*`, `rose-*`, `red-*`, `blue-*`, …)를 색상 utility에 사용하는 것 차단. 17개 utility prefix(`text/bg/border/ring/outline/divide/placeholder/caret/accent/decoration/shadow/from/via/to/fill/stroke`) × 22 palette × 알파 modifier까지 매칭. 메시지에 semantic 토큰 hint 동봉(예: slate → label-_ / fill-_ / line-\*).

  2. **`@polaris/no-deprecated-polaris-token`** (error)
     v0.6 / rc.0 / v1 deprecated alias 사용 차단. Tailwind class(`bg-fg-primary`, `text-surface-raised`, `bg-brand-primary`, `bg-status-danger` 등) + CSS variable(`var(--polaris-neutral-*)`, `var(--polaris-text-*)`, `var(--polaris-surface-*)` 등) 둘 다. 각 검출 시 v0.7 spec 교체값 메시지에 동봉. v0.8에서 alias 제거 예정이라 신규 코드는 처음부터 차단해 회귀 방지.

  3. **`@polaris/no-non-polaris-css-var`** (warn)
     JSX/className/style에서 `var(--polaris-*)` 또는 `var(--tw-*)` 외 CSS 변수 사용 차단. `var(--color-copy)`, `var(--app-gradient-*)`, `var(--my-brand)` 같은 자체 alias 레이어 검출. `allowedPrefixes` 옵션으로 third-party 변수 escape hatch 제공. _제한_: pure `*.css` 파일은 ESLint scope 밖 — 글로벌 CSS의 자체 alias *정의*는 못 잡지만 JS/TSX의 *소비*는 잡음.

  **테스트 커버리지**: 33 신규 테스트 케이스 추가 → 53개 → 86개. 각 룰 valid/invalid 패턴 다양하게.

  **기존 코드베이스 정리**:

  - 데모 39 위반(전부 deprecated alias) — 자동 sed 마이그레이션으로 해소: `bg-status-* → bg-state-*` (danger→error rename), `border-brand-primary → border-accent-brand-normal`, `border-brand-secondary → border-ai-normal`, `from/via/to-surface-canvas → -background-base` 등.
  - 데모 4 위반(Tailwind 기본색 `bg-neutral-100`) — `bg-fill-neutral`로 정합.
  - 데모 1 위반(custom CSS var `--editor-chrome-h`) — 의도된 데모 전용 layout var, eslint-disable-next-line으로 명시.

  **검증**:

  - `pnpm --filter @polaris/lint test` → 86 ✓ + 11 codemod ✓
  - `pnpm --filter @polaris/ui test` → 89/89
  - `pnpm test:e2e` → 28/28 (시각 baseline 변동 없음 — status-_/state-_ 토큰이 유사 hex)
  - `pnpm --filter polaris-template-next lint --max-warnings=0` → 0 warnings, 0 errors
  - `pnpm --filter demo lint` → 0 errors (deprecated alias 위반 모두 해소)

  **v0.8 계획**:

  - `no-tailwind-default-color` warn → error (consumer 마이그레이션 시간 후)
  - deprecated alias CSS 변수 자체 제거 → `no-deprecated-polaris-token` 룰의 일부 패턴 자연 무용화
  - Stylelint 기반 `--color-*` alias _정의_ 차단 룰 검토(global CSS 커버리지)

## 0.7.2

### Patch Changes

- 🐛 Tailwind alias 누락으로 12+ 컴포넌트의 hover/active 배경이 silently broken이던 버그 정정.

  `bg-accent-brand-normal-subtle` 클래스가 v0.7 토큰 맵에 정의되지 않은 상태로 다음 컴포넌트에서 사용 중이었음:
  `Sidebar`, `Pagination`, `Calendar`, `Drawer`, `Command`, `Badge`, `Select`, `DropdownMenu`, `FileCard`, `Ribbon` (포함 `RibbonButton` lg / `RibbonToggleItem` data-state=on / `RibbonTabs` active 등).

  Tailwind는 정의되지 않은 클래스에 대해 silent fail — 빌드 결과 CSS에 해당 클래스가 emit되지 않아 hover / active 상태가 시각적으로 표시되지 않음. 사용자 보고: "리본 메뉴의 호버가 표시 안되는데?"

  수정: `packages/ui/src/tailwind/index.ts`의 `accent-brand` family에 `'normal-subtle'` 키를 추가, 기존 `--polaris-brand-primary-subtle` CSS 변수(`#E8F2FE` light / dark mode `#1A2238`)에 매핑. 12+ 컴포넌트의 hover / active 배경이 즉시 복구됨 (call site 변경 없음).

  향후 정리 (v0.8): `accent-brand-bg`, `accent-brand-bg-hover`, `accent-brand-normal-subtle` 등 brand-tinted background 토큰을 단일 canonical 명명으로 통합하면서 이 deprecated 별칭 제거.

## 0.7.1

### Patch Changes

- 5f2f8c3: 리본 아이콘 셋(`@polaris/ui/ribbon-icons`) + 폴라리스 오피스 워드 데모 재구성.

  **`@polaris/ui` 신규 — `@polaris/ui/ribbon-icons` 서브패스 (91 디자인팀 아이콘):**

  - 57 big × 32 px (lg 리본 버튼용 — 멀티컬러 baked-in)
  - 34 small × 16 px (sm/md 리본 버튼용 — 별도 디자인, big의 축소가 아님)
  - `RIBBON_ICON_REGISTRY` 슬러그→컴포넌트 동적 lookup
  - `RIBBON_ICON_BIG_SLUGS` / `RIBBON_ICON_SMALL_SLUGS` Set으로 set 판별
  - `RibbonIconProps` 공용 타입 — `size` prop으로 native size에서 균등 스케일

  **Ribbon 컴포넌트 폴리시:**

  - `RibbonSeparator` / `RibbonRowDivider`가 deprecated `bg-surface-border` 대신 v0.7 spec 토큰 `bg-line-neutral` 사용 (v0.8의 alias 제거에 미리 대비).

  **`apps/demo`:**

  - `/polaris-office` 페이지를 실제 폴라리스 오피스 워드 리본에 맞춰 재구성. 홈/삽입/레이아웃/검토/AI 도구 5개 탭 모두 디자인팀 ribbon-icon 사용. 이전 lucide-react best-effort 매칭 대비 91/91 ribbon-icon이 전부 노출됨.
  - 파일 백스테이지 메뉴 폰트 weight 정정 (실제 제품과 일치 — bold/semibold 제거).
  - 탭 헤더의 "리본 접기" 버튼을 `<RibbonTabList>` 외부로 이동 (`role="tablist"` ARIA 위반 정정).
  - `/icons` 카탈로그 페이지에 ribbon 섹션 추가.

  **Generator infra:**

  - `build-icons` / `build-file-icons` / `build-logos` / `build-ribbon-icons` 4종이 idempotent + concurrency-safe. `pnpm -r typecheck`처럼 동일 출력 디렉토리에 대한 병렬 invocation에서 발생하던 `ENOTEMPTY` 경쟁 상태 해소 (`rmSync` 제거 → mkdir + 파일 단위 overwrite + best-effort orphan prune 패턴).

  **Asset 정정:**

  - 디자인팀 export 파일명 오타 두 건 정정: `roatateright90` → `rotateright90`, `algnleft01` → `alignleft01`. 정식 첫 릴리즈 전이라 외부 영향 없음.

- d1ddb67: 릴리즈 게이트 통과 — RC 후속 정정 (SVG id 격리, 컴포넌트 네이밍, 폰트 weight, 린트 게이트).

  **`@polaris/ui` — SVG id 충돌 방지 (P1):**

  `build-{icons,file-icons,logos,ribbon-icons}` 4종 generator가 각 SVG 본문에 등장하는 `id="..."` 정의와 모든 `url(#...)`/`href="#..."`/`xlink:href="#..."` 참조를 슬러그 prefix(`<slug>__<sanitized-id>`)로 다시 작성. Figma export의 자동 ID(`clip0_0_31035`, `Mask`, `Group_2` 등)가 다른 아이콘 사이에 충돌하면서 두 번째 인스턴스의 clip-path / mask / linear gradient가 첫 번째 정의로 잘못 resolve 되는 문제 해소.

  검증: `wordcount.tsx`의 `clip0_0_31035` → `wordcount__clip0_0_31035`. Korean / 공백 같은 URL 부적합 문자도 `[A-Za-z0-9_-]`로 sanitize.

  **`@polaris/ui/ribbon-icons` — 컴포넌트 네이밍 정리 (P1, public API freeze 직전):**

  Figma export 파일명이 compound concat(예: `aligncenter`, `textcolor`, `rotateright90`)된 슬러그를 사람이 읽기 좋은 kebab-case로 정규화하는 `SLUG_REWRITES` 맵을 generator에 추가. 결과:

  - `AligncenterIcon` → `AlignCenterIcon`
  - `TextcolorIcon` → `TextColorIcon`
  - `Rotateright90Icon` → `RotateRight90Icon`
  - `DocuprotectionIcon` → `DocuProtectionIcon`
  - `LinespacingIcon` → `LineSpacingIcon`
  - `WordcountIcon` → `WordCountIcon`
  - 등 30여 종

  source SVG 파일명은 그대로 두고 normalize 단계에서만 rewrite — 향후 Figma 재-export 시에도 자동 적용. 추가 entry는 안전(추가만), 제거/변경은 0.7.1 이후 breaking이므로 `@polaris/ui/ribbon-icons` 첫 publish 직전인 RC 단계에서 정리.

  **`@polaris/ui/ribbon` — 폰트 weight 정정:**

  `text-polaris-caption1`은 spec에 따라 weight 700(굵게)이지만 Office 실제 lg 리본 버튼 라벨(붙여넣기 / 페이지 설정 / …)은 regular 400. `RibbonButton` lg variant + `RibbonStack` 라벨에 `font-normal` 명시 추가. `RibbonTab` active 상태에서 `font-semibold` 제거 — underline accent + label-normal 색만으로 충분.

  **`apps/demo` 시각 회귀 baseline 갱신:**

  위 변경(font-normal lg 라벨, ID prefix가 들어간 ribbon 아이콘 SVG, RC ARIA wrapper)들이 픽셀 차이를 만들어 `pnpm test:e2e` 28건 중 12건이 실패. `pnpm test:e2e:update` 로 baseline 재기준선화. 이번 변경분이 이 픽셀 차이의 원인이며, 결과 모두 의도된 시각 변경.

  **CI / lint 게이트 정정:**

  - `polaris-template-next`(npm-publish 대상) lint script에 `--max-warnings=0` 추가. 기존 3 warnings(`Plus`, `Search`, `Image as ImageIcon`)는 polaris 등가물(`PlusIcon`, `SearchIcon`, `ImageIcon`)로 swap.
  - `apps/demo`(local sandbox)는 80여 lucide chrome 아이콘 warning을 일단 허용하되 CI step 이름을 "showcase, warnings allowed"로 정정 — 이전엔 "must be 0 violations"라 표시됐지만 실제로는 enforce되지 않던 기만 문구.

## 0.7.1-rc.1

### Patch Changes

- 릴리즈 게이트 통과 — RC 후속 정정 (SVG id 격리, 컴포넌트 네이밍, 폰트 weight, 린트 게이트).

  **`@polaris/ui` — SVG id 충돌 방지 (P1):**

  `build-{icons,file-icons,logos,ribbon-icons}` 4종 generator가 각 SVG 본문에 등장하는 `id="..."` 정의와 모든 `url(#...)`/`href="#..."`/`xlink:href="#..."` 참조를 슬러그 prefix(`<slug>__<sanitized-id>`)로 다시 작성. Figma export의 자동 ID(`clip0_0_31035`, `Mask`, `Group_2` 등)가 다른 아이콘 사이에 충돌하면서 두 번째 인스턴스의 clip-path / mask / linear gradient가 첫 번째 정의로 잘못 resolve 되는 문제 해소.

  검증: `wordcount.tsx`의 `clip0_0_31035` → `wordcount__clip0_0_31035`. Korean / 공백 같은 URL 부적합 문자도 `[A-Za-z0-9_-]`로 sanitize.

  **`@polaris/ui/ribbon-icons` — 컴포넌트 네이밍 정리 (P1, public API freeze 직전):**

  Figma export 파일명이 compound concat(예: `aligncenter`, `textcolor`, `rotateright90`)된 슬러그를 사람이 읽기 좋은 kebab-case로 정규화하는 `SLUG_REWRITES` 맵을 generator에 추가. 결과:

  - `AligncenterIcon` → `AlignCenterIcon`
  - `TextcolorIcon` → `TextColorIcon`
  - `Rotateright90Icon` → `RotateRight90Icon`
  - `DocuprotectionIcon` → `DocuProtectionIcon`
  - `LinespacingIcon` → `LineSpacingIcon`
  - `WordcountIcon` → `WordCountIcon`
  - 등 30여 종

  source SVG 파일명은 그대로 두고 normalize 단계에서만 rewrite — 향후 Figma 재-export 시에도 자동 적용. 추가 entry는 안전(추가만), 제거/변경은 0.7.1 이후 breaking이므로 `@polaris/ui/ribbon-icons` 첫 publish 직전인 RC 단계에서 정리.

  **`@polaris/ui/ribbon` — 폰트 weight 정정:**

  `text-polaris-caption1`은 spec에 따라 weight 700(굵게)이지만 Office 실제 lg 리본 버튼 라벨(붙여넣기 / 페이지 설정 / …)은 regular 400. `RibbonButton` lg variant + `RibbonStack` 라벨에 `font-normal` 명시 추가. `RibbonTab` active 상태에서 `font-semibold` 제거 — underline accent + label-normal 색만으로 충분.

  **`apps/demo` 시각 회귀 baseline 갱신:**

  위 변경(font-normal lg 라벨, ID prefix가 들어간 ribbon 아이콘 SVG, RC ARIA wrapper)들이 픽셀 차이를 만들어 `pnpm test:e2e` 28건 중 12건이 실패. `pnpm test:e2e:update` 로 baseline 재기준선화. 이번 변경분이 이 픽셀 차이의 원인이며, 결과 모두 의도된 시각 변경.

  **CI / lint 게이트 정정:**

  - `polaris-template-next`(npm-publish 대상) lint script에 `--max-warnings=0` 추가. 기존 3 warnings(`Plus`, `Search`, `Image as ImageIcon`)는 polaris 등가물(`PlusIcon`, `SearchIcon`, `ImageIcon`)로 swap.
  - `apps/demo`(local sandbox)는 80여 lucide chrome 아이콘 warning을 일단 허용하되 CI step 이름을 "showcase, warnings allowed"로 정정 — 이전엔 "must be 0 violations"라 표시됐지만 실제로는 enforce되지 않던 기만 문구.

## 0.7.1-rc.0

### Patch Changes

- 리본 아이콘 셋(`@polaris/ui/ribbon-icons`) + 폴라리스 오피스 워드 데모 재구성.

  **`@polaris/ui` 신규 — `@polaris/ui/ribbon-icons` 서브패스 (91 디자인팀 아이콘):**

  - 57 big × 32 px (lg 리본 버튼용 — 멀티컬러 baked-in)
  - 34 small × 16 px (sm/md 리본 버튼용 — 별도 디자인, big의 축소가 아님)
  - `RIBBON_ICON_REGISTRY` 슬러그→컴포넌트 동적 lookup
  - `RIBBON_ICON_BIG_SLUGS` / `RIBBON_ICON_SMALL_SLUGS` Set으로 set 판별
  - `RibbonIconProps` 공용 타입 — `size` prop으로 native size에서 균등 스케일

  **Ribbon 컴포넌트 폴리시:**

  - `RibbonSeparator` / `RibbonRowDivider`가 deprecated `bg-surface-border` 대신 v0.7 spec 토큰 `bg-line-neutral` 사용 (v0.8의 alias 제거에 미리 대비).

  **`apps/demo`:**

  - `/polaris-office` 페이지를 실제 폴라리스 오피스 워드 리본에 맞춰 재구성. 홈/삽입/레이아웃/검토/AI 도구 5개 탭 모두 디자인팀 ribbon-icon 사용. 이전 lucide-react best-effort 매칭 대비 91/91 ribbon-icon이 전부 노출됨.
  - 파일 백스테이지 메뉴 폰트 weight 정정 (실제 제품과 일치 — bold/semibold 제거).
  - 탭 헤더의 "리본 접기" 버튼을 `<RibbonTabList>` 외부로 이동 (`role="tablist"` ARIA 위반 정정).
  - `/icons` 카탈로그 페이지에 ribbon 섹션 추가.

  **Generator infra:**

  - `build-icons` / `build-file-icons` / `build-logos` / `build-ribbon-icons` 4종이 idempotent + concurrency-safe. `pnpm -r typecheck`처럼 동일 출력 디렉토리에 대한 병렬 invocation에서 발생하던 `ENOTEMPTY` 경쟁 상태 해소 (`rmSync` 제거 → mkdir + 파일 단위 overwrite + best-effort orphan prune 패턴).

  **Asset 정정:**

  - 디자인팀 export 파일명 오타 두 건 정정: `roatateright90` → `rotateright90`, `algnleft01` → `alignleft01`. 정식 첫 릴리즈 전이라 외부 영향 없음.

## 0.7.0

### Minor Changes

- a28259b: v0.7.0 — Polaris Office Design System v1 (2026.05) 정렬

  디자인팀의 정식 정의서에 맞춰 토큰 명명·값·컴포넌트 스펙을 재정렬한 **breaking 릴리즈**입니다.

  전체 마이그레이션 가이드: [`docs/for-consumers/migration/v0.6-to-v0.7.md`](https://github.com/PolarisOffice/PolarisDesign/blob/main/docs/for-consumers/migration/v0.6-to-v0.7.md)

  자동 codemod: `pnpm dlx @polaris/lint polaris-codemod-v07 --apply src`

  ### Highlights

  **브랜드 컬러 갱신**
  PO Blue · Sheet Green · Slide Orange · PDF Red · AI Purple — 5색 모두 hex 값이 정의서에 맞게 변경되었습니다 (예: `brand.primary` `#2B7FFF` → `#1D7FF9`).

  **9-step 컬러 램프 + 8-level radius**
  `bg-blue-50`, `text-purple-70`처럼 9단계 (5/10/20/30/40/50/60/70/80) 사용 가능. radius는 `2xs` (2) → `pill` (9999) 8단계로 확장. `md` 10→8, `lg` 14→12, `full`은 `pill`의 deprecated alias.

  **시맨틱 토큰 명명 변경**
  `text.*` → `label.*`, `surface.*` → `background.*` / `line.*`, `brand.secondary*` → `ai.*` 등. Tailwind 클래스도 동일 (`text-fg-primary` → `text-label-normal`). v0.6 이름은 alias로 계속 작동 — v0.8에서 제거 예정.

  **타이포그래피 H1–H5 + weight 700**
  `display` (60), `h1` (40) ~ `h5` (20) 헤딩 위계 추가. 모든 heading이 weight 600(SemiBold) → 700(Bold)으로 변경. `detail` (14/Medium), `meta` (12), `tiny` (10) 신설.

  **컴포넌트 스펙 정렬**

  - `<Button>`: 6 variants (`ai` 신규) × 3 sizes. 사이즈 한 단계씩 축소 (lg 48→40, md 40→32, sm 32→26).
  - `<Input>`: 36px 높이 + 1px PO Blue border + 3px outer glow focus 효과.
  - `<NovaInput>`: 단일행 알약 → 두 줄 컴포저 (12px radius, ai.pressed border, shadow-ai purple glow). `modelPill` prop 신설.

  **자동화 도구**

  - `polaris-codemod-v07` CLI (TS/TSX 토큰, Tailwind 클래스, CSS 변수 일괄 변환). `--check` 모드로 CI 통합 가능.
  - `shadow-polaris-ai` Tailwind 유틸리티 등록 (AI 표면용 보라 글로우).

  **시각 회귀 베이스라인**
  13개 라우트 × 2 viewport (desktop/mobile) — 26개 Playwright 베이스라인 모두 v0.7 비주얼로 갱신.

  ### BREAKING

  - 모든 heading의 weight: 600 → 700
  - `displayLg`: 48 → 60px
  - Button 사이즈 한 단계씩 축소
  - Input height: 40 → 36px
  - NovaInput 외형 (단일행 → 두 줄)
  - radius `md` 10 → 8, `lg` 14 → 12
  - 일부 deprecated alias (`text.primary` 등)는 계속 작동하지만 값이 v0.7 spec hex로 resolve됨 (예: `text.primary` → `#26282B`로 갱신, 이전엔 `#0B0B12`)

- 0a6e548: v0.7.0 — Tokens 페이지 재구성 + tooling fixes (Codex 리뷰 반영)

  마지막 RC 위에 추가된 마무리 변경 묶음. 외부 사용자에게 영향이 없는 내부/문서/도구 정비가 대부분이라 별도 RC 없이 0.7.0에 그대로 합산.

  ### 데모 Tokens 페이지 재구성

  `/tokens` 페이지가 v0.7-rc.2 토큰 시스템의 ~30% 만 보여주던 문제를 수정. C-base 자동 iterate + B-reinforcement 비-컬러 섹션:

  - **C-base**: `@polaris/ui/tokens.colors` 에서 색상 그룹 자동 iterate. 13 섹션 / ~150 swatch. 새 토큰 그룹이 추가되어도 자동 반영.
  - **B-reinforcement**: Spacing (12 named) / Radius (8 with samples) / Shadow (5 incl. ai glow) / Motion (duration × 4 + easing × 3 hover demo) / Z-index (6 use-case 표) / Breakpoint 명시 섹션.
  - **figma-spec PNG inline**: 각 섹션의 헤더에 `<details>` 로 디자인 정의서 PNG 첨부. `apps/demo/public/figma-spec/` 으로 자동 sync (`predev`/`prebuild` 훅이 `assets/figma-spec/` 에서 복사).

  ### Tooling fixes

  - **root version sync** — `node scripts/sync-root-version.mjs` 가 CI에서 항상 통과하도록 정리. `pnpm version` 흐름에서 자동 실행됨.
  - **demo / template-next prep:ui** — clean clone에서 `pnpm install` → `dev` 까지 무중단 실행되도록 `gen:ui-sources` (=`@polaris/ui gen:sources`) + `prep:ui` (=`@polaris/ui build`) 훅 추가. PostCSS / Tailwind 가 dist 를 요구하는 케이스도 처리.
  - **@polaris/ui prepare hook** — pnpm install 시 자동으로 `gen:sources` 가 실행되어 generated icon / file-icon / logo 소스가 항상 존재. 외부 git URL 설치도 동일.
  - **demo tsconfig paths** — Vite `resolve.alias` 와 동일한 경로를 tsconfig 에 미러링. dist 없이 source 기반 typecheck 가능.
  - **demo Vite alias** — 신규 subpath 3개 (`@polaris/ui/icons`, `/file-icons`, `/logos`) 추가. dev 시 source HMR 작동.

  ### 가이드 문서 v0.7 갱신

  - **`packages/plugin/skills/polaris-web/SKILL.md`** — 토큰 컬러 표를 v0.7 spec 명명으로 재작성 (`label.*` / `background.*` / `layer.*` / `accentBrand.*` / `state.*` / `ai.*`). Ribbon / icons / file-icons / logos import 예시 추가.
  - **`AGENTS.md`** (root) + **`packages/template-next/AGENTS.md`** — 동일 기준으로 갱신.
  - **`packages/ui/README.md`** — Tailwind class 표를 v0.7 spec 으로 교체. icons / file-icons / logos subpath 사용 예시 추가.
  - **루트 `README.md`** — `/icons` 데모 라우트 추가, v0.7 highlights 섹션 신설, Quick start 에 prep:ui 단계 명시.
  - **마이그레이션 가이드** — `v0.6-to-v0.7-rc.1.md` → `v0.6-to-v0.7.md` rename, rc.2 자산 통합 섹션 (3.10/3.11) 추가, codemod 적용 범위 메모 (`@polaris/ui` 자체 소스는 제외).

- 7100ee0: v0.7.0-rc.1 — DESIGN.md + primitive-color-palette 완전 정렬

  rc.0 출시 후 디자인팀의 더 상세한 정의서(`DESIGN.md` + `primitive-color-palette.html`)를 받아 9단계 reconciliation 수행. 사용자 피드백 단계 전이라 alias 부담 없이 spec 완전 정렬.

  마이그레이션: [`docs/for-consumers/migration/v0.6-to-v0.7.md`](https://github.com/PolarisOffice/PolarisDesign/blob/main/docs/for-consumers/migration/v0.6-to-v0.7.md)
  Codemod (v0.6 / rc.0 모두 대응): `pnpm dlx @polaris/lint polaris-codemod-v07 --apply src`

  ### Highlights

  **컬러 primitive 확장 (rc.1)**

  - 모든 브랜드 램프에 step `90` (가장 어두운) 추가 — 10단계 (`05/10/20/30/40/50/60/70/80/90`)
  - 5개 신규 supplementary 패밀리: Sky Blue, Blue (보조), Violet, Cyan, Yellow
  - step `5` (no leading zero) 표기는 deprecated alias로 계속 작동 — codemod가 `05`로 rewrite
  - step 40의 hex 보정 (rc.0 표류): Green `#B5CA5F→#85CA5F`, Purple `#9075EC→#9D75EC`, DarkBlue `#4C70CE→#4C7DCE`

  **시맨틱 토큰 19개 신설**
  NEW: `label.disabled` / `layer.surface/-overlay` / `interaction.pressed` / `fill.neutral/-strong` / `line.strong/-disabled` / `accentBrand.bg/-bgHover` / `accentAction.normal/-strong` (Black 버튼) / `focus.ring` / `staticColors.white/-black` / `state.new` + `state.{success,warning,error,info}Bg` 4개

  **다크 모드 그레이스케일 재작성**
  rc.0의 퍼플 틴트(`#1B1B2A` 등)가 spec의 단색 그레이(`#232323`/`#282828`/`#3B3B3B`)로 전체 교체

  **Radius 스케일 한 단계 시프트**
  `md` 8→12 (Button/Card/Modal default), `lg` 12→16, `xl` 16→24, `2xl` 24→38 (bottom sheet)

  **타이포그래피 11레벨 spec 정렬**

  - 명명 변경: `display`(60→40), `h1-h5` → `display`/`title`/`heading1-3`
  - 신규 사이즈: `heading4` (18), `body3` (13), `caption2` (11)
  - Caption weight 400 → 700, body letter-spacing 제거
  - 모바일 (≤767px) type scale 자동 적용 (auto media query)

  **4개 신규 토큰 시스템**

  - Spacing: `4xs` (2) → `4xl` (64) 12레벨 — class form `p-polaris-md`, `gap-polaris-lg`
  - Z-index: `base/dropdown/sticky/dim/modal/toast` — class form `z-polaris-modal`
  - Motion: `duration-polaris-fast`, `ease-polaris-out`
  - Breakpoint: `mobile/tablet-v/tablet-h/desktop` semantic names

  **Button 6 사이즈 + Black variant**
  사이즈 24/32/40/48/54/64. 사이즈별 weight 분기 (xs/sm/md = Medium 500, lg/xl/2xl = Bold 700). 신규 `dark` variant (Black 버튼, 다크모드 자동 반전).

  **Input 52px + Floating Title + 강제 에러 아이콘**
  높이 36→52, label이 입력 영역 안에서 floating. 에러 시 ⚠️ 아이콘 자동 동반 (WCAG 1.4.1).

  **Modal 24r + layer.surface, Toast 48h dark+blur**
  Dialog가 `--layer-surface` + 24px radius로 spec emphasis modal과 일치. Toast가 모든 variant 통일된 다크 글래스 표면(blur).

  **신규 lint 룰**
  `@polaris/state-color-with-icon` (warn) — `text-state-success/-warning/-error`가 아이콘 동반 없이 사용되면 경고 (WCAG 1.4.1).

  ### BREAKING vs rc.0

  - 모든 컴포넌트 radius +4px (md 8→12 등)
  - 다크 모드 hex 전면 변경
  - `display` 사이즈 60→40
  - Button 사이즈 명명 시프트 (`sm`→`xs`, `md`→`sm`, `lg`→`md`)
  - Input height 36→52, NovaInput 외형 유지
  - Modal 12r→24r
  - Toast 단색 surface → 다크 글래스 (variant 배경 없음)
  - `primary.*` (rc.0 alias) → `accentBrand.*`로 codemod 권장
  - `text-polaris-h{1..5}` → spec 이름으로 codemod 권장

- 068f25c: v0.7.0-rc.2 — 디자인팀 자산 통합 (UI 아이콘 65종 × 3 사이즈, 파일 아이콘 29종, 로고 컴포넌트)

  디자인팀 Figma 출처 SVG 자산을 빌드 파이프라인을 통해 React 컴포넌트로 자동 변환. v0.7.0-rc.1 위에 4개의 신규 시스템 추가:

  ### 새 entry point 3개

  ```ts
  import {
    ArrowDownIcon,
    ChevronRightIcon,
    SearchIcon,
  } from "@polaris/ui/icons";
  import { DocxIcon, FolderIcon, ZipIcon } from "@polaris/ui/file-icons";
  import { PolarisLogo, NovaLogo } from "@polaris/ui/logos";
  ```

  - **`@polaris/ui/icons`** — 65 monochrome UI 아이콘 × 3 사이즈 (18/24/32 px). 디자이너가 그리드별로 hand-tune 한 path를 모두 보존. `size` prop은 임의 px 받음 (16, 28 등도 OK — 자동으로 가장 가까운 그리드 SVG 선택). stroke `#454C53` → `currentColor` 자동 변환되어 Tailwind `text-{token}`으로 색 제어.
  - **`@polaris/ui/file-icons`** — 29 multi-color 파일 타입 아이콘 (docx, xlsx, pptx, pdf 외 folder, image, video, zip, music, voc, my-template, note-pnt, app-\* 등). 32px 마스터 + size prop 으로 균등 스케일.
  - **`@polaris/ui/logos`** — `PolarisLogo` (horizontal/symbol/favicon × default/negative) + `NovaLogo` (default/white).

  ### 빌드 파이프라인

  ```
  assets/svg/{icons,file-icons,logos}/  →  packages/ui/src/{icons,file-icons,logos}/  (gitignored)
  ```

  새 스크립트:

  - `pnpm normalize:icons` — Figma 자동 export 이름 (`Type=Arrow-Down, Size=18.svg`) → kebab-case (`arrow-down.svg`) 정규화. idempotent.
  - `pnpm build:icons` / `:file-icons` / `:logos` — SVG → React 컴포넌트 생성

  ### BREAKING

  - **`<FileIcon>` 완전 교체.** rc.1까지의 색깔 사각형 + 글자 표시는 사라지고 디자인팀 실제 SVG 사용. 5타입 → 29타입 확장. `size` prop은 t-shirt (`'sm'|'md'|'lg'`) 대신 px (`number`).
  - **`@polaris/ui` 내부 lucide-react → polaris 아이콘 교체** (있는 것만): `X`/`Send`/`Search`/`Check`/`Minus`/`ChevronDown/Up/Left/Right`/`AlertCircle` → polaris 컴포넌트. 없는 것만 (Bold/Italic/MoreHorizontal/CalendarIcon/Sparkles/Loader2/Inbox 등) lucide 유지.

  ### 신규 lint 룰

  `@polaris/prefer-polaris-icon` (warn) — `lucide-react` import 시 폴라리스에 대응 아이콘 있으면 권장. 데모에서 95개 warning 감지 (점진적 마이그레이션).

  ### 데모

  새 페이지 `/icons` — 65 UI 아이콘 검색 가능, 사이즈별 비교, 파일 아이콘 29종, 로고 4종. visual baseline 추가 (28개 → 30개).

  ### 디렉토리 정리

  ```
  assets/
  ├── README.md                            # 갱신 절차 문서화
  ├── figma-spec/                          # was figma_PDS
  │   ├── foundation/                      # color · grid · radius · typography
  │   ├── theme/                           # iconography
  │   └── components/                      # 13 컴포넌트 spec PNG
  └── svg/                                 # was image_assets
      ├── icons/{18,24,32}/                # 65 × 3 = 195 SVG
      ├── file-icons/32/                   # 29 SVG
      └── logos/{polaris-office,nova}/
  ```

  모든 파일명 kebab-case 영문 (한국어 `가로.svg` → `horizontal.svg`, Figma `Type=...` 자동 정규화).

  ### DESIGN.md 갱신

  각 섹션에 figma-spec PNG 인라인 추가 (Color / Typography / Grid / Radius / Iconography / Button / Input). Iconography 섹션 신설.

  ### 검증

  - pnpm -r build ✓ (8 entries)
  - pnpm --filter @polaris/ui test ✓ (84 tests)
  - pnpm --filter @polaris/lint test ✓ (50 + 11 codemod)
  - pnpm --filter demo build ✓
  - pnpm exec playwright test ✓ (30 baselines)
  - pnpm -w lint ✓ (errors: 0; warns: 95 lucide migration suggestions)

## 0.7.0-rc.2

### Minor Changes

- v0.7.0-rc.2 — 디자인팀 자산 통합 (UI 아이콘 65종 × 3 사이즈, 파일 아이콘 29종, 로고 컴포넌트)

  디자인팀 Figma 출처 SVG 자산을 빌드 파이프라인을 통해 React 컴포넌트로 자동 변환. v0.7.0-rc.1 위에 4개의 신규 시스템 추가:

  ### 새 entry point 3개

  ```ts
  import {
    ArrowDownIcon,
    ChevronRightIcon,
    SearchIcon,
  } from "@polaris/ui/icons";
  import { DocxIcon, FolderIcon, ZipIcon } from "@polaris/ui/file-icons";
  import { PolarisLogo, NovaLogo } from "@polaris/ui/logos";
  ```

  - **`@polaris/ui/icons`** — 65 monochrome UI 아이콘 × 3 사이즈 (18/24/32 px). 디자이너가 그리드별로 hand-tune 한 path를 모두 보존. `size` prop은 임의 px 받음 (16, 28 등도 OK — 자동으로 가장 가까운 그리드 SVG 선택). stroke `#454C53` → `currentColor` 자동 변환되어 Tailwind `text-{token}`으로 색 제어.
  - **`@polaris/ui/file-icons`** — 29 multi-color 파일 타입 아이콘 (docx, xlsx, pptx, pdf 외 folder, image, video, zip, music, voc, my-template, note-pnt, app-\* 등). 32px 마스터 + size prop 으로 균등 스케일.
  - **`@polaris/ui/logos`** — `PolarisLogo` (horizontal/symbol/favicon × default/negative) + `NovaLogo` (default/white).

  ### 빌드 파이프라인

  ```
  assets/svg/{icons,file-icons,logos}/  →  packages/ui/src/{icons,file-icons,logos}/  (gitignored)
  ```

  새 스크립트:

  - `pnpm normalize:icons` — Figma 자동 export 이름 (`Type=Arrow-Down, Size=18.svg`) → kebab-case (`arrow-down.svg`) 정규화. idempotent.
  - `pnpm build:icons` / `:file-icons` / `:logos` — SVG → React 컴포넌트 생성

  ### BREAKING

  - **`<FileIcon>` 완전 교체.** rc.1까지의 색깔 사각형 + 글자 표시는 사라지고 디자인팀 실제 SVG 사용. 5타입 → 29타입 확장. `size` prop은 t-shirt (`'sm'|'md'|'lg'`) 대신 px (`number`).
  - **`@polaris/ui` 내부 lucide-react → polaris 아이콘 교체** (있는 것만): `X`/`Send`/`Search`/`Check`/`Minus`/`ChevronDown/Up/Left/Right`/`AlertCircle` → polaris 컴포넌트. 없는 것만 (Bold/Italic/MoreHorizontal/CalendarIcon/Sparkles/Loader2/Inbox 등) lucide 유지.

  ### 신규 lint 룰

  `@polaris/prefer-polaris-icon` (warn) — `lucide-react` import 시 폴라리스에 대응 아이콘 있으면 권장. 데모에서 95개 warning 감지 (점진적 마이그레이션).

  ### 데모

  새 페이지 `/icons` — 65 UI 아이콘 검색 가능, 사이즈별 비교, 파일 아이콘 29종, 로고 4종. visual baseline 추가 (28개 → 30개).

  ### 디렉토리 정리

  ```
  assets/
  ├── README.md                            # 갱신 절차 문서화
  ├── figma-spec/                          # was figma_PDS
  │   ├── foundation/                      # color · grid · radius · typography
  │   ├── theme/                           # iconography
  │   └── components/                      # 13 컴포넌트 spec PNG
  └── svg/                                 # was image_assets
      ├── icons/{18,24,32}/                # 65 × 3 = 195 SVG
      ├── file-icons/32/                   # 29 SVG
      └── logos/{polaris-office,nova}/
  ```

  모든 파일명 kebab-case 영문 (한국어 `가로.svg` → `horizontal.svg`, Figma `Type=...` 자동 정규화).

  ### DESIGN.md 갱신

  각 섹션에 figma-spec PNG 인라인 추가 (Color / Typography / Grid / Radius / Iconography / Button / Input). Iconography 섹션 신설.

  ### 검증

  - pnpm -r build ✓ (8 entries)
  - pnpm --filter @polaris/ui test ✓ (84 tests)
  - pnpm --filter @polaris/lint test ✓ (50 + 11 codemod)
  - pnpm --filter demo build ✓
  - pnpm exec playwright test ✓ (30 baselines)
  - pnpm -w lint ✓ (errors: 0; warns: 95 lucide migration suggestions)

## 0.7.0-rc.1

### Minor Changes

- v0.7.0-rc.1 — DESIGN.md + primitive-color-palette 완전 정렬

  rc.0 출시 후 디자인팀의 더 상세한 정의서(`DESIGN.md` + `primitive-color-palette.html`)를 받아 9단계 reconciliation 수행. 사용자 피드백 단계 전이라 alias 부담 없이 spec 완전 정렬.

  마이그레이션: [`docs/migration/v0.6-to-v0.7-rc.1.md`](https://github.com/PolarisOffice/PolarisDesign/blob/main/docs/migration/v0.6-to-v0.7-rc.1.md)
  Codemod (v0.6 / rc.0 모두 대응): `pnpm dlx @polaris/lint polaris-codemod-v07 --apply src`

  ### Highlights

  **컬러 primitive 확장 (rc.1)**

  - 모든 브랜드 램프에 step `90` (가장 어두운) 추가 — 10단계 (`05/10/20/30/40/50/60/70/80/90`)
  - 5개 신규 supplementary 패밀리: Sky Blue, Blue (보조), Violet, Cyan, Yellow
  - step `5` (no leading zero) 표기는 deprecated alias로 계속 작동 — codemod가 `05`로 rewrite
  - step 40의 hex 보정 (rc.0 표류): Green `#B5CA5F→#85CA5F`, Purple `#9075EC→#9D75EC`, DarkBlue `#4C70CE→#4C7DCE`

  **시맨틱 토큰 19개 신설**
  NEW: `label.disabled` / `layer.surface/-overlay` / `interaction.pressed` / `fill.neutral/-strong` / `line.strong/-disabled` / `accentBrand.bg/-bgHover` / `accentAction.normal/-strong` (Black 버튼) / `focus.ring` / `staticColors.white/-black` / `state.new` + `state.{success,warning,error,info}Bg` 4개

  **다크 모드 그레이스케일 재작성**
  rc.0의 퍼플 틴트(`#1B1B2A` 등)가 spec의 단색 그레이(`#232323`/`#282828`/`#3B3B3B`)로 전체 교체

  **Radius 스케일 한 단계 시프트**
  `md` 8→12 (Button/Card/Modal default), `lg` 12→16, `xl` 16→24, `2xl` 24→38 (bottom sheet)

  **타이포그래피 11레벨 spec 정렬**

  - 명명 변경: `display`(60→40), `h1-h5` → `display`/`title`/`heading1-3`
  - 신규 사이즈: `heading4` (18), `body3` (13), `caption2` (11)
  - Caption weight 400 → 700, body letter-spacing 제거
  - 모바일 (≤767px) type scale 자동 적용 (auto media query)

  **4개 신규 토큰 시스템**

  - Spacing: `4xs` (2) → `4xl` (64) 12레벨 — class form `p-polaris-md`, `gap-polaris-lg`
  - Z-index: `base/dropdown/sticky/dim/modal/toast` — class form `z-polaris-modal`
  - Motion: `duration-polaris-fast`, `ease-polaris-out`
  - Breakpoint: `mobile/tablet-v/tablet-h/desktop` semantic names

  **Button 6 사이즈 + Black variant**
  사이즈 24/32/40/48/54/64. 사이즈별 weight 분기 (xs/sm/md = Medium 500, lg/xl/2xl = Bold 700). 신규 `dark` variant (Black 버튼, 다크모드 자동 반전).

  **Input 52px + Floating Title + 강제 에러 아이콘**
  높이 36→52, label이 입력 영역 안에서 floating. 에러 시 ⚠️ 아이콘 자동 동반 (WCAG 1.4.1).

  **Modal 24r + layer.surface, Toast 48h dark+blur**
  Dialog가 `--layer-surface` + 24px radius로 spec emphasis modal과 일치. Toast가 모든 variant 통일된 다크 글래스 표면(blur).

  **신규 lint 룰**
  `@polaris/state-color-with-icon` (warn) — `text-state-success/-warning/-error`가 아이콘 동반 없이 사용되면 경고 (WCAG 1.4.1).

  ### BREAKING vs rc.0

  - 모든 컴포넌트 radius +4px (md 8→12 등)
  - 다크 모드 hex 전면 변경
  - `display` 사이즈 60→40
  - Button 사이즈 명명 시프트 (`sm`→`xs`, `md`→`sm`, `lg`→`md`)
  - Input height 36→52, NovaInput 외형 유지
  - Modal 12r→24r
  - Toast 단색 surface → 다크 글래스 (variant 배경 없음)
  - `primary.*` (rc.0 alias) → `accentBrand.*`로 codemod 권장
  - `text-polaris-h{1..5}` → spec 이름으로 codemod 권장

## 0.7.0-rc.0

### Minor Changes

- v0.7.0 — Polaris Office Design System v1 (2026.05) 정렬

  디자인팀의 정식 정의서에 맞춰 토큰 명명·값·컴포넌트 스펙을 재정렬한 **breaking 릴리즈**입니다.

  전체 마이그레이션 가이드: [`docs/for-consumers/migration/v0.6-to-v0.7.md`](https://github.com/PolarisOffice/PolarisDesign/blob/main/docs/for-consumers/migration/v0.6-to-v0.7.md)

  자동 codemod: `pnpm dlx @polaris/lint polaris-codemod-v07 --apply src`

  ### Highlights

  **브랜드 컬러 갱신**
  PO Blue · Sheet Green · Slide Orange · PDF Red · AI Purple — 5색 모두 hex 값이 정의서에 맞게 변경되었습니다 (예: `brand.primary` `#2B7FFF` → `#1D7FF9`).

  **9-step 컬러 램프 + 8-level radius**
  `bg-blue-50`, `text-purple-70`처럼 9단계 (5/10/20/30/40/50/60/70/80) 사용 가능. radius는 `2xs` (2) → `pill` (9999) 8단계로 확장. `md` 10→8, `lg` 14→12, `full`은 `pill`의 deprecated alias.

  **시맨틱 토큰 명명 변경**
  `text.*` → `label.*`, `surface.*` → `background.*` / `line.*`, `brand.secondary*` → `ai.*` 등. Tailwind 클래스도 동일 (`text-fg-primary` → `text-label-normal`). v0.6 이름은 alias로 계속 작동 — v0.8에서 제거 예정.

  **타이포그래피 H1–H5 + weight 700**
  `display` (60), `h1` (40) ~ `h5` (20) 헤딩 위계 추가. 모든 heading이 weight 600(SemiBold) → 700(Bold)으로 변경. `detail` (14/Medium), `meta` (12), `tiny` (10) 신설.

  **컴포넌트 스펙 정렬**

  - `<Button>`: 6 variants (`ai` 신규) × 3 sizes. 사이즈 한 단계씩 축소 (lg 48→40, md 40→32, sm 32→26).
  - `<Input>`: 36px 높이 + 1px PO Blue border + 3px outer glow focus 효과.
  - `<NovaInput>`: 단일행 알약 → 두 줄 컴포저 (12px radius, ai.pressed border, shadow-ai purple glow). `modelPill` prop 신설.

  **자동화 도구**

  - `polaris-codemod-v07` CLI (TS/TSX 토큰, Tailwind 클래스, CSS 변수 일괄 변환). `--check` 모드로 CI 통합 가능.
  - `shadow-polaris-ai` Tailwind 유틸리티 등록 (AI 표면용 보라 글로우).

  **시각 회귀 베이스라인**
  13개 라우트 × 2 viewport (desktop/mobile) — 26개 Playwright 베이스라인 모두 v0.7 비주얼로 갱신.

  ### BREAKING

  - 모든 heading의 weight: 600 → 700
  - `displayLg`: 48 → 60px
  - Button 사이즈 한 단계씩 축소
  - Input height: 40 → 36px
  - NovaInput 외형 (단일행 → 두 줄)
  - radius `md` 10 → 8, `lg` 14 → 12
  - 일부 deprecated alias (`text.primary` 등)는 계속 작동하지만 값이 v0.7 spec hex로 resolve됨 (예: `text.primary` → `#26282B`로 갱신, 이전엔 `#0B0B12`)

## 0.6.1

### Patch Changes

- v0.6.1 — ribbon polish, infra hardening, and design assets reference

  Ribbon (@polaris/ui/ribbon)

  - `RibbonSplitButton` no longer mounts a `DropdownMenu` when `disabled`,
    so the chevron half can't open the menu (Radix asChild + native
    disabled wasn't enough). Verified by a Vitest case in the new ribbon
    suite.
  - `RibbonContent` panel pinned to `min-h-20` (80px). Tabs that pair an
    `lg` button with a multi-row `sm` stack no longer change ribbon
    height when the active tab switches.
  - `overflow-x-auto overflow-y-clip` — kills the stray vertical
    scrollbar that the implicit `overflow-y: auto` would otherwise add.
  - Horizontal scrollbar visible on mobile (`<md`), hidden on desktop
    (Office pattern). `RibbonTabList` mirrors the same behavior.
  - `RibbonContent` honors `data-[state=inactive]:hidden` so inactive
    panels collapse to 0 height instead of claiming `py-1` padding.

  Tests (@polaris/ui)

  - 14 new component test files (Card / Input / Textarea / Toast /
    Tooltip / Select / Checkbox / Switch / Badge / Avatar / Alert /
    Pagination / NovaInput) plus first suites for `@polaris/ui/ribbon`
    and `@polaris/ui/form`. Coverage went from 17% to ~60%, total
    21 files / 82 tests.

  Tokens

  - `packages/ui/scripts/build-tokens.ts` is now the single source for
    `src/styles/tokens.css`. Hand-editing the CSS is blocked by a CI
    drift check. Includes color, radius, shadow, AND font-family
    variables — the latter was missed in the first generator pass and
    broke `font-polaris` / `font-polaris-mono` utilities until fixed.
  - `tokens.md` rewritten to match `tokens.ts` 1-for-1 (was missing
    status hover variants, `text.onStatus`, full spacing scale, dark
    shadow column, and used dotted names where the code uses camelCase).

  Demo

  - New `/#/assets` route under "시스템 레퍼런스" — surfaces Polaris's
    own logos, icons, and AI-model marks (sourced from
    `polink-static-contents.polarisoffice.com`) alongside a curated
    lucide-react grid. Goal: contributors check the existing brand
    assets before pulling in new lucide imports.
  - New `/#/tokens` route — replaces the static `swatches.html` with a
    React page that imports straight from `@polaris/ui/tokens`. Token
    changes show up automatically.
  - Polaris Office demo: top-bar action labels collapse responsively
    below md/lg, document title now `truncate`s. EditorChrome stays
    one row on phones.
  - vite.config aliases `@polaris/ui` and its subpaths directly to
    source so dev HMR no longer needs a separate tsup build between
    package edits.

  Infra (root + CI)

  - `@changesets/cli` introduced with all five workspace packages in a
    `fixed` group. Releases now run via `pnpm version` (no more sed-bumping
    six package.json files) + `scripts/sync-root-version.mjs` keeps the
    root pkg in lockstep too, with a CI `--check` step.
  - Playwright visual regression suite — desktop + mobile baselines for
    every demo route plus per-tab ribbon snapshots. 26 baseline PNGs
    committed; `pnpm test:e2e` is the diff gate, `pnpm test:e2e:update`
    refreshes after intentional changes.
  - Turbo `test` task now depends on `^build` AND `build` — no more
    race between a package's own build and its node:test reading
    `dist/`.
  - CI `pnpm changeset status` step uses `fetch-depth: 0` and the
    actual base ref (`github.base_ref`); fails loudly on ref errors
    instead of `|| true`-swallowing them.
  - `AGENTS.md` and plugin commands updated to use `pnpm lint` —
    `pnpm exec eslint .` was failing at the root because there's no
    eslint binary there. Leftover `/storybook/` links scrubbed.

  No public API was added or removed in this release — all changes are
  fixes, infra, or new demo routes. Bumping minor would have been
  defensible for the new test/visual/token-generator infra, but every
  behavior change is backward compatible, so going with patch.
