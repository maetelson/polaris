/**
 * Motion tokens — durations + easing curves (v0.7-rc.1 NEW).
 *
 * Per DESIGN.md §7 motion philosophy: "Animations are functional, not
 * decorative. They confirm state changes and guide attention — never
 * delay or entertain." Default to `--duration-fast` for state changes,
 * `--duration-slow` for overlays.
 *
 * `prefers-reduced-motion: reduce` should override every duration to
 * `0ms` and strip transform animations (keep opacity-only). Consumers
 * are responsible for the media query — we don't emit it because the
 * tokens themselves stay consistent.
 */
export const duration = {
  /** 100ms — hover / focus feedback (instant). */
  instant: '100ms',
  /** 150ms — button color, simple state change. */
  fast:    '150ms',
  /** 250ms — dropdown / tooltip open-close. */
  normal:  '250ms',
  /** 350ms — modal enter, toast slide. */
  slow:    '350ms',
} as const;

export const easing = {
  /** Default for symmetric transitions (state toggle). */
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Enter / appear animations. */
  out:   'cubic-bezier(0, 0, 0.2, 1)',
  /** Exit / disappear animations. */
  in:    'cubic-bezier(0.4, 0, 1, 1)',
} as const;

export const motion = {
  duration,
  easing,
} as const;
