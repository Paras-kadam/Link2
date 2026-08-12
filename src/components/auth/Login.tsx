import React, { useState } from 'react';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Login: React.FC = () => {
  const { handleLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await handleLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen h-dvh w-screen bg-[#050505] text-[#f2f2f2] font-mono items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Terminal Header */}
        <div className="w-16 h-16 bg-[#0A0A0A] border border-[#1C1C1C] rounded flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-[#f2f2f2]" />
        </div>

        <h1 className="text-xl font-bold tracking-widest uppercase mb-1">
          Link2 // Private
        </h1>
        <p className="text-xs text-[#666666] mb-8 text-center">
          AUTHORIZED PERSONNEL ONLY
        </p>

        <form onSubmit={onSubmit} className="w-full space-y-4">
          {error && (
            <div className="p-3 bg-rose-900/10 border border-rose-500/30 text-rose-400 text-xs text-center rounded">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-[#666666] uppercase tracking-widest pl-1">
              Email Identifier
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded p-3 text-sm focus:outline-none focus:border-[#f2f2f2] transition-colors disabled:opacity-50"
              placeholder="user@link2.private"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-[#666666] uppercase tracking-widest pl-1">
              Access Code
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded p-3 text-sm focus:outline-none focus:border-[#f2f2f2] transition-colors disabled:opacity-50"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1C1C1C] hover:bg-[#262626] border border-[#262626] text-[#f2f2f2] font-bold text-xs tracking-widest uppercase py-3.5 rounded mt-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {loading ? 'AUTHENTICATING...' : 'ESTABLISH CONNECTION'}
          </button>
        </form>

        <div className="mt-8 text-[10px] text-[#404040] text-center max-w-[250px]">
          By connecting, you agree to the end-to-end encrypted protocol standards. Unauthorized access will be terminated.
        </div>
      </div>
    </div>
  );
};
