import { api } from './api';
import { UserProfile } from '../types';

export async function fetchProfiles(): Promise<UserProfile[]> {
  return api.get<UserProfile[]>('/profiles');
}

export async function createProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>): Promise<UserProfile> {
  return api.post<UserProfile>('/profiles', profile);
}

export async function updateProfile(
  id: string,
  profile: Omit<UserProfile, 'id' | 'createdAt'>,
): Promise<UserProfile> {
  return api.put<UserProfile>(`/profiles/${id}`, profile);
}

export async function deleteProfile(id: string): Promise<void> {
  await api.delete(`/profiles/${id}`);
}
