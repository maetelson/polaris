import type { ESLint, Linter } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import noHardcodedColor from './rules/no-hardcoded-color';
import noArbitraryTailwind from './rules/no-arbitrary-tailwind';
import noDirectFontFamily from './rules/no-direct-font-family';
import preferPolarisComponent from './rules/prefer-polaris-component';
import stateColorWithIcon from './rules/state-color-with-icon';
import preferPolarisIcon from './rules/prefer-polaris-icon';
import noTailwindDefaultColor from './rules/no-tailwind-default-color';
import noDeprecatedPolarisToken from './rules/no-deprecated-polaris-token';
import noNonPolarisCssVar from './rules/no-non-polaris-css-var';

const meta = {
  name: '@polaris/lint',
  // ESLint Plugin spec의 meta.version — `pnpm version` 시점에
  // `scripts/sync-root-version.mjs`가 이 줄의 string literal을 자동
  // 교체합니다 (TS_TARGETS regex). 손으로 갱신하지 마세요.
  version: '0.8.0-rc.8',
} as const;

const rules = {
  'no-hardcoded-color': noHardcodedColor,
  'no-arbitrary-tailwind': noArbitraryTailwind,
  'no-direct-font-family': noDirectFontFamily,
  'prefer-polaris-component': preferPolarisComponent,
  'state-color-with-icon': stateColorWithIcon,
  'prefer-polaris-icon': preferPolarisIcon,
  // v0.7.3 — added after dashboard re-review (2026-05-08) found a real
  // site loading Polaris tokens but using Tailwind native palette +
  // self-defined `--color-*` aliases. Existing rules (regex on
  // bracket-arbitrary patterns / hex literals) didn't catch any of it.
  'no-tailwind-default-color': noTailwindDefaultColor,
  'no-deprecated-polaris-token': noDeprecatedPolarisToken,
  'no-non-polaris-css-var': noNonPolarisCssVar,
} as const;

const plugin: ESLint.Plugin = {
  meta,
  rules,
};

const recommended: Linter.Config[] = [
  {
    name: '@polaris/lint:typescript',
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser as Linter.Parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    name: '@polaris/lint:rules',
    plugins: { '@polaris': plugin },
    rules: {
      '@polaris/no-hardcoded-color': 'error',
      '@polaris/no-arbitrary-tailwind': 'error',
      '@polaris/no-direct-font-family': 'error',
      '@polaris/prefer-polaris-component': 'error',
      // v0.7-rc.1: warn (not error) — heuristic; suppress per-line if
      // an icon companion is present but undetected.
      '@polaris/state-color-with-icon': 'warn',
      // v0.7-rc.2: warn — lucide-react is still installed for icons
      // polaris doesn't cover. Suppress per-line where needed.
      '@polaris/prefer-polaris-icon': 'warn',
      // v0.7.3: warn for new rules — give consumers a migration window
      // before promoting to error in v0.8. Existing legitimate cases
      // (third-party brand colors, intentional Tailwind palette use) can
      // be suppressed per-line until then.
      '@polaris/no-tailwind-default-color': 'warn',
      // Deprecated tokens — error from day one (codemod handles bulk
      // migration; new code should never introduce a deprecated alias).
      '@polaris/no-deprecated-polaris-token': 'error',
      // Non-polaris CSS var — warn (some apps legitimately bridge to
      // third-party design systems). Promote to error case-by-case via
      // project-level overrides.
      '@polaris/no-non-polaris-css-var': 'warn',
    },
  },
];

plugin.configs = { recommended };

export default plugin;
