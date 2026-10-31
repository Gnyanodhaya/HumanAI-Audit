/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Repeat, AlertCircle, Copy, Sparkles, ShieldAlert } from 'lucide-react';
import { AuditReport } from '../../types/audit.ts';
import { MetricCard } from '../MetricCard.tsx';

interface RepetitionTabProps {
  report: AuditReport;
}

export const RepetitionTab: React.FC<RepetitionTabProps> = ({ report }) => {
  const { repetition } = report;
  const [ngramTab, setNgramTab] = useState<'trigrams' | 'bigrams' | 'fourgrams'>('trigrams');

  const activeNgrams = ngramTab === 'trigrams'
    ? repetition.repeatedTrigrams
    : ngramTab === 'bigrams'
    ? repetition.repeatedBigrams
    : repetition.repeatedFourgrams;

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Repetition Index"
          value={repetition.repetitionIndex}
          help="Composite score 0-100 measuring phrase duplication, cliché density, and starter repetition. Lower is cleaner."
          variant={repetition.repetitionIndex > 40 ? 'warning' : 'default'}
          sublabel={repetition.repetitionIndex <= 25 ? 'Low repetition' : 'Elevated redundancy'}
        />
        <MetricCard
          label="AI Clichés & Fillers"
          value={repetition.clicheAndFillerHits.length}
          help="Stock phrases frequently overrepresented in synthetic LLM drafts."
          sublabel={`${repetition.clicheAndFillerHits.reduce((a, b) => a + b.count, 0)} total instances`}
        />
        <MetricCard
          label="Repeated Trigrams"
          value={repetition.repeatedTrigrams.length}
          help="3-word phrases occurring 2 or more times"
          sublabel="Multi-word repetition"
        />
        <MetricCard
          label="Duplicate Sentences"
          value={repetition.duplicateSentences.length}
          help="Sentences repeated across the document"
          sublabel={repetition.duplicateSentences.length === 0 ? 'None detected' : 'Requires consolidation'}
        />
      </div>

      {/* Cliché & Stock Filler Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Overused Clichés & Filler Phrases ({repetition.clicheAndFillerHits.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifies hallmarks commonly flagged in synthetic text and verbose corporate prose.
            </p>
          </div>
        </div>

        {repetition.clicheAndFillerHits.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-center text-xs text-emerald-800 dark:text-emerald-300">
            ✓ Clean draft: No recognized synthetic stock clichés or bloated filler phrases detected!
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="p-3">Detected Phrase</th>
                  <th className="p-3 text-center">Category</th>
                  <th className="p-3 text-center">Hits</th>
                  <th className="p-3">Stylistic Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {repetition.clicheAndFillerHits.map((hit, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-rose-700 dark:text-rose-400 font-mono">
                      "{hit.phrase}"
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {hit.category}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {hit.count}x
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {hit.suggestion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Repeated N-Grams Explorer */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-blue-600" />
              Repeated Phrase N-Grams
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Recurring multi-word combinations occurring 2+ times in the text.
            </p>
          </div>

          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setNgramTab('bigrams')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${ngramTab === 'bigrams' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Bigrams (2-word)
            </button>
            <button
              onClick={() => setNgramTab('trigrams')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${ngramTab === 'trigrams' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Trigrams (3-word)
            </button>
            <button
              onClick={() => setNgramTab('fourgrams')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${ngramTab === 'fourgrams' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              4-grams
            </button>
          </div>
        </div>

        {activeNgrams.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No repeated {ngramTab} meeting frequency threshold.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {activeNgrams.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs font-mono"
              >
                <span className="truncate text-slate-800 dark:text-slate-200 font-medium">"{item.phrase}"</span>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold ml-2">
                  {item.count}x
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duplicate Sentences */}
      {repetition.duplicateSentences.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Duplicate Sentences Found ({repetition.duplicateSentences.length})
          </h3>
          <div className="space-y-2 text-xs">
            {repetition.duplicateSentences.map((dup, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <div className="font-semibold text-rose-900 dark:text-rose-200 mb-1">
                  Occurs {dup.count} times (Sentences #{dup.indices.join(', #')}):
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic">"{dup.sentence}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
