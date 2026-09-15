import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface PublicChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PublicChatPayload {
  messages: PublicChatMessage[];
  msgCount: number;
  dob?: string | null;
}

export interface PublicChatResponse {
  reply: string;
  msgCount?: number;
  dob?: string | null;
  [key: string]: any;
}

export const landingChatApi = {
  sendPublicMessage: async (payload: PublicChatPayload): Promise<PublicChatResponse> => {
    return api.post<PublicChatResponse>(API_ENDPOINTS.AI.PUBLIC_CHAT, payload);
  },
};
