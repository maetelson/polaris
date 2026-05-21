/**
 * Form components — react-hook-form Controller wrappers with shadcn-style
 * sub-components (FormItem / FormLabel / FormControl / FormDescription /
 * FormMessage). Polaris's sanctioned form pattern.
 *
 * Usage:
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { z } from 'zod';
 * import {
 *   Form, FormField, FormItem, FormLabel, FormControl,
 *   FormDescription, FormMessage, Input, Button,
 * } from '@polaris/ui';
 *
 * const schema = z.object({ email: z.string().email() });
 *
 * function MyForm() {
 *   const form = useForm({ resolver: zodResolver(schema) });
 *   return (
 *     <Form {...form}>
 *       <form onSubmit={form.handleSubmit(onSubmit)}>
 *         <FormField
 *           control={form.control}
 *           name="email"
 *           render={({ field }) => (
 *             <FormItem>
 *               <FormLabel>이메일</FormLabel>
 *               <FormControl>
 *                 <Input {...field} type="email" />
 *               </FormControl>
 *               <FormDescription>로그인에 사용할 이메일</FormDescription>
 *               <FormMessage />
 *             </FormItem>
 *           )}
 *         />
 *         <Button type="submit">제출</Button>
 *       </form>
 *     </Form>
 *   );
 * }
 * ```
 */
import { createContext, forwardRef, useContext, useId, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ErrorIcon } from '../icons';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { cn } from '../lib/cn';

/** Provides the react-hook-form context. Spread the `useForm()` result. */
export const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue);

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: ControllerProps<TFieldValues, TName>
) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

type FormItemContextValue = { id: string };
const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

/**
 * Returns the field state (`name`, `error`, generated ids) for the surrounding
 * `<FormField>` + `<FormItem>`. Used internally by FormLabel/FormControl/
 * FormMessage; rarely needed in user code.
 */
export function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  if (!fieldContext) throw new Error('useFormField must be used inside <FormField>');
  const fieldState = getFieldState(fieldContext.name, formState);
  const id = itemContext?.id;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

export const FormItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = useId();
    const value = useMemo(() => ({ id }), [id]);
    return (
      <FormItemContext.Provider value={value}>
        <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

export const FormLabel = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField();
    return (
      <label
        ref={ref}
        htmlFor={formItemId}
        className={cn(
          'text-polaris-body2 font-medium text-label-normal',
          error && 'text-state-error',
          className
        )}
        {...props}
      />
    );
  }
);
FormLabel.displayName = 'FormLabel';

/**
 * Wraps the actual input element. Forwards generated id + aria attributes via
 * Radix Slot — pair it with `<Input {...field} />` or any controlled input.
 */
export const FormControl = forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return (
      <Slot
        ref={ref}
        id={formItemId}
        aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        {...props}
      />
    );
  }
);
FormControl.displayName = 'FormControl';

export const FormDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();
    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={cn('text-polaris-helper text-label-alternative', className)}
        {...props}
      />
    );
  }
);
FormDescription.displayName = 'FormDescription';

export const FormMessage = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;
    if (!body) return null;
    // 디자인팀 spec (DESIGN.md §4 Inputs & Forms / §10 Color Usage Rules):
    // 에러 메시지는 X / ⚠️ 아이콘 동반 필수 (WCAG 1.4.1 — 색상만으로 정보를
    // 전달하지 않음). 레이아웃: `[icon] message`, 아이콘 16px, 4px gap,
    // 둘 다 --state-error 색.
    //
    // FormMessage는 react-hook-form 흐름이라 *항상 에러 컨텍스트*로 가정.
    // 다른 의미(success/info)로 쓰고 싶으면 별도 prop 추가가 필요(현재는
    // 디자인팀 결정 대기 — `docs/design-team-followup.md` #7 참고).
    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('flex items-start gap-polaris-3xs text-polaris-helper text-state-error', className)}
        role="alert"
        {...props}
      >
        <ErrorIcon size={16} className="shrink-0 mt-px" aria-hidden="true" />
        <span>{body}</span>
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';
