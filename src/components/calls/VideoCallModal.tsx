import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VideoCallModal: React.FC = () => {
  const { activeCall, endCall, toggleMuteCall, toggleVideoCall, partnerUser, currentUser, localStream, remoteStream, cancelCall } = useApp();
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  React.useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!activeCall || activeCall.type !== 'video' || activeCall.state === 'incoming') {
    return null;
  }

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const getStatusText = () => {
    switch (activeCall.state) {
      case 'calling': return 'CALLING...';
      case 'ringing': return 'RINGING...';
      case 'connecting': return 'CONNECTING...';
      case 'reconnecting': return 'RECONNECTING...';
      case 'rejected': return 'DECLINED';
      case 'busy': return 'BUSY';
      case 'failed': return 'FAILED';
      default: return null;
    }
  };

  const statusText = getStatusText();

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between p-4 md:p-6 select-none font-mono">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full z-20 bg-[#0A0A0A] p-3 rounded border border-[#1C1C1C]">
        <div className="flex items-center gap-2">
          <img
            src={partnerUser.avatar}
            alt={partnerUser.name}
            className="w-7 h-7 rounded object-cover border border-[#1C1C1C]"
          />
          <span className="text-xs font-bold text-[#f2f2f2]">
            {partnerUser.customNickname || partnerUser.name}
          </span>
          <span className="text-[10px] text-[#666666] border-l border-[#1C1C1C] pl-2 flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#666666]" /> E2EE
          </span>
        </div>

        <div className="text-xs text-[#a0a0a0]">
          {statusText ? (
            <span className="animate-pulse">{statusText}</span>
          ) : (
            <span>{formatDuration(activeCall.durationSeconds)}</span>
          )}
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div className="relative flex-1 my-3 bg-[#0A0A0A] rounded border border-[#1C1C1C] overflow-hidden flex items-center justify-center">
        {/* Remote Partner Feed */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={partnerUser.avatar}
              alt={partnerUser.name}
              className="w-24 h-24 rounded object-cover border border-[#1C1C1C] mb-4"
            />
            {statusText ? (
               <span className="text-xs text-[#a0a0a0] animate-pulse">{statusText}</span>
            ) : (
               <span className="text-xs text-[#666666]">Waiting for video...</span>
            )}
          </div>
        )}

        {/* Local Self PIP Video Feed */}
        <div className="absolute bottom-4 right-4 w-28 h-36 md:w-36 md:h-48 bg-[#050505] rounded border border-[#1C1C1C] overflow-hidden shadow-lg z-10 flex items-center justify-center">
          {activeCall.isVideoOn && localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <img
              src={currentUser?.avatar}
              alt="My Video Feed"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-[#050505]/80 text-[9px] text-[#a0a0a0] rounded border border-[#1C1C1C]">
            YOU
          </div>
        </div>
      </div>

      {/* Control Bar Footer */}
      <div className="w-full max-w-md mx-auto bg-[#0A0A0A] p-3 rounded border border-[#1C1C1C] flex items-center justify-center gap-6 z-20">
        <button
          onClick={toggleMuteCall}
          className={`p-3 rounded border transition-colors ${
            activeCall.isMuted
              ? 'bg-[#161616] border-[#666666] text-[#f2f2f2]'
              : 'bg-[#101010] border-[#1C1C1C] text-[#a0a0a0] hover:text-[#f2f2f2]'
          }`}
          title="Toggle Mute"
        >
          {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideoCall}
          className={`p-3 rounded border transition-colors ${
            !activeCall.isVideoOn
              ? 'bg-[#161616] border-[#666666] text-[#f2f2f2]'
              : 'bg-[#101010] border-[#1C1C1C] text-[#a0a0a0] hover:text-[#f2f2f2]'
          }`}
          title="Toggle Camera"
        >
          {!activeCall.isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        <button
          onClick={activeCall.state === 'calling' ? cancelCall : endCall}
          className="p-3 rounded bg-rose-950/60 border border-rose-800 text-rose-200 hover:bg-rose-900 transition-colors"
          title={activeCall.state === 'calling' ? 'Cancel Call' : 'End Video Call'}
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
