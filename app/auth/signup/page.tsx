'use client';

import AuthForm from '@/components/organisms/AuthForm';

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col items-center justify-center p-5 rounded-none">
      <AuthForm mode="signup" />
    </main>
  );
}
