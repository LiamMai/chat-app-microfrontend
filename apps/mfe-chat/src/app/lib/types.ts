export enum RoomType {
  DM = 'dm',
  Group = 'group',
}

export interface ChatUser {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string | null;
  avatarUrl?: string | null;
}

export interface ChatRoom {
  _id: string;
  type: RoomType;
  name: string | null;
  members: ChatUser[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  /** Messages in this room not yet read by the current user (server-computed). */
  unreadCount?: number;
}

export type MessageType = 'text' | 'image' | 'file';

export interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  type: MessageType;
  content: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
  email: string;
}

/**
 * One pending incoming friend request. The backend currently returns the
 * relation row; `requester` (and the flat `*Name` fallbacks) are read
 * defensively so the UI shows a real name when the API includes it and a
 * sensible fallback when it doesn't.
 */
export interface IncomingFriendRequest {
  id: string;
  requesterId?: string;
  userId?: string;
  status?: string;
  createdAt?: string;
  requester?: {
    id: string;
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  } | null;
  // flat fallbacks some payload shapes use
  name?: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  error: string | null;
}
