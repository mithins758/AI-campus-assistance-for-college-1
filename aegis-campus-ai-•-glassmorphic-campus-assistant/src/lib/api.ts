// Central API client for the Campus Management backend.
//
// In local dev the frontend origin proxies /api to the backend
// (vite.config.ts proxy, or server.ts BACKEND_URL proxy), so same-origin
// relative URLs work. For a separately-hosted backend, set VITE_API_URL.
const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
}

export interface FacultyLiveStatus {
  faculty_id: string;
  name: string;
  department: string | null;
  status: string;
  location: { code: string; name: string; floor: number } | null;
  updated_at: string;
}

const TOKEN_KEY = 'campus_jwt';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
  department?: string;
}) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function loginUser(input: { email: string; password: string }) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  // Backend shape: { success, data: { token, user } }
  if (data?.data?.token) {
    setToken(data.data.token);
  }
  return data;
}

export async function fetchMe(): Promise<BackendUser> {
  const data = await apiFetch('/api/auth/me');
  return data.data as BackendUser;
}

export function logoutUser() {
  clearToken();
}

// Sends a chat prompt to the backend ({ prompt }) and accepts both the
// real backend shape ({ success, data: { answer } }) and the legacy mock
// shape ({ reply }) so the UI works with or without the backend.
export async function chatWithCampusAI(prompt: string): Promise<string> {
  const data = await apiFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  if (data?.data?.answer) return data.data.answer as string;
  if (data?.reply) return data.reply as string;
  throw new Error('Unexpected chat response from server');
}

export async function fetchFacultyLiveStatus(): Promise<FacultyLiveStatus[]> {
  const data = await apiFetch('/api/faculty/status');
  return (data.data || []) as FacultyLiveStatus[];
}
