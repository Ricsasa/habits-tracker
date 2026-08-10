'use client';

import { ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useBootstrap } from '@/lib/db-queries';
import LoadingIndicator from './atoms/LoadingIndicator';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useToast } from './ToastProvider';

export interface BootstrapGateProps {
  children: ReactNode;
}

export default function BootstrapGate({ children }: BootstrapGateProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { data: status, isPending, isError } = useBootstrap();

  const endSession = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    router.replace('/auth/login');
  }, [queryClient, router]);

  useEffect(() => {
    if (status === 'unauthenticated') void endSession();
  }, [status, endSession]);

  useEffect(() => {
    if (isError) showToast(t('common.error'), 'error');
  }, [isError, showToast, t]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_OUT' && session) return;
      queryClient.clear();
      router.replace('/auth/login');
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient, router]);

  // The shell already reserves a full viewport with generous chrome padding, so
  // the gate only claims a short band and centres the mark inside it. That keeps
  // the label inside the first screen on mobile instead of below the fold.
  if (isPending || status === 'unauthenticated') {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  return <>{children}</>;
}
