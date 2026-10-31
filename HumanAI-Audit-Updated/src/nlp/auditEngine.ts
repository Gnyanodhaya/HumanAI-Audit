/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { buildSentenceInfoList, normalizeText, splitParagraphs, splitSentences, tokenizeWords } from './preprocess.ts';
import { computeWordStatistics } from './wordStats.ts';
import { computeVocabularyAnalysis } from './vocabulary.ts';
import { computeSentenceAnalysis } from './sentenceAnalysis.ts';
import { computeParagraphAnalysis } from './paragraphAnalysis.ts';
import { computeReadabilityMetrics } from './readability.ts';
import { computeRepetitionAnalysis } from './repetition.ts';
import { computeWritingQualityScore } from './qualityScore.ts';
import { AuditReport } from '../types/audit.ts';

export interface AuditOptions {
  sourceType?: 'raw_text' | 'sample' | 'file_upload';
  fileName?: string;
}

export function runAudit(text: string, options: AuditOptions = {}): AuditReport {
  const normalized = normalizeText(text);
  const rawParagraphs = splitParagraphs(normalized);
  const rawSentences = splitSentences(normalized);
  const tokens = tokenizeWords(normalized);
  const sentenceInfoList = buildSentenceInfoList(rawSentences);

  const wordStats = computeWordStatistics(normalized, tokens);
  const vocabulary = computeVocabularyAnalysis(tokens);
  const sentences = computeSentenceAnalysis(sentenceInfoList);
  const paragraphs = computeParagraphAnalysis(rawParagraphs);
  const readability = computeReadabilityMetrics(tokens, sentenceInfoList, wordStats);
  const repetition = computeRepetitionAnalysis(tokens, sentenceInfoList, normalized);
  const quality = computeWritingQualityScore(wordStats, vocabulary, sentences, paragraphs, readability, repetition);

  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    sourceType: options.sourceType || 'raw_text',
    fileName: options.fileName,
    rawText: text,
    wordStats,
    vocabulary,
    sentences,
    sentenceList: sentenceInfoList,
    paragraphs,
    readability,
    repetition,
    quality
  };
}
