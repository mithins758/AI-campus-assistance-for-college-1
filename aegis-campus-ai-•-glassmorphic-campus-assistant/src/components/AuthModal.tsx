import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { loginUser, registerUser, fetchMe, BackendUser } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (user: BackendUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuth }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [department, setDepartment] = useState('BCA');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        const data = await loginUser({ email, password });
        onAuth(data.data.user as BackendUser);
      } else {
        await registerUser({ name, email, password, role, department });
        // Auto-login after registration for a smooth demo flow.
        const data = await loginUser({ email, password });
        onAuth(data.data.user as BackendUser);
      }
      onClose();
    } catch (err: any) {
      // No backend running? Surface a helpful hint instead of a raw error.
      const msg = err?.message || 'Authentication failed';
      setError(
        /fetch|network|unavailable|502/i.test(msg)
          ? `${msg}. Is the backend running on http://localhost:5000?`
          : msg
      );
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/20 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {mode === 'login' ? (
              <LogIn className="w-4 h-4 text-cyan-400" />
            ) : (
              <UserPlus className="w-4 h-4 text-cyan-400" />
            )}
            {mode === 'login' ? 'Sign in to Campus AI' : 'Create campus account'}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex p-0.5 rounded-xl bg-slate-950/70 border border-white/10 mb-4">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === m ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40' : 'text-slate-400'
              }`}
            >
              {m === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-2.5 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              className={inputCls}
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            className={inputCls}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            type="password"
            required
            minLength={8}
            className={inputCls}
          />
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'faculty')}
                className={inputCls}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department"
                className={inputCls}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-sm font-semibold text-white shadow-md disabled:opacity-50 transition-all"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register & sign in'}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-slate-500 text-center">
          Demo accounts (password <span className="font-mono text-slate-400">Password123!</span>):{' '}
          <span className="font-mono">mithin@example.com</span> ·{' '}
          <span className="font-mono">smith@campus.edu</span>
        </p>
      </div>
    </div>
  );
};

// Re-export for callers that restore a session from a stored token.
export { fetchMe };
