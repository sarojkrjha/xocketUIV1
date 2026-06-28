import type { AxiosRequestConfig } from 'axios';

import { apiClient } from './apiClient';
import { cleanQueryParams } from './pagination';

export function buildPath(path: string, params?: Record<string, string | number | undefined | null>) {
  if (!params) {
    return path;
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    if (value === undefined || value === null) {
      return result;
    }

    return result.replace(`{${key}}`, encodeURIComponent(String(value)));
  }, path);
}

export async function apiGet<TResponse>(path: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<TResponse> {
  const response = await apiClient.get<TResponse>(path, {
    ...config,
    params: params ? cleanQueryParams(params) : undefined
  });

  return response.data;
}

export async function apiPost<TResponse, TBody = unknown>(path: string, body?: TBody, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<TResponse> {
  const response = await apiClient.post<TResponse>(path, body, {
    ...config,
    params: params ? cleanQueryParams(params) : undefined
  });

  return response.data;
}

export async function apiPut<TResponse, TBody = unknown>(path: string, body?: TBody, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<TResponse> {
  const response = await apiClient.put<TResponse>(path, body, {
    ...config,
    params: params ? cleanQueryParams(params) : undefined
  });

  return response.data;
}

export async function apiDelete<TResponse>(path: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<TResponse> {
  const response = await apiClient.delete<TResponse>(path, {
    ...config,
    params: params ? cleanQueryParams(params) : undefined
  });

  return response.data;
}
