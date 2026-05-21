import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Polaris-specific font-size utilities. Without this list,
      // tailwind-merge treats `text-polaris-body2` as a color class
      // and silently drops `text-label-inverse` next to it.
      'font-size': [
        {
          text: [
            // v0.7-rc.1 spec names
            'polaris-display',
            'polaris-title',
            'polaris-heading1',
            'polaris-heading2',
            'polaris-heading3',
            'polaris-heading4',
            'polaris-body1',
            'polaris-body2',
            'polaris-body3',
            'polaris-caption1',
            'polaris-caption2',
            // rc.0 deprecated aliases
            'polaris-h1',
            'polaris-h2',
            'polaris-h3',
            'polaris-h4',
            'polaris-h5',
            'polaris-body',
            'polaris-body-sm',
            'polaris-detail',
            'polaris-meta',
            'polaris-tiny',
            // v0.6 deprecated aliases
            'polaris-display-lg',
            'polaris-display-md',
            'polaris-heading-lg',
            'polaris-heading-md',
            'polaris-heading-sm',
            'polaris-body-lg',
            'polaris-caption',
          ],
        },
      ],
      rounded: [
        {
          rounded: [
            'polaris-2xs',
            'polaris-xs',
            'polaris-sm',
            'polaris-md',
            'polaris-lg',
            'polaris-xl',
            'polaris-2xl',
            'polaris-pill',
            // deprecated alias
            'polaris-full',
          ],
        },
      ],
      shadow: [
        {
          shadow: [
            'polaris-xs',
            'polaris-sm',
            'polaris-md',
            'polaris-lg',
            'polaris-ai',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
