import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button, type ButtonProps } from './Button';
import { cn } from '../lib/cn';

/**
 * CopyButton — copies a string to the clipboard with a transient
 * "copied" affordance. Uses {@link Button} under the hood so it
 * inherits all variants/sizes and the system focus ring.
 *
 * Why this exists: every consumer ends up wiring `navigator.clipboard`
 * + a 1.5s success state + ARIA live announcement. We bundle the
 * pattern so it stays consistent across products.
 *
 * Behavior:
 *   - On click: writes `text` to clipboard, swaps the icon to a check,
 *     and announces via `aria-live="polite"` (screen reader hears
 *     "Copied" or your `successLabel`).
 *   - After `resetMs` (default 1500), reverts to the idle state.
 *   - Honors fallback if `navigator.clipboard` is unavailable
 *     (older Safari, insecure contexts) — uses a hidden textarea +
 *     `document.execCommand('copy')`.
 *
 * @example
 * ```tsx
 * <CopyButton text={shareUrl} variant="tertiary" size="sm">
 *   링크 복사
 * </CopyButton>
 * ```
 *
 * @example Custom feedback (toast on copy)
 * ```tsx
 * <CopyButton text={shareUrl} onCopy={() => toast({ title: '복사됨' })}>
 *   링크 복사
 * </CopyButton>
 * ```
 *
 * @example Icon-only
 * ```tsx
 * <CopyButton text={shareUrl} aria-label="공유 URL 복사" iconOnly />
 * ```
 */
export interface CopyButtonProps
  // `onCopy` / `onError` are reserved React DOM event handlers on HTMLElement;
  // omit them so we can re-define their signatures (text-based, not Event-based).
  // `asChild` is omitted because CopyButton always renders BOTH an icon and
  // (optionally) a label as Button children — Radix Slot via `asChild` requires
  // a single React child, so passing it through would break at runtime.
  extends Omit<ButtonProps, 'onClick' | 'children' | 'onCopy' | 'onError' | 'asChild'> {
  /** Text to copy to the clipboard. Required. */
  text: string;
  /** Idle label. Default: "복사" preceded by a copy icon. */
  children?: ReactNode;
  /** Label shown after a successful copy. Default: "복사됨" preceded by a check icon. */
  successLabel?: ReactNode;
  /** Milliseconds before reverting from "copied" → idle. Default: 1500. */
  resetMs?: number;
  /** Render only the icon (square button, no label). `aria-label` becomes mandatory. */
  iconOnly?: boolean;
  /** Fires after a successful copy — typical place to surface a toast. */
  onCopy?: (text: string) => void;
  /** Fires if the clipboard write fails (permission denied, no clipboard API, …). */
  onError?: (err: unknown) => void;
}

/** Best-effort clipboard write: prefers `navigator.clipboard` (HTTPS/localhost),
 *  falls back to a hidden textarea + `execCommand` for older browsers. */
async function writeToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for non-secure contexts. Adapted from clipboard.js pattern.
  if (typeof document === 'undefined') throw new Error('No document available');
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'absolute';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    const ok = document.execCommand('copy');
    if (!ok) throw new Error('execCommand("copy") returned false');
  } finally {
    document.body.removeChild(ta);
  }
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      text,
      children,
      successLabel,
      resetMs = 1500,
      iconOnly,
      onCopy,
      onError,
      className,
      variant = 'tertiary',
      size = 'sm',
      disabled,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const handleClick = async () => {
      if (disabled) return;
      try {
        await writeToClipboard(text);
        setCopied(true);
        onCopy?.(text);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetMs);
      } catch (err) {
        onError?.(err);
      }
    };

    const idleIcon = <Copy className="h-4 w-4" aria-hidden="true" />;
    const doneIcon = <Check className="h-4 w-4" aria-hidden="true" />;
    const idleText = children ?? '복사';
    const doneText = successLabel ?? '복사됨';

    return (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        aria-live="polite"
        disabled={disabled}
        className={cn(iconOnly && 'aspect-square px-0', className)}
        {...props}
      >
        {copied ? doneIcon : idleIcon}
        {!iconOnly && (copied ? doneText : idleText)}
      </Button>
    );
  }
);
CopyButton.displayName = 'CopyButton';
