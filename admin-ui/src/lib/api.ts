const RAW_API_BASE = process.env.NEXT_PUBLIC_BFF_BASE_URL ?? '';
const API_BASE = RAW_API_BASE.trim().replace(/\/+$/, '');

type JsonValue = Record<string, unknown>;

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  isStaff: boolean;
  isSuperuser: boolean;
};

export type AdminSessionResponse = {
  authenticated: boolean;
  user?: AdminUser;
};

export type AdminListResponse<T> = {
  [key: string]: T[];
};

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.split('=')[1] ?? '');
}

function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return API_BASE ? `${API_BASE}${path}` : path;
}

export async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(buildApiUrl('/api/admin/csrf'), {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { csrfToken?: string };
    return data.csrfToken ?? null;
  } catch {
    return null;
  }
}

async function apiFetch<T = JsonValue>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; errors?: string[] }> {
  const headers = new Headers(options.headers || {});
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (method !== 'GET') {
    const csrfToken = getCookieValue('csrftoken');
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    return {
      ok: false,
      status: 0,
      errors: [
        API_BASE
          ? `Network error: could not reach ${API_BASE}. Check NEXT_PUBLIC_BFF_BASE_URL and ensure the BFF API is running.`
          : "Network error: could not reach /api. Check BFF_BASE_URL rewrite target and ensure the BFF API is running.",
      ],
    };
  }

  let data: T | undefined;
  let errors: string[] | undefined;
  try {
    const body = (await response.json()) as JsonValue;
    if (Array.isArray(body.errors)) {
      errors = body.errors.map(String);
    } else {
      data = body as T;
    }
  } catch {
    // ignore JSON parse errors
  }

  return { ok: response.ok, status: response.status, data, errors };
}

export async function loginAdmin(username: string, password: string) {
  return apiFetch('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logoutAdmin() {
  return apiFetch('/api/admin/logout', { method: 'POST' });
}

export async function fetchSession() {
  return apiFetch<AdminSessionResponse>('/api/admin/session');
}

export async function fetchAdminContent() {
  const [settings, pages, projects, stats, skills, socialLinks, contactLinks] = await Promise.all([
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/site-settings'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/pages'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/projects'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/stats'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/skills'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/social-links'),
    apiFetch<AdminListResponse<JsonValue>>('/api/admin/contact-links'),
  ]);

  return {
    settings,
    pages,
    projects,
    stats,
    skills,
    socialLinks,
    contactLinks,
  };
}

export async function fetchAppointments() {
  return apiFetch<AdminListResponse<JsonValue>>('/api/admin/appointments');
}
