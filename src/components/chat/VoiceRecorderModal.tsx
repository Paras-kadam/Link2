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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center text-center relative overflow-hidden animate-scale-up">
        {/* Glow effect */}
        <div className="w-24 h-24 rounded-full bg-purple-600/20 absolute -top-10 -right-10 blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-4 animate-pulse-glow">
          <Mic className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-100">Recording Voice Note</h3>
        <p className="text-xs text-slate-400 mt-1">End-to-End Encrypted Audio</p>

        {/* Dynamic Waveform Visualizer */}
        <div className="flex items-center gap-1.5 h-16 my-6">
          {[40, 80, 20, 100, 60, 90, 30, 70, 100, 50, 80, 40, 90, 60, 100, 30, 80].map((_, idx) => (
            <div
              key={idx}
              style={{
                height: `${Math.random() * 80 + 20}%`,
                animationDelay: `${idx * 0.08}s`,
              }}
              className="w-1.5 rounded-full bg-gradient-to-t from-purple-600 to-cyan-400 animate-pulse"
            />
          ))}
        </div>

        <div className="text-2xl font-mono font-bold text-slate-100 mb-6 tracking-wider">
          {formatTime(seconds)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-rose-400 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Send Voice Note
          </button>
        </div>
      </div>
    </div>
  );
};
