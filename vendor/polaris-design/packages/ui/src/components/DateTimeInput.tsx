import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import { ErrorIcon } from '../icons';
import { cn } from '../lib/cn';

/* ================================================================== *
 * DateTimeInput / TimeInput — native input wrappers           v0.7.5
 * ================================================================== *
 *
 * Why native inputs (not a Popover-based picker like `<DatePicker>`):
 *   - **i18n is hard.** The browser handles locale-specific formatting,
 *     12 vs 24-hour clocks, and time-zone display.
 *   - **Mobile UX is hard.** Native `<input type="datetime-local">` and
 *     `<input type="time">` give us OS-native pickers (date wheels on
 *     iOS, system time pickers on Android) that we'd otherwise have to
 *     re-implement per-platform.
 *   - **Accessibility is hard.** Browsers wire ARIA + keyboard nav to
 *     the native inputs at the platform level — we'd lose that with a
 *     custom Popover-based picker.
 *
 * For richer date-only picking with month grids, use `<DatePicker>`.
 * For "deadline at 17:00 on 2025-11-30" (this component) and "every
 * day at 09:30" (`<TimeInput>`) flows, native is the right tool.
 *
 * Visual pattern matches `<Input>` (52px height, sm radius, floating
 * label, error/helperText slots) so forms read consistently across types.
 */

type SharedProps = {
  /** Floating-style label rendered above the input. */
  label?: ReactNode;
  /** Helper text below the input. */
  helperText?: ReactNode;
  /** Error message — flips border to state-error and renders ⚠ icon below. */
  error?: ReactNode;
  /** Class for the outer container. */
  containerClassName?: string;
};

function fieldClassName(isError: boolean, className: string | undefined) {
  return cn(
    'h-[52px] w-full rounded-polaris-sm font-polaris text-polaris-body2',
    'px-5 bg-background-base text-label-normal',
    'border border-line-neutral',
    'transition-colors duration-polaris-fast',
    'focus-visible:outline-none focus-visible:border-accent-brand-normal',
    'disabled:bg-background-disabled disabled:border-line-disabled disabled:text-label-disabled disabled:cursor-not-allowed',
    // Native picker indicator: tone it down so it matches our muted icon palette.
    '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60',
    isError && 'border-state-error focus-visible:border-state-error',
    className
  );
}

/* ─── DateTimeInput ─────────────────────────────────────────────── */

export interface DateTimeInputProps
  extends SharedProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

/**
 * `<input type="datetime-local">` styled to match the Polaris Input.
 *
 * Value format: `YYYY-MM-DDTHH:MM` (browser-defined; pass directly to /
 * read directly from form state).
 *
 * **Time zones — read this if you're storing dates in UTC.**
 *
 * Native `datetime-local` is **time-zone-naive**: the value the user
 * sees and the value the input emits are *local clock time*. Round-
 * tripping through `Date.prototype.toISOString().slice(0, 16)` will
 * silently shift the displayed time by your UTC offset (e.g. Asia/Seoul
 * 09:00 local becomes `00:00` UTC, then `00:00` shows in the input —
 * looks like a 9-hour bug).
 *
 * Convert at the boundary using a local-aware formatter:
 *
 * ```ts
 * // Date → input value (local clock)
 * function toLocalDatetime(d: Date): string {
 *   const pad = (n: number) => String(n).padStart(2, '0');
 *   return [
 *     d.getFullYear(), '-', pad(d.getMonth() + 1), '-', pad(d.getDate()),
 *     'T', pad(d.getHours()), ':', pad(d.getMinutes()),
 *   ].join('');
 * }
 *
 * // input value → Date (local clock interpreted as the user's TZ)
 * const date = new Date(inputValue); // safe: `new Date("2026-12-31T23:59")` is local
 * ```
 *
 * If your backend stores UTC, do the UTC ↔ local conversion only in
 * your form's `onSubmit` / data-fetch boundary — never in render.
 *
 * @example
 * ```tsx
 * <DateTimeInput
 *   label="만료일"
 *   helperText="브라우저 시간대 기준"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 * ```
 */
export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ label, helperText, error, containerClassName, className, id: providedId, ...props }, forwardedRef) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const messageId = error || helperText ? `${id}-msg` : undefined;
    const isError = Boolean(error);
    const localRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(forwardedRef, () => localRef.current as HTMLInputElement);

    return (
      <div className={cn('flex flex-col gap-polaris-2xs font-polaris', containerClassName)}>
        {label && (
          <label htmlFor={id} className="text-polaris-body3 text-label-neutral">
            {label}
          </label>
        )}
        <input
          ref={localRef}
          id={id}
          type="datetime-local"
          aria-invalid={isError || undefined}
          aria-describedby={messageId}
          className={fieldClassName(isError, className)}
          {...props}
        />
        {error ? (
          <p
            id={messageId}
            role="alert"
            className="flex items-start gap-polaris-3xs text-polaris-helper text-state-error"
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
DateTimeInput.displayName = 'DateTimeInput';

/* ─── TimeInput ─────────────────────────────────────────────────── */

export interface TimeInputProps
  extends SharedProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

/**
 * `<input type="time">` styled to match the Polaris Input.
 *
 * Value format: `HH:MM` (24-hour) — browser may render 12-hour with AM/PM
 * based on user locale, but the value sent on change is always 24-hour.
 *
 * @example
 * ```tsx
 * <TimeInput label="알림 시각" value="09:30" onChange={(e) => setT(e.target.value)} />
 * ```
 */
export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ label, helperText, error, containerClassName, className, id: providedId, ...props }, forwardedRef) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const messageId = error || helperText ? `${id}-msg` : undefined;
    const isError = Boolean(error);
    const localRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(forwardedRef, () => localRef.current as HTMLInputElement);

    return (
      <div className={cn('flex flex-col gap-polaris-2xs font-polaris', containerClassName)}>
        {label && (
          <label htmlFor={id} className="text-polaris-body3 text-label-neutral">
            {label}
          </label>
        )}
        <input
          ref={localRef}
          id={id}
          type="time"
          aria-invalid={isError || undefined}
          aria-describedby={messageId}
          className={fieldClassName(isError, className)}
          {...props}
        />
        {error ? (
          <p
            id={messageId}
            role="alert"
            className="flex items-start gap-polaris-3xs text-polaris-helper text-state-error"
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
TimeInput.displayName = 'TimeInput';
