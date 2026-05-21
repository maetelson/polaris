# 디자인 어셋 요청 — v0.7+

폴라리스 디자인 시스템은 v0.6.0까지 토큰·컴포넌트·린트 레이어를 갖췄습니다. v0.7부터는 **시각 자산**(로고·아이콘·일러스트·모션 등)을 시스템에 편입해서 LLM이 자동 생성하는 모든 폴라리스 웹 서비스가 같은 어셋을 import만 하면 일관되게 쓰게 만드는 게 목표입니다.

이 문서는 디자인 팀에 전달할 1차 요청 명세입니다. 우선순위(P0/P1/P2)와 사양만 정리하고, 시안 디테일은 디자인 팀이 결정합니다.

---

## 0. 공통 사양

| 항목 | 값 |
|---|---|
| 1차 포맷 | SVG (필수) |
| 보조 포맷 | PNG @1x/@2x (브라우저 지원이 필요한 곳), WebP (사진/일러스트) |
| 원본 | Figma 라이브러리 (수정·확장용) |
| 색상 모드 | **라이트/다크 페어 필수** — 토큰 시스템과 동일 정책 |
| 토큰 정렬 | hex 직접 명시 ❌ → `currentColor` 또는 폴라리스 토큰 변수 ✅ |
| 네이밍 | kebab-case, 의미 기반 (`logo-wordmark`, `icon-file-docx`, `illust-empty-search`) |
| 라이선스 | 사내용. 외부 OSS 라이선스 어셋 사용 시 출처 명시 |

> 토큰 정렬 가이드: 단색 아이콘은 `fill="currentColor"`로 만들어 사용처에서 `text-fg-primary` 등으로 색을 적용합니다. 멀티컬러(예: 파일 아이콘)는 SVG 안에서 `var(--brand-primary)` 같은 토큰 변수를 참조하거나, React 컴포넌트로 래핑해서 props로 색을 받습니다.

---

## 1. 로고 — **P0**

폴라리스 디자인 시스템의 첫 번째 어셋. 데모/템플릿/모든 생성 앱이 import.

| 종류 | 설명 | variant |
|---|---|---|
| 워드마크 | "Polaris Office" 풀 로고 | full color / mono(white) / mono(black) |
| 로고마크 | "P" 심볼만 | full color / mono(white) / mono(black) |
| 가로형 | 심볼 + 워드마크 한 줄 (헤더용) | 위 3 variant |
| 세로형 | 심볼 위, 워드마크 아래 (스플래시·로딩용) | 위 3 variant |

**사용 규정** 필요:
- Clear space (로고 주변 최소 여백, 보통 심볼 높이의 0.5~1배)
- Min size (web 24px / print 10mm 같은 기준)
- Do/Don't (회전·왜곡·색상 변경·배경 위 가독성)

**파일 사양**:
- SVG: 모든 variant
- PNG: 워드마크 가로형만 @1x(120px), @2x(240px), @3x(360px)
- Figma: 컴포넌트로 등록해서 사이즈/variant prop 변경 가능

---

## 2. Favicon / App icon — **P0**

브라우저 탭, OS 앱 아이콘, 모바일 홈스크린 추가 등.

| 사이즈 | 용도 |
|---|---|
| 16×16 / 32×32 / 48×48 | 브라우저 favicon (`.ico` 또는 SVG) |
| 180×180 | Apple touch icon (iOS 홈스크린) |
| 192×192 / 512×512 | Android 홈스크린 (`manifest.json`) |
| 512×512 maskable | PWA maskable (안전 영역 80% 가이드 준수) |
| 1200×630 | OG 이미지 (소셜 카드) |

**제품별 분기 검토**: NOVA 워크스페이스 / 폴라리스 오피스 / CRM / Sign 각각 favicon이 다르게 가야 하는지 결정 필요. 통합 1종 vs 제품별 4종.

---

## 3. 제품/브랜드 아이콘 — **P1**

각 폴라리스 제품·기능을 시각적으로 식별하는 마크.

| 마크 | 현재 상태 | 필요 작업 |
|---|---|---|
| Polaris Office (워드/엑셀/슬라이드/PDF) | 파일 타입 색상만 토큰화 (`fileType.docx/xlsx/pptx/pdf`) | 정식 글리프 + light/dark variant |
| NOVA AI | 보라 토큰 + lucide `<Sparkles>` 임시 사용 | NOVA 전용 마크 (sparkles 모티프 + 보라 그라디언트) |
| 폴라리스 사인 | 미정 | 새 마크 |
| 폴라리스 영업관리 (CRM) | 미정 | 새 마크 |

**사양**: 24×24 viewBox, 그래픽 스타일 통일 (모두 outlined / 모두 filled / 또는 명시된 hybrid 룰).

---

## 4. UI 아이콘 라이브러리 — **P1**

리본·툴바·메뉴에서 쓰는 일반 UI 아이콘. 현재는 [lucide-react](https://lucide.dev)를 best-effort로 사용 중 (예: `apps/demo/src/pages/PolarisOffice.tsx`의 ribbon 100+ 아이콘).

**전략 결정 필요**:
- (A) lucide 그대로 사용 + 폴라리스 brand-essential 아이콘 10~20개만 자체 제작 (`@polaris/icons` subpath)
- (B) 폴라리스 전용 아이콘 세트 100% 자체 제작 (대규모 작업)

추천: **(A)**. 디자인 시스템의 일관성에서 lucide의 24px / 1.5px stroke 스타일이 폴라리스 컴팩트 톤과 잘 맞고, 자체 제작은 brand 핵심에 집중.

**자체 제작 후보 (P1)**:
- 파일 타입 글리프: docx/xlsx/pptx/pdf/hwp (현재 `FileIcon` 컴포넌트가 색만 다르게 적용 중)
- NOVA 관련: AI 채팅 / AI write / 받아쓰기 / 배경 변경 (현재 lucide overlay 합성)
- 폴라리스 고유 액션: 바이브코딩, AI 도구 사용자 가이드, 변경내용 추적 등

**사양**: 24×24 viewBox, 1.5px stroke, `fill="currentColor"`, outlined 기본.

---

## 5. 일러스트레이션 — **P1**

빈 상태(empty state)·온보딩·에러 페이지 등의 큰 시각 요소. `<EmptyState>` 컴포넌트가 일러스트 prop을 받지만 현재는 호출자가 직접 채워 넣어야 함.

| 컨텍스트 | 우선순위 | variant 수 |
|---|---|---|
| Empty state — 검색 결과 없음 / 데이터 없음 / 첫 사용 | P1 | 3 |
| Empty state — 권한 없음 / 작업 완료 / 에러 발생 | P1 | 3 |
| 404 / 500 / 점검 중 | P2 | 3 |
| 온보딩 — 폴라리스 웰컴 / NOVA 소개 / 디자인 시스템 소개 | P2 | 3 |
| 마케팅·feature 페이지 (필요 시) | P2 | 미정 |

**사양**:
- SVG (필수), 라이트/다크 페어, max 200KB
- 사이즈 가이드: empty state는 240px 폭, 에러 페이지는 360px 폭
- 스타일 통일성: 컬러 팔레트 (브랜드 4색 + NOVA 보라 + 뉴트럴), 선 굵기, 기하학적 vs 부드러운 톤 — **디자인 팀이 1개 샘플로 합의 후 나머지 확장**

---

## 6. NOVA / AI 전용 시각 자산 — **P2**

NOVA 워크스페이스의 코스믹 hero 등 AI 컨텍스트 전용.

| 자산 | 현재 상태 | 필요 작업 |
|---|---|---|
| NOVA hero 배경 (코스믹) | 데모(`apps/demo/src/pages/NovaWorkspace.tsx`)에서 임시 그라디언트 | 정식 일러스트 / 비디오 / Lottie |
| AI thinking indicator | 미정 | 보라 sparkle 애니메이션 (Lottie 권장) |
| AI 응답 placeholder | 미정 | streaming 효과 (skeleton + sparkle) |
| 보라 그라디언트 모음 | brand.secondary 토큰 1개 | 3~5종 그라디언트 (linear/radial, NOVA/feature/error 등) |

---

## 7. 모션 / 인터랙션 — **P2**

마이크로 인터랙션. 대부분 CSS transition으로 충분하지만 일부는 시각 자산 필요.

| 자산 | 포맷 |
|---|---|
| NOVA thinking | Lottie (권장) — 반복 가능한 sparkle 애니메이션 |
| 파일 업로드 progress | Lottie 또는 SVG animation |
| 작업 완료 (성공) | Lottie (1.5초 이내) |
| 에러 발생 | Lottie (1초 이내) |

**모션 토큰 정의도 함께**: easing 곡선 3종(`ease-in`/`ease-out`/`ease-in-out`), duration 4단계(`fast` 100ms / `normal` 200ms / `slow` 400ms / `slower` 600ms)을 디자인 가이드와 같이 합의.

---

## 8. 톤 & 보이스 가이드 — **P2**

문구·마이크로카피 작성 원칙. 토큰화는 어렵지만 한국어 일관성을 위해 가이드 문서 1장 필요.

- 종결형 (~합니다 / ~해요 / ~해 — 어떤 걸 기본으로?)
- 에러 메시지 톤 (정중 / 직접적 / 가벼움)
- 빈 상태 메시지 패턴 ("아직 X가 없어요" vs "X를 추가해 보세요")
- AI 응답 거부/한계 표현 가이드 (NOVA가 답변 못 할 때)

---

## 9. 사진 / 스크린샷 — **P2** (선택)

마케팅 페이지·blog post용. 디자인 시스템에 직접 들어가지 않아도 되는 영역. 필요한 시점에 별도 요청.

---

## 우선순위 요약 (디자인 팀 1차 작업 범위)

**P0 (v0.7.0에 반드시 들어가야)**:
1. 로고 — 워드마크 + 로고마크 + 가로/세로형, 라이트/다크/모노, 사용 규정
2. Favicon / App icon — 6 사이즈

**P1 (v0.7.x 동안)**:
3. 제품 아이콘 — Office 4종 + NOVA + Sign + CRM
4. UI 아이콘 — 폴라리스 전용 10~20개 (brand-essential)
5. 일러스트레이션 — empty state 6종

**P2 (v0.8+)**:
6. NOVA 시각 자산 (hero, indicator)
7. 모션 / Lottie 4~5종
8. 톤 & 보이스 가이드

---

## 통합 형태 (개발 측 작업)

디자인 팀에서 어셋이 들어오면 이 시스템에 올리는 방식:

```
@polaris/ui/
├── src/
│   ├── assets/
│   │   ├── logo/          # SVG 컴포넌트
│   │   ├── icons/         # 단색 currentColor SVG
│   │   ├── product-icons/ # 멀티컬러 SVG
│   │   └── illustrations/ # 큰 일러스트
│   └── components/
│       ├── Logo.tsx       # variant·size prop
│       ├── ProductIcon.tsx
│       └── Illustration.tsx
```

별도 패키지로 분리할지(`@polaris/assets`) 또는 `@polaris/ui` subpath로 둘지(`@polaris/ui/assets`)는 어셋 총량 보고 결정 — Ribbon처럼 subpath가 무난.

