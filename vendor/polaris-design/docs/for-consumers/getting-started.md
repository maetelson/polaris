# 폴라리스 디자인 시스템 — 신규 프로젝트 도입 프롬프트

이 페이지는 **새 React/Next.js 프로젝트에 폴라리스 디자인 시스템을 도입**할 때 AI 에이전트(Claude / Codex / Cursor 등)에게 그대로 던지면 되는 *시작 프롬프트* 모음입니다.

> **왜 이게 필요한가** — 토큰만 정확히 써도 *시각적으로는 평범한 SaaS*로 보일 수 있다는 함정이 있습니다. 폴라리스가 시장에서 거의 유일하게 갖는 자산(NOVA / FileIcon / Ribbon / 4-color 브랜드 / Pretendard)을 적극적으로 노출해야 비로소 "폴라리스답다"고 인식됩니다. 이 프롬프트들은 그 노출까지 자동으로 일어나도록 명령에 포함되어 있습니다.

---

## A. 한 메시지짜리 표준 시작 프롬프트 (가장 자주 쓰는 형태)

다음 텍스트를 그대로 복사해 새 프로젝트의 첫 메시지로 사용하세요. AI 에이전트가 GitHub에서 디자인 시스템을 fetch해 구조를 파악한 뒤 적용합니다.

```
이 프로젝트에 폴라리스 디자인 시스템을 도입해 줘.

소스: https://github.com/PolarisOffice/PolarisDesign
- README.md, DESIGN.md, AGENTS.md, packages/ui/README.md를 차례로 읽어
  토큰 / 컴포넌트 / 패키지 구조 파악
- docs/for-consumers/install.md의 setup 절차 따라 의존성 설정

설치 (GitHub Release tarball — 인증 없이 한 번에):
- @polaris/ui (런타임 + Tailwind preset + 토큰 + SVG 자산)
- @polaris/lint (devDep — ESLint 8룰)
- 최신 버전은 https://github.com/PolarisOffice/PolarisDesign/releases 의 latest 태그 확인

설정:
- Next.js 15 / React 19 + Tailwind v4가 기본. v3 사용 시 packages/ui/tailwind preset 적용
- 진입점에 `import '@polaris/ui/styles/tokens.css'` (다크모드는 [data-theme="dark"]로 자동)
- font: Pretendard Variable (이미 토큰에 매핑됨, 직접 font-family 박지 말 것)

규칙 (NEVER):
- hex / rgb / hsl 직접 작성 금지 — 시맨틱 토큰만 (label.* / background.* / layer.* / fill.* / line.* / accentBrand.* / state.* / ai.*)
- Tailwind 임의값 (bg-[#xxx], p-[13px]) 금지
- font-family / letter-spacing 직접 지정 금지
- native <button>/<input>/<textarea>/<select>/<dialog> 직접 사용 금지 — @polaris/ui 컴포넌트
- v0.7 이전 alias (bg-fg-*, bg-surface-canvas/raised/sunken, bg-status-*, rounded-polaris-full 등) 사용 금지 — v0.8에서 제거됨

폴라리스답게 보이려면 — 토큰만이 아니라 시각 자산도 *적극* 노출 (이걸 빼먹으면 평범한 SaaS):

1. 파일 / 다운로드 / 형식 표시는 `<FileIcon type="docx|xlsx|pptx|pdf|hwp|...">` (29 타입). 텍스트로 "DOCX" 라벨 달지 말 것 — 4-color 브랜드 = 파일 타입 매핑이 폴라리스 정체성의 핵심.
2. AI / NOVA / 자동 작성 / 분석 / 요약 / 챗 기능은 반드시 `variant="ai"` (Button / Checkbox 등). 일반 brand-blue 버튼으로 만들면 사용자가 AI인지 인지 못 함. NOVA 마크는 `<NovaLogo size={16-20} />`.
3. 문서 편집 / 보고서 작성 / 제안서 작성 페이지는 `<Ribbon>` + @polaris/ui/ribbon-icons (91종) 검토. Office-style ribbon은 사실상 폴라리스만 갖춤 — 가장 큰 차별 자산.
4. 사이드바 / 네비 active 상태는 단순 text-color 변경이 아니라 `bg-accent-brand-bg` 브랜드 틴트.
5. KPI / 대시보드는 `<Stat>` + `<StatGroup cols={4}>` (4-color 강조 + 자동 레이아웃).
6. 필터 / 카테고리 chip은 `<PromptChip>` (NOVA hover 시각 차별).
7. Footer / login / 브랜드 영역은 `<PolarisLogo variant="horizontal|symbol|favicon">`.
8. 헤로 / 핵심 stat에 AI 강조가 필요하면 NOVA 그라디언트 (linear-gradient(135deg, var(--polaris-purple-40), var(--polaris-ai-normal))) 한 단어 / 한 수치만.
9. 데이터 테이블은 `<TableToolbar>` + `<TableSelectionBar>` + `<TableSkeleton>` 묶음. 검색 / 필터 chip / +추가 / 선택 행 액션 / 스켈레톤이 한 세트로 같이 나옴.
10. 공통 폼은 `<Form>` (subpath: @polaris/ui/form, react-hook-form + zod 통합). `<Input label helperText error />` 패턴이 floating label + ErrorIcon 자동.

이 9~10가지를 의식적으로 적용해 줘. 토큰 자체는 lint가 강제하니 자동인데, 시각 자산 노출은 AI가 의식적으로 선택해야 폴라리스답다고 인식됨.

검증:
- 작업 후 `pnpm lint` 와 `pnpm build` 모두 통과해야 함
- `pnpm dlx @polaris/lint polaris-audit` 으로 시각 회귀 audit 가능
- 시작 프로젝트라면 https://github.com/PolarisOffice/PolarisDesign/tree/main/packages/template-next 그대로 clone하는 것도 OK (`/polaris-init <name>` 슬래시 명령이 자동 처리)

먼저 현재 프로젝트 구조를 파악한 뒤 마이그레이션 계획을 보여 주고, 승인 받고 진행해 줘.
```

> **사용 팁** — 도입 대상 프로젝트의 성격(예: "B2B 계약 관리 대시보드", "노트 편집기", "AI 챗 인터페이스")을 한 줄 추가하면 위 9~10번 자산 매핑이 더 정확해집니다. 예: "이 프로젝트는 영업 계약 관리 대시보드라 5번(Stat/StatGroup) + 9번(Table*)이 핵심이고 3번(Ribbon)은 해당 안 됨" 같은 식.

---

## B. 더 긴 형태 — 큰 프로젝트의 점진적 마이그레이션

위 A는 "새로 시작" 또는 "디자인 시스템 0건" 프로젝트용. 이미 다른 디자인이 적용된 프로젝트를 점진적으로 폴라리스로 옮기는 경우는 다음:

```
이 프로젝트를 폴라리스 디자인 시스템으로 점진적 마이그레이션해 줘.

소스: https://github.com/PolarisOffice/PolarisDesign

절차 (각 단계 끝마다 결과 보고하고 다음으로):

1. 진단 — `pnpm dlx @polaris/lint polaris-audit` 실행
   - 총 위반 수 + 룰별 카운트 + 자주 등장하는 hex top 10 + 임의값 top 10
   - 가장 심한 파일 top 10 보고

2. 자동 codemod — v0.6/rc.0/v0.7 alias 잔존이 있으면 v0.8 spec으로 일괄 변환:
   `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src`
   - token / Tailwind / CSS 변수 / JSX prop / HStack-VStack 한 번에
   - conflict 감지 시 그 파일은 건드리지 않고 stderr에 안내 — 그 안내 따라 manual 해결
   - 완료 후 다시 `pnpm build` 통과 확인

3. 매핑 합의 — audit의 top hex / 임의값 결과를 보고 다음 결정:
   - 어느 hex가 어느 폴라리스 v0.8 토큰에 매핑되는지
   - 매핑 없는 색은 (a) 가까운 토큰으로 흡수 / (b) 새 토큰 추가 요청 / (c) 그대로 유지

4. 페이지 단위 strangler-fig 마이그레이션 — 빅뱅 금지
   a. 위반이 적은 파일부터 시작
   b. 그 파일의 hex / 임의값 / native 요소 → 폴라리스 토큰 + 컴포넌트로 교체
   c. `pnpm dlx @polaris/lint polaris-audit <file>` 로 그 파일만 재검증
   d. 0건이면 다음 파일로

5. 시각 자산 노출 — 토큰 정합이 끝나도 *시각적으로는 평범한 SaaS*일 수 있음. 다음 9가지를 의식적으로 적용:
   - 파일 표시는 `<FileIcon>` (29 타입)
   - AI/NOVA 기능은 `<Button variant="ai">` + `<NovaLogo>`
   - 문서 편집은 `<Ribbon>` + ribbon-icons
   - 사이드바 active는 brand 틴트 (`bg-accent-brand-bg`)
   - KPI는 `<Stat>` + `<StatGroup>`
   - chip은 `<PromptChip>`
   - 브랜드 영역은 `<PolarisLogo>`
   - 데이터 테이블은 `<TableToolbar>` + `<TableSelectionBar>`
   - 헤로 강조는 NOVA 그라디언트 (한 단어만)

6. 강제 — 모든 페이지 0건이 되면 ESLint recommended config가 그 상태를 유지. CI에 lint를 추가하면 PR 단계에서 회귀 차단.

각 페이지가 끝날 때마다 진행 상황을 한 줄로 보고:
> `app/dashboard/page.tsx` 마이그레이션 완료. 위반 47건 → 0건. 다음은 `app/settings/page.tsx` (32건).

주의:
- 시각 회귀 검증 필수 — 토큰 교체 후 페이지가 시각적으로 달라질 수 있음. 페이지마다 before/after 스크린샷 보여 주거나 Playwright 같은 도구로 비교 권장
- 대량 자동치환 금지 — codemod 외에 regex로 #xxx → var(--polaris-*) 일괄치환 위험. 같은 hex라도 컨텍스트(글자색 vs 배경색 vs 보더)에 따라 다른 토큰일 수 있음
- /* eslint-disable */ 로 우회 금지 — 룰을 끄면 마이그레이션 의미 사라짐. 정 안 되는 케이스는 보고 → 토큰 추가 또는 spec 보강 결정
```

---

## C. Claude Code 환경 — 슬래시 명령으로 더 짧게

Claude Code 사용자라면 위 텍스트를 통째로 던질 필요 없이 이미 만들어진 슬래시 명령을 사용:

```
/polaris-init <project-name>      # 새 프로젝트 — template-next에서 부트스트랩
/polaris-migrate                  # 기존 코드 점진 마이그레이션
/polaris-check                    # 현재 상태 lint (mechanical 위반)
/polaris-brand-audit              # 시각 자산 적용 기회 — NOVA / FileIcon / Ribbon 휴리스틱
/polaris-component <name>         # 특정 컴포넌트 가이드
```

플러그인이 안 깔려 있으면 `~/.claude/plugins/polaris-design` 으로 설치 (`packages/plugin/README.md` 참조). 플러그인 설치 후엔 PostToolUse 훅이 Edit/Write마다 자동으로 lint를 돌려서 hex 박는 즉시 차단.

---

## D. 무엇을 결과로 기대해야 하나 — 시각 정체성 체크리스트

도입이 끝났을 때 페이지를 보면서 다음 질문에 ✓할 수 있어야 폴라리스답게 적용된 것:

- [ ] 메인 컬러는 PO Blue (`#1D7FF9`) 단일 — 다른 파란색 섞이지 않음
- [ ] AI / NOVA 기능은 시각적으로 즉시 구분 (보라 그라디언트, ai variant, NovaLogo)
- [ ] 파일 / 다운로드 표시가 텍스트가 아니라 4-color FileIcon
- [ ] 문서 편집 같은 use case면 Ribbon이 적용됨 (해당 use case일 때만)
- [ ] 사이드바 / 네비 active 상태에 brand 틴트 배경 (단순 text-color 변경 아님)
- [ ] KPI / 대시보드는 Stat 컴포넌트 (직접 div + 숫자 조합 아님)
- [ ] Footer / 브랜드 영역에 PolarisLogo
- [ ] Pretendard 폰트 적용 (시스템 폰트 아님)
- [ ] 다크모드 토글이 모든 컴포넌트에서 정상 작동 (toggling [data-theme="dark"])
- [ ] `pnpm lint` / `pnpm build` / `pnpm dlx @polaris/lint polaris-audit` 모두 0 errors

토큰 정합은 lint가 강제하지만 시각 자산 노출은 AI 에이전트가 의식적으로 선택해야 합니다. 위 체크리스트를 PR 리뷰 또는 디자인팀 검수 시 함께 보내면 누락 자산이 빨리 잡힙니다.
