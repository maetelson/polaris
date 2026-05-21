# UI Brief Template

기획안만 받은 상태에서 UI를 만들기 전에 반드시 아래 템플릿을 한국어로 출력합니다. 이 브리프는 구현 허가 요청이 아니라, Polaris 톤앤매너로 해석한 결정 기록입니다.

```md
## Polaris UI Brief
- 화면 목적:
- 사용자/상황:
- 톤앤매너:
- Polaris signature asset:
- 컴포넌트 매핑:
- 토큰/색상 원칙:
- 금지할 선택:
- 검증 방법:
```

## 작성 규칙

- 각 항목은 1~2문장으로 짧게 씁니다.
- 사용자가 준 기획안에 없는 제품 요구사항을 invent하지 않습니다.
- 대신 Polaris 표현 방식은 적극적으로 결정합니다.
- AI, 문서, 파일, 운영 화면 중 어디에 속하는지 반드시 분류합니다.
- Figma와 Web 중 어느 산출물인지 명시합니다.

## 예시

```md
## Polaris UI Brief
- 화면 목적: 계약 문서 목록을 빠르게 찾고 검토 상태를 확인하는 운영 화면입니다.
- 사용자/상황: 계약 담당자가 반복적으로 목록을 훑고 파일을 열어 검토합니다.
- 톤앤매너: 차분한 neutral surface와 조밀한 Table 중심으로 구성하고, 장식적 hero는 만들지 않습니다.
- Polaris signature asset: PDF/DOCX는 FileIcon으로 표시하고, 상태는 Badge와 icon을 함께 씁니다.
- 컴포넌트 매핑: PageHeader, Table, Badge, FileIcon, Button, Input 검색 패턴을 사용합니다.
- 토큰/색상 원칙: 기본 CTA는 accentBrand, 상태는 state.* + bg tint, 본문은 label.*만 사용합니다.
- 금지할 선택: 파일 타입 색상을 배경 장식으로 쓰거나 PDF 텍스트만 표시하지 않습니다.
- 검증 방법: FileIcon 적용, 상태 색상 단독 사용 없음, raw hex 없음, 주요 프레임 옆 brief note를 확인합니다.
```

## 빠른 분류표

| 기획안 키워드 | 브리프에서 고정할 방향 |
| --- | --- |
| AI, 자동, 요약, 생성, 분석, 챗 | NOVA purple, `ai.*`, `NovaLogo`, AI CTA |
| 문서, 보고서, 제안서, 편집, 오피스 | Ribbon, 문서 캔버스, 편집 툴바 |
| 파일, 업로드, 다운로드, PDF, DOCX, XLSX, PPTX | `FileIcon`, 파일 타입 의미 색상 |
| 계약, 승인, CRM, 목록, 관리 | neutral surface, Table, Card, Badge |
| 오류, 완료, 경고, 진행 | Badge/Alert/Icon 동반, 색상 단독 금지 |
