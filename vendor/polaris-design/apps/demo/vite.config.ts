import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const base = process.env.GITHUB_PAGES === 'true' ? '/PolarisDesign/' : '/';
const uiSrc = path.resolve(__dirname, '../../packages/ui/src');

// In dev, alias `@polaris/ui` and its subpaths directly to source so HMR
// reflects package changes without a separate `tsup` build step.
// Type-checking still resolves through the package's `exports` field
// (the published `dist/*.d.ts`), so we still build the package before release.
//
// Subpath aliases must come BEFORE the bare `@polaris/ui` alias — Vite
// matches in array order and `@polaris/ui/ribbon` would otherwise resolve
// to `<root>/ribbon`.
//
// `icons/`, `file-icons/`, `logos/` are GENERATED at build time from
// `assets/svg/` (the source files under packages/ui/src/{icons,file-icons,logos}
// are gitignored). The demo's `predev`/`prebuild` hooks run the
// generators before Vite resolves these aliases — see apps/demo/package.json.
export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: [
      { find: '@polaris/ui/tokens',     replacement: path.join(uiSrc, 'tokens/index.ts') },
      { find: '@polaris/ui/tailwind',   replacement: path.join(uiSrc, 'tailwind/index.ts') },
      { find: '@polaris/ui/form',       replacement: path.join(uiSrc, 'form/index.ts') },
      { find: '@polaris/ui/ribbon',     replacement: path.join(uiSrc, 'ribbon/index.ts') },
      { find: '@polaris/ui/icons',      replacement: path.join(uiSrc, 'icons/index.ts') },
      { find: '@polaris/ui/file-icons', replacement: path.join(uiSrc, 'file-icons/index.ts') },
      { find: '@polaris/ui/logos',      replacement: path.join(uiSrc, 'logos/index.ts') },
      { find: '@polaris/ui/ribbon-icons', replacement: path.join(uiSrc, 'ribbon-icons/index.ts') },
      { find: /^@polaris\/ui$/,         replacement: path.join(uiSrc, 'index.ts') },
    ],
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
