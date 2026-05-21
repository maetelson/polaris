import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ToastProvider, ToastViewport, TooltipProvider } from '@polaris/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Polaris App',
  description: 'A web service built on the Polaris design system.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Server-rendered theme. Reading the cookie here means `<html data-theme>`
  // is correct on the very first paint — no flash, no hydration mismatch.
  const cookieStore = await cookies();
  const theme = cookieStore.get('polaris-theme')?.value === 'dark' ? 'dark' : 'light';

  return (
    <html lang="ko" data-theme={theme}>
      <head>
        {/* Pretendard via CDN. Replace with next/font/local for production. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>
        <TooltipProvider delayDuration={200}>
          <ToastProvider swipeDirection="right">
            {children}
            <ToastViewport />
          </ToastProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
