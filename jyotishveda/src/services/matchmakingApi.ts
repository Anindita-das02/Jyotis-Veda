import { api, getToken } from './api';
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
  return api.post<MatchReportFull>('/matchmaking/reports', {
    partner1Name: result.partner1.fullName,
    partner1BirthDate: result.partner1.birthDate,
    partner2Name: result.partner2.fullName,
    partner2BirthDate: result.partner2.birthDate,
    totalScore: result.totalPoints,
    maxScore: result.maxPoints,
    manglikStatus:
      result.manglik?.partner1.isManglik || result.manglik?.partner2.isManglik
        ? `${result.manglik.partner1.severity} / ${result.manglik.partner2.severity}`
        : 'Non-Manglik',
    report: result,
  });
}

export async function listMatchReports(): Promise<MatchReportSummary[]> {
  return api.get<MatchReportSummary[]>('/matchmaking/reports');
}

export async function fetchMatchReport(id: string): Promise<MatchReportFull> {
  return api.get<MatchReportFull>(`/matchmaking/reports/${id}`);
}

/**
 * Builds a direct-navigable URL for the PDF download endpoint. The PDF
 * route is opened via window.open (a real browser download), which can't
 * carry an Authorization header, so the JWT is passed as a query param
 * and validated server-side the same way.
 */
export function getMatchReportPdfUrl(id: string): string {
  const base: string =
    (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const token = getToken() || '';
  return `${base}/matchmaking/reports/${id}/pdf?token=${encodeURIComponent(token)}`;
}
