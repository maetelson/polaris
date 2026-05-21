# `assets/` — 디자인 원본 자산

폴라리스 디자인 시스템의 원본 자산 보관소. 디자인팀의 Figma에서 export 받은 PNG / SVG가 여기에 모인다. **npm으로 배포되지 않는다** — 빌드 단계에서 React 컴포넌트로 변환된 결과만 `@polaris/ui`에 포함된다.

## 구조

```
assets/
├── figma-spec/          참조용 PNG (디자인 정의서 시각 자료)
│   ├── foundation/      Color · Grid · Radius · Typography
│   ├── theme/           Iconography
│   └── components/      Button · Input · Tabs · … (13개)
│
├── svg/                 런타임 자산 (SVG, 컴포넌트 빌드 소스)
│   ├── icons/           UI 아이콘 (65종 × 18/24/32 px)
│   ├── file-icons/32/   파일 타입 아이콘 (29종, 32px 마스터)
│   └── logos/
│       ├── polaris-office/  Polaris Office 로고 (favicon · symbol-144 · horizontal · horizontal-negative)
│       └── nova/            NOVA AI 로고 (original · white)
│
└── ribbon/              Office 리본 전용 아이콘 (멀티컬러 baked-in)
    ├── big/             57종 × 32 px — RibbonButton size="lg" 용 (icon-over-label)
    └── small/           34종 × 16 px — RibbonButton size="sm/md" 용 (icon-only / icon-before-label)
```

모든 디렉토리/파일명은 **kebab-case 소문자**. 한국어 파일명은 영문으로 정규화 (`가로.svg` → `horizontal.svg`).

## Figma export 갱신 절차

디자인팀이 Figma 변경 사항을 export 해주면:

### 1. 새 SVG/PNG 받아 해당 디렉토리에 덮어쓰기

```sh
# 예: UI 아이콘 갱신
cp ~/Downloads/figma-export/*.svg assets/svg/icons/{18,24,32}/
```

Figma 자동 export 이름은 `Type=Arrow-Down, Size=18.svg` 형식이다.

### 2. 이름 정규화

```sh
pnpm --filter @polaris/ui normalize:icons
```

`Type=Arrow-Down, Size=18.svg` → `arrow-down.svg`로 자동 변환. idempotent (이미 정규 형식이면 건드리지 않음).

### 3. 컴포넌트 재빌드

```sh
pnpm --filter @polaris/ui build:icons
pnpm --filter @polaris/ui build:file-icons
pnpm --filter @polaris/ui build:logos
```

또는 한 번에:

```sh
pnpm --filter @polaris/ui build
```

### 4. 변경 확인

```sh
pnpm --filter @polaris/ui typecheck
pnpm --filter @polaris/ui test
```

## 출력 위치

| 자산 카테고리 | 빌드 결과 |
|---|---|
| `svg/icons/*` | `packages/ui/src/icons/*.tsx` (gitignored) |
| `svg/file-icons/32/*` | `packages/ui/src/file-icons/*.tsx` (gitignored) |
| `svg/logos/*/*` | `packages/ui/src/logos/*.tsx` (gitignored) |
| `ribbon/{big,small}/*` | `packages/ui/src/ribbon-icons/*.tsx` (gitignored) |
| `figma-spec/**/*.png` | (배포 안 함, 문서 참조 용도) |

## 색상 처리 정책

UI 아이콘 (`svg/icons/`):
- 디자인팀 기본 stroke `#454C53` (label.neutral) → 빌드 시 `currentColor`로 치환
- 다른 색상 (예: `#F95C5C` for error icon) → 그대로 보존 (semantic 의도)
- 결과: `<ArrowDownIcon className="text-label-neutral" />` 으로 색상 제어 가능. 다크모드 자동 대응.

파일 아이콘 (`svg/file-icons/`):
- 다중 색상 (그라디언트 / 브랜드 컬러) — 그대로 baked in
- 색상 prop으로 변경 불가; 디자인팀이 정한 색을 그대로 사용

로고 (`svg/logos/`):
- 브랜드 컬러 baked in
- 다크 배경용은 `tone="negative"` 또는 `tone="white"` variant로 별도 SVG 사용

## 문서 참조

`figma-spec/` 의 PNG는 다음 문서에서 참조한다:
- [`DESIGN.md`](../DESIGN.md) — 토큰 / 컴포넌트 spec 시각 자료
- [`docs/for-consumers/migration/v0.6-to-v0.7.md`](../docs/for-consumers/migration/v0.6-to-v0.7.md) — 컴포넌트 비교

GitHub raw URL을 사용해 README/CHANGELOG에서도 인라인 표시 가능:
```
https://raw.githubusercontent.com/PolarisOffice/PolarisDesign/main/assets/figma-spec/foundation/color.png
```
