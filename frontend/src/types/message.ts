// types/message.ts

export interface User {
  id: string;
  username: string;
  email: string;
  avatarId?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Message {
  id: string;
  content?: string;
  type: MessageType;
  status: MessageStatus;
  attachmentUrl?: string;
  callDuration?: number;
  createdAt: string;
  senderId: string;
  sender: User;
  conversationId: string;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  createdAt: string;
  lastMessageAt?: string;
  lastMessage?: Message;
  participants: User[];
  messages: Message[];
}

export enum MessageStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  SEEN = "SEEN",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  CALL = "CALL",
}
