/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CLICHE_AND_FILLER_DICTIONARY } from './stopwords.ts';
import { RepetitionAnalysis, SentenceInfo, TokenInfo } from '../types/audit.ts';

export function computeRepetitionAnalysis(
  tokens: TokenInfo[],
  sentences: SentenceInfo[],
  rawText: string
): RepetitionAnalysis {
  if (tokens.length === 0) {
    return {
      repeatedBigrams: [],
      repeatedTrigrams: [],
      repeatedFourgrams: [],
      clicheAndFillerHits: [],
      repetitiveSentenceStarters: [],
      duplicateSentences: [],
      repetitionIndex: 0
    };
  }

  // Extract N-grams from lowercase clean tokens
  const words = tokens.map(t => t.lower);

  function extractNgrams(n: number, minCount: number = 2) {
    const map = new Map<string, number>();
    for (let i = 0; i <= words.length - n; i++) {
      const slice = words.slice(i, i + n);
      // Skip ngrams that are only stopwords (e.g. "of the", "in the", "and of the")
      const allStop = slice.every(w => tokens[i].isStopword);
      if (allStop && n > 2) continue;

      const phrase = slice.join(' ');
      map.set(phrase, (map.get(phrase) || 0) + 1);
    }

    return Array.from(map.entries())
      .filter(([_, count]) => count >= minCount)
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }

  const repeatedBigrams = extractNgrams(2, 2);
  const repeatedTrigrams = extractNgrams(3, 2);
  const repeatedFourgrams = extractNgrams(4, 2);

  // Cliché and filler detection
  const lowerText = rawText.toLowerCase();
  const clicheHits: Array<{ phrase: string; count: number; category: string; suggestion: string }> = [];

  CLICHE_AND_FILLER_DICTIONARY.forEach(item => {
    const regex = new RegExp(`\\b${item.phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      clicheHits.push({
        phrase: item.phrase,
        count: matches.length,
        category: item.category,
        suggestion: item.suggestion
      });
    }
  });

  clicheHits.sort((a, b) => b.count - a.count);

  // Repetitive sentence starters
  const starterMap = new Map<string, number[]>();
  sentences.forEach(s => {
    if (!s.starterWord) return;
    const existing = starterMap.get(s.starterWord) || [];
    existing.push(s.index);
    starterMap.set(s.starterWord, existing);
  });

  const repetitiveSentenceStarters = Array.from(starterMap.entries())
    .filter(([_, indices]) => indices.length >= 3)
    .map(([starter, indices]) => ({
      starter,
      count: indices.length,
      indices
    }))
    .sort((a, b) => b.count - a.count);

  // Duplicate sentences
  const sentenceMap = new Map<string, number[]>();
  sentences.forEach(s => {
    // Normalize punctuation & spaces for duplicate check
    const normalized = s.raw.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (normalized.length < 15) return; // Ignore very short sentences like "Yes."
    const existing = sentenceMap.get(normalized) || [];
    existing.push(s.index);
    sentenceMap.set(normalized, existing);
  });

  const duplicateSentences = Array.from(sentenceMap.entries())
    .filter(([_, indices]) => indices.length > 1)
    .map(([sentence, indices]) => ({
      sentence: sentences[indices[0] - 1]?.raw || sentence,
      count: indices.length,
      indices
    }));

  // Compute composite Repetition Index (0 - 100)
  // Factors: ratio of trigrams, starter concentration, duplicate sentences, cliché hits
  const trigramRepetitionFactor = Math.min(30, repeatedTrigrams.reduce((acc, t) => acc + (t.count - 1) * 3, 0));
  const starterRepetitionFactor = Math.min(25, repetitiveSentenceStarters.reduce((acc, s) => acc + (s.count - 2) * 2, 0));
  const duplicateSentenceFactor = Math.min(25, duplicateSentences.length * 10);
  const clicheFactor = Math.min(20, clicheHits.reduce((acc, c) => acc + c.count * 3, 0));

  const repetitionIndex = Math.min(100, Math.round(trigramRepetitionFactor + starterRepetitionFactor + duplicateSentenceFactor + clicheFactor));

  return {
    repeatedBigrams,
    repeatedTrigrams,
    repeatedFourgrams,
    clicheAndFillerHits: clicheHits,
    repetitiveSentenceStarters,
    duplicateSentences,
    repetitionIndex
  };
}
