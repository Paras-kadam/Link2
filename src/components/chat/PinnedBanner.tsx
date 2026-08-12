import React from 'react';
import { Pin, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PinnedBanner: React.FC = () => {
  const { pinnedMessage, togglePinMessage } = useApp();

  if (!pinnedMessage) return null;

  return (
    <div className="bg-[#101010] border-b border-[#1C1C1C] px-3 md:px-4 py-1.5 flex items-center justify-between text-xs font-mono select-none z-10 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Pin className="w-3.5 h-3.5 text-[#a0a0a0] shrink-0" />
        <span className="text-[#666666] shrink-0">PINNED:</span>
        <span className="text-[#f2f2f2] truncate">
          {pinnedMessage.content}
        </span>
      </div>

      <button
        onClick={() => togglePinMessage(pinnedMessage.id)}
        className="p-1 text-[#666666] hover:text-[#f2f2f2] transition-colors"
        title="Unpin Message"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
