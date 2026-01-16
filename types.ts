
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  friends: string[]; // Array of user IDs
  role: 'user' | 'moderator' | 'admin';
}

export enum RoomType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum EventMode {
  CONFESSION = 'Confession Mode',
  DEBATE = 'Debate Mode',
  CHILL = 'Chill Mode',
  CHAOS = 'Chaos Mode',
  DEFAULT = 'Default',
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  energy: number; // 0-100
  presence: number;
  eventMode: EventMode;
  description: string;
  inviteKey?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  isBoosted: boolean;
  isPinned: boolean;
}

export interface DirectMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface UserPresence {
  status: 'online' | 'offline';
  currentRoomId?: string | null;
  currentRoomName?: string | null;
  activity: 'idle' | 'typing' | 'in-game' | 'drawing';
  lastSeen: number;
  cursorPosition?: { x: number; y: number };
}

export interface Activity {
    id: string;
    text: string;
    timestamp: number;
}

export enum View {
  DASHBOARD,
  ROOM,
  ADMIN,
  WHITEBOARD,
}

export interface WhiteboardPath {
    id: string;
    points: { x: number, y: number }[];
    color: string;
    strokeWidth: number;
}
