import axios from 'axios';

import { authTokenStorage } from '@/features/auth/store/authTokenStorage';
import { toApiError } from './problemDetails';
//https://xocketapiv1-bwcvh5edfvbsetef.centralindia-01.azurewebsites.net/
//https://localhost:7093
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://xocketapiv1-bwcvh5edfvbsetef.centralindia-01.azurewebsites.net',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = authTokenStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const correlationId = crypto.randomUUID();
  config.headers['X-Correlation-Id'] = correlationId;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(toApiError(error));
  }
);
