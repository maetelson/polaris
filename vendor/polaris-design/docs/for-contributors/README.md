# 기여자 / 폴라리스 팀 진입점

> 폴라리스 디자인 시스템을 *만들고 유지*하는 사람을 위한 자료. 사용은 [`../for-consumers/`](../for-consumers/).

---

## 🗺 다음 작업 / 의사 결정

| 자료 | 내용 |
|---|---|
| [`roadmap.md`](roadmap.md) | 완료된 사이클 + 진행 중 + 다음 minor / patch 후보. **새 백로그는 여기 등재 후 사용자 결정 받아 진행** |
| [`../for-design-team/followup.md`](../for-design-team/followup.md) | 디자인팀 결정 필요 항목 (정합 검토 + 컨슈머 피드백 후속) |

---

## 📜 history / 진화

| 자료 | 내용 |
|---|---|
| [`/CHANGELOG.md`](../../CHANGELOG.md) | release narrative (historical, **절대 과거 entry 수정 X**) |
| [`component-history.md`](component-history.md) | 컴포넌트별 added / hardened / breaking 매트릭스 (auto-gen 후보 — Phase 4-b) |

---

## 🛠 작업 / 정책

| 자료 | 내용 |
|---|---|
| [`docs-architecture.md`](docs-architecture.md) | 문서 SSoT 구조 / drift 방지 원칙 |
| [`variant-axes.md`](variant-axes.md) | 컴포넌트 variant axis 명명 정책 |

---

## 🏗 깊은 아키텍처

[`architecture/`](architecture/) — 빌드 / Tailwind / Next.js / 앱 셸 등 깊은 기술 자료. 소수만 읽음.

| 자료 | 내용 |
|---|---|
| [`architecture/tailwind-v4.md`](architecture/tailwind-v4.md) | Tailwind v4 통합 + `@theme inline` 패턴 |
| [`architecture/nextjs-app-router.md`](architecture/nextjs-app-router.md) | Next.js App Router 통합 / RSC 경계 |
| [`architecture/app-shell-layout.md`](architecture/app-shell-layout.md) | Sidebar / Navbar / TooltipProvider / Toaster 셋업 |

---

## 🎨 디자인 정의서 정합

| 자료 | 내용 |
|---|---|
| [`../for-design-team/followup.md`](../for-design-team/followup.md) | 디자인팀 정의서 vs 우리 구현 정합 / 비정합 / 확장 종합 표 + 결정 필요 항목 |

---

## ✅ 릴리즈 시 체크리스트 (간략)

(상세 절차는 `release-process.md` 신설 예정 — KCAS 피드백 후속)

1. `pnpm verify` 14/14 ✓ — token sync / DESIGN.md sync / typecheck / lint / build / dead-alias scan / 모든 패키지 tests
2. `pnpm test:e2e` 30/30 ✓ — visual regression baseline
3. 모든 패키지 version 동기화 — `scripts/sync-root-version.mjs --check` 통과
4. `CHANGELOG.md` 에 narrative 작성
5. `/README.md` 의 "current rc" pointer 갱신
6. annotated tag 생성 + push (`git tag -a v0.8.0-rc.X -m "..." && git push --follow-tags`)
7. release-tarballs.yml 워크플로우가 자동으로 `.tgz` 첨부

자세한 사용자 정책: 정식 semver 태그 (`v0.X.Y`) 는 사용자 명시 사인오프 후만. rc / alpha / beta 는 자유.

---

## 🤝 컨슈머 피드백 흡수 절차

신규 컨슈머 피드백을 받으면:

1. [`/docs/for-consumers/`](../for-consumers/) 에 *이미 있는데 모르고 계신 항목* 분리 (oversight, 우리 docs 노출 부족)
2. 진짜 폴라리스 측 갭은 [`roadmap.md`](roadmap.md) 의 컨슈머 피드백 묶음에 등재
3. 디자인팀 결정 필요한 항목은 [`../for-design-team/followup.md`](../for-design-team/followup.md) 에 등재
4. 사용자 결정 받고 진행

이미 받은 컨슈머 피드백:
- DocFlow v0.7.5 / v0.7.7 — 폼 갭, Stat NumberFormat 등 (rc.0 흡수)
- 실전 마이그레이션 프로젝트 — codemod fail-loud (rc.7 / rc.8 흡수)
- KCAS-platform — RSC + 토큰 use-case 가이드 (rc.8 + 후속 백로그)
