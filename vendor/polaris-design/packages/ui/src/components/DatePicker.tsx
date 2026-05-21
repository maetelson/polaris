/**
 * @experimental — API may change in v0.5 based on feedback.
 *
 * DatePicker — Input + Calendar in a Popover. Single-date version.
 * Korean locale by default; format via `date-fns`.
 *
 * For range, see `<DateRangePicker>`.
 */
import { forwardRef, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Calendar } from './Calendar';
import { Button } from './Button';
import { cn } from '../lib/cn';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  /** Display format (date-fns). Default: `yyyy-MM-dd`. */
  formatStr?: string;
  locale?: Locale;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** aria-label for the trigger. */
  ariaLabel?: string;
  /**
   * `name` for form submission — when set, a hidden `<input>` with the
   * date's ISO-YYYY-MM-DD value is rendered alongside the trigger so
   * the field participates in `<form action={...}>` server actions and
   * vanilla form submits. Without this prop, only `onChange` was usable
   * and consumers had to wrap DatePicker in a 50-line ExpiryDateField
   * helper to bridge to react-hook-form / server actions.
   *
   * The hidden input's value uses ISO date format (`2026-12-31`) — pass
   * `valueFormat` to override (e.g. `'yyyyMMdd'`, `'yyyy/MM/dd'`).
   */
  name?: string;
  /** date-fns format for the hidden form-submission input. Default: `yyyy-MM-dd`. */
  valueFormat?: string;
  /**
   * Sets the `required` DOM attribute on the hidden form input.
   *
   * **Caveat — has no effective behavior.** The HTML spec marks
   * `<input type="hidden">` as "barred from constraint validation"
   * (browser doesn't run `:invalid` / form-submit blocking on it),
   * AND `FormData.get('name')` returns the *value* string only, never
   * attribute metadata. So setting `required={true}` here neither
   * blocks submit nor surfaces metadata to a server action — it only
   * round-trips as a DOM attribute that custom client code could
   * `querySelector` for. For real "this date is required" enforcement,
   * validate on the client (zod / react-hook-form) and on the server
   * (Server Action guard / route validator). Kept for API symmetry
   * with native `<input>`; consider migrating callers off this prop.
   */
  required?: boolean;
  /** Form id this hidden input belongs to (rare; only when outside a `<form>` ancestor). */
  form?: string;
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  ({
    value,
    onChange,
    formatStr = 'yyyy-MM-dd',
    locale = ko,
    placeholder = '날짜 선택',
    disabled,
    className,
    ariaLabel = '날짜 선택',
    name,
    valueFormat = 'yyyy-MM-dd',
    required,
    form,
  }, ref) => {
    const [open, setOpen] = useState(false);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="tertiary"
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn('w-full justify-start font-normal', !value && 'text-label-alternative', className)}
          >
            <CalendarIcon className="h-4 w-4" />
            {value ? format(value, formatStr, { locale }) : placeholder}
          </Button>
        </PopoverTrigger>
        {/* Hidden input mirrors the picker value into the form payload.
          * Rendered only when `name` is set to avoid leaking empty fields
          * into form submissions for purely controlled / display-only
          * usages. The input is pure-presentational `hidden` (not just
          * visually hidden) — no aria attributes needed.
          *
          * `disabled` is mirrored so a disabled DatePicker doesn't ship
          * a stale value in submit payloads (HTML spec: disabled
          * controls don't serialize). Without this, server actions saw
          * the last-selected value even after the field was disabled. */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={value ? format(value, valueFormat, { locale }) : ''}
            required={required}
            disabled={disabled}
            form={form}
          />
        )}
        <PopoverContent align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              onChange?.(d);
              if (d) setOpen(false);
            }}
            locale={locale}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DatePicker.displayName = 'DatePicker';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  formatStr?: string;
  locale?: Locale;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(
  ({
    value,
    onChange,
    formatStr = 'yyyy-MM-dd',
    locale = ko,
    placeholder = '기간 선택',
    disabled,
    className,
    ariaLabel = '기간 선택',
  }, ref) => {
    const [open, setOpen] = useState(false);
    const display = value?.from
      ? value.to
        ? `${format(value.from, formatStr, { locale })} ~ ${format(value.to, formatStr, { locale })}`
        : format(value.from, formatStr, { locale })
      : placeholder;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="tertiary"
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn('w-full justify-start font-normal', !value?.from && 'text-label-alternative', className)}
          >
            <CalendarIcon className="h-4 w-4" />
            {display}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            locale={locale}
            numberOfMonths={2}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DateRangePicker.displayName = 'DateRangePicker';
