# 기존 프로젝트 마이그레이션 체크리스트

폴라리스를 적용하지 않은 기존 React/Next.js 프로젝트를 단계별로 일관성 있게 폴라리스화하는 절차. 사내 첫 마이그레이션(2026-05) 경험을 일반화한 가이드입니다.

> 자동화: Claude Code의 `/polaris-migrate`가 이 절차를 단계별로 실행합니다. 수동으로 진행하려면 아래를 따라가세요.

---

## M0. 사전 점검 (10분)

- [ ] **Node 22+, pnpm 10** 사용 가능
- [ ] React 18+ 또는 19
- [ ] Tailwind 사용 중인지 확인. 없으면 → 설치 + 설정 필요
- [ ] Tailwind 버전 확인. **v3** 권장 (v4는 [별도 가이드](../for-contributors/architecture/tailwind-v4.md))

---

## M1. 의존성 + 토큰 (30분)

PolarisDesign은 GitHub Release에 첨부된 `.tgz` 타르볼로 배포됩니다. `package.json`에 직접 추가:

```jsonc
{
  "dependencies": {
    "@polaris/ui": "https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.7.7/polaris-ui-0.7.7.tgz"
  },
  "devDependencies": {
    "@polaris/lint": "https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.7.7/polaris-lint-0.7.7.tgz"
  }
}
```

그리고 `pnpm install`. 전체 셋업 절차는 [`docs/for-consumers/install.md`](../for-consumers/install.md).

`tailwind.config.ts`:
```ts
import polarisPreset from '@polaris/ui/tailwind';
export default {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  presets: [polarisPreset],
};
```

`app/globals.css` (또는 진입 CSS):
```css
@import '@polaris/ui/styles/tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`<html>`에 `data-theme="light"` 설정 (또는 SSR cookie 패턴 → [Next.js 가이드](../for-contributors/architecture/nextjs-app-router.md#2-theme-ssr-safe-다크-모드)).

**검증**: dev 서버 실행 → 화면 깨지지 않으면 OK. 색이 하나도 안 바뀌어도 정상 (다음 단계에서 적용).

---

## M2. 진단 — 비준수율 측정 (15분)

```sh
npx polaris-audit
```

출력에서 확인:
- 위반 카운트 총합
- 자주 등장 hex 컬러 (top 10) → 어떤 색을 쓰고 있는지
- 자주 등장 임의 Tailwind 값 (top 10) → 어떤 패턴을 우회 중인지
- 위반 많은 파일 (top 10) → 우선순위 결정용

baseline을 기록 (이후 M5에서 비교용).

---

## M3. 색상 hex 일괄 교체 (1-2시간)

Top 10 hex 컬러가 폴라리스 토큰의 어디에 매핑되는지 결정:

```
#1D4ED8 → bg-brand-primary (Word blue) ✅
#1FAE53 → bg-brand-green (Excel green) ✅
#F37021 → bg-brand-orange (PowerPoint) ✅
#E5413A → bg-brand-red (PDF) ✅
#FF6962 → bg-status-danger ✅
#16A34A → bg-status-success ✅

#3B82F6 → bg-brand-primary (가까운 톤이면 통합) — **승인 필요**
#A855F7 → bg-brand-secondary (NOVA purple) — **승인 필요**
```

**근사값 매핑**은 디자인 리드 사인오프가 필요. 정확히 같은 hex만 자동 교체.

```sh
# 예시: 정확 매치만 sed로 교체
grep -rln '#1D4ED8' src | xargs sed -i '' 's/#1D4ED8/var(--polaris-brand-primary)/g'
```

근사값은 한 파일씩 수동 검토.

**검증**: `pnpm lint -- --rule '{"@polaris/no-hardcoded-color": "error"}'`로 남은 위반 확인.

---

## M4. 컴포넌트 교체 (반나절~하루)

자주 쓰이는 native 요소를 폴라리스 컴포넌트로:

| 기존 | 교체 | 비고 |
|---|---|---|
| `<button>` | `<Button>` | `type="submit"`은 native 그대로 (lint 허용) |
| `<input>` | `<Input>` | label/hint/error props 활용 |
| `<textarea>` | `<Textarea>` | 동일 |
| `<select>` | `<Select>` | Radix-based, 다크모드 자동 |
| 자체 `<dialog>` | `<Dialog>` | focus trap·overlay·portal 내장 |
| 자체 toast 시스템 | `<Toaster>` + `toast()` | shadcn 패턴 |
| 자체 dropdown | `<DropdownMenu>` | |
| 자체 사이드바 | `<Sidebar>` | |
| 자체 nav | `<Navbar>` | |
| 자체 table | `<Table>` (v0.3+) | density 축 활용 |
| 자체 모달 (사이드) | `<Drawer>` (v0.3+) | side="right/left/top/bottom" |

**전략**: 한 번에 교체하지 말고 페이지 단위로. 각 페이지마다 git commit → 회귀 확인.

ESLint 룰 `@polaris/prefer-polaris-component`가 켜져 있으면 native 사용을 즉시 잡아줍니다.

---

## M5. 레이아웃 정리 (1-2시간)

자주 반복되는 layout 패턴 → 폴라리스 layout 컴포넌트로:

| 기존 패턴 | 교체 |
|---|---|
| `flex flex-col gap-4` | `<VStack gap={4}>` |
| `flex items-center gap-2` | `<HStack align="center" gap={2}>` |
| `max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8` | `<Container size="2xl">` |
| 고객/계약 상세의 key-value | `<DescriptionList>` |
| 빈 상태 placeholder | `<EmptyState icon={...} title={...}>` |

이건 **선택적** — 동작은 같지만 코드 가독성과 일관성이 올라갑니다.

---

## M6. lint 강제 + CI (30분)

`eslint.config.mjs`:
```js
import polaris from '@polaris/lint';
export default [...polaris.configs.recommended];
```

CI 워크플로우에 `pnpm lint -- --max-warnings=0` 추가.

Claude Code 사용 중이면 polaris-design 플러그인 설치 → PostToolUse 훅이 자동으로 토큰 우회 차단.

```sh
# 사내 marketplace에서
/plugin install polaris-design
```

---

## M7. 측정 + 보고 (15분)

```sh
npx polaris-audit
```

baseline 대비:
- 위반 카운트 % 감소
- 남은 hex top 10 (디자인 리드 결정 필요)
- 남은 임의 값 top 10 (대부분 layout — `grid-cols-[...]`은 정상)

Slack/노션에 before/after 스크린샷 + 수치 공유. 마이그레이션 완료.

---

## 자주 막히는 곳

### 1. Tailwind v4 환경
`@theme inline { ... }`로 매핑이 필요합니다 → [tailwind-v4-migration.md](../for-contributors/architecture/tailwind-v4.md)

### 2. 디자이너가 정의한 hex가 폴라리스에 없음
- 같은 톤이면 폴라리스 토큰으로 통일 (디자인 리드 승인)
- 다른 의미면 새 토큰 추가 RFC. 토큰 추가는 가볍지 않음 — 모든 프로젝트에 영향

### 3. 자체 컴포넌트가 폴라리스에 없음
- v0.3 기준 25개 + 5개 (Tier 2.5). 더 많은 컴포넌트는 [컴포넌트 후보](../README.md#로드맵) 참고
- 짧은 시간 안에 필요하면 자체 구현 + 토큰만 사용 (lint는 통과). v0.4 이후 정식 추가

### 4. RSC/Server Component 환경
모든 폴라리스 컴포넌트는 client. RSC에서 그대로 import 가능. → [Next.js 가이드](../for-contributors/architecture/nextjs-app-router.md)

### 5. 차트 라이브러리 색상
recharts/echarts/visx 등의 색은 props로 전달 — `import { brand, status } from '@polaris/ui/tokens'` 사용. 별도 가이드 추후 추가 예정.
