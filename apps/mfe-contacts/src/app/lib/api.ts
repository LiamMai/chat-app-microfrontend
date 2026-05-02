/** Shell BFF base — Angular MFE calls shell-relative paths so cookies attach. */
const API_BASE = '/api';

export const SHELL_API_PATHS = {
  CONTACTS:           `${API_BASE}/contacts`,
  CONTACT_REQUESTS:   `${API_BASE}/contacts/requests`,
  CONTACT_SEARCH:     `${API_BASE}/contacts/search`,
} as const;

export interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

export interface ContactRequest {
  id: string;
  fromUser: Contact;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const contactsApi = {
  list:         () => request<Contact[]>(SHELL_API_PATHS.CONTACTS),
  listRequests: () => request<ContactRequest[]>(SHELL_API_PATHS.CONTACT_REQUESTS),
  search:       (query: string) =>
    request<Contact[]>(`${SHELL_API_PATHS.CONTACT_SEARCH}?q=${encodeURIComponent(query)}`),

  sendRequest: (toUserId: string) =>
    request<ContactRequest>(SHELL_API_PATHS.CONTACT_REQUESTS, {
      method: 'POST',
      body: JSON.stringify({ toUserId }),
    }),

  acceptRequest: (requestId: string) =>
    request<ContactRequest>(`${SHELL_API_PATHS.CONTACT_REQUESTS}/${requestId}/accept`, {
      method: 'POST',
    }),

  rejectRequest: (requestId: string) =>
    request<ContactRequest>(`${SHELL_API_PATHS.CONTACT_REQUESTS}/${requestId}/reject`, {
      method: 'POST',
    }),
};
