import { useAuthStore } from '@/features/auth/store/authStore';
import { navigationSections, type AppRoute } from './navigation';

type SidebarProps = {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

export function Sidebar({ activeRoute, onNavigate }: SidebarProps) {
  const permissions = useAuthStore((state) => state.user?.permissions ?? []);

  return (
    <aside className="xocket-sidebar">
      <div className="xocket-sidebar-header">
        <div className="xocket-logo-mark">X</div>
        <div>
          <div className="xocket-brand">Xocket</div>
          <div className="xocket-brand-subtitle">Bankruptcy Operations</div>
        </div>
      </div>

      <nav className="xocket-nav" aria-label="Primary navigation">
        {navigationSections.map((section) => (
          <div className="xocket-nav-section" key={section.title}>
            <div className="xocket-nav-title">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.route;

              return (
                <button
                  type="button"
                  className={`xocket-nav-item ${isActive ? 'active' : ''}`}
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  title={permissions.length === 0 ? 'Permission model ready' : item.label}
                >
                  <Icon size={18} className="xocket-nav-icon" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
