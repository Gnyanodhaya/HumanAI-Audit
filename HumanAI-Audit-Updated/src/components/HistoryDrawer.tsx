/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, Clock, FileText, ArrowRight, AlertTriangle, Check, BookOpen, Layers } from 'lucide-react';
import { AuditHistoryRecord } from '../types/auth.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  history: AuditHistoryRecord[];
  onLoadAudit: (record: AuditHistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  userEmail,
  history,
  onLoadAudit,
  onDeleteRecord,
  onClearAll
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="history-drawer-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Audit Work History
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Logged in as <strong className="text-slate-700 dark:text-slate-300">{userEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && !confirmClear && (
              <button
                onClick={() => setConfirmClear(true)}
                className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
                title="Clear all saved history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close history drawer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clear confirmation alert */}
        {confirmClear && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Permanently delete all {history.length} audit records?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold text-[11px]"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List of history records */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No Audit History Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  Whenever you analyze or type a manuscript, your audits will be automatically recorded here.
                </p>
              </div>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/70 bg-slate-50/60 dark:bg-slate-800/40 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Score: {item.overallScore} ({item.grade})
                    </span>
                    <button
                      onClick={() => onDeleteRecord(item.id)}
                      aria-label={`Delete audit ${item.title}`}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed italic">
                  "{item.snippet}"
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 font-mono">
                    <span>{item.wordCount} words</span>
                    <span>•</span>
                    <span>{item.sentenceCount} sent</span>
                    <span>•</span>
                    <span>CV: {item.burstinessCV}</span>
                  </div>

                  <button
                    onClick={() => {
                      onLoadAudit(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Load Audit
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{history.length} audit records stored</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
