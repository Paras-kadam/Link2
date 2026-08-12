import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  User,
  Message,
  CallSession,
  PrivacySettings,
  ThemeAccent,
  AppNotification,
  UserStatus,
} from '../types';
import { currentUser as defaultCurrentUser, partnerUser as defaultPartnerUser, initialMessages, initialNotifications } from '../mock/mockData';

interface AppContextType {
  currentUser: User;
  partnerUser: User;
  setPartnerUser: React.Dispatch<React.SetStateAction<User>>;
  messages: Message[];
  sendMessage: (content: string, type?: Message['type'], extra?: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  togglePinMessage: (id: string) => void;
  toggleStarMessage: (id: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  clearChat: () => void;
  partnerStatus: UserStatus;
  setPartnerStatus: (status: UserStatus) => void;
  isPartnerTyping: boolean;
  setIsPartnerTyping: (typing: boolean) => void;
  activeCall: CallSession | null;
  startCall: (type: 'voice' | 'video') => void;
  acceptCall: () => void;
  endCall: () => void;
  toggleMuteCall: () => void;
  toggleVideoCall: () => void;
  simulateIncomingCall: (type: 'voice' | 'video') => void;
  activeDrawer: 'none' | 'media' | 'profile' | 'settings' | 'privacy' | 'search' | 'notifications';
  setActiveDrawer: (drawer: 'none' | 'media' | 'profile' | 'settings' | 'privacy' | 'search' | 'notifications') => void;
  activeLightboxImage: string | null;
  setActiveLightboxImage: (url: string | null) => void;
  privacySettings: PrivacySettings;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  themeAccent: ThemeAccent;
  setThemeAccent: (accent: ThemeAccent) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  activeToast: { title: string; message: string; type: string } | null;
  showToast: (title: string, message: string, type?: string) => void;
  closeToast: () => void;
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
  pinnedMessage: Message | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User>(defaultCurrentUser);
  const [partnerUser, setPartnerUser] = useState<User>(defaultPartnerUser);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [partnerStatus, setPartnerStatus] = useState<UserStatus>('online');
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'media' | 'profile' | 'settings' | 'privacy' | 'search' | 'notifications'>('none');
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    isAppLocked: false,
    pinCode: '1234',
    autoLockMinutes: 0,
    disappearingMessagesTimer: 'off',
    screenshotAlerts: true,
    readReceiptsEnabled: true,
    typingIndicatorEnabled: true,
    stealthMode: false,
  });

  const [themeAccent, setThemeAccent] = useState<ThemeAccent>('purple');
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; type: string } | null>(null);

  // Call timer simulation
  useEffect(() => {
    let interval: any;
    if (activeCall && activeCall.state === 'connected') {
      interval = setInterval(() => {
        setActiveCall((prev) => prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall?.state]);

  const showToast = (title: string, message: string, type: string = 'info') => {
    setActiveToast({ title, message, type });
    setTimeout(() => {
      setActiveToast(null);
    }, 4000);
  };

  const closeToast = () => setActiveToast(null);

  const sendMessage = (content: string, type: Message['type'] = 'text', extra?: Partial<Message>) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      recipientId: partnerUser.id,
      type,
      content,
      timestamp: timeStr,
      status: 'sent',
      isSelf: true,
      replyTo: replyingTo ? { id: replyingTo.id, senderName: replyingTo.senderId === currentUser.id ? 'You' : partnerUser.name, content: replyingTo.content } : undefined,
      ...extra,
    };

    setMessages((prev) => [...prev, newMsg]);
    setReplyingTo(null);

    // Simulate delivery & read
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
    }, 1200);

    setTimeout(() => {
      setMessages((prev) => prev.map((m) => m.id === newMsg.id ? { ...m, status: 'read' } : m));
    }, 2500);

    // Simulate partner typing & auto-response if text message sent
    if (type === 'text' && !content.startsWith('/')) {
      setTimeout(() => {
        setIsPartnerTyping(true);
      }, 3000);

      setTimeout(() => {
        setIsPartnerTyping(false);
        const responses = [
          "Received loud and clear! The end-to-end security protocol looks rock solid.",
          "Got it! I love how fast and responsive this UI feels.",
          "Awesome! Let's check out the voice and video call features next.",
          "Perfect! Encrypted media transmission complete."
        ];
        const randomResp = responses[Math.floor(Math.random() * responses.length)];
        const partnerMsg: Message = {
          id: `msg_partner_${Date.now()}`,
          senderId: partnerUser.id,
          recipientId: currentUser.id,
          type: 'text',
          content: randomResp,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
        };
        setMessages((prev) => [...prev, partnerMsg]);
        showToast(`New Message from ${partnerUser.name}`, randomResp, 'message');
      }, 6000);
    }
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    showToast('Message Deleted', 'The message was permanently removed from local chat.', 'system');
  };

  const togglePinMessage = (id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
  };

  const toggleStarMessage = (id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) => prev.map((m) => {
      if (m.id !== messageId) return m;
      const currentReactions = m.reactions || {};
      const existingUsers = currentReactions[emoji] || [];
      const updatedUsers = existingUsers.includes(currentUser.id)
        ? existingUsers.filter((u) => u !== currentUser.id)
        : [...existingUsers, currentUser.id];

      const newReactions = { ...currentReactions, [emoji]: updatedUsers };
      if (updatedUsers.length === 0) {
        delete newReactions[emoji];
      }
      return { ...m, reactions: newReactions };
    }));
  };

  const clearChat = () => {
    setMessages([]);
    showToast('Chat Cleared', 'All local chat history cleared.', 'system');
  };

  const startCall = (type: 'voice' | 'video') => {
    setActiveCall({
      id: `call_${Date.now()}`,
      type,
      state: 'calling',
      durationSeconds: 0,
      isMuted: false,
      isVideoOn: type === 'video',
      isSpeakerOn: true,
    });

    // Simulate partner picking up after 2.5 seconds
    setTimeout(() => {
      setActiveCall((prev) => prev ? { ...prev, state: 'connected', startTime: Date.now() } : null);
      showToast(`${type === 'voice' ? 'Voice' : 'Video'} Call Connected`, `Talking with ${partnerUser.name}`, 'call');
    }, 2500);
  };

  const simulateIncomingCall = (type: 'voice' | 'video') => {
    setActiveCall({
      id: `call_inc_${Date.now()}`,
      type,
      state: 'incoming',
      durationSeconds: 0,
      isMuted: false,
      isVideoOn: type === 'video',
    });
    showToast(`Incoming ${type === 'voice' ? 'Voice' : 'Video'} Call`, `${partnerUser.name} is calling...`, 'call');
  };

  const acceptCall = () => {
    setActiveCall((prev) => prev ? { ...prev, state: 'connected', startTime: Date.now() } : null);
  };

  const endCall = () => {
    if (activeCall) {
      const durationStr = `${Math.floor(activeCall.durationSeconds / 60)}m ${activeCall.durationSeconds % 60}s`;
      const callLogMsg: Message = {
        id: `msg_call_${Date.now()}`,
        senderId: currentUser.id,
        recipientId: partnerUser.id,
        type: 'call_log',
        content: `${activeCall.type === 'voice' ? 'Voice' : 'Video'} Call Ended (${durationStr})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      setMessages((prev) => [...prev, callLogMsg]);
    }
    setActiveCall(null);
  };

  const toggleMuteCall = () => {
    setActiveCall((prev) => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  };

  const toggleVideoCall = () => {
    setActiveCall((prev) => prev ? { ...prev, isVideoOn: !prev.isVideoOn } : null);
  };

  const updatePrivacySettings = (settings: Partial<PrivacySettings>) => {
    setPrivacySettings((prev) => ({ ...prev, ...settings }));
    showToast('Privacy Updated', 'Privacy controls updated successfully.', 'security');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const pinnedMessage = messages.find((m) => m.isPinned) || null;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        partnerUser,
        setPartnerUser,
        messages,
        sendMessage,
        deleteMessage,
        togglePinMessage,
        toggleStarMessage,
        addReaction,
        clearChat,
        partnerStatus,
        setPartnerStatus,
        isPartnerTyping,
        setIsPartnerTyping,
        activeCall,
        startCall,
        acceptCall,
        endCall,
        toggleMuteCall,
        toggleVideoCall,
        simulateIncomingCall,
        activeDrawer,
        setActiveDrawer,
        activeLightboxImage,
        setActiveLightboxImage,
        privacySettings,
        updatePrivacySettings,
        themeAccent,
        setThemeAccent,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        activeToast,
        showToast,
        closeToast,
        replyingTo,
        setReplyingTo,
        pinnedMessage,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
