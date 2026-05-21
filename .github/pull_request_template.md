# PR 요약

## Polaris UI Brief

- 화면 목적:
- 사용자/상황:
- 톤앤매너:
- Polaris signature asset:
- 컴포넌트 매핑:
- 토큰/색상 원칙:
- 금지할 선택:
- 검증 방법:

## 체크리스트

- [ ] UI 작업 전에 `Polaris UI Brief`를 작성했다.
- [ ] root `DESIGN.md`와 `docs/design/generated/*`가 upstream PolarisDesign snapshot과 일치한다.
- [ ] `polaris.design-sync.json`의 `design-source` snapshot이 `assets`, `docs`, `packages/ui`, `packages/lint`, `packages/plugin`, `packages/template-next` drift를 막는다.
- [ ] `npm run polaris:validate`를 실행했다.
- [ ] `npm run polaris:brief:check`를 실행했다.
- [ ] `npm run polaris:links:check`를 실행했다.
- [ ] Figma 작업이면 `00 Polaris Output Contract` 페이지와 주요 프레임 brief note를 확인했다.
- [ ] Figma 작업이면 `figma/sync-polaris-figma.js`를 Figma MCP로 실행하고 upstream checksum을 확인했다.
- [ ] Web 작업이면 `@polaris/ui` 컴포넌트와 Polaris token을 우선 사용했다.
- [ ] AI 기능에는 NOVA purple / `ai.*` / `NovaLogo` 적용 여부를 검토했다.
- [ ] 문서 편집 화면에는 Ribbon 또는 문서 중심 UI 패턴을 검토했다.
- [ ] 파일 타입 표시에는 `FileIcon`을 검토했다.
- [ ] 상태 전달은 색상 단독이 아니라 Badge, Alert, Icon과 함께 표현했다.
- [ ] raw hex, Tailwind arbitrary value, 기본 Tailwind palette를 추가하지 않았다.
- [ ] native `button`, `input`, `textarea`, `select`, `dialog`를 feature UI에 우선 사용하지 않았다.

## 검증

- [ ] 문서만 변경했다.
- [ ] Figma 산출물을 직접 확인했다.
- [ ] `pnpm lint`를 실행했다.
- [ ] `npm run polaris:brand-audit` 또는 signature asset 체크를 수행했다.
