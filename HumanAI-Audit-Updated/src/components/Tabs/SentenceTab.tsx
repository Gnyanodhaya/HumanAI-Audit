/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlignLeft, Activity, AlertTriangle, ArrowUpDown, Search } from 'lucide-react';
import { AuditReport } from '../../types/audit.ts';
import { MetricCard } from '../MetricCard.tsx';

interface SentenceTabProps {
  report: AuditReport;
}

export const SentenceTab: React.FC<SentenceTabProps> = ({ report }) => {
  const { sentences, sentenceList } = report;
  const [filterType, setFilterType] = useState<'all' | 'short' | 'long' | 'complex'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSentences = sentenceList.filter(s => {
    if (filterType === 'short' && !s.isVeryShort) return false;
    if (filterType === 'long' && !s.isVeryLong) return false;
    if (filterType === 'complex' && s.complexWordCount < 2) return false;
    if (searchQuery && !s.raw.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Avg Sentence Length"
          value={sentences.averageSentenceLength}
          help="Mean words per sentence. 15-20 words is standard for modern readable prose."
          sublabel={`Median: ${sentences.medianSentenceLength} words`}
        />
        <MetricCard
          label="Burstiness (CV)"
          value={sentences.coefficientOfVariation}
          help="StdDev / Mean. Human writing has varied sentence lengths (0.45-0.80). AI output is often uniform (<0.30)."
          variant={sentences.coefficientOfVariation >= 0.40 ? 'success' : 'warning'}
          sublabel={`StdDev: ${sentences.sentenceLengthStdDev} words`}
        />
        <MetricCard
          label="Shortest Sentence"
          value={sentences.minSentenceLength}
          help="Word count of the shortest sentence"
          sublabel={sentences.shortestSentence ? `"${sentences.shortestSentence.raw.slice(0, 25)}..."` : ''}
        />
        <MetricCard
          label="Longest Sentence"
          value={sentences.maxSentenceLength}
          help="Word count of the longest sentence"
          sublabel={sentences.longestSentence ? `"${sentences.longestSentence.raw.slice(0, 25)}..."` : ''}
        />
      </div>

      {/* Cadence & Burstiness Explainer + Length Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Length Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-blue-600" />
            Sentence Length Distribution
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Very Short (< 10 words)', count: sentences.sentenceLengthDistribution.short, color: 'bg-emerald-500', desc: 'Punchy, emphasis statements' },
              { label: 'Medium (10 - 20 words)', count: sentences.sentenceLengthDistribution.medium, color: 'bg-blue-500', desc: 'Standard readable narrative' },
              { label: 'Long (21 - 35 words)', count: sentences.sentenceLengthDistribution.long, color: 'bg-amber-500', desc: 'Complex compound thoughts' },
              { label: 'Very Long (> 35 words)', count: sentences.sentenceLengthDistribution.veryLong, color: 'bg-rose-500', desc: 'Potentially fatiguing for readers' },
            ].map(item => {
              const pct = sentences.totalSentences > 0 ? (item.count / sentences.totalSentences) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {item.count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentence Starters Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Sentence Starter Variety
          </h3>

          <div className="space-y-2.5">
            {Object.entries(sentences.starterTypeDistribution).map(([type, count]) => {
              const pct = (count / sentences.totalSentences) * 100;
              return (
                <div key={type} className="flex items-center justify-between text-xs">
                  <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{type} openers</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] w-12 text-right">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Repetitive consecutive openers warning */}
          {sentences.repetitiveConsecutiveStarters.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Repetitive Consecutive Openers:</strong>
                  {sentences.repetitiveConsecutiveStarters.map((r, i) => (
                    <span key={i} className="block mt-0.5">
                      Word <em>"{r.starter}"</em> opens sentences {r.sentenceIndices.join(', ')} in a row.
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sentence Inspector Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sentence-by-Sentence Breakdown ({filteredSentences.length} of {sentenceList.length})
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filterType === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('short')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filterType === 'short' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Short (&lt;8)
              </button>
              <button
                onClick={() => setFilterType('long')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filterType === 'long' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Long (&gt;32)
              </button>
              <button
                onClick={() => setFilterType('complex')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filterType === 'complex' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Complex
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search sentence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none w-36 focus:w-48 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {filteredSentences.map(s => (
            <div
              key={s.index}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800/80 bg-slate-50/50 dark:bg-slate-800/30 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">#{s.index}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded font-sans font-medium text-[10px] ${
                    s.isVeryLong
                      ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                      : s.isVeryShort
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {s.wordCount} words
                  </span>
                  <span>{s.syllableCount} syllables</span>
                  <span>Ease: {s.readingEaseScore}/100</span>
                </div>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {s.raw}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
