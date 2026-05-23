import { createElement, type ButtonHTMLAttributes, type ReactNode } from 'react';

type PolarisButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export function PolarisButton({ type = 'button', children, ...props }: PolarisButtonProps) {
  return createElement('button', { type, ...props }, children);
}
