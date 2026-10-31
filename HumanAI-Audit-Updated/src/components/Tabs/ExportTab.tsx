/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Copy, Check, FileJson, FileText, Table, FileCode, Printer, Sparkles } from 'lucide-react';
import { AuditReport } from '../../types/audit.ts';
import { generateAuditPdf } from '../../utils/pdfExport.ts';

interface ExportTabProps {
  report: AuditReport;
  userEmail?: string;
}

export const ExportTab: React.FC<ExportTabProps> = ({ report, userEmail }) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Generate markdown report
  const generateMarkdown = () => {
    return `# HumanAI Linguistic Audit Report
Generated: ${new Date(report.timestamp).toLocaleString()}
Document Source: ${report.fileName || 'Pasted Text'}
Auditor: ${userEmail || 'Guest Auditor'}

---

## 1. Executive Summary
- **Overall Quality Score**: ${report.quality.overallScore}/100 (Grade: ${report.quality.grade})
- **Verdict**: ${report.quality.verdict}
- **Consensus Grade Level**: Grade ${report.readability.consensusGradeLevel} (${report.readability.gradeLevelInterpretation})
- **Reading Ease**: ${report.readability.fleschReadingEase}/100 (${report.readability.readingEaseLabel})
- **Burstiness (Sentence Length CV)**: ${report.sentences.coefficientOfVariation} (${report.quality.stylometricTendency.cadenceUniformity})
- **Repetition Index**: ${report.repetition.repetitionIndex}/100

---

## 2. Word & Lexical Statistics
- **Total Words**: ${report.wordStats.totalWords}
- **Unique Words**: ${report.wordStats.uniqueWords}
- **Type-Token Ratio (TTR)**: ${report.vocabulary.typeTokenRatio}
- **Root TTR (Guiraud)**: ${report.vocabulary.rootTTR}
- **Lexical Density**: ${report.vocabulary.lexicalDensity}% (${report.vocabulary.contentWordCount} content words)
- **Hapax Legomena (Single-occurrence words)**: ${report.vocabulary.hapaxLegomenaCount} (${report.vocabulary.hapaxPercentage}%)
- **Average Word Length**: ${report.wordStats.averageWordLength} characters
- **Average Syllables / Word**: ${report.wordStats.averageSyllablesPerWord}

---

## 3. Readability Formula Breakdown
- **Flesch Reading Ease**: ${report.readability.fleschReadingEase}
- **Flesch-Kincaid Grade Level**: Grade ${report.readability.fleschKincaidGrade}
- **Gunning Fog Index**: ${report.readability.gunningFog}
- **Coleman-Liau Index**: Grade ${report.readability.colemanLiau}
- **SMOG Index**: Grade ${report.readability.smogIndex}
- **Automated Readability Index (ARI)**: Grade ${report.readability.automatedReadabilityIndex}
- **Estimated Reading Time**: ~${report.readability.estimatedReadingTimeMinutes} minutes
- **Estimated Speaking Time**: ~${report.readability.estimatedSpeakingTimeMinutes} minutes

---

## 4. Sentence & Structure Analysis
- **Total Sentences**: ${report.sentences.totalSentences}
- **Average Sentence Length**: ${report.sentences.averageSentenceLength} words
- **Median Sentence Length**: ${report.sentences.medianSentenceLength} words
- **Min / Max Sentence Length**: ${report.sentences.minSentenceLength} / ${report.sentences.maxSentenceLength} words
- **Sentence Length StdDev**: ${report.sentences.sentenceLengthStdDev} words
- **Total Paragraphs**: ${report.paragraphs.totalParagraphs} (Avg ${report.paragraphs.averageWordsPerParagraph} words/para)
- **Transitions Count**: ${report.paragraphs.totalTransitionsFound} (${report.paragraphs.transitionsPerParagraph} per para)

---

## 5. Repetition & Cliché Diagnostics
- **AI Clichés / Fillers Detected**: ${report.repetition.clicheAndFillerHits.length}
${report.repetition.clicheAndFillerHits.map(c => `  - "${c.phrase}": ${c.count}x (${c.suggestion})`).join('\n')}
- **Duplicate Sentences**: ${report.repetition.duplicateSentences.length}
- **Top Repeated Trigrams**:
${report.repetition.repeatedTrigrams.slice(0, 5).map(t => `  - "${t.phrase}": ${t.count}x`).join('\n')}

---

## 6. Actionable Recommendations
${report.quality.recommendations.map(r => `- **[${r.category}]**: ${r.message} → *${r.action}*`).join('\n')}
`;
  };

  // Generate CSV for word frequencies
  const generateCsv = () => {
    const headers = ['Word', 'Count', 'FrequencyPct', 'Syllables', 'IsStopword'];
    const rows = report.vocabulary.frequencyDistribution.map(f => [
      `"${f.word.replace(/"/g, '""')}"`,
      f.count,
      f.frequency,
      f.syllables,
      f.isStopword ? 'TRUE' : 'FALSE'
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePdfExport = () => {
    setIsGeneratingPdf(true);
    try {
      generateAuditPdf(report, userEmail);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'md' | 'json') => {
    await navigator.clipboard.writeText(text);
    if (type === 'md') {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Export & Diagnostics Center
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Generate professional PDF summary reports, formatted markdown executive briefs, raw JSON datasets, or tabular CSVs.
        </p>
      </div>

      {/* Featured PDF Export Banner */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider">
              Official Document Export
            </span>
            <span className="text-xs opacity-80">Printable & Vector Quality</span>
          </div>
          <h3 className="text-xl font-bold">
            Download Linguistic Audit Summary Report (PDF)
          </h3>
          <p className="text-xs text-blue-100 leading-relaxed">
            Generates a publication-ready PDF containing the overall score, writing quality pillars, all 6 readability formulas, burstiness metrics, stock cliché detection, and actionable recommendations.
          </p>
        </div>

        <button
          onClick={handlePdfExport}
          disabled={isGeneratingPdf}
          className="shrink-0 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-75"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          <span>{isGeneratingPdf ? 'Compiling PDF...' : 'Download PDF Report'}</span>
        </button>
      </div>

      {/* 3 Secondary Formats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Markdown Report Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Formatted Markdown Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete diagnostic brief including score pillars, readability tables, and actionable revision notes.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => handleDownload(generateMarkdown(), `linguistic-audit-${Date.now()}.md`, 'text/markdown')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .MD
            </button>
            <button
              onClick={() => copyToClipboard(generateMarkdown(), 'md')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Copy to clipboard"
            >
              {copiedMd ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* JSON Full Audit Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Raw Audit Data (JSON)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Machine-readable JSON schema containing every computed parameter, sentence array, and subscore.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => handleDownload(JSON.stringify(report, null, 2), `linguistic-audit-${Date.now()}.json`, 'application/json')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .JSON
            </button>
            <button
              onClick={() => copyToClipboard(JSON.stringify(report, null, 2), 'json')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Copy to clipboard"
            >
              {copiedJson ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* CSV Word Frequency Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Table className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Vocabulary Frequency (CSV)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Spreadsheet-compatible CSV containing all unique tokens, frequency distributions, and syllable data.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleDownload(generateCsv(), `word-frequencies-${Date.now()}.csv`, 'text/csv')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .CSV
            </button>
          </div>
        </div>
      </div>

      {/* Preview Markdown Box */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Markdown Report Preview
        </h3>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto max-h-72">
          {generateMarkdown()}
        </pre>
      </div>
    </div>
  );
};
