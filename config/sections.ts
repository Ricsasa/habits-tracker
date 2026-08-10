/**
 * Single source of truth for the section colour system.
 *
 * Every route owns a band/accent pair. The band tints the whole page background,
 * the accent is reserved for marks only (active dot, hover fill, title rule).
 * Chrome never names a colour: it reads `--header-accent`, which the shell
 * rewrites whenever the route changes.
 *
 * Hues sit at equal perceived lightness so the app reads as one paper stock in
 * five inks, and the order is a warm -> cool -> warm arc.
 */
export interface Section {
  href: string;
  labelKey: string;
  /** Full-bleed page background. */
  band: string;
  /** Saturated sibling, marks only. */
  accent: string;
  /** Dark-theme counterparts. */
  bandDark: string;
  accentDark: string;
}

export const SECTIONS: readonly Section[] = [
  {
    href: '/',
    labelKey: 'navigation.add',
    band: '#FFF6B3',
    accent: '#FFD84D',
    bandDark: '#24220F',
    accentDark: '#F2C94C',
  },
  {
    href: '/dashboard',
    labelKey: 'navigation.dashboard',
    band: '#CFF8D8',
    accent: '#6EE7A8',
    bandDark: '#10231A',
    accentDark: '#4FD08A',
  },
  {
    href: '/reports',
    labelKey: 'navigation.reports',
    band: '#D8F0FF',
    accent: '#74C8FF',
    bandDark: '#101E2A',
    accentDark: '#4FB0F0',
  },
  {
    href: '/categories',
    labelKey: 'navigation.categories',
    band: '#E9DEFF',
    accent: '#B78CFF',
    bandDark: '#1B1630',
    accentDark: '#A17BF0',
  },
  {
    href: '/settings',
    labelKey: 'navigation.settings',
    band: '#FFE0D6',
    accent: '#FF9B7A',
    bandDark: '#2A1A14',
    accentDark: '#F08A66',
  },
] as const;

/** Longest-prefix match, so /activities/123/edit still resolves to a section. */
export function sectionForPath(pathname: string): Section {
  const exact = SECTIONS.find((section) => section.href === pathname);
  if (exact) return exact;

  const nested = SECTIONS.filter(
    (section) => section.href !== '/' && pathname.startsWith(`${section.href}/`)
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return nested ?? SECTIONS[0];
}
