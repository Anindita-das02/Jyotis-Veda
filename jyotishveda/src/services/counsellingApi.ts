import { api } from './api';

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
  return api.get<AISession[]>('/counsellor/sessions');
}

export async function createSession(profileId: string, tradition: string, title?: string): Promise<AISession> {
  return api.post<AISession>('/counsellor/sessions', { profileId, tradition, title });
}

export async function renameSession(id: string, title: string): Promise<AISession> {
  return api.put<AISession>(`/counsellor/sessions/${id}`, { title });
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/counsellor/sessions/${id}`);
}

export async function getMessages(sessionId: string): Promise<AIMessage[]> {
  return api.get<AIMessage[]>(`/counsellor/sessions/${sessionId}/messages`);
}

export async function sendMessage(
  sessionId: string,
  message: string,
  chartSummary: string,
  numerologySummary: string,
): Promise<{ message: AIMessage; ragSources: string[] }> {
  return api.post(`/counsellor/sessions/${sessionId}/messages`, {
    message,
    chartSummary,
    numerologySummary,
  });
}
