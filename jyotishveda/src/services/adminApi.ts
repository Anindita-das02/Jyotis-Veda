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
};
