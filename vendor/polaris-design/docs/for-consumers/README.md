# 컨슈머 진입점 — 신규 도입 / 마이그레이션 / use case

> 폴라리스 디자인 시스템을 *사용*하는 사람을 위한 자료. 폴라리스 자체 기여는 [`../for-contributors/`](../for-contributors/) 참조.

---

## 🚀 처음 도입

| 순서 | 파일 | 소요 |
|---|---|---|
| 1 | [`install.md`](install.md) — tarball / Renovate / GH Action 셋업 | 30분 |
| 2 | [`getting-started.md`](getting-started.md) — 첫 코드 + 시각 자산 9가지 | 1시간 |
| 3 | [`component-use-cases/README.md`](component-use-cases/README.md) — use case 별 컴포넌트 + 토큰 패턴 | 필요할 때 |

> AI 에이전트 (Claude / Codex 등) 에 그대로 던지는 *시작 프롬프트*는 [`getting-started.md`](getting-started.md) 의 §A 참조.

---

## 🔁 기존 코드 마이그레이션

| 케이스 | 진입점 |
|---|---|
| **버전 점프** (예: v0.6 → v0.8) | [`migration/README.md`](migration/README.md) — 결정 트리 |
| **자체 utility CSS → 폴라리스 컴포넌트** | [`migration/legacy-css-patterns.md`](migration/legacy-css-patterns.md) — `.surface`→`<Card>` 등 9개 매핑 |
| **RSC / Next.js App Router** | [`migration/rsc-patterns.md`](migration/rsc-patterns.md) — utils + raw `<Link>` / client island 두 패턴 |
| **v0.7 → v0.8 시각 회귀** | [`migration/visual-diff.md`](migration/visual-diff.md) — 토큰 before/after |

---

## 📖 컴포넌트 / 토큰 use case

[`component-use-cases/README.md`](component-use-cases/README.md) — 컴포넌트 또는 토큰 namespace 별 *use when / don't use* 가이드.

현재 작성된 가이드:
- [`component-use-cases/badge.md`](component-use-cases/badge.md) — `<Badge>` tone × variant 매핑 + 도메인 상태 (active / 완료 / 거절 등) 매핑

다른 컴포넌트는 [`/DESIGN.md`](../../DESIGN.md) §4 의 spec 표 또는 [`packages/ui/README.md`](../../packages/ui/README.md) 의 카탈로그 참조.

---

## 🧰 추가 가이드 (예정)

| 파일 | 내용 | 상태 |
|---|---|---|
| `icon-mixing-guide.md` | Polaris ↔ Lucide 아이콘 stroke 호환 + 우선순위 정책 | KCAS 피드백 후속 |
| `responsive-guide.md` | 모바일 자동 축소 토큰 / 수동 처리 토큰 분리 | KCAS 피드백 후속 |
| `a11y-checklist.md` | focus ring / aria / 키보드 nav 글로벌 적용 | KCAS 피드백 후속 |

이 항목들은 [`../for-contributors/roadmap.md`](../for-contributors/roadmap.md) 의 v0.8.x patch 묶음에 등재.

---

## ❓ FAQ — 자주 막히는 곳

| 증상 | 해결 |
|---|---|
| `pnpm install` 후 `404 Not Found` | [`install.md`](install.md#트러블슈팅) |
| `bg-fg-primary` / `bg-status-danger` 같은 클래스 작동 안 함 | v0.8에서 alias 제거됨 — [`migration/v0.7-to-v0.8.md`](migration/v0.7-to-v0.8.md) |
| 다크모드 색이 안 바뀜 | [`install.md`](install.md#트러블슈팅) — `tokens.css` import 위치 |
| 페이지 시각이 화면마다 달라 보임 | [`getting-started.md`](getting-started.md#d-무엇을-결과로-기대해야-하나) 의 시각 정체성 체크리스트 |
| Next.js App Router 에서 컴포넌트가 막힘 | [`migration/rsc-patterns.md`](migration/rsc-patterns.md) |
| 새 폴라리스 버전 떴는데 모름 | [`install.md`](install.md#upstream-release-알림) |

해결 안 되는 갭은 [`../for-contributors/roadmap.md`](../for-contributors/roadmap.md) 의 컨슈머 피드백 묶음에 등재됐는지 확인 후, 없으면 새 항목으로 issue 또는 PR.
