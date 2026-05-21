# 컴포넌트 / 토큰 use case 인덱스

> 한 컴포넌트 (또는 토큰 namespace) 의 *use when / don't use* 가이드. spec 자체는 [`/DESIGN.md`](../../../DESIGN.md) 또는 [`packages/ui/README.md`](../../../packages/ui/README.md) 의 카탈로그를 참조하고, 여기는 *결정 가이드*.

---

## 작성된 가이드

### 컴포넌트

| 컴포넌트 | 가이드 | 핵심 결정 |
|---|---|---|
| `<Badge>` | [badge.md](badge.md) | tone × variant 매핑 + 도메인 상태 (active / 완료 / 거절 / 초안 등) ↔ Badge 조합 |

### 토큰 namespace (예정 — KCAS 피드백 후속)

| namespace | 가이드 | 상태 |
|---|---|---|
| `label.*` | `token-label.md` | KCAS A-3 후속 (`alternative` vs `neutral` vs `assistive` use when…) |
| `state.*` | `token-state.md` | KCAS G-3 후속 (도메인 상태 ↔ state.success/warning/error/info 매핑 표준) |
| `line.*` | `token-line.md` | `neutral` vs `normal` vs `strong` 사용 컨텍스트 |
| `fill.*` | `token-fill.md` | `neutral` vs `normal` vs `strong` 사용 컨텍스트 |
| `accentBrand.*` | `token-accent-brand.md` | `normal` vs `strong` vs `bg` vs `bg-hover` vs `normal-subtle` 사용 컨텍스트 |

이 항목들은 [`../../for-contributors/roadmap.md`](../../for-contributors/roadmap.md) 의 v0.8.x patch 묶음에 등재.

---

## use case 가이드 작성 원칙

각 가이드는 다음 구조로 작성:

```
# <Component> Use Case 가이드

## API axis 요약
(prop 표)

## use when / don't use 매핑
| 상태 / 컨텍스트 | 권장 조합 | 안티 패턴 |

## 자주 쓰는 cheat sheet
(코드 예시 10~15줄)

## 다른 컴포넌트와 페어
(같이 쓰면 일관성 도움되는 컴포넌트)
```

새 가이드 추가 시 이 인덱스도 갱신. 한 가이드는 *결정 가이드* 만 다루고, *spec* 은 항상 [`/DESIGN.md`](../../../DESIGN.md) 또는 컴포넌트 JSDoc 으로.

---

## 컴포넌트 spec / 카탈로그 본문

- 모든 컴포넌트 spec: [`/DESIGN.md`](../../../DESIGN.md) (auto-gen, SSoT)
- 컴포넌트 카탈로그 + import 경로: [`/packages/ui/README.md`](../../../packages/ui/README.md)
- 컴포넌트 진화 (added / hardened / breaking): [`../../for-contributors/component-history.md`](../../for-contributors/component-history.md)
