import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';
import { UserProfile } from '../types';

export async function fetchProfiles(): Promise<UserProfile[]> {
  return api.get<UserProfile[]>(API_ENDPOINTS.USER.PROFILES);
}

export async function createProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>): Promise<UserProfile> {
  return api.post<UserProfile>(API_ENDPOINTS.USER.PROFILES, profile);
}

export async function updateProfile(
  id: string,
  profile: Omit<UserProfile, 'id' | 'createdAt'>,
): Promise<UserProfile> {
  return api.put<UserProfile>(`${API_ENDPOINTS.USER.PROFILES}/${id}`, profile);
}

export async function deleteProfile(id: string): Promise<void> {
  await api.delete(`${API_ENDPOINTS.USER.PROFILES}/${id}`);
}
