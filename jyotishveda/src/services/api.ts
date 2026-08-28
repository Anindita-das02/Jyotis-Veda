const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5001/api';

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
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

interface ApiSuccess<T> {
  status: 'success';
  data: T;
}

interface ApiFailure {
  status: 'error';
  message: string;
  error_code: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (networkErr) {
    throw new ApiError(
      'Could not reach the JyotishVeda server. Is the backend running?',
      'NETWORK_ERROR',
      0,
    );
  }

  let body: ApiSuccess<T> | ApiFailure;
  try {
    body = await response.json();
  } catch {
    throw new ApiError('Unexpected server response', 'PARSE_ERROR', response.status);
  }

  if (!response.ok || body.status === 'error') {
    const failure = body as ApiFailure;
    throw new ApiError(
      failure.message || 'Something went wrong',
      failure.error_code || 'UNKNOWN_ERROR',
      response.status,
    );
  }

  return (body as ApiSuccess<T>).data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
