import { api } from './axios';
import type { ApiResponse, Role, User } from '../types';

export const usersApi = {
  list: async () =>
    (await api.get<ApiResponse<{ users: User[] }>>('/users')).data,

  updateRole: async (id: string, role: Role) =>
    (await api.patch<ApiResponse<{ user: User }>>(`/users/${id}/role`, { role })).data,

  remove: async (id: string) =>
    (await api.delete<ApiResponse<null>>(`/users/${id}`)).data,

  updateProfile: async (name: string) =>
    (await api.patch<ApiResponse<{ user: User }>>('/users/me', { name })).data
};
