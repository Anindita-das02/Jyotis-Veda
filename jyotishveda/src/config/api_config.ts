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
  ADMIN: {
    DASHBOARD_STATS: '/api/admin/dashboard-stats',
    USERS: '/api/admin/users',
    USER_ROLE: (userId: string) => `/api/admin/users/${userId}/role`,
    USER_STATUS: (userId: string) => `/api/admin/users/${userId}/status`,
    USER_DELETE: (userId: string) => `/api/admin/users/${userId}`,
    LOGS_AI: '/api/admin/logs/ai',
    LOGS_SYSTEM: '/api/admin/logs/system',
    REVENUE_STATS: '/api/admin/revenue/stats',
    REVENUE_TRANSACTIONS: '/api/admin/revenue/transactions',
  },
  BLOGS: {
    LIST: '/api/blogs',
    DETAIL: (id: string | number) => `/api/blogs/${id}`,
    CATEGORIES: '/api/categories',
    CATEGORY_DETAIL: (id: number) => `/api/categories/${id}`,
    SUBCATEGORIES: '/api/subcategories',
    SUBCATEGORY_DETAIL: (id: number) => `/api/subcategories/${id}`,
  },
  KNOWLEDGE_GRAPH: {
    STATS: '/api/knowledge-graph/stats',
    NODES: '/api/knowledge-graph/nodes',
    NODE_DETAIL: (id: string) => `/api/knowledge-graph/nodes/${id}`,
    GENERATE_FROM_LLM: '/api/knowledge/generate-from-llm',
  },
  INSIGHTS: {
    DAILY_HOROSCOPE: '/daily-insights/horoscope',
    PANCHANG: '/daily-insights/panchang',
  },
  ZODIAC: {
    GLOBAL_FORECAST: '/zodiac/global-forecast',
    COMPATIBILITY: '/zodiac/compatibility',
    ALL: '/api/zodiac/all',
  },
  BIRTH_CHART: {
    GENERATE: '/birth-chart/generate',
    INTERPRET: '/birth-chart/ai-interpretation',
  },
  NUMEROLOGY: {
    REPORTS: '/numerology/reports',
    AI_INSIGHTS: '/numerology/ai-insights',
    CALCULATE: '/numerology/calculate',
  },
  MATCHMAKING: {
    REPORTS: '/api/matchmaking/reports',
    CALCULATE: '/api/matchmaking/calculate',
    SYNTHESIS: '/api/matchmaking/synthesis',
    GENERATE_PDF: '/api/matchmaking/generate-pdf',
    AI_SYNTHESIS_PDF: (synthesisId: string) => `/api/matchmaking/ai-synthesis/${synthesisId}/pdf`,
    AI_SYNTHESIS_GENERATE_PDF: '/api/matchmaking/ai-synthesis/generate-pdf',
  },
  COUNSELLOR: {
    SESSIONS: '/ai-counsellor/sessions',
    DEFAULT_MESSAGES: '/ai-counsellor/sessions/default/messages',
    SESSION_MESSAGES: (sessionId: string) => `/ai-counsellor/sessions/${sessionId}/messages`,
  },
  ROADMAP: {
    GET_USER_ROADMAP: '/api/roadmap',
    DOWNLOAD_PDF: '/api/roadmap/download-pdf',
    FILTERED_PREDICTIONS: '/api/roadmap/filtered-predictions',
  },
  REPORTS: {
    FULL_REPORT_DATA: '/api/reports/full-report-data',
  },
  CALENDAR: {
    CONVERT: '/calendar/convert',
    MONTH: '/calendar/month',
    FULL_PANJIKA: '/calendar/full-panjika',
  },
  AI: {
    GENERATE_RESPONSE: '/api/ai/response_generate',
    GET_HISTORY: '/api/ai/history',
    CLEAR_HISTORY: '/api/ai/history',
    PUBLIC_CHAT: '/api/public-chat',
  },
};
