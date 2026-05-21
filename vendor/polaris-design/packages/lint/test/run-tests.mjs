import { RuleTester } from 'eslint';
import polaris from '../dist/index.js';

let passed = 0;
let failed = 0;
const failures = [];

RuleTester.it = (name, fn) => {
  try {
    fn();
    passed++;
  } catch (err) {
    failed++;
    failures.push({ name, err });
  }
};
RuleTester.itOnly = RuleTester.it;
RuleTester.describe = (name, fn) => fn();

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

// ============================================================
// no-hardcoded-color
// ============================================================
tester.run('no-hardcoded-color', polaris.rules['no-hardcoded-color'], {
  valid: [
    { code: `const c = "var(--polaris-brand-primary)";` },
    { code: `const c = "currentColor";` },
    { code: `const x = 42;` },
    { code: `const c = \`color: var(--polaris-text-primary);\`;` },
    // 2-letter strings starting with # are not colors
    { code: `const id = "#x1";` },
    // Named color in non-color context is fine
    { code: `const x = { value: "red" };` },
    { code: `const x = { fill: "currentColor" };` },
  ],
  invalid: [
    {
      code: `const c = "#1D4ED8";`,
      errors: [{ messageId: 'hex' }],
    },
    {
      code: `const c = "#fff";`,
      errors: [{ messageId: 'hex' }],
    },
    {
      code: `const style = { color: "#FF6962" };`,
      errors: [{ messageId: 'hex' }],
    },
    {
      code: `const c = "rgb(255, 0, 0)";`,
      errors: [{ messageId: 'fn' }],
    },
    {
      code: `const c = "hsla(220, 50%, 50%, 0.8)";`,
      errors: [{ messageId: 'fn' }],
    },
    {
      code: `const c = \`background: #2B7FFF;\`;`,
      errors: [{ messageId: 'hex' }],
    },
    {
      // Multiple violations in one string
      code: `const css = "color: #fff; background: #000;";`,
      errors: [{ messageId: 'hex' }, { messageId: 'hex' }],
    },
    {
      // CSS named color in inline style
      code: `const style = { color: "red" };`,
      errors: [{ messageId: 'colorProp' }],
    },
    {
      code: `const style = { backgroundColor: "blue" };`,
      errors: [{ messageId: 'colorProp' }],
    },
    {
      code: `const style = { fill: "darkslategray" };`,
      errors: [{ messageId: 'colorProp' }],
    },
  ],
});

tester.run('prefer-polaris-component', polaris.rules['prefer-polaris-component'], {
  valid: [
    { code: `const x = <div>hi</div>;` },
    { code: `import { Button } from '@polaris/ui'; const x = <Button>hi</Button>;` },
    { code: `const x = <span>hi</span>;` },
    { code: `const x = <p>hi</p>;` },
    // form-submit allowance (default: true) — these are legitimate native usages
    { code: `const x = <button type="submit">전송</button>;` },
    { code: `const x = <button type="reset">취소</button>;` },
  ],
  invalid: [
    {
      code: `const x = <button>click</button>;`,
      errors: [{ messageId: 'replace' }],
    },
    {
      // type="button" is the default — still flagged
      code: `const x = <button type="button">click</button>;`,
      errors: [{ messageId: 'replace' }],
    },
    {
      // explicit opt-out: allowFormSubmit:false makes <button type="submit"> invalid too
      code: `const x = <button type="submit">전송</button>;`,
      options: [{ allowFormSubmit: false }],
      errors: [{ messageId: 'replace' }],
    },
    {
      code: `const x = <input type="text" />;`,
      errors: [{ messageId: 'replace' }],
    },
    {
      code: `const x = <textarea />;`,
      errors: [{ messageId: 'replace' }],
    },
    {
      code: `const x = <select><option>a</option></select>;`,
      errors: [{ messageId: 'replace' }],
    },
    {
      code: `const x = <dialog>x</dialog>;`,
      errors: [{ messageId: 'replace' }],
    },
  ],
});

// ============================================================
// no-arbitrary-tailwind
// ============================================================
tester.run('no-arbitrary-tailwind', polaris.rules['no-arbitrary-tailwind'], {
  valid: [
    { code: `const cls = "bg-brand-primary p-4 rounded-polaris-md";` },
    { code: `const cls = "text-fg-primary font-polaris";` },
    { code: `const cls = \`bg-surface-canvas \${active && 'ring-brand-primary'}\`;` },
    { code: `const x = "[1, 2, 3]";` },
    // Layout utilities — token-uncovered, must be allowed
    { code: `const cls = "grid grid-cols-[1fr_180px_120px]";` },
    { code: `const cls = "grid grid-rows-[auto_1fr_auto]";` },
    { code: `const cls = "col-span-[2] row-span-[3]";` },
    { code: `const cls = "col-start-[1] col-end-[3]";` },
  ],
  invalid: [
    {
      code: `const cls = "bg-[#1D4ED8] p-4";`,
      errors: [{ messageId: 'arbitrary' }],
    },
    {
      code: `const cls = "p-[13px] m-[7px]";`,
      errors: [{ messageId: 'arbitrary' }, { messageId: 'arbitrary' }],
    },
    {
      code: `const cls = "text-[24px] leading-[32px] tracking-[-0.02em]";`,
      errors: [
        { messageId: 'arbitrary' },
        { messageId: 'arbitrary' },
        { messageId: 'arbitrary' },
      ],
    },
    {
      code: `const cls = \`rounded-[14px] \${variant}\`;`,
      errors: [{ messageId: 'arbitrary' }],
    },
  ],
});

// ============================================================
// no-direct-font-family
// ============================================================
tester.run('no-direct-font-family', polaris.rules['no-direct-font-family'], {
  valid: [
    {
      code: `const s = { fontFamily: "var(--polaris-font-sans)" };`,
    },
    {
      code: `const css = \`font-family: var(--polaris-font-mono);\`;`,
    },
    { code: `const cls = "font-polaris";` },
    { code: `const x = { color: "var(--polaris-text-primary)" };` },
  ],
  invalid: [
    {
      code: `const s = { fontFamily: "Pretendard, sans-serif" };`,
      errors: [{ messageId: 'jsxFontFamily' }],
    },
    {
      code: `const s = { fontFamily: 'Helvetica' };`,
      errors: [{ messageId: 'jsxFontFamily' }],
    },
    {
      code: `const css = \`font-family: Pretendard, sans-serif;\`;`,
      errors: [{ messageId: 'cssFontFamily' }],
    },
    {
      code: `const cls = "font-['Helvetica']";`,
      errors: [{ messageId: 'tailwindFontArbitrary' }],
    },
  ],
});

// ============================================================
// no-tailwind-default-color
// ============================================================
tester.run('no-tailwind-default-color', polaris.rules['no-tailwind-default-color'], {
  valid: [
    // Polaris semantic tokens — fine
    { code: `const cls = "text-label-normal bg-background-normal border-line-neutral";` },
    { code: `const cls = "text-state-error bg-state-error-bg";` },
    { code: `const cls = "bg-accent-brand-normal text-label-inverse";` },
    // No color utility at all
    { code: `const cls = "p-4 rounded-polaris-md flex items-center";` },
    { code: `const x = "slate is a kind of rock";` },          // text mention, not className
    // Tailwind palette WITHOUT shade — not valid Tailwind, ignored
    { code: `const cls = "text-slate";` },
    // Polaris-owned palette ramps (README §85 / AGENTS §121) — 1-2 digit
    // shades on blue/purple/green/red/orange/cyan/yellow/gray/violet are
    // documented official tokens (not Tailwind defaults).
    { code: `const cls = "bg-blue-50 text-purple-70 border-gray-30";` },
    { code: `const cls = "from-purple-40 to-purple-50";` },         // NOVA gradient
    { code: `const cls = "bg-green-30 text-orange-70 bg-yellow-10";` },
    { code: `const cls = "bg-red-50 hover:bg-red-60";` },
    { code: `const cls = "text-cyan-80 text-violet-50";` },
    { code: `const cls = "bg-gray-10 border-gray-90";` },
    // Even with alpha modifier on a Polaris-owned 2-digit shade — allowed.
    { code: `const cls = "bg-blue-50/60";` },
  ],
  invalid: [
    {
      code: `const cls = "text-slate-600 bg-slate-50";`,
      errors: [{ messageId: 'tailwindDefault' }, { messageId: 'tailwindDefault' }],
    },
    {
      code: `const cls = "hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200";`,
      errors: [
        { messageId: 'tailwindDefault' },
        { messageId: 'tailwindDefault' },
        { messageId: 'tailwindDefault' },
      ],
    },
    {
      // 3-digit shades on Polaris-owned palette names — Tailwind defaults
      // (Polaris ramps stop at 90; 100+ falls through to Tailwind).
      code: `const cls = "from-blue-200 via-purple-300 to-red-100";`,
      errors: [
        { messageId: 'tailwindDefault' },
        { messageId: 'tailwindDefault' },
        { messageId: 'tailwindDefault' },
      ],
    },
    {
      // Alpha modifier (Tailwind 3.4+) — also flagged
      code: `const cls = "bg-slate-600/50";`,
      errors: [{ messageId: 'tailwindDefault' }],
    },
    {
      // Inside template literal
      code: `const cls = \`text-emerald-700 \${active && 'bg-amber-100'}\`;`,
      errors: [{ messageId: 'tailwindDefault' }, { messageId: 'tailwindDefault' }],
    },
    {
      // `neutral` is a special case — Polaris extends it but with the
      // *deprecated* rc.0 palette. Flag regardless of shade. (Suggestion
      // is `fill-neutral` / `label-neutral`.)
      code: `const cls = "bg-neutral-100 text-neutral-600";`,
      errors: [{ messageId: 'tailwindDefault' }, { messageId: 'tailwindDefault' }],
    },
  ],
});

// ============================================================
// no-deprecated-polaris-token
// ============================================================
tester.run('no-deprecated-polaris-token', polaris.rules['no-deprecated-polaris-token'], {
  valid: [
    // v0.7 spec tokens — fine
    { code: `const cls = "text-label-normal bg-layer-surface border-line-neutral";` },
    { code: `const cls = "bg-accent-brand-normal hover:bg-accent-brand-strong";` },
    { code: `const cls = "text-state-error bg-state-error-bg";` },
    // Polaris CSS vars — fine
    { code: `const css = \`color: var(--polaris-label-normal);\`;` },
    // Non-polaris CSS var — NOT this rule's concern (covered by no-non-polaris-css-var)
    { code: `const css = \`color: var(--my-color);\`;` },
  ],
  invalid: [
    {
      // v0.6 fg-* family
      code: `const cls = "text-fg-primary bg-fg-secondary";`,
      errors: [{ messageId: 'deprecatedTailwind' }, { messageId: 'deprecatedTailwind' }],
    },
    {
      // v0.6 surface-*
      code: `const cls = "bg-surface-canvas border-surface-border-strong";`,
      errors: [{ messageId: 'deprecatedTailwind' }, { messageId: 'deprecatedTailwind' }],
    },
    {
      // rc.0 brand-primary*
      code: `const cls = "bg-brand-primary hover:bg-brand-primary-hover";`,
      errors: [{ messageId: 'deprecatedTailwind' }, { messageId: 'deprecatedTailwind' }],
    },
    {
      // v1 status-*
      code: `const cls = "bg-status-success text-status-danger";`,
      errors: [{ messageId: 'deprecatedTailwind' }, { messageId: 'deprecatedTailwind' }],
    },
    {
      // CSS var — rc.0 boring purple neutral
      code: `const css = \`color: var(--polaris-neutral-600);\`;`,
      errors: [{ messageId: 'deprecatedCssVar' }],
    },
    {
      // CSS var — rc.0 text alias
      code: `const css = \`color: var(--polaris-text-primary);\`;`,
      errors: [{ messageId: 'deprecatedCssVar' }],
    },
    {
      // CSS var — rc.0 surface alias
      code: `const css = \`background: var(--polaris-surface-raised);\`;`,
      errors: [{ messageId: 'deprecatedCssVar' }],
    },
    {
      // Mixed — Tailwind class + CSS var on same line
      code: `const x = "bg-fg-primary"; const y = \`color: var(--polaris-neutral-700);\`;`,
      errors: [{ messageId: 'deprecatedTailwind' }, { messageId: 'deprecatedCssVar' }],
    },
    {
      // v0.8 — `background-normal` / `background-alternative` removed
      code: `const cls = "bg-background-normal text-background-alternative";`,
      errors: [{ messageId: 'deprecatedTailwind' }, { messageId: 'deprecatedTailwind' }],
    },
    {
      // v0.8 — `primary-*` (rc.0 alias) removed
      code: `const cls = "bg-primary-normal hover:bg-primary-strong";`,
      errors: [{ messageId: 'deprecatedTailwind' }, { messageId: 'deprecatedTailwind' }],
    },
    {
      // v0.8 — `--polaris-radius-full` removed
      code: `const css = \`border-radius: var(--polaris-radius-full);\`;`,
      errors: [{ messageId: 'deprecatedCssVar' }],
    },
    {
      // v0.8 — `--polaris-background-normal` removed
      code: `const css = \`background: var(--polaris-background-normal);\`;`,
      errors: [{ messageId: 'deprecatedCssVar' }],
    },
    {
      // v0.8 — `--polaris-primary-normal` (rc.0 alias) removed
      code: `const css = \`color: var(--polaris-primary-normal);\`;`,
      errors: [{ messageId: 'deprecatedCssVar' }],
    },
    {
      // v0.8 — typography legacy names removed
      code: `const cls = "text-polaris-display-lg text-polaris-h1 text-polaris-body-sm";`,
      errors: [
        { messageId: 'deprecatedTailwind' }, // display-lg
        { messageId: 'deprecatedTailwind' }, // h1
        { messageId: 'deprecatedTailwind' }, // body-sm
      ],
    },
    {
      // v0.8 — typography meta/tiny/caption removed
      code: `const cls = "text-polaris-meta text-polaris-tiny text-polaris-caption";`,
      errors: [
        { messageId: 'deprecatedTailwind' }, // meta
        { messageId: 'deprecatedTailwind' }, // tiny
        { messageId: 'deprecatedTailwind' }, // caption
      ],
    },
    {
      // v0.8 — `rounded-polaris-full` removed
      code: `const cls = "rounded-polaris-full";`,
      errors: [{ messageId: 'deprecatedTailwind' }],
    },
    {
      // v0.8 — bare ramp step `5` (replaced by `05`)
      code: `const cls = "bg-blue-5 text-purple-5 ring-green-5";`,
      errors: [
        { messageId: 'deprecatedTailwind' },
        { messageId: 'deprecatedTailwind' },
        { messageId: 'deprecatedTailwind' },
      ],
    },
    {
      // Negative-lookahead must protect `-50`, `-500` and `text-polaris-body1`/`-body2`
      // — these are valid v0.8 spec, NOT errors. Mixed with one real `-5`.
      code: `const cls = "bg-blue-50 bg-blue-500 text-polaris-body1 text-polaris-body2 mt-5 bg-blue-5";`,
      errors: [{ messageId: 'deprecatedTailwind' }], // only the bg-blue-5
    },
  ],
});

// ============================================================
// no-non-polaris-css-var
// ============================================================
tester.run('no-non-polaris-css-var', polaris.rules['no-non-polaris-css-var'], {
  valid: [
    // Polaris vars
    { code: `const css = \`color: var(--polaris-label-normal);\`;` },
    { code: `const css = \`background: var(--polaris-accent-brand-normal);\`;` },
    // Tailwind internal vars — allowed
    { code: `const css = \`--tw-shadow: 0 1px 2px;\`;` },
    { code: `const css = \`opacity: var(--tw-opacity);\`;` },
    // No var() at all
    { code: `const cls = "p-4 text-label-normal";` },
    // allowedPrefixes option — escape hatch
    {
      code: `const css = \`color: var(--my-org-brand);\`;`,
      options: [{ allowedPrefixes: ['--my-org-'] }],
    },
  ],
  invalid: [
    {
      // The dashboard site case — self-defined --color-* alias layer
      code: `const css = \`color: var(--color-copy);\`;`,
      errors: [{ messageId: 'nonPolarisVar' }],
    },
    {
      code: `const css = \`background: var(--color-background);\`;`,
      errors: [{ messageId: 'nonPolarisVar' }],
    },
    {
      // Self-defined gradient
      code: `const css = \`background: var(--app-gradient-nova-main);\`;`,
      errors: [{ messageId: 'nonPolarisVar' }],
    },
    {
      // Multiple in one string
      code: `const css = \`color: var(--color-copy); background: var(--color-background);\`;`,
      errors: [{ messageId: 'nonPolarisVar' }, { messageId: 'nonPolarisVar' }],
    },
    {
      // Inline style attribute
      code: `const s = { color: 'var(--my-text)' };`,
      errors: [{ messageId: 'nonPolarisVar' }],
    },
    {
      // Tailwind arbitrary value — also caught (no-arbitrary-tailwind would
      // catch the bracket pattern; this rule catches the var() inside)
      code: `const cls = "bg-[var(--my-brand)]";`,
      errors: [{ messageId: 'nonPolarisVar' }],
    },
  ],
});

// ============================================================
// Report
// ============================================================
if (failed > 0) {
  console.error(`\n✗ ${failed} test(s) failed:\n`);
  for (const f of failures) {
    console.error(`  • ${f.name}`);
    console.error(`    ${f.err.message?.split('\n').slice(0, 4).join('\n    ')}`);
  }
  console.error(`\n${passed} passed, ${failed} failed`);
  process.exit(1);
}
console.log(`\n✓ ${passed} test(s) passed`);
