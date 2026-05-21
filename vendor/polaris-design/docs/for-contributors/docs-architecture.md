# 문서 아키텍처 (Single Source of Truth)

**Last updated**: 2026-05-11 · **Status**: 이행 중 (Phase 1~4)

폴라리스 디자인 시스템의 문서가 30+ 파일로 자라면서 같은 정보가 5~8군데에 ad-hoc 복제되어 drift 가 발생하던 상태를 정리. 이 문서는 *왜 / 무엇이 / 어떻게* 의 청사진.

---

## 1. 진단 — 산재 측정

작업 시작 시점(v0.8.0-rc.8) 의 중복 현황:

| 같은 정보 | 위치 (개) | 결과 |
|---|---|---|
| "v0.8에서 alias 제거됨" 안내 | **8** (CHANGELOG, README, AGENTS×2, packages/ui/README, SKILL.md, polaris-component.md, polaris-check.md, post-edit-lint.mjs) | 매 rc 마다 한 곳만 갱신, 나머지 stale |
| `polaris-codemod-v08 --apply src` 명령 | 8 (같은 곳) | 동일 |
| 시각 자산 9가지 (NOVA/FileIcon/Ribbon 등) | **3** (getting-started-prompt, SKILL, AGENTS) | 컨슈머가 "어디 있는지 모름" 의 원인 |
| 토큰 import 예시 | **6** (README, ui/README, AGENTS, SKILL, design-team-followup, DESIGN) | 어휘가 미세하게 다름 |
| 컴포넌트 카탈로그 (Tier 0~3.8) | **6** (ui/README, AGENTS×2, SKILL, polaris-component, component-history) | 새 컴포넌트 추가 시 6곳 갱신 누락 |
| Subpath imports 안내 | **5** (README, ui/README, AGENTS, SKILL, rsc-patterns) | rc.8 신규 utils 추가 시 5곳 갱신 |
| Button variant spec | **5** (DESIGN, ui/README, AGENTS, SKILL, polaris-component) | DESIGN 만 auto-gen, 나머지 수동 |

→ **30 파일 × 평균 5중복 = 일관성 유지가 사실상 불가능**.

KCAS-platform 컨슈머의 "CHANGELOG 부재 / 가이드 부재 / 버전 핀 불가" 피드백이 *모두 사실은 있는데 어디 있는지 몰랐던* 케이스였음을 보면, 산재 문제는 컨슈머 신뢰까지 흔드는 단계.

---

## 2. 원칙

### 2-1. One canonical location per concept

각 정보는 **한 곳에서만** 정의. 다른 곳은 *링크 + 한 줄 요약* 만 둠. 한 줄 요약이 stale 되더라도 본문은 SSoT 한 곳에서 권위 유지.

예 — v0.8 alias 제거 안내:
- **SSoT**: `docs/for-consumers/migration/v0.7-to-v0.8.md`
- 다른 위치 (CHANGELOG / AGENTS / SKILL 등): 한 줄 + 링크
  ```
  v0.6/rc.0/v0.7 alias는 v0.8에서 제거됨 — 마이그 가이드 →
  [docs/for-consumers/migration/v0.7-to-v0.8.md](../for-consumers/migration/v0.7-to-v0.8.md)
  ```

### 2-2. Audience-first hierarchy

청중에 따라 디렉토리 분리. 한 청중은 한 디렉토리만 보면 됨:

| 청중 | 디렉토리 | 1-line 요약 |
|---|---|---|
| **AI 에이전트** (build-time) | `AGENTS.md` (root) | vibe-coding 작성 중 모델이 첫 컨텍스트로 읽음 |
| **AI 에이전트** (runtime) | `packages/plugin/skills/polaris-web/SKILL.md` | PostToolUse 훅 / 슬래시 명령 시 동적 fetch |
| **신규 컨슈머** | `docs/for-consumers/` | install + getting-started + migration + use-cases |
| **기여자 / 폴라리스 팀** | `docs/for-contributors/` | roadmap + release + 검수 + 아키텍처 |
| **디자인팀** | `docs/for-design-team/` | 정합 표 + 결정 필요 항목 |
| **모두 공유** | `DESIGN.md`, `CHANGELOG.md`, `README.md` (root) | spec / history / elevator pitch |

### 2-3. Auto-generated wherever possible

빌드 시점에 자동 생성되면 SSoT 한 곳 (코드) 만 유지해도 다른 위치가 자동 따라옴. 이미 운영 중인 auto-gen:

- `DESIGN.md` ← 토큰 객체 (`pnpm build:design-md`)
- `tokens.css` ← `colors.ts` / `radius.ts` / etc. (`pnpm build:tokens`)
- Icon source files ← SVG (`pnpm build:icons` / `build:file-icons` / `build:logos` / `build:ribbon-icons`)

**Phase 4 에서 확장**:
- `packages/ui/README.md` 컴포넌트 카탈로그 ← `src/index.ts` exports + JSDoc `@tier` annotation
- `docs/for-contributors/component-history.md` ← 각 component 의 JSDoc `@since` annotation 파싱
- `packages/lint/README.md` 룰 목록 ← `src/rules/*.ts` 의 `meta.docs.description`
- `packages/plugin/commands/README.md` 인덱스 ← `commands/*.md` 의 frontmatter

### 2-4. CI-enforced link / drift detection

Phase 4 에 추가:
- `markdown-link-check` (internal link 깨짐 검증)
- `duplicate-content` detector — 80자 이상 시퀀스가 N개 이상 등장 시 경고
- SSoT freshness — CHANGELOG 가 새 commit인데 README "current rc" 가 안 바뀌면 에러

### 2-5. Versioned ↔ current 명확 분리

- `CHANGELOG.md` = historical (어떤 rc 가 무엇을 했나 — 절대 갱신 안 함)
- `docs/for-consumers/migration/v0.7-to-v0.8.md` = version-pair migration guide (v0.7 → v0.8 한 번 동결 후 안 갱신)
- `docs/for-consumers/getting-started.md` = current (매 rc 마다 갱신)
- `docs/for-contributors/roadmap.md` = future (매 rc 마다 갱신, completed 항목은 ✓ 표시)

각 문서 헤더에 *역할* 한 줄 명시 (예: `> 이 문서는 historical 입니다. 갱신하지 마세요.`).

---

## 3. 새 디렉토리 구조

```
PolarisDesign/
├── README.md                          ← 1-page elevator pitch + 청중별 진입점 링크
├── DESIGN.md                          ← 토큰 + 컴포넌트 spec (auto-gen, SSoT)
├── CHANGELOG.md                       ← release narrative (historical, SSoT)
├── AGENTS.md                          ← AI 에이전트 build-time (SSoT)
├── tokens.md                          ← (검토 후 archive 또는 DESIGN.md로 통합)
├── docs/
│   ├── README.md                      ← 문서 지도 (사이드맵 + 어느 청중이 어디로)
│   ├── for-consumers/                 ← 청중 B/C
│   │   ├── README.md                  ← 진입점 (시작 / 마이그 / use case 선택)
│   │   ├── getting-started.md         ← 첫 도입 1-page (시각 자산 9가지 SSoT)
│   │   ├── install.md                 ← tarball + Renovate + GH Action 셋업
│   │   ├── migration/
│   │   │   ├── README.md              ← 결정 트리 (어디서 어디로 / RSC?)
│   │   │   ├── v0.6-to-v0.7.md
│   │   │   ├── v0.7-to-v0.8.md        ← BREAKING 마이그 SSoT
│   │   │   ├── visual-diff.md
│   │   │   ├── legacy-css-patterns.md
│   │   │   └── rsc-patterns.md
│   │   ├── component-use-cases/
│   │   │   ├── README.md              ← 인덱스
│   │   │   ├── badge.md
│   │   │   ├── token-label.md         ← KCAS A-3 후속 (예정)
│   │   │   ├── token-state.md         ← KCAS G-3 후속 (예정)
│   │   │   └── ...
│   │   ├── icon-mixing-guide.md       ← KCAS E-2 후속 (예정)
│   │   ├── responsive-guide.md        ← KCAS G-7 후속 (예정)
│   │   └── a11y-checklist.md          ← KCAS G-4 후속 (예정)
│   ├── for-contributors/              ← 청중 D
│   │   ├── README.md                  ← 진입점
│   │   ├── roadmap.md
│   │   ├── release-process.md         ← 신규 (예정)
│   │   ├── component-history.md       ← auto-gen 후보
│   │   ├── variant-axes.md
│   │   ├── docs-architecture.md       ← (이 문서)
│   │   └── architecture/              ← 깊은 기술 (소수)
│   │       ├── tailwind-v4.md
│   │       ├── nextjs-app-router.md
│   │       └── app-shell-layout.md
│   ├── for-design-team/               ← 청중 E
│   │   ├── README.md
│   │   └── followup.md                ← (was design-team-followup.md)
│   └── archive/                       ← 더 이상 유지 안 함 (참고용)
│       ├── design-assets-v07.md
│       ├── migration-checklist.md     ← v0.7-to-v0.8.md 가 대체
│       ├── patterns.md                ← recipes 와 중복, component-use-cases 가 대체
│       └── recipes.md                 ← component-use-cases 가 대체
└── packages/
    ├── ui/README.md                   ← 컴포넌트 카탈로그 (Phase 4-a auto-gen)
    ├── lint/README.md                 ← lint 룰 (Phase 4-c auto-gen)
    └── plugin/
        ├── README.md                  ← plugin 설치 + 슬래시 명령 인덱스
        ├── commands/
        │   ├── README.md              ← (Phase 4 auto-gen 후보)
        │   └── *.md
        └── skills/polaris-web/SKILL.md
```

---

## 4. 중복 제거 매핑 — SSoT 한 곳, 나머지는 링크

| 정보 | SSoT 위치 | 다른 위치 처리 |
|---|---|---|
| v0.8 alias 제거 안내 | `docs/for-consumers/migration/v0.7-to-v0.8.md` | CHANGELOG / AGENTS / SKILL / polaris-check / polaris-component / post-edit-lint.mjs — 한 줄 + 링크 |
| codemod-v08 명령 | 위와 같음 | 위와 같음 |
| 시각 자산 9가지 | `docs/for-consumers/getting-started.md` | AGENTS / SKILL — 한 줄 + 링크 |
| 토큰 import 예시 | `DESIGN.md §2` (auto-gen) + `docs/for-consumers/getting-started.md` (한 예시) | 나머지는 링크만 |
| 컴포넌트 카탈로그 | `packages/ui/README.md` (Phase 4-a 후 auto-gen) | AGENTS / SKILL — 컴포넌트 수 명시 + 링크 |
| Subpath imports | `packages/ui/README.md` + `docs/for-consumers/install.md` | 나머지는 링크 |
| Button variant spec | `DESIGN.md §4` (auto-gen) | 다른 곳은 링크 |
| lint 룰 목록 | `packages/lint/README.md` (Phase 4-c auto-gen) | post-edit-lint.mjs / polaris-check / SKILL — 룰 수 명시 + 링크 |
| 슬래시 명령 인덱스 | `packages/plugin/commands/README.md` (Phase 4 auto-gen 후보) | SKILL / README — 링크 |

---

## 5. 마이그레이션 절차 — 4 phase

### Phase 1 — 디렉토리 + 기존 파일 mv (1일)

`git mv` 로 파일을 새 위치로 옮김 + breadcrumb commit 메시지에 매핑 표 포함. 외부 깨짐 위험 있는 link 는 GitHub Search 로 찾을 수 있어 OK.

이동 매핑:
```
docs/for-consumers/getting-started.md         → docs/for-consumers/getting-started.md
docs/for-consumers/install.md        → docs/for-consumers/install.md
docs/for-consumers/migration/v0.6-to-v0.7.md         → docs/for-consumers/migration/v0.6-to-v0.7.md
docs/for-consumers/migration/v0.7-to-v0.8.md         → docs/for-consumers/migration/v0.7-to-v0.8.md
docs/for-consumers/migration/visual-diff.md → docs/for-consumers/migration/visual-diff.md
docs/for-consumers/migration/legacy-css-patterns.md  → docs/for-consumers/migration/legacy-css-patterns.md
docs/for-consumers/migration/rsc-patterns.md         → docs/for-consumers/migration/rsc-patterns.md
docs/for-consumers/component-use-cases/              → docs/for-consumers/component-use-cases/

docs/for-contributors/roadmap.md                        → docs/for-contributors/roadmap.md
docs/for-contributors/component-history.md              → docs/for-contributors/component-history.md
docs/for-contributors/variant-axes.md                   → docs/for-contributors/variant-axes.md
docs/for-contributors/architecture/tailwind-v4.md          → docs/for-contributors/architecture/tailwind-v4.md
docs/for-contributors/architecture/nextjs-app-router.md              → docs/for-contributors/architecture/nextjs-app-router.md
docs/for-contributors/architecture/app-shell-layout.md               → docs/for-contributors/architecture/app-shell-layout.md

docs/for-design-team/followup.md           → docs/for-design-team/followup.md

docs/archive/design-assets-v07.md              → docs/archive/design-assets-v07.md
docs/archive/migration-checklist.md            → docs/archive/migration-checklist.md
docs/archive/patterns.md                       → docs/archive/patterns.md
docs/archive/recipes.md                        → docs/archive/recipes.md
```

`docs/for-consumers/getting-started.md` → `getting-started.md` 이름 단순화 (prompt suffix 는 의미 없음, getting-started 가 직관적).

### Phase 2 — 진입점 README 작성 (2~3일)

청중별 진입점 6개:
- `docs/README.md` — 문서 지도
- `docs/for-consumers/README.md` — 컨슈머 진입
- `docs/for-consumers/migration/README.md` — 마이그 결정 트리
- `docs/for-consumers/component-use-cases/README.md` — use case 인덱스
- `docs/for-contributors/README.md` — 기여자 진입
- `docs/for-design-team/README.md` — 디자인팀 진입

### Phase 3 — 중복 제거 (4~5일)

§4 매핑 표대로 SSoT 한 곳 남기고 나머지를 *링크로* 교체. PR 단위:
- PR 1: v0.8 alias 안내 (8 → 1) + 모두 링크로
- PR 2: 시각 자산 9가지 (3 → 1)
- PR 3: 토큰 import 예시 (6 → 1)
- PR 4: 컴포넌트 카탈로그 (6 → 1)
- PR 5: Subpath imports (5 → 1)
- PR 6: Button variant spec (5 → 1)
- PR 7: lint 룰 목록 (4 → 1)

각 PR 후 CI link-check 통과 확인.

### Phase 4 — Auto-gen 확장 + CI (5~7일)

- 4-a: `scripts/build-component-catalog.ts` — `packages/ui/src/index.ts` exports + JSDoc 파싱
- 4-b: `scripts/build-component-history.ts` — JSDoc `@since` 파싱
- 4-c: `scripts/build-lint-readme.ts` — `packages/lint/src/rules/*.ts` 의 meta 파싱
- 4-d: `.github/workflows/docs.yml` — link-check + duplicate-detector + SSoT freshness

각 generator 는 `pnpm verify` 의 새 step 으로 통합 — drift 가 0인지 매 commit 검증.

---

## 6. 성공 지표

작업 끝난 후 다음이 *측정 가능* 해야 함:

- [ ] 같은 정보 (예: codemod-v08 명령) 의 출현 횟수 = **1 + 링크 N** (현재 8)
- [ ] 신규 컨슈머가 *어느 docs* 부터 읽어야 하는지 1초 안에 결정 가능 (현재: 30 파일 중 추측)
- [ ] 새 컴포넌트 추가 시 *수동* 갱신 파일 수 ≤ 2 (현재 6)
- [ ] CI `markdown-link-check` 통과 — 모든 internal link 유효
- [ ] CI `duplicate-content` 통과 — 80자 시퀀스 5+ 중복 0건
- [ ] 신규 컨슈머가 "X가 어디 있는지 모르겠다" 피드백 = 0 (KCAS 의 A-1 / A-2 같은 케이스 0)

---

## 7. 책임 분담 (after this PR set)

| 영역 | 갱신 주기 | 책임 |
|---|---|---|
| `DESIGN.md` | auto-gen | 토큰 변경 시 자동 |
| `CHANGELOG.md` | 매 rc | release 작업자 |
| `docs/for-consumers/getting-started.md` | rc 마다 (시각 자산 추가/제거 시) | release 작업자 |
| `docs/for-consumers/migration/v0.x-to-v0.y.md` | major release 시 한 번, 그 후 동결 | release 작업자 |
| `docs/for-consumers/component-use-cases/*.md` | 디자인팀 + 컨슈머 피드백 시 | 작업자 자유 |
| `docs/for-contributors/roadmap.md` | 매 rc + 새 백로그 발견 시 | release 작업자 + 사용자 결정 |
| `docs/for-design-team/followup.md` | 디자인팀 답변 받을 때 | 누구든 |
| `packages/ui/README.md` | Phase 4-a 후 auto-gen | 컴포넌트 추가 시 자동 |
| `packages/lint/README.md` | Phase 4-c 후 auto-gen | 룰 추가 시 자동 |
| `packages/plugin/skills/polaris-web/SKILL.md` | rc 마다 | release 작업자 — RUNTIME AI 가 fetch |
| `packages/plugin/commands/*.md` | 명령 변경 시 | 누구든 |
| `AGENTS.md` (root + template-next) | rc 마다 (API 변경 시) | release 작업자 |

---

이 문서는 작업 *진행 중* 갱신. Phase 1~4 진행하면서 발견되는 추가 SSoT 후보 / drift 케이스를 §4 표에 누적.
