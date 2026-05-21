# Variant 의미 축 명문화

`@polaris/ui` 컴포넌트의 `variant` prop은 컴포넌트마다 다른 의미 축을 가집니다. "왜 Toast엔 `primary`가 없는데 Badge엔 있어?" 같은 혼동이 흔하므로 한 페이지에서 정리합니다.

> 결론: **variant 어휘를 통일하지 않습니다.** 각 컴포넌트의 사용 의도가 달라서, 억지 통일은 의미를 흐리게 합니다. 대신 어떤 축인지 명시합니다.

---

## 4가지 variant 축

| 축 | 의미 | 어휘 |
|---|---|---|
| **status** | 상태 통신 (성공/경고/실패/정보) | `success / warning / danger / info / neutral` |
| **emphasis** | 시각적 강조 hierarchy | `primary / secondary / outline / ghost / danger` |
| **brand** | 브랜드 컨텍스트 | `primary (= blue) / secondary (= NOVA purple)` |
| **domain** | 폴라리스 고유 도메인 (파일 타입) | `docx / hwp / xlsx / pptx / pdf` |

---

## 컴포넌트별 축 매핑

| 컴포넌트 | 축 | variants |
|---|---|---|
| **Button** | emphasis | `primary / secondary / outline / ghost / danger` |
| **Toast** | status | `success / warning / danger / info / neutral` |
| **Alert** | status | `success / warning / danger / info / neutral` |
| **Badge** | brand + status + domain (혼재) | `primary / secondary` (brand) · `success / warning / danger / info / neutral` (status) · `docx / hwp / xlsx / pptx / pdf` (domain) |
| **Drawer** | layout | `right / left / top / bottom` (`side`로 명명) |
| **Card** | layout | `bare / padded` |
| **Table** | density | `compact / comfortable / relaxed` |
| **Stack** | layout | `row / column` (`direction`으로 명명) |
| **Container** | size | `sm / md / lg / xl / 2xl / full` |

---

## 결정 트리: 어떤 컴포넌트에 어떤 축?

### Toast vs Alert (둘 다 status 축)
- **Toast** — 일시적 피드백 ("저장됨", "변경됨", "복사됨"). 자동 사라짐. 액션 가능 (Undo).
- **Alert** — 지속적 컨텍스트 ("권한 부족", "RPC 에러", "구독 만료 임박"). 사용자가 닫거나 페이지 navigation 전까지 유지.

### Badge variant 선택
- **brand** (`primary / secondary`) — AI 컨텍스트, 일반 카운트, 마케팅 강조 — 의미 없는 시각적 강조
- **status** (`success / ...`) — 명확한 상태 통신 — "PR merged", "결재 대기"
- **domain** (`docx / xlsx / ...`) — 파일 타입 인디케이터 — FileCard와 짝

같은 화면에서 brand·status·domain을 혼용하면 정보가 분산됩니다. 화면 단위로 1-2축으로 묶는 것이 권장.

### Button emphasis 선택
- `primary` — 화면당 1-2개. 가장 중요한 액션 (저장, 제출, 다음 단계)
- `secondary` — 보조 액션 (취소, 뒤로). NOVA 보라가 들어가지 **않음** — 예외: AI 트리거 버튼은 `secondary`로 보라 사용 OK
- `outline` — 동등한 경쟁 액션이 여러 개일 때
- `ghost` — 메뉴, 툴바 아이콘 버튼 — 무게가 가장 가벼움
- `danger` — 파괴적 액션 (삭제, 영구 종료)

---

## 향후 계획 (v0.3.0+)

- Badge의 3축 혼재는 인지 부하가 큽니다. v0.4에서 `tone="brand|status|file"` + `value="..."` 형태로 분리하는 BREAKING change RFC 예정. **그 전까지는 현재 어휘 유지.**
- `success-strong / success-subtle` 같은 톤 축을 status 컴포넌트(Alert, Toast)에 추가할지 검토 중. 현재는 Tailwind alpha modifier(`bg-status-success/15`)로 우회.
