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

export async function calculateMatchReportBackend(
  p1: any,
  p2: any,
): Promise<AshtaKootaMilanResult | null> {
  try {
    const res = await api.post<MatchReportFull>(API_ENDPOINTS.MATCHMAKING.REPORTS, {
      partner1: {
        name: p1.fullName || 'Partner 1',
        dob: p1.birthDate || '2000-01-01',
        time: p1.birthTime || '12:00',
        place: p1.birthPlace || 'Delhi, India',
        gender: p1.gender || 'male',
      },
      partner2: {
        name: p2.fullName || 'Partner 2',
        dob: p2.birthDate || '2000-01-01',
        time: p2.birthTime || '12:00',
        place: p2.birthPlace || 'Mumbai, India',
        gender: p2.gender || 'female',
      },
      partner1Name: p1.fullName || 'Partner 1',
      partner1BirthDate: p1.birthDate || '2000-01-01',
      partner1BirthTime: p1.birthTime || '12:00',
      partner1BirthPlace: p1.birthPlace || 'Delhi, India',
      partner2Name: p2.fullName || 'Partner 2',
      partner2BirthDate: p2.birthDate || '2000-01-01',
      partner2BirthTime: p2.birthTime || '12:00',
      partner2BirthPlace: p2.birthPlace || 'Mumbai, India',
    });
    if (res && res.report) {
      return res.report;
    }
  } catch (err) {
    console.warn('Backend API matchmaking calculation call error (using client engine):', err);
  }
  return null;
}

export function getMatchReportPdfUrl(reportId: string): string {
  const token = getToken();
  const base = `${API_ENDPOINTS.MATCHMAKING.REPORTS}/${reportId}/pdf`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

