# Changelog

이 프로젝트의 **사람이 읽는** 릴리스 narrative입니다. 각 minor/major 릴리스 직후 손으로 정리합니다. 형식은 [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), 버전은 [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

> **자동 생성된 패키지 단위 CHANGELOG는 별도** — `packages/ui/CHANGELOG.md`, `packages/lint/CHANGELOG.md` 등에 `pnpm changeset version` 실행 시 자동 작성됩니다. 변경의 **단편(per-changeset)**은 거기에, **요약 narrative**는 여기에. 루트는 "이번 릴리스에서 뭘 했나" 한 페이지로 훑을 수 있게 유지합니다.

---

## [Unreleased]

다음 patch / minor 후보. 비어 있음.

---

## [0.8.0-rc.8] — 2026-05-11

실전 컨슈머의 RSC 친화 요구 6건을 한 사이클에 묶어 처리. **rc.7 대비 BREAKING 변경 없음** — 모든 추가는 *opt-in additive*. controlled API는 그대로 유지되어 client SPA 컨슈머는 코드 변경 0.

### 신규 — RSC 친화 (additive, 모두 opt-in)

- **`@polaris/ui/utils` subpath 신규** — server-safe 순수 함수 모음. 첫 export: `pageNumberItems(current, total, siblings)` / `PAGE_ELLIPSIS` / `PageNumberItem` 타입. tsup 빌드 시 `"use client"` directive를 *붙이지 않음* (token/tailwind 와 같은 패턴). RSC 페이지에서 import해도 client boundary가 끌려오지 않음. 추가 조건: React / Radix / Tailwind 의존 없는 순수 함수만.
- **`<PaginationFooter>` anchor mode** — 신규 prop `buildHref: (page) => string` + 선택 `linkAs: ElementType`. 설정 시 페이지 버튼이 `<a href>` 또는 `<linkAs href>` 로 렌더. controlled 모드 (`onPageChange`) 와 anchor 모드 (`buildHref`) 가 *동시 사용 가능* — anchor가 navigation 담당, `onPageChange` 가 prefetch / 옵티미스틱 / 스크롤 동작 책임. **Server Component 직접 호출은 불가** (함수/컴포넌트 prop 직렬화 못 함) — client island 안에서 사용하거나 utils 기반 raw `<Link>` 조립 패턴 사용.
- **`<PaginationPrev>` / `<PaginationNext>` asChild 빌드 즉사 fix** — rc.7 까지는 `[ChevronIcon, children]` 을 두 sibling으로 spread 해서 `asChild={true}` 일 때 Radix Slot 의 `React.Children.only` 폭사. **Radix `Slottable` 패턴 + 신규 `icon` prop** 으로 해결: chevron은 sibling, children은 Slottable로 단일 merge target. `icon={null}` 로 chevron 제거 가능.
- **`<TableSearchInput>` 자동 controlled/uncontrolled 감지** — 기존 required였던 `value` + `onValueChange` 가 선택으로 (`value` 없으면 uncontrolled 모드). 신규 `defaultValue` + `name` prop forward — `<form action><TableSearchInput name="q" defaultValue={q} /></form>` 으로 RSC native form submit 패턴 지원. clear 버튼은 uncontrolled 모드에서도 작동 (native input value를 imperatively reset).
- **`<TableToolbar searchProps>` 주입 경로** — 객체 prop으로 TableSearchInput의 `name` / `defaultValue` / 선택 `onValueChange` 를 흘림. controlled (`search` + `onSearchChange`) 와 uncontrolled (`searchProps`) 둘 중 하나 선택.
- **`<TabsTrigger asChild>` JSDoc + URL-routed tabs 패턴 명시** — Radix `asChild` 가 이미 forward 되어 있어서 코드 변경 없이 `<TabsTrigger asChild><Link href="?tab=docs">문서</Link></TabsTrigger>` 가 작동. server가 `tab` searchParam을 읽어 `<Tabs value={tab}>` controlled mode에 흘리는 패턴이 권장 — JSDoc 예시 추가.

### 디자인 결정 — discriminated union 강제

- **`PaginationFooterProps` 타입을 union으로 재구성** (Codex P2 catch) — `controlled` (onPageChange required) | `anchor` (buildHref required). 둘 다 없으면 *컴파일 에러*. rc.7 까지는 inert 버튼이 렌더되는 footgun 이 있었음. `@ts-expect-error` 가 정확히 트리거되는지 type-level 테스트 추가.

### docs

- **`docs/for-consumers/migration/rsc-patterns.md` 신규** — RSC 컨슈머용 사용 가이드. utils / PaginationFooter (client island vs utils raw Link 두 패턴) / PaginationPrev-Next asChild / TableSearchInput uncontrolled / TableToolbar searchProps / Tabs URL-routed 패턴 각각 코드 예시 + 안티 패턴 (Server Component에서 함수 prop 직접 호출 등) + 마이그레이션 체크리스트.

### 검증

- `pnpm verify` **14/14 ✓**
- `@polaris/ui` tests: **279/279** (+12 — Pagination buildHref anchor mode 5 / asChild + icon 4 / TableSearchInput uncontrolled 6 / TableToolbar searchProps 3 / 회귀)
- `dist/utils/index.{js,cjs}` 에 `"use client"` directive **0건** — server-safe 확인

### 컨슈머 영향 한 줄

기존 client SPA: **코드 변경 0** (controlled API 그대로). RSC 컨슈머: **6개 컴포넌트의 새 RSC 모드 + 1개 utils subpath** 로 페이지네이션 / 검색 / 필터 / 탭 friction이 한 사이클에 해소.

---

## [0.8.0-rc.7] — 2026-05-10

실전 컨슈머 마이그레이션 리뷰에서 발견된 P1 2건 + P3 1건 fix. **rc.6 대비 BREAKING 변경 없음** — codemod의 동작 모델이 "best effort + caveat"에서 "**conflict 감지 시 fail-loud**"로 전환된 게 가장 큰 의미 있는 변화. silent rewrite로 빌드 깨뜨리는 케이스 두 건이 명시적 abort + 사용자 안내로 바뀜.

### P1 — codemod conflict detection (silent semantic bug → fail-loud)

- **`detectNamespaceConflicts` 신규 — rewrite destination namespace가 로컬 식별자를 silent하게 shadowing하던 케이스 차단** — rc.5의 `normalizePolarisImports` 안전망이 false positive를 막으려고 추가된 거였는데, 실제 rewrite가 일어나는 파일에서도 import 추가만 skip하니까 rewrite는 그대로 적용되어 결과가 *로컬*에 binding되는 silent bug 발생 (예: `surface.border` → `line.neutral`, 파일에 `const line = { … }` 있으면 빌드 통과하면서 잘못된 값 가리킴 — 컨슈머가 진짜 마이그레이션하다 빌드 통과 + 시각 회귀로 발견). transform-level에서 사전 감지하는 방식으로 재설계: rewrite가 도입할 destination namespace가 로컬 `const|let|var|function|class` 와 충돌하거나, `import { ai as aiToken }` 같은 alias된 polaris import로 destination binding이 점유된 경우, 또는 `<HStack as Row>` 같은 alias된 stack import (JSX 태그 rewrite가 안 잡는 케이스)가 있으면 **그 파일에 어떤 변경도 가하지 않고** stderr에 명시적 안내 + exit code 1. 사용자에게 manual resolution 요청.
- **`parseImportBody` 가 alias를 인식하지 못하던 dedupe 버그 fix** — `import { Stack, HStack as Row }` 의 두 entry를 specifier `Stack`만 보고 dedupe해서 `Stack as Row` 가 통째로 사라지던 결함. binding 필드 (`Row`) 별도 추출 + dedupe를 binding 기준으로. 이제 `Stack` (binding=Stack) 과 `Stack as Row` (binding=Row) 는 둘 다 보존. (이 결함은 `import { brand, ai as aiToken }` 같은 token alias 케이스에도 같은 family — destination conflict로 abort되는 path와 함께 안전망이 됨.)
- **rc.5 안전망 제거** — `normalizePolarisImports` 안에 있던 "로컬 변수가 namespace 이름과 같으면 import 추가 skip" 로직이 silent bug의 직접 원인이라 transform-level conflict gate로 대체. 안전망 자체가 위험하던 케이스.

### P3 — 마이그레이션 가이드

- `docs/for-consumers/migration/v0.7-to-v0.8.md` 의 "HStack/VStack import에 이미 Stack이 있으면 중복 식별자 결과 수동 정리" caveat — rc.6 dedupe 도입으로 해소된 부분. line-through로 표시 + 새 conflict abort 동작 안내 추가. "Conflict abort — 무엇을 보고 어떻게 풀까" 섹션 신규 (3 kind 각각의 해결 패턴).

### 검증

- `pnpm verify` **14/14 ✓**
- `polaris-codemod-v08` **29 → 33/33** (+4 — local conflict abort / aliased polaris-import abort / aliased H/VStack abort / alias dedupe preserve)

### 동작 변경 요약 (소비자 영향)

| rc.6 이전 | rc.7 이후 |
|---|---|
| 로컬 `const line` + `surface.border` rewrite → 빌드 통과 + 잘못된 값 binding (silent bug) | 사전 감지 → 파일 untouched + stderr 안내 + exit 1 |
| `import { ai as aiToken }` + `brand.secondary` rewrite → 빌드 깨짐 | 사전 감지 → 파일 untouched + stderr 안내 |
| `import { HStack as Row }` + `<Row>` JSX → `direction="row"` 누락 (시각 회귀) | 사전 감지 → 파일 untouched + stderr 안내 |
| `import { Stack, HStack as Row }` dedupe → `Stack as Row` 사라짐 | binding 기준 dedupe → 둘 다 보존 |

> **CI 통합 시**: `polaris-codemod-v08 --check` 가 conflict가 있으면 exit 1 반환. PR이 conflict 파일을 포함하면 자동 차단되도록 워크플로우에 추가 권장.

---

## [0.8.0-rc.6] — 2026-05-10

Codex 후속 리뷰 P1 2건 fix + P2 1건. **rc.5 대비 BREAKING 변경 없음** — codemod의 import dedupe 누락과 multi-line body corruption 두 결함이 같은 함수에서 발견됨, 같은 사이클에 함께 수정. 추가로 v0.7.7에서 `TableCell.nowrap`만 추가됐던 API 비대칭이 v0.8까지 남아 있던 부분 정리.

### P1 — release-gate (consumer build breakers)

- **codemod-v08가 `<HStack>` / `<VStack>` → `<Stack>` rewrite 후 import dedupe를 안 하던 버그 fix** — JSX_RENAMES의 `HStack` / `VStack` 식별자 치환은 import 라인 안의 단순 글자 교체라, 파일이 이미 `Stack`을 import하고 있으면 결과가 `import { Stack, Stack, Stack } from '@polaris/ui'`로 나옴 → "Identifier 'Stack' has already been declared" 빌드 즉사. 새 `dedupePolarisImports` post-pass 추가 — 모든 polaris import 라인 안에서 식별자 중복 제거. 멀티라인 body는 멀티라인 그대로 유지.
- **`normalizePolarisImports`가 multi-line import body를 single-line으로 squash하던 corruption fix** — 이전 구현은 `body.trim()` 후 missing namespace를 끝에 jam해서 `{\n  Badge,\n  TableSkeleton,\n  VStack,\n}` 같은 멀티라인 body가 `{ ..., Stack, state }` 처럼 한 줄로 망가지면서 `state`가 어디서 왔는지 알 수 없는 jam 상태가 됨 (Codex가 collection-builder.tsx에서 발견). 새 `parseImportBody` / `rebuildImportBody` 헬퍼로 body를 토큰 단위로 파싱 → 추가 → 멀티라인이었으면 한 줄에 한 entry, single-line이었으면 한 줄로 재조립. trailing comma 정확히 보존.
- 두 fix 합쳐 codemod tests **27 → 29** (+2: dedupe 회귀 / multi-line 보존 회귀). 한 가지 기존 test (`mixed-import` 의 `{ label, label }` duplicate caveat) 는 dedupe 도입으로 자연 해소 — assertion을 "single entry + dedupe 적용" 으로 갱신.

### P2 — API 대칭 갭 (TableCell.nowrap ↔ TableHead.nowrap)

- **`<TableHead nowrap>` prop 추가** — v0.7.7에서 `<TableCell>`에 `nowrap`을 추가하면서 `<TableHead>`는 누락됐음. 단일 라인 컬럼 (날짜 / 금액 / ID) 의 `<th>` 가 narrow viewport에서 그대로 wrap되거나 `className="whitespace-nowrap"` 직접 추가 패턴이 남아 있던 부분. `sortable` 모드에서도 작동 (chevron + 라벨이 한 줄로 inline 유지). 회귀 테스트 2건 추가.

### 검증

- `pnpm verify` **14/14 ✓**
- `polaris-codemod-v08` **27 → 29/29** (+2 회귀 + 1 기존 테스트 단순화)
- `@polaris/ui` test 추가 (TableHead nowrap 2건) — 기존 본문 통과 그대로

### 알려진 caveat (rc.6 정리)

- 이전 rc 들에서 우려하던 "consumer가 codemod 돌리면 `import { Stack, Stack, Stack }` 결과 나올 수 있음" 케이스 dedupe로 자연 해소. 마이그레이션 가이드의 "TypeScript가 잡으니 한 줄에 합치세요" 같은 caveat 한 줄도 제거 가능 (수동 후처리 필요 없음).

---

## [0.8.0-rc.5] — 2026-05-10

Codex 후속 리뷰 P1 1건 fix. **rc.4 대비 BREAKING 변경 없음** — codemod의 import 자동 추가 로직이 idempotency를 깨뜨리던 케이스를 두 단계 안전망으로 막음.

### P1 — release-gate (codemod idempotency)

- **`normalizePolarisImports`가 마이그레이션 대상이 아닌 파일에도 import를 추가하던 버그 fix** — rc.4에서 `NAMESPACES_TO_CHECK`를 `layer/line/background/fill/radius`까지 확장하면서 false positive 표면적이 넓어졌고, Codex가 재현 케이스를 잡아냄: 사용자 코드에 `const line = { normal: 1 }; line.normal` 같은 로컬 객체가 있고 v0.7 alias는 전혀 안 쓰는 파일에도 codemod가 `import { Button, line } from '@polaris/ui'`를 주입해서 duplicate-declaration으로 빌드를 깨뜨림.
- **두 단계 안전망 도입**:
  1. **rewrite gate** — `transform()`에서 이전 rewrite (TS_TOKEN_RENAMES / TAILWIND_RENAMES / CSS_VAR_RENAMES / JSX_RENAMES) 가 실제로 변경을 만든 경우에만 `normalizePolarisImports`를 호출. 마이그레이션 대상이 아닌 파일은 post-pass에 도달하지 않음. 이게 본질적인 fix이고 idempotency도 자연 보장 (이미 v0.8 코드는 rewrite 안 일어나니까 normalize도 skip).
  2. **local declaration check** — 그래도 통과한 파일에서 `const | let | var | function | class <ns>` 로컬 선언이 있는 namespace는 import 추가 skip. rewrite는 다른 곳에서 일어났는데 우연히 같은 이름의 로컬이 있는 엣지 케이스 보호.
- **2 신규 회귀 테스트** + **1 기존 테스트 fixture 정정** (`synthesizes a fresh value import …` 테스트 fixture가 실제로는 rewrite를 트리거하지 않는 모양이라 새 gate 통과 못 했음 — `text.primary` 트리거 사용으로 수정해서 진짜 synthesize 케이스 재현). codemod tests **25 → 27**.

### 검증

- `pnpm verify` **14/14 ✓**
- `polaris-codemod-v08` **27/27** (+2 안전망 회귀 테스트)
- 기존 22~25개 테스트 모두 그대로 통과 (rewrite gate가 정당한 케이스를 막진 않음)

### 알려진 caveat (rc.5에서 정리)

- 이전 rc 들에서 마이그레이션 가이드에 적혀 있던 "regex 기반 false positive — 로컬 변수가 v0.8 namespace 이름과 같으면 import 잘못 추가될 수 있음" caveat은 두 단계 안전망 도입으로 **사실상 해소**. 이론적으로 여전히 가능한 false-positive 시나리오는: (a) 파일이 v0.7→v0.8 rewrite를 받는 *동시에* (b) destination namespace 이름과 같은 로컬을 destructuring (`const { line } = obj`) 으로 도입한 경우 — 이건 regex로 잡기 어렵고 빈도가 매우 낮아 caveat으로 남김.

---

## [0.8.0-rc.4] — 2026-05-10

Codex 후속 리뷰 3건 + e2e visual baseline 사인오프 흡수. **rc.3 대비 BREAKING 변경 없음** — codemod의 또 한 가지 import 누락 케이스(P1) + lint 메시지 / migration doc snippet의 잔여 v0.8 제거 alias 예시 정리.

### P1 — release-gate (consumer build breaker)

- **codemod-v08가 surface.* member-access rewrite 후 destination namespace import를 추가하지 않던 버그 fix** — rc.2에서 도입한 `normalizePolarisImports` 의 `NAMESPACES_TO_CHECK` 가 `ai/accentBrand/state/label` (brand-family destinations) 만 검사했는데, `surface.raised` → `layer.surface` / `surface.border` → `line.neutral` / `surface.canvas` → `background.base` 가 배출하는 `layer/line/background/fill` namespace는 누락. 결과: `import { surface } …` 만 남고 `layer is not defined` 빌드 깨짐. **검사 대상에 `layer / line / fill / background / radius` 추가** — TS_TOKEN_RENAMES의 모든 destination namespace 커버. 회귀 fixture 1건 추가.
- **`background.normal` / `background.alternative` / `radius.full` TS member-access rewrite 추가** — Tailwind 클래스 (`bg-background-normal` 등)와 CSS variable은 v0.8부터 잡고 있었지만 TS 토큰 형태(`background.normal`, `radius.full`)는 누락되어 있었음. 이제 한 번에 한 종 변환. fixture 2건.
- 합쳐서 codemod tests 22 → **25**.

### P2 — lint 메시지 cleanup

- **`@polaris/no-arbitrary-tailwind` / `@polaris/no-hardcoded-color` 룰 메시지에 v0.8 제거 alias 예시가 남아 있던 부분 fix** — 룰이 위반을 잡고 출력한 메시지에 "예: `bg-brand-primary`, `text-fg-primary`, `var(--polaris-brand-primary)` 같은 spec 토큰을 쓰세요" 라고 안내하던 부분. 룰 자체는 정확히 동작하지만 메시지를 그대로 따라가면 dead-class / dead-var로 다시 들어갈 위험. v0.8 spec 이름 (`bg-accent-brand-normal`, `text-label-normal`, `var(--polaris-accent-brand-normal)`) 으로 교체.

### P3 — docs snippet

- **`docs/for-contributors/architecture/tailwind-v4.md` 의 v4 theme snippet** 이 v0.8 제거 alias (`--color-brand-primary`, `--color-status-success`) 를 예시로 보여주던 부분 fix. 본문은 rc.1에서 이미 갱신됐는데 snippet만 남아 있던 것. v0.8 spec (`--color-accent-brand-normal`, `--color-state-success`, `--color-label-normal`, `--color-layer-surface`) 로 교체 + 전체 매핑은 `packages/ui/src/styles/v4-theme.css` 참조하라는 포인터.

### e2e visual baseline 사인오프 (rc.3 → rc.4 사이 main에 별도 commit)

rc.3 + Tokens 데모 재정리 시점으로 baseline 12장 갱신 (6 페이지 × desktop + mobile, ribbon tab 16장은 변경 없음). 사용자 사인오프 받음. `pnpm test:e2e` **30/30 ✓**. 정식 v0.8.0 태그 게이트의 "디자인팀 검토 후 baseline 사인오프" 항목이 닫힘.

### 검증

- `pnpm verify` **14/14 ✓**
- `pnpm test:e2e` **30/30 ✓**
- `polaris-codemod-v08` **25/25** (+3 — surface→layer/line/background import normalize / background.* / radius.full)
- `@polaris/lint` 104 (변동 없음 — 메시지 텍스트 변경만)

---

## [0.8.0-rc.3] — 2026-05-10

Codex 추가 후속 리뷰 3건 반영. **rc.2 대비 BREAKING 변경 없음** — codemod의 type-import 처리 버그(consumer typecheck 깨짐)와 잔여 "alias 작동" 안내 문서 정리. e2e visual baseline 12건은 의도된 demo content 추가 + v0.8 토큰 미세 shift로 확인되어 사용자 사인오프 후 별도 PR로 baseline 갱신 예정.

### P1 — release-gate

- **codemod-v08 normalizePolarisImports가 `import type`에 값 namespace를 추가하던 버그 fix** — rc.2에서 추가한 import 자동 normalize 로직이 첫 번째 polaris import 라인을 무조건 매칭해서, 그 라인이 `import type { … }` 면 결과가 `import type { ButtonProps, ai } …` 가 되어 consumer typecheck 깨짐 (TS2693: "ai only refers to a type, but is being used as a value"). type-only / value import 명시 분리 — value import 가 있으면 거기에만 추가, 없으면 동일 subpath로 새 `import { … } from '@polaris/ui[/tokens]'` 라인을 합성. **2 신규 테스트** (type-only + value 혼합 / type-only 단독).

### P2

- **잔여 "alias 아직 작동" / "v0.8에서 제거 예정" 안내 정리** — root `AGENTS.md` (file-icon alias / typography legacy alias 안내), `packages/template-next/DESIGN.md` (예시 yaml의 `text-on-brand` / `rounded.full` 토큰 이름), `apps/demo/src/pages/Tokens.tsx` (legacy alias section description), `docs/for-contributors/architecture/tailwind-v4.md` (v3↔v4 동일 클래스명 안내에서 `bg-brand-primary` 같은 v0.8-제거 alias가 v4에서도 그대로 작동한다고 잘못 안내) 모두 v0.8 spec 명명 + "제거됨" 사실관계로 갱신.
- **e2e visual baseline 12건 enumerate** — 6 페이지(home / components-catalog / tokens / assets / nova-workspace / crm-contract) × 2 viewport(desktop / mobile). Diff 분석 결과: 페이지 높이가 ~10px 늘어나고 (4% 픽셀 diff), 사이드바에 새 데모 페이지 항목이 추가됨. **v0.8 토큰 변경에 의한 시각 회귀가 아니라 demo가 자라면서 추가된 content** + v0.8 토큰 분할에 따른 미세 spacing 조정. 디자인팀 / 사용자 사인오프 후 `pnpm test:e2e:update` 로 baseline 갱신 후 별도 commit. `pnpm verify` 14단계는 e2e를 포함하지 않으므로 release-gate에 영향 없음.

### 검증

- `pnpm verify` **14/14 ✓**
- `@polaris/lint`: 104 (no-deprecated-polaris-token, 변동 없음)
- `polaris-codemod-v08`: 20 → **22** (+2 — type-import 처리 / type-only 단독 케이스)

### 알려진 caveat (rc.3에서도 유지)

- e2e visual snapshot 12 page baseline drift는 의도된 demo 성장 + v0.8 토큰 미세 shift로 확인됨. 정식 v0.8.0 태그 전에 사용자 사인오프 → `pnpm test:e2e:update` → baseline commit 필요. ribbon tab 테스트는 모두 통과 중.
- `normalizePolarisImports`는 regex 기반이라 (a) 로컬 변수가 v0.8 namespace 이름과 같은 경우 false positive, (b) 둘 이상의 namespace를 추가하는 동시에 type/value 분리가 둘 다 필요한 케이스에서 새 import가 한 줄로 합쳐서 생성됨. 모두 마이그레이션 가이드에 caveat 추가됨.

---

## [0.8.0-rc.2] — 2026-05-10

Codex 리뷰 후속 5건 (P1 2 / P2 3) 반영. **rc.1 대비 BREAKING 변경 없음** — 모두 rc.0/rc.1이 놓친 미진 부분 + agent-facing 문서 정합성. 진행 중인 마이그레이션은 그대로 ok, codemod-v08을 한 번 더 돌리면 새로 추가된 import normalization도 포함해 처리됩니다.

### P1 — 정식 v0.8.0 게이트 항목

- **codemod-v08가 `brand.secondary*` 케이스에서 import를 깨뜨리던 버그 fix** — TS 멤버 access가 `ai.normal` / `ai.strong`으로 rewrite되는데 import 라인은 `accentBrand`만 추가해서 `import { accentBrand } …; const x = ai.normal;` 같은 build-broken 결과가 나왔음. **`normalizePolarisImports` post-pass 추가** — TS/JSX 파일 rewrite 마지막에 file body의 실제 namespace 사용 (`\bai\.<ident>` / `\baccentBrand\.<ident>` / `\bstate\.<ident>` / `\blabel\.<ident>`)을 스캔해 누락된 namespace를 첫 `@polaris/ui[/tokens]` import에 자동 추가. 멱등 (두 번 돌려도 no-op). `state.` 같은 흔한 단어는 prose/JSDoc 오탐 방지를 위해 dot 뒤 identifier 글자 필수 (예: `navigation state.` 같은 문장은 매칭 안 됨). **3 신규 테스트** (brand.secondary 회귀 / 멱등성 / non-polaris 파일 무시).
- **agent-facing 문서가 v0.8 따라오지 못해 에이전트가 다시 deprecated API 작성하던 문제 fix** — root `AGENTS.md`, `packages/template-next/AGENTS.md`, `packages/plugin/scripts/post-edit-lint.mjs` (PostToolUse 훅 메시지), `packages/plugin/commands/polaris-component.md`, `packages/plugin/commands/polaris-check.md` 모두 v0.7 alias 안내 + `polaris-codemod-v07` 추천 → **v0.8 명명 + `polaris-codemod-v08` 안내** + JSX prop / HStack-VStack 변경 명시. 에이전트가 violation 만났을 때 가장 먼저 보는 메시지가 v0.7을 안내하던 게 잡혔음.

### P2

- **`@polaris/no-deprecated-polaris-token` 룰의 색상-only gap fix** — typography legacy (`text-polaris-{display-lg,display-md,heading-lg,heading-md,heading-sm,h1..h5,body,body-lg,body-sm,meta,tiny,caption}`), radius (`rounded-polaris-full`), color ramp 단계 `5` (`bg-blue-5` 등 11 family) 제거 alias가 룰에서 잡히지 않던 문제. 별도 regex 2개 추가 (`FULL_CLASS_DEPRECATED_REGEX` + `RAMP_BARE_5_REGEX`)로 codemod와 동일 set 커버. negative-lookahead로 `text-polaris-body1` / `bg-blue-50` 같은 spec 이름은 보호. **5 신규 lint 테스트** (typography 3 + radius 1 + ramp 1).
- **DatePicker `required` jsdoc 정정** — 이전 jsdoc에 "shows up in serialized form payloads / `formData.get('expiry')?.required`" 라고 적혀 있었는데 사실관계 오류. `<input type="hidden">`은 HTML spec상 (a) constraint validation 대상이 아니고 (b) `FormData.get(name)`은 *값 문자열만* 반환 (속성 메타데이터 없음). 실제로는 DOM attribute round-trip 외엔 효과 없음을 명시 + 실제 required 검증은 schema (zod / RHF) + Server Action guard 사용 권장. prop 자체는 native `<input>` API 대칭성을 위해 유지.
- **`packages/ui/README.md` + `docs/archive/recipes.md` + `docs/for-contributors/architecture/nextjs-app-router.md` 코드 샘플 v0.8로** — Input.hint → helperText, DateTimeInput.hint → helperText, Dialog 취소 Button.variant="outline" → "tertiary", theme-toggle Button.variant="outline" → "tertiary".

### 검증

- `pnpm verify` **14/14 ✓**
- `@polaris/lint`: 99 → **104** (+5 — typography/radius/ramp lint cases)
- `polaris-codemod-v08`: 17 → **20** (+3 — brand.secondary 회귀 / 멱등 / non-polaris 무시)
- `@polaris/ui`: 변동 없음

### 알려진 caveat (rc.2에서도 유지)

- e2e visual snapshot 12 page baseline drift는 의도된 v0.8 시각 변경 (surface-* 토큰 분할에 따른 미세 톤 변화 등)일 가능성이 높아 **별도 PR로 분리** — 디자인팀 검토 후 `--update-snapshots` 갱신 + baseline 커밋. ribbon locator는 rc.1에서 fix되어 ribbon tab 테스트는 통과하지만 page-level snapshot은 의도 검증 전엔 잠가두지 않음.
- `normalizePolarisImports`는 regex 기반이라 local 변수가 v0.8 namespace 이름과 같은 (`const ai = …`) 드문 케이스에서 false positive로 import를 추가할 수 있음. namespace 이름이 흔치 않아 실전에서 거의 발생하지 않지만 마이그레이션 가이드 caveat에 추가됨.

---

## [0.8.0-rc.1] — 2026-05-10

Codex 리뷰 8건 반영. **rc.0 대비 BREAKING 변경 없음** — 모두 rc.0이 놓친 케이스 보강 / 잔존 dead-class 제거 / 문서 정합성. rc.0에서 진행 중인 마이그레이션은 그대로 ok, codemod-v08 한 번 더 돌리면 새로 추가된 surface-border bg/divide / token import 케이스도 잡힙니다.

### P1 — 정식 v0.8.0 게이트 막아야 하는 항목

- **`@polaris/ui` 소스에 `surface-border*` dead-class 5건** (Table / DropdownMenu / Select / Command 구분선 + Switch unchecked track) — v0.8 빌드에서 emit 안 되는 alias 그대로 남아 있어 visual silently broken. `bg-line-neutral` / `divide-line-neutral` / `bg-line-normal`로 수정.
- **v3 Tailwind preset의 `accent-brand-normal-subtle`이 잘못된 CSS var 매핑** — 토큰/CSS/v4 theme는 `--polaris-accent-brand-normal-subtle` (E8F2FE)인데 v3 preset만 `--polaris-accent-brand-bg` (D9EAFF, 더 강한 톤)을 가리켜 v3↔v4 빌드가 다른 hover 강도를 렌더했음. 이제 양쪽 일치 + 회귀 방지용 vitest 4건 추가 (preset.test.ts).
- **codemod-v08가 `@polaris/ui/tokens` named import 미처리** — 권장 import 경로가 `@polaris/ui/tokens`인데 codemod는 root barrel만 매칭. 함수 기반 rewrite로 교체해 `@polaris/ui` + `@polaris/ui/tokens` 모두 + 혼합 import (`{ text, label }`) 까지 처리. `brand` 케이스만 caveat: `accentBrand`로 rename되며, `brand.secondary`를 쓴 코드는 member-access rewrite로 `ai.*`가 등장 → TypeScript가 missing import 즉시 잡음 (수동으로 `, ai` 추가).

### P2 — rc.1에 한 번에 흡수

- **codemod-v08 `surface-border` 변환을 전 utility prefix로 확장** — `bg-`, `divide-`, `ring-`, `outline-`, `fill-`, `stroke-`, `caret-`, `accent-`, `placeholder-`, `from-/via-/to-` 모두 커버. rc.0에선 `border-` prefix만 잡고 있었음. ui 소스 5건도 사실 이 누락 때문에 발생.
- **DatePicker `required` jsdoc 정확히 + `disabled` mirror** — hidden input은 HTML spec상 constraint validation 대상이 아니므로 native form validation 안 됨을 명시. `disabled` 값을 hidden input에도 mirror해 disabled 필드가 submit payload에 stale 값을 남기지 않도록. 회귀 테스트 1건 추가.
- **`packages/template-next/DESIGN.md` v0.8 명명으로 갱신** — AGENTS 지침상 에이전트가 반드시 읽는 spec인데 `surface-canvas`/`text-primary`/`heading-lg`/`rounded.full` 등 v0.7 alias가 그대로 남아 있어 새 프로젝트가 dead alias로 시작할 위험. v0.8 토큰 이름 + state.error / Badge tone 명명까지 정리.
- **e2e Ribbon locator stale fix** — `<Ribbon>` root에 `data-polaris-ribbon` 속성 추가, `visual.spec.ts`가 `[data-polaris-ribbon]` 으로 잡도록 변경. 이전엔 `bg-background-normal` (v0.8에서 emit 사라진 alias)에 묶여 timeout. snapshot baseline 갱신은 별도 작업으로 분리 (locator stale ≠ 의도된 visual diff).

### P3 — 공개 문서

- **`packages/ui/README.md`** — 토큰 import 예시 v0.8 namespace로 (`accentBrand` / `label` / `state` 등) + Stat 예시 `deltaTone` → `deltaVariant` + Surface elevation 표 v0.8 명명 (background-base / fill-neutral / layer-surface) + alias 안내 codemod 링크를 v08로
- **`docs/archive/recipes.md`** — Form 예시 코드 `VStack` → `Stack`, KPI 예시 `<HStack>` / `<VStack>` / `text-polaris-display-md` / `text-fg-muted` / `Badge variant=danger` → v0.8 이름들로. UserMenu 예시 `rounded-polaris-full` → `-pill`, `text-polaris-caption text-fg-muted` → `text-polaris-caption1 text-label-alternative`
- **`docs/for-contributors/architecture/app-shell-layout.md`** — `bg-surface-canvas text-fg-primary` → `bg-background-base text-label-normal`

### Verify gate 강화 (Codex 권고)

`pnpm verify`에 step 6 신규 추가: `polaris-codemod-v08 --check packages/ui/src/components packages/ui/src/ribbon` — `@polaris/ui` 자체 소스에 dead alias가 들어와도 release 전에 0.1초만에 차단. rc.0에서 발견된 `surface-border*` 잔존 같은 케이스가 자동으로 잡힘. 13/13 → **14/14**.

### 테스트 / 검증

- `@polaris/ui`: vitest **+5** (Tailwind preset 4 + DatePicker disabled mirror 1)
- `@polaris/lint`: 99 → **그대로 99** (rule cases) + codemod 15 → **17/17** (+2: surface-border 전 prefix / token import 혼합)
- `pnpm verify` **14/14 ✓** (60s)

### 알려진 caveat (rc.1에서도 유지)

- v4-theme.css는 컬러 ramp primitive (`bg-blue-50`, `bg-gray-30`)를 `--color-*`로 노출하지 않음 — v3 preset과 v4 builds 사이에 의도된 scope 차이. Codex가 캐치한 `accent-brand-normal-subtle` 드리프트는 fix됐지만 ramp 단계는 v0.9 별도 작업으로 분리 (semantic-token이 아니라 primitive라 컨슈머가 직접 쓰는 빈도가 낮음).
- e2e visual baseline은 의도된 v0.8 visual diff (예: surface-* 토큰값 미세 변화) 가 있을 수 있어 `--update-snapshots` 갱신은 디자인팀 검토 후 별도 PR로 진행.

**v0.8.0의 주제는 "쌓아둔 alias / 미세 비일관성을 한 번에 정리"** 입니다. 디자인팀 컨펌이 필요한 항목은 기본값으로 적용해 두었고, 추후 컨펌이 들어오면 그대로 유지하거나 토큰 수치만 조정합니다. 사내 컨슈머가 아직 소수일 때 구조적 변경을 끝내기 위한 BREAKING 정리 릴리스. 모든 변경은 **하나의 codemod (`polaris-codemod-v08`)로 자동 변환**됩니다.

> ⚠ **rc.0** — pre-release. Codex 리뷰 + 사내 파일럿 통과 후 정식 v0.8.0 태그를 찍습니다.

### 마이그레이션 한 줄

```bash
pnpm up @polaris/ui @polaris/lint @polaris/plugin --latest
pnpm dlx @polaris/lint polaris-codemod-v08 --apply src
pnpm build && pnpm lint
```

자세히 → [`docs/for-consumers/migration/v0.7-to-v0.8.md`](docs/for-consumers/migration/v0.7-to-v0.8.md).

### 1. Alias 청소 (Tailwind 빌드 emit 제거)

v0.7 동안 `--all-aliases` 모드로 emit해 온 v0.6/rc.0/rc.1 alias를 모두 떼어냅니다. **Tailwind 클래스 / CSS 변수가 사라지므로 codemod 적용 안 한 코드는 dead-utility**가 됩니다.

| 제거됨 | v0.8 사용 토큰 |
|---|---|
| `text-fg-primary/-secondary/-muted/-on-brand` | `text-label-normal/-neutral/-alternative/-inverse` |
| `bg-surface-canvas/-raised/-sunken/-border/-borderStrong` | `bg-background-base` / `bg-layer-surface` / `bg-fill-neutral` / `border-line-{neutral,normal}` |
| `bg-brand-primary/-secondary` (+ `-hover/-subtle`) | `bg-accent-brand-{normal,strong,bg,bgHover}` / `bg-ai-{normal,strong,hover}` |
| `bg-primary-{normal,strong}` (rc.0 alias) | `bg-accent-brand-{normal,strong}` |
| `bg-status-{success,warning,danger,info}` (+ `-hover`) | `bg-state-{success,warning,error,info}` (`danger` → `error`, hover 흡수) |
| `bg-background-{normal,alternative}` | `bg-background-base` / `bg-fill-neutral` |
| `text-polaris-{display-lg,display-md,heading-lg,heading-md,heading-sm,h1..h5,body,body-lg,body-sm,meta,tiny,caption}` | `text-polaris-{display,title,heading{1..4},body{1..3},caption{1,2}}` |
| `rounded-polaris-full` | `rounded-polaris-pill` |
| ramp step `5` (e.g. `bg-blue-5`) | `-05` (선행 0) — gray ramp는 10–90이라 영향 없음 |

`surface.popover` / `surface.modal` (v0.7.5 elevation tier)은 **유지** — 알 수 있는 alias가 아니라 정상 토큰입니다.

### 2. 컴포넌트 BREAKING — props / 식별자 정규화

| 이전 (v0.7) | 이후 (v0.8) |
|---|---|
| `<Button variant="outline">` | `<Button variant="tertiary">` |
| `<Input hint="…">` (+ Textarea/Switch/Checkbox/FileInput/FileDropZone/DateTimeInput/TimeInput) | `helperText="…"` (HTML spec 정렬, 폼 컴포넌트 전체 통일) |
| `<Progress tone="success">` | `<Progress variant="success">` |
| `<Stat deltaTone="positive">` | `<Stat deltaVariant="positive">` |
| `<HStack>` / `<VStack>` exports | `<Stack direction="row">` / `<Stack>` (column 기본) — 한 컴포넌트로 통합 |
| Button `ai` variant `focus-visible:outline-ai-normal` (separate ring) | 모든 Button variant 공통 `focus-visible:shadow-polaris-focus` (3px 시스템 포커스 링, light/dark 자동) |

`<HStack>`/`<VStack>` 식별자는 import에서도 사라집니다 — codemod가 `import { HStack, VStack } from '@polaris/ui'` 를 `import { Stack }`로 정리합니다.

### 3. 컴포넌트 enhancements (additive — 디자인팀 컨펌 후 변경 가능)

추천안 적용. 컨펌 후 토큰 수치만 미세 조정 가능, API 자체는 유지.

- **`Checkbox variant="ai"` (신규)** — AI 컨텍스트(예: "AI 추천 적용", "Polaris GPT-4 사용")용 NOVA Purple 체크박스. `<Button variant="ai">` / `<Badge tone="ai">` 와 시각 페어. 기본은 `default` (Brand Blue) 그대로.
- **`DialogFooter fullWidthButtons`** — `true` 시 직접 자식 `<button>`을 `flex-1`로 늘려 row 폭을 균등 분할. 모바일 narrow modal / drawer-style 시트에서 두 액션이 half-width 페어로 읽히게. 기본 동작은 v0.7과 동일 (오른쪽 정렬).
- **포커스 링 통일** — Button 외 Calendar / Drawer / Pagination / Ribbon 등도 `focus-visible:shadow-polaris-focus`로 일원화. 제각각 `outline-*` ring을 쓰던 미세 비일관성 제거.

### 4. 도구 — codemod / lint / 플러그인

- **`polaris-codemod-v08` (신규 bin)** — token + Tailwind + CSS 변수 + JSX prop / component 한 번에. v0.7 codemod와 동일 패턴 (regex 기반, idempotent, `--check` CI 모드, ignored dirs). 15 unit test로 검증 (token / typography / status / ramp / CSS var / button / hint / progress·stat / HStack·VStack / 멱등성 / `--check` exit code).
- **`@polaris/no-deprecated-polaris-token` 룰 확장** — v0.8에서 emit이 사라진 alias도 룰 메시지에 추가. `polaris-codemod-v08` 명령을 messageId에 직접 안내. 누군가 dead-utility를 새로 작성하면 즉시 차단.
- **플러그인 SKILL/명령 업데이트** — `polaris-web` SKILL의 "직접 만들지 말 것" 항목 6건 (HStack/Inline, Input.hint, Stat.deltaTone, Switch.hint) v0.8 prop 이름으로. `/polaris-migrate` 명령에 v0.7→v0.8 절차 추가.

### 5. 테스트 / 검증

- `@polaris/ui`: 254 → **(unchanged 본문 + Checkbox AI / DialogFooter fullWidthButtons / focus ring 회귀 케이스)** 모두 통과
- `@polaris/lint`: 94 → **99/99** (+5: no-deprecated-polaris-token v0.8 케이스 5)
- `polaris-codemod-v08` smoke test: 11 → **15/15** (+4: button-outline / hint→helperText / Progress·Stat / HStack·VStack)
- `pnpm verify` **13/13 ✓**
- 내부 self-apply: `apps/demo` + `packages/template-next` + `packages/ui/src/components/*.test.tsx` → 32 occurrences in 8 files 자동 변환

### 6. 알려진 caveat

- codemod의 JSX 패턴은 **opening-tag가 `>` 없이 한 줄에 들어와야** 정확히 매칭. 멀티라인 prop spread (속성값에 `>` 포함)은 수동 review 권장.
- HStack/VStack import에서 `Stack`이 이미 import 되어 있으면 codemod 결과가 중복 식별자를 만들 수 있음. TypeScript가 잡으니 한 번 빌드하면 즉시 발견 — `import { Stack, Stack }` 같은 라인이 있으면 합치세요.
- 디자인팀 컨펌 항목(Checkbox AI / DialogFooter fullWidthButtons / focus ring 통일)은 추천안 — 컨펌 후 토큰 수치만 조정될 수 있음 (API 변경 없음).

### Tracking (다음 minor 후보)

- v0.9 follow-up: 폼 chrome 시각 일관성 (Input 52px floating-inside vs DateTimeInput 52px label-above vs DatePicker button height). 디자인팀 합의 필요 — "같은 폼에서 swappable" 원칙 명문화.
- 로드맵: Storybook 또는 컴포넌트 matrix 페이지 (디스커버리 강화).

---

## [0.7.7] — 2026-05-10

컴포넌트 완성도/범용도 리뷰 결과 도출된 갭을 한 번에 메운 누적 patch + 코덱스 리뷰로 발견된 a11y/state-sync/관성 패턴 fix. **BREAKING 없음** — 모두 additive (props 추가 / 신규 컴포넌트) 또는 동작 fix. 컴포넌트 51 → **58개 family** (+7, NavbarItem 포함), 테스트 169 → **235/235 ✓** (+66). (0.7.6은 별도 release 없이 0.7.7로 점프.)

### `@polaris/ui` — API surface 채우기 (v0.7.6 분 — props 추가)

기존 13개 컴포넌트에 "거의 매번 직접 만들었던" 패턴을 props로 노출. 모두 optional.

- **Textarea** — `autoResize: boolean | { minRows, maxRows }` (scrollHeight 기반 + window resize 대응 + reduced-motion safe) + `showCount` (`current/maxLength` 카운터, 초과 시 state-error 색)
- **Input** — `prefix` / `suffix` ReactNode slot (통화·단위·검색 아이콘 어드론먼트, 패딩 자동 조정) + `clearable` × 버튼 (synthetic input 이벤트 dispatch — controlled 호환) + `onClear` 콜백
- **Switch** — `label` / `hint` / `error` (Checkbox 일관성). label-only / 폼 layout 전부 통일. error 시 `aria-invalid` + `role="alert"`
- **Skeleton** — `shape="rect|text|circle|bare"` preset + `lines={N}` (text 멀티 라인, last-line 70% width). `role="status"` + `aria-busy`
- **Alert** — `dismissible` × 버튼 + `action` slot (재시도 / 자세히 보기 등)
- **Badge** — `dismissible` × 버튼 + `icon` slot (12-14px leading icon for filter chip 패턴)
- **AvatarGroup (신규)** — 자식 Avatar overlap + max 초과 시 +N 인디케이터. `size` 자동 propagate
- **Stat** — `loading` (Skeleton placeholder, 타일 높이 stable)
- **Button** — `iconLeft` / `iconRight` slot (children 정렬 일관성, loading 시 자동 hidden) + `fullWidth`
- **Card** — `interactive` (cursor-pointer + hover shadow + focus-visible ring). asChild + Link/button과 함께 사용
- **DropdownMenuItem** — `icon` slot (DropdownMenuFormItem 일관성)
- **TableRow** — `selected` (`aria-selected` + brand 틴트) + `clickable` (cursor + focus ring)
- **Toaster** — `defaultDuration` prop (per-toast `duration` 미지정 시 fallback)

### `@polaris/ui` — 신규 컴포넌트 6종 (v0.7.7)

업무용 SaaS의 빈 자리:

- **`<Combobox>`** — Popover + cmdk 기반 searchable Select. single + `multiple` 모드. 옵션 group / description / disabled. 키보드 nav (↑↓/Enter/Esc) 자동. SelectTrigger 시각과 swap-호환
- **`<PageHeader>`** — title + description + breadcrumb + eyebrow + actions slot. `as="h1|h2"`, divider 옵션
- **`<SectionHeader>`** — h2 (default) / h3. PageHeader의 카드-외부 sibling
- **`<Tabs variant="underline">`** — TabsList variant 추가, context로 trigger에 자동 propagate. 기본 `pill`은 그대로 (in-card 세그먼트), `underline`은 page-nav용
- **`<Accordion>`** — Radix Accordion 기반. `type="single|multiple"`, `collapsible`. 그룹 disclosure (FAQ / 설정 그룹). Disclosure는 single-item 그대로 유지
- **`<CircularProgress>`** — SVG `stroke-dasharray` 라디얼. determinate / indeterminate, tone 5 + size 4. 인라인 / 카드 작은 영역 / 버튼 외부 async 표시. `prefers-reduced-motion` 자동

### `@polaris/ui` — Sidebar/Navbar 일관성

- **`<NavbarItem>` (신규, Navbar family)** — `active` / `asChild` / `icon` / `href` props. SidebarItem 패턴 그대로 미러링 (Navbar는 구조 컨테이너만 제공해서 컨슈머가 raw `<a>` + `bg-accent-brand-normal-subtle` className을 매번 직접 작성하던 문제 fix). 활성 매칭(exact vs prefix)은 컨슈머 라우터에 위임. `aria-current="page"` + brand 틴트 자동, `<TabsList variant="underline">`이 아니라 페이지 nav 자체용

### `@polaris/ui` — 코덱스 리뷰 9건 fix (additive, a11y/state 회복)

**P2 — Combobox interactive nesting 해소**
- 이전: trigger `<button role="combobox">` 안에 `<span role="button" tabIndex={-1}>` clear control이 nested. WAI-ARIA 위반(interactive-in-interactive), tabIndex={-1}라 키보드 접근 불가
- fix: clear button을 trigger의 SIBLING으로 이동 (wrapper `<div className="relative">`). 둘 다 진짜 button + 각자 tab 순서. propagation 격리되어 popover 안 열림

**P2 — Input hasValue / value=0 sync**
- 이전: `Boolean(value)` 사용으로 controlled value reset 시 동기화 안 되고, `value={0}`을 빈 값으로 잘못 처리 (숫자/금액 입력에서 0은 유효한데 floating label 안 뜨고 clear 안 보임)
- fix: `isPresent(v)` helper (`v !== null && v !== undefined && String(v).length > 0`). `useEffect`로 controlled value 변화 감지 → setHasValue 동기화

**P2 — Textarea uncontrolled showCount + over-limit**
- 이전: uncontrolled mode에서 입력 중 internal state 변경 없어 카운터 0/N에서 멈춤. controlled value가 maxLength 초과해도 색 변화 없음
- fix: `internalLen` state 도입 (handleChange에서 항상 갱신). controlled 시 value 우선, uncontrolled 시 internal. controlled value 변화 시 useEffect sync. over-limit 케이스 (value="abcd" + maxLength=3 → 4/3 + state-error 색)도 검증

**P2 — TableRow clickable 키보드 + descendant click 격리**
- 이전: clickable이 시각만 추가하고 keyboard 미제공 → 마우스 전용 회귀. onClick은 `{...props}` spread로 그대로 붙어 있어서 row 안 button/checkbox 클릭 시 row.onClick까지 발화 ("row 열기 + 행 액션 동시")
- fix:
  - `clickable && onClick`이면 `tabIndex={0}` + Enter/Space → onClick (keyboard activation)
  - onClick wrapping handler에서 `target → currentTarget` walk-up으로 interactive descendant 감지 (button/a/input/select/textarea/label/summary + role=button/link/checkbox/menuitem/menuitemcheckbox/menuitemradio/switch/tab/combobox). descendant 클릭 시 row.onClick suppressed

**P2 — Surface elevation 토큰 first-party overlay 적용**
- 이전: `surface.popover` / `surface.modal` 토큰을 v0.7.5에 추가했지만 컨슈머가 직접 안 쓰면 다크모드 elevation 효과 안 보임. DropdownMenu/Select/Popover 등이 `bg-background-normal` 사용 중
- fix: DropdownMenu / SelectContent / PopoverContent / Command → `bg-surface-popover`. Dialog / Drawer / CommandDialog → `bg-surface-modal`. light는 모두 #FFFFFF라 시각 동일, dark에서만 살짝 더 밝아짐 (의도된 depth 강화)

**P2 — FileDropZone multiple=false drop 경로 + consumer event compose**
- 이전 1: native picker는 `multiple={multiple}`로 single 강제하지만 drag&drop은 `e.dataTransfer.files`를 그대로 onFilesChange에 넘김 → 단일 첨부 필드에서도 다중 파일 통과
- 이전 2: divProps(consumer onClick/onDrag/onKeyDown 등)가 `{...divProps}` spread로 마지막에 와서 우리 picker 활성화 핸들러를 덮어씀
- fix: processFiles 진입 시 `multiple ? Array.from(list) : Array.from(list).slice(0, 1)`. consumer 핸들러 명시 destructure → 먼저 호출 → `defaultPrevented`로 우리 로직 opt-out 가능

**P2 — DateTimeInput JSDoc UTC shift 함정 제거**
- 이전: `date.toISOString().slice(0, 16)` 권장 코드가 UTC로 시프트해 Asia/Seoul 09:00이 00:00으로 표시되는 함정
- fix: `toLocalDatetime(d: Date)` helper 예시(`getFullYear/getMonth/.../padStart`)로 교체 + 9h shift 함정 명시 + UTC ↔ local 변환은 onSubmit 경계에서만 하라는 가이드

**P2 — Badge outline tone WCAG AA**
- 이전: `text-state-warning` 2.40:1 / `success` 2.66:1 / `error` 3.13:1 / `brand|info` 3.85:1 — 12px 텍스트 모두 AA fail
- fix: `state.{success|warning|error|info}Strong` 신규 토큰 4개 (light: ramp 70 / dark: ramp 30, ≥4.5:1). Badge outline의 state variant는 strong 사용. brand/secondary는 기존 `accent-brand-strong` / `ai-strong`. file-* outline은 border만 file color + text는 `label-normal`로 시프트

**P3 — Skeleton (+ TableSkeleton) motion-safe**
- 이전: JSDoc은 reduced-motion 자동 존중이라 했지만 plain `animate-pulse`. Tailwind v3 기본은 motion-safe 자동 X
- fix: `animate-pulse` → `motion-safe:animate-pulse` (Skeleton 2곳 + TableSkeleton 2곳). prefers-reduced-motion 사용자는 정적 블록 표시 (loading 의미는 유지)

### Demo 카탈로그 — 카테고리 탭 분리 + 51 → 45 섹션 통합

4번의 release cycle을 거치며 누적된 50+ 섹션이 정신없는 상태였음 (같은 컴포넌트 흩어짐: Badge #4 + #40, Pagination #22 + #41, Tabs #8 + #48, EmptyState #24 + #30. #45 "v0.7.6 API surface"는 10개 컴포넌트 props 추가를 한 섹션에 묶어둠).

**한 컴포넌트 = 한 섹션 원칙**으로 통합 + 카테고리 탭으로 분리:
- Tabs underline variant 사용한 sticky `<TabsList>` (foundation / forms / navigation / overlays / data / polaris 6개)
- `<Section cat="..." current={catTab}>` — 비매칭 시 unmount
- 카테고리 안 1부터 재번호 (예: foundation 1~9, forms 1~10)
- 변종 많은 섹션은 sub-heading으로 그루핑 (Variants / Sizes / States / Slots / Composition)
- "(v0.7.4)" / "(Tier 2)" 같은 history-leaking 마커 제거
- Toast outlet은 page root로 이동 — 어떤 카테고리 탭에서 호출해도 토스트 보임 (이전엔 `cat="overlays"` Section에 있어서 polaris 탭에서 CopyButton onCopy 콜백이 silenced)
- 헤더 stale 문구 fix ("37개 (Tier 0~4)" → "60+개의 variant·상태·조합 검증")

### SKILL.md cookbook — 18건 추가

"Don't roll your own when these exist"에 — PageHeader / SectionHeader / Combobox / Accordion / Tabs underline / CircularProgress + NavbarItem + Textarea autoResize / Input prefix-suffix / Switch label / Badge dismissible / Alert action / Skeleton shape / AvatarGroup / Stat loading / Button icon slots / Card interactive / DropdownMenuItem icon / TableRow selected / Toaster defaultDuration.

### Test infra (jsdom 폴리필)

cmdk(Combobox/Command 사용)가 mount 시 `ResizeObserver` / `Element.prototype.scrollIntoView` / `hasPointerCapture` / `releasePointerCapture`를 호출 — jsdom 미제공이라 `setup.ts`에 no-op polyfill 추가. 실제 브라우저 영향 0.

### 의존성

- `@radix-ui/react-accordion` `^1.2.2` (Accordion)

### 검증

- `pnpm verify` 13/13 ✓ (~60s)
- `@polaris/ui` test 169 → **235/235 ✓** (+66 신규 — props 추가, NavbarItem, 코덱스 fix 검증)

### 컨슈머 영향

**없음** — 모두 신규 export 또는 미사용 prop 추가, 기존 동작 fix(회귀 회복). 컨슈머 측 codemod 불필요.

- 모든 props는 optional, 기본값 그대로 두면 기존 동작 유지
- Tabs는 `variant`를 prop으로 받으니 기존 호출은 자동으로 `pill` 사용
- 다크모드 popover/modal이 살짝 더 밝아짐 (의도된 elevation 강화 — light 동일)
- TableRow의 row 안 button/checkbox 클릭이 이전엔 row.onClick까지 발화했는데, 이제 descendant-owned (의도 정정)
- Input value=0이 이제 present로 인식 (이전엔 빈 값 취급)

---

## [0.7.5] — 2026-05-10

컨슈머(DocFlow) 피드백 + 이전에 v0.7.5/v0.8 후보로 분류했던 것까지 한 번에 묶은 누적 patch. **BREAKING 없음** — 모두 additive (신규 컴포넌트 / 토큰 / 슬롯). 컴포넌트 37 → **51개** (+14), 테스트 89 → **169/169 ✓** (+80). 컨슈머 측 codemod 불필요. (0.7.4는 누적 commit이 빠르게 쌓여 별도 release 없이 0.7.5로 점프.)

### `@polaris/ui` — 신규 컴포넌트 14종

**Tier 3.5 — feedback / utility (4종)**

- **`<Progress>`** — determinate(`value` 0-100) / indeterminate, tone 5종(accent/success/warning/danger/ai), size 3, ARIA 풀세트 + `prefers-reduced-motion` 자동 존중
- **`<CopyButton>`** — `<Button>` wrapper. clipboard write + 1.5s "복사됨" + `aria-live="polite"` + non-secure 폴백(textarea + execCommand). `iconOnly` 모드, `onCopy`/`onError` 콜백
- **`<Stat>`** — KPI 타일. `label`/`value`/`delta`/`deltaTone`(neutral/positive/negative/accent)/`icon`/`helper` 슬롯
- **`<Disclosure>`** — Radix Collapsible 기반 single show/hide. 셰브론 180° 회전 + `asChild`로 fully custom trigger도 지원

**Tier 3.6 — file / time / pagination (5종)**

- **`<FileInput>`** — 트리거 버튼 + 선택 파일명 + 멀티파일 제거 UI
- **`<FileDropZone>`** — 드래그&드롭 + `accept`/`maxSize` 검증 + `onReject({file, code, reason}[])`. ARIA `role="button"` + Enter/Space activation. `multiple=false` drop 경로도 native picker와 동일하게 첫 1개 강제. consumer onClick/onDrag* 핸들러 compose (preventDefault로 opt-out)
- **`<DateTimeInput>`** / **`<TimeInput>`** — native input wrap (모바일 OS picker + 브라우저 i18n). `<Input>`과 동일 시각. JSDoc에 UTC shift 함정(`toISOString().slice(0,16)` 9h 어긋남) + `toLocalDatetime(d)` helper 가이드
- **`<PaginationFooter>`** — 페이지 번호 + "X-Y of N" + pageSize 셀렉터를 한 row로 통합. `labels` prop으로 i18n

**Tier 3.7 — Table helpers (5종, +Table 확장)**

- **`<TableSearchInput>`** — 돋보기 + clear × + 옵션 debounce. 단독 export
- **`<TableToolbar>`** — search + filter chips(`{value, label, count?}[]`) + 우측 actions 슬롯
- **`<TableSelectionBar>`** — 선택 N개 + bulk action 슬롯 + cancel. brand 틴트 strip
- **`<TableSkeleton>`** — `rows × columns` placeholder. `role="status"` + `aria-busy`
- **`<TableHead sortable>`** — 기존 `<TableHead>`에 `sortable`/`sortDirection`/`onSortChange`/`cycle` 추가. `aria-sort` 자동 + 3-state chevron + `null → asc → desc → null` 사이클 (2-state도 지원). `sortable` 미전달 시 기존 동작 그대로

### `@polaris/ui` — API / 토큰 확장

- **`Badge tone="outline"`** — 12 variants × outline tone. WCAG AA 충족: brand/ai/state는 신규 `*-strong` 토큰, file은 border만 컬러 + text는 `label-normal`로 시프트
- **`state.{success,warning,error,info}Strong` 신규 토큰 4개** (light: ramp 70 / dark: ramp 30, 모두 ≥4.5:1 검증) — 작은 12px 상태 텍스트 안전한 옵션
- **`surface.popover` / `surface.modal`** elevation 토큰 2단 (light 모두 #FFFFFF, dark `#232336`/`#2D2D45`). first-party overlay 적용:
  - `DropdownMenu` / `SelectContent` / `PopoverContent` / `Command` → `bg-surface-popover`
  - `DialogContent` / `DrawerContent` / `CommandDialog` → `bg-surface-modal`
  - `layer.overlay`(scrim/dim) ↔ `surface.modal`(panel) 의미 분리 명시
- **`shadow-polaris-focus`** Tailwind utility + `--polaris-shadow-focus` 토큰 — 3px 시스템 포커스 링, light/dark alpha 자동 조정
- **`Disclosure` asChild** — `asChild=true`면 wrapper/chevron 모두 생략 후 Slot으로 forward (Radix single-child 요건 준수)

### Demo 카탈로그 (`apps/demo/Components.tsx` #36~#44)

신규 14종을 다양한 variant로 노출 — Progress 5단×3사이즈×5톤 / CopyButton 4 variants + iconOnly + 토스트 / Stat 4-up grid / Disclosure 4 모드 / Badge subtle/solid/outline 6×3 / PaginationFooter 4 모드 / **Sortable Table 통합 데모** (TableToolbar↔TableSelectionBar 교체 + Checkbox 행 선택 indeterminate + sortable + 행별 ⋯ + TableSkeleton) / FileInput·FileDropZone 5 케이스 / DateTimeInput·TimeInput 정상/에러

### `@polaris/lint` / `@polaris/plugin` — 컨슈머 환경 fix

- **`packages/plugin/README.md`** — 옵션 A 로컬 심링크가 현재 Claude Code에서 동작 안 함. 루트 [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) 추가 + `/plugin marketplace add .` + `/plugin install polaris-design@polaris-design` 흐름으로 갱신. Claude **데스크탑** 앱은 plugin 시스템 노출 안 함 (CLI 전용)
- **`polaris-audit` temp config resolve** — `createRequire(import.meta.url).resolve('@polaris/lint', { paths: [target] })` + `pathToFileURL`로 절대 file URL을 inject (임시 디렉토리에 node_modules 없는 환경 대응)

### 컨슈머 cookbook (디스커버리 fix)

피드백 분석 결과 **약 절반은 이미 있는데 컨슈머가 못 찾은 디스커버리 문제**였음. README/SKILL.md에 cookbook 섹션 신설 — `<Stack direction="row" justify="between">` (Inline/HStack 케이스) / Card slot 패턴 / Input `hint`/`error` / Toast `toast()` imperative / EmptyState `action` / DropdownMenuFormItem / 행 ⋯ 메뉴 / 행 선택 indeterminate / TableCell colSpan + EmptyState 빈 상태 / 컬럼 가시성 토글

### 검증

- `pnpm verify` 13/13 ✓ (60s)
- `@polaris/ui` test 89 → **169/169 ✓** (+80 신규)
- `@polaris/lint` test 95/95 ✓
- demo lint warning 80 → 36 (-44, 55% 감소)

### 컨슈머 영향

**없음** — 모두 신규 export 또는 미사용 prop 추가. 기존 코드 변경 0건.

- `Input.hint` 사용처 OK (helperText alias는 v0.8.0에서 검토)
- `<TableHead>` 기존 사용처는 자동 (sortable 미전달 시 기존 렌더)
- 다크모드 popover/modal이 살짝 밝아짐 (의도된 elevation 강화)

---

## [0.7.3] — 2026-05-08

디자인팀 v0.7.2 재검수 + 외부 사이트 검수 2건 결과를 정리한 patch. **breaking 없음** — 토큰 추가 / lint 룰 추가 / 데모 신규 / tooling 강화. RC 없이 누적 changeset 3개를 한 번에 푸시.

### `@polaris/ui` — 컴포넌트 spec 정합 (디자인팀 v0.7.2 재검수)

디자인팀 follow-up review의 자동 처리 가능 항목을 모두 반영.

- **`outline` (deprecated) → `tertiary` 일괄 마이그레이션** — 데모 22곳. Components 카탈로그의 outline showcase도 라벨 정리. Outline은 사용자 시야에서 제거.
- **`status-*` v1 토큰 → `state-*` v2 토큰** (24줄, 6 컴포넌트: `Alert`, `Badge`, `DropdownMenu`, `Checkbox`, `Textarea`, `Form`). `danger → error` rename. `bg-status-X/<alpha>` → `bg-state-X-bg` (alpha 추정 → 디자인된 light tint).
- **`polaris-helper` 타이포 토큰 신설** (12px / 400 / lh 1.3) — DESIGN.md §4 명시: Floating Title / Error Text 모두 weight regular. Form 7곳(FormDescription / FormMessage / Input floating-label / Input error / Input hint / Checkbox / Textarea)을 신규 토큰으로 마이그. caption1(700)은 badge / tag 용 그대로.
- **`FormMessage` 자동 ErrorIcon prepend** — `<ErrorIcon size={16} />` + 4px gap + `flex items-start gap-polaris-3xs` + `role="alert"`. DESIGN.md §4 / WCAG 1.4.1 — "필수: 아이콘 동반 (X 또는 ⚠️, 16px) ... 색상만으로 에러를 전달하지 않음". `Checkbox` / `Textarea` 에러 상태도 동일 패턴 일관성 정합.

남은 디자인팀 컨펌 필요 5+1건은 [`docs/for-design-team/followup.md`](docs/for-design-team/followup.md)에 정리:
1. Button Tertiary 2종 분리 (흰 배경 + 회색 배경)
2. Modal/Dialog 풀 너비 버튼 layout
3. Checkbox 4가지 형태 + RadioGroup 신설
4. Checkbox AI Purple variant
5. Alert 유지 / 제거 결정 (현재 유지, 토큰만 정합)
6. (보너스) 디자인팀 검수 절차 확립

### `@polaris/lint` — 신규 룰 3종 (외부 사이트 검수 결과)

2026-05-08 외부 사이트 검수 2건(`jane-h-oh.github.io/design-test/dashboard`, `kcas-platform.vercel.app/GovChance`)에서 "Polaris 토큰을 load만 하고 평범한 SaaS로 보이는" 패턴 발견. 기존 6 lint 룰로는 어느 것도 못 잡아 회귀 차단을 위해 추가.

- **`no-tailwind-default-color`** (warn, v0.8 → error 예정) — Tailwind 기본 22 palette × 17 utility prefix × alpha modifier까지 매칭. 단, **Polaris가 자체 ramp(`05/10/20/30/40/50/60/70/80/90`)로 확장한 9개 palette**(blue/cyan/gray/green/orange/purple/red/violet/yellow)는 **1-2 digit shade 통과** — `bg-blue-50` / `from-purple-40` 같은 README §85·AGENTS §121 공식 토큰 false positive 방지. 3-digit shade(100/200/.../900)는 Tailwind default 폴백이라 flag.
- **`no-deprecated-polaris-token`** (error) — v0.6/rc.0/v1 deprecated alias 사용 차단. Tailwind class(`bg-fg-primary`, `text-surface-raised`, `bg-brand-primary`, `bg-status-danger`) + CSS variable(`var(--polaris-neutral-*)`, `var(--polaris-text-*)`, `var(--polaris-surface-*)`) 둘 다.
- **`no-non-polaris-css-var`** (warn) — JSX/className/style의 `var(--polaris-*)` / `var(--tw-*)` 외 CSS 변수 차단. `var(--color-copy)` / `var(--app-gradient-*)` 같은 자체 alias 레이어 검출. `allowedPrefixes` 옵션으로 escape hatch.

신규 룰이 검출한 데모 코드의 잔존 위반 39건은 sed 일괄 마이그레이션으로 동시 해소.

### `apps/demo` — `/proposal-platform` 신규

GovChance 도메인(R&D 제안서 작성 플랫폼)을 재현하되 Polaris signature 자산 9가지를 모두 적용한 reference 페이지:
- `<PolarisLogo>` (Footer) + `<NovaLogo>` (AI CTA 안)
- `<FileIcon type="hwp/docx/pdf">` 트리오 (STEP 05)
- `Button variant="ai"` (NOVA Purple solid)
- NOVA 그라디언트 텍스트 (Hero 헤드라인 / Stat)
- `<PromptChip>` (Coverage 분야)
- `<Ribbon>` 미니 미리보기 (Polaris의 "거의 유일한" 자산)
- 페이지 하단 IDENTITY CHECKLIST 섹션 — 외부 컨슈머의 비교 reference

외부 사이트 검수 시 "Polaris 토큰만 load한 상태로 시각 정체성이 안 드러나는" 사이트에 보낼 reference URL.

### Plugin / SKILL — 브랜드 정체성 가이드

- **`SKILL.md` §4-1** + **`AGENTS.md` §3-1** 신규 — 도메인 단서별 signature 자산 매핑(AI 키워드 → `Button variant="ai"` + NovaLogo / 파일 → `<FileIcon>` / 편집기 → `<Ribbon>` / 헤로 AI → NOVA 그라디언트 등). LLM이 코드 생성 시점에 의식적으로 적용하도록.
- **`/polaris-brand-audit`** 신규 슬래시커맨드 — 7가지 grep 휴리스틱으로 signature 자산 적용 *기회* 탐색. `/polaris-check`(mechanical 위반)와 보완 관계. false positive 가능 명시 — 사용자 검토 필수.

### Tooling — `pnpm verify` + opt-in pre-push hook

CI 13 step과 1:1 매칭하는 sequential runner. 첫 실패에서 멈추고 stdout/stderr 마지막 60/30줄 출력. 로컬 ~30s, e2e 포함 시 +30s.

```sh
pnpm verify                  # 매뉴얼 (e2e 제외)
pnpm verify --with-e2e       # e2e 포함
pnpm verify:install-hook     # opt-in pre-push hook 설치
git push --no-verify         # 비상 우회
```

이번 release 주기에 CI 회귀 4건 발생 — 다음 회귀 차단을 위해 도입. 자동 install 하지 않고 opt-in (사용자 워크플로 다양성 + git config 자동 수정 회피).

### `bg-accent-brand-normal-subtle` Tailwind alias 누락 hotfix (v0.7.2 → 0.7.3 carryover)

이미 v0.7.2에서 처리됐지만 narrative 정리 — 12+ 컴포넌트(Sidebar, Pagination, Calendar, Drawer, Command, Badge, Select, DropdownMenu, FileCard, Ribbon)의 hover/active 배경이 *모든 버전에서 silently broken*이었음. v0.7.2 hotfix로 alias 추가해 즉시 복구.

### Codex 리뷰 4건 정정

- `no-tailwind-default-color`의 Polaris-owned ramp 오인 → `POLARIS_OWNED_PALETTES` allowlist + shade 캡처
- `template-next/README.md`의 `LATEST` env 미export → `LATEST="$LATEST" node -e ...` 정정
- `/proposal-platform`이 e2e visual에 없음 → routes 추가 (28→30 baseline)
- Renovate regex의 dotted 버전 미스매치 → `[^/]+?` non-greedy로 정정

### 패키지 버전

@polaris/ui · @polaris/lint · @polaris/plugin · polaris-template-next · demo + root: **0.7.2 → 0.7.3**.

마이그레이션 필요 없음 (additive). 컨슈머는 신규 lint warning을 볼 수 있으나 모두 *기존 코드*의 문제를 새로 검출하는 형태 — `polaris-codemod-v07`로 자동 변환 가능. 패키지별 자세한 변경 단편: 각 `packages/*/CHANGELOG.md`의 `## 0.7.3` 섹션.

---

## [0.7.2] — 2026-05-07

🐛 **Hotfix** — Tailwind alias 누락으로 시스템 전반의 hover / active 배경이 silently broken이던 버그 정정.

### 증상

리본 버튼에 마우스를 올려도 light blue hover indicator가 보이지 않음 (사용자 보고: "리본 메뉴의 호버가 표시 안되는데?").

### 영향 범위

12+ 컴포넌트가 `bg-accent-brand-normal-subtle` 클래스를 hover / active state에 사용 중이었으나, 해당 클래스가 v0.7 Tailwind 토큰 맵에 정의되지 않아 빌드 CSS에 emit되지 않음:

`Sidebar`, `Pagination`, `Calendar`, `Drawer`, `Command`, `Badge`, `Select`, `DropdownMenu`, `FileCard`, `Ribbon` (포함 `RibbonButton` lg / `RibbonToggleItem` data-state=on / `RibbonTab` active).

이 버그는 이전부터 존재해왔으며 0.7.0의 토큰 재정렬 이후 표면화. 단위 테스트는 className 문자열만 검증하므로 통과. 시각 회귀 테스트는 정적 스크린샷이라 hover state를 캡처하지 않아 미발견.

### 수정

`packages/ui/src/tailwind/index.ts`의 `accent-brand` family에 `'normal-subtle'` 키를 추가, 기존 `--polaris-brand-primary-subtle` CSS 변수(light `#E8F2FE` / dark `#1A2238`)에 매핑. 12+ 컴포넌트의 hover / active 배경이 즉시 복구 — call site 변경 없음.

향후 정리(v0.8): `accent-brand-bg`, `accent-brand-bg-hover`, `accent-brand-normal-subtle` 등 brand-tinted background 토큰을 단일 canonical 명명으로 통합하면서 이 deprecated 별칭 제거 예정.

### 패키지 버전

@polaris/ui · @polaris/lint · @polaris/plugin · polaris-template-next · demo + root: 0.7.1 → 0.7.2.

---

## [0.7.1] — 2026-05-07

v0.7.0 위에 누적된 **additive 패치** — breaking 없음, 디자인 시스템에 ribbon 아이콘 셋 추가 + 폴라리스 오피스 데모를 실제 제품 ribbon에 1:1 매칭. RC 두 번(rc.0 / rc.1)을 거쳐 정식 릴리스.

### 신규 — `@polaris/ui/ribbon-icons` (91 디자인팀 아이콘)

리본 버튼 안에서 사용하는 멀티컬러 아이콘 셋. UI 아이콘(`@polaris/ui/icons`, monochrome + currentColor)과 별도 — 색상이 디자인팀에 의해 baked in 됨.
- **57 big × 32 px** — `RibbonButton size="lg"` (icon-over-label) 용
- **34 small × 16 px** — `RibbonButton size="sm/md"` (icon-only / icon-before-label) 용. big의 축소가 아닌 별도 디자인.
- `RIBBON_ICON_REGISTRY` (슬러그→컴포넌트), `RIBBON_ICON_BIG_SLUGS` / `RIBBON_ICON_SMALL_SLUGS` Set으로 어느 셋에 속하는지 판별.
- 컴포넌트명은 사람이 읽기 쉬운 PascalCase로 정규화 (`AlignCenterIcon`, `WordCountIcon`, `RotateRight90Icon` 등) — `SLUG_REWRITES` 맵으로 Figma compound 슬러그 자동 처리.

### 데모 페이지 재구성

- `/polaris-office`를 실제 폴라리스 오피스 워드 리본에 맞춰 5개 탭 (홈/삽입/레이아웃/검토/AI 도구) 모두 재배치. lucide-react best-effort 매칭 → 91/91 디자인팀 ribbon-icon 사용.
- 파일 백스테이지 메뉴 폰트 weight 정정 (제품 실측에 맞춰 bold/semibold 제거).
- 탭 헤더의 "리본 접기" 버튼을 `<RibbonTabList>` 외부로 이동 (`role="tablist"` ARIA 위반 정정).
- `/icons` 카탈로그 페이지에 ribbon 섹션 추가 (big/small 분리 표시).

### SVG id 격리

`build-{icons,file-icons,logos,ribbon-icons}` 4종 generator가 각 SVG 본문의 `id="..."` 정의 + `url(#...)` / `href="#..."` / `xlink:href="#..."` 참조를 슬러그 prefix로 다시 작성. Figma export의 자동 ID(`clip0_0_31035`, `Mask`, `Group_2` 등)가 다른 아이콘 사이에 충돌해 두 번째 인스턴스가 첫 번째 정의로 잘못 resolve되는 문제 해소. 67 SVG에 영향.

### Ribbon 컴포넌트 폴리시 / 폰트 weight

- `RibbonSeparator` / `RibbonRowDivider`가 deprecated alias `bg-surface-border` 대신 v0.7 spec 토큰 `bg-line-neutral` 사용 (v0.8의 alias 제거에 미리 대비).
- `text-polaris-caption1`은 spec상 weight 700이지만 Office 실제 lg 리본 버튼 라벨은 regular 400. `RibbonButton` lg variant + `RibbonStack` 라벨 + `RibbonTab` active 상태에서 모두 정정.
- `RibbonTabs`에 default `activationMode="manual"` 추가 (Office 표준 a11y 패턴 — arrow 키로 panel 즉시 안 바뀜, 스페이스/엔터로 commit).

### Generator infra

- 4종 generator idempotent + 동시 실행 안전 (`pnpm -r typecheck`처럼 동일 출력 디렉토리 병렬 invocation 시 `ENOTEMPTY` 경쟁 상태 해소).
- `pascalCase`가 숫자 시작 슬러그 reject (JS identifier 규칙 위반 방지).
- `pruneOrphans` 헬퍼 4종 generator에서 동일 패턴/시그니처 통일.
- 공유 `_svg-utils.ts` 모듈 신설 (`prefixSvgIds`).

### Asset 정정

디자인팀 export 파일명 오타 두 건 정정:
- `roatateright90` → `rotateright90`
- `algnleft01` → `alignleft01`

ribbon-icons 자체가 0.7.1에 처음 노출되므로 외부 영향 없음.

### Lint 게이트 정정

- `polaris-template-next`(npm publish 대상) lint script에 `--max-warnings=0` 추가. 3 warnings는 polaris 등가물로 swap (`Plus`/`Search`/`Image`).
- `apps/demo`(local sandbox)는 80여 lucide chrome 아이콘 warning을 허용하되 CI step 이름을 honest하게 정정.

### Tests / docs

- `Ribbon.test.tsx`에 ribbon-icons smoke 5건 추가 (small/big viewBox, size prop 균등 스케일, RibbonButton 통합, registry/slug-set 일치).
- `Icons.tsx` 카탈로그에 ribbon 섹션 추가.
- `packages/ui/README.md`, `AGENTS.md`, `SKILL.md`, `polaris-component.md`, `DESIGN.md`에 `@polaris/ui/ribbon-icons` 사용 예 추가.

### 의도하지 않았던 추가 픽스

- 데모 `FileIconBadge` alias 제거 (lucide `File` 더는 미사용).
- 백스테이지 inline `calc(100vh - 3rem)` → `--editor-chrome-h` CSS var.
- `Icons.tsx` JSDoc "Four sections" → 실제 5개 섹션과 일치.
- 데모 푸터 "lucide-react best-effort 매칭" 카피 → 91종 ribbon-icons 명시.

@polaris/ui · @polaris/lint · @polaris/plugin · polaris-template-next · demo + root: 0.7.0 → 0.7.1.

마이그레이션 필요 없음 (additive). 패키지별 자세한 변경 단편: 각 `packages/*/CHANGELOG.md`의 `## 0.7.1` 섹션.

---

## [0.7.1-rc.1] — superseded by 0.7.1

rc.0 위에 누적된 픽스 — 코덱스 코드 리뷰 + 사용자 시각 검토 반영. 0.7.1 정식에 포함.

### SVG id 격리 (P1)

`build-{icons,file-icons,logos,ribbon-icons}` 4종 generator가 각 SVG 본문의 `id="..."` 정의 + `url(#...)` / `href="#..."` / `xlink:href="#..."` 참조를 슬러그 prefix로 다시 작성. Figma export의 자동 ID(`clip0_0_31035`, `Mask`, `Group_2` 등)가 다른 아이콘 사이에 충돌해 두 번째 인스턴스가 첫 번째 정의로 잘못 resolve되는 문제 해소.

### Ribbon 아이콘 컴포넌트 네이밍 정리 (P1, public API freeze 직전)

`SLUG_REWRITES` 맵으로 compound concat된 Figma 슬러그를 kebab-case로 정규화 → 사람이 읽기 쉬운 PascalCase 컴포넌트명으로. 30여 종 변경: `AligncenterIcon` → `AlignCenterIcon`, `TextcolorIcon` → `TextColorIcon`, `Rotateright90Icon` → `RotateRight90Icon`, `DocuprotectionIcon` → `DocuProtectionIcon`, `WordcountIcon` → `WordCountIcon` 등. Source SVG 파일명은 그대로, normalize 단계에서만 rewrite.

### Ribbon 폰트 weight 정정

- `text-polaris-caption1`은 spec상 weight 700이지만 Office lg 리본 버튼 라벨(붙여넣기 / 페이지 설정 / …)은 실제로 regular 400. `RibbonButton` lg variant + `RibbonStack` 라벨에 `font-normal` 명시.
- `RibbonTab` active 상태의 `font-semibold` 제거 — underline accent + label-normal 색만으로 active 표시.

### Lint 게이트 정정

- `polaris-template-next` lint script에 `--max-warnings=0` 추가 (npm publish 대상). 3 warnings는 polaris 등가물로 swap (`Plus → PlusIcon`, `Search → SearchIcon`, `Image as ImageIcon → ImageIcon`).
- `apps/demo`는 sandbox라 warning 허용하되 CI step 이름을 honest하게: "showcase, warnings allowed".

### Visual baseline 재기준선화

위 변경들이 픽셀 단위 시각 차이를 만들어 `pnpm test:e2e` 28건 중 12건이 실패. baseline 갱신 — 모두 의도된 변경으로 28/28 green 확인.

---

## [0.7.1-rc.0] — superseded by 0.7.1

v0.7.0 위에 누적된 추가 — **breaking 없음**, 디자인 시스템에 ribbon 아이콘 셋 추가 + 데모 페이지를 실제 폴라리스 오피스 워드 리본에 맞춰 재구성.

### 신규 — `@polaris/ui/ribbon-icons` (91 디자인팀 아이콘)

리본 버튼 안에서 사용하는 멀티컬러 아이콘 셋. UI 아이콘(`@polaris/ui/icons`, monochrome + currentColor)과 별도 — 색상이 디자인팀에 의해 baked in 됨.
- **57 big × 32 px** — `RibbonButton size="lg"` (icon-over-label) 용
- **34 small × 16 px** — `RibbonButton size="sm/md"` (icon-only / icon-before-label) 용. big의 축소가 아닌 별도 디자인.
- `RIBBON_ICON_REGISTRY` (슬러그→컴포넌트), `RIBBON_ICON_BIG_SLUGS` / `RIBBON_ICON_SMALL_SLUGS` Set으로 어느 셋에 속하는지 판별.

### 데모 페이지 재구성

- `/polaris-office`를 실제 폴라리스 오피스 워드 리본에 맞춰 5개 탭 (홈/삽입/레이아웃/검토/AI 도구) 모두 재배치. lucide-react best-effort 매칭 → 91/91 디자인팀 ribbon-icon 사용.
- 파일 백스테이지 메뉴 폰트 weight 정정 (제품 실측에 맞춰 bold/semibold 제거).
- 탭 헤더의 "리본 접기" 버튼을 `<RibbonTabList>` 외부로 이동 (`role="tablist"` ARIA 위반 정정).
- `/icons` 카탈로그 페이지에 ribbon 섹션 추가 (big/small 분리 표시).

### Ribbon 컴포넌트 폴리시

`RibbonSeparator` / `RibbonRowDivider`가 deprecated alias `bg-surface-border` 대신 v0.7 spec 토큰 `bg-line-neutral` 사용 (v0.8의 alias 제거에 미리 대비).

### Generator infra

`build-icons` / `build-file-icons` / `build-logos` / `build-ribbon-icons` 4종이 idempotent + 동시 실행 안전. `pnpm -r typecheck`처럼 동일 출력 디렉토리에 대한 병렬 invocation에서 발생하던 `ENOTEMPTY` 경쟁 상태 해소 (`rmSync` 제거 → `mkdir(recursive)` + 파일 단위 overwrite + best-effort orphan prune 패턴).

### Asset 정정

디자인팀 export 파일명 오타 두 건 정정:
- `roatateright90` → `rotateright90`
- `algnleft01` → `alignleft01`

정식 첫 릴리즈 전이라 외부 영향 없음 (ribbon-icons 자체가 0.7.1에 처음 노출).

---

## [0.7.0] — 2026-05-07

디자인팀의 v1 (2026.05) 정식 정의서 — `DESIGN.md` + `primitive-color-palette` — 에 토큰 명명·값·컴포넌트 스펙·자산을 완전 정렬한 **메이저 릴리스**. v0.6.1 위에 8개 누적 changeset (rc.0 → rc.1 → rc.2 → final) 통합.

### 시맨틱 토큰 19개 신설

`label.*` (6) / `background.*` (4) / `layer.*` (2 NEW) / `interaction.*` (`pressed` NEW) / `fill.*` (`neutral`·`strong` NEW) / `line.*` (`strong`·`disabled` NEW) / `accentBrand.*` (`bg`·`bgHover` NEW) / `accentAction.*` (Black 버튼 NEW) / `focus.ring` / `staticColors.*` / `state.*` (`new` + `bg` variants 4 NEW). v0.6 / rc.0 / rc.1 alias는 모두 deprecated alias로 작동 (v0.8에서 제거).

### 컬러 primitive 확장

브랜드 6 family + supplementary 5 (Sky Blue / Blue / Violet / Cyan / Yellow) + Gray ramp = **11 family × 10 step** (`05`/`90` 추가). `bg-blue-50` ~ `bg-blue-90` 같은 직접 참조 가능. step `5` (no leading zero)는 deprecated alias.

### Typography 11레벨 spec 명명

`display` (40) / `title` (32) / `heading1`–`heading4` (28/24/20/18) / `body1`–`body3` (16/14/13) / `caption1`–`caption2` (12/11). Caption weight 700, body letter-spacing 제거. 모바일 (≤767px) 자동 한 단계 축소 (`tokens.css`의 `@media`).

### 새 토큰 시스템 4개

- **Spacing** — 12 named scale (`4xs` 2 → `4xl` 64) + Tailwind 기본 유지
- **Z-index** — `base` 0 / `dropdown` 100 / `sticky` 200 / `dim` 300 / `modal` 400 / `toast` 500
- **Motion** — duration × 4 (`instant`/`fast`/`normal`/`slow`) + easing × 3 (`in-out`/`out`/`in`)
- **Breakpoint** — semantic (`mobile`/`tablet-v`/`tablet-h`/`desktop`)

### 다크 모드 그레이스케일 재작성

rc.0의 퍼플 틴트 (`#1B1B2A` 등) → spec의 단색 그레이 (`#232323`/`#282828`/`#3B3B3B` 등). dark hex 19개 토큰 전수 갱신.

### 컴포넌트 재설계

- **Radius 한 단계 시프트** — `md` 8→12 (Button/Card/Modal default), `lg` 12→16 (Large CTA), `xl` 16→24 (Modal), `2xl` 24→38 (bottom sheet).
- **Button** — 6 사이즈 (24/32/40/48/54/64) + Black variant (`accentAction`).
- **Input** — 52px height + floating title 패턴 + 강제 에러 아이콘 (WCAG 1.4.1).
- **Modal** — 24px radius + `layer.surface` 배경.
- **Toast** — 모든 variant 다크 글래스 표면 (`bg-layer-overlay backdrop-blur-md`) + 좌측 색깔 보더 + 48h.

### 디자인팀 SVG 자산 통합 (3 신규 entry point)

```
@polaris/ui/icons       — 65 UI 아이콘 × 18/24/32 px (currentColor 자동 변환, Tailwind text-{token}으로 색상 제어)
@polaris/ui/file-icons  — 29 파일 타입 (multi-color baked-in, 32px 마스터)
@polaris/ui/logos       — PolarisLogo (3 variants × 2 tones) + NovaLogo (2 tones)
```

`<FileIcon>` 색깔 사각형 → 디자인팀 실제 SVG로 완전 교체 (5 → 29 타입). `@polaris/ui` 내부 lucide-react는 폴라리스 아이콘으로 대체 (있는 것만 — Loader2/Sparkles/MoreHorizontal 등은 lucide 유지).

### 자동화 도구

- **`polaris-codemod-v07`** — v0.6 / rc.0 / rc.1 / rc.2 → v0.7 일괄 변환 (TS/TSX 토큰 멤버 + Tailwind 클래스 + CSS 변수). 11개 codemod test, `--check` CI 모드 지원.
- **신규 lint 룰**:
  - `@polaris/state-color-with-icon` (warn) — `text-state-{success,warning,error}`가 아이콘 동반 없이 사용되면 경고 (WCAG 1.4.1).
  - `@polaris/prefer-polaris-icon` (warn) — `lucide-react`에 폴라리스 대응 있을 때 권장 (점진 마이그레이션).

### 데모 (`apps/demo`)

- **`/#/icons`** 신규 — 65 UI 아이콘 검색/사이즈 비교 + 29 파일 + 4 로고 카탈로그.
- **`/#/tokens`** 재구성 — 컬러는 `@polaris/ui/tokens.colors` 에서 자동 iterate (새 그룹 자동 반영). 13 섹션 / ~150 swatch + 비-컬러 토큰 (Spacing/Radius/Shadow/Motion/Z-index/Breakpoint) 시각 데모. figma-spec PNG 인라인 (`<details>` 토글).

### 인프라 / Tooling

- **빌드 파이프라인 3 신규 generator** — `build:icons` / `build:file-icons` / `build:logos` (SVG → React 컴포넌트). `normalize:icons` 가 Figma 자동 export 이름 정규화.
- **`@polaris/ui` `prepare` hook** — `pnpm install` 시 generated icon / file-icon / logo source 자동 생성. clean clone 지원.
- **demo / template-next `prep:ui`** — `pnpm install` 후 `pnpm dev` 까지 무중단. PostCSS Tailwind preset이 dist를 요구하는 케이스 처리.
- **demo Vite alias 3개 추가** — `@polaris/ui/icons`, `/file-icons`, `/logos` source HMR.
- **demo tsconfig paths 미러링** — Vite alias와 동일 경로로 dist 없이 typecheck 가능.
- **시각 회귀 baseline 28개** (13 라우트 × 2 viewport + ribbon 5 × 2). `/icons-catalog` 추가.

### 문서

- **DESIGN.md auto-gen 갱신** — 358 CSS vars + 각 섹션에 figma-spec PNG inline (Color/Typography/Grid/Radius/Iconography/Button/Input).
- **`docs/for-consumers/migration/v0.6-to-v0.7.md`** — 8개 변경 영역 + codemod 매핑 표 (TS/Tailwind/CSS) + codemod 적용 범위 메모 (`@polaris/ui/src/{tokens,styles,tailwind}` 제외).
- **SKILL.md / AGENTS.md / 패키지 README** v0.7 spec 명명으로 전수 갱신.
- **루트 README** 압축 (271 → 129 라인) + `docs/for-contributors/roadmap.md` v0.6/v0.7 entry 추가.

### BREAKING vs v0.6.1

- 모든 컴포넌트 radius +4px (md 8→12 등)
- 다크 모드 hex 전수 변경
- Button 사이즈 명명 시프트 (`sm`→`xs`, `md`→`sm`, `lg`→`md` 권장 — codemod 미지원, 수동)
- Input height 36→52, NovaInput 외형 (단일행 → 2행 컴포저)
- Modal 12r→24r
- Toast 단색 surface → 다크 글래스
- `<FileIcon>` API: `size="sm/md/lg"` → `size={number}` (px)
- `displayLg` 60 → 40 (rc.0 → spec)

### Bumped

@polaris/ui · @polaris/lint · @polaris/plugin · polaris-template-next · demo + root: 0.6.1 → 0.7.0.

마이그레이션 가이드: [`docs/for-consumers/migration/v0.6-to-v0.7.md`](docs/for-consumers/migration/v0.6-to-v0.7.md). 패키지별 자세한 변경 단편: 각 `packages/*/CHANGELOG.md` 의 `## 0.7.0` 섹션.

---

## [0.6.1] — 2026-05-05

v0.6.0 출시 후 코덱스 리뷰 + 사용자 피드백을 반영한 정비 패치. ribbon 잔여 버그를 모두 잡고, 안전망(테스트/시각 회귀/changeset/토큰 generator)을 모두 갖춘 첫 release.

### Ribbon (`@polaris/ui/ribbon`)

- **`disabled` SplitButton 메뉴 차단** — 비활성 상태에서는 `DropdownMenu` 자체를 mount하지 않아 chevron 클릭으로도 메뉴가 열리지 않음. Radix `asChild` + native `disabled`만으로는 부족했던 race condition fix.
- **panel 높이 통일** — `min-h-20`(80px) + `data-[state=inactive]:hidden` + `overflow-y-clip`. lg 버튼 + 다중 행 sm stack 같은 그룹 조합이 있을 때 탭 간 ribbon 높이가 흔들리던 문제 + inactive panel이 padding box를 점유하던 문제 + 의도치 않은 vertical scrollbar 모두 해소.
- **scrollbar 반응형** — md 미만에선 native thin scrollbar 노출(가로 스크롤 affordance), md 이상은 hidden(Office 패턴). `RibbonTabList`도 동일 처리.

### Tests (`@polaris/ui`)

- 14개 컴포넌트 + ribbon + form 테스트 스위트 추가. **17% → 60%+** 커버리지. 21 files / 82 tests 통과. ribbon disabled 버그·icon-only aria-label fallback 같은 fix들이 회귀 가드로 lock됨.

### Tokens

- **`tokens.css` 자동 생성** — `packages/ui/scripts/build-tokens.ts`(tsx)이 `src/tokens/*.ts`에서 색·radius·shadow·fontFamily를 모두 읽어 CSS 변수로 emit. `pnpm --filter @polaris/ui build`가 자동 호출, CI가 drift 검출.
- `tokens.md` 사양 문서가 `tokens.ts`와 1:1 매칭되도록 재작성 — 누락된 status hover 변형/`text.onStatus`/spacing 전체 표/dark shadow 추가, camelCase로 통일.

### Demo (`apps/demo`)

- **`/#/assets`** 신규 — 폴라리스 자체 제작 자산(로고/아이콘/NOVA cosmic 배경/통합 AI 로고)을 lucide 카테고리 그리드와 함께 한 페이지에 정리. 디자인 자산 v0.7+ 작업 가이드 ([docs/archive/design-assets-v07.md](docs/archive/design-assets-v07.md)).
- **`/#/tokens`** 신규 — 정적 `swatches.html` 대체. `@polaris/ui/tokens`에서 자동 import.
- Polaris Office 데모: top-bar 라벨 반응형(md/lg에서 점진적 hide), 문서명 truncate, EditorChrome이 모바일에서 한 줄에 fit.
- `vite.config`이 `@polaris/ui` 및 subpath들을 source로 alias — dev에서 ui 변경 시 별도 빌드 없이 즉시 HMR.

### 인프라 / 릴리스 자동화

- **changesets** 도입 — 5개 워크스페이스 패키지를 `fixed` 그룹으로 묶음. 다음 릴리스부터 `pnpm exec changeset version`이 자동 bump + CHANGELOG entry 작성. `scripts/sync-root-version.mjs`가 root pkg version도 sync, CI가 drift 검출.
- **Playwright 시각 회귀 테스트** — desktop + mobile, 8 라우트 + 5 ribbon 탭 = 26 baseline PNG. `pnpm test:e2e` 비교, `:update` 갱신.
- **Turbo `test`가 자기 패키지 build 의존** — `dist/`를 읽는 node:test와 build 사이의 race 차단.
- CI `pnpm changeset status` 단계가 `fetch-depth: 0` + base ref + 명시적 fail (silent `|| true` 제거).
- Codex/Cursor용 `AGENTS.md` + plugin commands가 `pnpm exec eslint .` 대신 `pnpm lint`(또는 `--filter <pkg> lint`) 사용 — root에 eslint 바이너리 없는 모노레포 환경에서 실패하던 verify 명령 fix.

### 알려진 한계

- Visual regression baseline은 darwin에서 캡처됨. CI(linux)에서 첫 실행 시 새로 캡처 필요. `e2e/__screenshots__/{project}-{platform}/` 구조라 충돌은 안 남.

---

## [0.6.0] — 2026-05-05

v0.5.0 Ribbon 출시 후 실사용 검증(폴라리스 오피스 워드 리본 재현)을 거쳐 정비 + 새 컴포넌트를 추가하고, 데모 인프라를 단순화한 정비 릴리스.

### 추가됨 — `@polaris/ui/ribbon`

- **`RibbonMenuButton`** — chevron만 클릭 가능한 메뉴 트리거 (메인 액션 없음). 레이아웃 탭의 "여백·용지 방향·크기·단·나누기" 같은 옵션 컨트롤에 사용. `lg` 사이즈에선 chevron이 라벨 아래에 stacked.
- **`RibbonStack`** — RibbonGroup 안 세로 컬럼. 잘라내기/복사/서식복사 같은 stack of secondary actions 패턴.
- **`RibbonRow`** — RibbonStack 안 가로 행. Office 클래식 2-row 그룹 구성에 사용.
- **`RibbonRowDivider`** — 같은 RibbonRow 안 클러스터 사이 짧은 세로선. Office의 `B I U S | X₁ X² | A_ A_ | A▢ E` 같은 cluster 분할에 사용 (RibbonSeparator는 그룹 전체 height을 가르므로 구분).

### 변경됨

- **`RibbonSplitButton` lg 자동 vertical 분할** — `size="lg"`일 때 메인 액션 위 + chevron strip 아래의 column 레이아웃으로 자동 전환 (Office paste 버튼 패턴).
- **메인/chevron 독립 hover** — `RibbonSplitButton`의 두 영역이 wrapper hover 없이 각자 hover state를 가짐. chevron 영역 폭도 `min-w-0 px-0.5`로 축소.
- **`RibbonContent` panel 높이 안정화** — horizontal scrollbar를 시각적으로 숨겨(`scrollbar-width: none` + `::-webkit-scrollbar:hidden`) overflow 여부와 무관하게 panel 높이가 일정하도록. inactive panel은 `data-[state=inactive]:hidden`으로 layout에서 제거 (Radix `hidden` attribute가 `flex` className에 밀리던 문제 해결).
- **lg 버튼 라벨 wrap 통일** — `RibbonToggleItem`도 `RibbonButton`과 동일하게 lg에서 children을 `whitespace-pre-line text-center` span으로 wrap. `\n` 줄바꿈이 우연히 자연 wrap에 의존하던 fragile 상태 fix.
- **lg cva density** — `min-w-12 → min-w-14` (짧은 라벨도 가로폭 균일), `RibbonGroup` outer `px-1.5 → px-1` (그룹 사이 간격 축소).
- **`SelectTrigger` 줄바꿈 방지** — `whitespace-nowrap` + `[&>span]:truncate [&>span]:min-w-0` 보장. 좁은 select에서 콘텐츠가 잘리되 절대 wrap되지 않음 (ribbon 폰트 select 등).

### 수정됨

- **`RibbonSplitButton`이 `disabled` 상태에서도 메뉴가 열리던 버그** — `disabled` prop이 메인 버튼에만 spread되고 `DropdownMenuTrigger`에는 전달되지 않아 비활성 split의 chevron 클릭 시 메뉴가 열리던 문제. 이제 `disabled`를 destructure해서 양쪽 모두에 명시적으로 적용.
- **icon-only `RibbonButton` / `RibbonToggleItem`의 accessible name 누락** — `tooltip`은 시각 전용이라 스크린리더에는 안 노출. `children`이 없고 `tooltip`이 string이면 `aria-label`로 자동 fallback (consumer가 `aria-label`을 명시했다면 우선).

### 추가됨 — 데모 (`apps/demo`)

- **`/#/polaris-office`** — 폴라리스 오피스 워드 리본 재현. 8 탭(파일·홈·삽입·레이아웃·검토·보기·펜·AI 도구) 중 5탭(홈·삽입·레이아웃·검토·AI 도구)을 self-contained 컴포넌트로 분리해서 사용자가 한 탭 코드를 그대로 카피해 시작점으로 쓸 수 있도록 구성.
- **`/#/tokens`** (NEW) — 디자인 토큰 SPA 페이지. `@polaris/ui/tokens`에서 자동 import해서 색상(light/dark 페어), 타이포그래피, radius, shadow를 한 페이지에 시각화. 정적 `swatches.html`을 대체하면서 NavBar/Sidebar 셸 안으로 통합.

### 변경됨 — 데모

- **`vite.config.ts`에 `@polaris/ui` source alias** — dev에서 ui 패키지 변경 시 별도 `tsup` 빌드 없이 즉시 HMR 반영 (subpath alias 5개 + bare alias). `pnpm --filter demo dev` 한 번만 띄우고 양쪽 코드 편집 가능.

### 제거됨 — Storybook

- `apps/storybook` 전체 패키지 (-83 dep)
- `.github/workflows/ci.yml`의 Lint/Build storybook 단계
- `.github/workflows/deploy.yml`의 Build Storybook + Combine artifacts 단계
- 데모 사이드바/홈에서 Storybook 항목·카드·외부 링크
- `apps/demo/public/swatches.html` 정적 파일 (위 `/#/tokens` 라우트로 이전)

근거: 컴포넌트 카탈로그(`/#/components`)와 역할 중복. 사내 디자인 시스템 맥락에서 외부 OSS 친숙도 가치 낮음. prop controls는 코드 직접 수정이 더 빠름. 이중 유지보수 부담 제거.

---

## [0.5.0] — 2026-05-05

에디터 제품군(Office 도큐먼트·MD 에디터·스프레드시트·PDF 도구 등)을 위한 **Ribbon** 컴포넌트 family. Subpath로 분리해 일반 SaaS 사용자에게는 dep 부담 없음.

### 추가됨 — `@polaris/ui/ribbon` (Tier 4)

```tsx
import {
  Ribbon, RibbonTabs, RibbonTabList, RibbonTab, RibbonContent,
  RibbonGroup, RibbonSeparator,
  RibbonButton, RibbonSplitButton,
  RibbonToggleGroup, RibbonToggleItem,
} from '@polaris/ui/ribbon';
```

- **`Ribbon`** — 루트 wrapper. surface-raised + bottom border
- **`RibbonTabs` / `RibbonTabList` / `RibbonTab` / `RibbonContent`** — Office 스타일 탭 (홈·삽입·레이아웃·검토·…). Radix Tabs 기반, 폴라리스 토큰 + 컴팩트 라인 인디케이터
- **`RibbonGroup`** — vertical 그룹 + 선택적 bottom label ("붙여넣기"·"문단"…)
- **`RibbonSeparator`** — 그룹 사이 vertical divider
- **`RibbonButton`** — icon-first button. 3가지 size:
  - `sm` (default) — icon-only with tooltip (정렬·서식 토글 같은 컴팩트 액션)
  - `md` — icon + 인라인 라벨
  - `lg` — icon-over-label (Office의 "붙여넣기" 같은 큰 primary action)
- **`RibbonSplitButton`** — main action + dropdown chevron (글자색·형광펜처럼 default + 옵션 패턴)
- **`RibbonToggleGroup` / `RibbonToggleItem`** — Radix `react-toggle-group` 래핑. `type="single"` (정렬) / `type="multiple"` (서식 굵게/기울임) 양쪽

### 사용 예시

**Office 스타일 (탭 + 그룹):**
```tsx
<Ribbon>
  <RibbonTabs defaultValue="home">
    <RibbonTabList>
      <RibbonTab value="home">홈</RibbonTab>
      <RibbonTab value="insert">삽입</RibbonTab>
    </RibbonTabList>
    <RibbonContent value="home">
      <RibbonGroup label="글꼴">
        <RibbonToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
          <RibbonToggleItem value="bold" tooltip="굵게 (⌘B)" icon={<Bold />} />
          <RibbonToggleItem value="italic" tooltip="기울임 (⌘I)" icon={<Italic />} />
        </RibbonToggleGroup>
      </RibbonGroup>
      <RibbonSeparator />
      <RibbonGroup label="문단">
        <RibbonToggleGroup type="single" value={align} onValueChange={setAlign}>
          <RibbonToggleItem value="left" icon={<AlignLeft />} />
          <RibbonToggleItem value="center" icon={<AlignCenter />} />
        </RibbonToggleGroup>
      </RibbonGroup>
    </RibbonContent>
  </RibbonTabs>
</Ribbon>
```

**MD 에디터 스타일 (탭 없이 단일 패널):**
```tsx
<Ribbon>
  <div className="flex items-center gap-1 px-2 py-1.5">
    <RibbonGroup>
      <RibbonToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
        <RibbonToggleItem value="bold" tooltip="**굵게** (⌘B)" icon={<Bold />} />
        <RibbonToggleItem value="italic" tooltip="*기울임* (⌘I)" icon={<Italic />} />
        <RibbonToggleItem value="code" tooltip="`코드` (⌘E)" icon={<Code />} />
      </RibbonToggleGroup>
    </RibbonGroup>
    <RibbonSeparator />
    <RibbonGroup>
      <RibbonButton tooltip="# 제목" icon={<Heading1 />} />
      <RibbonButton tooltip="- 글머리" icon={<List />} />
    </RibbonGroup>
  </div>
</Ribbon>
```

### 의존성 추가

- `@radix-ui/react-toggle-group@^1.1.1` — ToggleGroup primitive

루트 `@polaris/ui` bundle에는 포함되지 않음 (subpath isolation 검증 — `grep` 0건).

### 데모

- §34 Ribbon — Office 스타일 (탭 + 그룹 + SplitButton)
- §35 Ribbon — 단일 패널 (MD 에디터 케이스)

---

## [0.4.1] — 2026-05-04

코덱스 리뷰 후속 패치. v0.4.0의 4건 이슈 수정.

### 수정됨 — Form을 subpath export로 분리 (P1)

`react-hook-form`이 optional peerDep인데도 v0.4.0의 root barrel이 `Form` 컴포넌트를 re-export해서, RHF 없이 `import { Button } from '@polaris/ui'`만 해도 dist 로드 시점에 `require('react-hook-form')`이 실행됐습니다.

수정: Form/FormField 시리즈를 **`@polaris/ui/form`** subpath로 분리. 루트 bundle은 RHF 의존 0건 (`grep` 검증).

```ts
// 기존 (v0.4.0)
import { Form, FormField } from '@polaris/ui';  // ❌ RHF 미설치 시 import 실패

// 신규 (v0.4.1+)
import { Form, FormField } from '@polaris/ui/form';  // ✓
```

### 수정됨 — DropdownMenuFormItem 키보드 submit 누락 (P1)

이전엔 `onSelect`에서 `e.preventDefault()`만 호출하고 inner button의 native click에 의존했습니다. 포인터로는 동작했지만 **Radix menuitem에 포커스가 있는 상태에서 Enter/Space로 선택하면 submit이 누락**될 수 있었습니다.

수정: `formRef`를 잡고 `onSelect`에서 `formRef.current?.requestSubmit()`을 명시적으로 호출. 포인터와 키보드 모두 동일 경로로 submit. 회귀 테스트 3건 추가 (DropdownMenu.test.tsx).

### 수정됨 — CommandDialog props가 UI에 연결되지 않던 문제 (P3)

`placeholder`/`emptyLabel` props가 사용되지 않은 채 API에만 노출돼 있었습니다. 자동 렌더링하는 길도 있었지만 cmdk의 합성 패턴(input/list/group을 children으로 두는)을 깨뜨립니다 — props 자체를 제거하고 children 합성 방식으로 통일. 사용자는 `<CommandInput placeholder="..." />`, `<CommandEmpty>`을 직접 자식으로 둠.

### 수정됨 — Codex/Cursor 에이전트 지침 갱신 (P2)

`AGENTS.md` (루트 + template-next)의 import 예시가 18개 컴포넌트로 고정돼 있어 Codex가 v0.3+ 컴포넌트(Table, Drawer, Form, DatePicker, Command 등)를 피하거나 불필요하게 질문하던 문제. 36개 기준으로 갱신 + Form은 subpath import 안내.

### 수정됨 — nextjs-app-router.md Form 섹션 (P3)

v0.4 시점에서 이미 `Form`/`FormField` 컴포넌트가 추가됐는데, 이 문서는 여전히 "추가 예정, 현재는 수동 RHF 패턴"이라고 안내했습니다. 새 컴포넌트 사용법으로 재작성. `recipes.md`와 표준 일치.

### 추가됨 — 회귀 테스트

`DropdownMenu.test.tsx` — 키보드/포인터 submit pathway + hiddenFields 렌더링 검증. 총 21 vitest tests (이전 18).

---

## [0.4.0] — 2026-05-04

두 번째 사내 마이그레이션 사이클(Next.js 16 + Tailwind v4)에서 받은 후속 피드백 + 0.2부터 약속된 v4 preset을 한 번에 정리한 릴리스. **Tailwind v4 native preset**, **Form/FormField (RHF + zod)**, 그리고 experimental 컴포넌트 2종(Calendar/DatePicker, CommandPalette).

### 추가됨 — Tailwind v4 native preset (`@polaris/ui/styles/v4-theme.css`)

0.2부터 약속된 v4 직접 지원. `@theme inline { ... }` 매핑을 사용자 측에서 50+줄 직접 작성하던 부담을 한 import로 대체:

```css
@import 'tailwindcss';
@import '@polaris/ui/styles/tokens.css';
@import '@polaris/ui/styles/v4-theme.css';
```

v3 preset과 **동일한 클래스명**(`bg-brand-primary`, `text-fg-primary`, `rounded-polaris-md`, `text-polaris-body-sm` 등)이 v4에서도 그대로 작동. v3와 v4 매핑이 같은 CSS 변수 이름을 참조하므로 토큰 추가 시 양쪽이 함께 갱신됩니다.

### 추가됨 — Form/FormField (`@polaris/ui`)

shadcn 패턴 기반 `react-hook-form` + `zod` 어댑터. 사내 폼 wiring 표준:

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>이메일</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormDescription>로그인용 주소</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">제출</Button>
  </form>
</Form>
```

자동: `htmlFor` wiring, error 시 label 색 전환, `aria-invalid`/`aria-describedby` 연결, `<FormMessage />`가 RHF `errors` 직접 읽음.

### 추가됨 — Calendar / DatePicker / DateRangePicker (`@polaris/ui`, **experimental**)

`react-day-picker` v9 기반. 한국어 로케일(`date-fns/locale/ko`) 기본. `<Calendar mode="single|range">`, `<DatePicker>`, `<DateRangePicker>`. **API는 v0.5에서 변경될 수 있음** — 사용자 피드백 기반.

### 추가됨 — CommandPalette (`@polaris/ui`, **experimental**)

`cmdk` 기반 Ctrl+K 검색 팔레트. `<CommandDialog>`, `<CommandInput>`, `<CommandList>`, `<CommandGroup>`, `<CommandItem>`, `<CommandShortcut>`, `<CommandEmpty>`, `<CommandSeparator>`. **API는 v0.5에서 변경될 수 있음**.

### 추가됨 — Popover (`@polaris/ui`)

Radix Popover 래퍼. `<Popover>`, `<PopoverTrigger>`, `<PopoverContent>`, `<PopoverAnchor>`, `<PopoverClose>`. DatePicker 내부에서 사용되며, 일반 popover 용도로도 export.

### 변경됨 — DropdownMenuFormItem `hiddenFields` prop

CSRF token, `redirect_to` 같은 hidden input 추가:

```tsx
<DropdownMenuFormItem
  action="/auth/sign-out"
  hiddenFields={{ redirect: '/login' }}
  destructive
>로그아웃</DropdownMenuFormItem>
```

### 변경됨 — `<ToastViewport>` `position` prop

`top-right` (default) / `top-left` / `top-center` / `bottom-right` / `bottom-left` / `bottom-center`.

### 변경됨 — NavbarBrand `asChild`

`<NavbarBrand asChild><Link href="/">Polaris</Link></NavbarBrand>` — div + a 중첩 제거.

### 추가됨 — Pagination 보조

- `pageNumberItems(current, total, siblings?)` — `[1, '…', 5, 6, 7, '…', 20]` 같은 ellipsis 시퀀스 계산 유틸리티
- `PAGE_ELLIPSIS` sentinel
- `PaginationPrev`/`PaginationNext`에 `label` prop (aria-label override)

### 변경됨 — DescriptionList `inline` 반응형

`layout="inline"` (기본)이 `sm` 미만에서 자동으로 stack. 좁은 viewport에서 label 컬럼 squeeze 방지. 명시적 grid가 필요하면 `layout="inline-strict"` 사용.

### 추가됨 — 문서

- **patterns.md**에 §6 Drawer vs Dialog, §7 asChild 가능 컴포넌트 표 추가
- **app-shell-layout.md** — Sidebar + Navbar 표준 레이아웃 패턴 + 모바일 대응 + 다크 토글 + CommandPalette 통합
- **tailwind-v4-migration.md** 전면 갱신 — 새 v4-theme.css 사용법 (manual @theme inline 작성 제거)
- **recipes.md §1 Form** — RHF + Form/FormField 컴포넌트 패턴으로 갱신

### 의존성 추가

- `@radix-ui/react-popover@^1.1.4` (Popover, DatePicker)
- `cmdk@^1.0.4` (CommandPalette)
- `date-fns@^4.1.0` (Calendar 한국어 로케일)
- `react-day-picker@^9.4.4` (Calendar)
- `react-hook-form@^7.50.0` peerDep (Form/FormField, optional)

### 데모

- §31 DatePicker / DateRangePicker
- §32 CommandPalette (⌘K)
- §33 Form (RHF + zod)
- §34로 폴라리스 화면 모방 이동

---

## [0.3.0] — 2026-05-04

첫 사내 마이그레이션 사이클(Next.js 16 + Tailwind v4)에서 받은 후속 피드백을 반영. Tier 2.5 layout/structural 컴포넌트 + Pagination asChild + Form-aware DropdownMenu + 4건의 docs.

### 추가됨 — Tier 2.5 컴포넌트 5개 (`@polaris/ui` → 30개)

- **Stack / HStack / VStack** — `flex flex-col gap-N` 반복 패턴 제거. `direction`, `gap`, `align`, `justify`, `wrap`, `asChild` props
- **Container** — `max-w-screen-N mx-auto px 반응형` 패턴 컴포넌트화. `size: sm/md/lg/xl/2xl/full`
- **Drawer / DrawerHeader / DrawerBody / DrawerFooter / DrawerTitle / DrawerDescription** — Radix Dialog 기반 side-anchored 패널. `side: right (default) / left / top / bottom`. table-row inspector, filter side panel, mobile nav drawer 용
- **Table / TableHeader / TableBody / TableFooter / TableRow / TableHead / TableCell / TableCaption** — semantic `<table>` primitive + `density: compact/comfortable/relaxed` 축. context로 cell까지 전파
- **DescriptionList / DescriptionTerm / DescriptionDetails** — semantic `<dl>`. `layout: inline (grid 2-col) / stacked`. 고객/계약 상세 패널 용

### 추가됨 — DropdownMenuFormItem (`@polaris/ui`)

DropdownMenu 안에서 server action을 form submit으로 트리거하는 패턴 — Radix의 close behavior가 form unmount보다 먼저 일어나는 race condition을 컴포넌트로 추상화.

```tsx
<DropdownMenuFormItem action={signOut} destructive icon={<LogOut />}>
  로그아웃
</DropdownMenuFormItem>
```

### 변경됨 — Pagination asChild

`PaginationItem`/`PaginationPrev`/`PaginationNext`에 `asChild` prop 추가. URL-driven pagination에서 `<Link href={...}>`로 wrap 가능 → Next.js App Router의 RSC + 브라우저 history와 자연스럽게 통합.

```tsx
<PaginationItem asChild active={n === current}>
  <Link href={`?page=${n}`}>{n}</Link>
</PaginationItem>
```

### 변경됨 — Checkbox `label` / `hint` / `error` props

기존엔 외부 `<label>`로 wrap이 강제됐던 것을 `<Checkbox label="이용 약관에 동의" hint="..." error="..." />`로 통일. Input과 동일한 a11y wiring (`htmlFor`, `aria-describedby`, `aria-invalid`).

### 변경됨 — Card `variant` prop

`variant: 'bare' (default) | 'padded'`. `<Card variant="padded">`이 자동으로 `px-5 py-4` 적용 → CardBody 없이 단순 카드를 한 줄로 작성. 기본값이 `bare`라 기존 코드 호환성 유지.

### 변경됨 — EmptyState 기본 아이콘

`icon` 미지정 시 `<Inbox />` default. `icon={null}`로 명시적 비활성 가능.

### 추가됨 — 문서 5건 (`docs/`)

- **variant-axes.md** — 4가지 variant 의미 축(status/emphasis/brand/domain) 명문화. "통일하지 않는다" 결정 + 각 컴포넌트별 축 매핑
- **patterns.md** — Toast vs Alert / border vs border-strong / opacity modifier 5가지 헷갈리는 패턴
- **nextjs-app-router.md** — RSC + Server Actions + Suspense fallback + URL pagination + Drawer inspector + 알려진 한계
- **migration-checklist.md** — 기존 프로젝트 단계별 마이그레이션 (M0~M7), `polaris-audit` baseline 측정 포함
- **recipes.md** — 5개 레시피: Form (RHF + zod, 사내 표준), Confirm Dialog, Stat Card, Table+Drawer Inspector, UserMenu+server action signOut

### 데모

- 컴포넌트 카탈로그에 §25-§30 추가 (Stack, Container, Table, Drawer 4-side, DescriptionList 2-layout, EmptyState 기본 아이콘)
- 30개 컴포넌트로 카운트 갱신

---

## [0.2.1] — 2026-05-04

### 수정됨 — focus 링 시각 비대칭

`bg-surface-raised` 부모(예: Navbar) 위에 놓인 버튼/컴포넌트에서 focus 링이 좌/상/하는 얇고 우/모서리만 두꺼워 보이던 문제 수정.

원인: `focus-visible:ring-offset-2 ring-offset-surface-canvas` 패턴의 box-shadow gap이 `surface-canvas` 색으로 칠해지면서 부모의 `surface-raised` 배경과 색 차이가 발생. 라운드 코너에서는 gap 노출 면적이 더 커서 더 도드라짐.

수정: `ring + ring-offset` (box-shadow 스택) → 네이티브 `outline + outline-offset`. gap이 투명이라 부모 배경 색과 자동으로 맞고, `border-radius`를 정확히 따라가 모든 면이 균일.

영향 컴포넌트: Button, Pagination, Switch, Checkbox, NovaInput, PromptChip.

브라우저 지원: Chrome 94+, Firefox 88+, Safari 16.4+ (모던 outline + border-radius). 그보다 구버전에서는 outline이 사각형으로 그려지지만 기능엔 문제 없음.

---

## [0.2.0] — 2026-05-04

첫 사내 마이그레이션(Next.js 16 + Tailwind v4 기존 프로젝트)에서 받은 피드백을 반영한 패치 릴리스. 컴포넌트 7개 추가, lint 룰 false-positive 보정, SSR 호환 패턴 정비.

### 추가됨 — Tier 2 컴포넌트 7개 (`@polaris/ui` → 18개에서 25개)

- **Checkbox** — Radix Checkbox 기반, `checked='indeterminate'` 지원
- **Switch** — Radix Switch 기반, on/off 24px 트랙
- **Skeleton** — `animate-pulse` placeholder, prop 없이 className만으로 사용
- **Alert / AlertTitle / AlertDescription** — info/success/warning/danger/neutral 5종, leading icon 자동
- **Pagination / PaginationItem / PaginationPrev / PaginationNext / PaginationEllipsis** — 페이지 번호 + prev/next + ellipsis
- **Breadcrumb / BreadcrumbList / BreadcrumbItem / BreadcrumbLink / BreadcrumbPage / BreadcrumbSeparator** — `asChild`로 라우터 Link wrap 가능
- **EmptyState** — icon + title + description + action 슬롯

### 추가됨 — Toast imperative API (`@polaris/ui`)

기존 `<Toast>` primitive에 더해 shadcn 패턴의 `useToast()` 훅 + `toast()` 함수 + `<Toaster />` 컴포넌트 export. 호출처에서 stack을 직접 관리할 필요 없음:

```tsx
<ToastProvider><App /><Toaster /><ToastViewport /></ToastProvider>
// 어디서든
toast({ title: '저장됨', variant: 'success' });
```

### 추가됨 — Card `asChild` (`@polaris/ui`)

`<Card asChild><section>...</section></Card>` — Button·DropdownMenuTrigger·SidebarItem과 동일한 Slot 패턴.

### 추가됨 — 색상 토큰

- `status.{success,warning,danger,info}.hover` — solid 액션 버튼 hover 색
- `text.onStatus` (Tailwind: `text-fg-on-status`) — solid 상태 배경 위 텍스트 색

### 추가됨 — 문서

- `docs/for-contributors/architecture/tailwind-v4.md` — Tailwind v4 (`@theme inline`) 매핑 가이드. v0.3에서 v4-네이티브 preset 추가 전까지의 임시 안내.

### 변경됨 — `@polaris/lint`

- `no-arbitrary-tailwind` — `grid-cols-[1fr_180px_120px]` 같은 layout utility 화이트리스트. 토큰화 불가능한 layout 표현은 허용.
- `prefer-polaris-component` — 새 옵션 `allowFormSubmit` (default `true`). `<button type="submit">`/`<button type="reset">`은 form-control 패턴이므로 native 사용 허용.

### 변경됨 — `packages/template-next`

- `ThemeToggle` SSR 안전 재작성. `useState` + `useEffect` 제거, DOM(`html[data-theme]`) + 쿠키를 source of truth로. React 19의 `react-hooks/set-state-in-effect` 경고 제거 + 첫 페인트부터 올바른 테마.
- `app/layout.tsx`가 `cookies()`로 `polaris-theme` 쿠키를 읽어 `<html data-theme>`을 SSR 시점에 결정.

### 의존성 추가 — `@polaris/ui`

- `@radix-ui/react-checkbox@^1.1.3`
- `@radix-ui/react-switch@^1.1.2`

---

## [0.1.0] — 2026-05-04

사내 공개 alpha. 폴라리스오피스의 바이브코딩옵스에서 만들어지는 React/Next.js 웹 서비스가 **토큰·컴포넌트·린트·플러그인 한 묶음**으로 회사 단위 일관성을 자동 유지하도록 한다는 가설을 처음 외부 검증에 내놓는 버전. v0.0.x는 내부 실험이었고, 0.1.0부터 SemVer 약속이 시작됩니다.

### 추가됨 — `@polaris/ui` (디자인 시스템 자산)

**토큰 시스템**
- 브랜드 4색 팔레트 (파랑·초록·주황·빨강) + NOVA 보라 — 폴라리스 로고가 그대로 토큰
- 단일 소스 별칭: `brand.primary` ≡ `file.docx` ≡ `file.hwp` (한 곳 변경 → 자동 전파)
- 라이트/다크 페어 (수동 자동 반전 아님 — 명시적 페어로 정의)
- 12단계 뉴트럴 스케일, 7단계 타이포 스케일, 5단계 반경, 4단계 그림자
- 시맨틱 상태 토큰 (success/warning/danger/info)
- TypeScript export, CSS 변수, Tailwind preset 세 형태로 동시 노출

**컴포넌트 18개** (Radix UI 위에 폴라리스 토큰으로 스타일링)
- **Tier 0 (12개)** — Button, Input, Textarea, Card, Badge, Avatar, Dialog, Toast, Tabs, FileIcon, FileCard, NovaInput
- **Tier 1 (6개)** — DropdownMenu, Tooltip, Select, Sidebar, Navbar, PromptChip
- ⭐ 폴라리스 고유: FileIcon, FileCard, NovaInput, PromptChip
- Next.js RSC 호환을 위한 `'use client'` 디렉티브 자동 prepend
- Tailwind alpha 모디파이어(`bg-status-success/15`) 지원 — `color-mix()` 기반
- Badge에 `tone="subtle" | "solid"` 분리 — 사진/busy 배경 위 가독성

### 추가됨 — `@polaris/lint` (자동 검증)

ESLint 9 flat config 플러그인. 4가지 룰로 모델의 토큰 우회를 차단:
- `no-hardcoded-color` — hex / rgb / hsl / CSS named color (inline style)
- `no-arbitrary-tailwind` — `bg-[#xxx]`, `p-[13px]`, `font-['Inter']` 등
- `no-direct-font-family` — `font-family: ...` 직접 지정
- `prefer-polaris-component` — native `<button>/<input>/<textarea>/<select>/<dialog>`

**`polaris-audit` CLI** — `npx polaris-audit`로 기존 프로젝트의 비준수율 정량 측정. 위반 카운트, 룰별 분포, 자주 등장 hex / 임의값 top 10, 위반 많은 파일 top 10.

### 추가됨 — `polaris-design` (Claude Code 플러그인)

- **`polaris-web` 스킬** — 폴라리스 웹 서비스 작성 시 절차적 강제
- **4개 슬래시 커맨드**:
  - `/polaris-init <name>` — 새 프로젝트 부트스트랩
  - `/polaris-migrate` — 기존 코드 점진적 마이그레이션
  - `/polaris-check` — 현재 lint 검증
  - `/polaris-component <이름>` — 컴포넌트 사용/추가 가이드
- **PostToolUse 훅** — Edit/Write 발생 시 자동 lint, 위반 시 다음 턴 컨텍스트에 수정 가이드 주입. ESLint 미설정 프로젝트에는 1시간당 1회 안내.

### 추가됨 — 시작점 + 에이전트 호환

- **`packages/template-next`** — Next.js 15 (App Router) + 폴라리스 사전 통합 템플릿. ToastProvider/TooltipProvider/다크 토글/Pretendard 모두 wired. `AGENTS.md`가 함께 들어 있어 클론 후에도 에이전트 규칙 유지.
- **`AGENTS.md` (루트 + 템플릿)** — Codex / Cursor / 기타 비-Claude 에이전트용 절차. SKILL.md와 동일 규칙을 텍스트 가이드로.

### 추가됨 — 데모 + 카탈로그

GitHub Pages에 자동 배포 (https://polarisoffice.github.io/PolarisDesign/):
- **앱 셸** — 좌측 Sidebar + 상단 Navbar (DropdownMenu 사용자 메뉴 포함)
- **4개 라우트**: Home, NOVA 워크스페이스, CRM 계약 상세, Sign 계약서 목록
- **NOVA 워크스페이스** — 코스믹 그라데이션 hero + NovaInput + Select·Tooltip + 8개 폴라리스 기능 카드(실제 마케팅 이미지) + DropdownMenu별 응답
- **컴포넌트 카탈로그** — 18개 컴포넌트의 모든 variant·상태·조합
- **`/swatches.html`** — Phase 1 디자인 토큰 시각 시트
- **`/storybook/`** — Storybook 8 + 5개 핵심 스토리

### 추가됨 — 인프라

- **`.github/workflows/ci.yml`** — push/PR 시 모든 패키지·앱·템플릿의 lint·typecheck·test·build 자동 실행
- **`.github/workflows/deploy.yml`** — main push 시 데모 + Storybook을 결합해 GitHub Pages로 자동 배포
- **80개 테스트** 통과: `@polaris/ui` 21 (vitest 18 + node:test 3), `@polaris/lint` 42 (RuleTester), `@polaris/plugin` 17 (훅 smoke)
- **이미지 최적화 스크립트** — `pnpm --filter demo optimize-images` (sharp, 4.06 MB → 843 KB, 80% 감소)

### 핵심 결정

- **단일 소스 원칙** — 같은 색의 두 시맨틱이면 한쪽이 다른 쪽의 별칭 (참조 동일성)
- **`fg` namespace** — Tailwind class `text-fg-primary` (TS API는 `text.primary` 유지)
- **shadcn/ui 패턴 차용** — Radix primitives 위에 Tailwind + 토큰
- **`'use client'` banner** — 18개 컴포넌트 dist 전체에 일괄 적용

### 알려진 한계 (v0.1.0 시점)

- 🟡 **사내 npm 레지스트리 미결정** — 외부 클론(`npx tiged`) 후 `pnpm install`이 실패. 모노레포 내부에서만 즉시 동작.
- 🟡 **tokens.md hex 값 사인오프 대기** — 메인 사이트 추정값 사용 중 (`brand.blue: #2B7FFF` 등). 디자인 리드 확정 시 v0.1.x에서 교체.
- 🟡 **Pretendard 라이선스 사내 승인 대기** — SIL OFL 1.1, CDN 사용 중.
- ⚪ **Tier 2 컴포넌트 없음** — Table, Pagination, Breadcrumb 등 추후.
- ⚪ **시각 회귀 테스트 없음** — Playwright/Chromatic 미통합.
- ⚪ **파일럿 baseline 측정 미실시** — v0.1.x에서 신규 vs 기존 위반율 비교 예정.

---

[Unreleased]: https://github.com/PolarisOffice/PolarisDesign/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/PolarisOffice/PolarisDesign/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/PolarisOffice/PolarisDesign/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/PolarisOffice/PolarisDesign/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/PolarisOffice/PolarisDesign/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/PolarisOffice/PolarisDesign/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/PolarisOffice/PolarisDesign/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/PolarisOffice/PolarisDesign/releases/tag/v0.1.0
