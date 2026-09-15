import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface AIHistoryMessage {
  id: string;
  user_id: string;
  session_id?: string;
  user_query: string;
  response: string;
  created_at: string;
}

export interface DirectAIResponse {
  status: 'success' | 'error';
  user_id?: string;
  session_id?: string;
  user_query?: string;
  response: string[] | string;
  suggested_questions: string[];
  message?: string;
}

/**
 * Generate Direct AI Response with Dynamic Suggested Questions & Auto DB persistence
 */
export async function generateAIResponse(
  prompt: string,
  history: { role: string; content: string }[] = [],
  userId?: string,
  sessionId?: string
): Promise<DirectAIResponse> {
  const payload: Record<string, any> = {
    prompt,
    history,
  };
  if (userId) payload.user_id = userId;
  if (sessionId) payload.session_id = sessionId;

  return api.post<DirectAIResponse>(API_ENDPOINTS.AI.GENERATE_RESPONSE, payload);
}

/**
 * Fetch Chat Query/Response History from MySQL DB
 */
export async function fetchChatHistory(
  userId?: string,
  sessionId?: string,
  limit: number = 50
): Promise<AIHistoryMessage[]> {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);
  if (sessionId) params.append('session_id', sessionId);
  params.append('limit', String(limit));

  const data = await api.get<any>(`${API_ENDPOINTS.AI.GET_HISTORY}?${params.toString()}`);
  return Array.isArray(data) ? data : (data?.data || []);
}

/**
 * Clear Chat Query/Response History in MySQL DB & in-memory store
 */
export async function clearChatHistory(
  userId?: string,
  sessionId?: string
): Promise<{ deletedCount: number }> {
  const payload: Record<string, any> = {};
  if (userId) payload.user_id = userId;
  if (sessionId) payload.session_id = sessionId;

  const data = await api.delete<any>(API_ENDPOINTS.AI.CLEAR_HISTORY);
  return { deletedCount: data?.deleted_count || 0 };
}
