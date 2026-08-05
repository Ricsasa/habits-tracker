'use client';

import { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { Language } from '@/lib/types';
import { supabase } from '@/lib/supabase';
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

async function fetchStoredLanguage(): Promise<Language | null> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return null;
  const response = await fetch('/api/settings/language', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { language?: Language };
  return body.language ?? null;
}

async function persistLanguage(language: Language): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return;
  await fetch('/api/settings/language', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ language }),
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchStoredLanguage()
      .then((stored) => {
        if (active) setLanguageState(stored ?? fromNavigator());
      })
      .catch(() => {
        if (active) setLanguageState(fromNavigator());
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback(async (next: Language) => {
    await persistLanguage(next);
    window.location.reload();
  }, []);

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
