# 마이그레이션 결정 트리

> "어느 가이드부터 봐야 하나?" — 출발 버전 / 도착 버전 / 환경에 따라 결정.

---

## 1. 출발 버전이 어딥니까?

### v0.4 이전 / 디자인 시스템 0건

새 프로젝트로 간주하고 [`../getting-started.md`](../getting-started.md) 부터.

### v0.4 / v0.5 / v0.6

→ [`v0.6-to-v0.7.md`](v0.6-to-v0.7.md) 로 *먼저* v0.7로. 그 다음 v0.7→v0.8.

또는 **v0.8 codemod 한 번으로 점프** 가능 — codemod 테이블에 v0.6 alias 가 모두 들어 있어요. [`v0.7-to-v0.8.md`](v0.7-to-v0.8.md) 의 한 줄 codemod 사용.

### v0.7.x

→ [`v0.7-to-v0.8.md`](v0.7-to-v0.8.md) — 가장 자주 쓰는 경로. 마이그 가이드의 *권위적 SSoT*.

### v0.8.x

minor / patch 사이에서는 마이그 불필요 — [`/CHANGELOG.md`](../../../CHANGELOG.md) 로 narrative 확인.

---

## 2. 자체 utility CSS 가 많이 쌓여 있나?

`.surface`, `.primary-button`, `.field`, `.pill`, `.data-table` 같은 컨슈머 자체 utility 가 50줄+ 이라면:

→ [`legacy-css-patterns.md`](legacy-css-patterns.md) — 9개 패턴 grep + 치환 cheat sheet.

폴라리스 codemod-v08 은 폴라리스 자체 토큰만 변환 — 컨슈머 utility 는 손으로 옮겨야 합니다.

---

## 3. RSC / Next.js App Router 환경인가?

→ [`rsc-patterns.md`](rsc-patterns.md) — `@polaris/ui/utils` (server-safe 함수) + `<PaginationFooter buildHref>` (client island) + `<TableSearchInput name>` (form-action) + 안티 패턴.

핵심 caveat: **`@polaris/ui` 루트 번들은 `"use client"`** — Server Component 에서 client component 에 함수/컴포넌트 prop 직접 전달 불가. 두 안전 패턴은 위 가이드 참조.

---

## 4. v0.7 → v0.8 시각 회귀가 걱정되는가?

→ [`visual-diff.md`](visual-diff.md) — 값이 *같은 hex 인데 이름만 바뀐 토큰* vs *값까지 바뀐 토큰* 을 🟢/🟡/🔴 로 분리. 검증 우선순위.

특히 다크모드의 surface / border 톤이 푸른색 → 중성 회색으로 의도적 시각 변화.

---

## 5. 검증 / lint 통과 / CI 가드

```bash
# audit — 위반 통계
pnpm dlx @polaris/lint polaris-audit

# codemod 적용 후 dry-run 으로 잔여 확인
pnpm dlx @polaris/lint polaris-codemod-v08 src

# CI 가드 (PR 단계에서 회귀 차단)
pnpm dlx @polaris/lint polaris-codemod-v08 --check src
```

세 명령 모두 자세히 → [`v0.7-to-v0.8.md`](v0.7-to-v0.8.md) §2.

---

## ⚠ 알려진 caveat — 모든 마이그에 공통

- **`@polaris/ui` 자체 소스를 codemod target 에 포함하지 마세요** — `packages/ui/src/{tokens,styles,tailwind}` 에는 마이그 안내용 docstring 에 옛 alias 가 의도적으로 들어 있어 false-positive 가 큽니다.
- **conflict 감지 시 codemod 가 그 파일을 *건드리지 않음*** (v0.8.0-rc.7 부터) — stderr 안내 따라 manual resolution 후 재실행. 자세히 → [`v0.7-to-v0.8.md`](v0.7-to-v0.8.md) §5.
- **package.json dependency 범위**: `^0.7.x` 를 그대로 두면 v0.8 안 받음. 명시적으로 `^0.8.0` 으로 (또는 GitHub Release tarball URL 갱신).
