# `<Badge>` Use Case 가이드

**의도**: `<Badge variant tone>` 두 axis가 의미 의존적이라 (`variant="primary"` 가 active인지 분류인지 모호), 컨슈머가 매번 같은 결정을 다시 하지 않도록 *상태 → variant + tone* 매핑을 한 페이지에 고정.

---

## API 두 axis 요약

```tsx
<Badge variant="..." tone="...">라벨</Badge>
```

| axis | 값 | 의미 |
|---|---|---|
| **`variant`** | `primary` / `secondary` / `success` / `warning` / `danger` / `info` / `neutral` | **의미 색** — 무엇을 나타내는가 |
| **`variant`** (파일) | `docx` / `xlsx` / `pptx` / `pdf` / `hwp` | 4-color 브랜드 = 파일 타입 별칭 |
| **`tone`** | `subtle` (default) / `solid` / `outline` | **시각 강도** — 얼마나 튀어야 하는가 |

`variant` 가 **이 뱃지가 *무엇*을 의미하는가**, `tone` 이 **얼마나 *강하게* 보일 것인가** 를 결정.

---

## 상태 매핑 (B2B SaaS 표준)

이 매핑을 따르면 페이지마다 결정이 흔들리지 않습니다.

### 활성 / 진행 상태

| 상태 | variant | tone | 시각 | 컨텍스트 |
|---|---|---|---|---|
| **활성** (Active) | `primary` | `subtle` | 옅은 파란 배경 + 진한 파랑 텍스트 | "현재 진행 중", "사용 중", "활성 계약" 등 |
| **활성 강조** (Active, 강한 시각) | `primary` | `solid` | 솔리드 파랑 + 흰 텍스트 | 활성이 *행의 핵심 정보*일 때 (예: "Live" 인디케이터) |
| **진행중** (In Progress) | `info` | `subtle` | 옅은 파란 (info와 primary가 같은 hex라 시각 동일) | "검토 중", "결재 대기" — 의미적으로 *알림*에 가까울 때 |

> **결정 룰**: 색이 "이 항목은 *살아있다*"는 의미면 `primary`. "이 항목이 *알림 / 상태 변화* 중"이면 `info`. 둘은 시각적으로 같지만 시맨틱이 다름 — SR / 다국어 라벨링 시 차이가 드러남.

### 완료 / 성공

| 상태 | variant | tone | 컨텍스트 |
|---|---|---|---|
| **완료** (Completed) | `success` | `subtle` | "결재 완료", "전송 성공", "승인됨" |
| **완료 강조** | `success` | `solid` | 완료가 *드물어서* 강조하고 싶을 때 (예: KPI 달성) |

### 경고 / 주의

| 상태 | variant | tone | 컨텍스트 |
|---|---|---|---|
| **경고** (Warning) | `warning` | `subtle` | "만료 임박", "확인 필요", "결재 대기 (지연)" |
| **경고 + 액션 필요** | `warning` | `solid` | dismissible + 액션 버튼 동반 — "지금 확인" 같은 CTA |

### 오류 / 거절 / 만료

| 상태 | variant | tone | 컨텍스트 |
|---|---|---|---|
| **오류** (Error) | `danger` | `subtle` | "유효성 오류", "전송 실패" |
| **거절** (Rejected) | `danger` | `subtle` | "결재 거절", "취소됨", "정책 위반" |
| **만료** (Expired) | `danger` | `subtle` | "계약 만료", "토큰 만료" |
| **삭제 / 영구 액션 표시** | `danger` | `solid` | 매우 드물게 — 보통 Badge 대신 `<Button variant="danger">` |

> v0.8에서 `status-danger` → `state-error` 로 토큰 이름 변경됐지만 **Badge variant 이름은 `danger` 그대로 유지** (시맨틱 직관 우선). codemod-v08 자동 변환 대상 아님.

### 정보 / 알림

| 상태 | variant | tone | 컨텍스트 |
|---|---|---|---|
| **알림** (Info) | `info` | `subtle` | 시스템 알림 / 도움말 / 가이드 라벨 |
| **새 항목** (New) | `danger` | `solid` (작은 dot) 또는 `info` `subtle` | 신규 라벨은 두 가지 — `state.new` 토큰의 빨간 dot (Avatar / 아이콘 위) vs Badge 라벨 |

### 비활성 / 보류 / 분류

| 상태 | variant | tone | 컨텍스트 |
|---|---|---|---|
| **비활성** (Inactive) | `neutral` | `subtle` | "사용 안 함", "보류", "초안" — 색 강조 없이 분류만 |
| **초안** (Draft) | `neutral` | `subtle` | "임시 저장", "작성 중" |
| **외곽 분류** (Tag, Category) | `neutral` | `outline` | 폴더 / 카테고리 / 부서 — 행을 시각적으로 분리하지 않는 라벨 |

> **결정 룰**: 색이 *시맨틱* 메시지가 없고 단순 분류라면 `neutral`. 분류 안에서도 강조가 필요하면 `subtle`, 외곽선만 필요하면 `outline`.

### AI / NOVA

| 상태 | variant | tone | 컨텍스트 |
|---|---|---|---|
| **AI 기능 표시** | `secondary` | `subtle` | "AI 추천", "NOVA 분석", "자동 작성" — AI Purple |
| **AI 강조** | `secondary` | `solid` | NOVA 진입 버튼 안 라벨 등 |

> `secondary` = AI Purple (`bg-ai-normal`). `<Button variant="ai">` 와 시각 페어. AI / NOVA 컨텍스트에서만 사용 — 일반 강조에 쓰지 말 것.

### 파일 타입

| variant | hex | use case |
|---|---|---|
| `docx` / `hwp` | Blue (`#1D7FF9`) | Word / 한글 문서 |
| `xlsx` | Green (`#51B41B`) | Excel / 스프레드시트 |
| `pptx` | Orange (`#FD8900`) | PowerPoint / 프레젠테이션 |
| `pdf` | Red (`#F95C5C`) | PDF |

> 대부분의 경우 `<Badge variant="docx">` 대신 **`<FileIcon type="docx">`** 가 우선 — 텍스트 라벨보다 아이콘이 시각 정체성 강화. Badge 형태가 필요한 경우 (예: 표 셀 안에 텍스트 + 색) 만 사용.

---

## `tone` 결정 가이드

```
보더 + 옅은 배경 + 진한 텍스트     →  subtle  (default — 90% 케이스)
솔리드 배경 + 반전 텍스트          →  solid   (강조 또는 액션 인접)
보더만 + 투명 배경                 →  outline (분류 / 카테고리)
```

- **`subtle`** — 거의 모든 상태 표시의 기본값. 가독성 + 시각 부담 균형
- **`solid`** — 행에 *한 개*만 둘 때 또는 KPI / 강한 알림. 페이지에 solid Badge 가 5개 이상이면 *시맨틱이 흐려짐*
- **`outline`** — 분류 / 필터 / 카테고리. 시맨틱 색은 없고 그룹화만

---

## 안티 패턴

❌ **솔리드 남발** — 한 페이지에 `tone="solid"` 가 여러 개면 의미가 흐려짐. 강조는 *한 개*가 원칙.

❌ **활성 / 완료 / 오류를 같은 색으로** — `variant`가 시맨틱이라 임의로 통일하면 SR / 다국어 / 다크모드 일관성이 깨짐.

❌ **AI Purple (`secondary`) 을 일반 강조에 사용** — AI / NOVA 컨텍스트 *전용*. 일반 강조는 `primary`.

❌ **`danger` 를 destructive 버튼 대용으로** — 빨간 Badge 가 클릭 가능 액션을 의미하면 안 됨. 액션은 `<Button variant="danger">`.

❌ **`tone="subtle"` 위에 white 텍스트 추가** — `subtle` tone 이 이미 텍스트 색까지 자동. className 으로 덮어쓰지 말 것.

❌ **Filter chip 으로 일반 Badge 사용** — 필터는 `<PromptChip>` 또는 `<Badge dismissible onDismiss>` (rc.7 stage). dismissible 없는 Badge 는 *비클릭* 라벨.

---

## 자주 쓰는 조합 cheat-sheet

```tsx
// 계약 상태 (한국어)
<Badge variant="primary">진행중</Badge>            // 진행 중 (살아있음)
<Badge variant="success">완료</Badge>              // 결재 완료
<Badge variant="warning">결재 대기</Badge>          // 지연 / 주의
<Badge variant="danger">거절</Badge>               // 거절 / 만료
<Badge variant="neutral">초안</Badge>              // 작성 중 (시맨틱 없음)

// 파일 / 첨부 표시
<Badge variant="docx">DOCX</Badge>                 // (FileIcon 우선)
<Badge variant="pdf">PDF</Badge>

// 알림 / 새
<Badge variant="info">새 알림</Badge>
<Badge variant="danger" tone="solid">●</Badge>     // 빨간 dot

// 분류 / 카테고리
<Badge variant="neutral" tone="outline">영업</Badge>
<Badge variant="neutral" tone="outline">기술</Badge>

// 강조 (한 페이지에 한 개)
<Badge variant="primary" tone="solid">Live</Badge>
<Badge variant="success" tone="solid">베스트</Badge>

// AI / NOVA
<Badge variant="secondary">AI 추천</Badge>
<Badge variant="secondary" tone="solid">NOVA</Badge>

// dismissible 필터 chip (rc.7 stage)
<Badge variant="primary" dismissible onDismiss={() => removeFilter('dept:영업')}>
  영업
</Badge>
```

---

## 다른 컴포넌트와 페어

| Badge variant | 페어 컴포넌트 | 비고 |
|---|---|---|
| `primary` | `<Button variant="primary">` | 같은 페이지의 핵심 강조 단일 |
| `secondary` (AI) | `<Button variant="ai">` + `<NovaLogo>` | NOVA 컨텍스트 일관성 |
| `success` / `warning` / `danger` | `<Alert variant="..">` | (Alert 유지 결정 후) — 동일 시맨틱 |
| `danger` (dot, solid) | `<Avatar>` corner | "새 알림" 인디케이터 |
| `docx`-`pdf` | `<FileIcon>` / `<FileCard>` | 파일 컨텍스트 묶음 |

---

이 가이드를 따르면 페이지마다 *어느 variant + tone* 결정에 5초 이상 쓸 일이 없습니다. 새 use case 가 등장하면 이 문서에 추가해 두 번째 결정 시간이 다시 0이 되도록.
