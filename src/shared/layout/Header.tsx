import { Bell, LogOut, Moon, Search, Sun } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useThemeStore } from '@/shared/theme/themeStore';
import { routeTitles, type AppRoute } from './navigation';

type HeaderProps = {
  activeRoute: AppRoute;
};

export function Header({ activeRoute }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { theme, toggleTheme } = useThemeStore();
  const page = routeTitles[activeRoute];

  return (
    <header className="xocket-header">
      <div className="xocket-header-content">
        <div className="xocket-header-title-wrapper">
          <div className="xocket-page-title">{page.title}</div>
          <div className="xocket-page-subtitle">{page.subtitle}</div>
        </div>

        <div className="xocket-header-actions">
          <div className="xocket-global-search">
            <Search size={16} />
            <input placeholder="Search account, claim, case, SSN last 4..." />
          </div>

          <button type="button" className="xocket-icon-button" aria-label="Notifications">
            <Bell size={20} />
            <span className="xocket-notification-badge">3</span>
          </button>

          <button type="button" className="xocket-icon-button" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button type="button" className="xocket-user-menu">
            <span className="xocket-user-avatar">{user?.name?.[0] ?? 'U'}</span>
            <span className="xocket-user-info">
              <strong>{user?.name ?? 'User'}</strong>
              <small>{user?.role ?? 'Operator'}</small>
            </span>
          </button>

          <button type="button" className="xocket-icon-button" onClick={signOut} aria-label="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
