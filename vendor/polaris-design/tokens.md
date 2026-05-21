# Polaris Design Tokens — Reference

> **이 문서는 사양(spec)입니다.** 실제 토큰 값은 [`packages/ui/src/tokens/*.ts`](packages/ui/src/tokens)에 정의되어 있고, 데모의 [`/#/tokens`](https://polarisoffice.github.io/PolarisDesign/#/tokens) 페이지가 그 값을 시각적으로 보여줍니다. `packages/ui/src/styles/tokens.css`는 [`scripts/build-tokens.ts`](packages/ui/scripts/build-tokens.ts)로 자동 생성되며 손으로 편집하지 않습니다 — 실수로 편집하면 CI가 차단합니다.
>
> 이 문서를 갱신할 때는 **사양(이 문서) → 코드(`tokens.ts`) → CSS(자동) → 데모 페이지(자동)** 순서. hex 값을 바꾸려면 `tokens.ts`만 수정하고 `pnpm --filter @polaris/ui build:tokens`을 돌리면 나머지가 따라옵니다.

`🟡 confirm` 표시는 디자인 팀과의 사용자 확인이 아직 안 끝난 항목.

---

## 0. 토큰 명명 원칙

- 토큰 이름은 **시맨틱 의미**로 (예: `brand.primary`, `text.muted`). 기준 색상값(`brand.blue`)도 같이 expose하되, 컴포넌트는 시맨틱만 사용.
- **다크모드 페어를 항상 함께 정의**. 한쪽만 정의된 토큰이 있으면 다크모드 전환 시 깨짐. (mode-independent한 radius·spacing은 예외)
- **단일 소스 원칙**: 같은 색의 두 시맨틱이 있다면 한쪽이 다른 쪽을 참조하도록 정의. 예) `file.docx` 는 `brand.blue`와 동일 hex. 두 곳에 같은 hex를 직접 박지 않음 — 한 번 변경하면 자동 전파.
- **camelCase로 표기** (예: `brand.primaryHover`, `surface.borderStrong`). 이 문서·`tokens.ts`·`/tokens` 페이지 모두 같은 표기.

> **TS API ↔ Tailwind 클래스명 매핑**
> 이 문서는 TS 토큰 네임스페이스(`text.primary` 등)를 그대로 사용합니다. Tailwind preset은 `text-` 유틸리티 prefix와 충돌을 피하기 위해 텍스트 색상만 `fg` 네임스페이스로 노출 — 즉 Tailwind 클래스는 `text-fg-primary`, `text-fg-on-brand`. CSS 변수(`--polaris-text-*`)와 TS export(`text.primary`)는 그대로.

---

## 1. 컬러 토큰

### 1.1 브랜드 팔레트 — 4색 + NOVA

폴라리스 브랜드 아이덴티티는 **4색 팔레트(파랑·초록·주황·빨강) + NOVA 보라**. 로고 자체가 이 4색을 조합한 형태이고, 파일 타입 컬러(docx/xlsx/pptx/pdf)와 브랜드 컬러는 **완전히 동일한 hex**. 분리하지 않고 시맨틱 별칭만 추가.

| 토큰 | Light | Dark | 별칭 |
|---|---|---|---|
| `brandPalette.blue` | `#2B7FFF` 🟡 confirm | `#5C9FFF` | ≡ `brand.primary`, `fileType.docx`, `fileType.hwp` |
| `brandPalette.green` | `#1FAE53` 🟡 confirm | `#3FCB72` | ≡ `fileType.xlsx` |
| `brandPalette.orange` | `#F37021` 🟡 confirm | `#FF8F4D` | ≡ `fileType.pptx` |
| `brandPalette.red` | `#E5413A` 🟡 confirm | `#FF6962` | ≡ `fileType.pdf` |
| `brandPalette.purple` | `#7C5CFF` 🟡 confirm | `#9B85FF` | ≡ `brand.secondary` (NOVA/AI) |

### 1.2 브랜드 시맨틱 (Aliases)

primary는 일반 액션·링크·포커스, secondary는 NOVA/AI 컨텍스트.

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `brand.primary` | `#2B7FFF` (= blue) | `#5C9FFF` | 주 액션, 활성 네비, 일반 강조, 링크 |
| `brand.primaryHover` | `#1E66DB` | `#7AA5F5` | primary hover 상태 |
| `brand.primarySubtle` | `#E8EFFF` | `#1A2238` | 선택된 메뉴 배경, primary 칩 배경 |
| `brand.secondary` | `#7C5CFF` (= purple) | `#9B85FF` | NOVA/AI 액션, AI 컨텍스트 강조 |
| `brand.secondaryHover` | `#6B47FF` | `#A896FF` | secondary hover 상태 |
| `brand.secondarySubtle` | `#F3EFFF` | `#2A2247` | AI 영역 배경, AI 칩/배지 배경 |

> 💡 **사용 규칙**:
> - 일반 페이지 버튼·링크·포커스 → `brand.primary` (파랑)
> - AI/NOVA 기능(생성·요약·자동완성·NOVA 진입) → `brand.secondary` (보라)
> - 파일 표상(아이콘·필터 칩·파일 카드) → `fileType.*`
> - 같은 화면에서 primary와 secondary를 혼용하지 말 것 — 컨텍스트로 하나만 선택
> - 일반 차트 색상에 `fileType.*`을 차용하지 말 것 — 별도 차트 팔레트 추후 정의

### 1.3 파일 타입 (시맨틱 alias)

| 토큰 | Light | Dark | 의미 |
|---|---|---|---|
| `fileType.docx` | `#2B7FFF` (= blue) | `#5C9FFF` | 워드 |
| `fileType.hwp` | `#2B7FFF` (= blue) | `#5C9FFF` | 한글 (워드와 동일) |
| `fileType.xlsx` | `#1FAE53` (= green) | `#3FCB72` | 엑셀 |
| `fileType.pptx` | `#F37021` (= orange) | `#FF8F4D` | 파워포인트 |
| `fileType.pdf` | `#E5413A` (= red) | `#FF6962` | PDF |

### 1.4 상태 (Status)

success / warning / danger / info — 각 상태별 hover 변형 포함. Toast / Alert / Badge / Form 검증에 사용.

| 토큰 | Light | Dark |
|---|---|---|
| `status.success` | `#16A34A` | `#3FCB72` |
| `status.successHover` | `#138A3F` | `#58D788` |
| `status.warning` | `#EAB308` | `#FFD64A` |
| `status.warningHover` | `#C99B0A` | `#FFE17A` |
| `status.danger` | `#DC2626` | `#FF6962` |
| `status.dangerHover` | `#B91C1C` | `#FF8782` |
| `status.info` | `#2563EB` | `#5C9FFF` |
| `status.infoHover` | `#1D4ED8` | `#7AB1FF` |

> Tailwind preset은 `bg-status-success/15` 같은 alpha modifier로 subtle 배경을 만들기 때문에 별도 `*.subtle` 토큰을 두지 않습니다. solid bg는 `bg-status-success`, hover는 `hover:bg-status-success-hover`.

### 1.5 뉴트럴 (12단계)

`neutral.0` (가장 밝음) → `neutral.1000` (가장 어두움). 다크모드는 자동 반전이 아닌 **별도 페어**로 정의.

| 토큰 | Light | Dark | 주요 용도 |
|---|---|---|---|
| `neutral.0`    | `#FFFFFF` | `#0B0B12` | 페이지 배경 (light), 본문 (dark) |
| `neutral.50`   | `#FAFAFB` | `#131320` | |
| `neutral.100`  | `#F4F4F7` | `#1B1B2A` | 서피스 (sunken) |
| `neutral.200`  | `#E8E8EE` | `#232336` | 일반 보더 |
| `neutral.300`  | `#D5D5DE` | `#2D2D45` | 강조 보더 |
| `neutral.400`  | `#B5B5C4` | `#4A4A66` | |
| `neutral.500`  | `#8C8CA0` | `#6B6B85` | 비활성 / 메타 텍스트 |
| `neutral.600`  | `#6E6E84` | `#8B8BA3` | |
| `neutral.700`  | `#4F4F63` | `#B4B4C8` | 보조 텍스트 |
| `neutral.800`  | `#2F2F40` | `#D5D5DE` | |
| `neutral.900`  | `#1A1A26` | `#EDEDF2` | |
| `neutral.1000` | `#0B0B12` | `#FFFFFF` | 본문 (light), 페이지 배경 (dark) |

🟡 **confirm**: 본문 텍스트가 `#1A1A26`(neutral.900)인지 `#0B0B12`(neutral.1000)인지. 현재 `text.primary` → `neutral.1000` (`#0B0B12`).

### 1.6 Surface / Text (의미 alias)

가장 자주 쓰이는 시맨틱 그룹. 컴포넌트 코드는 거의 항상 이 토큰을 통해 색을 사용.

| 토큰 | Light | Dark | 의미 |
|---|---|---|---|
| `surface.canvas`       | `neutral.50`  | `neutral.0`   | 페이지 배경 |
| `surface.raised`       | `neutral.0`   | `neutral.100` | 카드, 모달, navbar |
| `surface.sunken`       | `neutral.100` | `neutral.50`  | 안쪽 영역 (검색바 안 배경 등) |
| `surface.border`       | `neutral.200` | `neutral.200` | 일반 보더 |
| `surface.borderStrong` | `neutral.300` | `neutral.300` | 강조 보더 (input outline) |
| `text.primary`         | `neutral.1000` | `neutral.1000` | 본문 |
| `text.secondary`       | `neutral.700`  | `neutral.700`  | 보조 본문 |
| `text.muted`           | `neutral.500`  | `neutral.500`  | 비활성 / 메타 |
| `text.onBrand`         | `#FFFFFF` | `#FFFFFF` | 브랜드 컬러 위 텍스트 |
| `text.onStatus`        | `#FFFFFF` | `#FFFFFF` | status solid bg 위 텍스트 |

> Tailwind 매핑 reminder: `text.primary` → 클래스는 `text-fg-primary`, CSS 변수는 `--polaris-text-primary`.

🟡 **confirm**: NOVA 페이지의 코스믹 보라 그라디언트 배경을 별도 토큰(`surface.novaCanvas`)으로 둘지, 페이지에서만 쓰는지.

---

## 2. 타이포그래피

### 2.1 패밀리

| 토큰 | 값 |
|---|---|
| `fontFamily.sans` | `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif` |
| `fontFamily.mono` | `"JetBrains Mono", "D2Coding", ui-monospace, monospace` |

🟡 **confirm**: Pretendard 라이선스(SIL OFL 1.1) 사내 승인 + 호스팅 방식(CDN vs self-host).

### 2.2 무게 (Weight)

| 토큰 | 값 |
|---|---|
| `fontWeight.regular`  | 400 |
| `fontWeight.medium`   | 500 |
| `fontWeight.semibold` | 600 |
| `fontWeight.bold`     | 700 |

Pretendard Variable은 100~900 가변 폰트지만 폴라리스에선 위 4단계만 사용.

### 2.3 텍스트 스타일 (8단계)

| 토큰 | size / line-height / weight / tracking | 용도 |
|---|---|---|
| `textStyle.displayLg` | 48 / 60 / 700 / -0.025em | 랜딩 히어로 |
| `textStyle.displayMd` | 36 / 44 / 700 / -0.02em | 섹션 타이틀 |
| `textStyle.headingLg` | 24 / 32 / 600 / -0.01em | 페이지 제목 |
| `textStyle.headingMd` | 20 / 28 / 600 / -0.005em | 카드 제목 |
| `textStyle.headingSm` | 16 / 24 / 600 / 0 | 소제목 |
| `textStyle.bodyLg`    | 16 / 24 / 400 / 0 | 본문 |
| `textStyle.bodySm`    | 14 / 20 / 400 / 0 | 보조 본문, 라벨, input 텍스트 |
| `textStyle.caption`   | 12 / 16 / 400 / 0 | 메타, 캡션, 작은 라벨 |

Tailwind 클래스: `text-polaris-display-lg`, `text-polaris-heading-md`, `text-polaris-body-sm`, `text-polaris-caption` 등.

---

## 3. 스페이싱

별도 시맨틱 토큰이 아닌 **Tailwind 4px 베이스 스케일**을 그대로 채택. `tokens.ts`에 `spacing` 객체로 export되어 있어 코드에서 직접 사용 가능 (필요하면).

| 토큰 | px |
|---|---|
| `spacing.0`   | 0 |
| `spacing.0.5` | 2 |
| `spacing.1`   | 4 |
| `spacing.1.5` | 6 |
| `spacing.2`   | 8 |
| `spacing.2.5` | 10 |
| `spacing.3`   | 12 |
| `spacing.3.5` | 14 |
| `spacing.4`   | 16 |
| `spacing.5`   | 20 |
| `spacing.6`   | 24 |
| `spacing.7`   | 28 |
| `spacing.8`   | 32 |
| `spacing.9`   | 36 |
| `spacing.10`  | 40 |
| `spacing.12`  | 48 |
| `spacing.14`  | 56 |
| `spacing.16`  | 64 |
| `spacing.20`  | 80 |
| `spacing.24`  | 96 |

> 별도 시맨틱 토큰을 만들지 않는 이유: Tailwind 기본이 이미 업계 표준이고, 모델이 자연스럽게 사용할 수 있는 값이라 진입 장벽이 가장 낮음. 단 `p-[13px]` 같은 임의값은 `@polaris/lint`의 `no-arbitrary-tailwind`가 차단.

---

## 4. 반경 (Radius)

mode-independent (light/dark 동일).

| 토큰 | 값 | 용도 |
|---|---|---|
| `radius.sm`   | `6px`    | 작은 칩, 토글, ribbon 컨트롤 |
| `radius.md`   | `10px`   | 버튼, 인풋 |
| `radius.lg`   | `14px`   | 카드 |
| `radius.xl`   | `20px`   | 모달, 큰 표면 |
| `radius.full` | `9999px` | 알약, 아바타, 토글 스위치 |

🟡 **confirm**: 카드 radius가 12 / 14 / 16 중 어느 값. 현재 `radius.lg = 14px`.

---

## 5. 그림자 (Shadow)

라이트/다크 페어로 정의. 다크 모드에서는 의도적으로 옵코핵을 더 진하게.

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `shadow.xs` | `0 1px 2px rgba(15,15,35,0.06)`  | `0 1px 2px rgba(0,0,0,0.40)`  | 미세 강조, hover 살짝 |
| `shadow.sm` | `0 2px 6px rgba(15,15,35,0.08)`  | `0 2px 6px rgba(0,0,0,0.45)`  | 카드, navbar |
| `shadow.md` | `0 8px 20px rgba(15,15,35,0.10)` | `0 8px 20px rgba(0,0,0,0.50)` | 드롭다운, 토스트, 팝오버 |
| `shadow.lg` | `0 20px 40px rgba(15,15,35,0.14)` | `0 20px 40px rgba(0,0,0,0.60)` | 모달, 큰 overlay |

Tailwind: `shadow-polaris-xs/sm/md/lg`. 다크 모드는 `[data-theme="dark"]`가 자동으로 dark variant 적용.

---

## 6. Breakpoint

Tailwind 기본 그대로.

| 토큰 | px |
|---|---|
| `breakpoint.sm`   | 640  |
| `breakpoint.md`   | 768  |
| `breakpoint.lg`   | 1024 |
| `breakpoint.xl`   | 1280 |
| `breakpoint.2xl`  | 1536 |

---

## 7. 컨테이너 폭

| 토큰 | px |
|---|---|
| `container.sm`   | 640 |
| `container.md`   | 768 |
| `container.lg`   | 1024 |
| `container.xl`   | 1200 |
| `container.full` | 100% |

---

## 🟡 사용자 확인 필요 항목 요약

1. **brandPalette.blue (= primary, file.docx, file.hwp) 정확한 hex**: 추정 `#2B7FFF`
2. **brandPalette.green (= file.xlsx) 정확한 hex**: 추정 `#1FAE53`
3. **brandPalette.orange (= file.pptx) 정확한 hex**: 추정 `#F37021`
4. **brandPalette.red (= file.pdf) 정확한 hex**: 추정 `#E5413A`
5. **brandPalette.purple (= secondary, NOVA) 정확한 hex**: 추정 `#7C5CFF`
6. **본문 텍스트 컬러**: `#1A1A26` (neutral.900) vs `#0B0B12` (neutral.1000) — 현재 후자 사용
7. **Pretendard 사내 라이선스 승인** + 호스팅 방식 (CDN vs self-host)
8. **카드 radius**: 12 / 14 / 16 중 어느 값 — 현재 `radius.lg = 14px`
9. **AI 그라디언트 토큰**: NOVA 별 모양 / hero에 사용하는 보라 그라디언트를 `gradient.ai` 토큰으로 만들지
10. **링크 컬러** = `brand.primary`로 통일할지 별도 `link.default` 토큰을 만들지
11. **NOVA hero 배경**: `surface.novaCanvas` 같은 별도 surface 토큰으로 둘지

---

## 다음 단계

1. 위 🟡 confirm 항목을 디자인 팀과 30분 워크숍에서 일괄 결정
2. 합의된 hex 값을 `packages/ui/src/tokens/colors.ts`에 반영 → `pnpm --filter @polaris/ui build:tokens`로 CSS/CSS 변수 자동 동기화
3. 데모의 [`/#/tokens`](https://polarisoffice.github.io/PolarisDesign/#/tokens) 페이지에서 변경된 swatches 시각 확인
4. 디자인 자산(로고·아이콘·일러스트) 요청은 [`docs/archive/design-assets-v07.md`](docs/archive/design-assets-v07.md) 참조
