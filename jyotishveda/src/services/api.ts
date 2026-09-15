export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://72.61.226.68:5001';

const TOKEN_KEY = 'jyotish_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface ApiSuccess<T> {
  status: 'success';
  data?: T;
  [key: string]: any;
}

interface ApiFailure {
  status: 'error';
  message: string;
  error_code?: string;
  [key: string]: any;
}

function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  let cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanBase.endsWith('/api') && cleanPath.startsWith('/api/')) {
    cleanBase = cleanBase.slice(0, -4);
  }
  return `${cleanBase}${cleanPath}`;
}

async function executeFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = buildUrl(path);

  try {
    return await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError(
      'Could not reach the AstroJunction server. Please check if the backend is running.',
      'NETWORK_ERROR',
      0,
    );
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await executeFetch(path, options);

  let body: any;
  try {
    body = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError('Unexpected server response', 'PARSE_ERROR', response.status);
    }
    return {} as T;
  }

  if (!response.ok || (body && (body.status === 'error' || body.success === false))) {
    const failure = body as ApiFailure;
    throw new ApiError(
      failure.message || failure.error || 'Something went wrong',
      failure.error_code || 'UNKNOWN_ERROR',
      response.status,
      body
    );
  }

  // If payload contains wrapped status: 'success' with a 'data' field, return 'data'
  if (body && typeof body === 'object' && body.status === 'success' && 'data' in body) {
    return body.data as T;
  }

  return body as T;
}

async function rawRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await executeFetch(path, options);
  try {
    return await response.json();
  } catch {
    throw new ApiError('Failed to parse server response as JSON', 'PARSE_ERROR', response.status);
  }
}

async function downloadFile(
  path: string,
  fileName: string,
  options: RequestInit = {}
): Promise<void> {
  const response = await executeFetch(path, options);
  if (!response.ok) {
    throw new ApiError('Failed to download file', 'DOWNLOAD_ERROR', response.status);
  }
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),

  raw: <T>(path: string, options?: RequestInit) => rawRequest<T>(path, options),

  downloadFile: (path: string, fileName: string, options?: RequestInit) =>
    downloadFile(path, fileName, options),
};
