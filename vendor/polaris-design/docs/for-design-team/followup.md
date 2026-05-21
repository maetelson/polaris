# 디자인팀 조율 항목 — v0.8 정의서 정합 검토

**Last updated**: 2026-05-10 · **Polaris Design 버전**: v0.8.0-rc.7

이 문서는 두 가지를 한곳에 묶어 관리합니다:

- **Part A** — v0.7 재검수 follow-up 5건 (Tertiary / Modal / Checkbox 등)의 진행 상태
- **Part B** — 디자인팀이 제공한 정의서 (`Design System: Polaris Office`, 이하 **"디자인 정의서"**) 대비 우리 구현의 **정합 / 비정합 / 확장** 종합 표
- **Part C** — Part B에서 발견된 새로운 결정 필요 항목 (디자인팀이 한 번 더 확인 또는 결정해 줘야 하는 것)

답을 받는 대로 본문을 채우고 컴포넌트 PR로 진행합니다.

---

## 📍 한눈 요약

| 영역 | 정합 | 비정합 (디자인팀 결정 필요) | 확장 (디자인팀 confirm 필요) |
|---|---|---|---|
| 시맨틱 컬러 토큰 | 36 / 36 ✓ | 0 | `accent-brand-normal-subtle` 1건 |
| Typography | 11단계 + 모바일 scale ✓ | 0 | 0 |
| Spacing | 12레벨 + breakpoint ✓ | 0 | 0 |
| Radius | xs~2xl + pill ✓ | **`radius-full` → `radius-pill` rename** | `radius-2xs` 1건 |
| Shadow | level 정합 | **shadow 값 자체가 다름** (offset / opacity / color) | `shadow-ai`, `shadow-focus` 2건 |
| Focus ring | — | **outline 2px + offset (spec) vs box-shadow 3px (구현)** | 0 |
| 컬러 ramp | brand 5 + Dark Blue 정합 | 0 | 5 supplementary palettes 확장 |
| Surface elevation | layer.surface 정합 | 0 | `surface-popover` / `surface-modal` 2단계 |
| Button | 6 sizes / Primary~Tertiary ✓ | 0 | `ai`, `danger` variant 2건 |
| Input / Form | 52px / floating title / ErrorIcon ✓ | 0 | 0 |
| Modal / Dialog | radius / overlay / shadow ✓ | 0 | `DialogFooter fullWidthButtons` 1건 |
| Toast | 48px / blur / 3초 / 아이콘 ✓ | 0 | 0 |
| Components (디자인 정의서에 spec 없음) | — | — | **컴포넌트 30+ 종 확장** |
| 도구 / 자동화 | — | — | lint 8룰 / codemod / plugin 모두 확장 |

종합: **시맨틱 토큰 / 타이포 / 컴포넌트 spec 본문은 디자인 정의서와 거의 100% 정합.** 비정합은 (1) Radius `full` 이름 (rename), (2) Shadow 값 자체, (3) Focus ring 구현 방식 — 이 3건이 핵심이고, 그 외는 모두 *확장* 으로 디자인팀 confirm을 받으면 정합 처리됨.

---

# Part A — v0.7 재검수 follow-up 진행 상태

## ✅ 처리 완료 (v0.7.3 ~ v0.8.0-rc.7)

| 항목 | 처리 버전 | 근거 |
|---|---|---|
| 1차 outline → tertiary 일괄 (22곳) | v0.7.3 | 디자인 정의서 §4 Tertiary spec |
| status-* → state-* 토큰 마이그 (24줄) | v0.7.3 | 디자인 정의서 §2 Semantic Tokens |
| Form helper-text `font-normal` 임시 패치 | v0.7.3 → v0.7.4 정식 토큰화 | 디자인 정의서 §4 Inputs & Forms |
| Helper text 별도 토큰 (`polaris-helper`, 12px / 400 / lh 1.3) | v0.7.4 | 디자인 정의서 §4 — Floating Title / Error Text 모두 weight regular |
| FormMessage 자동 ErrorIcon prepend (16px / 4px gap / state-error) | v0.7.4 | 디자인 정의서 §4 — "필수: 아이콘 동반 ... WCAG 1.4.1" |
| Checkbox / Textarea 에러 메시지에도 ErrorIcon 일관성 적용 | v0.7.4 | 동일 spec |
| brand 5종 hex / 타이포 11단계 / heading 700 / radius 8단계 / Button 6 사이즈 / Tertiary / Black variant | v0.7.0~v0.7.2 | 디자인 정의서 §2~§4 |
| **Button `outline` variant 제거** (rc.0의 `tertiary` 단일화) | v0.8.0-rc.0 | Tertiary 한 spec — 디자인 정의서 §4 |
| **`DialogFooter fullWidthButtons` prop 추가** (모바일 narrow modal에서 두 액션 half-width pair) | v0.8.0-rc.0 | follow-up #2의 추천안 적용 (디자인팀 confirm 대기) |
| **`Checkbox variant="ai"` 추가** (NOVA Purple) | v0.8.0-rc.0 | follow-up #4의 추천안 (디자인팀 confirm 대기) |
| 포커스 링 모든 variant 통일 (`shadow-polaris-focus`) | v0.8.0-rc.0 | 일관성 정리 — *구현 방식*은 디자인 정의서와 다름 (Part B 참조) |

## 🔴 디자인팀 답이 여전히 필요한 follow-up 5건

각 항목은 **질문 형식**으로 정리. 답을 받는 즉시 컴포넌트 PR로 진행. 새 항목은 Part C에 추가.

### A1. Button — Tertiary / Ghost 명확화

**현재 상태**: 코드에 `tertiary`(gray bg, `--fill-normal`)와 `ghost`(transparent bg, hover→`--interaction-hover`) 두 variant가 별개로 존재. 1차 검수자는 "흰 배경 + 회색 배경 2종 Tertiary"가 필요하다고 지적했으나, 디자인 정의서 §4는 "Tertiary / Ghost"가 한 spec(gray fill).

**받아야 할 답**:
1. 우리 `ghost` (transparent) 가 디자인팀이 말한 "흰 배경 Tertiary"와 동일한가?
2. 동일하면 — 카탈로그 / Storybook / Button JSDoc에 "Tertiary 2종 = `tertiary`(gray) + `ghost`(white)"로 명시 + 디자인 정의서 보강 요청
3. 다르면 — 흰 solid bg + 보더 *제3 variant* spec (배경 / 보더 / hover / active)
4. 사용 컨텍스트 (취소 / 이전으로 / 목록보기 / 목록 더보기 등)

### A2. Modal / Dialog — 풀 너비 버튼 레이아웃 (rc.0에서 `fullWidthButtons` prop으로 임시 적용)

**현재 상태**: `DialogFooter fullWidthButtons={true}` 시 직접 자식 `<button>`을 `flex-1`로 늘려 row 폭을 균등 분할. 기본은 우측 정렬.

**디자인 정의서 단서**: §4 Modals & Dialogs에 layout 룰 명시 없음. §9 Responsive에 모바일은 바텀 시트로 전환.

**받아야 할 답**:
1. 우리 `fullWidthButtons` 동작이 디자인팀이 의도한 "풀 너비"와 정합한가?
2. layout 정확히:
   - (a) 단일 버튼 → 가로 100%
   - (b) 2 버튼 → 50/50
   - (c) 3 버튼 → 33/33/33
   - (d) 데스크톱은 우측 정렬 유지인지, 모바일에서만 풀 너비인지
3. 모달 사이즈(480px / 720px)별 동일 룰?
4. 버튼 순서 — 취소 위치 (왼쪽 / 오른쪽 / 권역별 차이)
5. Dialog / AlertDialog / Drawer / Sheet 모두 같은 룰?

### A3. Checkbox — 4가지 형태 분리

**현재 상태**: `Checkbox`가 사각 체크 단일 (+ rc.0의 `variant="ai"` AI Purple).

**디자인 정의서 단서**: Checkbox 섹션 자체가 없음 (spec 미존재).

**받아야 할 답**:
1. 4가지 형태(사각 체크 / 원형 체크 / 체크마크만 / 라디오) 각각 visual spec
2. API 형태:
   - (a) 단일 컴포넌트 + variant prop: `<Checkbox shape="square|round|check|radio">`
   - (b) 4개 컴포넌트 분리
   - (c) 라디오는 별도 `RadioGroup` (접근성 — 현재 폴라리스에 없음)
3. 각 형태의 use case 가이드라인
4. RadioGroup 동시 신설 여부

### A4. Checkbox AI Purple — rc.0 추천안 confirm

**현재 상태 (v0.8.0-rc.0)**: `<Checkbox variant="ai">` 추가됨. AI 컨텍스트(예: "AI 추천 적용", "Polaris GPT-4 사용") 용 NOVA Purple 체크박스. 기본은 `default` (Brand Blue) 그대로.

**받아야 할 답**:
1. 추가된 토큰 매핑 (체크 표시 색 = `bg-ai-normal`, 보더 = `border-ai-normal`) confirm
2. 사용 컨텍스트 — NOVA 영역 안에서만? 컨텍스트 자유 선택?
3. 다른 form control (Switch / RadioGroup / Toggle) 도 동일 AI variant 필요?

### A5. Alert — 유지 / 제거 결정

**현재 상태**: `Alert.tsx` (Tier 2) 그대로 존재 + v0.7.3에 토큰 정합 (state-* 사용) + v0.7.7에 `dismissible` × `action` slot 추가.

**디자인 정의서 단서**: §4 Components에 Alert 섹션 *없음*. 알림 컴포넌트는 `Toasts & Notifications` 단일 — 자동 사라짐 3초.

**받아야 할 답**:
1. **Alert 컴포넌트 유지 / 제거 방침**:
   - (a) 제거 — 모든 알림 → Toast (디자인 정의서 흐름)
   - (b) 유지 — Toast로 표현 못 하는 use case
2. 유지면 — 디자인 정의서에 추가될 spec (배경 / 보더 / 아이콘 / 액션 버튼 / dismiss / a11y role)
3. 제거면 대체 패턴 — 영구 inline 안내 / 페이지 banner 어떻게?
4. Banner 별도 컴포넌트 신설 평가
5. 결정 시점 — v0.8 BREAKING에 묶을지 / 점진 deprecated

**현재 운영 방침 (확정 전 임시)**: Alert 그대로 유지. 사용 자제 권고만 명시.

---

# Part B — 디자인 정의서 정합도 종합 표

이 표는 디자인팀이 제공한 정의서 (`Design System: Polaris Office`) 의 각 절을 우리 v0.8 구현과 1:1로 비교한 것입니다. 각 항목은:

- ✅ **정합** — 정의서 spec 그대로 구현됨
- ⚠️ **비정합** — 정의서와 우리 구현이 다름. 둘 중 어느 쪽이 정답인지 디자인팀 결정 필요
- 🟢 **확장** — 정의서엔 없지만 실전 사용 중 추가된 토큰 / 컴포넌트. 디자인팀 confirm 후 정의서에 추가될 후보

## §2 Color Palette

### 시맨틱 토큰 (36개)

| 토큰 | 정의서 light/dark | 우리 light/dark | 결과 |
|---|---|---|---|
| `--label-{normal/neutral/alternative/assistive/inverse/disabled}` | 6종 | 6종 동일 | ✅ 정합 |
| `--background-{base/disabled}` | 2종 | 2종 동일 | ✅ 정합 |
| `--layer-{surface/overlay}` | 2종 | 2종 동일 | ✅ 정합 |
| `--interaction-{hover/pressed}` | 2종 | 2종 동일 | ✅ 정합 |
| `--fill-{neutral/normal/strong}` | 3종 | 3종 동일 | ✅ 정합 |
| `--line-{neutral/normal/strong/disabled}` | 4종 | 4종 동일 | ✅ 정합 |
| `--accent-brand-{normal/strong/bg/bg-hover}` | 4종 | 4종 동일 | ✅ 정합 |
| `--accent-action-{normal/strong}` | 2종 | 2종 동일 | ✅ 정합 |
| `--focus-ring` | `#60A5FA` | `#60A5FA` | ✅ 정합 |
| `--static-{white/black}` | 2종 모드 무관 | 동일 | ✅ 정합 |
| `--state-{new/success/warning/error/info}` + `*-bg` 페어 | 9종 | 9종 동일 | ✅ 정합 |
| `--accent-brand-normal-subtle` (light `#E8F2FE` / dark `#1A2238`) | **정의서에 없음** | 추가됨 | 🟢 **확장** — Navigation active / hover 틴트 등에서 사용. 정의서에 추가 후보 |

### Brand Primitive Colors (10단계 ramp)

| 패밀리 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| Polaris Blue (`po_blue`) | `-50` 단일 step 별칭 | 10-step ramp `bluePalette` (05~90) | 🟢 확장 (10단계는 차트 / hover 미세조정 용) |
| Polaris Dark Blue | `-50` 단일 | 10-step `darkBluePalette` | 🟢 확장 |
| AI Purple | `-50` + `-05` (tint) | 10-step `purplePalette` (-50 = `#6F3AD0`, -05 = `#F5F1FD`) | ✅ 정합 + 확장 (10단계) |
| Polaris Green | `-50` 단일 (= state-success) | 10-step `greenPalette` | 🟢 확장 |
| Polaris Orange / Red | 정의서에 없음 (state-* 만) | `orangePalette` / `redPalette` 10-step | 🟢 확장 |
| Sky Blue / Blue Supplementary / Violet / Cyan / Yellow | **정의서에 없음** | 5 supplementary palettes (각 10-step) | 🟢 **확장** — 차트 카테고리 / 플랜 뱃지 / 미디어 포맷 등 충돌 회피용. 디자인 정의서에 추가 후보 |
| Gray ramp (`gray-10..90`) | 정의서엔 ramp 명시 없음 (semantic 토큰 hex만) | 9-step `grayRamp` | 🟢 확장 — UI 백본, semantic 토큰의 source |

## §3 Typography

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| 폰트 family | Pretendard + apple-system fallback | `"Pretendard Variable", Pretendard, …` | ✅ 정합 |
| 11단계 scale (Display 40 / Title 32 / Heading1-4 28-18 / Body1-3 16-13 / Caption1-2 12-11) | 11단계 | 11단계 동일 | ✅ 정합 |
| Weight 매핑 (heading 700 / body 400 / caption 700) | 정의서 §3 표 | 동일 | ✅ 정합 |
| Line-height 비율 (heading 1.4 / body 1.5 / caption 1.3) | 정의서 §3 | px로 풀어 매칭 (40/56=1.4, 16/24=1.5, 12/16=1.33) | ✅ 정합 |
| Mobile scale (≤767px 자동 한 단계 down) | 정의서 §3 표 | tokens.css `@media` 자동 적용 | ✅ 정합 |
| letter-spacing 금지 | 정의서 §3 원칙 | 모든 step `letterSpacing: '0'` | ✅ 정합 |

## §4 Component Stylings

### Button

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| 6 sizes (24/32/40/48/54/64) | 정의서 §4 표 | size axis 6단계 (xs/sm/md/lg/xl/2xl) | ✅ 정합 |
| Primary (Brand Blue) | bg accent-brand-normal, text inverse, radius md, hover strong | 동일 | ✅ 정합 |
| Secondary (Brand Tint) | bg accent-brand-bg, text accent-brand-normal | 동일 | ✅ 정합 |
| Tertiary / Ghost | gray fill 한 spec | `tertiary` (gray) + `ghost` (transparent) 2종 | ⚠️ **follow-up A1 — 디자인팀 답 대기** |
| Primary Dark (Black) | accent-action-* + dark mode override | 동일 (`accent-action.normal/strong` 다크 자동 반전) | ✅ 정합 |
| Pill / Large CTA | className으로 처리 | size axis (xl)에 통합 + `rounded-polaris-pill` className | ✅ 정합 (구현 방식만 다름) |
| AI variant | 정의서에 Button-level spec 없음 | `variant="ai"` 추가 | 🟢 확장 (디자인 정의서 §4 NOVA components 일반 룰만 — Button-level confirm 후보) |
| Danger variant | 정의서에 destructive button spec 없음 | `variant="danger"` (state-error bg) | 🟢 확장 (삭제 / 영구 액션 — 디자인 정의서 confirm 후보) |

### Cards & Containers

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| layer-surface bg / line-neutral border / radius-md / hover shadow-sm | 정의서 §4 | 동일 | ✅ 정합 |
| 패딩 spacing-lg | 24px | 동일 | ✅ 정합 |

### Inputs & Forms

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| 52px height / 20px h-padding | 정의서 §4 | 동일 | ✅ 정합 |
| radius-sm (8px) / 보더 line-neutral / focus border accent-brand-normal | 정의서 §4 | 동일 | ✅ 정합 |
| Floating title (12px regular lh 1.3) | 정의서 §4 | 동일 | ✅ 정합 |
| Error text (12px regular lh 1.3) + ErrorIcon 16px 동반 | 정의서 §4 + WCAG 1.4.1 | 동일 (FormMessage 자동 prepend) | ✅ 정합 |

### Badges & Tags

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| radius-xs / Caption1 / padding 2px 8px | 정의서 §4 | 동일 | ✅ 정합 |
| Variants (Brand / Success / Error / Warning / Neutral) | 5종 | 5종 동일 (`tone` axis) | ✅ 정합 |
| `variant` axis (subtle / solid / outline) | 정의서엔 없음 | 추가됨 — 시각 강도 분리 | 🟢 확장 |
| `dismissible` × `icon` slot | 정의서엔 없음 | 추가됨 (rc.7 stage) | 🟢 확장 (필터 chip 패턴 — confirm 후보) |
| "New" notification dot (state-new, 6px) | 정의서 §4 | `state.new` 토큰 + Avatar / NotificationBadge에 적용 | ✅ 정합 |

### Modals & Dialogs

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| layer-surface / radius-xl 24px / overlay rgba(0,0,0,0.5) / shadow-lg / z-modal 400 | 정의서 §4 | 동일 | ✅ 정합 |
| max-width 480 (standard) / 720 (large) | 정의서 §4 | 동일 | ✅ 정합 |
| 패딩 spacing-lg (24px) | 정의서 §4 | 동일 | ✅ 정합 |
| `DialogFooter fullWidthButtons` prop | 정의서엔 buttons layout 룰 자체 없음 | 추가됨 | 🟢 / ⚠️ **확장 + follow-up A2** — 디자인팀 confirm 대기 |

### Toasts

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| 48px height / radius-md / overlay 0.5 + blur 6px / static-white text 14px medium | 정의서 §4 | 동일 | ✅ 정합 |
| 자동 사라짐 3초 / 화면 중앙 50px 여백 / 아이콘 20px + 닫기 24px | 정의서 §4 | 동일 (`Toaster defaultDuration`) | ✅ 정합 |
| Type: fail / success | 정의서 §4 | 동일 + `info` / `warning` 추가 (state-* 4종 모두) | 🟢 확장 (네 가지 state-* 토큰 모두 활용 — 정의서에 추가 후보) |

### Dropdowns & Popovers

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| layer-surface / line-neutral / radius-md / shadow-md / z-dropdown 100 | 정의서 §4 | 동일 | ✅ 정합 |
| Item hover/pressed: interaction-hover/-pressed | 정의서 §4 | 동일 | ✅ 정합 |

### Navigation / Menu Items

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| Active: accent-brand-bg + accent-brand-normal text/icon | 정의서 §4 | `<NavbarItem active>` / `<SidebarItem active>` 동일 | ✅ 정합 |
| Hover: interaction-hover | 정의서 §4 | 동일 | ✅ 정합 |
| Body2 14px weight 500 / icon-label 8px gap | 정의서 §4 | 동일 | ✅ 정합 |

### AI / NOVA

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| Gradient `#9D75EC` → `#6F3AD0` | 정의서 §4 | 사용 위치: NovaInput / NovaLogo 등 | ✅ 정합 |
| Tint bg `--color-po_ai_purple-05` (`#F5F1FD`) | 정의서 §4 | `purplePalette['05']` 동일 hex | ✅ 정합 (이름만 다름) |
| AI / NOVA badge | 정의서 §4 | `<Badge tone="ai">` | ✅ 정합 |

## §5 Layout

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| Spacing 12 levels (none/4xs/3xs/2xs/xs/sm/md/lg/xl/2xl/3xl/4xl) | 정의서 §5 | `spacingNamed` 11단계 (none = 0, 별도 토큰 X) | ✅ 정합 |
| Grid 4 breakpoints (mobile / tablet-v / tablet-h / desktop) | 정의서 §5 표 | `breakpoint` 동일 | ✅ 정합 |
| Max content width 1200px / section padding 48-64px | 정의서 §5 원칙 | `Container` 컴포넌트 | ✅ 정합 |
| **Radius scale (xs 4 / sm 8 / md 12 / lg 16 / xl 24 / 2xl 38 / full 9999)** | 정의서 §5 표 — `--radius-full` 명시 | **`radius.pill` (9999) — `full` 이름은 v0.8에서 제거** | ⚠️ **비정합 — 이름 차이** (Part C 새 항목) |
| `radius-2xs` (2px) | 정의서엔 없음 | 추가됨 | 🟢 확장 |

## §6 Depth & Elevation

| Level | 정의서 light shadow | 우리 light shadow | 결과 |
|---|---|---|---|
| Surface | 보더 line-neutral | 동일 | ✅ 정합 |
| Hover | `--shadow-sm: 0 1px 3px rgba(0,0,0,0.04)` | `--polaris-shadow-sm: 0 2px 6px rgba(15,15,35,0.08)` | ⚠️ **비정합 — shadow 값 자체** |
| Dropdown | `--shadow-md: 0 2px 8px rgba(0,0,0,0.06)` | `--polaris-shadow-md: 0 8px 20px rgba(15,15,35,0.10)` | ⚠️ **비정합** |
| Modal | `--shadow-lg: 0 4px 16px rgba(0,0,0,0.08)` | `--polaris-shadow-lg: 0 20px 40px rgba(15,15,35,0.14)` | ⚠️ **비정합** |
| `--shadow-xs` (정의서 — flat hover) | `0 1px 2px ...` 정의 없음 | `--polaris-shadow-xs: 0 1px 2px rgba(15,15,35,0.06)` | 🟢 확장 |
| `shadow-ai` (purple glow) | 정의서엔 없음 | NovaInput / 응답 카드 용 | 🟢 확장 |
| `shadow-focus` (3px focus ring) | 정의서엔 outline 방식 | 추가됨 | ⚠️ + 🟢 (Part C 새 항목 — focus ring 방식 결정) |

## §7 Motion

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| Duration (instant 100 / fast 150 / normal 250 / slow 350) | 정의서 §7 표 | 동일 | ✅ 정합 |
| Easing (in-out / out / in cubic-bezier) | 정의서 §7 표 | 동일 | ✅ 정합 |
| Animation patterns (modal opacity+translateY / dropdown opacity+scaleY / toast slide / button bg-color) | 정의서 §7 표 | 컴포넌트별 적용 — 시각 회귀 baseline으로 검증 중 | ✅ 정합 (확인 완료 — Tabs/Dialog/Drawer/DropdownMenu/Tooltip) |
| Reduced motion (`@media prefers-reduced-motion: reduce`) | 정의서 §7 | 컴포넌트별 `motion-safe:` 또는 자동 처리 | ✅ 정합 |

## §9 Responsive

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| Navigation (240px desktop / 56px tablet-h / hamburger mobile) | 정의서 §9 | Sidebar 컴포넌트 + responsive | ✅ 정합 |
| Modal mobile = bottom sheet (radius-xl 상단만, 85vh, 핸들바) | 정의서 §9 | Drawer + responsive 동작 | ✅ 정합 |
| Dropdown mobile = full-width bottom sheet | 정의서 §9 | 컴포넌트별 처리 | ⚠️ **부분 정합 — 일부 컴포넌트만** (Part C에 일관성 검토 항목 추가) |
| Toast mobile (좌우 16px / 하단 50px) | 정의서 §9 | 동일 | ✅ 정합 |
| Card grid 3-2-1 col | 정의서 §9 | StatGroup `cols={4}` 등에 자동 | ✅ 정합 |
| Form 모바일 수직 스택 / 입력 52px 유지 | 정의서 §9 | 동일 | ✅ 정합 |
| Touch target 44×44 / 인접 8px / 링크 8px 패딩 | 정의서 §9 | Button 32px 미만 사이즈는 className 처리 권장 | ⚠️ **부분 정합** — Button 24/32 사이즈가 시각 크기는 32 미만이지만 자동 투명 패딩 미적용 (Part C 검토) |
| iOS safe area | 정의서 §9 | template-next에서만 일부 적용 | ⚠️ 부분 정합 (Part C) |

## §10 Accessibility

| 항목 | 정의서 | 우리 | 결과 |
|---|---|---|---|
| 색상 contrast 표 (label-normal 14.78:1 etc) | 정의서 §10 | 동일 — 검증 완료 | ✅ 정합 |
| `--accent-brand-normal` 14px 단독 사용 시 underline 필수 | 정의서 §10 | lint 룰 (`@polaris/state-color-with-icon` 와 별개) — *현재 미적용* | ⚠️ Part C 새 항목 |
| state-* 본문 단독 사용 금지 (icon 동반) | 정의서 §10 | `@polaris/state-color-with-icon` 룰 적용 | ✅ 정합 |
| Focus ring `outline: 2px solid var(--focus-ring); outline-offset: 2px` | **정의서 §10** | `box-shadow: 0 0 0 3px color-mix(...)` (`shadow-polaris-focus`) | ⚠️ **비정합 — 구현 방식 차이** (Part C 새 항목) |
| ARIA 가이드라인 (role / aria-label / aria-modal etc) | 정의서 §10 | 컴포넌트별 적용 | ✅ 정합 |

---

## §11 Quick Color Reference + 컴포넌트 카탈로그 — 우리 시스템 확장

디자인 정의서는 토큰과 컴포넌트 *spec* 까지가 범위. 우리 시스템은 그 위에 *실제 사용 가능한 컴포넌트 라이브러리*를 얹은 것이라, 컴포넌트 단위로는 큰 확장이 있습니다.

### 컴포넌트 — 정의서에 spec 없는 신규 컴포넌트 (디자인팀 confirm 후보)

| Tier | 컴포넌트 | 도입 버전 | 간단 설명 | confirm 필요 사항 |
|---|---|---|---|---|
| 0 | FileIcon | v0.7.0 | 29 파일 타입 SVG dispatcher | 색상 매핑 / 새 타입 추가 절차 |
| 0 | FileCard | v0.7.0 | 파일 카드 (file-icon + 이름 + 메타) | 카드 레이아웃 spec |
| 0 | NovaInput | v0.7.0 | NOVA chat composer | 그라디언트 / shadow-ai / 마이크 액션 spec |
| 1 | PromptChip | v0.7.0 | NOVA hover chip (필터 / 빠른 액션) | 색상 / hover state |
| 2 | DescriptionList | v0.7.0 | term-description 쌍 | 레이아웃 / typography |
| 2.5 | Stack / Container | v0.7.0 | 레이아웃 primitive | (확장 — 정의서엔 spacing token만) |
| 3 | DatePicker / DateRangePicker / Calendar | v0.7.0 | 날짜 picker | 캘린더 셀 spec / hover / today / range |
| 3 | Combobox | v0.7.7 | searchable Select (cmdk) | spec |
| 3.5 | Progress / CircularProgress | v0.7.5 | 선형 / 라디얼 progress | tone / variant / size |
| 3.5 | CopyButton | v0.7.5 | clipboard + 1.5초 success state | a11y / motion |
| 3.5 | Stat / StatGroup | v0.7.5 | KPI 타일 + 4-up grid | typography / delta tone |
| 3.5 | Disclosure / Accordion | v0.7.5 / v0.7.7 | single / group collapsible | chevron / motion |
| 3.6 | FileInput / FileDropZone | v0.7.5 | 파일 picker (모바일 OS 통합) | drop state / progress |
| 3.6 | DateTimeInput / TimeInput | v0.7.5 | native datetime / time wrapper | floating label 일관성 |
| 3.6 | PaginationFooter | v0.7.5 | Pagination + page-size + total | 모바일 layout |
| 3.7 | TableSearchInput / TableToolbar / TableSelectionBar / TableSkeleton | v0.7.5 | 데이터 테이블 chrome 묶음 | 일관 패턴 spec |
| 3.8 | PageHeader / SectionHeader | v0.7.7 | title + description + breadcrumb + actions | typography + divider |
| 3.8 | NavbarItem | v0.7.7 | Navbar용 active / asChild / icon (Sidebar 패턴 미러링) | active 상태 spec (이미 정의서 §4 정합) |
| 3.8 | AvatarGroup | v0.7.7 | overlap + +N | overlap 간격 / +N 버튼 |
| Ribbon | Ribbon family (25+ 종) | v0.7.0 | Office-style 리본 + 91 ribbon-icons | 그룹 spacing / 분리자 / 멀티컬러 아이콘 |
| Form | Form / FormField / FormItem / FormLabel / FormControl / FormMessage | v0.7.0 | react-hook-form + zod 통합 | 에러 layout (정합 검증 완료) |

> **요청**: 위 컴포넌트들 중 디자인팀이 spec을 정식으로 정의해 주실 우선순위 후보를 알려 주세요. 우리는 코드와 figma export로 현재 상태를 보내 드릴 수 있습니다.

### 도구 / 자동화 — 정의서엔 시스템 자체에 대한 spec 외엔 없는 영역 (디자인팀 인지만 필요)

| 항목 | 설명 |
|---|---|
| `@polaris/lint` 8 룰 | hex 차단 / 임의값 차단 / direct font-family 차단 / native 요소 차단 / state color icon 동반 / deprecated alias 차단 / non-polaris CSS var 차단 / icon 권장 |
| `polaris-codemod-v07/v08` | 토큰 / Tailwind / CSS 변수 / JSX prop / HStack-VStack 일괄 변환 |
| `polaris-audit` | 위반 통계 + top hex/임의값 분석 |
| `polaris-design` 플러그인 | Claude Code 플러그인 — skill + slash command + PostToolUse 훅 |
| `pnpm verify` 14단계 게이트 | release-gate (token sync / DESIGN.md sync / typecheck / lint / build / dead-alias scan) |

---

# Part C — 디자인팀 결정 / confirm 필요한 새 항목 (Part B에서 발견)

## 🔴 비정합 — 어느 쪽으로 갈지 결정 필요

### C1. Radius `full` (정의서) vs `pill` (구현)

**정의서**: `--radius-full: 9999px` (§5 표)
**구현 (v0.8)**: `--polaris-radius-pill: 9999px` (`full` alias는 v0.8에서 제거됨)

**받아야 할 답**:
1. 디자인 정의서를 `pill`로 갱신해 주세요 (CSS / Figma library 동기화)
2. 또는 우리 구현을 `radius-full`로 되돌릴까? (이 경우 codemod-v09 추가 필요 + breaking)

**우리 의견**: `pill`이 의미적으로 더 정확 (capsule shape vs "full radius" 모호). 정의서 갱신 권장.

### C2. Shadow 값 (offset / opacity / 색상) 차이

**정의서 (§6)**:
```
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04)
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08)
```

**구현 (v0.8)**:
```
--polaris-shadow-xs: 0 1px 2px rgba(15, 15, 35, 0.06)
--polaris-shadow-sm: 0 2px 6px rgba(15, 15, 35, 0.08)
--polaris-shadow-md: 0 8px 20px rgba(15, 15, 35, 0.10)
--polaris-shadow-lg: 0 20px 40px rgba(15, 15, 35, 0.14)
```

차이:
- offset / blur 모두 다름 (정의서가 더 옅고 컴팩트, 우리가 더 길고 깊음)
- 색상 — 정의서는 `rgba(0,0,0,*)` (순수 검정), 우리는 `rgba(15,15,35,*)` (살짝 푸른 검정)
- opacity — 우리가 약 1.5배 더 강함

**받아야 할 답**:
1. 정의서 spec이 정답인지, 우리 구현이 정답인지
2. 정의서 spec이 정답이면 우리 토큰을 정의서 값으로 마이그 (시각 회귀 baseline 갱신 동반)
3. 우리 구현이 정답이면 정의서 갱신
4. 색상 (`rgba(0,0,0,*)` vs `rgba(15,15,35,*)`) 의도 — 우리는 약간 푸른 검정으로 한 이유가 있는지 (다크 모드에서 더 자연스럽다고 판단)

**우리 의견**: 정의서가 더 *productivity 도구* 느낌 (옅은 그림자). 우리 값은 *consumer 앱* 느낌 (더 깊음). 디자인팀 결정.

### C3. Focus ring 방식 — outline (정의서) vs box-shadow (구현)

**정의서 (§10)**: `outline: 2px solid var(--focus-ring); outline-offset: 2px`
**구현 (v0.8)**: `box-shadow: 0 0 0 3px color-mix(in srgb, var(--polaris-focus-ring) 35%, transparent)`

차이:
- 두께 (2px vs 3px)
- 방식 (outline vs box-shadow) — outline은 layout에 영향 없음, box-shadow는 element clipping(`overflow: hidden`)에 잘림
- 색상 alpha (정의서는 100% / 우리는 35% — light, 45% — dark)

**받아야 할 답**:
1. 정의서 spec(2px outline + offset)이 정답인지
2. 우리가 box-shadow로 간 이유 — `overflow: hidden` 보더에서도 잘리지 않고 보이게 하기 위해. 정의서 방식은 round corner 컴포넌트에서 보더 모양 따라 깎임
3. 두 가지 다 지원이 가능한지 (컴포넌트별 선택)

**우리 의견**: 실용상 box-shadow가 더 안정적이지만 정의서 spec과 맞추는 게 일관성 우선이라면 outline으로 회귀. 디자인팀 결정.

### C4. `radius-2xs` (2px) 추가 — confirm

**현재**: 우리 시스템엔 `radius-2xs: 2px` 추가됨 (chrome 미세조정용 — 예: 작은 별표 dot, 4px보다 작은 inner radius)

**받아야 할 답**: 정의서에 추가? 또는 그냥 chrome 한정 — `var(--polaris-radius-2xs)` 직접 참조 안내?

### C5. Mobile Dropdown — 풀 너비 바텀 시트 적용 일관성

**정의서 (§9)**: 모든 dropdown / popover 가 모바일에서 풀 너비 바텀 시트로 전환

**구현 현황**: `Combobox` / `Select` / `DropdownMenu` 일부는 적용, `Popover` (raw) 와 `Tooltip`은 데스크톱 동작 그대로

**받아야 할 답**: 모든 dropdown 패밀리에 모바일 → 바텀 시트 강제? 또는 일부 (예: 짧은 메뉴) 는 inline 유지?

### C6. Touch target 자동 투명 패딩 (Button 24/32 사이즈)

**정의서 (§9)**: 시각 크기 44px 미만은 투명 패딩으로 터치 영역 확장

**구현 현황**: 자동 투명 패딩 미적용. Button size 24 (h-6) / 32 (h-8) 는 모바일 터치 영역 부족

**받아야 할 답**: 자동 적용 (`min-h-11 min-w-11` 같은) — 시각 크기는 유지, 터치 영역만 확장? 또는 카탈로그 / lint 룰로 "모바일에서 24/32 사이즈 사용 금지" 가이드?

### C7. iOS safe area 적용 일관성

**정의서 (§9)**: 바텀 시트 / 하단 고정 버튼에 `env(safe-area-inset-bottom)` 필수

**구현 현황**: `template-next` 의 일부 페이지만 적용. `Drawer` / `Dialog` 자체는 미적용

**받아야 할 답**: Drawer / Dialog 컴포넌트에 자동 적용 (props 없이) 또는 prop opt-in?

### C8. `accent-brand-normal` 14px 단독 사용 시 `text-decoration: underline` 강제 lint

**정의서 (§10)**: AA 미달이라 14px 이하 본문 / 링크는 underline 필수

**구현 현황**: 룰 미존재. `@polaris/state-color-with-icon` 와 비슷한 형태로 추가 가능

**받아야 할 답**: 신규 lint 룰 `@polaris/brand-link-underline` 추가 — 14px 이하 `text-accent-brand-normal` 사용 시 underline 동반 강제. 디자인팀이 spec 명문화 후 룰 추가.

### DT-A. `<Stat>` value 색상 입힘 허용 여부 (컨슈머 피드백 #5)

**현재 상태**: `<Stat>` 의 `delta` 만 `deltaVariant` (positive/negative/accent/neutral) 로 색 적용 가능. `value` 자체는 항상 `label-normal` (흑색 numeric).

**컨슈머 케이스**: 자체 KPI 컴포넌트가 `tone="emerald"` (활성) / `tone="amber"` (대기) 같은 *상태 신호* 를 value에 적용하던 패턴. 폴라리스 도입 후 모두 흑색 numeric으로 평준화되어 시각 신호 손실. `value={<span className="text-state-success">12</span>}` 같은 inline span으로 우회 가능하지만 *컴포넌트 의도 (semantic token-only API)* 와 어긋남.

**받아야 할 답**:
1. `<Stat>` 의 value 색은 *흑색 권위 유지가 spec* 인지 — KPI 는 숫자가 차분해야 한다는 의도인지
2. 또는 `valueVariant` prop 추가가 디자인팀 의도와 정합한지 — `deltaVariant` 와 같은 enum (`positive` / `negative` / `accent` / `neutral`)
3. 정합이라면 — value 색 입히는 use case 가이드 (활성/대기/위험 상태 KPI 등)
4. 정합 아니라면 — 컨슈머가 시각 신호를 어떻게 표현해야 하는지 대안 (예: delta 색 강조만 사용, Badge 동반)

**결정 후 작업** (정합 경로): `<Stat valueVariant>` prop 추가. additive 변경이라 v0.8.x patch에 즉시 가능.

### DT-B. `<PageHeader>` 의 카드 안 변종 (컨슈머 피드백 #2)

**현재 상태**: `<PageHeader>` 는 page-level (Card 외부, divider 아래) 기본 spec. 컨슈머는 "title 카드 + 컨텐츠 카드" stacked-card 레이아웃이 표준이라 자체 HeroPanel을 Card로 만들고 있었음.

**컨슈머 케이스**: PageHeader 마이그 시 시각 변화 — divider 추가됨 / Card 배경 제거됨 / 버튼 정렬 / 패딩 미세 차이. 우리 wrapper 가 PageHeader 로 *내부 교체*되면서 시각 변화 누적.

**받아야 할 답**:
1. `<PageHeader>` 의 default 시각 (page-level, divider 아래) 이 *유일한 spec* 인지 — card 안 hero는 별도 패턴이어야 하는지
2. 또는 card-내부 변종 신설이 디자인팀 의도에 부합하는지:
   - (A) `<PageHeader variant="card">` (또는 prop 이름 협의) — divider 제거 + 카드 패딩 정합
   - (B) `<PageHeaderCard>` 별도 컴포넌트 — card 안 hero 용
   - (C) 패턴 가이드만 (현재 변종 없음, 컨슈머 wrapper 권장)
3. 결정 시 시각 spec — divider / 패딩 / 액션 정렬 / Card 와의 관계

**결정 후 작업** (A/B 경로): `<PageHeader>` API 확장 또는 `<PageHeaderCard>` 신규. v0.9 minor 후보. (C 경로): docs/for-consumers/component-use-cases/page-header.md 패턴 가이드만 작성.

## 🟢 확장 — 정의서에 추가 후보 (디자인팀 confirm 후 정합화)

이 항목들은 우리 구현이 정의서를 *넘어* 추가한 것입니다. 디자인팀이 confirm해 주시면 정의서에 추가 → 정합 처리됩니다.

| ID | 항목 | 위치 | 현재 토큰 / 컴포넌트 | confirm 필요 |
|---|---|---|---|---|
| X1 | `accent-brand-normal-subtle` | 토큰 | light `#E8F2FE` / dark `#1A2238` | Navigation active hover-tint 등에서 사용. 정의서 §2에 추가 |
| X2 | Supplementary palettes (Sky Blue / Blue Supplementary / Violet / Cyan / Yellow) | 토큰 ramp | 5 family × 10-step | 차트 / 플랜 뱃지 / 미디어 포맷 — 정의서 §2에 추가 (또는 확장 컬러로 별도 부록) |
| X3 | Surface elevation tier (`surface-popover`, `surface-modal`) | 토큰 | popover (light 흰 / dark `#232336`) / modal (light 흰 / dark `#2D2D45`) | 다크모드 multi-tier elevation 필요 — 정의서 §2 + §6에 추가 |
| X4 | `Button variant="ai"` | 컴포넌트 | `bg-ai-normal` + AI 아이콘 동반 | NOVA 진입점 명시 — Button-level spec 추가 |
| X5 | `Button variant="danger"` | 컴포넌트 | `bg-state-error` | 삭제 / 영구 액션 — destructive button spec 추가 |
| X6 | `Checkbox variant="ai"` (rc.0) | 컴포넌트 | NOVA Purple checkbox | follow-up A4와 동일 |
| X7 | `Badge dismissible` × `icon` slot | 컴포넌트 | rc.7 stage | 필터 chip / 닫기 가능 뱃지 패턴 — 정의서 §4에 추가 |
| X8 | Toast `info` / `warning` type | 컴포넌트 | state-* 4종 모두 | 정의서 §4 Toast type을 4종으로 확장 |
| X9 | `DialogFooter fullWidthButtons` | 컴포넌트 | rc.0 추가 | follow-up A2와 동일 |
| X10 | `radius-2xs` (2px) | 토큰 | chrome 미세조정 용 | follow-up C4와 동일 |
| X11 | `shadow-ai` (purple glow) | 토큰 | NOVA 표면 — `0 8px 32px rgba(111,58,208,0.18) ...` | NOVA 컨텍스트 spec — 정의서 §6에 추가 |
| X12 | `shadow-focus` (3px ring) | 토큰 | 모든 interactive 공통 | follow-up C3 결정 후 — outline 방식 채택 시 제거, box-shadow 채택 시 정의서 추가 |
| X13 | NavbarItem / SidebarItem 컴포넌트 | 컴포넌트 | active / asChild / icon / href | 정의서 §4 Navigation 룰을 *컴포넌트 레벨* spec으로 확장 |
| X14 | StatGroup auto-rows-fr grid | 컴포넌트 | KPI 4-up 자동 정렬 | 정의서 §5 Card grid 외에 KPI grid 패턴 추가 |
| X15 | Ribbon family + 91 ribbon-icons | 컴포넌트 | Office 스타일 리본 | 정의서엔 영역 자체가 없음 — *별도 spec 챕터* 검토 |
| X16 | TableToolbar / TableSelectionBar / TableSkeleton | 컴포넌트 | 데이터 테이블 chrome 묶음 | 정의서 §4 Table 절 신설 후보 |
| X17 | Form (RHF + zod 통합) | 컴포넌트 (subpath) | floating label + ErrorIcon 자동 | 정의서 §4 Forms 절을 컴포넌트 레벨로 확장 |

---

## 진행 우선순위 (제안)

### 🔴 1순위 — 비정합 결정 (Part C C1-C3)

이 3건은 *오늘 컨슈머가 두 spec 사이에서 헷갈리는 항목*. v0.8 정식 출시 전에 결정 권장.

| # | 항목 | 영향 | 예상 작업량 |
|---|---|---|---|
| C1 | radius-full ↔ radius-pill | 이름만 — 정의서 갱신 또는 codemod-v09 | 0.5일 |
| C2 | Shadow 값 일치 | 시각 회귀 + baseline 갱신 + 토큰 마이그 | 1~2일 |
| C3 | Focus ring outline vs box-shadow | 모든 interactive 컴포넌트 + 시각 회귀 | 1~2일 |

### 🟡 2순위 — Part A v0.7 follow-up + 신규 결정 (C4-C8)

| # | 항목 | 영향 | 예상 작업량 |
|---|---|---|---|
| A1 | Tertiary / Ghost 명확화 | Button 문서 / 카탈로그 | 0.5~1일 |
| A2 | Modal 풀 너비 (rc.0의 추천안 confirm) | Dialog.tsx + 카탈로그 | 0.5일 |
| A3 | Checkbox 4종 + RadioGroup | 큰 작업 | 2~3일 |
| A4 | Checkbox AI Purple confirm (rc.0 적용) | Checkbox + 정책 | 0.5일 |
| A5 | Alert 유지 / 제거 결정 | Alert.tsx 유지/제거 | 0.5일 |
| C5 | Mobile dropdown 일관성 | Combobox / Select / DropdownMenu / Popover | 1일 |
| C6 | Touch target 자동 패딩 | Button 24/32 + lint | 0.5일 |
| C7 | iOS safe area 일관성 | Drawer / Dialog | 0.5일 |
| C8 | 14px 브랜드 링크 underline 강제 | 신규 lint 룰 | 0.5일 |

### 🟢 3순위 — 확장 confirm (X1-X17)

이 항목들은 *현재도 작동* — 디자인팀 confirm은 정의서 동기화 차원이라 v0.8.x patch에 점진 적용. 우선순위는 도입 빈도에 비례 (X1, X3, X11, X15, X16, X17 부터).

---

## 검토 받는 방법 (제안)

1. **Part C 의 C1-C3 + Part A 의 5건**을 첫 번째 우선순위로 디자인팀에 보내기
   - 비정합 3건은 *결정* 필요 (한 시간 미팅으로 가능)
   - follow-up 5건은 이미 질문 형식
2. **Part B의 ✅ 정합 항목**은 정보 공유만 (디자인팀이 알면 좋은 현황 — 답은 불필요)
3. **Part C의 X1-X17 (확장 항목)** 은 별도 시간 잡아서 디자인팀이 정의서에 정식 spec으로 추가할지 / 우리 시스템에서만 유지할지 결정
4. v0.8.x 정식 출시 직전에 C1-C3 에 대한 답이 있으면 그걸 반영 후 정식 태그. 답이 늦어지면 v0.8.0 정식 출시 후 v0.9 기점으로 처리.

이 문서는 답이 들어올 때마다 업데이트하세요.
