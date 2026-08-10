'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SECTIONS } from '@/config/sections';
import { useLanguage } from '@/lib/i18n/useLanguage';

/**
 * Floating right-rail menu.
 *
 * Not a top bar: a solid bar would need an opaque background and would cut the
 * full-bleed section band in half. A right rail never crosses the content
 * column, so the band stays uninterrupted edge to edge.
 *
 * Nothing here names a colour. The active dot and every hover fill read
 * `--header-accent`, which AppShell rewrites when the route changes.
 */
export default function NavBar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Dismiss the mobile panel on Escape (returning focus to the toggle) and on
  // any click outside the menu.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    }

    function onPointerDown(event: MouseEvent) {
      if (headerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      data-menu-open={open}
      className="group/header fixed right-4 top-4 z-50 flex max-h-[calc(100dvh-2rem)] flex-col items-end overflow-y-auto md:right-8 md:top-8 md:max-h-[calc(100dvh-4rem)]"
    >
      {/* Word, not a hamburger: the rest of the system is text and marks.
          Gets a translucent backing on small screens where it can overlap
          content; the whole row is gone at md+, where the nav is always open. */}
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="primary-menu"
        className="highlight bg-white/40 px-3 py-2 text-base uppercase backdrop-blur-sm tracking-[0.05em] text-content-primary dark:bg-black/30 dark:text-content-primary-dark md:hidden"
      >
        {t('navigation.menu')}
      </button>

      <nav
        id="primary-menu"
        aria-label={t('common.appName')}
        className="mt-2 hidden flex-col items-end gap-0.5 bg-white/40 p-2 backdrop-blur-sm group-data-[menu-open=true]/header:flex dark:bg-black/30 md:mt-5 md:flex md:gap-3 md:bg-transparent md:p-0 md:backdrop-blur-none dark:md:bg-transparent"
      >
        {SECTIONS.map((section) => {
          const active = section.href === pathname;
          return (
            <Link
              key={section.href}
              href={section.href}
              onClick={() => setOpen(false)}
              data-active={active}
              aria-current={active ? 'page' : undefined}
              className="group/item flex items-center gap-2 md:gap-3"
            >
              {/* Always in the DOM at opacity-0 so activating never shifts
                  layout: the dot fades in place. Never conditionally render. */}
              <span
                aria-hidden="true"
                className="size-3 shrink-0 bg-accent opacity-0 md:size-4 transition-opacity duration-300 group-data-[active=true]/item:opacity-100"
              />
              <span className="highlight px-3 py-2 text-xl font-400 md:px-4 md:py-1.5 md:text-3xl text-content-secondary group-data-[active=true]/item:font-700 group-data-[active=true]/item:text-content-primary dark:text-content-secondary-dark dark:group-data-[active=true]/item:text-content-primary-dark">
                {t(section.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
