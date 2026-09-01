export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
    CURRENT_USER: '/auth/current-user',
  },
  USER: {
    PROFILES: '/user/profiles',
  },
  INSIGHTS: {
    DAILY_HOROSCOPE: '/daily-insights/horoscope',
    PANCHANG: '/daily-insights/panchang',
  },
  ZODIAC: {
    GLOBAL_FORECAST: '/zodiac/global-forecast',
  },
  BIRTH_CHART: {
    GENERATE: '/birth-chart/generate',
    INTERPRET: '/birth-chart/ai-interpretation',
  },
  NUMEROLOGY: {
    REPORTS: '/numerology/reports',
    AI_INSIGHTS: '/numerology/ai-insights',
  },
  MATCHMAKING: {
    REPORTS: '/matchmaking/reports',
    SYNTHESIS: '/ai-counsellor/matchmaking-synthesis',
  },
  COUNSELLOR: {
    SESSIONS: '/ai-counsellor/sessions',
    DEFAULT_MESSAGES: '/ai-counsellor/sessions/default/messages',
  },
  ROADMAP: {
    GENERATE: '/ai/roadmap'
  },
  CALENDAR: {
    CONVERT: '/calendar/convert',
    MONTH: '/calendar/month',
    FULL_PANJIKA: '/calendar/full-panjika'
  }
};
