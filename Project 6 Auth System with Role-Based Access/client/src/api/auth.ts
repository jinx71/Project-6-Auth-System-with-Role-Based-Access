import { api } from './axios';
import type { ApiResponse, AuthPayload, User } from '../types';

export const authApi = {
  register: async (body: { email: string; name: string; password: string }) =>
    (await api.post<ApiResponse<AuthPayload>>('/auth/register', body)).data,

  login: async (body: { email: string; password: string }) =>
    (await api.post<ApiResponse<AuthPayload>>('/auth/login', body)).data,

  logout: async () =>
    (await api.post<ApiResponse<null>>('/auth/logout')).data,

  me: async () =>
    (await api.get<ApiResponse<{ user: User }>>('/auth/me')).data,

  googleUrl: () => `${import.meta.env.VITE_API_URL}/api/auth/google`
};
