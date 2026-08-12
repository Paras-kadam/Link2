import { useState, useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socketService';
import type { CallSession, CallType } from '../types';

export const useWebRTC = (
  isAuthenticated: boolean,
  showToast: (title: string, msg: string, type: string) => void
) => {
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const isCallerRef = useRef<boolean>(false);
  
  // Clean up function
  const cleanupCall = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setRemoteStream(null);
    setActiveCall(null);
    isCallerRef.current = false;
  }, [localStream]);

  const initWebRTC = useCallback(async (type: CallType, isCaller: boolean) => {
    isCallerRef.current = isCaller;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      setLocalStream(stream);

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Future TURN server can be added here
        ],
      });
      pcRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.emit('webrtc:ice-candidate', event.candidate);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setActiveCall((prev) => prev ? { ...prev, state: 'connected', startTime: Date.now() } : null);
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          showToast('Call Ended', 'Connection lost.', 'error');
          cleanupCall();
        }
      };

      return pc;
    } catch (err: any) {
      console.error('Error accessing media devices:', err);
      let errMsg = 'Could not access media devices.';
      if (err.name === 'NotAllowedError') errMsg = `Permission denied for ${type === 'video' ? 'camera/microphone' : 'microphone'}.`;
      else if (err.name === 'NotFoundError') errMsg = 'Requested device not found.';
      
      showToast('Media Error', errMsg, 'error');
      cleanupCall();
      return null;
    }
  }, [cleanupCall, showToast]);

  const startCall = useCallback(async (type: CallType) => {
    setActiveCall({
      id: `call_${Date.now()}`,
      type,
      state: 'calling',
      durationSeconds: 0,
      isMuted: false,
      isVideoOn: type === 'video',
    });

    console.log(`[CALL DEBUG] Starting call of type: ${type}`);
    socketService.emit('call:start', { type });
  }, []);

  const acceptCall = useCallback(async () => {
    if (!activeCall) return;
    setActiveCall(prev => prev ? { ...prev, state: 'connecting' } : null);
    
    const pc = await initWebRTC(activeCall.type, false);
    if (!pc) {
      // If media access failed, reject or cancel
      setActiveCall(null);
      socketService.emit('call:reject');
      return;
    }

    socketService.emit('call:accept');
  }, [activeCall, initWebRTC]);

  const endCall = useCallback(() => {
    socketService.emit('call:end');
    cleanupCall();
  }, [cleanupCall]);

  const rejectCall = useCallback(() => {
    socketService.emit('call:reject');
    cleanupCall();
  }, [cleanupCall]);

  const cancelCall = useCallback(() => {
    socketService.emit('call:cancel');
    cleanupCall();
  }, [cleanupCall]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setActiveCall(prev => prev ? { ...prev, isMuted: !audioTrack.enabled } : null);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setActiveCall(prev => prev ? { ...prev, isVideoOn: videoTrack.enabled } : null);
      }
    }
  }, [localStream]);

  // Handle Socket Signaling Events
  useEffect(() => {
    if (!isAuthenticated) return;

    const onCallIncoming = (payload: any) => {
      console.log(`[CALL DEBUG] React listener onCallIncoming executed with payload:`, payload);
      if (activeCall) {
        console.log(`[CALL DEBUG] FAILED - activeCall already exists! Emitting busy.`);
        socketService.emit('call:busy');
        return;
      }
      console.log(`[CALL DEBUG] Setting activeCall to incoming`);
      setActiveCall({
        id: `call_inc_${Date.now()}`,
        type: payload.type,
        state: 'incoming',
        durationSeconds: 0,
        isMuted: false,
        isVideoOn: payload.type === 'video',
      });
    };

    const onCallAccept = async () => {
      if (activeCall?.state === 'calling') {
        const pc = await initWebRTC(activeCall.type, true);
        if (pc) {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketService.emit('webrtc:offer', offer);
          } catch (err) {
            console.error('Failed to create offer:', err);
            cleanupCall();
          }
        }
      }
    };

    const onCallReject = () => {
      showToast('Call Declined', 'User declined the call.', 'info');
      cleanupCall();
    };

    const onCallCancel = () => {
      cleanupCall();
    };

    const onCallEnd = () => {
      cleanupCall();
    };

    const onCallBusy = () => {
      showToast('User Busy', 'User is currently on another call.', 'info');
      cleanupCall();
    };

    const onWebRTCOffer = async (offer: any) => {
      // Receiver side
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socketService.emit('webrtc:answer', answer);
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      }
    };

    const onWebRTCAnswer = async (answer: any) => {
      // Caller side
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error handling answer:', err);
        }
      }
    };

    const onWebRTCIceCandidate = async (candidate: any) => {
      if (pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    };

    socketService.on('call:incoming', onCallIncoming);
    socketService.on('call:accept', onCallAccept);
    socketService.on('call:reject', onCallReject);
    socketService.on('call:cancel', onCallCancel);
    socketService.on('call:end', onCallEnd);
    socketService.on('call:busy', onCallBusy);
    socketService.on('webrtc:offer', onWebRTCOffer);
    socketService.on('webrtc:answer', onWebRTCAnswer);
    socketService.on('webrtc:ice-candidate', onWebRTCIceCandidate);

    return () => {
      socketService.off('call:incoming', onCallIncoming);
      socketService.off('call:accept', onCallAccept);
      socketService.off('call:reject', onCallReject);
      socketService.off('call:cancel', onCallCancel);
      socketService.off('call:end', onCallEnd);
      socketService.off('call:busy', onCallBusy);
      socketService.off('webrtc:offer', onWebRTCOffer);
      socketService.off('webrtc:answer', onWebRTCAnswer);
      socketService.off('webrtc:ice-candidate', onWebRTCIceCandidate);
    };
  }, [activeCall, initWebRTC, cleanupCall, showToast, isAuthenticated]);

  // Call timer simulation
  useEffect(() => {
    let interval: any;
    if (activeCall && activeCall.state === 'connected') {
      interval = setInterval(() => {
        setActiveCall((prev) => prev ? { ...prev, durationSeconds: prev.durationSeconds + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall?.state]);

  return {
    activeCall,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
};
