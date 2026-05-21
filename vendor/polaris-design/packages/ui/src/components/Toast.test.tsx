import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, ToastViewport, Toaster, toast, dismissToast } from './Toast';

describe('toast() imperative API', () => {
  it('renders a toast with title via toast()', async () => {
    render(
      <ToastProvider>
        <Toaster />
        <ToastViewport />
      </ToastProvider>
    );

    act(() => {
      toast({ title: '저장됨', variant: 'success' });
    });

    expect(await screen.findByText('저장됨')).toBeInTheDocument();
  });

  it('renders description when provided', async () => {
    render(
      <ToastProvider>
        <Toaster />
        <ToastViewport />
      </ToastProvider>
    );

    act(() => {
      toast({ title: '오류', description: '서버 응답 없음', variant: 'danger' });
    });

    expect(await screen.findByText('오류')).toBeInTheDocument();
    expect(await screen.findByText('서버 응답 없음')).toBeInTheDocument();
  });

  it('dismissToast(id) is callable without throwing', async () => {
    render(
      <ToastProvider>
        <Toaster />
        <ToastViewport />
      </ToastProvider>
    );

    let id = '';
    act(() => {
      ({ id } = toast({ title: '임시', variant: 'info' }));
    });
    expect(await screen.findByText('임시')).toBeInTheDocument();

    // Smoke-test the imperative dismiss API. The actual visual exit
    // animation is exercised in e2e / visual regression tests.
    expect(() =>
      act(() => {
        dismissToast(id);
      })
    ).not.toThrow();
  });
});
