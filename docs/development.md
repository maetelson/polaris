# 개발 및 배포 가이드

## GitHub Pages 배포

이 저장소는 `main` 브랜치에 push되면 `.github/workflows/deploy-pages.yml`이 정적 웹 앱을 빌드해서 GitHub Pages에 배포합니다.

GitHub 저장소에서 한 번만 설정하면 됩니다.

1. `Settings` -> `Pages`로 이동합니다.
2. `Build and deployment`의 `Source`를 `GitHub Actions`로 선택합니다.
3. `main`에 push하거나 Actions의 `Deploy GitHub Pages` workflow를 수동 실행합니다.
4. 배포 URL은 `https://maetelson.github.io/polaris/` 입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

프로덕션 빌드와 preview:

```bash
npm run build
npm run preview
```

## Polaris UI 작업 규칙

모든 UI 작업은 루트 [AGENTS.md](../AGENTS.md)의 `Polaris UI Brief` 출력 규칙을 먼저 따릅니다.

- 톤앤매너 기준: [Polaris UI Contract](design/polaris-ui-contract.md)
- Figma 산출물 기준: [Figma Output Contract](design/figma-output-contract.md)
- 브리프 템플릿: [UI Brief Template](design/ui-brief-template.md)
- upstream snapshot: [vendor/polaris-design](../vendor/polaris-design)
- generated token data: [docs/design/generated](design/generated)

## 검증 명령

```bash
npm run polaris:sync -- --check
npm run polaris:validate
npm run polaris:pages:check
npm run polaris:brief:check
npm run polaris:links:check
npm run polaris:brand-audit
npm run build
```

## 커밋 규칙

커밋 메시지는 [한국어 커밋 컨벤션](commit-convention.md)을 따릅니다.

로컬 Git hook을 활성화하려면:

```bash
git config core.hooksPath .githooks
```

커밋 메시지를 직접 검사하려면:

```bash
npm run commit:check -- .git/COMMIT_EDITMSG
```
