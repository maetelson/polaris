import { forwardRef, useId, type ReactNode } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { ErrorIcon } from '../icons';
import { cn } from '../lib/cn';

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Visible label rendered to the right of the switch. Wires up htmlFor. */
  label?: ReactNode;
  /** Helper text below the label. */
  helperText?: ReactNode;
  /** Error message — sets `aria-invalid` and renders the message with the
   *  mandatory ⚠ icon (WCAG 1.4.1 — never communicate state via color alone). */
  error?: ReactNode;
  /** Container class — applied to the wrapper, not the switch itself. */
  containerClassName?: string;
}

/**
 * Switch — toggle for binary settings (notifications, dark mode, etc.).
 *
 * Mirrors `<Checkbox>`'s API surface so forms read consistently — the
 * v0.7.5 review caught Switch missing label/helperText/error while Checkbox
 * had the full set, breaking form layout consistency. Pass `label` to
 * get a clickable label + proper `htmlFor` wiring; `helperText` and `error`
 * follow the same rules as the rest of the form components.
 *
 * For richer composition (sub-rows, descriptions next to the switch),
 * compose manually around the bare `<SwitchPrimitive.Root>`-equivalent
 * by omitting `label`.
 *
 * @example
 * ```tsx
 * <Switch label="이메일 알림" helperText="새 댓글이 달리면 받아봅니다." />
 * <Switch label="공개" error="권한 없음" disabled />
 * ```
 */
export const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, containerClassName, label, helperText, error, id: providedId, ...props }, ref) => {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const messageId = error || helperText ? `${id}-msg` : undefined;
  const isError = Boolean(error);

  const root = (
    <SwitchPrimitive.Root
      ref={ref}
      id={id}
      aria-invalid={isError || undefined}
      aria-describedby={messageId}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-polaris-pill border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:shadow-polaris-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-accent-brand-normal data-[state=unchecked]:bg-line-normal',
        isError && 'data-[state=unchecked]:bg-state-error/40',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-polaris-pill bg-background-base shadow-polaris-sm transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitive.Root>
  );

  // Bare mode (no label/helperText/error) — return the Root only so consumers
  // can compose around it (e.g. inline list of settings rows).
  if (!label && !helperText && !error) return root;

  return (
    <div className={cn('flex flex-col gap-polaris-2xs font-polaris', containerClassName)}>
      <div className="flex items-center gap-polaris-2xs">
        {root}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'cursor-pointer select-none text-polaris-body2',
              isError ? 'text-state-error' : 'text-label-normal',
              props.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
      {error ? (
        <p
          id={messageId}
          role="alert"
          className="flex items-start gap-polaris-3xs text-polaris-helper text-state-error pl-[3.25rem]"
        >
          <ErrorIcon size={16} className="shrink-0 mt-px" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p
          id={messageId}
          className="text-polaris-helper text-label-alternative pl-[3.25rem]"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
Switch.displayName = 'Switch';
