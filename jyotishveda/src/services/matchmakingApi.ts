import { api, getToken } from './api';
import { API_ENDPOINTS } from '../config/api_config';
import { AshtaKootaMilanResult } from '../types';

export interface MatchReportSummary {
  id: string;
  partner1Name: string;
  partner1BirthDate: string;
  partner2Name: string;
  partner2BirthDate: string;
  totalScore: number;
  maxScore: number;
  manglikStatus: string | null;
  createdAt: string;
}

export interface MatchReportFull extends MatchReportSummary {
  report: AshtaKootaMilanResult;
}

export async function saveMatchReport(
  result: AshtaKootaMilanResult,
): Promise<MatchReportFull> {
  const p1Name = result.partner1?.fullName || 'Partner 1';
  const p1Dob = result.partner1?.birthDate || '2000-01-01';
  const p2Name = result.partner2?.fullName || 'Partner 2';
  const p2Dob = result.partner2?.birthDate || '2000-01-01';

  return api.post<MatchReportFull>(API_ENDPOINTS.MATCHMAKING.REPORTS, {
    partner1Name: p1Name,
    partner1BirthDate: p1Dob,
    partner2Name: p2Name,
    partner2BirthDate: p2Dob,
    totalScore: result.totalPoints ?? 0,
    maxScore: result.maxPoints ?? 36,
    manglikStatus:
      result.manglik?.partner1?.isManglik || result.manglik?.partner2?.isManglik
        ? `${result.manglik?.partner1?.severity || 'Manglik'} / ${result.manglik?.partner2?.severity || 'Manglik'}`
        : 'Non-Manglik',
    report: result,
  });
}

export async function listMatchReports(): Promise<MatchReportSummary[]> {
  return api.get<MatchReportSummary[]>(API_ENDPOINTS.MATCHMAKING.REPORTS);
}

export async function fetchMatchReport(id: string): Promise<MatchReportFull> {
  return api.get<MatchReportFull>(`${API_ENDPOINTS.MATCHMAKING.REPORTS}/${id}`);
}

/**
 * Builds a direct-navigable URL for the PDF download endpoint. The PDF
 * route is opened via window.open (a real browser download), which can't
 * carry an Authorization header, so the JWT is passed as a query param
 * and validated server-side the same way.
 */
export function getMatchReportPdfUrl(id: string): string {
  const base: string =
    (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5001';
  const token = getToken() || '';
  return `${base}${API_ENDPOINTS.MATCHMAKING.REPORTS}/${id}/pdf?token=${encodeURIComponent(token)}`;
}
