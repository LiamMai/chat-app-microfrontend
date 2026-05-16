import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { getChatSocket } from '../lib/socket';
import { appendMessageToCache, chatKeys } from '../lib/queries';
import type { ChatMessage } from '../lib/types';
import { useStableState } from './useStableState';

const TYPING_IDLE_MS = 2000; // emit typing_stop after this much keyboard idle
const SERVER_TYPING_TTL_MS = 5000; // backend expires typing entry after 5s; mirror locally

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

interface SocketState {
  socket: Socket | null;
  typingUserData: UserTypingData[];
  unreadCounts: Record<string, number>;
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
) {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomRef = useRef<string | null>(null);

  const [{ socket, typingUserData, unreadCounts }, setState] =
    useStableState<SocketState>({
      socket: null,
      typingUserData: [],
      unreadCounts: {},
    });

  const typingMapRef = useRef<Map<string, number>>(new Map());
  const typingSweepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Local outgoing-typing debounce
  const localTypingActiveRef = useRef(false);
  const localTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleSetTypingUsers = useCallback((evt: UserTypingEvent) => {
    setState((prev) => {
      const updated = new Map(prev.typingUserData.map((u) => [u.userId, u]));
      if (evt.typing && evt.userName) {
        updated.set(evt.userId, { userId: evt.userId, userName: evt.userName });
      } else {
        updated.delete(evt.userId);
      }
      return { typingUserData: Array.from(updated.values()) };
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
          appendMessageToCache(qc, msg);
          // Fallback: invalidate by joined room in case msg.roomId field name
          // doesn't match (server field mismatch makes setQueryData miss silently).
          const activeRoom = joinedRoomRef.current;
          if (activeRoom) {
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
          // Ignore self and other rooms
          if (evt.userId === currentUserId) return;
          if (joinedRoomRef.current !== evt.roomId) return;

          if (evt.typing) {
            typingMapRef.current.set(
              evt.userId,
              Date.now() + SERVER_TYPING_TTL_MS,
            );
          } else {
            typingMapRef.current.delete(evt.userId);
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

        // Re-join the active room on reconnect — server drops room membership on disconnect.
        const onReconnect = () => {
          const room = joinedRoomRef.current;
          if (room) socket.emit('join_room', { roomId: room });
        };

        socket.on('new_message', onNewMessage);
        socket.on('user_typing', onUserTyping);
        socket.on('typing_start', onTypingStart);
        socket.on('typing_stop', onTypingStop);
        socket.on('connect', onReconnect);

        (
          socket as Socket & { __mfeChatCleanup?: () => void }
        ).__mfeChatCleanup = () => {
          socket.off('new_message', onNewMessage);
          socket.off('user_typing', onUserTyping);
          socket.off('typing_start', onTypingStart);
          socket.off('typing_stop', onTypingStop);
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
  }, [qc, currentUserId]);

  // ── Sweep expired typing entries (server TTL = 5s) ─────────────────────────
  useEffect(() => {
    typingSweepRef.current = setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [uid, expiresAt] of typingMapRef.current) {
        if (expiresAt <= now) {
          typingMapRef.current.delete(uid);
          changed = true;
        }
      }
      if (changed) setState((prev) => {
        const updated = new Map(prev.typingUserData.map((u) => [u.userId, u]));
        for (const [uid] of typingMapRef.current) {
          updated.delete(uid);
        }
        return { typingUserData: Array.from(updated.values()) };
      });
    }, 1000);
    return () => {
      if (typingSweepRef.current) clearInterval(typingSweepRef.current);
    };
  }, []);

  // ── Join / leave room as selection changes ────────────────────────────────
  useEffect(() => {
    const sock = socket;
    if (!sock || !activeRoomId) return;

    if (joinedRoomRef.current && joinedRoomRef.current !== activeRoomId) {
      sock.emit('leave_room', { roomId: joinedRoomRef.current });
    }
    sock.emit('join_room', { roomId: activeRoomId });
    joinedRoomRef.current = activeRoomId;

    // Reset typing state and clear unread for the room being entered
    typingMapRef.current.clear();
    setState((prev) => {
      const next: Partial<SocketState> = { typingUserData: [] };
      if (prev.unreadCounts[activeRoomId]) {
        const counts = { ...prev.unreadCounts };
        delete counts[activeRoomId];
        next.unreadCounts = counts;
      }
      return next;
    });

    return () => {
      sock.emit('leave_room', { roomId: activeRoomId });
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
    typingUserData,
    notifyLocalTyping,
    stopLocalTyping,
    unreadCounts,
    clearUnread,
  };
}
