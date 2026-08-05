'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/useLanguage';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

export interface AuthFormProps {
  mode: 'login' | 'signup';
}

async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}

async function signUp(email: string, password: string): Promise<string | null> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return error.message;
  if (!data.session || !data.user) return 'auth.confirmEmail';
  return null;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const failure =
        mode === 'login' ? await signIn(email, password) : await signUp(email, password);
      if (failure) setError(failure.startsWith('auth.') ? t(failure) : failure);
      else router.replace('/');
    } catch {
      setError(t('auth.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[320px] rounded-none">
      <h1 className="mb-2 text-5xl font-700 text-content-primary dark:text-content-primary-dark">
        {isLogin ? t('auth.signIn') : t('auth.signUp')}
      </h1>
      <p className="mb-8 text-base text-content-tertiary dark:text-content-tertiary-dark">
        {isLogin ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
      </p>

      <div className="mb-4 rounded-none">
        <Input
          value={email}
          onChange={setEmail}
          type="email"
          required
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
        />
      </div>

      <div className="mb-6 rounded-none">
        <Input
          value={password}
          onChange={setPassword}
          type="password"
          required
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
        />
      </div>

      {error ? (
        <p role="alert" className="mb-4 border border-red-600 p-3 text-xs text-red-600 rounded-none dark:border-red-500 dark:text-red-500">
          {error}
        </p>
      ) : null}

      <div className="mb-4 rounded-none">
        <Button variant="primary" type="submit" disabled={isSubmitting} fullWidth>
          {isSubmitting ? t('common.loading') : isLogin ? t('auth.signIn') : t('auth.signUp')}
        </Button>
      </div>

      <p className="text-center text-sm text-content-tertiary dark:text-content-tertiary-dark">
        {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
        <Link
          href={isLogin ? '/auth/signup' : '/auth/login'}
          className="text-category-study dark:text-category-study-dark"
        >
          {isLogin ? t('auth.signUpLink') : t('auth.signInLink')}
        </Link>
      </p>
    </form>
  );
}
