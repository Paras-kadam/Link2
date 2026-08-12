import React from 'react';
import { Phone, Video, PhoneOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IncomingCallToast: React.FC = () => {
  const { activeCall, acceptCall, endCall, partnerUser } = useApp();

  if (!activeCall || activeCall.state !== 'incoming') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 bg-[#0A0A0A] border border-[#1C1C1C] p-4 rounded shadow-2xl animate-slide-down select-none font-mono">
      <div className="flex items-center gap-3">
        <img
          src={partnerUser.avatar}
          alt={partnerUser.name}
          className="w-10 h-10 rounded object-cover border border-[#1C1C1C]"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-[#f2f2f2] truncate">
            {partnerUser.customNickname || partnerUser.name}
          </h4>
          <p className="text-[11px] text-[#a0a0a0] flex items-center gap-1 mt-0.5">
            {activeCall.type === 'voice' ? <Phone className="w-3 h-3 text-[#666666]" /> : <Video className="w-3 h-3 text-[#666666]" />}
            <span>INCOMING {activeCall.type.toUpperCase()} CALL...</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={endCall}
          className="flex-1 py-2 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold hover:bg-rose-900/60 transition-colors flex items-center justify-center gap-1.5"
        >
          <PhoneOff className="w-4 h-4" /> DECLINE
        </button>

        <button
          onClick={acceptCall}
          className="flex-1 py-2 rounded bg-[#161616] border border-[#666666] text-[#f2f2f2] text-xs font-semibold hover:bg-[#151515] transition-colors flex items-center justify-center gap-1.5"
        >
          <Phone className="w-4 h-4" /> ACCEPT
        </button>
      </div>
    </div>
  );
};
