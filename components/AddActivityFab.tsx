'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLanguage';

// Shortcut back to the add-activity home screen. Hidden there, and on auth screens
// (which do not render the shell anyway).
export default function AddActivityFab() {
  const { t } = useLanguage();
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <Link
      href="/"
      aria-label={t('buttons.addActivity')}
      title={t('buttons.addActivity')}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center border border-border-light bg-accent text-3xl font-700 leading-none text-accent-ink transition-shadow duration-200 hover:shadow-[0_2px_8px_var(--card-shadow)] dark:border-border-light-dark lg:bottom-10 lg:right-10"
    >
      <span aria-hidden="true">+</span>
    </Link>
  );
}
