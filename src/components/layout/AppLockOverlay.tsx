import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AppLockOverlay: React.FC = () => {
  const { privacySettings, updatePrivacySettings, showToast } = useApp();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [showPinText, setShowPinText] = useState<boolean>(false);

  if (!privacySettings.isAppLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (inputPin: string) => {
    if (inputPin === privacySettings.pinCode || inputPin === '1234') {
      updatePrivacySettings({ isAppLocked: false });
      setPin('');
      showToast('App Unlocked', 'Session active.', 'security');
    } else {
      setError(true);
      setTimeout(() => setPin(''), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-sm bg-[#0A0A0A] p-6 md:p-8 rounded border border-[#1C1C1C] flex flex-col items-center text-center">
        {/* Lock Icon */}
        <div className="w-12 h-12 rounded bg-[#101010] border border-[#1C1C1C] flex items-center justify-center mb-4 text-[#f2f2f2]">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-[#f2f2f2] tracking-wider uppercase">
          LINK2 TERMINAL LOCKED
        </h2>
        <p className="text-xs text-[#666666] mt-1 mb-6">Enter PIN to resume encrypted session</p>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded border transition-colors ${
                  error
                    ? 'bg-rose-900 border-rose-500'
                    : filled
                    ? 'bg-[#f2f2f2] border-[#f2f2f2]'
                    : 'bg-[#101010] border-[#1C1C1C]'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs text-rose-400 mb-4">
            INCORRECT PASSCODE. DEMO PIN: 1234
          </p>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[220px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-14 h-14 rounded bg-[#101010] hover:bg-[#151515] text-[#f2f2f2] text-lg font-bold border border-[#1C1C1C] flex items-center justify-center mx-auto transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setShowPinText(!showPinText)}
            className="w-14 h-14 rounded bg-[#101010] hover:bg-[#151515] text-[#666666] flex items-center justify-center mx-auto text-xs"
          >
            {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-14 h-14 rounded bg-[#101010] hover:bg-[#151515] text-[#f2f2f2] text-lg font-bold border border-[#1C1C1C] flex items-center justify-center mx-auto transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-14 rounded bg-[#101010] hover:bg-[#151515] text-[#666666] flex items-center justify-center mx-auto text-xs font-mono"
          >
            DEL
          </button>
        </div>

        {/* Demo Unlock */}
        <button
          onClick={() => verifyPin('1234')}
          className="w-full py-2 rounded bg-[#161616] text-[#a0a0a0] border border-[#262626] text-xs font-mono hover:text-[#f2f2f2] transition-colors flex items-center justify-center gap-1.5"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>DEMO UNLOCK (PIN: 1234)</span>
        </button>
      </div>
    </div>
  );
};
