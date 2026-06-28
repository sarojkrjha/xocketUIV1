import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { AppRoute } from './navigation';

type AppShellProps = {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  children: ReactNode;
};

export function AppShell({ activeRoute, onNavigate, children }: AppShellProps) {
  return (
    <div className="xocket-layout">
      <Sidebar activeRoute={activeRoute} onNavigate={onNavigate} />
      <main className="xocket-main">
        <Header activeRoute={activeRoute} />
        <section className="xocket-content">{children}</section>
      </main>
    </div>
  );
}
