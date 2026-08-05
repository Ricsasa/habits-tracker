import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import ThemeProvider from '@/components/ThemeProvider';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { ToastProvider } from '@/components/ToastProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Track daily habits and activities',
  applicationName: 'Habit Tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Habits',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface-primary text-content-primary dark:bg-surface-primary-dark dark:text-content-primary-dark">
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>{children}</ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
