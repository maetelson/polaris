# 사내 제품 repo에서 `@polaris/ui` 쓰기 — 5분 셋업

PolarisDesign이 사내 npm registry에 publish되기 전 단계에서, 외부 제품 repo가 디자인 시스템을 install하는 표준 절차입니다. **GitHub Release 타르볼**을 직접 dependency URL로 받아서 씁니다.

> PolarisDesign은 public GitHub repo이므로 **인증/PAT 셋업 불필요**. `pnpm install`만으로 동작합니다.

---

## 1. `package.json`에 의존성 추가

각 `v0.X.Y` 태그마다 GitHub Release에 `polaris-ui-0.X.Y.tgz`와 `polaris-lint-0.X.Y.tgz`가 자동 첨부됩니다. 사용하고 싶은 버전의 URL을 그대로 박으세요:

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

`pnpm install` 실행하면 끝.

> ⚠️ **`^0.7.7` 같은 semver range는 동작하지 않습니다.** URL이 정확히 박힙니다. 새 버전을 받으려면 URL의 두 군데(`v0.7.7` / `0.7.7`)를 직접 갱신하세요. → 자동화는 [Renovate](#renovate-자동-업그레이드-옵션) 섹션 참고.

---

## 2. Tailwind preset 연결 (`@polaris/ui` 쓸 때 필수)

```js
// tailwind.config.js
import polarisPreset from '@polaris/ui/tailwind';

export default {
  presets: [polarisPreset],
  content: [
    './src/**/*.{ts,tsx}',
    // node_modules에 install된 @polaris/ui도 스캔 대상에 포함 — 컴포넌트
    // 안에서 사용된 token-based class를 Tailwind가 보지 못하면 PurgeCSS
    // 단계에서 잘려 나갑니다.
    './node_modules/@polaris/ui/dist/**/*.{js,cjs}',
  ],
  // 나머지는 preset이 다 들고 옴 (theme tokens / dark mode / radius / shadow / …)
};
```

토큰 CSS 변수도 import:

```css
/* src/app/globals.css 또는 src/styles/index.css */
@import '@polaris/ui/styles/tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 3. `@polaris/lint` ESLint config 연결

```js
// eslint.config.js (flat config — ESLint 9+)
import polaris from '@polaris/lint';

export default [
  ...polaris.configs.recommended,
  // 프로젝트별 추가 룰 / overrides
];
```

상세 룰 / 자동 수정 옵션은 [`@polaris/lint` README](https://github.com/PolarisOffice/PolarisDesign/blob/main/packages/lint/README.md) 참고.

---

## 4. 동작 확인

```tsx
// src/app/page.tsx (또는 임의의 React 컴포넌트)
import { Button, Card } from '@polaris/ui';

export default function Page() {
  return (
    <Card variant="padded">
      <Button variant="primary">테스트</Button>
    </Card>
  );
}
```

`pnpm dev` → 디자인 토큰 적용된 버튼이 보이면 성공.

---

## 5. 무결성 검증 (선택)

각 Release에 `SHA256SUMS.txt`도 같이 업로드됩니다. 사내 보안 정책상 supply-chain 검증이 필요하면:

```bash
curl -L -o /tmp/SHA256SUMS.txt \
  https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.7.7/SHA256SUMS.txt
cd ~/.local/share/pnpm/store/v3/files   # pnpm cache 위치는 환경마다 다름
sha256sum polaris-ui-0.7.3.tgz | grep -f /tmp/SHA256SUMS.txt
```

---

## Renovate 자동 업그레이드 옵션

URL 직접 갱신 부담을 줄이려면 [Renovate](https://docs.renovatebot.com/) 활성화. `renovate.json`에 한 블록 추가:

```jsonc
{
  "extends": ["config:recommended"],
  "customManagers": [
    {
      "customType": "regex",
      "fileMatch": ["(^|/)package\\.json$"],
      "matchStrings": [
        "https://github\\.com/PolarisOffice/PolarisDesign/releases/download/(?<currentValue>v[^/]+)/polaris-(?<depName>ui|lint)-[^/]+?\\.tgz"
      ],
      "datasourceTemplate": "github-releases",
      "depNameTemplate": "PolarisOffice/PolarisDesign",
      "extractVersionTemplate": "^v(?<version>.+)$"
    }
  ]
}
```

이렇게 하면 새 `v*` 태그가 publish될 때마다 Renovate가 자동 PR을 만들어 URL을 갱신합니다.

---

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `pnpm install` 후 `404 Not Found` | 태그 오타 / 아직 publish 안 된 버전. [Releases 페이지](https://github.com/PolarisOffice/PolarisDesign/releases)에서 정확한 URL 확인. |
| `Cannot find module '@polaris/ui'` 컴파일 에러 | install 됐는지 `pnpm list @polaris/ui` 확인. tarball 다운로드는 됐는데 `dist`가 비어 있다면 release 타르볼 자체가 깨진 것 — `SHA256SUMS.txt`로 검증. |
| Tailwind 토큰 클래스가 적용되지 않음 | `tailwind.config.js`의 `content` 배열에 `./node_modules/@polaris/ui/dist/**/*.{js,cjs}`가 빠진 경우. 위 2번 다시 확인. |
| 다크 모드 색이 안 바뀜 | `@import '@polaris/ui/styles/tokens.css'`가 누락 / 잘못된 위치. CSS reset 전에 import해야 함. |

---

## Upstream release 알림 — 새 버전이 떴을 때 어떻게 알 것인가

vendor / GitHub Release URL 패턴은 **manual sync** 라 새 릴리즈 push가 자동으로 알림되지 않습니다. 컨슈머가 v0.8.0-rc.7이 나온 걸 사람이 알려줘야 알게 되는 경우가 실제로 있었음. 세 가지 패턴 권장:

### 패턴 A — Renovate (PR 자동 생성)

이미 위 (이전 섹션의) `regexManagers` 항목이 있으면 그 자체로 새 v* 태그 publish 시 자동 PR. pre-release 도 받고 싶다면 `packageRules` 한 블록 추가:

```jsonc
{
  "packageRules": [
    {
      "matchPackageNames": ["PolarisOffice/PolarisDesign"],
      "labels": ["polaris-upstream"],
      "reviewers": ["team:frontend"],
      "matchUpdateTypes": ["major", "minor", "patch"]
    }
  ]
}
```

> rc 도 받으려면 `"allowedVersions": "/.*-(rc|alpha|beta)\\..*/"` 추가. 다만 RC가 매주 나오는 시기엔 PR이 많아질 수 있어, *정식 stable* 만 받고 RC는 수동 catch up 권장.

### 패턴 B — GitHub Action (Slack / 이슈 알림)

CI에서 hourly cron 으로 latest tag 비교 + 알림. Renovate 안 쓰는 환경에 권장:

```yaml
# .github/workflows/polaris-upstream-check.yml
name: Polaris upstream check
on:
  schedule:
    - cron: '0 9 * * 1-5'   # 평일 오전 9시 1회
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Compare versions
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          LATEST=$(gh release view --repo PolarisOffice/PolarisDesign --json tagName -q .tagName)
          # 우리 package.json의 polaris-ui tarball URL 에서 버전 추출
          CURRENT=$(grep -oE 'polaris-ui-[0-9][^/]*\.tgz' package.json | head -1 | sed 's/polaris-ui-\(.*\)\.tgz/v\1/')
          echo "Latest: $LATEST / Ours: $CURRENT"
          if [ "$LATEST" != "$CURRENT" ]; then
            echo "::notice ::PolarisDesign latest=$LATEST, ours=$CURRENT"
            # (선택) Slack 알림 — webhook URL은 secret
            if [ -n "${{ secrets.SLACK_WEBHOOK_URL }}" ]; then
              curl -X POST -H 'Content-Type: application/json' \
                -d "{\"text\":\"🌟 PolarisDesign 새 릴리즈: $LATEST (현재: $CURRENT)\nhttps://github.com/PolarisOffice/PolarisDesign/releases/tag/$LATEST\"}" \
                "${{ secrets.SLACK_WEBHOOK_URL }}"
            fi
            # (선택) 자동 이슈 생성
            gh issue create --title "Polaris upstream: $LATEST → migrate from $CURRENT" \
              --body "https://github.com/PolarisOffice/PolarisDesign/releases/tag/$LATEST" \
              --label polaris-upstream || true
          fi
```

### 패턴 C — Vendor 패턴 사용 시 sha 비교

vendor 디렉토리에 소스 코드를 통째로 카피하는 패턴이면 sha 비교가 더 정확:

```yaml
# vendor/polaris/UPSTREAM_COMMIT 에 마지막 sync한 sha를 저장하는 가정
- name: Check vendor drift
  env:
    GH_TOKEN: ${{ github.token }}
  run: |
    UPSTREAM=$(gh api repos/PolarisOffice/PolarisDesign/commits/main -q .sha)
    OURS=$(cat vendor/polaris/UPSTREAM_COMMIT 2>/dev/null || echo "none")
    if [ "$UPSTREAM" != "$OURS" ]; then
      echo "::warning ::vendor drift — $OURS → $UPSTREAM"
      echo "Resync: rm -rf vendor/polaris && git clone --depth=1 ..."
    fi
```

### 어떤 패턴을 선택할까

| 컨슈머 환경 | 권장 패턴 |
|---|---|
| Renovate 이미 사용 중 | **A** (regexManagers + packageRules 한 줄) |
| GitHub Actions + Slack 사용 중 | **B** (cron + webhook) |
| Vendor 패턴 (소스 통째 카피) | **C** (sha 비교) |
| 위 모두 아님 | **B** 가 가장 빠른 셋업 — secret 한 개 (`SLACK_WEBHOOK_URL`) + workflow 파일 하나 |

### 사내 release 채널 (별도 운영 가능)

폴라리스 디자인 시스템 자체 운영자가 사내 Slack 채널 / 이메일 그룹 운영하는 것도 옵션입니다. 개인은 GitHub `Watch → Releases only` 로 직접 구독해도 OK.

---

## 향후 — 사내 npm registry 등장 시

사내 표준 npm registry(JFrog/Nexus/Verdaccio 등)가 셋업되면 위 URL 의존성을 표준 semver로 교체 가능:

```diff
- "@polaris/ui": "https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.7.7/polaris-ui-0.7.7.tgz"
+ "@polaris/ui": "^0.7.2"
```

전환 비용은 각 컨슈머 `package.json` 한 줄 + `.npmrc`에 registry URL 한 줄 추가. 그 외에는 import / 사용 코드 무변경.
