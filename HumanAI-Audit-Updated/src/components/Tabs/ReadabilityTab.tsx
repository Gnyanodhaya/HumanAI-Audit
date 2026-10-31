/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Clock, Users, GraduationCap, Info } from 'lucide-react';
import { AuditReport } from '../../types/audit.ts';
import { MetricCard } from '../MetricCard.tsx';

interface ReadabilityTabProps {
  report: AuditReport;
}

export const ReadabilityTab: React.FC<ReadabilityTabProps> = ({ report }) => {
  const { readability, wordStats, sentences } = report;

  const formulas = [
    {
      name: 'Flesch Reading Ease',
      score: readability.fleschReadingEase,
      scale: '0 - 100',
      description: 'Scores comprehension accessibility. Higher scores indicate easier prose.',
      target: '60 - 70 is standard for general audience',
      badge: readability.readingEaseLabel
    },
    {
      name: 'Flesch-Kincaid Grade Level',
      score: `Grade ${readability.fleschKincaidGrade}`,
      scale: 'U.S. School Grade',
      description: 'Translates reading difficulty into required U.S. grade level based on sentence length and syllables.',
      target: '7th - 9th grade for mass public',
      badge: `Age ${Math.round(readability.fleschKincaidGrade + 5)}+`
    },
    {
      name: 'Gunning Fog Index',
      score: `Fog ${readability.gunningFog}`,
      scale: 'Years of Formal Education',
      description: 'Emphasizes complex words (3+ syllables) and average sentence length.',
      target: '8 - 10 for business/journalism; 12+ academic',
      badge: readability.gunningFog > 12 ? 'Complex' : 'Accessible'
    },
    {
      name: 'Coleman-Liau Index',
      score: `Grade ${readability.colemanLiau}`,
      scale: 'U.S. School Grade',
      description: 'Uses character counts and sentence count per 100 words rather than syllable counting.',
      target: '8th - 10th grade',
      badge: `L: ${wordStats.averageWordLength} chars/w`
    },
    {
      name: 'SMOG Index',
      score: `Grade ${readability.smogIndex}`,
      scale: 'Years of Education',
      description: 'Simple Measure of Gobbledygook; gauges 100% comprehension of polysyllabic density.',
      target: 'Ideal for healthcare and consumer disclosures',
      badge: `${wordStats.polysyllabicWords} polysyllables`
    },
    {
      name: 'Automated Readability Index (ARI)',
      score: `Grade ${readability.automatedReadabilityIndex}`,
      scale: 'U.S. School Grade',
      description: 'Derived from characters-per-word and words-per-sentence ratios.',
      target: 'Standard typewriter readability formula',
      badge: `Age ${Math.max(6, Math.round(readability.automatedReadabilityIndex + 5))}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Consensus Grade Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center font-bold font-mono shrink-0 shadow-xs">
            <GraduationCap className="w-6 h-6 mb-0.5" />
            <span className="text-xs">{readability.consensusGradeLevel}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Consensus Readability: Grade {readability.consensusGradeLevel}
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {readability.readingEaseLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Suitable for: <strong className="text-slate-800 dark:text-slate-200">{readability.gradeLevelInterpretation}</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Composite average calculated across all 6 verified mathematical indices.
            </p>
          </div>
        </div>

        {/* Time estimations */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6 shrink-0">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-semibold">Reading Time</span>
            </div>
            <div className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">
              ~{readability.estimatedReadingTimeMinutes} <span className="text-xs font-normal text-slate-400">min</span>
            </div>
            <span className="text-[10px] text-slate-400">@ 220 wpm</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-semibold">Speaking Time</span>
            </div>
            <div className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100">
              ~{readability.estimatedSpeakingTimeMinutes} <span className="text-xs font-normal text-slate-400">min</span>
            </div>
            <span className="text-[10px] text-slate-400">@ 135 wpm</span>
          </div>
        </div>
      </div>

      {/* 6 Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formulas.map(formula => (
          <div
            key={formula.name}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formula.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                {formula.scale}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                {formula.score}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {formula.badge}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
              {formula.description}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Target: {formula.target}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Target Audience Reference Guide */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Readability Benchmarks & Target Demographics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Grade 6 - 8 (General Public)</div>
            <p className="text-slate-600 dark:text-slate-300">Consumer web content, daily newspapers, e-commerce, broad public blogs.</p>
          </div>
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20">
            <div className="font-bold text-blue-800 dark:text-blue-300 mb-1">Grade 9 - 11 (High School)</div>
            <p className="text-slate-600 dark:text-slate-300">Magazine articles, editorial essays, business communications.</p>
          </div>
          <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20">
            <div className="font-bold text-indigo-800 dark:text-indigo-300 mb-1">Grade 12 - 14 (College)</div>
            <p className="text-slate-600 dark:text-slate-300">Technical documentation, professional whitepapers, policy briefs.</p>
          </div>
          <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/20">
            <div className="font-bold text-purple-800 dark:text-purple-300 mb-1">Grade 15+ (Graduate / Scholar)</div>
            <p className="text-slate-600 dark:text-slate-300">Academic peer-reviewed literature, legal contracts, clinical studies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
