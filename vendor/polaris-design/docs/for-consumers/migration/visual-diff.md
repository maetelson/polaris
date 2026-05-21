# v0.7 → v0.8 시각 차이 — 토큰별 before / after

**의도**: codemod 696 rewrites 후 *build/lint 통과 ≠ 시각 동일*. 이 문서는 *어느 토큰이 어떻게 바뀌는지*를 한 페이지에서 보여 줘서 컨슈머가 light/dark × N 페이지를 수동 검증할 때 *어디를 봐야 하는지* 알 수 있도록 함.

**범례**:
- 🟢 **값 동일** — 이름만 바뀜. 시각 회귀 0
- 🟡 **값 동일, 의미 다름** — 같은 hex지만 컨텍스트 변경 (검토 권장)
- 🔴 **값 다름** — 시각 차이 발생. 페이지 단위 점검 필요

---

## 1. 색상 토큰 — 값 동일 (이름만 변경) 🟢

이 묶음은 codemod가 자동 변환하면 *시각적으로 동일*. 검증 불필요.

| v0.7 이름 | v0.8 이름 | Light hex | Dark hex |
|---|---|---|---|
| `text.primary` / `text-fg-primary` | `label.normal` / `text-label-normal` | `#26282B` | `#D8D8D8` |
| `text.secondary` / `text-fg-secondary` | `label.neutral` / `text-label-neutral` | `#454C53` | `#9E9E9E` |
| `text.muted` / `text-fg-muted` | `label.alternative` / `text-label-alternative` | `#72787F` | `#797979` |
| `text.onBrand` / `text-fg-on-brand` | `label.inverse` / `text-label-inverse` | `#FFFFFF` | `#232323` |
| `brand.primary` / `bg-brand-primary` | `accentBrand.normal` / `bg-accent-brand-normal` | `#1D7FF9` | `#1D7FF9` |
| `brand.primaryHover` / `bg-brand-primary-hover` | `accentBrand.strong` / `bg-accent-brand-strong` | `#1458AD` | `#60A5FA` |
| `brand.primarySubtle` / `bg-brand-primary-subtle` | `accentBrand.bg` / `bg-accent-brand-bg` | `#D9EAFF` | `#0B3263` |
| `brand.secondary` / `bg-brand-secondary` | `ai.normal` / `bg-ai-normal` | `#6F3AD0` | `#9B85FF` |
| `status.success` / `bg-status-success` | `state.success` / `bg-state-success` | `#51B41B` | `#51B41B` |
| `status.warning` / `bg-status-warning` | `state.warning` / `bg-state-warning` | `#FD8900` | `#FD8900` |
| `status.danger` / `bg-status-danger` | **`state.error`** / `bg-state-error` (이름도 `danger` → `error`) | `#F95C5C` | `#F95C5C` |
| `status.info` / `bg-status-info` | `state.info` / `bg-state-info` | `#1D7FF9` | `#1D7FF9` |
| `primary.normal` / `bg-primary-normal` (rc.0 alias) | `accentBrand.normal` | `#1D7FF9` | `#1D7FF9` |

> **검증 필요 없음** — codemod 적용 후 빌드 + 빠른 클릭 스루로 충분.

---

## 2. 색상 토큰 — 값 다름 🔴 (시각 회귀 가능)

이 묶음은 codemod 적용 후 *실제로 색이 변경*. 사용처를 점검해야 함.

| v0.7 이름 | v0.8 이름 | v0.7 Light | v0.8 Light | v0.7 Dark | v0.8 Dark | 사용처 점검 포인트 |
|---|---|---|---|---|---|---|
| `bg-surface-canvas` | `bg-background-base` | `#FFFFFF` | `#FFFFFF` ✓ 동일 | `#0B0B12` | `#232323` | **다크 모드 페이지 배경 — 미세하게 더 밝아짐 (실용상 거의 동일)** |
| `bg-surface-raised` | `bg-layer-surface` | `#FFFFFF` | `#FFFFFF` ✓ | `#1B1B2A` | `#282828` | **다크 모드 카드 / 다이얼로그 배경 — 푸른 톤 빠지고 중성 회색** |
| `bg-surface-sunken` | `bg-fill-neutral` | `#F2F4F6` | `#F7F8F9` (살짝 밝아짐) | `#131320` | `#2D2D2D` | **light 미세 / dark 푸른 톤 → 중성 회색.** well / code 블록 / sunken section |
| `bg-background-normal` (rc.0 alias) | `bg-background-base` | `#F7F8F9` | `#FFFFFF` | `#1B1B2A` | `#232323` | **light에서 옅은 회색 → 순백.** 카드 배경으로 쓰고 있었다면 시각 변화 큼 → `bg-layer-surface` 로 옮기는 게 맞는 경우 많음 |
| `bg-background-alternative` (rc.0 alias) | `bg-fill-neutral` | (rc.0 값) | `#F7F8F9` | (rc.0) | `#2D2D2D` | 거의 동일하나 토큰 의도 명확화 (fill 가족으로) |
| `border-surface-border` | `border-line-neutral` | `#E8EBED` | `#E8EBED` ✓ | `#2D2D45` | `#3B3B3B` | **다크 모드 보더 — 푸른 톤 빠짐** |
| `border-surface-border-strong` | `border-line-normal` | `#C9CDD2` | `#C9CDD2` ✓ | `#4A4A66` | `#595959` | **다크 모드 강조 보더 — 푸른 톤 빠짐** |

> **검증 필요** — 특히 다크 모드. `[data-theme="dark"]` 토글 후 페이지 단위로 보더 / surface 톤 점검. 푸른 톤 → 중성 회색 변화가 의도된 디자인팀 spec이지만 컨슈머 페이지에 따라 갑작스럽게 보일 수 있음.

### 점검 우선순위 페이지

| 페이지 유형 | 점검 토큰 | 비고 |
|---|---|---|
| 다크 모드 대시보드 | `bg-layer-surface`, `border-line-neutral` | 카드 / 패널 — 가장 자주 노출 |
| 다크 모드 모달 / 다이얼로그 | `bg-surface-modal` (변동 없음) | popover / modal elevation tier는 유지 |
| 코드 / well 블록 | `bg-fill-neutral` | sunken → fill 이동 |
| 다크 모드 보더 일관성 | `border-line-{neutral,normal,strong}` | 푸른 톤 → 중성 회색 일괄 |

---

## 3. Typography 토큰 — 일부 이름만, 일부 값도 변경 🟡 / 🔴

### 🟢 / 🟡 이름만 변경 (값 동일)

| v0.7 이름 | v0.8 이름 | size / weight | 비고 |
|---|---|---|---|
| `text-polaris-display-lg` | `text-polaris-display` | 40px / 700 | 동일 |
| `text-polaris-display-md` | `text-polaris-title` | 32px / 700 | 동일 |
| `text-polaris-heading-lg` | `text-polaris-heading2` | 24px / 700 | 동일 |
| `text-polaris-heading-md` | `text-polaris-heading3` | 20px / 700 | 동일 |

### 🔴 값 변경 (시각 회귀 가능)

| v0.7 이름 | v0.8 이름 | v0.7 size | v0.8 size | 비고 |
|---|---|---|---|---|
| `text-polaris-h5` (rc.0 alias) | `text-polaris-heading4` | 16px / 600 | **18px / 700** | 한 단계 커지고 무거워짐 — h5 사용처 점검 |
| `text-polaris-heading-sm` | `text-polaris-heading4` | 18px / 700 | 18px / 700 ✓ | 정합 |
| `text-polaris-body` (suffix 없음) | `text-polaris-body1` | 14px / 400 | **16px / 400** | body 단독 사용처가 한 단계 커짐 |
| `text-polaris-body-lg` | `text-polaris-body1` | 16px / 400 | 16px / 400 ✓ | 정합 |
| `text-polaris-body-sm` | `text-polaris-body2` | 14px / 400 | 14px / 400 ✓ | 정합 |
| `text-polaris-caption` (suffix 없음) | `text-polaris-caption1` | 13px / 500 | **12px / 700** | 작아지고 무거워짐 (Bold) |
| `text-polaris-meta` | `text-polaris-caption1` | 12px / 500 | **12px / 700** | weight 500 → 700 |
| `text-polaris-tiny` | `text-polaris-caption2` | 10px / 500 | **11px / 700** | size + weight 모두 변화 |

> **검증 필요** — `text-polaris-body` / `text-polaris-caption` / `text-polaris-meta` / `text-polaris-tiny` 가 페이지에 자주 등장하면 텍스트 크기 / 무게 변화로 레이아웃이 들썩일 수 있음. `text-polaris-h5` 도 동일. Heading hierarchy / Caption hierarchy 가 디자인팀 spec 정합으로 일관화되는 의도된 변화.

---

## 4. Radius — 이름만 변경 🟢

| v0.7 | v0.8 | 값 |
|---|---|---|
| `rounded-polaris-full` | `rounded-polaris-pill` | `9999px` |

> 검증 불필요 — 픽셀 단위 동일. Pill / Avatar / Chip 등은 시각 동일.

---

## 5. 컬러 ramp `5` → `05` — 값 동일 🟢

| v0.7 | v0.8 | 값 |
|---|---|---|
| `bg-blue-5` | `bg-blue-05` | 동일 hex |
| `bg-green-5` | `bg-green-05` | 동일 |
| (모든 brand + supplementary 11 family) | 선행 0 | 동일 |

> 시각 동일 — 다른 step (`-50` / `-500` 등) 과 시각 정렬 위한 이름 normalize 만.

---

## 6. 검증 체크리스트 (수동)

codemod 적용 후 컨슈머 측에서 다음을 페이지 단위로 점검 권장:

### 라이트 모드
- [ ] **`text-polaris-body` 사용처** — 14 → 16 변화 (한 단계 큼). 본문 padding / line-height 들썩이는지
- [ ] **`text-polaris-caption` / `-meta` / `-tiny` 사용처** — weight 500 → 700. 메타 텍스트가 갑자기 굵게 보임
- [ ] **`text-polaris-h5` 사용처** — 16 → 18. 컬럼 헤더 등에 사용했다면 레이아웃 점검
- [ ] **`bg-background-normal` 였던 카드** — 옅은 회색 → 순백 (Codemod가 `bg-background-base`로 변환). 의도된 경우 `bg-layer-surface`로 한 번 더 옮기는 게 맞을 수 있음

### 다크 모드 (가장 자주 회귀)
- [ ] **카드 / 다이얼로그 배경** — `bg-surface-raised` (`#1B1B2A`, 푸른 톤) → `bg-layer-surface` (`#282828`, 중성 회색). 푸른 톤이 빠지는 게 spec 정합
- [ ] **보더 색** — `border-surface-border` (`#2D2D45`, 푸른) → `border-line-neutral` (`#3B3B3B`, 중성). 동일하게 푸른 톤 → 중성
- [ ] **well / code 블록 배경** — `bg-surface-sunken` → `bg-fill-neutral`. 다크 모드에서 푸른 톤 → 중성
- [ ] **버튼 hover** — `--accent-brand-strong` 가 `#60A5FA` 로 dark에선 더 밝음 (정합 변화 없음, 점검 차원)

### 양쪽 공통
- [ ] **포커스 링** — v0.8에서 모든 컴포넌트가 `shadow-polaris-focus` (3px box-shadow) 로 통일. v0.7에서 일부 컴포넌트가 `outline` 사용했다면 시각 변화. **단, 디자인팀 spec은 outline 2px + offset이라 향후 변경 가능 — `design-team-followup.md` C3 참조**
- [ ] **DialogFooter** — v0.8.0에서 `fullWidthButtons` prop 신규. default 동작 (오른쪽 정렬) 유지하지만 새 사용처에서 prop 활용 검토
- [ ] **Stat delta 색** — `deltaTone` → `deltaVariant`. codemod 처리 후 색은 동일

---

## 7. 자동화 권장 — Playwright 또는 직접 비교

수동 검증 부담을 줄이려면 한 번만 시각 회귀 baseline 구축:

```bash
# 컨슈머 측 e2e
npx playwright test --update-snapshots  # codemod 적용 전 baseline
# codemod 적용
pnpm dlx @polaris/lint polaris-codemod-v08 --apply src
# 비교
npx playwright test
# diff가 있는 페이지만 디자인팀 검수
```

또는 가장 간단히 — Storybook / 데모 카탈로그가 있는 프로젝트라면 그 페이지의 screenshot 만 비교해도 시각 회귀 80% 잡힘.

---

## 8. 변경 안 됨 (참고)

다음은 v0.7 → v0.8에서 **변동 없음** — 안심하고 넘어가도 됨:

- `bg-accent-brand-normal` (Brand Blue `#1D7FF9`) — 핵심 브랜드 색
- `bg-state-success` / `-warning` / `-error` / `-info` (state hex 모두)
- `bg-ai-normal` (AI Purple `#6F3AD0`)
- `bg-static-white` / `bg-static-black`
- `rounded-polaris-{xs,sm,md,lg,xl,2xl}` (pill 외)
- `shadow-polaris-{xs,sm,md,lg,ai}` 값 자체 (focus만 통일)
- spacing 토큰 12레벨 (4xs ~ 4xl) 값
- breakpoint 4단계
- motion duration / easing

---

이 문서는 codemod 적용 후 *어디를 봐야 하는지* 의 cheat sheet. baseline 갱신 후엔 부담이 한 번에 종료됩니다.
