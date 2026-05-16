import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** Shell BFF base — Angular MFE calls shell-relative paths so cookies attach. */
const API_BASE = '/api';

export const SHELL_API_PATHS = {
  CONTACTS: `${API_BASE}/contacts`,
  CONTACT_REQUESTS: `${API_BASE}/contacts/requests`,
  CONTACT_SEARCH: `${API_BASE}/contacts/search`,
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

@Injectable({ providedIn: 'root' })
export class ContactsApi {
  private readonly http = inject(HttpClient);

  list(): Promise<Contact[]> {
    return firstValueFrom(this.http.get<Contact[]>(SHELL_API_PATHS.CONTACTS));
  }

  listRequests(): Promise<ContactRequest[]> {
    return firstValueFrom(
      this.http.get<ContactRequest[]>(SHELL_API_PATHS.CONTACT_REQUESTS),
    );
  }

  search(query: string): Promise<Contact[]> {
    return firstValueFrom(
      this.http.get<Contact[]>(SHELL_API_PATHS.CONTACT_SEARCH, {
        params: { q: query },
      }),
    );
  }

  sendRequest(toUserId: string): Promise<ContactRequest> {
    return firstValueFrom(
      this.http.post<ContactRequest>(SHELL_API_PATHS.CONTACT_REQUESTS, {
        toUserId,
      }),
    );
  }

  acceptRequest(requestId: string): Promise<ContactRequest> {
    return firstValueFrom(
      this.http.post<ContactRequest>(
        `${SHELL_API_PATHS.CONTACT_REQUESTS}/${requestId}/accept`,
        {},
      ),
    );
  }

  rejectRequest(requestId: string): Promise<ContactRequest> {
    return firstValueFrom(
      this.http.post<ContactRequest>(
        `${SHELL_API_PATHS.CONTACT_REQUESTS}/${requestId}/reject`,
        {},
      ),
    );
  }
}
