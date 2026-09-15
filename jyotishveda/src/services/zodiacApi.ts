import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export const zodiacApi = {
  getAll: async (): Promise<any> => {
    return api.get(API_ENDPOINTS.ZODIAC.ALL);
  },

  getGlobalForecast: async (sign?: string): Promise<any> => {
    return api.post(API_ENDPOINTS.ZODIAC.GLOBAL_FORECAST, { sign });
  },

  getCompatibility: async (sign1: string, sign2: string): Promise<any> => {
    return api.post(API_ENDPOINTS.ZODIAC.COMPATIBILITY, { sign1, sign2 });
  },
};
