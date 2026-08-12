import React, { useState } from 'react';
import { Settings, X, Volume2, Video, Bell, HardDrive } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsModal: React.FC = () => {
  const { activeDrawer, setActiveDrawer } = useApp();
  const [autoDownload, setAutoDownload] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [micDevice, setMicDevice] = useState('Default HD Microphone');
  const [camDevice, setCamDevice] = useState('Integrated HD Webcam (1080p)');

  if (activeDrawer !== 'settings') return null;

  return (
    <div className="w-full md:w-80 lg:w-[300px] bg-[#0A0A0A] border-l border-[#1C1C1C] flex flex-col h-full z-20 select-none overflow-y-auto shrink-0 font-mono">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1C1C1C]">
        <h3 className="text-xs font-mono font-bold text-[#f2f2f2] uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#a0a0a0]" /> // APP SETTINGS
        </h3>
        <button
          onClick={() => setActiveDrawer('none')}
          className="p-1.5 rounded text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* Audio Device */}
        <div className="space-y-2">
          <label className="text-[#a0a0a0] flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#666666]" /> MICROPHONE DEVICE
          </label>
          <select
            value={micDevice}
            onChange={(e) => setMicDevice(e.target.value)}
            className="w-full bg-[#101010] border border-[#1C1C1C] rounded p-2 text-xs text-[#f2f2f2] focus:outline-none focus:border-[#666666]"
          >
            <option value="Default HD Microphone">Default HD Microphone</option>
            <option value="Studio USB Mic">Studio USB Mic</option>
            <option value="Bluetooth Headset Mic">Bluetooth Headset Mic</option>
          </select>
        </div>

        {/* Video Device */}
        <div className="space-y-2">
          <label className="text-[#a0a0a0] flex items-center gap-2">
            <Video className="w-4 h-4 text-[#666666]" /> CAMERA DEVICE
          </label>
          <select
            value={camDevice}
            onChange={(e) => setCamDevice(e.target.value)}
            className="w-full bg-[#101010] border border-[#1C1C1C] rounded p-2 text-xs text-[#f2f2f2] focus:outline-none focus:border-[#666666]"
          >
            <option value="Integrated HD Webcam (1080p)">Integrated HD Webcam (1080p)</option>
            <option value="External 4K Pro Camera">External 4K Pro Camera</option>
            <option value="Virtual Cam Feed">Virtual Cam Feed</option>
          </select>
        </div>

        {/* Notification Sound */}
        <div className="p-3 rounded bg-[#101010] border border-[#1C1C1C] flex items-center justify-between">
          <label className="text-[#a0a0a0] flex items-center gap-2 cursor-pointer">
            <Bell className="w-4 h-4 text-[#666666]" /> SOUND NOTIFICATIONS
          </label>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#666666] rounded cursor-pointer"
          />
        </div>

        {/* Auto Download */}
        <div className="p-3 rounded bg-[#101010] border border-[#1C1C1C] flex items-center justify-between">
          <label className="text-[#a0a0a0] flex items-center gap-2 cursor-pointer">
            <HardDrive className="w-4 h-4 text-[#666666]" /> AUTO-DOWNLOAD MEDIA
          </label>
          <input
            type="checkbox"
            checked={autoDownload}
            onChange={(e) => setAutoDownload(e.target.checked)}
            className="w-4 h-4 accent-[#666666] rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
