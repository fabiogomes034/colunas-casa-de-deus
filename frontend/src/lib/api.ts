const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
if (!BASE) {
  console.warn("EXPO_PUBLIC_BACKEND_URL not set");
}
export type Level = "bronze" | "prata" | "ouro" | "outro";
export type MemberStatus = "pendente" | "aguardando_confirmacao" | "confirmado";
export type Member = {
  id: string;
  name: string;
  whatsapp: string;
  level: Level;
  amount: number;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
  payment_informed_at: string | null;
  confirmed_at: string | null;
};
export type PublicConfig = {
  pix_key: string;
  merchant_name: string;
  merchant_city: string;
  church_whatsapp: string;
};
async function req<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, { ...init, headers });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
export const api = {
  getConfig: () => req<PublicConfig>("/config"),
  createMember: (data: { name: string; whatsapp: string; level: Level; amount: number }) =>
    req<Member>("/members", { method: "POST", body: JSON.stringify(data) }),
  markPaid: (id: string) =>
    req<{ ok: boolean; status: MemberStatus }>(`/members/${id}/mark-paid`, { method: "POST" }),
  getMember: (id: string) => req<Member>(`/members/${id}`),
  // NOVO: retorna o histórico de contribuições daquele WhatsApp (mais recente primeiro).
  // Pode chegar com ou sem máscara - o backend limpa antes de consultar.
  getByWhatsapp: (whatsapp: string) => req<Member[]>(`/members/by-whatsapp/${whatsapp}`),
  login: (username: string, password: string) =>
    req<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: (token: string) => req<{ username: string }>("/auth/me", {}, token),
  listMembers: (token: string, filters: { level?: Level; status?: MemberStatus } = {}) => {
    const params = new URLSearchParams();
    if (filters.level) params.set("level", filters.level);
    if (filters.status) params.set("status", filters.status);
    const q = params.toString();
    return req<Member[]>(`/admin/members${q ? `?${q}` : ""}`, {}, token);
  },
  confirmMember: (token: string, id: string) =>
    req<Member>(`/admin/members/${id}/confirm`, { method: "PATCH" }, token),
  resetMember: (token: string, id: string) =>
    req<Member>(`/admin/members/${id}/reset`, { method: "PATCH" }, token),
  clearAllMembers: (token: string) =>
    req<{ ok: boolean; deleted_count: number }>("/admin/members/clear-all", { method: "DELETE" }, token),
  deleteMember: (token: string, id: string) =>
    req<{ ok: boolean }>(`/admin/members/${id}`, { method: "DELETE" }, token),
  stats: (token: string) =>
    req<{ total: number; pendente: number; aguardando_confirmacao: number; confirmado: number }>(
      "/admin/stats",
      {},
      token,
    ),
};
