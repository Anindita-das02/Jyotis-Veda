import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface DashboardStats {
  total_users: number;
  new_users_today: number;
  premium_subscribers: number;
  total_blogs: number;
}

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: number;
  created_at: string;
}

export interface RevenueStats {
  total_revenue: number;
  monthly_revenue: number;
  total_successful: number;
  total_failed: number;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  payment_method: string;
  created_at: string;
  full_name: string;
  email: string;
}

export interface AILog {
  user_id: string;
  tradition: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  module: string;
  created_at: string;
}

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return api.get<DashboardStats>(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
  },

  getAllUsers: async (): Promise<UserData[]> => {
    return api.get<UserData[]>(API_ENDPOINTS.ADMIN.USERS);
  },

  updateUserRole: async (userId: string, role: string): Promise<any> => {
    return api.put(API_ENDPOINTS.ADMIN.USER_ROLE(userId), { role });
  },

  updateUserStatus: async (userId: string, isActive: number): Promise<any> => {
    return api.put(API_ENDPOINTS.ADMIN.USER_STATUS(userId), { is_active: isActive });
  },

  deleteUser: async (userId: string): Promise<any> => {
    return api.delete(API_ENDPOINTS.ADMIN.USER_DELETE(userId));
  },

  getAiLogs: async (): Promise<AILog[]> => {
    return api.get<AILog[]>(API_ENDPOINTS.ADMIN.LOGS_AI);
  },

  getSystemLogs: async (): Promise<SystemLog[]> => {
    return api.get<SystemLog[]>(API_ENDPOINTS.ADMIN.LOGS_SYSTEM);
  },

  getRevenueStats: async (): Promise<RevenueStats> => {
    return api.get<RevenueStats>(API_ENDPOINTS.ADMIN.REVENUE_STATS);
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
    return api.get<Transaction[]>(API_ENDPOINTS.ADMIN.REVENUE_TRANSACTIONS);
  },

  getLLMConfig: async (): Promise<LLMConfig> => {
    return api.get<LLMConfig>(API_ENDPOINTS.ADMIN.LLM_CONFIG);
  },

  updateLLMConfig: async (config: Partial<LLMConfig>): Promise<{ success: boolean; message: string; settings: LLMConfig }> => {
    return api.put(API_ENDPOINTS.ADMIN.LLM_CONFIG, config);
  },

  testLLMConnection: async (provider: string, config?: Partial<LLMConfig>): Promise<LLMTestResult> => {
    return api.post<LLMTestResult>(API_ENDPOINTS.ADMIN.LLM_TEST, { provider, config });
  },

  testAllProviders: async (): Promise<Record<string, LLMTestResult>> => {
    return api.post<Record<string, LLMTestResult>>(API_ENDPOINTS.ADMIN.LLM_TEST, { provider: 'all' });
  },
};

export interface LLMConfig {
  ACTIVE_LLM: 'mistral_local' | 'gemini' | 'mistral_cloud' | 'openai';
  MISTRAL_LOCAL_URL: string;
  MISTRAL_MODEL: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  MISTRAL_CLOUD_URL: string;
  MISTRAL_CLOUD_API_KEY: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
  ENABLE_AUTO_FAILOVER?: string | boolean;
  FALLBACK_LLM?: 'mistral_local' | 'gemini' | 'mistral_cloud' | 'openai';
  LLM_TIMEOUT?: string | number;
  LLM_TEMPERATURE?: string | number;
  LLM_MAX_TOKENS?: string | number;
  is_configured?: {
    mistral_local?: boolean;
    gemini?: boolean;
    mistral_cloud?: boolean;
    openai?: boolean;
  };
  gemini?: { is_configured: boolean; model?: string; masked_key?: string };
  openai?: { is_configured: boolean; model?: string; masked_key?: string };
  mistral_cloud?: { is_configured: boolean; model?: string; masked_key?: string };
  mistral_local?: { url?: string; model?: string };
}

export interface LLMTestResult {
  provider: string;
  status: 'ok' | 'error';
  message: string;
  latency_ms: number;
}
