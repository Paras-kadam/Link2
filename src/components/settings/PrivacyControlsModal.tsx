import React, { useState } from 'react';
import { ShieldCheck, Lock, Clock, Trash2, AlertTriangle, X, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { DisappearingTimer } from '../../types';

export const PrivacyControlsModal: React.FC = () => {
  const {
    activeDrawer,
    setActiveDrawer,
    privacySettings,
    updatePrivacySettings,
    clearChat,
    showToast,
  } = useApp();

  const [confirmClear, setConfirmClear] = useState(false);
  const [pinInput, setPinInput] = useState(privacySettings.pinCode);

  if (activeDrawer !== 'privacy') return null;

  const timers: { id: DisappearingTimer; label: string }[] = [
    { id: 'off', label: 'OFF' },
    { id: '24h', label: '24 HOURS' },
    { id: '7d', label: '7 DAYS' },
    { id: '90d', label: '90 DAYS' },
  ];

  return (
    <div className="w-full md:w-80 lg:w-[300px] bg-[#0A0A0A] border-l border-[#1C1C1C] flex flex-col h-full z-20 select-none overflow-y-auto shrink-0 font-mono">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1C1C1C]">
        <h3 className="text-xs font-mono font-bold text-[#f2f2f2] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#a0a0a0]" /> // PRIVACY CONTROLS
        </h3>
        <button
          onClick={() => setActiveDrawer('none')}
          className="p-1.5 rounded text-[#666666] hover:text-[#f2f2f2] hover:bg-[#151515] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* Passcode Lock */}
        <div className="p-3 rounded bg-[#101010] border border-[#1C1C1C] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#f2f2f2] flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#666666]" /> PASSCODE LOCK
            </span>
            <button
              onClick={() => updatePrivacySettings({ isAppLocked: true })}
              className="px-2.5 py-1 rounded bg-[#161616] text-[#f2f2f2] border border-[#262626] text-[10px] hover:bg-[#151515]"
            >
              LOCK NOW
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-[#666666]">PIN CODE (4 DIGITS)</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-[#050505] border border-[#1C1C1C] rounded px-2.5 py-1 text-xs text-[#f2f2f2] font-mono tracking-widest focus:outline-none"
              />
              <button
                onClick={() => {
                  updatePrivacySettings({ pinCode: pinInput });
                  showToast('PIN Code Saved', 'Updated local app passcode.', 'security');
                }}
                className="px-3 py-1 rounded bg-[#161616] text-[#f2f2f2] border border-[#262626] text-[10px]"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>

        {/* Disappearing Messages */}
        <div className="space-y-2">
          <label className="text-[#a0a0a0] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#666666]" /> DISAPPEARING MESSAGES
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {timers.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  updatePrivacySettings({ disappearingMessagesTimer: t.id });
                  showToast('Disappearing Timer', `Timer set to ${t.label}`, 'security');
                }}
                className={`py-1.5 px-2 rounded border text-[10px] font-mono transition-colors ${
                  privacySettings.disappearingMessagesTimer === t.id
                    ? 'bg-[#161616] text-[#f2f2f2] border-[#666666]'
                    : 'bg-[#101010] border-[#1C1C1C] text-[#666666] hover:text-[#a0a0a0]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot Protection */}
        <div className="p-3 rounded bg-[#101010] border border-[#1C1C1C] space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[#a0a0a0] flex items-center gap-1.5 cursor-pointer">
              <AlertTriangle className="w-4 h-4 text-[#666666]" /> SCREENSHOT ALERTS
            </label>
            <input
              type="checkbox"
              checked={privacySettings.screenshotAlerts}
              onChange={(e) => updatePrivacySettings({ screenshotAlerts: e.target.checked })}
              className="w-4 h-4 accent-[#666666] rounded cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-[#666666]">
            Notify participants if a screenshot attempt is detected.
          </p>
        </div>

        {/* Read Receipts */}
        <div className="p-3 rounded bg-[#101010] border border-[#1C1C1C] space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[#a0a0a0] flex items-center gap-1.5 cursor-pointer">
              <Eye className="w-4 h-4 text-[#666666]" /> READ RECEIPTS
            </label>
            <input
              type="checkbox"
              checked={privacySettings.readReceiptsEnabled}
              onChange={(e) => updatePrivacySettings({ readReceiptsEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#666666] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Clear Chat */}
        <div className="pt-3 border-t border-[#1C1C1C]">
          {confirmClear ? (
            <div className="p-3 rounded bg-[#101010] border border-rose-900/50 space-y-2 text-[11px]">
              <p className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Wipe local chat data?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-1 rounded bg-[#161616] text-[#a0a0a0] border border-[#262626]"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    clearChat();
                    setConfirmClear(false);
                  }}
                  className="flex-1 py-1 rounded bg-rose-950/40 border border-rose-800 text-rose-300 font-bold"
                >
                  WIPE ALL
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full py-2.5 rounded bg-[#101010] hover:bg-rose-950/20 text-rose-400 border border-rose-900/40 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> WIPE CHAT HISTORY
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
