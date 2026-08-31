import { api, setToken, clearToken } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthUser> {
  const data = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
    email,
    password,
    fullName,
  });
  setToken(data.token);
  return data.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  setToken(data.token);
  return data.user;
}

export function logout(): void {
  clearToken();
}

export async function getCurrentUser(): Promise<AuthUser> {
  return api.get<AuthUser>(API_ENDPOINTS.AUTH.CURRENT_USER);
}
