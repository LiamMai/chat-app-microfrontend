import {
  injectQuery,
  injectMutation,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { contactsApi } from './api';

export const queryKeys = {
  contacts:        ['contacts'] as const,
  contactRequests: ['contacts', 'requests'] as const,
  contactSearch: (query: string) => ['contacts', 'search', query] as const,
} as const;

export function injectContactsQuery() {
  return injectQuery(() => ({
    queryKey: queryKeys.contacts,
    queryFn: () => contactsApi.list(),
  }));
}

export function injectContactRequestsQuery() {
  return injectQuery(() => ({
    queryKey: queryKeys.contactRequests,
    queryFn: () => contactsApi.listRequests(),
  }));
}

export function injectContactSearchQuery(query: () => string) {
  return injectQuery(() => {
    const q = query();
    return {
      queryKey: queryKeys.contactSearch(q),
      queryFn: () => contactsApi.search(q),
      enabled: q.length > 0,
    };
  });
}

export function injectSendRequestMutation() {
  const qc = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (toUserId: string) => contactsApi.sendRequest(toUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contactRequests }),
  }));
}

export function injectAcceptRequestMutation() {
  const qc = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (requestId: string) => contactsApi.acceptRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.contactRequests });
      qc.invalidateQueries({ queryKey: queryKeys.contacts });
    },
  }));
}

export function injectRejectRequestMutation() {
  const qc = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (requestId: string) => contactsApi.rejectRequest(requestId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contactRequests }),
  }));
}
