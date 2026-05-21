import { forwardRef, useState, useId } from 'react';
import { Sparkles } from 'lucide-react';
import { SendIcon } from '../icons';
import { cn } from '../lib/cn';

export interface NovaInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSubmit'> {
  /** Called when the user presses Enter or clicks the send button. Empty values are ignored. */
  onSubmit?: (value: string) => void;
  /** Show the sparkle icon at the start of the input row. Defaults true. */
  showIcon?: boolean;
  /** Class applied to the outer composer container (border / bg / padding / shadow). */
  containerClassName?: string;
  /** Accessible label for the send button. */
  sendLabel?: string;
  /**
   * Optional model selector or status pill rendered in the bottom-left.
   * Pass a `<span>` or component — e.g. `<span>✦ Polaris GPT-4</span>`.
   * If omitted, the bottom row collapses and the send button sits flush right.
   */
  modelPill?: React.ReactNode;
}

/**
 * NovaInput — Polaris's AI prompt composer.
 *
 * v1 spec (2026.05): two-row composer with the input on top and an
 * optional model pill + send button on the bottom row. Container uses
 * `rounded-polaris-lg` (12px), 1px `ai.pressed` border (light purple),
 * 14px padding, and `shadow-polaris-ai` (purple glow). Send button is
 * a 32x32 pill in `ai.normal` (AI Purple).
 *
 * v0.6's pill-shaped single-row layout is replaced — that look is now
 * reserved for chat reply boxes, not prompt composers.
 */
export const NovaInput = forwardRef<HTMLInputElement, NovaInputProps>(
  (
    {
      className,
      containerClassName,
      onSubmit,
      onKeyDown,
      onChange,
      value: controlledValue,
      defaultValue,
      placeholder = '무엇이든 물어보세요.',
      showIcon = true,
      sendLabel = 'Send',
      modelPill,
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const isControlled = controlledValue !== undefined;
    const [innerValue, setInnerValue] = useState(defaultValue?.toString() ?? '');
    const value = isControlled ? (controlledValue as string) : innerValue;

    const submit = () => {
      if (disabled) return;
      const v = (value ?? '').trim();
      if (!v) return;
      onSubmit?.(v);
      if (!isControlled) setInnerValue('');
    };

    return (
      <div
        className={cn(
          'flex flex-col gap-3 rounded-polaris-lg bg-background-base',
          'border border-ai-pressed',
          'p-3.5',
          'shadow-polaris-ai',
          'focus-within:border-ai-normal',
          disabled && 'opacity-60',
          containerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {showIcon && (
            <Sparkles
              className="h-5 w-5 text-ai-normal shrink-0"
              aria-hidden="true"
            />
          )}
          <input
            id={id}
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => {
              if (!isControlled) setInnerValue(e.target.value);
              onChange?.(e);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
              onKeyDown?.(e);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'flex-1 bg-transparent border-none outline-none text-polaris-body2 font-polaris text-label-normal placeholder:text-label-alternative min-w-0',
              className
            )}
            {...props}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="min-w-0">{modelPill}</div>
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value?.trim()}
            aria-label={sendLabel}
            className={cn(
              'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-polaris-pill',
              'bg-ai-normal text-label-inverse',
              'hover:bg-ai-strong',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ai-normal',
              'transition-colors'
            )}
          >
            <SendIcon size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }
);
NovaInput.displayName = 'NovaInput';
