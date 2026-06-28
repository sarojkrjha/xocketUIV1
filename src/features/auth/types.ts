export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
};

export type TokenRequest = {
  username: string;
  password: string;
};

export type TokenResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresAtUtc?: string;
  expiresIn?: number;
  user?: Record<string, unknown> | AuthUser;
};

export type StoredAuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAtUtc?: string;
  expiresIn?: number;
  user?: AuthUser;
};
