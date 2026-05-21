# 디자인팀 진입점

> 폴라리스 디자인팀의 *결정 필요 항목 + 정합 검토*. 자세한 표는 한 페이지에 모여 있습니다.

---

## 한 페이지 진입점

→ [`followup.md`](followup.md)

내용:
- **Part A** — v0.7 재검수 follow-up 5건 진행 상태 (Tertiary / Modal 풀너비 / Checkbox 4종 / Checkbox AI / Alert 결정)
- **Part B** — 디자인 정의서 (Design System: Polaris Office) 대비 우리 구현의 정합 ✅ / 비정합 ⚠️ / 확장 🟢 종합 표 (§2 색상 ~ §10 접근성)
- **Part C** — Part B 에서 발견된 새 결정 필요 항목 (C1~C8) + 확장 confirm 후보 (X1~X17) + KCAS 컨슈머 피드백에서 추가된 DT-A / DT-B

---

## 시각 자산 자료

- [`/DESIGN.md`](../../DESIGN.md) — 토큰 + 컴포넌트 spec (auto-gen, 디자인 정의서와 1:1 비교 가능)
- `assets/` (root) — Figma export PNG + SVG 자산. 갱신 절차는 `assets/README.md`

---

## 디자인 정의서 ↔ 구현 정합

[`followup.md`](followup.md) Part B 에 §2~§11 절별 정합 표가 있습니다. 한눈 요약:

| 영역 | 정합 | 비정합 | 확장 |
|---|---|---|---|
| 시맨틱 컬러 토큰 | 36/36 ✓ | 0 | 1 |
| Typography | 11 spec + 모바일 ✓ | 0 | 0 |
| Radius | xs~2xl ✓ | **`full` vs `pill` 이름** (C1) | `2xs` |
| Shadow | level 정합 | **shadow 값 자체** (C2) | `ai`, `focus` |
| Focus ring | — | **outline (정의서) vs box-shadow (구현)** (C3) | 0 |
| Button | 6 sizes ✓ | 0 | `ai`, `danger` |
| Input / Form | 52px + ErrorIcon ✓ | 0 | 0 |
| Modal | radius / overlay ✓ | 0 | `fullWidthButtons` |
| Toast | 48px + blur + 3초 ✓ | 0 | 0 |

**핵심 비정합 3건** (정식 v0.8.0 전 결정 권장):
- C1: Radius `full` vs `pill` 이름
- C2: Shadow 값 (offset / opacity / 색상) 불일치
- C3: Focus ring outline vs box-shadow 구현 방식

---

## 결정 요청 — 미팅 시 의제 권장 순서

1. **C1~C3 비정합 3건** 결정 (한 시간 분량) — 정식 v0.8.0 게이트
2. **Part A 의 follow-up 5건** + DT-A / DT-B (Stat valueVariant / PageHeader card 변종) 결정
3. **X1~X17 확장 항목** confirm — 정의서에 추가 vs 우리 시스템 한정

---

## 디자인팀 측 자료 갱신 (요청)

폴라리스 디자인 시스템 자체 변경 후 디자인팀이 정의서에 반영해 줘야 할 항목:
- v0.8 rc 사이클에서 우리 측 결정이 *추천안* 으로 들어간 항목 (DialogFooter fullWidthButtons / Checkbox AI variant / Stat valueVariant 검토 등) — 컨펌 후 정의서에 spec 추가
- 새 컴포넌트 확장 (`Combobox` / `PageHeader` / `Stat` / Ribbon family 등 30+ 종) 의 정식 spec 명문화 후보 우선순위 — [`followup.md`](followup.md) Part C 확장 항목 §X1~X17 참조

---

## 정기 sync 채널 (제안)

- 격주 30분 동기 미팅 또는 비동기 Slack 채널 중 선호 형태 결정
- 매 rc 마다 narrative 가 자동 [`CHANGELOG.md`](../../CHANGELOG.md) 에 작성됨 — 구독 가능
- 새 rc 푸시 알림 [`../for-consumers/install.md`](../for-consumers/install.md) 의 Upstream release 알림 섹션 참조 (Renovate / GH Action / Slack webhook)
