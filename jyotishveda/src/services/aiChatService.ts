import { API_BASE_URL, getToken } from './api';
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
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload: Record<string, any> = {
    prompt,
    history,
  };
  if (userId) payload.user_id = userId;
  if (sessionId) payload.session_id = sessionId;

  const response = await fetch(`${API_BASE_URL}/api${API_ENDPOINTS.AI.GENERATE_RESPONSE}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Failed to generate AI response');
  }

  return data as DirectAIResponse;
}

/**
 * Fetch Chat Query/Response History from MySQL DB
 */
export async function fetchChatHistory(
  userId?: string,
  sessionId?: string,
  limit: number = 50
): Promise<AIHistoryMessage[]> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);
  if (sessionId) params.append('session_id', sessionId);
  params.append('limit', String(limit));

  const response = await fetch(`${API_BASE_URL}/api${API_ENDPOINTS.AI.GET_HISTORY}?${params.toString()}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Failed to fetch chat history');
  }

  return (data.data || []) as AIHistoryMessage[];
}

/**
 * Clear Chat Query/Response History in MySQL DB & in-memory store
 */
export async function clearChatHistory(
  userId?: string,
  sessionId?: string
): Promise<{ deletedCount: number }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload: Record<string, any> = {};
  if (userId) payload.user_id = userId;
  if (sessionId) payload.session_id = sessionId;

  const response = await fetch(`${API_BASE_URL}/api${API_ENDPOINTS.AI.CLEAR_HISTORY}`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Failed to clear chat history');
  }

  return { deletedCount: data.deleted_count || 0 };
}
