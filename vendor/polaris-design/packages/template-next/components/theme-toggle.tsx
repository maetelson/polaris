'use client';

import { Button } from '@polaris/ui';

/**
 * SSR-safe theme toggle.
 *
 * The DOM is the source of truth (`<html data-theme>`), set during SSR via
 * the cookie read in `app/layout.tsx`. This component reads the current
 * theme straight from the DOM on click and writes the new value to both the
 * DOM and the cookie — no React state, no `useEffect`, no hydration warning
 * (no React 19 `react-hooks/set-state-in-effect`).
 *
 * The icon swap is driven by the `[data-theme]` attribute and CSS rules
 * defined in `app/globals.css` (`.theme-icon-light` / `.theme-icon-dark`).
 */
export function ThemeToggle() {
  const toggle = () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    document.cookie = `polaris-theme=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <Button variant="tertiary" size="sm" onClick={toggle} aria-label="Toggle theme">
      <span className="theme-icon-light" aria-hidden="true">🌙</span>
      <span className="theme-icon-dark" aria-hidden="true">☀</span>
    </Button>
  );
}
