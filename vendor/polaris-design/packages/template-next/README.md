# Polaris Next.js Template

Next.js 15 (App Router) 템플릿. 처음부터 [@polaris/ui](https://github.com/PolarisOffice/PolarisDesign) 디자인 시스템이 통합돼 있습니다.

> **배포 모델** — `@polaris/ui` / `@polaris/lint`는 [GitHub Release](https://github.com/PolarisOffice/PolarisDesign/releases)에 첨부되는 `.tgz` 타르볼로 배포됩니다. PolarisDesign이 public repo이므로 인증 / PAT 셋업 불요.
>
> 이 템플릿의 `package.json`에는 모노레포 작업용 `workspace:*` 의존성이 박혀 있어, 외부 클론 시 한 번 타르볼 URL로 치환해야 합니다 (`/polaris-init`이 자동 수행, 아래에 수동 절차).

## 시작 (외부 제품 repo)

방법 1 — Claude Code `/polaris-init` 슬래시커맨드 (권장):
```
/polaris-init my-app
```
클론 + `workspace:*` → 타르볼 URL 치환 + install + dev까지 한 번에.

방법 2 — 수동:
```sh
npx tiged PolarisOffice/PolarisDesign/packages/template-next my-app
cd my-app

# 사용할 버전 결정 (가장 최신 정식 태그)
LATEST=$(curl -s https://api.github.com/repos/PolarisOffice/PolarisDesign/releases/latest \
  | grep -oE '"tag_name":[[:space:]]*"v[^"]+"' | sed 's/.*"v\(.*\)"/\1/')

# package.json의 workspace:* → tarball URL 치환
# (LATEST="$LATEST" 로 명시 export — 안 그러면 process.env.LATEST가 undefined가 되어
#  URL이 `.../v_undefined/polaris-ui-undefined.tgz` 로 박힘)
LATEST="$LATEST" node -e '
const fs = require("fs"); const v = process.env.LATEST;
const url = (n) => `https://github.com/PolarisOffice/PolarisDesign/releases/download/v${v}/polaris-${n}-${v}.tgz`;
const p = JSON.parse(fs.readFileSync("package.json","utf8"));
if (p.dependencies?.["@polaris/ui"] === "workspace:*") p.dependencies["@polaris/ui"] = url("ui");
if (p.devDependencies?.["@polaris/lint"] === "workspace:*") p.devDependencies["@polaris/lint"] = url("lint");
fs.writeFileSync("package.json", JSON.stringify(p,null,2)+"\n");
'

pnpm install
pnpm dev
```

상세(Tailwind preset 연결, Renovate 자동 업그레이드, 트러블슈팅): 루트의 [`docs/for-consumers/install.md`](../../docs/for-consumers/install.md).

## 시작 (모노레포 내부 — 디자인 시스템 자체 데모/카탈로그용)

```sh
cd PolarisDesign
pnpm install
pnpm --filter polaris-template-next dev   # workspace:* 그대로 동작
```

## 무엇이 들어 있나

- **`@polaris/ui`** — 토큰 + 18개 컴포넌트, `app/page.tsx`에서 바로 사용 가능
- **`@polaris/lint`** — `eslint.config.mjs`에 recommended 프리셋 적용
- **Tailwind preset** — `bg-accent-brand-normal`, `text-label-normal`, `rounded-polaris-md` 등 v0.7 spec 토큰 클래스 자동 등록
- **Pretendard** 폰트 CDN 로드
- **다크모드** 토글 컴포넌트(`components/theme-toggle.tsx`) — `localStorage`에 영구화
- **샘플 페이지** — NovaInput, PromptChip, FileCard, Card 조합 예시

## 본인 서비스로 만들기

1. `package.json`의 `name`을 본인 프로젝트명으로 수정
2. `app/page.tsx`의 샘플 콘텐츠를 실제 화면으로 교체
3. 새 라우트는 `app/<path>/page.tsx` 추가
4. 컴포넌트는 `@polaris/ui`에서 import — 직접 native `<button>`, `<input>` 사용 시 lint 차단
5. 색상·폰트·간격은 모두 v0.7 spec 토큰만 사용 (`text-label-normal`, `bg-accent-brand-normal`, `p-4` 등)

## 검증

```sh
pnpm lint        # @polaris/lint — 위반 0건이어야 함
pnpm typecheck
pnpm build
```

## Pretendard 로컬 호스팅 (프로덕션)

CDN 대신 로컬 호스팅을 권장하는 경우:

```tsx
// app/layout.tsx
import localFont from 'next/font/local';

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--polaris-font-sans-loaded',
});
```

`@polaris/ui`의 `--polaris-font-sans` 변수는 Pretendard fallback 체인을 이미 가지고 있어, 로컬 폰트 미설치 시에도 자연스럽게 동작합니다.

## 라이선스

내부용. 본인 회사 정책에 맞게 변경하세요.
