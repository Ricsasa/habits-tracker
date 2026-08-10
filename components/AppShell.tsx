'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { sectionForPath } from '@/config/sections';
import AddActivityFab from './AddActivityFab';
import BootstrapGate from './BootstrapGate';
import NavBar from './NavBar';

export interface AppShellProps {
  children: ReactNode;
}

/**
 * Owns the section colour swap. The active route decides the band and the
 * accent; both are written onto the document root so the full-bleed background
 * (including overscroll) and every piece of chrome pick them up with zero
 * conditional class logic.
 */
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const section = sectionForPath(pathname);
    const dark = resolvedTheme === 'dark';
    const root = document.documentElement;

    root.style.setProperty('--band', dark ? section.bandDark : section.band);
    root.style.setProperty('--section-accent', dark ? section.accentDark : section.accent);
  }, [pathname, resolvedTheme]);

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-[390px] px-5 pb-28 pt-16 lg:max-w-[1024px] lg:px-16 lg:pb-32 lg:pt-24">
      <BootstrapGate>
        <NavBar />
        {children}
        <AddActivityFab />
      </BootstrapGate>
    </main>
  );
}
