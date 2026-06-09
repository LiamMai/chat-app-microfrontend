import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from './api';
import type { ChatMessage, ChatRoom, CurrentUser, IncomingFriendRequest } from './types';

export const chatKeys = {
  rooms:           ['chat', 'rooms'] as const,
  messages:        (roomId: string) => ['chat', 'rooms', roomId, 'messages'] as const,
  currentUser:     ['chat', 'current-user'] as const,
  me:              ['chat', 'me'] as const,
  incomingRequests: ['chat', 'friend-requests', 'incoming'] as const,
} as const;

export function useCurrentUserId() {
  return useQuery<string | null>({
    queryKey: chatKeys.currentUser,
    queryFn: async () => (await chatApi.fetchWsToken()).userId,
    staleTime: 5 * 60_000,
  });
}

export function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: chatKeys.me,
    queryFn: async () => {
      const res = await chatApi.fetchMe();
      return res.user ?? null;
    },
    staleTime: 5 * 60_000,
  });
}

/**
 * Incoming pending friend requests. No socket event exists for these, so we
 * poll on an interval to keep the notification list reasonably fresh.
 */
export function useIncomingRequests() {
  return useQuery<IncomingFriendRequest[]>({
    queryKey: chatKeys.incomingRequests,
    queryFn: async () => (await chatApi.listIncomingRequests()).data ?? [],
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

/** Accept/decline an incoming friend request, refreshing the request list + rooms. */
export function useRespondToFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requesterId, action }: { requesterId: string; action: 'accept' | 'decline' }) =>
      action === 'accept'
        ? chatApi.acceptFriendRequest(requesterId)
        : chatApi.declineFriendRequest(requesterId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.incomingRequests });
      // Accept auto-creates a DM room on the backend — refresh the room list too.
      qc.invalidateQueries({ queryKey: chatKeys.rooms });
    },
  });
}

/**
 * Mark every message in a room as read for the current user. Optimistically
 * zeroes the room's unreadCount in cache, then persists + refetches.
 */
export function useMarkRoomRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => chatApi.markRoomRead(roomId),
    onMutate: async (roomId: string) => {
      await qc.cancelQueries({ queryKey: chatKeys.rooms });
      const prev = qc.getQueryData<ChatRoom[]>(chatKeys.rooms);
      qc.setQueryData<ChatRoom[]>(chatKeys.rooms, (rooms) =>
        rooms?.map((r) => (r._id === roomId ? { ...r, unreadCount: 0 } : r)),
      );
      return { prev };
    },
    onError: (_e, _roomId, ctx) => {
      if (ctx?.prev) qc.setQueryData(chatKeys.rooms, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: chatKeys.rooms }),
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

export interface LastMessageSnapshot {
  content: string;
  senderId: string;
  createdAt: string;
}

/**
 * Reactively tracks the last message per room by subscribing to the query
 * cache. Updates whenever messages are fetched or pushed via socket.
 */
export function useLastMessagePerRoom(): Record<string, LastMessageSnapshot> {
  const qc = useQueryClient();

  const [snapshot, setSnapshot] = useState<Record<string, LastMessageSnapshot>>(() => {
    const init: Record<string, LastMessageSnapshot> = {};
    for (const query of qc.getQueryCache().getAll()) {
      const key = query.queryKey;
      if (
        Array.isArray(key) &&
        key[0] === 'chat' &&
        key[1] === 'rooms' &&
        key[3] === 'messages'
      ) {
        const msgs = query.state.data as ChatMessage[] | undefined;
        const last = msgs?.[msgs.length - 1];
        if (last)
          init[key[2] as string] = {
            content: last.content,
            senderId: last.senderId,
            createdAt: last.createdAt,
          };
      }
    }
    return init;
  });

  useEffect(() => {
    return qc.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated') return;
      const key = event.query.queryKey;
      if (
        Array.isArray(key) &&
        key[0] === 'chat' &&
        key[1] === 'rooms' &&
        key[3] === 'messages'
      ) {
        const roomId = key[2] as string;
        const msgs = event.query.state.data as ChatMessage[] | undefined;
        const last = msgs?.[msgs.length - 1];
        if (last) {
          setSnapshot((prev) => ({
            ...prev,
            [roomId]: { content: last.content, senderId: last.senderId, createdAt: last.createdAt },
          }));
        }
      }
    });
  }, [qc]);

  return snapshot;
}

/** Inserts a new message into the cache for a given room (called by socket listener) */
export function appendMessageToCache(qc: ReturnType<typeof useQueryClient>, msg: ChatMessage) {
  qc.setQueryData<ChatMessage[]>(chatKeys.messages(msg.roomId), (prev) => {
    if (!prev) return [msg];
    if (prev.some((m) => m._id === msg._id)) return prev;
    return [...prev, msg];
  });
}
