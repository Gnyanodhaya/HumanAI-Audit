/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { AppUser } from '../types/auth.ts';
import { authenticateUser } from '../utils/storage.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide an email ID.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid email format (e.g., analyst@institution.edu).');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    // Authenticate with no limits
    const user = authenticateUser(cleanEmail, password);
    onLoginSuccess(user);
    onClose();
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    const user = authenticateUser(demoEmail, 'password123');
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Sign In to HumanAI Audit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Log in with your email and password with no limits to automatically record your audit history and access your work.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoFocus
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Enter password (no restrictions)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue / Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 text-center mb-2">
            Or quick sign-in as:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('editor@journal.org')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              editor@journal.org
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('analyst@research.ai')}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              analyst@research.ai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
