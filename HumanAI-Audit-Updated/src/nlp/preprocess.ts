/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ADVERB_STARTERS,
  ARTICLE_STARTERS,
  CONJUNCTION_STARTERS,
  ENGLISH_STOPWORDS,
  PREPOSITION_STARTERS,
  PRONOUN_STARTERS
} from './stopwords.ts';
import { countSyllables, isComplexWord } from './syllables.ts';
import { SentenceInfo, TokenInfo } from '../types/audit.ts';

const COMMON_ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'rev', 'gen', 'rep', 'sen',
  'st', 'vs', 'etc', 'eg', 'ie', 'al', 'inc', 'ltd', 'corp', 'co',
  'dept', 'univ', 'approx', 'est', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul',
  'aug', 'sep', 'sept', 'oct', 'nov', 'dec'
]);

/**
 * Normalizes unicode quotes, hyphens, and whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, ' - ')
    .replace(/\u2026/g, '...')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t\f\v ]+/g, ' ');
}

/**
 * Splits text into paragraphs
 */
export function splitParagraphs(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Tokenizes text into sentences with abbreviation handling
 */
export function splitSentences(text: string): string[] {
  const normalized = normalizeText(text).trim();
  if (!normalized) return [];

  // Protect abbreviations and initials
  // Replace period in known abbreviations with a placeholder
  let protectedText = normalized;

  // Protect decimals in numbers (e.g. 3.14 -> 3<DECIMAL>14)
  protectedText = protectedText.replace(/(\d+)\.(\d+)/g, '$1<DECIMAL>$2');

  // Protect ellipsis
  protectedText = protectedText.replace(/\.{3}/g, '<ELLIPSIS>');

  // Protect common abbreviations
  COMMON_ABBREVIATIONS.forEach(abbr => {
    const regex = new RegExp(`\\b(${abbr})\\.(\\s+)`, 'gi');
    protectedText = protectedText.replace(regex, '$1<ABBR_DOT>$2');
  });

  // Protect single letter initials like "J. K. Rowling" or "U.S.A."
  protectedText = protectedText.replace(/\b([A-Z])\.(\s*)(?=[A-Z0-9])/g, '$1<INIT_DOT>$2');

  // Split on terminal punctuation followed by space or end of string, taking quotes/closing parens into account
  const rawSentences = protectedText.split(/(?<=[.?!]["')\]]?)(?:\s+(?=[A-Z0-9"'(])|\n+|$)/);

  const sentences: string[] = [];
  for (const s of rawSentences) {
    if (!s) continue;
    // Restore protected tokens
    const restored = s
      .replace(/<DECIMAL>/g, '.')
      .replace(/<ELLIPSIS>/g, '...')
      .replace(/<ABBR_DOT>/g, '.')
      .replace(/<INIT_DOT>/g, '.')
      .trim();

    if (restored.length > 0) {
      sentences.push(restored);
    }
  }

  // Fallback if no sentence break occurred but text is present
  if (sentences.length === 0 && normalized.length > 0) {
    sentences.push(normalized);
  }

  return sentences;
}

/**
 * Tokenizes a sentence or block of text into detailed word token objects
 */
export function tokenizeWords(text: string): TokenInfo[] {
  const words = text.match(/[A-Za-z0-9]+(?:['’\-][A-Za-z0-9]+)*/g) || [];
  
  return words.map(raw => {
    const clean = raw.replace(/[^A-Za-z0-9]/g, '');
    const lower = clean.toLowerCase();
    const syllables = countSyllables(clean);
    const isStop = ENGLISH_STOPWORDS.has(lower);
    const isComplex = isComplexWord(clean, syllables);

    return {
      raw,
      clean,
      lower,
      syllables,
      isStopword: isStop,
      isComplex,
      charCount: clean.length
    };
  }).filter(t => t.clean.length > 0);
}

/**
 * Categorizes the sentence starter word
 */
export function categorizeStarter(word: string): SentenceInfo['starterType'] {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  if (PRONOUN_STARTERS.has(lower)) return 'pronoun';
  if (CONJUNCTION_STARTERS.has(lower)) return 'conjunction';
  if (ADVERB_STARTERS.has(lower)) return 'adverb';
  if (ARTICLE_STARTERS.has(lower)) return 'article';
  if (PREPOSITION_STARTERS.has(lower)) return 'preposition';
  return 'other';
}

/**
 * Creates structured SentenceInfo objects
 */
export function buildSentenceInfoList(sentenceStrings: string[]): SentenceInfo[] {
  return sentenceStrings.map((s, idx) => {
    const tokens = tokenizeWords(s);
    const wordCount = tokens.length;
    const charCount = s.length;
    const syllableCount = tokens.reduce((acc, t) => acc + t.syllables, 0);
    const complexWordCount = tokens.filter(t => t.isComplex).length;
    const starterToken = tokens[0]?.lower || '';
    const starterType = categorizeStarter(tokens[0]?.clean || '');

    // Quick Flesch Reading Ease for this individual sentence
    // 206.835 - 1.015 * (words) - 84.6 * (syllables / words)
    let readingEase = 100;
    if (wordCount > 0) {
      const avgSyllables = syllableCount / wordCount;
      readingEase = Math.round(206.835 - (1.015 * wordCount) - (84.6 * avgSyllables));
      readingEase = Math.max(0, Math.min(100, readingEase));
    }

    const punctuationMatches = s.match(/[,;:\-—?!()"]/g);
    const punctuationCount = punctuationMatches ? punctuationMatches.length : 0;

    return {
      index: idx + 1,
      raw: s,
      wordCount,
      charCount,
      syllableCount,
      complexWordCount,
      starterWord: starterToken,
      starterType,
      readingEaseScore: readingEase,
      isVeryShort: wordCount < 8,
      isVeryLong: wordCount > 32,
      punctuationCount
    };
  });
}
