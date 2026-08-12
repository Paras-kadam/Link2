import React from 'react';
import { Phone, Video, Search, Image as ImageIcon, Shield, UserCheck, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatHeaderProps {
  onMobileMenuToggle?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onMobileMenuToggle }) => {
  const {
    partnerUser,
    partnerStatus,
    isPartnerTyping,
    startCall,
    activeDrawer,
    setActiveDrawer,
  } = useApp();

  const displayName = partnerUser.customNickname || partnerUser.name;

  return (
    <header className="h-14 bg-[#0A0A0A] border-b border-[#1C1C1C] px-3 md:px-5 flex items-center justify-between z-10 select-none shrink-0">
      {/* Partner Identity Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile menu drawer trigger button */}
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515] md:hidden transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveDrawer(activeDrawer === 'profile' ? 'none' : 'profile')}
          className="relative shrink-0 focus:outline-none"
        >
          <img
            src={partnerUser.avatar}
            alt={displayName}
            className="w-8 h-8 rounded object-cover border border-[#1C1C1C]"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0A0A0A] ${
              partnerStatus === 'online' ? 'bg-emerald-500' : 'bg-[#666666]'
            }`}
          />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h3
              onClick={() => setActiveDrawer(activeDrawer === 'profile' ? 'none' : 'profile')}
              className="text-xs md:text-sm font-bold text-[#f2f2f2] hover:text-[#a0a0a0] cursor-pointer transition-colors truncate"
            >
              {displayName}
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[#666666]">
              <Shield className="w-3 h-3 text-[#a0a0a0]" /> E2EE
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {isPartnerTyping ? (
              <span className="text-[#a0a0a0] font-mono animate-pulse">
                typing...
              </span>
            ) : partnerStatus === 'online' ? (
              <span className="text-[#a0a0a0] font-mono text-[10px]">
                <span className="text-emerald-500 mr-1">●</span>online
              </span>
            ) : (
              <span className="text-[#666666] font-mono text-[10px]">offline</span>
            )}
          </div>
        </div>
      </div>

      {/* Header Quick Actions */}
      <div className="flex items-center gap-1">
        {/* Voice Call Button */}
        <button
          onClick={() => startCall('voice')}
          className="p-2 rounded text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
          title="Voice Call"
        >
          <Phone className="w-4 h-4" />
        </button>

        {/* Video Call Button */}
        <button
          onClick={() => startCall('video')}
          className="p-2 rounded text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
          title="Video Call"
        >
          <Video className="w-4 h-4" />
        </button>

        {/* Search Chat Button */}
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'search' ? 'none' : 'search')}
          className={`p-2 rounded transition-colors ${
            activeDrawer === 'search'
              ? 'bg-[#161616] text-[#f2f2f2]'
              : 'text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515]'
          }`}
          title="Search Chat"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Shared Media Vault */}
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'media' ? 'none' : 'media')}
          className={`p-2 rounded transition-colors ${
            activeDrawer === 'media'
              ? 'bg-[#161616] text-[#f2f2f2]'
              : 'text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515]'
          }`}
          title="Media Vault"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Partner Profile Toggle */}
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'profile' ? 'none' : 'profile')}
          className={`p-2 rounded transition-colors ${
            activeDrawer === 'profile'
              ? 'bg-[#161616] text-[#f2f2f2]'
              : 'text-[#a0a0a0] hover:text-[#f2f2f2] hover:bg-[#151515]'
          }`}
          title="Partner Details"
        >
          <UserCheck className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
