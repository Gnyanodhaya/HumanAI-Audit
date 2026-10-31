/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  ClipboardPaste,
  Sliders,
  History,
  Lock,
  UploadCloud,
  FileBox,
  AlertCircle,
  Check,
  FileCheck
} from 'lucide-react';
import { Sidebar, ActiveTab } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { OverviewTab } from './components/Tabs/OverviewTab.tsx';
import { VocabularyTab } from './components/Tabs/VocabularyTab.tsx';
import { ReadabilityTab } from './components/Tabs/ReadabilityTab.tsx';
import { SentenceTab } from './components/Tabs/SentenceTab.tsx';
import { RepetitionTab } from './components/Tabs/RepetitionTab.tsx';
import { InspectorTab } from './components/Tabs/InspectorTab.tsx';
import { ExportTab } from './components/Tabs/ExportTab.tsx';
import { SAMPLE_TEXTS, SampleTextItem } from './data/sampleTexts.ts';
import { runAudit } from './nlp/auditEngine.ts';
import { AuditReport } from './types/audit.ts';
import { AppUser, AuditHistoryRecord } from './types/auth.ts';
import { extractTextFromFile } from './utils/fileExtractors.ts';
import {
  clearAllUserHistory,
  deleteHistoryRecord,
  getCurrentUser,
  getUserHistory,
  logoutUser,
  recordAuditInHistory
} from './utils/storage.ts';

export default function App() {
  // User state
  const [user, setUser] = useState<AppUser | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historyList, setHistoryList] = useState<AuditHistoryRecord[]>(() => {
    const activeEmail = user?.email || 'default@humanai.internal';
    return getUserHistory(activeEmail);
  });

  // Responsive sidebar menu state (3 lines menu bar toggle)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Input & Audit state
  const [rawText, setRawText] = useState<string>(SAMPLE_TEXTS[0].text);
  const [fileName, setFileName] = useState<string | undefined>(SAMPLE_TEXTS[0].title);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [targetAudience, setTargetAudience] = useState<string>('general');
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(true);

  // Home Page File Ingestion state
  const homeFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Permanently enforce dark mode on document element
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Sync history list when user changes
  useEffect(() => {
    const activeEmail = user?.email || 'default@humanai.internal';
    setHistoryList(getUserHistory(activeEmail));
  }, [user]);

  // Compute report deterministically
  const report: AuditReport = useMemo(() => {
    return runAudit(rawText, {
      sourceType: fileName ? 'file_upload' : 'raw_text',
      fileName
    });
  }, [rawText, fileName]);

  // Automatically record meaningful audit in history (debounced or on change)
  useEffect(() => {
    if (rawText.trim().length > 30 && report.wordStats.totalWords >= 5) {
      const activeEmail = user?.email || 'default@humanai.internal';
      const record = recordAuditInHistory(activeEmail, report);
      setHistoryList(getUserHistory(activeEmail));
    }
  }, [rawText, fileName, user]);

  const handleSelectSample = (sample: SampleTextItem) => {
    setRawText(sample.text);
    setFileName(`${sample.title} (${sample.category})`);
  };

  const handleClear = () => {
    setRawText('');
    setFileName(undefined);
  };

  const handleLoadText = (text: string, source: 'file_upload' | 'raw_text', loadedFileName?: string) => {
    setRawText(text);
    setFileName(loadedFileName);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText(text);
        setFileName(undefined);
      }
    } catch {
      // Clipboard denied or unsupported
    }
  };

  const handleLoginSuccess = (authenticatedUser: AppUser) => {
    setUser(authenticatedUser);
    setHistoryList(getUserHistory(authenticatedUser.email));
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setHistoryList(getUserHistory('default@humanai.internal'));
  };

  const handleLoadHistoricalAudit = (record: AuditHistoryRecord) => {
    setRawText(record.rawText);
    setFileName(record.title);
  };

  const handleDeleteHistoryRecord = (id: string) => {
    const activeEmail = user?.email || 'default@humanai.internal';
    const updated = deleteHistoryRecord(activeEmail, id);
    setHistoryList(updated);
  };

  const handleClearAllHistory = () => {
    const activeEmail = user?.email || 'default@humanai.internal';
    clearAllUserHistory(activeEmail);
    setHistoryList([]);
  };

  const handleHomeFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const result = await extractTextFromFile(file);
      setRawText(result.text);
      setFileName(result.fileName);
      setUploadSuccess(`Extracted ${result.fileName} (${result.fileType})`);
      setTimeout(() => setUploadSuccess(null), 5000);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to extract text from document');
    } finally {
      setIsUploading(false);
      if (homeFileInputRef.current) homeFileInputRef.current.value = '';
    }
  };

  const handleHomeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleHomeFileUpload(file);
    }
  };

  const handleHomeDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleHomeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleHomeFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex transition-colors">
      {/* Streamlit-style Sidebar with 3-lines menu support */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLoadText={handleLoadText}
        rawTextLength={rawText.length}
        wordCount={report.wordStats.totalWords}
        fileName={fileName}
        targetAudience={targetAudience}
        onTargetAudienceChange={setTargetAudience}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        historyCount={historyList.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          report={report}
          rawText={rawText}
          onSelectSample={handleSelectSample}
          onClear={handleClear}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenHistory={() => setIsHistoryDrawerOpen(true)}
          historyCount={historyList.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
          {/* Home Page Document Ingestion Card (Available on Every Device) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>Upload Document for Linguistic Analysis</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/80">
                      All Devices
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Supports Microsoft Word (.docx), Adobe PDF (.pdf), and Plain Text (.txt, .md)
                  </p>
                </div>
              </div>

              {fileName && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-xs text-blue-300 font-mono truncate max-w-xs self-start sm:self-auto">
                  <FileCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{fileName}</span>
                </div>
              )}
            </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleHomeDrag}
              onDragLeave={handleHomeDrag}
              onDragOver={handleHomeDrag}
              onDrop={handleHomeDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-950/40'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-850/50'
              }`}
            >
              <input
                ref={homeFileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={handleHomeFileChange}
                className="hidden"
                id="home-page-file-upload-input"
              />
              <label
                htmlFor="home-page-file-upload-input"
                className="flex flex-col sm:flex-row items-center justify-center gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-blue-950 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800/60">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs sm:text-sm font-semibold text-slate-200">
                    {isUploading ? 'Extracting document text...' : 'Drop .txt, .pdf, or .docx file here or browse'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Instantly extracts text and updates all 7 linguistic audit modules
                  </div>
                </div>
                <span className="mt-1 sm:mt-0 sm:ml-auto px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0">
                  Browse Files
                </span>
              </label>
            </div>

            {uploadError && (
              <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-xs text-emerald-300">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>

          {/* Collapsible Input & Ingestion Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 truncate">
                  Manuscript Input
                </span>
                {fileName && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800 truncate max-w-[200px]">
                    {fileName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePaste}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </button>
                <button
                  onClick={() => setIsInputExpanded(!isInputExpanded)}
                  className="text-xs text-blue-400 font-medium hover:underline cursor-pointer"
                >
                  {isInputExpanded ? 'Collapse' : 'Expand Editor'}
                </button>
              </div>
            </div>

            {isInputExpanded && (
              <div className="p-4 space-y-3">
                <textarea
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    if (fileName) setFileName(undefined);
                  }}
                  placeholder="Paste or type your draft, essay, or research manuscript here for comprehensive linguistic audit..."
                  rows={5}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 font-sans resize-y transition-all"
                />

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[11px]">
                    <span><strong>{report.wordStats.totalWords}</strong> words</span>
                    <span>•</span>
                    <span><strong>{report.wordStats.totalCharactersWithSpaces}</strong> chars</span>
                    <span>•</span>
                    <span><strong>{report.sentences.totalSentences}</strong> sentences</span>
                    <span>•</span>
                    <span><strong>{report.paragraphs.totalParagraphs}</strong> paragraphs</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      ⚡ Dynamic real-time calculation
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation Alert for empty text */}
          {rawText.trim().length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Awaiting Manuscript Input
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Type or paste text above, upload a document (.txt, .pdf, .docx), or load one of our calibrated benchmarks to begin the linguistic audit.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {SAMPLE_TEXTS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSample(s)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Load {s.title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Tab Views */
            <div className="space-y-6">
              {activeTab === 'overview' && <OverviewTab report={report} />}
              {activeTab === 'vocabulary' && <VocabularyTab report={report} />}
              {activeTab === 'readability' && <ReadabilityTab report={report} />}
              {activeTab === 'sentences' && <SentenceTab report={report} />}
              {activeTab === 'repetition' && <RepetitionTab report={report} />}
              {activeTab === 'inspector' && <InspectorTab report={report} />}
              {activeTab === 'export' && <ExportTab report={report} userEmail={user?.email} />}
            </div>
          )}
        </main>
      </div>

      {/* Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* History Slide-out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        userEmail={user?.email || 'Guest Session'}
        history={historyList}
        onLoadAudit={handleLoadHistoricalAudit}
        onDeleteRecord={handleDeleteHistoryRecord}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
}
