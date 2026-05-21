# 폴라리스 디자인 시스템 — 문서 지도

> 청중에 맞는 진입점부터 찾으세요. 한 청중은 한 디렉토리만 보면 됩니다.

---

## 🤖 AI 에이전트 (Claude / Codex / Cursor / Copilot)

| 시점 | 파일 |
|---|---|
| **vibe-coding 작성 중** | [`/AGENTS.md`](../AGENTS.md) (root) — 첫 컨텍스트 |
| **PostToolUse 훅 / 슬래시 명령 시 fetch** | [`packages/plugin/skills/polaris-web/SKILL.md`](../packages/plugin/skills/polaris-web/SKILL.md) |

> 폴라리스 플러그인 (`polaris-design`) 설치 시 자동으로 위 SKILL 이 활성화됩니다. 설치: [`packages/plugin/README.md`](../packages/plugin/README.md).

---

## 👨‍💻 신규 / 마이그레이션 컨슈머 개발자

| 시점 | 위치 |
|---|---|
| **처음 도입** | [`for-consumers/README.md`](for-consumers/README.md) → install → getting-started → use-cases |
| **기존 코드 마이그레이션** | [`for-consumers/migration/README.md`](for-consumers/migration/README.md) — 결정 트리 |
| **컴포넌트 / 토큰 use case** | [`for-consumers/component-use-cases/README.md`](for-consumers/component-use-cases/README.md) |
| **RSC / Next.js App Router** | [`for-consumers/migration/rsc-patterns.md`](for-consumers/migration/rsc-patterns.md) |
| **레거시 CSS 패턴 → 폴라리스** | [`for-consumers/migration/legacy-css-patterns.md`](for-consumers/migration/legacy-css-patterns.md) |

---

## 🛠 폴라리스 팀 / 기여자

| 시점 | 위치 |
|---|---|
| **다음 작업 / 로드맵** | [`for-contributors/roadmap.md`](for-contributors/roadmap.md) |
| **컴포넌트 진화 history** | [`for-contributors/component-history.md`](for-contributors/component-history.md) |
| **variant axis spec** | [`for-contributors/variant-axes.md`](for-contributors/variant-axes.md) |
| **문서 SSoT 정책** | [`for-contributors/docs-architecture.md`](for-contributors/docs-architecture.md) (이 문서의 *왜*) |
| **깊은 아키텍처** | [`for-contributors/architecture/`](for-contributors/architecture/) (Tailwind v4, Next.js, App Shell) |

---

## 🎨 디자인팀

| 시점 | 위치 |
|---|---|
| **정합 검토 / 결정 필요 항목** | [`for-design-team/followup.md`](for-design-team/followup.md) |

---

## 📚 spec / history / 진입점 (모두 공유)

| 정보 | 위치 |
|---|---|
| **elevator pitch + Quick Links** | [`/README.md`](../README.md) (root) |
| **토큰 + 컴포넌트 spec** (auto-gen) | [`/DESIGN.md`](../DESIGN.md) |
| **release narrative** (historical, do not edit past entries) | [`/CHANGELOG.md`](../CHANGELOG.md) |
| **컴포넌트 카탈로그** | [`packages/ui/README.md`](../packages/ui/README.md) |
| **lint 룰 인덱스** | [`packages/lint/README.md`](../packages/lint/README.md) |
| **플러그인 설치 + 슬래시 명령** | [`packages/plugin/README.md`](../packages/plugin/README.md) |

---

## 🗄 archive

[`archive/`](archive/) — 더 이상 유지 안 함, 참고용. component-use-cases 가 대체했거나 versioned migration 가 종료된 자료.

---

## 문서 작성 규칙 (요약)

1. **각 정보는 SSoT 한 곳에만** — 다른 위치는 *링크 + 한 줄 요약*
2. **청중 기반 디렉토리** — for-consumers / for-contributors / for-design-team / archive
3. **auto-gen 우선** — token 표 / 컴포넌트 카탈로그 / lint 룰은 코드에서 자동 생성
4. **historical ↔ current 명확 분리** — CHANGELOG (절대 수정 X) vs current docs (rc 마다 갱신)

자세히: [`for-contributors/docs-architecture.md`](for-contributors/docs-architecture.md).
