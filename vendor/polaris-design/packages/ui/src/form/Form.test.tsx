/**
 * Form smoke tests — verifies the react-hook-form wrappers wire
 * label/control/message together, surface validation errors, and submit.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '../components/Form';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

function EmailForm({ onSubmit }: { onSubmit?: (v: { email: string }) => void }) {
  const form = useForm<{ email: string }>({
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => onSubmit?.(v))}
        // eslint-disable-next-line @polaris/no-direct-font-family
      >
        <FormField
          control={form.control}
          name="email"
          rules={{ required: '이메일을 입력하세요' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>로그인용</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">제출</Button>
      </form>
    </Form>
  );
}

describe('Form (react-hook-form)', () => {
  it('renders label + control + description', () => {
    render(<EmailForm />);
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByText('로그인용')).toBeInTheDocument();
  });

  it('shows validation message on submit when value is missing', async () => {
    render(<EmailForm />);
    await userEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(await screen.findByText('이메일을 입력하세요')).toBeInTheDocument();
  });

  it('submits with the typed value when valid', async () => {
    const onSubmit = vi.fn();
    render(<EmailForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('이메일'), 'me@polaris.io');
    await userEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(onSubmit).toHaveBeenCalledWith({ email: 'me@polaris.io' });
  });
});
