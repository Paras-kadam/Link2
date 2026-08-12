import React from 'react';
import { Mic, MicOff, PhoneOff, Video, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VoiceCallModal: React.FC = () => {
  const { activeCall, endCall, toggleMuteCall, partnerUser, startCall } = useApp();

  if (!activeCall || activeCall.type !== 'voice' || activeCall.state === 'incoming') {
    return null;
  }

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-between p-6 md:p-10 select-none font-mono">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-md border-b border-[#1C1C1C] pb-4">
        <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
          <Shield className="w-4 h-4 text-[#666666]" /> E2E ENCRYPTED VOICE
        </div>
        <span className="text-xs text-[#666666] bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#1C1C1C]">
          AES-256
        </span>
      </div>

      {/* Main Avatar & Status */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <img
          src={partnerUser.avatar}
          alt={partnerUser.name}
          className="w-32 h-32 md:w-40 md:h-40 rounded object-cover border-2 border-[#1C1C1C] mb-6"
        />

        <h2 className="text-xl md:text-2xl font-bold text-[#f2f2f2]">
          {partnerUser.customNickname || partnerUser.name}
        </h2>
        <p className="text-xs text-[#666666] mt-1">{partnerUser.handle}</p>

        <div className="mt-4 px-3 py-1 rounded bg-[#0A0A0A] border border-[#1C1C1C] text-xs">
          {activeCall.state === 'calling' ? (
            <span className="text-[#a0a0a0] animate-pulse">CALLING...</span>
          ) : (
            <span className="text-[#f2f2f2] font-mono tracking-widest text-sm">
              {formatDuration(activeCall.durationSeconds)}
            </span>
          )}
        </div>
      </div>

      {/* Control Bar Footer */}
      <div className="w-full max-w-md bg-[#0A0A0A] p-4 rounded border border-[#1C1C1C] flex items-center justify-center gap-6">
        {/* Mute Button */}
        <button
          onClick={toggleMuteCall}
          className={`p-3.5 rounded border transition-colors ${
            activeCall.isMuted
              ? 'bg-[#161616] border-[#666666] text-[#f2f2f2]'
              : 'bg-[#101010] border-[#1C1C1C] text-[#a0a0a0] hover:text-[#f2f2f2]'
          }`}
          title={activeCall.isMuted ? 'Unmute' : 'Mute'}
        >
          {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Switch to Video */}
        <button
          onClick={() => {
            endCall();
            startCall('video');
          }}
          className="p-3.5 rounded bg-[#101010] border border-[#1C1C1C] text-[#a0a0a0] hover:text-[#f2f2f2] transition-colors"
          title="Switch to Video"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* End Call Button (Muted Red) */}
        <button
          onClick={endCall}
          className="p-3.5 rounded bg-rose-950/60 border border-rose-800 text-rose-200 hover:bg-rose-900 transition-colors"
          title="End Voice Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
