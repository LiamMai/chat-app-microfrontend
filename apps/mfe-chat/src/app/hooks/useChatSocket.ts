import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { getChatSocket } from '../lib/socket';
import { appendMessageToCache, chatKeys } from '../lib/queries';
import type { ChatMessage } from '../lib/types';
import { useStableState } from './useStableState';

const TYPING_IDLE_MS = 2000; // emit typing_stop after this much keyboard idle
const SERVER_TYPING_TTL_MS = 5000; // backend expires typing entry after 5s; mirror locally
const HEARTBEAT_MS = 20000; // < server PRESENCE_TTL (30s) so our own presence never expires

interface UserTypingEvent {
  userId: string;
  roomId: string;
  typing: boolean;
  userName?: string; // optional, for richer UI display; may be missing for legacy events
}

interface UserTypingData {
  userId: string;
  userName: string;
}

interface LegacyTypingEvent {
  userId?: string;
  roomId?: string;
}

interface PresenceEvent {
  userId: string;
}

interface SocketState {
  socket: Socket | null;
  typingPerRoom: Record<string, UserTypingData[]>;
  unreadCounts: Record<string, number>;
  /** userIds currently online — keyed for O(1) lookup. */
  onlineUserIds: Record<string, true>;
}

function emitTypingState(socket: Socket, roomId: string, typing: boolean) {
  socket.emit('user_typing', { roomId, typing });
  socket.emit(typing ? 'typing_start' : 'typing_stop', { roomId });
}

function normalizeTypingEvent(
  event: LegacyTypingEvent | undefined,
  typing: boolean,
): UserTypingEvent | null {
  if (!event?.userId || !event.roomId) return null;
  return {
    userId: event.userId,
    roomId: event.roomId,
    typing,
  };
}

/**
 * Connects to the chat namespace, joins the active room, pipes incoming
 * `new_message` events into the React Query cache, and tracks who is
 * currently typing in the active room.
 *
 * Returns:
 *   - sendViaSocket(content): emit a message; falls through to false if socket not ready
 *   - typingUserIds: list of *other* users typing in the active room
 *   - notifyLocalTyping(): call on each input change — debounced typing_start / typing_stop
 *   - stopLocalTyping(): force an immediate typing_stop (e.g. after sending)
 *   - unreadCounts: per-room unread message counts (only increments for non-active rooms)
 *   - clearUnread(roomId): reset unread count for a room
 */
export function useChatSocket(
  activeRoomId: string | null,
  currentUserId: string | null,
  roomIds: string[] = [],
) {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomRef = useRef<string | null>(null);
  // Read inside socket listeners via ref so identity resolving (null → id)
  // doesn't tear down and rebuild the whole socket setup effect.
  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  const [{ socket, typingPerRoom, unreadCounts, onlineUserIds }, setState] =
    useStableState<SocketState>({
      socket: null,
      typingPerRoom: {},
      unreadCounts: {},
      onlineUserIds: {},
    });

  // outer key: roomId, inner key: userId, value: expiry timestamp
  const typingMapRef = useRef<Map<string, Map<string, number>>>(new Map());
  const typingSweepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Local outgoing-typing debounce
  const localTypingActiveRef = useRef(false);
  const localTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleSetTypingUsers = useCallback((evt: UserTypingEvent) => {
    setState((prev) => {
      const roomUsers = new Map(
        (prev.typingPerRoom[evt.roomId] ?? []).map((u) => [u.userId, u]),
      );
      if (evt.typing && evt.userName) {
        roomUsers.set(evt.userId, { userId: evt.userId, userName: evt.userName });
      } else {
        roomUsers.delete(evt.userId);
      }
      return {
        typingPerRoom: {
          ...prev.typingPerRoom,
          [evt.roomId]: Array.from(roomUsers.values()),
        },
      };
    });
  }, [setState]);

  // ── Socket setup + listeners ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    getChatSocket()
      .then((socket) => {
        if (cancelled) return;
        socketRef.current = socket;
        setState({ socket });

        const onNewMessage = (msg: ChatMessage) => {
          const activeRoom = joinedRoomRef.current;
          if (msg.roomId) {
            // Optimistic insert — no refetch needed for the message list.
            appendMessageToCache(qc, msg);
          } else if (activeRoom) {
            // Fallback only when msg.roomId is missing/renamed (server field
            // mismatch makes setQueryData miss silently) — then refetch.
            qc.invalidateQueries({ queryKey: chatKeys.messages(activeRoom) });
          }
          qc.invalidateQueries({ queryKey: chatKeys.rooms });
          if (msg.roomId !== joinedRoomRef.current) {
            setState((prev) => ({
              unreadCounts: {
                ...prev.unreadCounts,
                [msg.roomId]: (prev.unreadCounts[msg.roomId] ?? 0) + 1,
              },
            }));
          }
        };

        const onUserTyping = (evt: UserTypingEvent) => {
          if (evt.userId === currentUserIdRef.current) return;

          if (!typingMapRef.current.has(evt.roomId)) {
            typingMapRef.current.set(evt.roomId, new Map());
          }
          const roomMap = typingMapRef.current.get(evt.roomId)!;
          if (evt.typing) {
            roomMap.set(evt.userId, Date.now() + SERVER_TYPING_TTL_MS);
          } else {
            roomMap.delete(evt.userId);
          }
          handleSetTypingUsers(evt);
        };

        const onTypingStart = (event: LegacyTypingEvent) => {
          const normalized = normalizeTypingEvent(event, true);
          if (normalized) onUserTyping(normalized);
        };

        const onTypingStop = (event: LegacyTypingEvent) => {
          const normalized = normalizeTypingEvent(event, false);
          if (normalized) onUserTyping(normalized);
        };

        const onOnlineSnapshot = (evt: { userIds?: string[] }) => {
          const ids = evt?.userIds ?? [];
          setState((prev) => {
            const next = { ...prev.onlineUserIds };
            for (const id of ids) next[id] = true;
            return { onlineUserIds: next };
          });
        };

        const onUserOnline = (evt: PresenceEvent) => {
          if (!evt?.userId) return;
          setState((prev) =>
            prev.onlineUserIds[evt.userId]
              ? {}
              : { onlineUserIds: { ...prev.onlineUserIds, [evt.userId]: true } },
          );
        };

        const onUserOffline = (evt: PresenceEvent) => {
          if (!evt?.userId) return;
          setState((prev) => {
            if (!prev.onlineUserIds[evt.userId]) return {};
            const next = { ...prev.onlineUserIds };
            delete next[evt.userId];
            return { onlineUserIds: next };
          });
        };

        // Re-join the active room on reconnect — server drops room membership on disconnect.
        const onReconnect = () => {
          const room = joinedRoomRef.current;
          if (room) socket.emit('join_room', { roomId: room });
        };

        socket.on('new_message', onNewMessage);
        socket.on('user_typing', onUserTyping);
        socket.on('typing_start', onTypingStart);
        socket.on('typing_stop', onTypingStop);
        socket.on('online_users', onOnlineSnapshot);
        socket.on('user_online', onUserOnline);
        socket.on('user_offline', onUserOffline);
        socket.on('connect', onReconnect);

        // Keep our own presence alive — server expires it after PRESENCE_TTL.
        socket.emit('heartbeat');
        const heartbeat = setInterval(() => socket.emit('heartbeat'), HEARTBEAT_MS);

        (
          socket as Socket & { __mfeChatCleanup?: () => void }
        ).__mfeChatCleanup = () => {
          clearInterval(heartbeat);
          socket.off('new_message', onNewMessage);
          socket.off('user_typing', onUserTyping);
          socket.off('typing_start', onTypingStart);
          socket.off('typing_stop', onTypingStop);
          socket.off('online_users', onOnlineSnapshot);
          socket.off('user_online', onUserOnline);
          socket.off('user_offline', onUserOffline);
          socket.off('connect', onReconnect);
        };
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error('Failed to connect chat socket', error);
        }
      });

    return () => {
      cancelled = true;
      const sock = socketRef.current as
        | (Socket & { __mfeChatCleanup?: () => void })
        | null;
      sock?.__mfeChatCleanup?.();
      setState({ socket: null });
    };
  }, [qc]);

  // ── Sweep expired typing entries (server TTL = 5s) ─────────────────────────
  useEffect(() => {
    typingSweepRef.current = setInterval(() => {
      const now = Date.now();
      const expiredByRoom: Record<string, string[]> = {};

      for (const [roomId, roomMap] of typingMapRef.current) {
        for (const [uid, expiresAt] of roomMap) {
          if (expiresAt <= now) {
            roomMap.delete(uid);
            (expiredByRoom[roomId] ??= []).push(uid);
          }
        }
      }

      if (Object.keys(expiredByRoom).length > 0) {
        setState((prev) => {
          const updated = { ...prev.typingPerRoom };
          for (const [roomId, expiredIds] of Object.entries(expiredByRoom)) {
            updated[roomId] = (updated[roomId] ?? []).filter(
              (u) => !expiredIds.includes(u.userId),
            );
          }
          return { typingPerRoom: updated };
        });
      }
    }, 1000);
    return () => {
      if (typingSweepRef.current) clearInterval(typingSweepRef.current);
    };
  }, []);

  // ── Join all rooms so typing events arrive regardless of active room ─────
  const roomIdsKey = roomIds.join(',');
  useEffect(() => {
    const sock = socket;
    if (!sock || roomIds.length === 0) return;
    roomIds.forEach((id) => sock.emit('join_room', { roomId: id }));
    return () => {
      roomIds.forEach((id) => sock.emit('leave_room', { roomId: id }));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomIdsKey]);

  // ── Track active room + clear unread when entering ────────────────────────
  useEffect(() => {
    const sock = socket;
    if (!sock || !activeRoomId) return;

    joinedRoomRef.current = activeRoomId;

    setState((prev) => {
      if (!prev.unreadCounts[activeRoomId]) return {};
      const counts = { ...prev.unreadCounts };
      delete counts[activeRoomId];
      return { unreadCounts: counts };
    });

    return () => {
      // Force-clear our outgoing typing state on the way out
      if (localTypingActiveRef.current) {
        emitTypingState(sock, activeRoomId, false);
        localTypingActiveRef.current = false;
      }
      if (localTypingTimerRef.current) {
        clearTimeout(localTypingTimerRef.current);
        localTypingTimerRef.current = null;
      }
      if (joinedRoomRef.current === activeRoomId) joinedRoomRef.current = null;
    };
  }, [activeRoomId, socket]);

  // ── Outgoing typing ───────────────────────────────────────────────────────
  const notifyLocalTyping = useCallback(() => {
    const sock = socketRef.current;
    if (!sock || !activeRoomId) return;

    if (!localTypingActiveRef.current) {
      emitTypingState(sock, activeRoomId, true);
      localTypingActiveRef.current = true;
    }

    if (localTypingTimerRef.current) clearTimeout(localTypingTimerRef.current);
    localTypingTimerRef.current = setTimeout(() => {
      emitTypingState(sock, activeRoomId, false);
      localTypingActiveRef.current = false;
      localTypingTimerRef.current = null;
    }, TYPING_IDLE_MS);
  }, [activeRoomId]);

  const stopLocalTyping = useCallback(() => {
    const sock = socketRef.current;
    if (!sock || !activeRoomId) return;
    if (localTypingTimerRef.current) {
      clearTimeout(localTypingTimerRef.current);
      localTypingTimerRef.current = null;
    }
    if (localTypingActiveRef.current) {
      emitTypingState(sock, activeRoomId, false);
      localTypingActiveRef.current = false;
    }
  }, [activeRoomId]);

  const clearUnread = useCallback((roomId: string) => {
    setState((prev) => {
      if (!prev.unreadCounts[roomId]) return {};
      const counts = { ...prev.unreadCounts };
      delete counts[roomId];
      return { unreadCounts: counts };
    });
  }, [setState]);

  const sendViaSocket = useCallback(
    (content: string) => {
      const sock = socketRef.current;
      if (!sock || !sock.connected || !activeRoomId) return false;
      const roomId = activeRoomId;
      sock.emit('send_message', { roomId, content });
      // Server may broadcast new_message only to other members (not back to sender).
      // Invalidate so the sender's own message appears without waiting for a refetch trigger.
      qc.invalidateQueries({ queryKey: chatKeys.messages(roomId) });
      qc.invalidateQueries({ queryKey: chatKeys.rooms });
      return true;
    },
    [activeRoomId, qc],
  );

  return {
    sendViaSocket,
    typingPerRoom,
    notifyLocalTyping,
    stopLocalTyping,
    unreadCounts,
    clearUnread,
    onlineUserIds,
  };
}
