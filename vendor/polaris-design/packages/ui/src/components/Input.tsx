import {
  forwardRef,
  useEffect,
  useId,
  useState,
  useImperativeHandle,
  useRef,
  type FocusEvent,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';
import { ErrorIcon } from '../icons';
import { cn } from '../lib/cn';

export interface InputProps
  // `prefix` is a standard HTML attribute (`prefix="og: ..."`) typed as `string`;
  // omit it so we can re-define it as a ReactNode slot.
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Floating title — appears as a small label inside the input on focus
   *  or when the field has a value. Replaces the rc.0 above-input label
   *  per DESIGN.md §4. */
  label?: string;
  /** Helper text rendered below the input (between focus ring and error). */
  helperText?: string;
  /** Error message — automatically rendered below the input with a
   *  mandatory ⚠️ icon (WCAG 1.4.1: never communicate state via color
   *  alone). Pass `null` / `undefined` to clear. */
  error?: string;
  containerClassName?: string;
  /**
   * Content rendered inside the input on the LEFT (currency symbol,
   * unit prefix, leading icon). Wrapped in a non-interactive `<span>`
   * unless it contains a button/anchor — pass interactive elements as
   * usual. The input's left padding adjusts automatically.
   *
   * @example `prefix="$"` · `prefix={<SearchIcon className="h-4 w-4" />}`
   */
  prefix?: ReactNode;
  /**
   * Content rendered on the RIGHT (unit suffix, trailing icon, helper
   * text). Same wrapping behavior as `prefix`. Sits to the LEFT of the
   * `clearable` × button when both are present.
   */
  suffix?: ReactNode;
  /**
   * Show a clear (×) button when the input has a value. The button
   * fires a synthetic `input`/`change` event with empty value so
   * controlled inputs Just Work. Disabled when the input is disabled
   * or readOnly. Default: `false`.
   */
  clearable?: boolean;
  /** Fires after the clear (×) button resets the value. */
  onClear?: () => void;
}

/**
 * Input — v0.7-rc.1 spec (DESIGN.md §4).
 *
 *   height       52px
 *   h-padding    20px
 *   radius       8px (sm)
 *   font         body2 (14 / Regular)
 *   border       line-neutral (default), accent-brand-normal (focus),
 *                state-error (error)
 *   placeholder  label-assistive
 *
 * Floating title pattern: when `label` is provided, the label sits
 * inside the input. Empty + blurred → label centered (placeholder-style).
 * Focus or filled → label shrinks + lifts to the top of the input,
 * leaving room for the user-typed value below.
 *
 * Error text: when `error` is provided, the input border turns red AND
 * an icon-prefixed error message renders below. The icon is mandatory
 * (WCAG 1.4.1) — never rely on color alone to signal state.
 *
 * **`prefix` / `suffix` / `clearable`** (v0.7.6 NEW):
 * Affordances for currency/unit/icon adornments and one-click reset.
 * The input padding auto-adjusts to make room. Mutually composable —
 * use any combination.
 *
 * @example Currency + clearable
 * ```tsx
 * <Input prefix="₩" suffix="KRW" clearable
 *        value={amount} onChange={(e) => setAmount(e.target.value)} />
 * ```
 *
 * @example Search input
 * ```tsx
 * <Input prefix={<SearchIcon className="h-4 w-4" />} placeholder="검색"
 *        clearable value={q} onChange={(e) => setQ(e.target.value)} />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, helperText, error, id: providedId, onFocus, onBlur, onChange, value, defaultValue, placeholder, prefix, suffix, clearable, onClear, disabled, readOnly, ...props }, forwardedRef) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const messageId = error || helperText ? `${id}-msg` : undefined;
    const isError = Boolean(error);

    // Track focus + value presence for floating-label behavior.
    // We don't fully control the input — just observe enough to know
    // whether the label should float.
    const localRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(forwardedRef, () => localRef.current as HTMLInputElement);
    // Presence check that distinguishes "no value" from "falsy value".
    // `Boolean(value)` was wrong for numeric inputs: `value={0}` is a
    // perfectly valid amount, but `Boolean(0) === false` would have hidden
    // the floating label and clear button. We treat null/undefined/empty
    // string as absent and EVERYTHING ELSE (including 0, false, …) as
    // present.
    const isPresent = (v: unknown): boolean =>
      v !== null && v !== undefined && String(v).length > 0;

    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      value !== undefined ? isPresent(value) : isPresent(defaultValue)
    );
    // Sync `hasValue` with controlled `value` whenever the parent updates it
    // (form reset, react-hook-form `reset()`, URL state restore, …). Without
    // this, the floating label and clear button stay in their stale state
    // because the initial `useState` lazy-init only ran once at mount.
    useEffect(() => {
      if (value !== undefined) setHasValue(isPresent(value));
    }, [value]);
    const labelFloating = focused || hasValue;
    const showClear = clearable && hasValue && !disabled && !readOnly;

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };
    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      onChange?.(e);
    };

    const handleClear = () => {
      const el = localRef.current;
      if (!el) return;
      // Use the native setter so React picks up the value via its
      // input-event simulation (controlled inputs work this way).
      const proto = window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      setter?.call(el, '');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      setHasValue(false);
      onClear?.();
      el.focus();
    };

    return (
      <div className={cn('flex flex-col gap-polaris-3xs', containerClassName)}>
        <div className="relative">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'pointer-events-none absolute font-polaris transition-all duration-polaris-fast ease-polaris-out',
                // Adornments shift the label-anchor x to align with the input text.
                prefix ? 'left-12' : 'left-5',
                labelFloating
                  ? 'top-2 text-polaris-helper text-label-assistive'
                  : 'top-1/2 -translate-y-1/2 text-polaris-body2 text-label-assistive'
              )}
            >
              {label}
            </label>
          )}
          {prefix && (
            <span
              aria-hidden={
                // Icons are usually decorative; strings (currency) might be
                // semantically meaningful. Hide from AT only for icon nodes
                // where the input's own label/placeholder carries the
                // meaning. We default to `true`; consumers that need a
                // semantic prefix can wrap in their own `<span>` / `<abbr>`.
                'true'
              }
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 inline-flex items-center text-polaris-body2 text-label-alternative [&>svg]:h-4 [&>svg]:w-4"
            >
              {prefix}
            </span>
          )}
          <input
            id={id}
            ref={localRef}
            aria-invalid={isError || undefined}
            aria-describedby={messageId}
            placeholder={labelFloating || !label ? placeholder : ''}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            readOnly={readOnly}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={cn(
              // 52px height + 20px h-padding + sm radius (8) per spec.
              // pt-5/pb-1 when label is floating reserves space for it.
              'h-[52px] w-full rounded-polaris-sm font-polaris text-polaris-body2',
              label ? 'pt-5 pb-1' : '',
              // Horizontal padding adjusts for prefix/suffix/clear adornments.
              prefix ? 'pl-12' : 'pl-5',
              showClear ? 'pr-11' : suffix ? 'pr-12' : 'pr-5',
              'bg-background-base text-label-normal placeholder:text-label-assistive',
              'border border-line-neutral',
              'transition-colors duration-polaris-fast',
              'focus-visible:outline-none focus-visible:border-accent-brand-normal',
              'disabled:bg-background-disabled disabled:border-line-disabled disabled:text-label-disabled disabled:cursor-not-allowed',
              isError && 'border-state-error focus-visible:border-state-error',
              className
            )}
            {...props}
          />
          {/* Suffix sits to the LEFT of the clear button when both shown. */}
          {suffix && (
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 inline-flex items-center text-polaris-body2 text-label-alternative [&>svg]:h-4 [&>svg]:w-4',
                showClear ? 'right-11' : 'right-5'
              )}
            >
              {suffix}
            </span>
          )}
          {showClear && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="입력 지우기"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-polaris-sm text-label-alternative hover:bg-interaction-hover focus-visible:outline-none focus-visible:shadow-polaris-focus"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {error ? (
          <p
            id={messageId}
            className="flex items-start gap-polaris-3xs text-polaris-helper text-state-error"
            role="alert"
          >
            <ErrorIcon size={16} className="shrink-0 mt-px" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={messageId} className="text-polaris-helper text-label-alternative">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
