// Cliente da API do backend. Todas as chamadas vão com cookie de sessão (credentials: 'include').

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = Array.isArray(body.message)
        ? body.message.join(', ')
        : (body.message ?? message);
    } catch {
      // resposta sem JSON
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------- Tipos (espelham as respostas do backend) ----------

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

export interface Session {
  user: User;
  is_admin: boolean;
}

export interface LinkSummary {
  id: string;
  destination_url: string;
  created_at: string;
  expires_at: string;
  user_id: string | null;
  total_accesses: number;
}

export interface CountItem {
  value: string;
  count: number;
}

export interface LinkStats {
  link: Omit<LinkSummary, 'total_accesses'>;
  total_accesses: number;
  unique_visitors: number;
  accesses_by_day: { day: string; count: number }[];
  top_referers: CountItem[];
  top_user_agents: CountItem[];
}

export interface AdminOverview {
  users: number;
  links: { total: number; owned: number; anonymous: number };
  accesses: { total: number; on_anonymous_links: number };
  top_links: LinkSummary[];
}

// ---------- Endpoints ----------

export const api = {
  loginWithGoogle: (idToken: string) =>
    request<Session>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    }),
  me: () => request<Session>('/auth/me'),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  createLink: (destinationUrl: string) =>
    request<{ short_url: string }>('/shortner', {
      method: 'POST',
      body: JSON.stringify({ destination_url: destinationUrl }),
    }),
  myLinks: () => request<LinkSummary[]>('/me/links'),
  linkStats: (id: string) => request<LinkStats>(`/links/${id}/stats`),
  adminOverview: () => request<AdminOverview>('/admin/overview'),
};
