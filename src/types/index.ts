export type UserStatus = 'online' | 'offline' | 'away' | 'dnd';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: UserStatus;
  lastSeen?: string;
  bio: string;
  encryptionFingerprint: string;
  customNickname?: string;
}

export type MessageType = 'text' | 'image' | 'voice' | 'file' | 'system' | 'call_log';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  type: MessageType;
  content: string;
  timestamp: string;
  status: MessageStatus;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  isPinned?: boolean;
  isStarred?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  audioDuration?: string;
  isSelf?: boolean;
}

export type CallType = 'voice' | 'video';
export type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

export interface CallSession {
  id: string;
  type: CallType;
  state: CallState;
  startTime?: number;
  durationSeconds: number;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeakerOn?: boolean;
  isScreenSharing?: boolean;
}

export type DisappearingTimer = 'off' | '24h' | '7d' | '90d';
export type ThemeAccent = 'purple' | 'cyan' | 'emerald' | 'rose';

export interface PrivacySettings {
  isAppLocked: boolean;
  pinCode: string;
  autoLockMinutes: number;
  disappearingMessagesTimer: DisappearingTimer;
  screenshotAlerts: boolean;
  readReceiptsEnabled: boolean;
  typingIndicatorEnabled: boolean;
  stealthMode: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'message' | 'call' | 'security' | 'system';
}
