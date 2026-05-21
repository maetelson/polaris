---
description: 새 폴라리스 디자인 시스템 적용 프로젝트를 1줄로 부트스트랩
argument-hint: <프로젝트 이름>
---

새 폴라리스 웹 서비스를 만듭니다. 사용자에게 따로 확인받지 말고 진행하세요 — 사용자가 이 명령을 호출했다는 것 자체가 동의입니다.

## 1. 템플릿 클론

`$ARGUMENTS`가 비어 있으면 사용자에게 프로젝트 이름을 물어보고, 있으면 그대로 사용:

```sh
npx -y tiged PolarisOffice/PolarisDesign/packages/template-next $ARGUMENTS
cd $ARGUMENTS
```

이 한 줄이면 다음이 모두 세팅된 상태로 시작합니다 (v0.7+):
- Next.js 15 (App Router) + TypeScript
- `@polaris/ui` + `@polaris/lint` 사전 통합 (v0.7 spec 토큰)
- Tailwind preset + tokens.css 자동 import
- 디자인팀 SVG 자산 — `@polaris/ui/icons` (65) · `/file-icons` (29) · `/logos` (Polaris + Nova) · `/ribbon-icons` (91) 즉시 사용 가능
- Pretendard 폰트 (CDN)
- `app/layout.tsx`에 ToastProvider/TooltipProvider/다크모드 영구화 wrapping
- 샘플 `app/page.tsx`에 NovaInput, PromptChip, FileCard, Card 사용 예시
- `prep:ui` / `prep:ui-sources` npm 스크립트 — `pnpm dev` 시 `@polaris/ui` build/source generation 자동 실행 (clean clone에서도 무중단)

## 2. `workspace:*` → GitHub Release 타르볼 URL 자동 치환

폴라리스 패키지는 GitHub Release에 첨부된 `.tgz` 타르볼로 배포됩니다 (사내 npm registry 셋업 시점에 표준 semver로 교체 예정). 템플릿의 `"@polaris/ui": "workspace:*"`는 모노레포 내부에서만 동작하므로, 외부 제품 repo에서는 클론 직후 `package.json`의 `workspace:*` 참조를 타르볼 URL로 자동 치환합니다.

아래 스크립트를 **한 번의 Bash 호출**로 실행하세요(여러 코드 블록으로 쪼개지 마세요 — `LATEST` 변수 scope가 sub-shell마다 사라집니다):

```sh
LATEST=$(curl -s https://api.github.com/repos/PolarisOffice/PolarisDesign/releases/latest \
  | grep -oE '"tag_name":[[:space:]]*"v[^"]+"' \
  | sed 's/.*"v\(.*\)"/\1/')
echo "사용할 버전: v$LATEST"

LATEST="$LATEST" node -e '
const fs = require("fs");
const v = process.env.LATEST;
const url = (n) => `https://github.com/PolarisOffice/PolarisDesign/releases/download/v${v}/polaris-${n}-${v}.tgz`;
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (pkg.dependencies?.["@polaris/ui"] === "workspace:*") pkg.dependencies["@polaris/ui"] = url("ui");
if (pkg.devDependencies?.["@polaris/lint"] === "workspace:*") pkg.devDependencies["@polaris/lint"] = url("lint");
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log(`✓ workspace:* → tarball URL (v${v})`);
'

# 검증 — 두 라인 모두 https://github.com/...releases/download/... 가 보여야 함.
# "workspace:*"가 남아 있으면 치환 실패 → 사용자에게 보고하고 멈출 것.
grep -E '"@polaris/(ui|lint)"' package.json
```

사용자가 특정 버전을 명시 요청한 경우(예: pre-release `-rc.N` 테스트), 첫 줄을 `LATEST=0.7.2-rc.1` 같은 직접 할당으로 대체하면 됩니다.

## 3. 의존성 설치 + dev 실행

```sh
pnpm install   # 타르볼 URL에서 자동 다운로드 (PolarisDesign이 public이라 인증 불요)
pnpm dev       # next dev → :3000
```

## 4. package.json 정리

`package.json`의 `name`을 사용자가 원하는 프로젝트명으로 바꿉니다. 의존성 URL은 그대로(이미 위에서 박았음). 그 외에는 손대지 마세요.

## 5. 검증

```sh
pnpm lint        # @polaris/lint — 위반 0건이어야 함 (샘플 페이지가 토큰만 사용)
pnpm typecheck
pnpm build
```

## 6. 사용자에게 보고

다음 형식으로 한 메시지에 정리:

> 새 프로젝트 `<name>`이 준비됐습니다. http://localhost:3000 에서 확인하세요.
> - `app/page.tsx`를 편집해서 본인 콘텐츠로 교체
> - 추가 라우트는 `app/<path>/page.tsx`
> - 컴포넌트는 `@polaris/ui`에서 import
> - lint가 토큰 우회를 자동 차단하니 hex/임의값 직접 사용 금지

## 주의

- **기존 디렉터리에 적용하려는 경우** `/polaris-init`이 아니라 `/polaris-migrate`를 사용하세요 (기존 코드는 토큰 위반을 가지고 있을 가능성이 높음).
- **타르볼 URL 치환 실패 시 멈출 것**: 2단계의 sed/node 치환 후에도 `package.json`에 `"workspace:*"`가 남아 있으면 install이 실패합니다. 그 경우 사용자에게 다음 사항을 함께 보고하고 진행을 멈추세요:
  - 가능한 원인: GitHub API rate limit, 네트워크, jq 미설치, 또는 PolarisDesign에 아직 v\* Release가 없음 (초기 셋업 단계).
  - 사용자에게 사용할 버전을 직접 묻기 (예: "v0.7.2"), 사용자 답변을 받아 수동 치환 후 재시도.
- **사내 npm registry 등장 시점**: registry URL이 정해지면 이 명령의 2단계가 단순한 `pnpm install`로 바뀌고, 템플릿의 `workspace:*` 참조도 표준 semver(`^0.7.2` 등)로 교체됩니다. 그 시점까지는 위 타르볼 흐름이 default.
- **외부 협력사 / 다른 회사**: 위 흐름은 사내 + 인증 불필요한 public Release에 의존합니다. PolarisDesign이 private으로 전환되거나 협력사가 제한적 접근만 받는 경우, GitHub PAT 셋업 단계가 추가됩니다 — 별도 가이드가 만들어질 때까지는 사용자에게 보고하고 멈출 것.
