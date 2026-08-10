'use client';

import { createContext, useCallback, useMemo, ReactNode } from 'react';
import { Language } from '@/lib/types';
import { useLanguageSetting, useSetLanguage } from '@/lib/db-queries';
import en from '@/lib/translations/en.json';
import es from '@/lib/translations/es.json';

type Dictionary = Record<string, unknown>;
type Vars = Record<string, string | number>;

const DICTIONARIES: Record<Language, Dictionary> = { en, es };

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, vars?: Vars) => string;
  isLoading: boolean;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolvePath(dictionary: Dictionary, key: string): string | null {
  const value = key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object') return (node as Dictionary)[part];
    return undefined;
  }, dictionary);
  return typeof value === 'string' ? value : null;
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (text, [name, value]) => text.split(`{{${name}}}`).join(String(value)),
    template
  );
}

function fromNavigator(): Language {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { data: storedLanguage, isLoading } = useLanguageSetting();
  const { mutateAsync: persistLanguage } = useSetLanguage();
  const language = storedLanguage ?? (isLoading ? 'en' : fromNavigator());

  const setLanguage = useCallback(
    async (next: Language) => {
      await persistLanguage(next);
      window.location.reload();
    },
    [persistLanguage]
  );

  const t = useCallback(
    (key: string, vars?: Vars) => {
      const template = resolvePath(DICTIONARIES[language], key);
      return template === null ? key : interpolate(template, vars);
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t, isLoading }),
    [language, setLanguage, t, isLoading]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
