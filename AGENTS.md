# Polaris UI Agent Instructions

이 저장소에서 Figma UI, Web UI, 화면 설계, 컴포넌트 구현, 디자인 토큰 적용 작업을 할 때는 이 문서를 우선 적용합니다.

## 1. Polaris UI Brief 먼저 출력

사용자가 기획안, 화면 아이디어, 기능 설명만 주고 UI 제작을 요청하면 구현 전에 반드시 root [DESIGN.md](DESIGN.md)를 먼저 읽고 한국어로 `Polaris UI Brief`를 출력합니다. 브리프 없이 Figma 프레임, React 컴포넌트, HTML/CSS, 화면 문서를 만들지 않습니다.

필수 형식은 [UI Brief Template](docs/design/ui-brief-template.md)을 따릅니다.

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

브리프는 길게 쓰지 않습니다. 사용자가 준 기획안을 Polaris 톤앤매너로 변환하는 결정 기록입니다.

## 2. 기준 문서

- 1차 기계/사람 공용 spec: [DESIGN.md](DESIGN.md)
- 톤앤매너 SSoT: [Polaris UI Contract](docs/design/polaris-ui-contract.md)
- Figma 산출물 규칙: [Figma Output Contract](docs/design/figma-output-contract.md)
- upstream snapshot: [vendor/polaris-design](vendor/polaris-design)
- generated token data: [docs/design/generated](docs/design/generated)
- GitHub Pages reference: `docs/design/generated/polaris.pages.json`, `polaris.component-registry.json`, `polaris.token-registry.json`
- 원본 디자인 시스템 참고: [PolarisOffice/PolarisDesign](https://github.com/PolarisOffice/PolarisDesign/tree/main)

## 3. 기본 매핑

- AI, 자동화, 요약, 생성, NOVA 기능: `ai.*`, NOVA purple, `NovaLogo`, AI CTA를 사용합니다.
- 문서 편집, 제안서, 보고서, 오피스 도구: Ribbon, ribbon icons, 문서 캔버스형 레이아웃을 우선 검토합니다.
- 파일 목록, 업로드, 다운로드, 확장자 표시: `FileIcon`과 파일 타입 색상을 사용합니다.
- CRM, 계약, 리스트, 운영 화면: 조용한 neutral surface, Table, Card, Badge 중심으로 구성합니다.
- 상태 전달: 색상 단독 전달을 금지하고 Badge, Alert, Icon을 동반합니다.

## 4. 금지 사항

- raw hex, `rgb()`, `hsl()`, CSS named color를 직접 쓰지 않습니다.
- Tailwind arbitrary value와 기본 Tailwind palette를 쓰지 않습니다.
- feature UI에서 native `button`, `input`, `textarea`, `select`, `dialog`를 우선 사용하지 않습니다.
- 파일 타입 색상을 의미 없는 장식으로 쓰지 않습니다.
- AI가 아닌 일반 기능에 NOVA purple을 남용하지 않습니다.
- 일반 SaaS처럼 보이는 화면을 완료로 보고하지 않습니다. Polaris signature asset 적용 여부를 다시 확인합니다.

## 5. 완료 전 확인

- PolarisDesign 동기화: `npm run polaris:validate`가 통과해야 합니다.
- Design-source snapshot: `npm run polaris:sync -- --check`가 `apps/demo`, `assets`, `docs`, `packages/ui`, `packages/lint`, `packages/plugin`, `packages/template-next` drift를 확인해야 합니다.
- GitHub Pages coverage: `npm run polaris:pages:check`가 `/components`, `/tokens`, `/icons`, `/assets`와 컴포넌트/컬러/타이포/그리드 registry를 확인해야 합니다.
- Markdown links: `npm run polaris:links:check`가 통과해야 합니다.
- Brief 계약: `npm run polaris:brief:check`가 통과해야 합니다.
- Figma 작업: [figma/sync-polaris-figma.js](figma/sync-polaris-figma.js)를 Figma MCP로 실행해 `00 Polaris Output Contract`, token collections, text/effect styles를 갱신합니다.
- Web 작업: 앱 코드가 생기면 `@polaris/ui`, `@polaris/lint`, `pnpm lint`, `npm run polaris:brand-audit` 흐름을 연결해야 합니다.
- 감사 fixture: `npm run polaris:brand-audit:fixtures`가 raw hex, Tailwind arbitrary/default palette, native control, AI CTA, FileIcon, Ribbon 누락을 잡는지 확인합니다.
- PR 작업: PR 본문에 Polaris brief와 Figma/Web 검증 체크가 포함되어야 합니다.

## 6. 동기화 명령

- upstream snapshot 갱신: `npm run polaris:sync`
- drift 확인: `npm run polaris:sync -- --check`
- Markdown 링크 확인: `npm run polaris:links:check`
- Figma MCP용 스크립트 재생성: `npm run polaris:figma:build`
- 전체 계약 검증: `npm run polaris:validate && npm run polaris:pages:check && npm run polaris:brief:check`
