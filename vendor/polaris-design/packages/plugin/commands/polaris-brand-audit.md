---
description: 폴라리스 시각 정체성 점검 — signature 자산 활용 기회 탐색 (lint으론 못 잡는 휴리스틱)
---

`/polaris-check`가 토큰 위반(mechanical)을 잡는다면, `/polaris-brand-audit`는 **Polaris signature 자산을 어디에 적용할 수 있는지 휴리스틱 분석**을 합니다. 외부 사이트 검수에서 반복 발견된 패턴 — "토큰만 load하고 평범한 SaaS로 보임" — 을 방지.

## 목적

코드베이스가 토큰은 잘 쓰는데 시각적 정체성(NOVA Purple, FileIcon, Ribbon, PromptChip)을 안 써서 평범해 보이는 경우, 적용 기회를 식별합니다. **lint은 false positive 때문에 강제 못 함** — 사람이 검토해야 함.

## 절차

다음 7가지 패턴을 grep으로 찾아 적용 후보를 사용자에게 보고합니다. 각 항목별로 **코드 위치(파일:라인) + 현재 코드 + 제안 변경**을 제시.

### 1. AI 기능 버튼인데 `variant="ai"` 미사용

`<Button>` 안에 다음 키워드 텍스트가 있고 `variant="ai"`가 아닌 경우 → 제안:

```sh
grep -rnE '<Button[^>]*>[^<]*(AI|NOVA|자동|생성|분석|요약|챗|Chat|Analyze)[^<]*' src --include="*.tsx" \
  | grep -v 'variant="ai"' | grep -v 'variant=\\"ai\\"'
```

**제안**: `<Button variant="ai"><NovaLogo tone="white" size={16} /> {label}</Button>`

### 2. 파일 형식 텍스트인데 `<FileIcon>` 미사용

```sh
grep -rnE '\b(DOCX|HWP|PDF|XLSX|PPTX|TXT|CSV|ZIP|HWPX)\b' src --include="*.tsx" \
  | grep -v "<FileIcon" | grep -v "import.*FileIcon"
```

**제안**: 텍스트 옆 또는 대신 `<FileIcon type="docx|hwp|pdf|xlsx|pptx|txt|csv|zip" size={20|32} />`. 29종 사용 가능.

### 3. 문서 편집 페이지인데 `<Ribbon>` 미사용

페이지가 "편집기" / "에디터" / "보고서" / "제안서" / "문서 작성" 도메인인데 `@polaris/ui/ribbon` import가 없는 경우:

```sh
grep -rlE '에디터|편집|보고서|제안서|문서.*작성|에디터' src --include="*.tsx" \
  | xargs grep -L 'from .@polaris/ui/ribbon.'
```

**제안**: Office 스타일 ribbon 도입. `/polaris-office`, `/proposal-platform` 데모 페이지 참고. Polaris의 가장 큰 차별 자산.

### 4. 평범 chip / button 그룹 → `<PromptChip>` 후보

필터 / 카테고리 / 빠른 액션 형태의 button cluster:

```sh
grep -rnE 'rounded-polaris-(pill|full)[^"]*"[^>]*>[^<]+</button>' src --include="*.tsx"
```

**제안**: `<PromptChip onClick={...}>{label}</PromptChip>` — NOVA hover 효과 / AI 친화 디자인.

### 5. 사이드바 active state에 `bg-accent-brand-bg` 미사용

```sh
grep -rnE 'active.*text-accent-brand|active.*text-brand' src --include="*.tsx" \
  | grep -v 'bg-accent-brand-bg'
```

**제안**: active 상태에 `bg-accent-brand-bg text-accent-brand-normal` 페어 (DESIGN.md §4 Navigation).

### 6. NOVA 그라디언트 적용 후보 텍스트

헤로 / 헤딩에 "AI", "자동", "NOVA" 키워드가 있는 경우 그라디언트 강조 후보:

```sh
grep -rnE '<(h1|h2)[^>]*>[^<]*(AI|NOVA|자동)' src --include="*.tsx"
```

**제안**: 키워드 한 단어만 NOVA 그라디언트 (`linear-gradient(135deg, var(--polaris-purple-40), var(--polaris-ai-normal))` + `bg-clip-text text-transparent`).

### 7. 브랜드 마크 미노출

```sh
grep -rL "PolarisLogo\|NovaLogo" src --include="*.tsx"
```

**제안**: Footer에 `<PolarisLogo variant="horizontal" size={16} />` "Powered by Polaris" 또는 NOVA 영역 헤더에 `<NovaLogo>`.

## 보고 형식

각 적용 기회를 다음 표로 정리:

```
| 우선순위 | 위치 | 현재 | 제안 | 영향 |
|---|---|---|---|---|
| 🔴 | src/Hero.tsx:42 | <Button>AI 분석</Button> | <Button variant="ai"><NovaLogo /> AI 분석</Button> | 즉시 시각 차이 |
| 🟡 | src/StepCard.tsx:18 | <span>DOCX</span> | <FileIcon type="docx" size={20} /> | 한 줄 코드 |
...
```

우선순위:
- 🔴 **높음** — 핵심 CTA / 헤로 / 자주 보이는 곳 (즉각적 시각 임팩트)
- 🟡 **중간** — 데이터 포인트 (FileIcon 적용 등)
- 🟢 **낮음** — 미세 조정 (Footer 브랜드 마크 등)

## 마지막 단계

보고 끝에 reference 링크 명시:

> 참고 구현: https://polarisoffice.github.io/PolarisDesign/#/proposal-platform — 9가지 signature 자산 모두 적용된 데모 페이지. 하단 IDENTITY CHECKLIST 섹션이 항목별 매핑.

## 주의

- 이 명령은 **휴리스틱**입니다 — false positive 가능. 사용자가 검토 후 적용/거절 결정.
- mechanical 토큰 위반은 `/polaris-check`로 별도 검사.
- 새 코드 작성 시 *애초에 적용*하는 게 검수보다 효율적 — `polaris-web` 스킬 §4-1 참고.
