# Polaris UI Contract

이 문서는 `maetelson/polaris`에서 만드는 Figma와 Web UI의 톤앤매너 기준입니다. 사용자가 기획안만 주더라도 화면은 이 계약을 기준으로 Polaris답게 만들어야 합니다.

## 핵심 톤

- 1차 기준은 root `DESIGN.md`입니다. 이 파일은 upstream PolarisDesign `DESIGN.md`를 그대로 동기화한 기계/사람 공용 spec입니다.
- token source는 `vendor/polaris-design/packages/ui/src/tokens/*`, CSS 변수는 `vendor/polaris-design/packages/ui/src/styles/tokens.css`, Tailwind preset은 `vendor/polaris-design/packages/ui/src/tailwind/index.ts`를 기준으로 합니다.
- 차분한 생산성 UI: 과한 장식보다 반복 업무, 문서 작업, 검토 흐름에 어울리는 밀도와 질서를 우선합니다.
- 문서 중심: Polaris Office의 정체성은 문서, 파일, 편집, 검토, 공유 경험에서 드러나야 합니다.
- 토큰 우선: 색상, 타이포그래피, radius, spacing, shadow는 Polaris 토큰과 컴포넌트 결정을 먼저 따릅니다.
- NOVA purple은 AI 전용: 요약, 생성, 자동화, 분석, NOVA 진입점에서만 강하게 사용합니다.
- 파일 색상은 의미 전용: DOCX/HWP blue, XLSX green, PPTX orange, PDF red는 파일 타입 신호로 사용하고 장식용 accent로 쓰지 않습니다.

## Signature Asset 매핑

| 기획안 신호 | 반드시 검토할 Polaris 표현 |
| --- | --- |
| AI, NOVA, 자동화, 요약, 생성, 분석 | `ai.*`, NOVA purple, `NovaLogo`, AI CTA, AI response surface |
| 문서 편집, 보고서, 제안서, 오피스 도구 | Ribbon, ribbon icons, 문서 캔버스, 편집 툴바 |
| 파일 목록, 업로드, 다운로드, 확장자 | `FileIcon`, 파일 타입 색상, 파일 카드 |
| CRM, 계약, 승인, 리스트, 운영 | Table, Card, Badge, neutral surface, restrained hierarchy |
| 필터, 빠른 액션, 추천 질문 | Prompt chip 형태 |
| 오류, 성공, 경고, 정보 | Badge 또는 Alert와 icon 동반 |
| 브랜드 영역, 로그인, footer | `PolarisLogo` 또는 `NovaLogo` |

## 컴포넌트 우선순위

1. Polaris 컴포넌트와 토큰을 먼저 사용합니다.
2. 없는 컴포넌트는 Polaris 토큰만으로 조합합니다.
3. 외부 디자인 시스템, 임의 색상, 임의 spacing을 들여오지 않습니다.

Web 구현 기본값:

- 버튼: `Button`
- 입력: `Input`, `Textarea`, `Select`, `Combobox`
- 레이아웃: `Stack`, `Container`, `PageHeader`, `SectionHeader`
- 정보 구조: `Card`, `Table`, `DescriptionList`, `Badge`
- 피드백: `Alert`, `Toast`, `Progress`, `CircularProgress`
- 문서 편집: `@polaris/ui/ribbon`
- 아이콘: `@polaris/ui/icons`, `@polaris/ui/file-icons`, `@polaris/ui/logos`

## 색상 원칙

- 일반 CTA는 `accentBrand.*`를 사용합니다.
- AI CTA와 AI surface는 `ai.*`를 사용합니다.
- 본문과 보조 텍스트는 `label.*`를 사용합니다.
- 페이지와 카드 표면은 `background.*`, `layer.*`, `fill.*`를 사용합니다.
- 선과 구분자는 `line.*`를 사용합니다.
- 상태 색상은 `state.*`를 사용하되 색상만으로 의미를 전달하지 않습니다.

## 금지할 선택

- raw hex, `rgb()`, `hsl()`, CSS named color
- Tailwind arbitrary value
- Tailwind 기본 palette
- feature UI의 native form/control 요소 우선 사용
- 파일 타입 색상의 장식적 사용
- AI가 아닌 화면의 NOVA purple 강조
- 토큰만 맞고 Polaris signature asset이 없는 평범한 SaaS 화면

## 완료 기준

- UI 생성 전 `Polaris UI Brief`가 있다.
- brief의 signature asset이 화면에 실제로 반영되어 있다.
- `npm run polaris:validate`와 `npm run polaris:brief:check`가 통과한다.
- Figma 산출물에는 contract 페이지와 주요 프레임 brief note가 있다.
- Web 산출물은 `@polaris/ui`와 `@polaris/lint` 연결을 전제로 한다.
- 색상, 타입, 컴포넌트 우회가 없다.

## Automation Checks

- `npm run polaris:brand-audit:fixtures` must keep catching AI CTA, FileIcon, Ribbon, raw hex, Tailwind arbitrary/default palette, and native control violations.
- `npm run polaris:sync -- --check` must validate the `design-source` snapshot profile and fail on missing, changed, or stale managed files.
- `npm run polaris:links:check` must keep all local Markdown file/image links resolvable.
