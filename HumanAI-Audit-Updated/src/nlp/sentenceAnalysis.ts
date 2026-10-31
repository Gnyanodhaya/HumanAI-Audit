/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SentenceAnalysis, SentenceInfo } from '../types/audit.ts';

export function computeSentenceAnalysis(sentences: SentenceInfo[]): SentenceAnalysis {
  const totalSentences = sentences.length;
  if (totalSentences === 0) {
    return {
      totalSentences: 0,
      averageSentenceLength: 0,
      medianSentenceLength: 0,
      minSentenceLength: 0,
      maxSentenceLength: 0,
      sentenceLengthVariance: 0,
      sentenceLengthStdDev: 0,
      coefficientOfVariation: 0,
      sentenceLengthDistribution: { short: 0, medium: 0, long: 0, veryLong: 0 },
      starterDistribution: {},
      starterTypeDistribution: {},
      repetitiveConsecutiveStarters: [],
      longestSentence: null,
      shortestSentence: null,
      punctuationDistribution: {}
    };
  }

  const lengths = sentences.map(s => s.wordCount);
  const totalWords = lengths.reduce((acc, l) => acc + l, 0);
  const averageSentenceLength = Number((totalWords / totalSentences).toFixed(1));

  // Median
  const sortedLengths = [...lengths].sort((a, b) => a - b);
  const mid = Math.floor(sortedLengths.length / 2);
  const medianSentenceLength = sortedLengths.length % 2 !== 0
    ? sortedLengths[mid]
    : Number(((sortedLengths[mid - 1] + sortedLengths[mid]) / 2).toFixed(1));

  const minSentenceLength = sortedLengths[0];
  const maxSentenceLength = sortedLengths[sortedLengths.length - 1];

  // Variance & Standard Deviation
  const variance = lengths.reduce((acc, l) => acc + Math.pow(l - averageSentenceLength, 2), 0) / totalSentences;
  const sentenceLengthVariance = Number(variance.toFixed(2));
  const sentenceLengthStdDev = Number(Math.sqrt(variance).toFixed(2));

  // Coefficient of Variation (CV) = StdDev / Mean (Burstiness metric)
  const coefficientOfVariation = averageSentenceLength > 0
    ? Number((sentenceLengthStdDev / averageSentenceLength).toFixed(3))
    : 0;

  // Length Distribution
  const lengthDist = {
    short: 0,     // < 10
    medium: 0,    // 10 - 20
    long: 0,      // 21 - 35
    veryLong: 0   // > 35
  };

  for (const l of lengths) {
    if (l < 10) lengthDist.short++;
    else if (l <= 20) lengthDist.medium++;
    else if (l <= 35) lengthDist.long++;
    else lengthDist.veryLong++;
  }

  // Sentence Starters
  const starterDist: Record<string, number> = {};
  const starterTypeDist: Record<string, number> = {};

  sentences.forEach(s => {
    if (s.starterWord) {
      starterDist[s.starterWord] = (starterDist[s.starterWord] || 0) + 1;
    }
    starterTypeDist[s.starterType] = (starterTypeDist[s.starterType] || 0) + 1;
  });

  // Consecutive repetitive starters
  const repetitiveConsecutive: Array<{ starter: string; sentenceIndices: number[]; count: number }> = [];
  let currentStarter = '';
  let currentStreak: number[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const starter = s.starterWord;

    if (starter && starter === currentStarter) {
      currentStreak.push(s.index);
    } else {
      if (currentStreak.length >= 2) {
        repetitiveConsecutive.push({
          starter: currentStarter,
          sentenceIndices: [...currentStreak],
          count: currentStreak.length
        });
      }
      currentStarter = starter;
      currentStreak = [s.index];
    }
  }
  if (currentStreak.length >= 2) {
    repetitiveConsecutive.push({
      starter: currentStarter,
      sentenceIndices: [...currentStreak],
      count: currentStreak.length
    });
  }

  // Longest & Shortest
  let longest: SentenceInfo = sentences[0];
  let shortest: SentenceInfo = sentences[0];

  for (const s of sentences) {
    if (s.wordCount > longest.wordCount) longest = s;
    if (s.wordCount < shortest.wordCount && s.wordCount > 0) shortest = s;
  }

  // Punctuation distribution across whole text
  const punctuationDist: Record<string, number> = {};
  sentences.forEach(s => {
    const matches = s.raw.match(/[,;:\-—?!()"]/g) || [];
    matches.forEach(p => {
      const normalizedP = p === '—' ? '-' : p;
      punctuationDist[normalizedP] = (punctuationDist[normalizedP] || 0) + 1;
    });
  });

  return {
    totalSentences,
    averageSentenceLength,
    medianSentenceLength,
    minSentenceLength,
    maxSentenceLength,
    sentenceLengthVariance,
    sentenceLengthStdDev,
    coefficientOfVariation,
    sentenceLengthDistribution: lengthDist,
    starterDistribution: starterDist,
    starterTypeDistribution: starterTypeDist,
    repetitiveConsecutiveStarters: repetitiveConsecutive,
    longestSentence: longest,
    shortestSentence: shortest,
    punctuationDistribution: punctuationDist
  };
}
