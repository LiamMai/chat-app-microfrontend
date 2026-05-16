export type RoomType = 'dm' | 'group';

export interface ChatRoom {
  _id: string;
  type: RoomType;
  name: string | null;
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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
