import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { ErrorIcon } from '../icons';
import { cn } from '../lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
  /**
   * Auto-resize the textarea to fit its content (between `minRows` and
   * `maxRows`). When enabled, the native vertical resize handle is hidden
   * (drag-to-resize would fight the auto-grow).
   *
   * Pass `true` for default 1 → 8 rows, or an object for fine control:
   * `autoResize={{ minRows: 2, maxRows: 12 }}`.
   */
  autoResize?: boolean | { minRows?: number; maxRows?: number };
  /**
   * Show a `current/maxLength` counter below the field. Requires
   * `maxLength` to be set. The counter turns `state-error` color when
   * the value exceeds 100% (browsers truncate by default, but the
   * counter still surfaces the boundary).
   */
  showCount?: boolean;
}

const DEFAULT_AUTO_RESIZE = { minRows: 1, maxRows: 8 };

/**
 * Textarea — multi-line input matching the Polaris Input visual.
 *
 * Beyond the base label/helperText/error pattern, supports two common SaaS
 * needs that consumers were re-implementing inline:
 *   - `autoResize` — grows/shrinks to fit content (with min/max bounds)
 *   - `showCount` — `current/max` indicator (requires `maxLength`)
 *
 * @example Auto-resizing comment box, 3-12 rows, with counter
 * ```tsx
 * <Textarea
 *   label="코멘트"
 *   placeholder="피드백을 입력하세요"
 *   autoResize={{ minRows: 3, maxRows: 12 }}
 *   maxLength={500}
 *   showCount
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      id: providedId,
      rows = 4,
      autoResize,
      showCount,
      maxLength,
      value,
      defaultValue,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const messageId = error || helperText ? `${id}-msg` : undefined;
    const isError = Boolean(error);
    const localRef = useRef<HTMLTextAreaElement | null>(null);
    useImperativeHandle(forwardedRef, () => localRef.current as HTMLTextAreaElement);

    const resizeOpts = autoResize === true ? DEFAULT_AUTO_RESIZE : autoResize || null;

    // Track length internally so the counter updates even in
    // *uncontrolled* mode — without this, parent re-renders never fire,
    // so `currentLen` (read once at render) stays at the initial
    // `defaultValue` length and the counter looks frozen. In
    // controlled mode we still trust the prop.
    const [internalLen, setInternalLen] = useState(() =>
      typeof value === 'string'
        ? value.length
        : typeof defaultValue === 'string'
        ? defaultValue.length
        : 0
    );
    useEffect(() => {
      if (typeof value === 'string') setInternalLen(value.length);
    }, [value]);

    // Resize on every render where the textarea exists. We measure
    // `scrollHeight` after temporarily shrinking the element to its
    // single-row min so the browser reports the *natural* height, then
    // clamp into the [minRows, maxRows] window.
    const resize = () => {
      const el = localRef.current;
      if (!el || !resizeOpts) return;
      const { minRows = 1, maxRows = 8 } = resizeOpts;
      // Use computed style for line-height so we honor the CSS cascade
      // (font-size, line-height tokens, etc.).
      const cs = window.getComputedStyle(el);
      const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
      const padding =
        parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const border =
        parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
      el.style.height = 'auto';
      const natural = el.scrollHeight;
      const min = lineHeight * minRows + padding + border;
      const max = lineHeight * maxRows + padding + border;
      el.style.height = `${Math.min(Math.max(natural, min), max)}px`;
      el.style.overflowY = natural > max ? 'auto' : 'hidden';
    };

    // Re-measure on mount and whenever value changes (controlled or not).
    useLayoutEffect(() => {
      if (resizeOpts) resize();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Handle window resize too — wrapping reflow can change scrollHeight.
    useEffect(() => {
      if (!resizeOpts) return;
      const onWinResize = () => resize();
      window.addEventListener('resize', onWinResize);
      return () => window.removeEventListener('resize', onWinResize);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      // Always bump internal length — required for the counter to update
      // in *uncontrolled* mode (parent re-render not guaranteed). In
      // controlled mode the length comes from `value` via the useEffect
      // above; internalLen still gets bumped but isn't read.
      setInternalLen(e.target.value.length);
      onChange?.(e);
      if (resizeOpts) resize();
    };

    // Counter: controlled value wins; otherwise read from internal state.
    const currentLen =
      typeof value === 'string' ? value.length : internalLen;
    const overLimit = typeof maxLength === 'number' && currentLen > maxLength;

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="text-polaris-body2 font-medium text-label-normal"
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={localRef}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          onChange={handleChange}
          aria-invalid={isError || undefined}
          aria-describedby={messageId}
          className={cn(
            'px-3 py-2 rounded-polaris-md text-polaris-body2 font-polaris',
            'bg-background-base text-label-normal placeholder:text-label-alternative',
            'border border-line-normal',
            // Auto-resize hides the native drag handle (fights the grow).
            resizeOpts ? 'resize-none' : 'resize-vertical',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand-normal focus-visible:border-accent-brand-normal',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isError && 'border-state-error focus-visible:ring-state-error focus-visible:border-state-error',
            className
          )}
          {...props}
        />
        {(error || helperText || (showCount && typeof maxLength === 'number')) && (
          <div className="flex items-start justify-between gap-polaris-2xs">
            {(error || helperText) ? (
              <p
                id={messageId}
                className={cn(
                  'text-polaris-helper',
                  isError ? 'flex items-start gap-polaris-3xs text-state-error' : 'text-label-alternative'
                )}
                role={isError ? 'alert' : undefined}
              >
                {isError && <ErrorIcon size={16} className="shrink-0 mt-px" aria-hidden="true" />}
                <span>{error ?? helperText}</span>
              </p>
            ) : (
              <span aria-hidden="true" />
            )}
            {showCount && typeof maxLength === 'number' && (
              <span
                className={cn(
                  'shrink-0 text-polaris-helper tabular-nums',
                  overLimit ? 'text-state-error' : 'text-label-alternative'
                )}
                aria-live="polite"
              >
                {currentLen}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
