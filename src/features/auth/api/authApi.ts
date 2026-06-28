import { apiClient } from '@/shared/api/apiClient';
import type { AuthUser, TokenRequest, TokenResponse } from '../types';

export async function requestToken(request: TokenRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/api/v1/auth/token', request);
  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>('/api/v1/auth/me');
  return response.data;
}
