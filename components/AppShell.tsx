'use client';

import { ReactNode } from 'react';
import AddActivityFab from './AddActivityFab';
import BootstrapGate from './BootstrapGate';
import NavBar from './NavBar';

export interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] p-5 pb-28 rounded-none lg:max-w-[1024px] lg:p-10 lg:pb-32">
      <BootstrapGate>
        <NavBar />
        {children}
        <AddActivityFab />
      </BootstrapGate>
    </main>
  );
}
