/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Zap,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { AuditReport } from '../../types/audit.ts';
import { MetricCard } from '../MetricCard.tsx';

interface OverviewTabProps {
  report: AuditReport;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ report }) => {
  const { quality, wordStats, sentences, readability, vocabulary, repetition } = report;

  // Grade color helper
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
      case 'B': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800';
      case 'C': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
      case 'D': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800';
      default: return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Streamlit Callout / Welcome Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-bold font-mono shrink-0 shadow-xs ${getGradeColor(quality.grade)}`}>
              <span className="text-3xl leading-none">{quality.grade}</span>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider mt-1 opacity-80">Grade</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Comprehensive Writing Audit
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Score: {quality.overallScore}/100
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {quality.verdict}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Reading level: <strong className="text-slate-700 dark:text-slate-200">{readability.gradeLevelInterpretation}</strong></span>
                <span>•</span>
                <span>Burstiness: <strong className="text-slate-700 dark:text-slate-200">{quality.stylometricTendency.cadenceUniformity}</strong></span>
                <span>•</span>
                <span>Est. Read Time: <strong className="text-slate-700 dark:text-slate-200">{readability.estimatedReadingTimeMinutes} min</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center min-w-[140px] pl-4 border-l border-slate-100 dark:border-slate-800">
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-slate-100">
              {quality.overallScore}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Overall Index</span>
            <div className="w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${quality.overallScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row (st.metric style) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Total Words"
          value={wordStats.totalWords}
          help="Total word count in document"
          sublabel={`${wordStats.uniqueWords} unique (${(vocabulary.typeTokenRatio * 100).toFixed(0)}%)`}
        />
        <MetricCard
          label="Sentences"
          value={sentences.totalSentences}
          help="Count of distinct sentence boundaries"
          sublabel={`Avg: ${sentences.averageSentenceLength} w/sent`}
        />
        <MetricCard
          label="Readability"
          value={readability.fleschReadingEase}
          help="Flesch Reading Ease (0-100 scale, higher is easier)"
          delta={{
            value: readability.fleschReadingEase >= 60 ? 'Optimal' : 'Challenging',
            isPositive: readability.fleschReadingEase >= 50,
            neutral: readability.fleschReadingEase < 50
          }}
          sublabel={`Grade ${readability.consensusGradeLevel}`}
        />
        <MetricCard
          label="Burstiness (CV)"
          value={sentences.coefficientOfVariation}
          help="Coefficient of Variation of sentence lengths. Human prose typically ranges 0.45 - 0.80."
          delta={{
            value: sentences.coefficientOfVariation >= 0.40 ? 'Natural' : 'Uniform',
            isPositive: sentences.coefficientOfVariation >= 0.40,
            neutral: sentences.coefficientOfVariation < 0.40
          }}
          sublabel="Sentence variation"
        />
        <MetricCard
          label="Lexical Density"
          value={`${vocabulary.lexicalDensity}%`}
          help="Proportion of content words (nouns, verbs, adjectives) relative to total words"
          sublabel={`${vocabulary.contentWordCount} content words`}
        />
        <MetricCard
          label="Repetition Index"
          value={repetition.repetitionIndex}
          help="Composite repetition score (0-100, lower indicates fresher prose)"
          variant={repetition.repetitionIndex > 35 ? 'warning' : 'default'}
          sublabel={`${repetition.clicheAndFillerHits.length} stock phrases`}
        />
      </div>

      {/* Subscores & Stylometrics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sub-score Pillars */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Writing Quality Pillars
          </h3>

          <div className="space-y-3.5">
            {[
              { label: 'Readability & Flow', val: quality.subscores.readabilityAndFlow, weight: '30%', desc: 'Sentence length cadence, grade level, and reading ease' },
              { label: 'Lexical Diversity', val: quality.subscores.lexicalDiversity, weight: '25%', desc: 'Type-Token Ratio, Hapax Legomena, and vocabulary richness' },
              { label: 'Structural Rhythm', val: quality.subscores.structuralRhythm, weight: '20%', desc: 'Sentence length burstiness (CV) and starter variety' },
              { label: 'Conciseness & Clarity', val: quality.subscores.concisenessAndClarity, weight: '15%', desc: 'Absence of clichés, filler phrases, and repetitive n-grams' },
              { label: 'Mechanics & Balance', val: quality.subscores.mechanicsAndBalance, weight: '10%', desc: 'Appropriate word complexity and paragraph distribution' },
            ].map(pillar => (
              <div key={pillar.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {pillar.label}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">({pillar.weight})</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{pillar.val}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pillar.val >= 80 ? 'bg-emerald-500' : pillar.val >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pillar.val}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stylometric Cadence & Human/Synthetic Profile */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Stylometric Profile & Rhythm Diagnostic
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Cadence Uniformity</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                quality.stylometricTendency.cadenceUniformity.includes('Synthetic')
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              }`}>
                {quality.stylometricTendency.cadenceUniformity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Burstiness (Sentence Variance CV)</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                {sentences.coefficientOfVariation} <span className="font-normal text-slate-400">(StdDev: {sentences.sentenceLengthStdDev} words)</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Transition Density</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {quality.stylometricTendency.transitionDensity} ({report.paragraphs.transitionsPerParagraph} / para)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Hapax Legomena (Rare Words Ratio)</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                {vocabulary.hapaxPercentage}% of unique words
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
            <strong className="text-blue-900 dark:text-blue-300 block mb-1">Empirical Stylometric Note:</strong>
            Natural human prose displays significant sentence length volatility (burstiness), whereas synthetic or machine-assisted prose frequently compresses toward uniform sentence lengths (CV &lt; 0.30) and over-indexes on transitional signposts like <em>"Furthermore"</em> and <em>"In addition"</em>.
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Prioritized Action Recommendations ({quality.recommendations.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quality.recommendations.map((rec, idx) => {
            const isWarning = rec.type === 'warning';
            const isSuccess = rec.type === 'success';
            const isDanger = rec.type === 'danger';

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  isSuccess
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                    : isWarning
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                    : isDanger
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                    : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isSuccess ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    {rec.message}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-0.5">
                    → <span className="text-slate-800 dark:text-slate-200">{rec.action}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
