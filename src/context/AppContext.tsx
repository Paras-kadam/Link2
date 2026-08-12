import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  User,
  Message,
  CallSession,
  PrivacySettings,
  ThemeAccent,
  AppNotification,
  UserStatus,
} from '../types';
import { partnerUser as defaultPartnerUser, initialNotifications } from '../mock/mockData';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';
import { messageService } from '../services/messageService';

interface AppContextType {
  // Auth state
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  currentUser: User | null;
  handleLogin: (email: string, pass: string) => Promise<void>;
  handleLogout: () => Promise<void>;

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
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [partnerUser, setPartnerUser] = useState<User>(defaultPartnerUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerStatus, setPartnerStatus] = useState<UserStatus>('offline');
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

  const showToast = useCallback((title: string, message: string, type: string = 'info') => {
    setActiveToast({ title, message, type });
    setTimeout(() => {
      setActiveToast(null);
    }, 4000);
  }, []);

  const closeToast = useCallback(() => setActiveToast(null), []);

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user } = await authService.getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    initAuth();
  }, []);

  // Socket Connection and Event Listeners
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      socketService.connect();

      // Fetch message history
      messageService.getMessageHistory().then((data) => {
        setMessages(data.messages);
      }).catch(err => {
        console.error('Failed to fetch messages:', err);
      });

      socketService.on('user:online', () => {
        setPartnerStatus('online');
      });

      socketService.on('user:offline', () => {
        setPartnerStatus('offline');
      });

      socketService.on('typing:start', () => {
        setIsPartnerTyping(true);
      });

      socketService.on('typing:stop', () => {
        setIsPartnerTyping(false);
      });

      socketService.on('message:new', (msg: any) => {
        const formattedMsg = messageService.mapBackendMessageToFrontend(msg);
        setMessages(prev => [...prev, formattedMsg]);
        
        // If chat is open, mark as read
        socketService.emit('message:read', { messageId: msg._id });
      });

      socketService.on('message:status', ({ messageId, status }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status } : m));
      });

      socketService.on('message:updated', (msg: any) => {
        const formattedMsg = messageService.mapBackendMessageToFrontend(msg);
        setMessages(prev => prev.map(m => m.id === formattedMsg.id ? formattedMsg : m));
      });

      socketService.on('message:deleted', ({ messageId }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: 'This message was deleted', isDeleted: true } : m));
      });

      return () => {
        socketService.disconnect();
      };
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated, currentUser]);

  const handleLogin = async (email: string, pass: string) => {
    const { user } = await authService.login(email, pass);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    socketService.disconnect();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMessages([]);
  };

  const setPartnerTypingThrottled = useCallback((typing: boolean) => {
    if (typing) {
      socketService.emit('typing:start');
    } else {
      socketService.emit('typing:stop');
    }
  }, []);

  const sendMessage = useCallback((content: string, type: Message['type'] = 'text', extra?: Partial<Message>) => {
    if (!currentUser) return;
    
    // Optimistic UI updates
    const tempId = `temp_${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      senderId: currentUser.id,
      recipientId: partnerUser.id,
      type,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      isSelf: true,
      replyTo: replyingTo ? { id: replyingTo.id, senderName: replyingTo.senderId === currentUser.id ? 'You' : partnerUser.name, content: replyingTo.content } : undefined,
      ...extra,
    };

    setMessages((prev) => [...prev, newMsg]);
    setReplyingTo(null);

    socketService.emit('message:send', { content, type, replyTo: replyingTo?.id }, (res) => {
      if (res && res.success) {
        const formattedMsg = messageService.mapBackendMessageToFrontend(res.message);
        setMessages((prev) => prev.map((m) => m.id === tempId ? formattedMsg : m));
      } else {
        // Handle failure
        showToast('Message Failed', 'Could not send message. Please try again.', 'error');
        setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, status: 'failed' as any } : m));
      }
    });
  }, [currentUser, partnerUser, replyingTo, showToast]);

  const deleteMessage = useCallback((id: string) => {
    socketService.emit('message:delete', { messageId: id }, (res) => {
      if (!res.success) {
        showToast('Error', res.error || 'Failed to delete message', 'error');
      }
    });
  }, [showToast]);

  const togglePinMessage = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
  }, []);

  const toggleStarMessage = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!currentUser) return;
    
    // Optimistic UI
    setMessages((prev) => prev.map((m) => {
      if (m.id !== messageId) return m;
      const currentReactions = { ...(m.reactions || {}) };
      const existingUsers = currentReactions[emoji] || [];
      const updatedUsers = existingUsers.includes(currentUser.id)
        ? existingUsers.filter((u) => u !== currentUser.id)
        : [...existingUsers, currentUser.id];

      if (updatedUsers.length === 0) {
        delete currentReactions[emoji];
      } else {
        currentReactions[emoji] = updatedUsers;
      }
      return { ...m, reactions: currentReactions };
    }));

    socketService.emit('reaction:toggle', { messageId, emoji }, (res) => {
      if (!res.success) {
        showToast('Error', 'Failed to toggle reaction', 'error');
        // Ideally revert optimistic UI here
      }
    });
  }, [currentUser, showToast]);

  const clearChat = useCallback(() => {
    // Local clear for privacy mode
    setMessages([]);
    showToast('Chat Cleared', 'All local chat history cleared.', 'system');
  }, [showToast]);

  const startCall = useCallback((type: 'voice' | 'video') => {
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
  }, [partnerUser, showToast]);

  const simulateIncomingCall = useCallback((type: 'voice' | 'video') => {
    setActiveCall({
      id: `call_inc_${Date.now()}`,
      type,
      state: 'incoming',
      durationSeconds: 0,
      isMuted: false,
      isVideoOn: type === 'video',
    });
    showToast(`Incoming ${type === 'voice' ? 'Voice' : 'Video'} Call`, `${partnerUser.name} is calling...`, 'call');
  }, [partnerUser, showToast]);

  const acceptCall = useCallback(() => {
    setActiveCall((prev) => prev ? { ...prev, state: 'connected', startTime: Date.now() } : null);
  }, []);

  const endCall = useCallback(() => {
    if (activeCall && currentUser) {
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
  }, [activeCall, currentUser, partnerUser]);

  const toggleMuteCall = useCallback(() => {
    setActiveCall((prev) => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  }, []);

  const toggleVideoCall = useCallback(() => {
    setActiveCall((prev) => prev ? { ...prev, isVideoOn: !prev.isVideoOn } : null);
  }, []);

  const updatePrivacySettings = useCallback((settings: Partial<PrivacySettings>) => {
    setPrivacySettings((prev) => ({ ...prev, ...settings }));
    showToast('Privacy Updated', 'Privacy controls updated successfully.', 'security');
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const pinnedMessage = messages.find((m) => m.isPinned) || null;

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isLoadingAuth,
        handleLogin,
        handleLogout,
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
        setIsPartnerTyping: setPartnerTypingThrottled,
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
