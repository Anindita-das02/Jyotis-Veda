import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface KGraphApiResponse {
  nodes?: any[];
  total_nodes?: number;
  total_relationships?: number;
  categories_count?: Record<string, number>;
  [key: string]: any;
}

export const kgraphApi = {
  getNodes: async (): Promise<KGraphApiResponse> => {
    return api.get<KGraphApiResponse>(API_ENDPOINTS.KNOWLEDGE_GRAPH.NODES);
  },

  getStats: async (): Promise<any> => {
    return api.get<any>(API_ENDPOINTS.KNOWLEDGE_GRAPH.STATS);
  },

  getNode: async (nodeId: string): Promise<any> => {
    return api.get<any>(API_ENDPOINTS.KNOWLEDGE_GRAPH.NODE_DETAIL(nodeId));
  },

  generateFromLlm: async (topics: string[]): Promise<{ message: string; [key: string]: any }> => {
    return api.post(API_ENDPOINTS.KNOWLEDGE_GRAPH.GENERATE_FROM_LLM, { topics });
  },
};
