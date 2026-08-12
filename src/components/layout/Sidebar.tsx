import React from 'react';
import {
  MessageSquare,
  Image as ImageIcon,
  ShieldCheck,
  Settings,
  Lock,
  PhoneCall,
  User as UserIcon,
  Bell,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    partnerUser,
    partnerStatus,
    setPartnerStatus,
    isPartnerTyping,
    setIsPartnerTyping,
    simulateIncomingCall,
    activeDrawer,
    setActiveDrawer,
    updatePrivacySettings,
    notifications,
  } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'none', label: 'CHAT', icon: MessageSquare },
    { id: 'media', label: 'MEDIA VAULT', icon: ImageIcon },
    { id: 'profile', label: 'PARTNER PROFILE', icon: UserIcon },
    { id: 'privacy', label: 'SECURITY & PRIVACY', icon: ShieldCheck },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell, badge: unreadNotifs },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#0A0A0A] border-r border-[#1C1C1C] flex-col justify-between hidden md:flex shrink-0 select-none">
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        {/* Brand Bar */}
        <div className="h-14 border-b border-[#1C1C1C] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f2f2f2]" />
            <span className="font-mono text-xs font-bold tracking-widest text-[#f2f2f2] uppercase">
              LINK2 // PRIVATE
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#101010] text-[#666666] border border-[#1C1C1C]">
            E2EE
          </span>
        </div>

        {/* Partner Quick Card */}
        <div className="p-3 border-b border-[#1C1C1C] bg-[#050505]">
          <div className="flex items-center gap-3 p-2 rounded-md bg-[#0A0A0A] border border-[#1C1C1C]">
            <div className="relative shrink-0">
              <img
                src={partnerUser.avatar}
                alt={partnerUser.name}
                className="w-8 h-8 rounded object-cover border border-[#1C1C1C]"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0A0A0A] ${
                  partnerStatus === 'online' ? 'bg-emerald-500' : 'bg-[#666666]'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-[#f2f2f2] truncate">
                {partnerUser.customNickname || partnerUser.name}
              </h4>
              <p className="text-[10px] font-mono text-[#666666] truncate">{partnerUser.handle}</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeDrawer === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveDrawer(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono tracking-wider transition-colors ${
                  isActive
                    ? 'bg-[#161616] text-[#f2f2f2] border-l-2 border-[#f2f2f2]'
                    : 'text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#a0a0a0]" />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#1c1c1c] text-[#f2f2f2]">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls / Simulation Tools */}
      <div className="p-3 border-t border-[#1C1C1C] space-y-2 bg-[#050505]">
        <div className="text-[10px] font-mono text-[#666666] uppercase tracking-wider px-1">
          SIMULATION TOOLS
        </div>

        {/* Partner Status Simulation */}
        <button
          onClick={() => setPartnerStatus(partnerStatus === 'online' ? 'offline' : 'online')}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0A0A0A] border border-[#1C1C1C] text-[11px] font-mono text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
        >
          <span>PARTNER STATUS</span>
          <span className={`text-[10px] ${partnerStatus === 'online' ? 'text-emerald-500' : 'text-[#666666]'}`}>
            ● {partnerStatus.toUpperCase()}
          </span>
        </button>

        {/* Partner Typing Simulation */}
        <button
          onClick={() => setIsPartnerTyping(!isPartnerTyping)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border text-[11px] font-mono transition-colors ${
            isPartnerTyping
              ? 'bg-[#161616] text-[#f2f2f2] border-[#666666]'
              : 'bg-[#0A0A0A] border-[#1C1C1C] text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>TYPING SIM</span>
          </span>
          <span className="text-[10px]">{isPartnerTyping ? 'ON' : 'OFF'}</span>
        </button>

        {/* Demo Incoming Call */}
        <button
          onClick={() => simulateIncomingCall('video')}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0A0A0A] border border-[#1C1C1C] text-[11px] font-mono text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>TEST CALL</span>
          </span>
          <span className="text-[10px]">TRIGGER</span>
        </button>

        {/* Quick App Lock */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => updatePrivacySettings({ isAppLocked: true })}
            className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded bg-[#101010] border border-[#1C1C1C] text-xs font-mono text-[#f2f2f2] hover:bg-[#151515] transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-[#a0a0a0]" />
            <span>LOCK TERMINAL</span>
          </button>
          
          <button
            onClick={() => useApp().handleLogout()}
            className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded bg-transparent border border-rose-900/50 text-xs font-mono text-rose-500 hover:bg-rose-950/20 transition-colors"
          >
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
