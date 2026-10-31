/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SpellCheck, Filter, Search, BarChart2, Layers } from 'lucide-react';
import { AuditReport } from '../../types/audit.ts';
import { MetricCard } from '../MetricCard.tsx';

interface VocabularyTabProps {
  report: AuditReport;
}

export const VocabularyTab: React.FC<VocabularyTabProps> = ({ report }) => {
  const { vocabulary, wordStats } = report;
  const [searchTerm, setSearchTerm] = useState('');
  const [hideStopwords, setHideStopwords] = useState(false);

  // Filter frequency distribution
  const filteredWords = vocabulary.frequencyDistribution.filter(item => {
    if (hideStopwords && item.isStopword) return false;
    if (searchTerm && !item.word.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Type-Token Ratio (TTR)"
          value={vocabulary.typeTokenRatio}
          help="V / N (Unique words divided by total words). Higher indicates diverse vocabulary."
          sublabel={`Unique words: ${wordStats.uniqueWords}`}
        />
        <MetricCard
          label="Root TTR (Guiraud)"
          value={vocabulary.rootTTR}
          help="V / sqrt(N). Corrects for text length bias."
          sublabel="Length-independent diversity"
        />
        <MetricCard
          label="Hapax Legomena"
          value={vocabulary.hapaxLegomenaCount}
          help="Words that appear exactly once in the entire text."
          sublabel={`${vocabulary.hapaxPercentage}% of unique words`}
        />
        <MetricCard
          label="Lexical Density"
          value={`${vocabulary.lexicalDensity}%`}
          help="Content words (nouns, verbs, adjectives) vs functional words (stopwords)."
          sublabel={`${vocabulary.stopwordPercentage}% stopwords`}
        />
      </div>

      {/* Length and Syllable distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Word Length Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            Word Length Distribution
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Short (1-3 chars)', count: wordStats.lengthDistribution.short, pct: (wordStats.lengthDistribution.short / wordStats.totalWords) * 100, color: 'bg-cyan-500' },
              { label: 'Medium (4-6 chars)', count: wordStats.lengthDistribution.medium, pct: (wordStats.lengthDistribution.medium / wordStats.totalWords) * 100, color: 'bg-blue-500' },
              { label: 'Long (7-9 chars)', count: wordStats.lengthDistribution.long, pct: (wordStats.lengthDistribution.long / wordStats.totalWords) * 100, color: 'bg-indigo-500' },
              { label: 'Very Long (10+ chars)', count: wordStats.lengthDistribution.veryLong, pct: (wordStats.lengthDistribution.veryLong / wordStats.totalWords) * 100, color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {item.count} words ({item.pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Average Word Length:</span>
            <strong className="text-slate-900 dark:text-slate-100">{wordStats.averageWordLength} characters</strong>
          </div>
        </div>

        {/* Syllable Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Syllable Composition
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Monosyllabic (1 syllable)', count: wordStats.monosyllabicWords, pct: (wordStats.monosyllabicWords / wordStats.totalWords) * 100, color: 'bg-emerald-500' },
              { label: 'Disyllabic (2 syllables)', count: wordStats.disyllabicWords, pct: (wordStats.disyllabicWords / wordStats.totalWords) * 100, color: 'bg-teal-500' },
              { label: 'Polysyllabic (3+ syllables)', count: wordStats.polysyllabicWords, pct: (wordStats.polysyllabicWords / wordStats.totalWords) * 100, color: 'bg-amber-500' },
              { label: 'Complex Words (Readability standard)', count: wordStats.complexWords, pct: wordStats.complexWordsPercentage, color: 'bg-rose-500' },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {item.count} words ({item.pct.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Average Syllables / Word:</span>
            <strong className="text-slate-900 dark:text-slate-100">{wordStats.averageSyllablesPerWord}</strong>
          </div>
        </div>
      </div>

      {/* Longest Words Pill Bar */}
      {wordStats.longestWords.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Most Complex / Longest Words Found
          </h3>
          <div className="flex flex-wrap gap-2">
            {wordStats.longestWords.map(item => (
              <span
                key={item.word}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
              >
                <strong className="text-blue-600 dark:text-blue-400">{item.word}</strong>
                <span className="text-slate-400 text-[10px]">({item.length} chars, {item.syllables} syl, x{item.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Frequency Dataframe / Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <SpellCheck className="w-4 h-4 text-blue-600" />
            Lexical Frequency Spectrum ({filteredWords.length} terms shown)
          </h3>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={hideStopwords}
                onChange={(e) => setHideStopwords(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Hide Stopwords
            </label>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search word..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none w-36 focus:w-48 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto max-h-96 border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Word</th>
                <th className="p-3 text-right">Count</th>
                <th className="p-3 text-right">Frequency</th>
                <th className="p-3 text-center">Syllables</th>
                <th className="p-3 text-center">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredWords.slice(0, 50).map((row, idx) => (
                <tr key={row.word} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-slate-400">#{idx + 1}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 font-sans">
                    {row.word}
                  </td>
                  <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-bold">
                    {row.count}
                  </td>
                  <td className="p-3 text-right text-slate-500 dark:text-slate-400">
                    {row.frequency}%
                  </td>
                  <td className="p-3 text-center text-slate-600 dark:text-slate-300">
                    {row.syllables}
                  </td>
                  <td className="p-3 text-center">
                    {row.isStopword ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Stopword
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">
                        Content
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
