import type { Conversation, Message } from '../data/mock';
import type { ChatMessage, ChatRoom } from './types';

const AVATAR_COLORS = ['#4d7af6', '#7c3aed', '#059669', '#db2777', '#d97706', '#dc2626', '#0891b2'];

function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed?.length; i++) h = (h * 31 + seed?.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts?.length === 0) return '?';
  if (parts?.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function shortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

export function displayNameForMember(
  room: ChatRoom,
  currentUserId: string | null,
  userId: string,
): string {
  if (room.type === 'dm') {
    const otherMember =
      room.members.find((member) => member !== currentUserId) ??
      room.members[0] ??
      userId;

    if (userId === otherMember) {
      return room.name ?? `User ${shortId(otherMember)}`;
    }
  }

  return `User ${shortId(userId)}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function roomToConversation(
  room: ChatRoom,
  currentUserId: string | null,
  lastMessage?: string,
  unreadCount?: number,
): Conversation {
  const isGroup = room.type === 'group';
  const otherMember = room.members.find((m) => m !== currentUserId) ?? room.members[0] ?? room._id;
  const displayName = room.name ?? (isGroup ? 'Group' : `User ${shortId(otherMember)}`);

  return {
    id: room._id,
    name: displayName,
    avatar: initials(displayName),
    avatarBg: pickColor(room._id),
    lastMessage: lastMessage ?? '',
    time: formatTime(room.updatedAt ?? room.createdAt),
    isGroup,
    isOnline: false,
    unread: unreadCount,
  };
}

export function messageToUiMessage(msg: ChatMessage, currentUserId: string | null): Message {
  return {
    id: msg._id,
    text: msg.content,
    sender: msg.senderId === currentUserId ? 'me' : 'them',
    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
