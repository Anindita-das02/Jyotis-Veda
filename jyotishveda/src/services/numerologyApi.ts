import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';
import { NumerologyReport } from '../types';

export interface SavedNumerologyReport {
  id: string;
  profileId: string;
  mulank: number;
  bhagyank: number;
  namankChaldean: number;
  namankPythagorean: number;
  report: NumerologyReport;
  createdAt: string;
}

export async function saveNumerologyReport(
  profileId: string,
  report: NumerologyReport,
): Promise<SavedNumerologyReport> {
  return api.post<SavedNumerologyReport>(API_ENDPOINTS.NUMEROLOGY.REPORTS, { profileId, report });
}

export async function fetchNumerologyReport(profileId: string): Promise<SavedNumerologyReport> {
  return api.get<SavedNumerologyReport>(`${API_ENDPOINTS.NUMEROLOGY.REPORTS}/${profileId}`);
}
