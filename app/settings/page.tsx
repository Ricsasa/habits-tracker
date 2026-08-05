'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Button from '@/components/atoms/Button';
import LanguageToggle from '@/components/molecules/LanguageToggle';
import ThemeToggle from '@/components/molecules/ThemeToggle';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { supabase } from '@/lib/supabase';

const PANEL =
  'border border-border-light bg-surface-secondary p-4 rounded-none dark:border-border-light-dark dark:bg-surface-tertiary-dark';
const LABEL = 'mb-3 text-base font-600 text-content-primary dark:text-content-primary-dark';

export default function SettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-4xl font-700 text-content-primary dark:text-content-primary-dark">
        {t('settings.title')}
      </h1>

      <div className="flex flex-col gap-6 rounded-none">
        <section className={PANEL}>
          <p className={LABEL}>{t('settings.theme')}</p>
          <ThemeToggle />
        </section>

        <section className={PANEL}>
          <p className={LABEL}>{t('settings.language')}</p>
          <LanguageToggle />
        </section>

        <section className={PANEL}>
          <p className="mb-3 text-xs font-600 uppercase text-content-tertiary dark:text-content-tertiary-dark">
            {t('settings.account')}
          </p>
          <p className="text-sm text-content-tertiary dark:text-content-tertiary-dark">
            {t('settings.signedInAs')}
          </p>
          <p className="mb-3 text-base font-600 text-content-primary dark:text-content-primary-dark">
            {email}
          </p>
          <Button variant="destructive" fullWidth onClick={handleSignOut}>
            {t('navigation.signOut')}
          </Button>
        </section>

        <section className={PANEL}>
          <p className="mb-2 text-xs font-600 uppercase text-content-tertiary dark:text-content-tertiary-dark">
            {t('settings.about')}
          </p>
          <p className="text-sm text-content-tertiary dark:text-content-tertiary-dark">
            {t('common.version')}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
