import type { AuthUser, StoredAuthSession } from '../types';

const ACCESS_TOKEN_KEY = 'xocket-access-token';
const REFRESH_TOKEN_KEY = 'xocket-refresh-token';

// Keys used by earlier builds and visible in current browser storage.
const LEGACY_ACCESS_TOKEN_KEY = 'access_token';
const LEGACY_AUTH_SESSION_KEY = 'ops.auth.v1';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeStoredUser(value: unknown): AuthUser | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const roles = Array.isArray(source.roles) ? source.roles.map(String).filter(Boolean) : [];
  const permissions = Array.isArray(source.permissions) ? source.permissions.map(String).filter(Boolean) : [];
  const email = typeof source.email === 'string' ? source.email : '';
  const name =
    (typeof source.name === 'string' && source.name) ||
    (typeof source.displayName === 'string' && source.displayName) ||
    email ||
    'Xocket User';

  return {
    id: String(source.id ?? source.userId ?? source.externalIdentityId ?? email ?? 'current'),
    name,
    email,
    role: String(source.role ?? roles[0] ?? 'Operator'),
    roles,
    permissions
  };
}

export const authTokenStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getAuthSession(): StoredAuthSession | null {
    const stored = safeJsonParse<Record<string, unknown>>(localStorage.getItem(LEGACY_AUTH_SESSION_KEY));
    const accessToken =
      (typeof stored?.accessToken === 'string' && stored.accessToken) ||
      this.getAccessToken();

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken: typeof stored?.refreshToken === 'string' ? stored.refreshToken : this.getRefreshToken() ?? undefined,
      expiresAtUtc: typeof stored?.expiresAtUtc === 'string' ? stored.expiresAtUtc : undefined,
      expiresIn: typeof stored?.expiresIn === 'number' ? stored.expiresIn : undefined,
      user: normalizeStoredUser(stored?.user)
    };
  },

  setAuthSession(session: StoredAuthSession) {
    this.setAccessToken(session.accessToken);

    if (session.refreshToken) {
      this.setRefreshToken(session.refreshToken);
    }

    localStorage.setItem(LEGACY_AUTH_SESSION_KEY, JSON.stringify(session));
  },

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
    localStorage.removeItem(LEGACY_AUTH_SESSION_KEY);
  }
};
