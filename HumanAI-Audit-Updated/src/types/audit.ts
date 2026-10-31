/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TokenInfo {
  raw: string;
  clean: string;
  lower: string;
  syllables: number;
  isStopword: boolean;
  isComplex: boolean; // >= 3 syllables
  charCount: number;
}

export interface SentenceInfo {
  index: number;
  raw: string;
  wordCount: number;
  charCount: number;
  syllableCount: number;
  complexWordCount: number;
  starterWord: string;
  starterType: 'pronoun' | 'conjunction' | 'adverb' | 'article' | 'preposition' | 'noun' | 'verb' | 'other';
  readingEaseScore: number;
  isVeryShort: boolean;
  isVeryLong: boolean;
  punctuationCount: number;
}

export interface ParagraphInfo {
  index: number;
  raw: string;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  transitionPhrases: string[];
}

export interface WordStatistics {
  totalWords: number;
  uniqueWords: number;
  totalCharactersWithSpaces: number;
  totalCharactersNoSpaces: number;
  averageWordLength: number;
  averageSyllablesPerWord: number;
  totalSyllables: number;
  monosyllabicWords: number;
  disyllabicWords: number;
  polysyllabicWords: number;
  complexWords: number; // >= 3 syllables excluding standard suffixes
  complexWordsPercentage: number;
  lengthDistribution: {
    short: number;      // 1-3
    medium: number;     // 4-6
    long: number;       // 7-9
    veryLong: number;   // 10+
  };
  longestWords: Array<{ word: string; length: number; syllables: number; count: number }>;
}

export interface VocabularyAnalysis {
  typeTokenRatio: number; // TTR = V / N
  rootTTR: number;        // RTTR = V / sqrt(N)
  correctedTTR: number;   // CTTR = V / sqrt(2N)
  logTTR: number;         // log(V) / log(N)
  lexicalDensity: number; // content words / total words
  hapaxLegomenaCount: number; // words occurring once
  hapaxPercentage: number;
  disLegomenaCount: number;   // words occurring twice
  disPercentage: number;
  frequencyDistribution: Array<{
    word: string;
    count: number;
    frequency: number;
    isStopword: boolean;
    syllables: number;
  }>;
  stopwordCount: number;
  stopwordPercentage: number;
  contentWordCount: number;
}

export interface SentenceAnalysis {
  totalSentences: number;
  averageSentenceLength: number; // words per sentence
  medianSentenceLength: number;
  minSentenceLength: number;
  maxSentenceLength: number;
  sentenceLengthVariance: number;
  sentenceLengthStdDev: number;
  coefficientOfVariation: number; // stdDev / mean (Burstiness metric)
  sentenceLengthDistribution: {
    short: number;      // < 10 words
    medium: number;     // 10 - 20 words
    long: number;       // 21 - 35 words
    veryLong: number;   // > 35 words
  };
  starterDistribution: Record<string, number>;
  starterTypeDistribution: Record<string, number>;
  repetitiveConsecutiveStarters: Array<{
    starter: string;
    sentenceIndices: number[];
    count: number;
  }>;
  longestSentence: SentenceInfo | null;
  shortestSentence: SentenceInfo | null;
  punctuationDistribution: Record<string, number>;
}

export interface ParagraphAnalysis {
  totalParagraphs: number;
  averageWordsPerParagraph: number;
  averageSentencesPerParagraph: number;
  paragraphLengthStdDev: number;
  paragraphs: ParagraphInfo[];
  transitionFrequency: Record<string, number>;
  totalTransitionsFound: number;
  transitionsPerParagraph: number;
}

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  colemanLiau: number;
  smogIndex: number;
  automatedReadabilityIndex: number;
  consensusGradeLevel: number;
  readingEaseLabel: string;
  gradeLevelInterpretation: string;
  estimatedReadingTimeMinutes: number;
  estimatedSpeakingTimeMinutes: number;
}

export interface RepetitionAnalysis {
  repeatedBigrams: Array<{ phrase: string; count: number }>;
  repeatedTrigrams: Array<{ phrase: string; count: number }>;
  repeatedFourgrams: Array<{ phrase: string; count: number }>;
  clicheAndFillerHits: Array<{ phrase: string; count: number; category: string; suggestion: string }>;
  repetitiveSentenceStarters: Array<{ starter: string; count: number; indices: number[] }>;
  duplicateSentences: Array<{ sentence: string; count: number; indices: number[] }>;
  repetitionIndex: number; // 0-100, higher means more repetitive
}

export interface WritingQualityScore {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  verdict: string;
  subscores: {
    readabilityAndFlow: number;     // 0 - 100
    lexicalDiversity: number;       // 0 - 100
    structuralRhythm: number;       // 0 - 100 (burstiness & variety)
    concisenessAndClarity: number;  // 0 - 100 (penalizes clichés & repetition)
    mechanicsAndBalance: number;    // 0 - 100
  };
  stylometricTendency: {
    burstinessScore: number; // 0-100 (human prose typically has higher burstiness CV > 0.45)
    cadenceUniformity: 'Natural/Varied' | 'Moderately Uniform' | 'Highly Monotonous (Synthetic Tendency)';
    transitionDensity: 'Sparse' | 'Balanced' | 'Heavy / Over-Signposted';
    lexicalFlatteningIndex: number; // 0-100
  };
  recommendations: Array<{
    type: 'success' | 'warning' | 'info' | 'danger';
    category: string;
    message: string;
    action: string;
  }>;
}

export interface AuditReport {
  id: string;
  timestamp: string;
  sourceType: 'raw_text' | 'sample' | 'file_upload';
  fileName?: string;
  rawText: string;
  wordStats: WordStatistics;
  vocabulary: VocabularyAnalysis;
  sentences: SentenceAnalysis;
  sentenceList: SentenceInfo[];
  paragraphs: ParagraphAnalysis;
  readability: ReadabilityMetrics;
  repetition: RepetitionAnalysis;
  quality: WritingQualityScore;
}
