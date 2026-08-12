import React from 'react';
import { X, ShieldAlert, PhoneCall, MessageSquare, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationToast: React.FC = () => {
  const { activeToast, closeToast } = useApp();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[#0A0A0A] border border-[#1C1C1C] p-3.5 rounded shadow-xl max-w-xs md:max-w-sm flex items-start gap-3 select-none font-mono animate-slide-up">
      <div className="mt-0.5 text-[#a0a0a0]">
        {activeToast.type === 'call' ? (
          <PhoneCall className="w-4 h-4" />
        ) : activeToast.type === 'security' ? (
          <ShieldAlert className="w-4 h-4" />
        ) : activeToast.type === 'message' ? (
          <MessageSquare className="w-4 h-4" />
        ) : (
          <Info className="w-4 h-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-[#f2f2f2] truncate">{activeToast.title}</h5>
        <p className="text-[11px] text-[#a0a0a0] mt-0.5 leading-relaxed font-sans">{activeToast.message}</p>
      </div>

      <button
        onClick={closeToast}
        className="p-1 text-[#666666] hover:text-[#f2f2f2] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
