import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from './api';
import type { ChatMessage, ChatRoom } from './types';

export const chatKeys = {
  rooms:        ['chat', 'rooms'] as const,
  messages:     (roomId: string) => ['chat', 'rooms', roomId, 'messages'] as const,
  currentUser:  ['chat', 'current-user'] as const,
} as const;

export function useCurrentUserId() {
  return useQuery<string | null>({
    queryKey: chatKeys.currentUser,
    queryFn: async () => (await chatApi.fetchWsToken()).userId,
    staleTime: 5 * 60_000,
  });
}

export function useRoomsQuery() {
  return useQuery<ChatRoom[]>({
    queryKey: chatKeys.rooms,
    queryFn: async () => (await chatApi.listRooms()).data,
  });
}

export function useMessagesQuery(roomId: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: roomId ? chatKeys.messages(roomId) : ['chat', 'rooms', '__none__', 'messages'],
    queryFn: async () => (await chatApi.getMessages(roomId!)).data.slice().reverse(),
    enabled: !!roomId,
  });
}

export function useSendMessageMutation(roomId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => {
      if (!roomId) throw new Error('No room selected');
      return chatApi.sendMessage(roomId, content);
    },
    onSuccess: () => {
      if (roomId) qc.invalidateQueries({ queryKey: chatKeys.messages(roomId) });
    },
  });
}

/** Inserts a new message into the cache for a given room (called by socket listener) */
export function appendMessageToCache(qc: ReturnType<typeof useQueryClient>, msg: ChatMessage) {
  qc.setQueryData<ChatMessage[]>(chatKeys.messages(msg.roomId), (prev) => {
    if (!prev) return [msg];
    if (prev.some((m) => m._id === msg._id)) return prev;
    return [...prev, msg];
  });
}
