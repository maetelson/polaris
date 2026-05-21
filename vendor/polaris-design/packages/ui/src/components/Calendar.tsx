/**
 * @experimental — API may change in v0.5 based on feedback.
 *
 * Calendar — `react-day-picker` v9 wrapped with Polaris tokens.
 * Korean locale (`ko`) by default.
 *
 * For a popover-driven date input, see `<DatePicker>`.
 */
import { ko } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from '../lib/cn';

export type CalendarProps = DayPickerProps;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ko,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn('p-3 font-polaris text-polaris-body2 text-label-normal', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-3',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-polaris-body2 font-semibold',
        nav: 'flex items-center justify-between absolute inset-x-1 top-1',
        button_previous: cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-polaris-sm text-label-alternative hover:bg-accent-brand-normal-subtle hover:text-label-normal',
          'focus-visible:outline-none focus-visible:shadow-polaris-focus'
        ),
        button_next: cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-polaris-sm text-label-alternative hover:bg-accent-brand-normal-subtle hover:text-label-normal',
          'focus-visible:outline-none focus-visible:shadow-polaris-focus'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-label-alternative w-9 text-polaris-caption1 font-normal',
        week: 'flex w-full mt-1',
        day: 'relative p-0 text-center w-9 h-9',
        day_button: cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-polaris-md text-polaris-body2 font-normal transition-colors',
          'hover:bg-accent-brand-normal-subtle hover:text-accent-brand-normal',
          'focus-visible:outline-none focus-visible:shadow-polaris-focus',
          'aria-selected:opacity-100'
        ),
        selected: '[&>button]:bg-accent-brand-normal [&>button]:text-label-inverse [&>button]:hover:bg-accent-brand-strong [&>button]:hover:text-label-inverse',
        today: '[&>button]:font-semibold [&>button]:text-accent-brand-normal',
        outside: '[&>button]:text-label-alternative [&>button]:opacity-50',
        disabled: '[&>button]:text-label-alternative [&>button]:opacity-50 [&>button]:pointer-events-none',
        range_start: '[&>button]:rounded-r-none',
        range_end: '[&>button]:rounded-l-none',
        range_middle: '[&>button]:rounded-none [&>button]:bg-accent-brand-normal-subtle [&>button]:text-accent-brand-normal',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeftIcon size={16} aria-hidden="true" />
          ) : (
            <ChevronRightIcon size={16} aria-hidden="true" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';
