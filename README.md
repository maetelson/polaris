# polaris

Polaris Office UI workbench.

## Polaris UI 작업 규칙

이 저장소는 기획안만 받아도 Polaris Office 톤앤매너에 맞는 Figma/Web UI가 나오도록 강제 출력 규칙을 둡니다.

- 모든 UI 작업은 [AGENTS.md](AGENTS.md)의 `Polaris UI Brief` 출력 규칙을 먼저 따릅니다.
- 톤앤매너 기준은 [Polaris UI Contract](docs/design/polaris-ui-contract.md)에 둡니다.
- Figma 산출물 기준은 [Figma Output Contract](docs/design/figma-output-contract.md)를 따릅니다.
- 브리프 템플릿은 [UI Brief Template](docs/design/ui-brief-template.md)을 사용합니다.

## 협업 규칙

- 커밋 메시지는 [한국어 커밋 컨벤션](docs/commit-convention.md)을 따릅니다.
- 로컬 Git hook을 활성화하려면 아래 명령을 한 번 실행합니다.

```bash
git config core.hooksPath .githooks
```

- 커밋 메시지를 직접 검사하려면 아래 명령을 사용합니다.

```bash
npm run commit:check -- .git/COMMIT_EDITMSG
```
