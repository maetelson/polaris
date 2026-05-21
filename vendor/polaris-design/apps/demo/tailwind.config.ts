import polarisPreset from '@polaris/ui/tailwind';
import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/ui/dist/**/*.{js,cjs}',
  ],
  presets: [polarisPreset],
} satisfies Config;
