export type RoomType = 'dm' | 'group';

export interface ChatRoom {
  id: string;
  type: RoomType;
  name: string | null;
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'text' | 'image' | 'file';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  type: MessageType;
  content: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}
