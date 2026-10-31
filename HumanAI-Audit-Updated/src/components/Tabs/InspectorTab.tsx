/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Eye, Filter, Sparkles, AlertTriangle } from 'lucide-react';
import { AuditReport, SentenceInfo } from '../../types/audit.ts';

interface InspectorTabProps {
  report: AuditReport;
}

export const InspectorTab: React.FC<InspectorTabProps> = ({ report }) => {
  const { sentenceList, repetition, paragraphs } = report;
  const [highlightLong, setHighlightLong] = useState(true);
  const [highlightShort, setHighlightShort] = useState(true);
  const [highlightCliches, setHighlightCliches] = useState(true);
  const [highlightComplex, setHighlightComplex] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<SentenceInfo | null>(null);

  // Extract set of cliche phrases for quick highlighting
  const clichePhrases = repetition.clicheAndFillerHits.map(c => c.phrase.toLowerCase());

  // Function to render sentence content with optional internal word highlighting
  const renderSentenceText = (sentence: SentenceInfo) => {
    let text = sentence.raw;

    // Check if sentence is very long or very short
    let containerClass = 'cursor-pointer transition-colors px-1 py-0.5 rounded ';
    if (selectedSentence?.index === sentence.index) {
      containerClass += 'bg-blue-100 dark:bg-blue-900/60 ring-2 ring-blue-500 ';
    } else if (highlightLong && sentence.isVeryLong) {
      containerClass += 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 border-b-2 border-rose-400 ';
    } else if (highlightShort && sentence.isVeryShort) {
      containerClass += 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border-b-2 border-emerald-400 ';
    } else {
      containerClass += 'hover:bg-slate-100 dark:hover:bg-slate-800 ';
    }

    return (
      <span
        key={sentence.index}
        onClick={() => setSelectedSentence(sentence)}
        className={containerClass}
        title={`Sentence #${sentence.index} (${sentence.wordCount} words, ease: ${sentence.readingEaseScore})`}
      >
        {text}{' '}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls & Legend */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Interactive Visual Annotations
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={highlightLong}
              onChange={(e) => setHighlightLong(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-medium text-[11px]">
              Long Sentences (&gt;32w)
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={highlightShort}
              onChange={(e) => setHighlightShort(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium text-[11px]">
              Punchy Sentences (&lt;8w)
            </span>
          </label>
        </div>
      </div>

      {/* Sentence Rhythm Minimap */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sentence Rhythm & Pacing Timeline (Document Flow)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {sentenceList.length} sentences
          </span>
        </div>

        <div className="h-16 flex items-end gap-1 overflow-x-auto pb-1 pt-2 px-1 border-b border-slate-100 dark:border-slate-800">
          {sentenceList.map(s => {
            const heightPct = Math.min(100, Math.max(15, (s.wordCount / 40) * 100));
            const isSelected = selectedSentence?.index === s.index;

            let barColor = 'bg-blue-400 dark:bg-blue-600 hover:bg-blue-500';
            if (s.isVeryLong) barColor = 'bg-rose-400 dark:bg-rose-600 hover:bg-rose-500';
            else if (s.isVeryShort) barColor = 'bg-emerald-400 dark:bg-emerald-600 hover:bg-emerald-500';

            return (
              <button
                key={s.index}
                onClick={() => setSelectedSentence(s)}
                className={`w-3 shrink-0 rounded-t transition-all ${barColor} ${isSelected ? 'ring-2 ring-blue-700 dark:ring-blue-300 scale-105' : ''}`}
                style={{ height: `${heightPct}%` }}
                title={`#${s.index}: ${s.wordCount} words`}
              />
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Click any bar to inspect that sentence. Bars represent chronological sentence word count.
        </p>
      </div>

      {/* Selected Sentence Detail Inspector */}
      {selectedSentence && (
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-900 dark:text-blue-200">
                Inspecting Sentence #{selectedSentence.index}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-mono text-[10px]">
                {selectedSentence.wordCount} words
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-mono text-[10px]">
                {selectedSentence.syllableCount} syllables
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-mono text-[10px]">
                Ease: {selectedSentence.readingEaseScore}/100
              </span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 italic font-serif text-sm">
              "{selectedSentence.raw}"
            </p>
          </div>

          <button
            onClick={() => setSelectedSentence(null)}
            className="self-end md:self-center px-3 py-1 rounded-lg border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/80"
          >
            Close
          </button>
        </div>
      )}

      {/* Annotated Document Body */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Annotated Text Body
        </h3>

        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-4 font-serif">
          {paragraphs.paragraphs.map(p => {
            const pSentences = sentenceList.filter(s => p.raw.includes(s.raw.slice(0, 30)));
            return (
              <p key={p.index} className="text-slate-800 dark:text-slate-200">
                {pSentences.length > 0
                  ? pSentences.map(s => renderSentenceText(s))
                  : p.raw}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};
