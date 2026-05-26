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
