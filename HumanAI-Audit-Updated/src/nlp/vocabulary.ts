/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TokenInfo, VocabularyAnalysis } from '../types/audit.ts';

export function computeVocabularyAnalysis(tokens: TokenInfo[]): VocabularyAnalysis {
  const totalWords = tokens.length;
  if (totalWords === 0) {
    return {
      typeTokenRatio: 0,
      rootTTR: 0,
      correctedTTR: 0,
      logTTR: 0,
      lexicalDensity: 0,
      hapaxLegomenaCount: 0,
      hapaxPercentage: 0,
      disLegomenaCount: 0,
      disPercentage: 0,
      frequencyDistribution: [],
      stopwordCount: 0,
      stopwordPercentage: 0,
      contentWordCount: 0
    };
  }

  const wordFrequencyMap = new Map<string, { count: number; isStopword: boolean; syllables: number }>();
  let stopwordCount = 0;

  for (const t of tokens) {
    if (t.isStopword) {
      stopwordCount++;
    }
    const entry = wordFrequencyMap.get(t.lower);
    if (entry) {
      entry.count++;
    } else {
      wordFrequencyMap.set(t.lower, {
        count: 1,
        isStopword: t.isStopword,
        syllables: t.syllables
      });
    }
  }

  const uniqueWords = wordFrequencyMap.size;
  const contentWordCount = totalWords - stopwordCount;

  // Type-Token Ratios
  const typeTokenRatio = Number((uniqueWords / totalWords).toFixed(4));
  const rootTTR = Number((uniqueWords / Math.sqrt(totalWords)).toFixed(2));
  const correctedTTR = Number((uniqueWords / Math.sqrt(2 * totalWords)).toFixed(2));
  
  // Log TTR (Herdan's C) = log(V) / log(N)
  let logTTR = 0;
  if (totalWords > 1 && uniqueWords > 1) {
    logTTR = Number((Math.log(uniqueWords) / Math.log(totalWords)).toFixed(4));
  } else if (totalWords === 1) {
    logTTR = 1;
  }

  // Lexical Density: percentage of content words (non-stopwords) in total words
  const lexicalDensity = Number(((contentWordCount / totalWords) * 100).toFixed(1));

  // Hapax Legomena (words occurring exactly once) & Dis Legomena (words occurring twice)
  let hapaxCount = 0;
  let disCount = 0;

  const frequencyDistribution: Array<{
    word: string;
    count: number;
    frequency: number;
    isStopword: boolean;
    syllables: number;
  }> = [];

  for (const [word, data] of wordFrequencyMap.entries()) {
    if (data.count === 1) hapaxCount++;
    if (data.count === 2) disCount++;

    frequencyDistribution.push({
      word,
      count: data.count,
      frequency: Number(((data.count / totalWords) * 100).toFixed(2)),
      isStopword: data.isStopword,
      syllables: data.syllables
    });
  }

  // Sort by count descending, then alphabetically
  frequencyDistribution.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const hapaxPercentage = Number(((hapaxCount / uniqueWords) * 100).toFixed(1));
  const disPercentage = Number(((disCount / uniqueWords) * 100).toFixed(1));
  const stopwordPercentage = Number(((stopwordCount / totalWords) * 100).toFixed(1));

  return {
    typeTokenRatio,
    rootTTR,
    correctedTTR,
    logTTR,
    lexicalDensity,
    hapaxLegomenaCount: hapaxCount,
    hapaxPercentage,
    disLegomenaCount: disCount,
    disPercentage,
    frequencyDistribution,
    stopwordCount,
    stopwordPercentage,
    contentWordCount
  };
}
