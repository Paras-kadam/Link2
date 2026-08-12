import React, { useState } from 'react';
import { X, ShieldCheck, Edit3, Check, Copy, MessageSquare, PhoneCall } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UserProfileModal: React.FC = () => {
  const { activeDrawer, setActiveDrawer, partnerUser, setPartnerUser, showToast } = useApp();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(partnerUser.customNickname || partnerUser.name);

  if (activeDrawer !== 'profile') return null;

  const handleSaveNickname = () => {
    setPartnerUser((prev) => ({ ...prev, customNickname: nicknameInput.trim() }));
    setIsEditingNickname(false);
    showToast('Nickname Updated', `Set nickname to "${nicknameInput.trim()}"`, 'info');
  };

  const copyFingerprint = () => {
    navigator.clipboard.writeText(partnerUser.encryptionFingerprint);
    showToast('Fingerprint Copied', 'Security fingerprint copied.', 'security');
  };

  return (
    <div className="w-full md:w-80 lg:w-[300px] bg-[#0A0A0A] border-l border-[#1C1C1C] flex flex-col h-full z-20 select-none overflow-y-auto shrink-0">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1C1C1C]">
        <h3 className="text-xs font-mono font-bold text-[#f2f2f2] uppercase tracking-wider">
          // PARTNER PROFILE
        </h3>
        <button
          onClick={() => setActiveDrawer('none')}
          className="p-1.5 rounded text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Avatar & Details */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative mb-3">
            <img
              src={partnerUser.avatar}
              alt={partnerUser.name}
              className="w-20 h-20 rounded object-cover border border-[#1C1C1C]"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0A0A0A]" />
          </div>

          {/* Nickname / Name */}
          {isEditingNickname ? (
            <div className="flex items-center gap-1.5 w-full max-w-xs">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                className="flex-1 bg-[#101010] border border-[#1C1C1C] rounded px-2.5 py-1 text-xs font-mono text-[#f2f2f2] focus:outline-none focus:border-[#666666]"
              />
              <button
                onClick={handleSaveNickname}
                className="p-1.5 rounded bg-[#161616] text-[#f2f2f2] border border-[#262626]"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-[#f2f2f2]">
                {partnerUser.customNickname || partnerUser.name}
              </h2>
              <button
                onClick={() => setIsEditingNickname(true)}
                className="p-1 text-[#666666] hover:text-[#f2f2f2] transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <span className="text-[11px] font-mono text-[#666666] mt-0.5">{partnerUser.handle}</span>
        </div>

        {/* Bio */}
        <div className="p-3 rounded bg-[#101010] border border-[#1C1C1C] text-xs text-[#a0a0a0] font-mono">
          <span className="text-[10px] text-[#666666] uppercase block mb-1">STATUS BIO</span>
          {partnerUser.bio}
        </div>

        {/* Encryption Fingerprint */}
        <div className="p-3 rounded bg-[#101010] border border-[#1C1C1C] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#a0a0a0] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#666666]" /> KEY FINGERPRINT
            </span>
            <button
              onClick={copyFingerprint}
              className="p-1 text-[#666666] hover:text-[#f2f2f2] transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="font-mono text-[10px] text-[#f2f2f2] break-all bg-[#050505] p-2 rounded border border-[#1C1C1C]">
            {partnerUser.encryptionFingerprint}
          </p>
          <span className="text-[9px] font-mono text-[#666666] block">curve25519 DH key exchange</span>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded bg-[#101010] border border-[#1C1C1C] flex flex-col gap-1">
            <span className="text-[#666666] text-[10px] flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> MESSAGES
            </span>
            <span className="text-sm font-bold text-[#f2f2f2]">1,482</span>
          </div>

          <div className="p-3 rounded bg-[#101010] border border-[#1C1C1C] flex flex-col gap-1">
            <span className="text-[#666666] text-[10px] flex items-center gap-1">
              <PhoneCall className="w-3 h-3" /> CALL TIME
            </span>
            <span className="text-sm font-bold text-[#f2f2f2]">24h 12m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
