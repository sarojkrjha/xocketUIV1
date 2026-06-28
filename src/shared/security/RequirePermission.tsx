import type { ReactNode } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';

type RequirePermissionProps = {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export function RequirePermission({ permission, fallback = null, children }: RequirePermissionProps) {
  const permissions = useAuthStore((state) => state.user?.permissions ?? []);

  if (!permissions.includes(permission)) {
    return fallback;
  }

  return children;
}
