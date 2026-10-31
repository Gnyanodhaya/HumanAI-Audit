/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Menu,
  Sparkles,
  Trash2,
  Clock,
  LogIn,
  LayoutDashboard,
  SpellCheck,
  BookOpen,
  AlignLeft,
  Repeat,
  Search,
  Download
} from 'lucide-react';
import { SAMPLE_TEXTS, SampleTextItem } from '../data/sampleTexts.ts';
import { AuditReport } from '../types/audit.ts';
import { AppUser } from '../types/auth.ts';
import { ActiveTab } from './Sidebar.tsx';

interface HeaderProps {
  onToggleSidebar: () => void;
  report: AuditReport | null;
  rawText: string;
  onSelectSample: (sample: SampleTextItem) => void;
  onClear: () => void;
  user: AppUser | null;
  onOpenAuth: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  report,
  rawText,
  onSelectSample,
  onClear,
  user,
  onOpenAuth,
  onOpenHistory,
  historyCount,
  activeTab,
  onTabChange
}) => {
  const mobileNavTabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'vocabulary', label: 'Vocabulary', icon: <SpellCheck className="w-3.5 h-3.5" /> },
    { id: 'readability', label: 'Readability', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'sentences', label: 'Sentences', icon: <AlignLeft className="w-3.5 h-3.5" /> },
    { id: 'repetition', label: 'Repetition', icon: <Repeat className="w-3.5 h-3.5" /> },
    { id: 'inspector', label: 'Inspector', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'export', label: 'Export & PDF', icon: <Download className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md transition-colors">
      {/* Top Primary Bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 3-lines Menu Bar button (Hamburger) - prominent with clear label */}
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-colors focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
            title="Toggle Menu (3 lines)"
          >
            <Menu className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-200">Menu</span>
          </button>

          {/* App Identity */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xs font-bold text-xs">
              HA
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
                <span>HumanAI Audit</span>
                <span className="hidden md:inline-block text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                  Linguistic Suite
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Draft selector for tablet/desktop */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700">
            <span className="text-xs text-slate-400 px-1.5 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Drafts:</span>
            </span>
            <select
              aria-label="Load a benchmark sample draft"
              className="text-xs bg-slate-900 text-slate-200 py-1 px-2 rounded-md border border-slate-700 outline-none font-medium cursor-pointer"
              onChange={(e) => {
                const sample = SAMPLE_TEXTS.find(s => s.id === e.target.value);
                if (sample) onSelectSample(sample);
                e.target.value = '';
              }}
              defaultValue=""
            >
              <option value="" disabled>Load sample...</option>
              {SAMPLE_TEXTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            aria-label={`Open work history (${historyCount} saved)`}
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-slate-700 bg-slate-800/70 text-xs font-medium text-slate-200 hover:bg-slate-750 transition-colors cursor-pointer"
            title="View saved audit history"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-300 text-[10px] font-mono font-bold border border-blue-800/60">
              {historyCount}
            </span>
          </button>

          {/* User Account / Sign In */}
          {user ? (
            <button
              onClick={onOpenAuth}
              aria-label="Account details"
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-blue-900/60 bg-blue-950/40 text-xs font-semibold text-blue-300 hover:bg-blue-900/60 transition-colors max-w-[130px] truncate cursor-pointer"
              title={`Logged in as ${user.email}`}
            >
              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <span className="truncate">{user.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              aria-label="Sign in"
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Clear text button */}
          {rawText.length > 0 && (
            <button
              onClick={onClear}
              aria-label="Clear current manuscript text"
              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer"
              title="Clear text"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile-Sized Secondary Menu Bar (Horizontal Scrollable Tabs) */}
      <div className="lg:hidden flex items-center overflow-x-auto px-2 py-1.5 border-t border-slate-800/80 bg-slate-900/80 scrollbar-none gap-1">
        {mobileNavTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
