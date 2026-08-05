'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLanguage';

const LINKS = [
  { href: '/', labelKey: 'navigation.add' },
  { href: '/dashboard', labelKey: 'navigation.dashboard' },
  { href: '/reports', labelKey: 'navigation.reports' },
  { href: '/categories', labelKey: 'navigation.categories' },
  { href: '/settings', labelKey: 'navigation.settings' },
];

const BASE = 'px-3 py-2 text-xs font-600 border rounded-none';
const ACTIVE = 'border-category-study bg-category-study text-white dark:border-category-study-dark dark:bg-category-study-dark';
const IDLE =
  'border-border-light bg-surface-primary text-content-primary dark:border-border-light-dark dark:bg-surface-secondary-dark dark:text-content-primary-dark';

export default function NavBar() {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t('common.appName')}
      className="mb-6 flex gap-2 overflow-x-auto border-b border-border-light pb-4 rounded-none dark:border-border-light-dark"
    >
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${BASE} ${pathname === link.href ? ACTIVE : IDLE} flex-shrink-0`}
        >
          {t(link.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
