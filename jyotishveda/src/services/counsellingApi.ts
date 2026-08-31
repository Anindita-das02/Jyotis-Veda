import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface AISession {
  id: string;
  profileId: string;
  tradition: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export async function listSessions(): Promise<AISession[]> {
  return api.get<AISession[]>(API_ENDPOINTS.COUNSELLOR.SESSIONS);
}

export async function createSession(profileId: string, tradition: string, title?: string): Promise<AISession> {
  return api.post<AISession>(API_ENDPOINTS.COUNSELLOR.SESSIONS, { profileId, tradition, title });
}

export async function renameSession(id: string, title: string): Promise<AISession> {
  return api.put<AISession>(`${API_ENDPOINTS.COUNSELLOR.SESSIONS}/${id}`, { title });
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`${API_ENDPOINTS.COUNSELLOR.SESSIONS}/${id}`);
}

export async function getMessages(sessionId: string): Promise<AIMessage[]> {
  return api.get<AIMessage[]>(`${API_ENDPOINTS.COUNSELLOR.SESSIONS}/${sessionId}/messages`);
}

export async function sendMessage(
  sessionId: string,
  message: string,
  chartSummary: string,
  numerologySummary: string,
): Promise<{ message: AIMessage; ragSources: string[] }> {
  return api.post(`${API_ENDPOINTS.COUNSELLOR.SESSIONS}/${sessionId}/messages`, {
    message,
    chartSummary,
    numerologySummary,
  });
}
