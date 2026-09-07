import { api, setToken, clearToken } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  address: string,
): Promise<AuthUser> {
  const data = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
    email,
    password,
    fullName,
    address,
  });
  // Token is only set upon explicit login
  return data.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  setToken(data.token);
  return data.user;
}

export async function loginWithGoogle(
  email: string,
  fullName: string,
  googleId?: string
): Promise<AuthUser> {
  const data = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.GOOGLE, {
    email,
    fullName,
    googleId,
  });
  setToken(data.token);
  return data.user;
}

export function logout(): void {
  clearToken();
}

export async function getCurrentUser(): Promise<AuthUser> {
  return api.get<AuthUser>(API_ENDPOINTS.AUTH.CURRENT_USER);
}
