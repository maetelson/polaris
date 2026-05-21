import { forwardRef } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * Accordion — multi-item disclosure group.
 *
 * `<Disclosure>` covers the *single* show/hide case. `<Accordion>` is for
 * groups of related disclosures where one is open at a time
 * (`type="single"`, FAQ pattern), or any combination
 * (`type="multiple"`, settings groups).
 *
 * The visual matches Disclosure's: full-width row trigger + chevron
 * rotation + label-normal text + hover/focus tokens. Items are
 * separated by a hairline, no per-item card chrome (compose inside a
 * `<Card>` if you need that).
 *
 * Built on Radix Accordion → keyboard nav (Arrow up/down/Home/End),
 * ARIA, controlled/uncontrolled all handled.
 *
 * @example Single — only one open at a time
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="billing">
 *     <AccordionTrigger>결제 관련</AccordionTrigger>
 *     <AccordionContent>...</AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem value="security">
 *     <AccordionTrigger>보안 / 로그인</AccordionTrigger>
 *     <AccordionContent>...</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 *
 * @example Multiple — any combination open
 * ```tsx
 * <Accordion type="multiple" defaultValue={['notifications']}>
 *   <AccordionItem value="notifications">
 *     <AccordionTrigger>알림 설정</AccordionTrigger>
 *     <AccordionContent>...</AccordionContent>
 *   </AccordionItem>
 *   ...
 * </Accordion>
 * ```
 */

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-line-neutral last:border-b-0', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** Hide the chevron icon. Default: false. */
  hideChevron?: boolean;
}

export const AccordionTrigger = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, hideChevron, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-between gap-polaris-2xs',
        'py-polaris-sm px-polaris-2xs font-polaris text-polaris-body1 font-medium text-label-normal text-left',
        'transition-colors hover:text-label-normal',
        'focus-visible:outline-none focus-visible:shadow-polaris-focus rounded-polaris-sm',
        '[&[data-disabled]]:opacity-50 [&[data-disabled]]:pointer-events-none',
        className
      )}
      {...props}
    >
      <span className="flex-1">{children}</span>
      {!hideChevron && (
        <ChevronDown
          className="h-4 w-4 shrink-0 text-label-alternative transition-transform duration-polaris-fast group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-polaris-body2 text-label-neutral',
      // Radix exposes height as a CSS var → animate height changes.
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      className
    )}
    {...props}
  >
    <div className="pb-polaris-sm px-polaris-2xs">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';
