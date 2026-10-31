/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TRANSITION_PHRASES } from './stopwords.ts';
import { splitSentences, tokenizeWords } from './preprocess.ts';
import { ParagraphAnalysis, ParagraphInfo } from '../types/audit.ts';

export function computeParagraphAnalysis(rawParagraphs: string[]): ParagraphAnalysis {
  if (rawParagraphs.length === 0) {
    return {
      totalParagraphs: 0,
      averageWordsPerParagraph: 0,
      averageSentencesPerParagraph: 0,
      paragraphLengthStdDev: 0,
      paragraphs: [],
      transitionFrequency: {},
      totalTransitionsFound: 0,
      transitionsPerParagraph: 0
    };
  }

  const transitionFreq: Record<string, number> = {};
  let totalTransitions = 0;

  const paragraphs: ParagraphInfo[] = rawParagraphs.map((raw, idx) => {
    const sentences = splitSentences(raw);
    const tokens = tokenizeWords(raw);
    const wordCount = tokens.length;
    const sentenceCount = sentences.length;
    const avgSentenceLength = sentenceCount > 0
      ? Number((wordCount / sentenceCount).toFixed(1))
      : 0;

    const lowerRaw = raw.toLowerCase();
    const transitionsFound: string[] = [];

    TRANSITION_PHRASES.forEach(phrase => {
      // Look for whole phrase boundary
      const regex = new RegExp(`\\b${phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
      const matches = lowerRaw.match(regex);
      if (matches) {
        transitionsFound.push(phrase);
        const count = matches.length;
        transitionFreq[phrase] = (transitionFreq[phrase] || 0) + count;
        totalTransitions += count;
      }
    });

    return {
      index: idx + 1,
      raw,
      wordCount,
      sentenceCount,
      avgSentenceLength,
      transitionPhrases: transitionsFound
    };
  });

  const totalParagraphs = paragraphs.length;
  const totalWords = paragraphs.reduce((acc, p) => acc + p.wordCount, 0);
  const totalSentences = paragraphs.reduce((acc, p) => acc + p.sentenceCount, 0);

  const averageWordsPerParagraph = Number((totalWords / totalParagraphs).toFixed(1));
  const averageSentencesPerParagraph = Number((totalSentences / totalParagraphs).toFixed(1));

  // Variance & StdDev of paragraph word lengths
  const variance = paragraphs.reduce((acc, p) => acc + Math.pow(p.wordCount - averageWordsPerParagraph, 2), 0) / totalParagraphs;
  const paragraphLengthStdDev = Number(Math.sqrt(variance).toFixed(2));
  const transitionsPerParagraph = Number((totalTransitions / totalParagraphs).toFixed(2));

  return {
    totalParagraphs,
    averageWordsPerParagraph,
    averageSentencesPerParagraph,
    paragraphLengthStdDev,
    paragraphs,
    transitionFrequency: transitionFreq,
    totalTransitionsFound: totalTransitions,
    transitionsPerParagraph
  };
}
