import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageBubble } from './MessageBubble';
import { Lock } from 'lucide-react';

export const MessageList: React.FC = () => {
  const { messages } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-1 bg-[#050505] select-text">
      {/* Encryption Top Banner */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#0A0A0A] border border-[#1C1C1C] px-3.5 py-1.5 rounded text-center text-[11px] font-mono text-[#666666] flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#a0a0a0]" />
          <span>END-TO-END ENCRYPTED CHANNEL // NO LOGS STORED</span>
        </div>
      </div>

      {/* Messages */}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};
