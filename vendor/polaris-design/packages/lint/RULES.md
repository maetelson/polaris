# `@polaris/lint` — ESLint 룰 목록

> **AUTO-GENERATED** — `pnpm --filter @polaris/lint build` 시 자동 갱신. 본문 직접 수정 금지 — 각 룰의 `meta.docs.description` (in `src/rules/*.ts`) 을 수정하세요.

현재 9 룰 — `recommended` 프리셋에 모두 포함됩니다. 자세한 설정 / 사용: [`./README.md`](README.md).

---

| 룰 | type | 설명 |
|---|---|---|
| `@polaris/no-arbitrary-tailwind` | problem | Disallow Tailwind arbitrary values; use Polaris token-based classes (e.g. bg-accent-brand-normal, p-4) instead. Layout utilities like grid-cols-[...] are exempt. |
| `@polaris/no-deprecated-polaris-token` | problem | Disallow deprecated Polaris token aliases (rc.0 / v0.6 era); use v0.7 spec tokens instead. Run  |
| `@polaris/no-direct-font-family` | problem | Disallow direct font-family declarations; use Polaris font tokens (var(--polaris-font-sans), font-polaris). |
| `@polaris/no-hardcoded-color` | problem | Disallow hardcoded color values; use Polaris design tokens (CSS variables or @polaris/ui token imports). |
| `@polaris/no-non-polaris-css-var` | problem | Disallow consumption of non-Polaris CSS variables. Every  |
| `@polaris/no-tailwind-default-color` | problem | Disallow Tailwind built-in color palette utilities (slate-*, rose-*, etc.); use Polaris semantic tokens (label-*, state-*, accent-brand-*) instead. |
| `@polaris/prefer-polaris-component` | problem | Prefer @polaris/ui components over native HTML elements that have a Polaris equivalent (button, input, textarea, select, dialog). |
| `@polaris/prefer-polaris-icon` | suggestion | Prefer  |
| `@polaris/state-color-with-icon` | suggestion | Pair  |

---

## 추가 도구

lint 룰 외에 같은 패키지에서 제공:

| 명령 | 용도 |
|---|---|
| `pnpm dlx @polaris/lint polaris-audit` | 위반 통계 — top hex / 임의값 / 위반 파일 분석 리포트 |
| `pnpm dlx @polaris/lint polaris-codemod-v07` | v0.6/rc.0/rc.1 → v0.7 자동 변환 |
| `pnpm dlx @polaris/lint polaris-codemod-v08` | v0.7 → v0.8 자동 변환 (token / Tailwind / CSS 변수 / JSX prop / `<HStack>`·`<VStack>` 일괄) |

마이그레이션 절차: [`/docs/for-consumers/migration/README.md`](../../docs/for-consumers/migration/README.md).
