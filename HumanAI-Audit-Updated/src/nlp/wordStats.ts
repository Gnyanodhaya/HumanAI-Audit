/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TokenInfo, WordStatistics } from '../types/audit.ts';

export function computeWordStatistics(rawText: string, tokens: TokenInfo[]): WordStatistics {
  const totalWords = tokens.length;
  if (totalWords === 0) {
    return {
      totalWords: 0,
      uniqueWords: 0,
      totalCharactersWithSpaces: rawText.length,
      totalCharactersNoSpaces: rawText.replace(/\s+/g, '').length,
      averageWordLength: 0,
      averageSyllablesPerWord: 0,
      totalSyllables: 0,
      monosyllabicWords: 0,
      disyllabicWords: 0,
      polysyllabicWords: 0,
      complexWords: 0,
      complexWordsPercentage: 0,
      lengthDistribution: { short: 0, medium: 0, long: 0, veryLong: 0 },
      longestWords: []
    };
  }

  const uniqueWordMap = new Map<string, { syllables: number; count: number }>();
  let totalSyllables = 0;
  let totalCharsInWords = 0;
  let monosyllabic = 0;
  let disyllabic = 0;
  let polysyllabic = 0;
  let complexWords = 0;

  const lengthDist = {
    short: 0,    // 1-3
    medium: 0,   // 4-6
    long: 0,     // 7-9
    veryLong: 0  // 10+
  };

  for (const t of tokens) {
    const len = t.charCount;
    totalCharsInWords += len;
    totalSyllables += t.syllables;

    if (t.syllables === 1) monosyllabic++;
    else if (t.syllables === 2) disyllabic++;
    else polysyllabic++;

    if (t.isComplex) complexWords++;

    if (len <= 3) lengthDist.short++;
    else if (len <= 6) lengthDist.medium++;
    else if (len <= 9) lengthDist.long++;
    else lengthDist.veryLong++;

    const existing = uniqueWordMap.get(t.lower);
    if (existing) {
      existing.count++;
    } else {
      uniqueWordMap.set(t.lower, { syllables: t.syllables, count: 1 });
    }
  }

  // Find longest unique words
  const longestWords = Array.from(uniqueWordMap.entries())
    .map(([word, data]) => ({
      word,
      length: word.length,
      syllables: data.syllables,
      count: data.count
    }))
    .sort((a, b) => b.length - a.length || b.count - a.count)
    .slice(0, 10);

  const totalCharactersWithSpaces = rawText.length;
  const totalCharactersNoSpaces = rawText.replace(/\s+/g, '').length;
  const averageWordLength = Number((totalCharsInWords / totalWords).toFixed(2));
  const averageSyllablesPerWord = Number((totalSyllables / totalWords).toFixed(2));
  const complexWordsPercentage = Number(((complexWords / totalWords) * 100).toFixed(1));

  return {
    totalWords,
    uniqueWords: uniqueWordMap.size,
    totalCharactersWithSpaces,
    totalCharactersNoSpaces,
    averageWordLength,
    averageSyllablesPerWord,
    totalSyllables,
    monosyllabicWords: monosyllabic,
    disyllabicWords: disyllabic,
    polysyllabicWords: polysyllabic,
    complexWords,
    complexWordsPercentage,
    lengthDistribution: lengthDist,
    longestWords
  };
}
