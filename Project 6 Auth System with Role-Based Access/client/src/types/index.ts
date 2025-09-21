export type Role = 'ADMIN' | 'USER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  hasPassword?: boolean;
  provider?: 'google' | 'password';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
}
