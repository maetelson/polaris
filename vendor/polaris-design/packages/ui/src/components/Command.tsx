/**
 * @experimental — API may change in v0.5 based on feedback.
 *
 * Command palette built on `cmdk`. Use `CommandDialog` for the standard Ctrl+K
 * pattern, or compose primitives directly for inline command lists.
 *
 * Pattern (Ctrl+K palette):
 * ```tsx
 * const [open, setOpen] = useState(false);
 * useEffect(() => {
 *   const onKey = (e: KeyboardEvent) => {
 *     if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen((o) => !o); }
 *   };
 *   document.addEventListener('keydown', onKey);
 *   return () => document.removeEventListener('keydown', onKey);
 * }, []);
 *
 * <CommandDialog open={open} onOpenChange={setOpen}>
 *   <CommandInput placeholder="명령 또는 페이지 검색" />
 *   <CommandList>
 *     <CommandEmpty>결과 없음</CommandEmpty>
 *     <CommandGroup heading="자주 쓰는 페이지">
 *       <CommandItem onSelect={() => navigate('/dashboard')}>대시보드</CommandItem>
 *       <CommandItem onSelect={() => navigate('/contracts')}>계약 목록</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </CommandDialog>
 * ```
 */
import { forwardRef } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from '../icons';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../lib/cn';

export const Command = forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-polaris-md bg-surface-popover text-label-normal font-polaris',
      className
    )}
    {...props}
  />
));
Command.displayName = 'Command';

export type CommandDialogProps = DialogPrimitive.DialogProps;

/**
 * Modal dialog wrapping a `<Command>`. Standard Ctrl+K palette UX.
 *
 * Compose the input / list / groups inside as children:
 * ```tsx
 * <CommandDialog open={open} onOpenChange={setOpen}>
 *   <CommandInput placeholder="검색" />
 *   <CommandList>
 *     <CommandEmpty>결과 없음</CommandEmpty>
 *     <CommandGroup heading="페이지">
 *       <CommandItem onSelect={...}>대시보드</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </CommandDialog>
 * ```
 */
export const CommandDialog = ({
  children,
  ...props
}: CommandDialogProps) => (
  <DialogPrimitive.Root {...props}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
          'data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-150'
        )}
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-[20%] z-50 -translate-x-1/2',
          'w-[calc(100vw-2rem)] max-w-lg overflow-hidden',
          'bg-surface-modal border border-line-neutral rounded-polaris-xl shadow-polaris-lg',
          'focus:outline-none'
        )}
      >
        <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
        <Command>{children ?? null}</Command>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export const CommandInput = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-line-neutral px-3" cmdk-input-wrapper="">
    <SearchIcon size={16} className="mr-2 shrink-0 text-label-alternative" aria-hidden="true" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full bg-transparent py-3 text-polaris-body2 outline-none',
        'placeholder:text-label-alternative disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = 'CommandInput';

export const CommandList = forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-80 overflow-y-auto overflow-x-hidden p-1', className)}
    {...props}
  />
));
CommandList.displayName = 'CommandList';

export const CommandEmpty = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('py-6 text-center text-polaris-body2 text-label-alternative', className)}
    {...props}
  />
));
CommandEmpty.displayName = 'CommandEmpty';

export const CommandGroup = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden text-label-normal',
      '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-polaris-caption1 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-label-alternative',
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = 'CommandGroup';

export const CommandSeparator = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-line-neutral', className)}
    {...props}
  />
));
CommandSeparator.displayName = 'CommandSeparator';

export const CommandItem = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-polaris-sm px-2.5 py-1.5 text-polaris-body2 outline-none',
      'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      'data-[selected=true]:bg-accent-brand-normal-subtle data-[selected=true]:text-accent-brand-normal',
      className
    )}
    {...props}
  />
));
CommandItem.displayName = 'CommandItem';

export const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'ml-auto text-polaris-caption1 tracking-widest text-label-alternative',
      className
    )}
    {...props}
  />
);
CommandShortcut.displayName = 'CommandShortcut';
