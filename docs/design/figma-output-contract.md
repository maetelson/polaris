# Figma Output Contract

Figma 산출물은 Web 구현과 같은 Polaris 계약을 공유해야 합니다. Figma 파일에 예쁜 시안만 남기지 말고, 어떤 Polaris 결정을 적용했는지 추적 가능해야 합니다.

## 필수 페이지

Figma 파일에는 다음 페이지를 둡니다.

1. `00 Polaris Output Contract`
2. `Polaris DS - Tokens`
3. `Polaris DS - Components`
4. 작업 화면별 페이지

`00 Polaris Output Contract`에는 이 문서의 핵심 규칙, `Polaris UI Brief` 템플릿, signature asset 매핑을 요약합니다.

## 프레임 규칙

- 주요 화면 프레임명은 목적이 드러나게 씁니다.
- 프레임 옆에는 brief 요약 note를 둡니다.
- note에는 화면 목적, signature asset, 토큰/색상 원칙, 검증 방법을 포함합니다.
- desktop, mobile 등 breakpoint가 있으면 같은 화면명 아래 variant처럼 묶습니다.

## 변수와 스타일

- Figma sync는 [figma/sync-polaris-figma.js](../../figma/sync-polaris-figma.js)를 Figma MCP `use_figma`로 실행합니다.
- color variable은 `docs/design/generated/polaris.tokens.json`의 Polaris semantic token 이름을 우선합니다.
- primitive ramp는 reference로만 두고 화면 직접 적용은 semantic token을 우선합니다.
- text style은 Polaris text scale 이름을 사용합니다.
- radius와 spacing은 Polaris scale 이름을 사용합니다.
- shadow/effect style은 upstream `shadow` token을 기준으로 생성합니다.

## Signature Asset 적용

| 화면 유형 | Figma에서 확인할 요소 |
| --- | --- |
| AI/NOVA | NOVA purple CTA, AI surface, `NovaLogo` 또는 명시적 NOVA label |
| 문서 편집 | Ribbon 또는 문서형 toolbar, 문서 canvas, 편집 아이콘 |
| 파일 목록 | 파일 타입별 icon, 확장자 텍스트 단독 사용 금지 |
| 운영/CRM | Table/Card/Badge 기반의 절제된 정보 구조 |
| 상태/피드백 | 상태 색상 + icon 또는 Badge/Alert 구조 |

## 금지 사항

- Polaris token과 무관한 임의 색상 팔레트
- AI 맥락이 아닌 NOVA purple 사용
- 파일 색상을 장식적 배경으로 사용하는 것
- 마케팅 랜딩처럼 큰 hero만 있고 실제 업무 UI가 없는 화면
- 프레임만 있고 brief note가 없는 주요 화면

## 완료 체크

- `00 Polaris Output Contract` 페이지가 있다.
- `Polaris / Color`, `Polaris / Number`, `Polaris/*` text style, `Polaris/shadow/*` effect style이 upstream checksum 기준으로 갱신되어 있다.
- 주요 화면마다 brief note가 있다.
- AI, 문서, 파일, 운영 화면별 signature asset이 반영되어 있다.
- 색상과 typography가 Polaris 토큰/스타일 이름으로 설명 가능하다.
- Web 구현자가 프레임을 보고 컴포넌트 매핑을 바로 추론할 수 있다.
