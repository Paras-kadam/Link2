import React, { useState, useEffect } from 'react';
import { Mic, Trash2, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface VoiceRecorderModalProps {
  onClose: () => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({ onClose }) => {
  const { sendMessage, showToast } = useApp();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleSend = () => {
    if (seconds < 1) {
      showToast('Recording too short', 'Hold or record for at least 1 second.', 'info');
      return;
    }
    sendMessage(`Voice Note (${formatTime(seconds)})`, 'voice', {
      mediaUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
      audioDuration: formatTime(seconds),
    });
    showToast('Voice Message Sent', `Encrypted voice note sent (${formatTime(seconds)})`, 'message');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-md p-6 rounded bg-[#0A0A0A] border border-[#1C1C1C] flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded bg-[#101010] border border-[#1C1C1C] flex items-center justify-center mb-4 text-[#f2f2f2]">
          <Mic className="w-7 h-7" />
        </div>

        <h3 className="text-sm font-bold text-[#f2f2f2] uppercase tracking-wider">
          RECORDING VOICE NOTE
        </h3>
        <p className="text-[11px] text-[#666666] mt-1">End-to-End Encrypted Audio</p>

        {/* Waveform Visualizer */}
        <div className="flex items-center gap-1 h-12 my-5">
          {[40, 80, 20, 100, 60, 90, 30, 70, 100, 50, 80, 40, 90, 60, 100, 30, 80].map((_, idx) => (
            <div
              key={idx}
              style={{
                height: `${Math.random() * 80 + 20}%`,
                animationDelay: `${idx * 0.08}s`,
              }}
              className="w-1 rounded-full bg-[#a0a0a0] animate-pulse"
            />
          ))}
        </div>

        <div className="text-xl font-mono font-bold text-[#f2f2f2] mb-5 tracking-widest">
          {formatTime(seconds)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded bg-[#101010] border border-[#1C1C1C] text-rose-400 text-xs font-mono hover:bg-[#151515] transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> CANCEL
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-2.5 rounded bg-[#161616] border border-[#262626] text-[#f2f2f2] text-xs font-mono hover:bg-[#151515] transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> SEND NOTE
          </button>
        </div>
      </div>
    </div>
  );
};
