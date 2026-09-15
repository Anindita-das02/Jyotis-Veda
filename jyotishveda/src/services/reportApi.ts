import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export const reportApi = {
  getFullReportData: async (profile: any): Promise<any> => {
    return api.post(API_ENDPOINTS.REPORTS.FULL_REPORT_DATA, { profile });
  },
};
