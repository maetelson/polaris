import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './Command';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { cn } from '../lib/cn';

/* ================================================================== *
 * Combobox — searchable Select                                v0.7.7
 * ================================================================== *
 *
 * `<Select>` is fine for ≤ ~15 options; beyond that, type-to-find is
 * much faster. Built on `<Popover>` + `<Command>` (cmdk) so we get
 * keyboard nav (↑/↓, Enter, Esc, Home/End) + filter-as-you-type for free.
 *
 * Single-select is the default; pass `multiple` for tag-chip multi-select.
 *
 * Visual matches `<SelectTrigger>` (h-10, rounded-polaris-md, label
 * tokens) so they're swap-compatible — switching from Select to Combobox
 * doesn't shift the form layout.
 *
 * @example Single
 * ```tsx
 * const [city, setCity] = useState<string>();
 * <Combobox
 *   options={CITIES}
 *   value={city}
 *   onChange={setCity}
 *   placeholder="도시 선택"
 *   searchPlaceholder="도시 이름…"
 * />
 * ```
 *
 * @example Multi-select
 * ```tsx
 * const [tags, setTags] = useState<string[]>([]);
 * <Combobox
 *   multiple
 *   options={TAGS}
 *   value={tags}
 *   onChange={setTags}
 *   placeholder="태그 선택"
 * />
 * ```
 */

export interface ComboboxOption<V extends string = string> {
  value: V;
  label: ReactNode;
  /** Optional description rendered below the label in the popover. */
  description?: ReactNode;
  /** Disable this option (greyed out, not selectable). */
  disabled?: boolean;
  /** Optional group key — options sharing a `group` render under one heading. */
  group?: string;
}

type SingleProps<V extends string> = {
  multiple?: false;
  value?: V | null;
  onChange?: (value: V | null) => void;
};

type MultiProps<V extends string> = {
  multiple: true;
  value?: V[];
  onChange?: (value: V[]) => void;
};

export type ComboboxProps<V extends string = string> = (SingleProps<V> | MultiProps<V>) & {
  options: ReadonlyArray<ComboboxOption<V>>;
  placeholder?: string;
  /** Placeholder shown inside the search input within the popover. */
  searchPlaceholder?: string;
  /** Empty-state text when the filter matches no options. Default: "결과 없음". */
  emptyText?: ReactNode;
  /** Disable the trigger. */
  disabled?: boolean;
  /** Show a clear (×) button when a value is selected. Default: `true`. */
  clearable?: boolean;
  /** className applied to the trigger. */
  className?: string;
  /** Class for the popover content panel. */
  contentClassName?: string;
  /** ARIA label / id for the trigger. */
  id?: string;
  ariaLabel?: string;
};

export function Combobox<V extends string = string>(props: ComboboxProps<V>) {
  const {
    options,
    placeholder = '선택',
    searchPlaceholder = '검색',
    emptyText = '결과 없음',
    disabled,
    clearable = true,
    className,
    contentClassName,
    id: providedId,
    ariaLabel,
  } = props;

  const generatedId = useId();
  const id = providedId ?? generatedId;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();

  // Match popover width to the trigger so options align with the field.
  useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const isMulti = props.multiple === true;
  const value = props.value;

  const selectedSet = new Set(
    isMulti ? (Array.isArray(value) ? value : []) : value ? [value as V] : []
  );

  const isSelected = (v: V) => selectedSet.has(v);

  const toggle = (v: V) => {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
      (props as MultiProps<V>).onChange?.(next);
    } else {
      const next = value === v ? null : v;
      (props as SingleProps<V>).onChange?.(next);
      setOpen(false);
    }
  };

  const clear = () => {
    if (isMulti) (props as MultiProps<V>).onChange?.([]);
    else (props as SingleProps<V>).onChange?.(null);
  };

  // Group options. Ungrouped go under `__null` and render without a heading.
  const groups = new Map<string | null, ComboboxOption<V>[]>();
  for (const opt of options) {
    const key = opt.group ?? null;
    const arr = groups.get(key) ?? [];
    arr.push(opt);
    groups.set(key, arr);
  }

  // Trigger label.
  let triggerLabel: ReactNode;
  if (isMulti) {
    const selectedOpts = options.filter((o) => selectedSet.has(o.value));
    if (selectedOpts.length === 0) {
      triggerLabel = <span className="text-label-alternative">{placeholder}</span>;
    } else if (selectedOpts.length === 1) {
      triggerLabel = selectedOpts[0]!.label;
    } else {
      triggerLabel = `${selectedOpts.length}개 선택됨`;
    }
  } else {
    const selected = options.find((o) => o.value === value);
    triggerLabel = selected
      ? selected.label
      : <span className="text-label-alternative">{placeholder}</span>;
  }

  const showClear = clearable && !disabled && selectedSet.size > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/*
        Wrapper div hosts the trigger button + the clear button as
        SIBLINGS — not as nested interactives. WAI-ARIA forbids putting
        a button inside another button (it confuses screen readers and
        makes either click target ambiguous), and tabIndex={-1} on the
        nested clear meant keyboard users couldn't reach it at all.
        Now both are real `<button>`s in the same row, both tab-focusable,
        each with its own accessible name.
      */}
      <div className="relative w-full">
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn(
              'inline-flex h-10 w-full items-center gap-2 rounded-polaris-md',
              'border border-line-normal bg-background-base py-2',
              'text-polaris-body2 font-polaris text-label-normal whitespace-nowrap',
              'focus-visible:outline-none focus-visible:shadow-polaris-focus focus-visible:border-accent-brand-normal',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Right-padding makes room for the chevron + (optional)
              // sibling clear button outside the trigger.
              'pl-3',
              showClear ? 'pr-16' : 'pr-3',
              className
            )}
          >
            <span className="truncate min-w-0 flex-1 text-left">{triggerLabel}</span>
            <ChevronsUpDown
              className="h-4 w-4 shrink-0 text-label-alternative"
              aria-hidden="true"
          />
          </button>
        </PopoverTrigger>
        {showClear && (
          <button
            type="button"
            onClick={clear}
            aria-label="선택 해제"
            // Sits to the LEFT of the chevron (chevron is inside the
            // trigger; this sits in the right-padding area we reserved
            // when `showClear` is set).
            className="absolute right-9 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-polaris-sm text-label-alternative hover:bg-interaction-hover focus-visible:outline-none focus-visible:shadow-polaris-focus"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
      <PopoverContent
        align="start"
        className={cn('p-0', contentClassName)}
        style={triggerWidth ? { width: triggerWidth } : undefined}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {Array.from(groups.entries()).map(([groupName, groupOpts]) => (
              <CommandGroup
                key={groupName ?? '__none'}
                heading={groupName ?? undefined}
              >
                {groupOpts.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value + ' ' + (typeof opt.label === 'string' ? opt.label : '')}
                    disabled={opt.disabled}
                    onSelect={() => toggle(opt.value)}
                    className={cn(opt.disabled && 'opacity-50 pointer-events-none')}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        isSelected(opt.value) ? 'opacity-100' : 'opacity-0'
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="text-polaris-helper text-label-alternative truncate">
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
Combobox.displayName = 'Combobox';
