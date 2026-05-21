/**
 * Design tokens reference — the visual companion to DESIGN.md.
 *
 * Color tokens are auto-iterated from `@polaris/ui/tokens.colors` so
 * any new addition (palette, semantic group) shows up here without a
 * code change. Non-color tokens (spacing / radius / shadow / motion /
 * z-index / breakpoint) get explicit sections with rendered samples.
 *
 * Each section header embeds the figma-spec PNG (synced from
 * `assets/figma-spec/` via `pnpm sync:figma-spec`) so this page mirrors
 * what the design team painted in Figma.
 */
import {
  colors,
  radius,
  shadow,
  textStyle,
  spacingNamed,
  breakpoint,
  duration,
  easing,
  zIndex,
} from '@polaris/ui/tokens';
import { Badge, Card, CardBody } from '@polaris/ui';

const FIGMA = `${import.meta.env.BASE_URL}figma-spec`;

type ColorPair = { light: string; dark: string };
type ColorValue = ColorPair | string;
type ColorGroup = Record<string, ColorValue>;

function isColorPair(v: unknown): v is ColorPair {
  return typeof v === 'object' && v !== null && 'light' in v && 'dark' in v;
}

/** A single token swatch — handles both `ColorPair` (light/dark split) and
 *  plain hex strings (palette ramps, gray ramp). */
function ColorSwatch({ name, value }: { name: string; value: ColorValue }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-polaris-md hover:bg-fill-neutral">
      <div
        className="flex h-10 w-20 shrink-0 rounded-polaris-sm overflow-hidden border border-line-neutral"
        aria-hidden="true"
      >
        {isColorPair(value) ? (
          <>
            <div className="flex-1" style={{ background: value.light }} title={`light ${value.light}`} />
            <div className="flex-1" style={{ background: value.dark }} title={`dark ${value.dark}`} />
          </>
        ) : (
          <div className="flex-1" style={{ background: value }} title={value} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-polaris-body2 font-semibold truncate">{name}</div>
        <div className="text-polaris-caption1 text-label-alternative font-polaris-mono">
          {isColorPair(value) ? `${value.light} / ${value.dark}` : value}
        </div>
      </div>
    </div>
  );
}

function ColorGrid({ tokens }: { tokens: ColorGroup }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
      {Object.entries(tokens).map(([name, value]) => (
        <ColorSwatch key={name} name={name} value={value} />
      ))}
    </div>
  );
}

function GroupBlock({
  name,
  desc,
  tokens,
}: {
  name: string;
  desc?: string;
  tokens: ColorGroup;
}) {
  return (
    <div className="space-y-2">
      <div>
        <code className="font-polaris-mono text-polaris-body2 font-semibold text-label-normal">
          {name}
        </code>
        {desc && <p className="text-polaris-caption1 text-label-alternative">{desc}</p>}
      </div>
      <ColorGrid tokens={tokens} />
    </div>
  );
}

/** Top-level section with optional Figma spec PNG header. */
function Section({
  title,
  description,
  specImage,
  children,
}: {
  title: string;
  description?: string;
  specImage?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-polaris-md">
      <header className="space-y-polaris-2xs">
        <h2 className="text-polaris-heading2 text-label-normal">{title}</h2>
        {description && (
          <p className="text-polaris-body2 text-label-neutral max-w-3xl">{description}</p>
        )}
        {specImage && (
          <details className="text-polaris-caption1 text-label-alternative">
            <summary className="cursor-pointer hover:text-label-neutral">
              Figma spec 시각 자료 보기
            </summary>
            <img
              src={`${FIGMA}/${specImage}`}
              alt={`${title} Figma spec`}
              className="mt-polaris-2xs max-w-full rounded-polaris-sm border border-line-neutral"
              loading="lazy"
            />
          </details>
        )}
      </header>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Color group taxonomy (v0.8) — auto-iterated. Adding a new group to
// `colors` in `@polaris/ui/tokens` and slotting it into the right
// bucket here is a 1-line change.
//
// Ordering rationale:
//   1. Brand identity   — 4-color × 파일 타입 단일 별칭 (story anchor)
//   2. Semantic         — UI 구현의 1차 선택지 (label/background/layer/…)
//   3. Brand ramps      — 10-step 미세조정 (단일 별칭 vs ramp는 use-case 따라)
//   4. Supplementary    — 차트 / 플랜 / 미디어 등 사이드 팔레트
//   5. Gray             — UI 백본 (텍스트/보더/surface/interaction의 베이스)
// ─────────────────────────────────────────────────────────────────────

/** PO 시그니처 4-color + AI Purple, 그리고 그것의 파일타입 별칭.
 *  brandPalette / fileType은 같은 hex를 가리키는 단일 소스 — 컴포넌트는
 *  주로 시맨틱 토큰(`accentBrand` 등)을 거쳐 적용하지만, 차트 / 헤더 /
 *  태그처럼 "브랜드 식별"이 의도된 자리에선 이 그룹을 직접 참조해도 OK. */
const BRAND_IDENTITY: Array<{ name: string; tokens: ColorGroup; desc?: string }> = [
  {
    name: 'brandPalette',
    tokens: colors.brandPalette as ColorGroup,
    desc: 'PO 시그니처 4-color (blue / green / orange / red) + AI Purple. 단일 별칭 — 10-step 램프는 §3 참고.',
  },
  {
    name: 'fileType',
    tokens: colors.fileType as ColorGroup,
    desc: '29 파일 확장자 → 4-color 매핑 (docx·hwp = blue, xlsx = green, pptx = orange, pdf = red). <FileIcon type="docx" /> 컴포넌트가 자동 적용 — 텍스트로 "DOCX" 라벨 달지 말 것.',
  },
];

/** 시맨틱 토큰 — UI 구현의 1차 선택지. hex / 임의값 직접 사용 금지
 *  (`@polaris/lint` 룰이 차단). v0.7.5에서 추가된 `surface` (popover /
 *  modal elevation tier)는 `layer` 와 같은 elevation 가족이라 인접 배치. */
const SEMANTIC_GROUPS: Array<{ name: string; tokens: ColorGroup; desc?: string }> = [
  { name: 'label',         tokens: colors.label as ColorGroup,         desc: '텍스트 + 아이콘 (normal / neutral / alternative / assistive / inverse / disabled)' },
  { name: 'background',    tokens: colors.background as ColorGroup,    desc: '페이지 레벨 배경 (base / disabled)' },
  { name: 'layer',         tokens: colors.layer as ColorGroup,         desc: '카드 / 다이얼로그 surface, modal dim overlay (scrim)' },
  { name: 'surface',       tokens: colors.surface as ColorGroup,       desc: 'elevation tier — popover (menu / dropdown / combobox) / modal (dialog / drawer / sheet) 패널. light는 모두 흰색, 다크에서만 단계별로 밝아짐 (layer.surface < surface.popover < surface.modal).' },
  { name: 'interaction',   tokens: colors.interaction as ColorGroup,   desc: 'hover / pressed (모든 클릭 가능 surface 공통)' },
  { name: 'fill',          tokens: colors.fill as ColorGroup,          desc: '틴트된 표면 (neutral 가장 옅음 → strong 가장 진함). Tertiary 버튼·필 칩·선택된 항목.' },
  { name: 'line',          tokens: colors.line as ColorGroup,          desc: '보더 / 디바이더 (neutral / normal / strong / disabled)' },
  { name: 'accentBrand',   tokens: colors.accentBrand as ColorGroup,   desc: 'PO Blue 강조 — Primary CTA (normal/strong) / Secondary tint (bg/bgHover) / hover-subtle' },
  { name: 'accentAction',  tokens: colors.accentAction as ColorGroup,  desc: 'Black "Primary Dark" 버튼 (다크모드 자동 반전)' },
  { name: 'state',         tokens: colors.state as ColorGroup,         desc: 'success / warning / error / info / new + bg 페어. 작은 텍스트 단독 사용은 contrast AA 미달 — 아이콘 동반 필수 (WCAG 1.4.1).' },
  { name: 'ai',            tokens: colors.ai as ColorGroup,            desc: 'NOVA Purple — AI 컨텍스트 전용. brand-blue로 위장하지 말 것 — 사용자가 AI 기능인지 인지 못 함.' },
  { name: 'focus',         tokens: colors.focus as ColorGroup,         desc: '키보드 포커스 ring (light alpha 35% / dark 45% 자동)' },
  { name: 'staticColors',  tokens: colors.staticColors as ColorGroup,  desc: '모드 무관 흰색 / 검정 (브랜드 마크 위 텍스트 등 어떤 테마에서도 고정 색이 필요한 경우)' },
];

const BRAND_RAMPS: Array<{ name: string; tokens: ColorGroup; desc?: string }> = [
  { name: 'bluePalette',     tokens: colors.bluePalette as ColorGroup,     desc: 'PO Blue — 메인 브랜드 + Word 파일 액센트' },
  { name: 'darkBluePalette', tokens: colors.darkBluePalette as ColorGroup, desc: 'PO Dark Blue — 마케팅 헤더, 서브 브랜드' },
  { name: 'greenPalette',    tokens: colors.greenPalette as ColorGroup,    desc: 'Sheet — Excel 액센트, state.success' },
  { name: 'orangePalette',   tokens: colors.orangePalette as ColorGroup,   desc: 'Slide — PowerPoint 액센트, state.warning' },
  { name: 'redPalette',      tokens: colors.redPalette as ColorGroup,      desc: 'PDF — state.error' },
  { name: 'purplePalette',   tokens: colors.purplePalette as ColorGroup,   desc: 'AI Purple — NOVA 전용' },
];

const SUPPLEMENTARY_RAMPS: Array<{ name: string; tokens: ColorGroup; desc?: string }> = [
  { name: 'skyBluePalette',           tokens: colors.skyBluePalette as ColorGroup,           desc: '플랜 뱃지 / 액센트 (PO Blue 보다 친근)' },
  { name: 'blueSupplementaryPalette', tokens: colors.blueSupplementaryPalette as ColorGroup, desc: '보조 블루 — PO Blue와 같은 화면에서 충돌 회피용' },
  { name: 'violetPalette',            tokens: colors.violetPalette as ColorGroup,            desc: '차트 / 태그 보라 — AI Purple와는 별개' },
  { name: 'cyanPalette',              tokens: colors.cyanPalette as ColorGroup,              desc: '이미지 / 미디어 포맷' },
  { name: 'yellowPalette',            tokens: colors.yellowPalette as ColorGroup,            desc: '노트 / 하이라이트 (warning과 다름)' },
];

export default function Tokens() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-polaris-3xl">
      <header>
        <Badge variant="secondary" className="mb-polaris-sm">@polaris/ui/tokens</Badge>
        <h1 className="text-polaris-title mb-polaris-2xs">디자인 토큰</h1>
        <p className="text-polaris-body1 text-label-neutral max-w-2xl">
          v0.8 토큰 전수 표시. 색상은{' '}
          <code className="font-polaris-mono text-polaris-body2 bg-fill-neutral px-1 rounded-polaris-sm">colors</code>{' '}
          export에서 자동 iterate되므로 새 그룹 추가 시 자동 반영됩니다. 디자인 정의서:{' '}
          <a href="https://github.com/PolarisOffice/PolarisDesign/blob/main/DESIGN.md" target="_blank" rel="noreferrer" className="text-accent-brand-normal underline">DESIGN.md</a>.
        </p>
      </header>

      {/* ──────────── 색상 ──────────── */}
      <Section
        title="1. 브랜드 정체성 (4-color × 파일 타입 단일 별칭)"
        description="PO 시그니처 4-color + AI Purple. 컴포넌트는 보통 시맨틱 토큰을 거쳐 적용하지만, 차트 카테고리 / 헤더 / 태그처럼 '브랜드 식별'이 의도된 자리에선 이 그룹을 직접 참조해도 OK. 4-color = 파일 타입 단일 소스라 brandPalette ≡ fileType 별칭."
      >
        <div className="space-y-polaris-lg">
          {BRAND_IDENTITY.map((g) => (
            <GroupBlock key={g.name} {...g} />
          ))}
        </div>
      </Section>

      <Section
        title="2. 시맨틱 토큰"
        description="UI 구현의 1차 선택지. 다크모드는 [data-theme=&quot;dark&quot;]로 자동 스위칭. hex / rgb / Tailwind 임의값 직접 사용은 금지 (lint 룰이 차단)."
        specImage="foundation/color.png"
      >
        <div className="space-y-polaris-lg">
          {SEMANTIC_GROUPS.map((g) => (
            <GroupBlock key={g.name} {...g} />
          ))}
        </div>
      </Section>

      <Section
        title="3. 브랜드 컬러 램프 (10단계 05~90)"
        description="brand 5색 + Dark Blue 각각 10단계. 차트 / hover / pressed / 그라디언트 등 시맨틱 토큰으로 표현 안 되는 미세조정에만 직접 사용. step 50 = brandPalette 단일 별칭의 light 값."
      >
        <div className="space-y-polaris-lg">
          {BRAND_RAMPS.map((g) => (
            <GroupBlock key={g.name} {...g} />
          ))}
        </div>
      </Section>

      <Section
        title="4. 서브 팔레트"
        description="primitive-color-palette 참조. 차트 카테고리 / 플랜 뱃지 / 미디어 포맷 등 — 메인 브랜드 컬러와 같은 화면에서 충돌 회피가 필요한 자리."
      >
        <div className="space-y-polaris-lg">
          {SUPPLEMENTARY_RAMPS.map((g) => (
            <GroupBlock key={g.name} {...g} />
          ))}
        </div>
      </Section>

      <Section
        title="5. Gray Ramp (UI 백본)"
        description="텍스트 / 보더 / surface / interaction 시맨틱 토큰의 베이스. 9 steps (10 → 90). 시맨틱 토큰을 거치는 게 1순위 — gray-* 직접 사용은 차트/장식 등 시맨틱이 안 맞는 곳에만."
      >
        <GroupBlock name="grayRamp" tokens={colors.grayRamp as ColorGroup} />
      </Section>

      {/* ──────────── 타이포그래피 ──────────── */}
      <Section
        title="6. 타이포그래피"
        description="Pretendard Variable. 11단계 (display / title / heading1-4 / body1-3 / caption1-2). letter-spacing 수정 금지 — Pretendard 자체 메트릭 사용."
        specImage="foundation/typography.png"
      >
        <Card>
          <CardBody>
            <div className="space-y-polaris-md">
              {Object.entries(textStyle).map(([name, style]) => (
                <div
                  key={name}
                  className="flex items-baseline gap-polaris-md border-b border-line-neutral last:border-0 pb-polaris-2xs last:pb-0"
                >
                  <code className="font-polaris-mono text-polaris-caption1 text-label-alternative shrink-0 w-28">
                    {name}
                  </code>
                  <div
                    style={{
                      fontSize: style.fontSize,
                      lineHeight: style.lineHeight,
                      fontWeight: style.fontWeight,
                      letterSpacing: style.letterSpacing,
                    }}
                  >
                    The quick brown fox 다람쥐 헌 쳇바퀴
                  </div>
                  <span className="ml-auto text-polaris-caption1 text-label-alternative font-polaris-mono whitespace-nowrap">
                    {style.fontSize} / {style.lineHeight} / {style.fontWeight}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <p className="text-polaris-caption1 text-label-alternative">
          모바일 (≤767px): tokens.css의 @media 블록이 자동으로 한 단계씩 축소. 별도 클래스 변경 불필요.
        </p>
      </Section>

      {/* ──────────── Spacing ──────────── */}
      <Section
        title="7. Spacing"
        description="4px 베이스 + 12레벨 named scale (4xs / 3xs / 2xs / xs / sm / md / lg / xl / 2xl / 3xl / 4xl). Tailwind class form: p-polaris-md, gap-polaris-lg 등. Tailwind 기본 (p-4 등)도 OK — 임의값(예: 13px 직접 박기)만 금지."
        specImage="foundation/grid.png"
      >
        <div className="space-y-polaris-2xs">
          {Object.entries(spacingNamed).map(([name, value]) => {
            const px = parseInt(value, 10) || 0;
            return (
              <div key={name} className="flex items-center gap-polaris-md">
                <code className="font-polaris-mono text-polaris-caption1 text-label-alternative shrink-0 w-24">
                  {name}
                </code>
                <div
                  className="bg-accent-brand-normal h-3 rounded-polaris-2xs"
                  style={{ width: `${Math.max(2, px) * 2}px` }}
                  aria-hidden="true"
                />
                <span className="text-polaris-caption1 text-label-neutral font-polaris-mono">
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ──────────── Radius ──────────── */}
      <Section
        title="8. Radius (md 12px default)"
        description="rounded-polaris-* 유틸. 기본값 md(12). Input은 sm(8). 큰 CTA는 lg(16). 모달 xl(24). 바텀시트 2xl(38). 원형은 pill (avatar / chip / 아이콘 버튼)."
        specImage="foundation/radius.png"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-polaris-2xs">
          {Object.entries(radius).map(([name, value]) => (
            <div key={name} className="flex flex-col items-center gap-polaris-3xs">
              <div
                className="h-16 w-16 bg-accent-brand-normal"
                style={{ borderRadius: value }}
                aria-hidden="true"
              />
              <code className="text-polaris-caption1 font-polaris-mono">{name}</code>
              <span className="text-polaris-caption2 text-label-alternative">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ──────────── Shadow ──────────── */}
      <Section
        title="9. Shadow (5단계 + AI glow + focus ring)"
        description="shadow-polaris-* 유틸. xs(hover) / sm(card) / md(dropdown) / lg(modal) / ai(AI 표면 보라 글로우) / focus(3px 시스템 포커스 링, light/dark 자동 alpha)."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-polaris-md">
          {(Object.keys(shadow.light) as Array<keyof typeof shadow.light>).map((name) => (
            <div key={name} className="flex flex-col items-center gap-polaris-2xs p-polaris-md bg-fill-neutral rounded-polaris-md">
              <div
                className="h-16 w-full rounded-polaris-md bg-layer-surface"
                style={{ boxShadow: shadow.light[name] }}
                aria-hidden="true"
              />
              <code className="text-polaris-caption1 font-polaris-mono">{name}</code>
            </div>
          ))}
        </div>
      </Section>

      {/* ──────────── Motion ──────────── */}
      <Section
        title="10. Motion"
        description="duration-polaris-* / ease-polaris-* 유틸. 박스에 hover하면 적용 미리보기. prefers-reduced-motion은 컴포넌트가 알아서 처리."
      >
        <div className="space-y-polaris-md">
          <div>
            <h3 className="text-polaris-body2 font-semibold text-label-normal mb-polaris-2xs">Duration</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-polaris-md">
              {Object.entries(duration).map(([name, value]) => (
                <div key={name} className="flex flex-col items-center gap-polaris-3xs">
                  <div
                    className="h-12 w-12 bg-fill-normal hover:bg-accent-brand-normal hover:scale-110 rounded-polaris-md cursor-pointer"
                    style={{ transition: `all ${value} cubic-bezier(0.4, 0, 0.2, 1)` }}
                    aria-hidden="true"
                  />
                  <code className="text-polaris-caption1 font-polaris-mono">{name}</code>
                  <span className="text-polaris-caption2 text-label-alternative">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-polaris-body2 font-semibold text-label-normal mb-polaris-2xs">Easing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-polaris-md">
              {Object.entries(easing).map(([name, value]) => (
                <div key={name} className="flex items-center gap-polaris-md p-polaris-md rounded-polaris-md border border-line-neutral">
                  <div
                    className="h-10 w-10 bg-fill-normal hover:bg-accent-brand-normal hover:translate-x-12 rounded-polaris-md cursor-pointer"
                    style={{ transition: `all 600ms ${value}` }}
                    aria-hidden="true"
                  />
                  <div>
                    <code className="text-polaris-caption1 font-polaris-mono block">{name}</code>
                    <span className="text-polaris-caption2 text-label-alternative font-polaris-mono break-all">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ──────────── Z-index ──────────── */}
      <Section
        title="11. Z-index"
        description="z-polaris-* 유틸. 6단계로 floating 요소 정리. 임의 z 값 사용 금지 — 새 단계가 필요하면 이 스케일을 확장."
      >
        <Card>
          <CardBody>
            <table className="w-full text-polaris-body2">
              <thead>
                <tr className="text-left border-b border-line-neutral">
                  <th className="py-polaris-2xs font-semibold w-32">Token</th>
                  <th className="py-polaris-2xs font-semibold w-20">Value</th>
                  <th className="py-polaris-2xs font-semibold">Use</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['base', '일반 콘텐츠'],
                  ['dropdown', 'Dropdown · Tooltip · Popover'],
                  ['sticky', 'Sticky 헤더 · 고정 탭'],
                  ['dim', '모달 dim 오버레이'],
                  ['modal', 'Modal · Popup · Bottom sheet'],
                  ['toast', 'Toast (최상위)'],
                ].map(([token, use]) => (
                  <tr key={token} className="border-b border-line-neutral last:border-0">
                    <td className="py-polaris-2xs">
                      <code className="font-polaris-mono text-polaris-caption1">{token}</code>
                    </td>
                    <td className="py-polaris-2xs">
                      <code className="font-polaris-mono text-polaris-caption1 text-label-alternative">
                        {zIndex[token as keyof typeof zIndex]}
                      </code>
                    </td>
                    <td className="py-polaris-2xs text-label-neutral">{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </Section>

      {/* ──────────── Breakpoint ──────────── */}
      <Section
        title="12. Breakpoint"
        description="Tailwind 기본 5단계 + 시맨틱 4단계 (mobile / tablet-v / tablet-h / desktop)."
      >
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-polaris-md">
              {Object.entries(breakpoint).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between gap-polaris-md py-polaris-2xs px-polaris-2xs rounded-polaris-sm hover:bg-fill-neutral">
                  <code className="font-polaris-mono text-polaris-caption1 text-label-normal">
                    {name}
                  </code>
                  <code className="font-polaris-mono text-polaris-caption1 text-label-alternative">
                    {value}
                  </code>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </Section>

      {/* ──────────── Iconography pointer ──────────── */}
      <Section
        title="13. Iconography"
        description="65 UI 아이콘 + 29 파일 아이콘 + 4 로고. /icons 카탈로그 페이지 참고."
        specImage="theme/iconography.png"
      >
        <Card>
          <CardBody>
            <p className="text-polaris-body2 text-label-neutral">
              아이콘 전체 카탈로그 →{' '}
              <a href="#/icons" className="text-accent-brand-normal underline">
                /icons 페이지
              </a>
              . Import 경로:{' '}
              <code className="font-polaris-mono text-polaris-caption1 bg-fill-neutral px-1 rounded-polaris-2xs">
                @polaris/ui/icons
              </code>
              ,{' '}
              <code className="font-polaris-mono text-polaris-caption1 bg-fill-neutral px-1 rounded-polaris-2xs">
                @polaris/ui/file-icons
              </code>
              ,{' '}
              <code className="font-polaris-mono text-polaris-caption1 bg-fill-neutral px-1 rounded-polaris-2xs">
                @polaris/ui/logos
              </code>
              .
            </p>
          </CardBody>
        </Card>
      </Section>
    </div>
  );
}
