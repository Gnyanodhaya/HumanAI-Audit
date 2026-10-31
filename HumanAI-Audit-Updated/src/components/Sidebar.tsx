/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  SpellCheck,
  AlignLeft,
  Repeat,
  Search,
  Download,
  UploadCloud,
  FileBox,
  Sliders,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  LogOut,
  LogIn,
  X
} from 'lucide-react';
import { extractTextFromFile } from '../utils/fileExtractors.ts';
import { AppUser } from '../types/auth.ts';

export type ActiveTab = 'overview' | 'vocabulary' | 'readability' | 'sentences' | 'repetition' | 'inspector' | 'export';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLoadText: (text: string, source: 'file_upload' | 'raw_text', fileName?: string) => void;
  rawTextLength: number;
  wordCount: number;
  fileName?: string;
  targetAudience: string;
  onTargetAudienceChange: (audience: string) => void;
  user: AppUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onLoadText,
  rawTextLength,
  wordCount,
  fileName,
  targetAudience,
  onTargetAudienceChange,
  user,
  onOpenAuth,
  onLogout,
  onOpenHistory,
  historyCount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Executive Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'vocabulary', label: 'Vocabulary & Lexicon', icon: <SpellCheck className="w-4 h-4" /> },
    { id: 'readability', label: 'Readability Metrics', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'sentences', label: 'Sentence & Cadence', icon: <AlignLeft className="w-4 h-4" /> },
    { id: 'repetition', label: 'Repetition & Clichés', icon: <Repeat className="w-4 h-4" /> },
    { id: 'inspector', label: 'Document Inspector', icon: <Search className="w-4 h-4" /> },
    { id: 'export', label: 'Export & Diagnostics', icon: <Download className="w-4 h-4" /> },
  ];

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const result = await extractTextFromFile(file);
      onLoadText(result.text, 'file_upload', result.fileName);
      setUploadSuccess(`Loaded ${result.fileName}`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      setUploadError(err?.message || 'Error processing file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <>
      {/* Backdrop for all screen sizes when menu is open */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Slide-out Menu Bar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 w-80 max-w-[88vw] border-r border-slate-800 bg-slate-900 h-screen flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-5">
          {/* Top Brand & Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xs font-bold text-sm">
                HA
              </div>
              <div className="leading-tight">
                <span className="font-bold text-sm text-slate-100 block">
                  HumanAI Audit
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Streamlit Edition</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Analysis Views (7 modules) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
              <span>Analysis Views</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                7 modules
              </span>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 2. Audit Work History */}
          <div className="pt-1">
            <button
              onClick={() => {
                onOpenHistory();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-blue-900/60 bg-blue-950/40 hover:bg-blue-900/50 text-blue-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Audit Work History</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold">
                {historyCount}
              </span>
            </button>
          </div>

          {/* 3. Document Ingestion (txt, pdf, docx) */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
              <span>Document Ingestion</span>
              <span className="text-[10px] font-mono text-slate-400">txt, pdf, docx</span>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-950/40'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-850/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="sidebar-file-upload-input"
              />
              <label
                htmlFor="sidebar-file-upload-input"
                className="flex flex-col items-center justify-center cursor-pointer space-y-1.5"
              >
                <div className="w-8 h-8 rounded-full bg-blue-950/80 text-blue-400 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  {isUploading ? 'Extracting text...' : 'Upload Document'}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Drop .txt, .pdf, or .docx file here or browse
                </p>
              </label>
            </div>

            {/* 4. Active Draft / Document pill */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-950/40 border border-blue-900/60 text-xs text-blue-300">
              <FileBox className="w-4 h-4 shrink-0 text-blue-400" />
              <span className="truncate font-mono font-medium">
                {fileName || 'AI Synthetic Characteristic Draft'}
              </span>
            </div>

            {uploadError && (
              <div className="flex items-start gap-1.5 p-2 rounded-lg bg-rose-950/40 border border-rose-900/50 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-xs text-emerald-300">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>

          {/* 5. Audit Parameters */}
          <div className="border border-slate-800 rounded-xl bg-slate-850/50 overflow-hidden">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Audit Parameters</span>
              </div>
              {isSettingsOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {isSettingsOpen && (
              <div className="p-3 border-t border-slate-800 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => onTargetAudienceChange(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 outline-none text-xs cursor-pointer"
                  >
                    <option value="general">General Public (Grade 7 - 9)</option>
                    <option value="academic">Scholarly / Academic (Grade 13+)</option>
                    <option value="business">Business Executive (Grade 10 - 12)</option>
                    <option value="technical">Technical / Engineering</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. Sign In / Register (or User Profile) */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                aria-label="Log out user account"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Doc: {wordCount}w / {rawTextLength}c</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Ready
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
