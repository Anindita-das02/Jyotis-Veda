import { api } from './api';
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
  return api.post<SavedNumerologyReport>('/numerology', { profileId, report });
}

export async function fetchNumerologyReport(profileId: string): Promise<SavedNumerologyReport> {
  return api.get<SavedNumerologyReport>(`/numerology/${profileId}`);
}
