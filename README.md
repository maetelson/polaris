# polaris

Polaris Office UI workbench.

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
