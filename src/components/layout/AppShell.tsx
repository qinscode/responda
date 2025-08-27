import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface AppShellProps {
  children: ReactNode;
  onSearchChange?: (query: string) => void;
}

export function AppShell({ children, onSearchChange }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header onSearchChange={onSearchChange} />
      <main className="container mx-auto px-2 py-6 space-y-6 flex-1 max-w-none">
        {children}
      </main>
      <Footer />
    </div>
  );
} 