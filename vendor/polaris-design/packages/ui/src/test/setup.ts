import '@testing-library/jest-dom/vitest';

// jsdom doesn't ship ResizeObserver, but cmdk (used by Combobox/Command)
// reads it eagerly on mount. Provide a no-op polyfill so component tests
// can render Combobox / CommandList without throwing. Real browsers
// already have it; this is test-environment only.
if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'undefined') {
  class NoopResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  window.ResizeObserver = NoopResizeObserver as unknown as typeof ResizeObserver;
}

// jsdom doesn't ship `Element.prototype.scrollIntoView` either — cmdk
// calls it on the active CommandItem on mount. No-op for tests; real
// browsers behave normally.
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = function () {
    /* no-op */
  };
}

// jsdom also lacks `Element.prototype.hasPointerCapture` / `releasePointerCapture`,
// which Radix Select pulls in for some pointer-event paths.
if (typeof Element !== 'undefined' && typeof Element.prototype.hasPointerCapture === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Element.prototype as any).hasPointerCapture = () => false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Element.prototype as any).releasePointerCapture = () => {};
}
