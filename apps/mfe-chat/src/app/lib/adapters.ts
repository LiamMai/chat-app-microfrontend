import type { Conversation, Message } from '../data/mock';
import { RoomType } from './types';
import type { ChatMessage, ChatRoom, ChatUser } from './types';

const AVATAR_COLORS = ['#4d7af6', '#7c3aed', '#059669', '#db2777', '#d97706', '#dc2626', '#0891b2'];

function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < (seed?.length ?? 0); i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function shortId(id: string): string {
  return (id ?? '').replace(/-/g, '').slice(0, 6).toUpperCase() || '?';
}

function memberId(m: ChatUser | string): string {
  if (typeof m === 'string') return m;
  return m.id ?? m._id ?? '';
}

function userDisplayName(user: ChatUser): string {
  if (user.username) return user.username;
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
  if (full) return full;
  return user.email ?? shortId(memberId(user));
}

export function displayNameForMember(
  room: ChatRoom,
  currentUserId: string | null,
  userId: string,
): string {
  const member = (room.members as Array<ChatUser | string>).find((m) => memberId(m) === userId);
  if (member) return userDisplayName(member as ChatUser);
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
  lastActivityIso?: string,
): Conversation {
  const isGroup = room.type === RoomType.Group;
  const otherMember = (room.members as Array<ChatUser | string>).find((m) => memberId(m) !== currentUserId) ?? room.members[0];
  const displayName = isGroup
    ? (room.name ?? 'Group')
    : userDisplayName(otherMember as ChatUser);
  const peerId = isGroup ? undefined : memberId(otherMember) || undefined;

  // Prefer the latest message time; fall back to room activity.
  const timeIso =
    lastActivityIso ?? room.lastMessage?.createdAt ?? room.updatedAt ?? room.createdAt;

  return {
    id: room._id,
    name: displayName,
    avatar: initials(displayName),
    avatarBg: pickColor(room._id),
    lastMessage: lastMessage ?? '',
    time: formatTime(timeIso),
    isGroup,
    isOnline: false,
    peerId,
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
