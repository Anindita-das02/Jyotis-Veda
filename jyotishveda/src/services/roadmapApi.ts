import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface FilteredPredictionsPayload {
  selectedAspects: string[];
  filterYear: string;
  focusArea: string;
  roadmapData: any;
  userProfile?: any;
}

export interface RoadmapPdfPayload {
  userProfile: any;
  roadmapData: any;
  selectedAspects?: string[];
  filterYear?: string;
  focusArea?: string;
}

export const roadmapApi = {
  getUserRoadmap: async (): Promise<any> => {
    return api.get(API_ENDPOINTS.ROADMAP.GET_USER_ROADMAP);
  },

  getFilteredPredictions: async (payload: FilteredPredictionsPayload): Promise<any> => {
    return api.post(API_ENDPOINTS.ROADMAP.FILTERED_PREDICTIONS, payload);
  },

  downloadRoadmapPdf: async (payload: RoadmapPdfPayload, fileName: string = 'Vedic_Life_Roadmap.pdf'): Promise<void> => {
    return api.downloadFile(API_ENDPOINTS.ROADMAP.DOWNLOAD_PDF, fileName, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
