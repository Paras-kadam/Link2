import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { AppLockOverlay } from './components/layout/AppLockOverlay';
import { NotificationToast } from './components/layout/NotificationToast';
import { ChatHeader } from './components/chat/ChatHeader';
import { PinnedBanner } from './components/chat/PinnedBanner';
import { MessageList } from './components/chat/MessageList';
import { MessageInput } from './components/chat/MessageInput';
import { SharedMediaDrawer } from './components/media/SharedMediaDrawer';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { PrivacyControlsModal } from './components/settings/PrivacyControlsModal';
import { SearchChatModal } from './components/chat/SearchChatModal';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { VoiceCallModal } from './components/calls/VoiceCallModal';
import { VideoCallModal } from './components/calls/VideoCallModal';
import { IncomingCallToast } from './components/calls/IncomingCallToast';
import { ImageViewerModal } from './components/media/ImageViewerModal';
import { MessageSquare, Image as ImageIcon, User, ShieldCheck, Bell, Settings, Lock, X } from 'lucide-react';

export const MainAppContent: React.FC = () => {
  const { activeDrawer, setActiveDrawer, updatePrivacySettings, notifications } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const mobileNavItems = [
    { id: 'none', label: 'CHAT', icon: MessageSquare },
    { id: 'media', label: 'MEDIA VAULT', icon: ImageIcon },
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'privacy', label: 'PRIVACY', icon: ShieldCheck },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell, badge: unreadNotifs },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <div className="flex h-screen h-dvh w-screen bg-[#050505] text-[#f2f2f2] overflow-hidden font-sans antialiased select-none relative">
      {/* 1. App Lock Passcode Shield */}
      <AppLockOverlay />

      {/* 2. Desktop Left Navigation Sidebar (240px) */}
      <Sidebar />

      {/* 3. Mobile Navigation Slide-Over Drawer (< 640px) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 md:hidden flex">
          <div className="w-64 bg-[#0A0A0A] border-r border-[#1C1C1C] h-full flex flex-col justify-between p-4 font-mono select-none">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
                <span className="text-xs font-bold tracking-widest text-[#f2f2f2] uppercase">
                  // LINK2 NAVIGATION
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#666666] hover:text-[#f2f2f2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeDrawer === item.id && !mobileMenuOpen;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveDrawer(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded text-xs font-mono transition-colors ${
                        isActive
                          ? 'bg-[#161616] text-[#f2f2f2] border-l-2 border-[#f2f2f2]'
                          : 'text-[#a0a0a0] hover:bg-[#151515]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#a0a0a0]" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#1C1C1C] text-[#f2f2f2]">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                updatePrivacySettings({ isAppLocked: true });
              }}
              className="w-full py-2.5 rounded bg-[#101010] border border-[#1C1C1C] text-xs font-mono text-[#f2f2f2] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#a0a0a0]" />
              <span>LOCK TERMINAL</span>
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* 4. Central Chat Column (Flexible width) */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#050505] relative">
        <ChatHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <PinnedBanner />
        <MessageList />
        <MessageInput />
      </main>

      {/* 5. Right Drawers / Panels (Optional on desktop ~300px, slide-over on mobile) */}
      {activeDrawer !== 'none' && (
        <div className="fixed md:relative inset-y-0 right-0 z-30 flex">
          {/* Backdrop on mobile for closing drawer */}
          <div
            className="fixed inset-0 bg-black/60 md:hidden z-10"
            onClick={() => setActiveDrawer('none')}
          />
          <div className="relative z-20 h-full">
            <SharedMediaDrawer />
            <UserProfileModal />
            <SettingsModal />
            <PrivacyControlsModal />
            <SearchChatModal />
            <NotificationsDrawer />
          </div>
        </div>
      )}

      {/* 6. Fullscreen Modals & Overlays */}
      <VoiceCallModal />
      <VideoCallModal />
      <IncomingCallToast />
      <ImageViewerModal />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
