# Tailwind v4 사용 가이드

v0.4.0부터 `@polaris/ui`가 **v4-네이티브 CSS 파일**을 함께 ship합니다 — 이전처럼 `@theme inline { ... }` 50+줄을 직접 작성할 필요 없습니다.

---

## 빠른 시작 (v4 + 폴라리스)

`app/globals.css` (또는 진입 CSS):

```css
@import 'tailwindcss';
@import '@polaris/ui/styles/tokens.css';
@import '@polaris/ui/styles/v4-theme.css';
```

이 두 줄이면 끝입니다. v3 preset과 **동일한 클래스명**(`bg-accent-brand-normal`, `text-label-normal`, `rounded-polaris-md`, `text-polaris-body2`, `font-polaris`, `shadow-polaris-sm` 등 v0.8 spec 이름)이 v4에서도 그대로 작동합니다.

> **v0.8에서 alias 제거** — `bg-brand-primary` / `text-fg-primary` / `bg-surface-raised` / `bg-status-danger` / `text-polaris-body-sm` / `text-polaris-h1`~`-h5` / `rounded-polaris-full` / 컬러 ramp `5` (선행 0 없는) 같은 v0.6/rc.0/v0.7 alias는 **v3 preset과 v4 theme 모두에서 emit되지 않습니다.** 그대로 작성한 코드는 dead-class. 마이그레이션: `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` (자세히 → [`docs/for-consumers/migration/v0.7-to-v0.8.md`](../../for-consumers/migration/v0.7-to-v0.8.md)).

---

## 다크 모드 variant 연결

`tokens.css`는 `[data-theme="dark"]` 셀렉터로 다크 토큰을 덮어쓰는 방식입니다. Tailwind의 `dark:` variant를 이 attribute에 묶으려면 globals.css에 한 줄 추가:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

이제 `dark:bg-layer-surface` 같은 표현이 우리 토큰 다크 모드와 일치합니다.

---

## Alpha modifier (`bg-state-success/15`)

v4는 CSS 변수가 단순 hex/rgb로 평가될 때만 alpha modifier를 처리합니다. `tokens.css`의 `--polaris-state-*` 등은 모두 단순 hex이므로 v4에서도 자동으로 `color-mix(in oklab, ...)`로 컴파일됩니다. (v0.7부터 `status` → `state` rename, `danger` → `error`.)

---

## v3 vs v4 비교

| 항목 | v3 | v4 |
|---|---|---|
| 진입점 | `tailwind.config.ts` `presets: [polarisPreset]` | `globals.css`의 `@import '@polaris/ui/styles/v4-theme.css'` |
| 색상 토큰 | callable function (alpha 지원용) | `var(--polaris-*)` 직접 |
| 폰트 사이즈 묶음 | preset 객체 | `--text-{name}` + `--text-{name}--line-height` 등 |
| 다크 모드 | 자동 (Tailwind preset에서 dark: 매핑) | `@custom-variant dark` 한 줄 추가 필요 |

---

## v4-theme.css는 어디서 옴?

`@polaris/ui` 패키지에 직접 ship됩니다 (`src/styles/v4-theme.css`). 우리 v3 preset(`packages/ui/src/tailwind/index.ts`)이 정의하는 모든 utility class와 1:1 매핑됩니다. 토큰이 추가되면 양쪽이 함께 갱신됩니다.

`v4-theme.css`를 직접 열어보면 매핑 형태가 모두 보입니다:

```css
@theme inline {
  --color-accent-brand-normal: var(--polaris-accent-brand-normal);
  --color-state-success:       var(--polaris-state-success);
  --color-label-normal:        var(--polaris-label-normal);
  --color-layer-surface:       var(--polaris-layer-surface);
  --radius-polaris-md:         var(--polaris-radius-md);
  /* ... 전체 매핑은 packages/ui/src/styles/v4-theme.css 참조 */
}
```

---

## 기존 manual 매핑 마이그레이션

이미 `@theme inline { ... }`을 직접 작성한 프로젝트는:

1. 직접 매핑 블록 삭제
2. `@import '@polaris/ui/styles/v4-theme.css';` 추가
3. 빌드 → 동일 클래스명이 그대로 동작 확인

5분 안에 끝납니다.

---

## 알려진 한계

- **v4에서 추가된 새 토큰**: 우리 패키지에 토큰이 추가되면 `v4-theme.css`도 함께 갱신됩니다. `@polaris/ui` 버전 올리는 것만으로 충분.
- **커스텀 토큰 추가 시**: 사용자 프로젝트에서 토큰을 추가하고 싶다면 `v4-theme.css` import 다음에 또 다른 `@theme inline { ... }` 블록을 작성. 같은 namespace를 덮어쓸 수 있음.
- **v3 사용자**: `tailwind.config.ts`의 `presets: [polarisPreset]` 그대로 유지. v4-theme.css는 무시.
