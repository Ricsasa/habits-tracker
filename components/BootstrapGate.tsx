'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useToast } from './ToastProvider';

export interface BootstrapGateProps {
  children: ReactNode;
}

export default function BootstrapGate({ children }: BootstrapGateProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [isReady, setIsReady] = useState(false);

  const endSession = useCallback(async () => {
    setIsReady(false);
    await supabase.auth.signOut();
    router.replace('/auth/login');
  }, [router]);

  useEffect(() => {
    let isActive = true;

    async function verifyAndBootstrap() {
      const { data, error } = await supabase.auth.getUser();
      if (!isActive) return;
      if (error || !data.user) {
        await endSession();
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!isActive) return;
      if (!token) {
        await endSession();
        return;
      }

      try {
        const response = await fetch('/api/bootstrap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (!isActive) return;
        if (response.status === 401) {
          await endSession();
          return;
        }
        if (!response.ok) showToast(t('common.error'), 'error');
      } catch {
        if (!isActive) return;
        showToast(t('common.error'), 'error');
      }

      setIsReady(true);
    }

    void verifyAndBootstrap();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsReady(false);
        router.replace('/auth/login');
      }
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, [endSession, router, showToast, t]);

  if (!isReady) {
    return (
      <p className="text-base text-content-tertiary dark:text-content-tertiary-dark">
        {t('common.loading')}
      </p>
    );
  }

  return <>{children}</>;
}
