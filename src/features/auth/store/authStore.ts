import { create } from 'zustand';
import { authTokenStorage } from './authTokenStorage';
import type { AuthUser, StoredAuthSession, TokenResponse } from '../types';

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  completeSignIn: (tokenResponse: TokenResponse) => void;
  updateUser: (user: AuthUser) => void;
  signOut: () => void;
};

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function normalizeUser(rawUser: unknown, fallbackEmail?: string): AuthUser {
  const source = rawUser && typeof rawUser === 'object' ? (rawUser as Record<string, unknown>) : {};
  const roles = asStringArray(source.roles);
  const permissions = asStringArray(source.permissions);
  const email = asString(source.email) ?? fallbackEmail ?? '';
  const name = asString(source.name) ?? asString(source.displayName) ?? email ?? 'Xocket User';

  return {
    id: String(source.id ?? source.userId ?? source.externalIdentityId ?? email ?? 'current'),
    name,
    email,
    role: asString(source.role) ?? roles[0] ?? 'Operator',
    roles,
    permissions
  };
}

function normalizeSession(tokenResponse: TokenResponse): StoredAuthSession {
  return {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    expiresAtUtc: tokenResponse.expiresAtUtc,
    expiresIn: tokenResponse.expiresIn,
    user: normalizeUser(tokenResponse.user)
  };
}

const storedSession = authTokenStorage.getAuthSession();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: Boolean(storedSession?.accessToken),
  user: storedSession?.user ?? null,
  accessToken: storedSession?.accessToken ?? null,

  completeSignIn: (tokenResponse) => {
    const session = normalizeSession(tokenResponse);
    authTokenStorage.setAuthSession(session);

    set({
      isAuthenticated: true,
      accessToken: session.accessToken,
      user: session.user ?? null
    });
  },

  updateUser: (user) => {
    const accessToken = authTokenStorage.getAccessToken();
    if (accessToken) {
      const current = authTokenStorage.getAuthSession();
      authTokenStorage.setAuthSession({
        accessToken,
        refreshToken: current?.refreshToken,
        expiresAtUtc: current?.expiresAtUtc,
        expiresIn: current?.expiresIn,
        user
      });
    }

    set({ user });
  },

  signOut: () => {
    authTokenStorage.clear();
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null
    });
  }
}));
