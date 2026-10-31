/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ParagraphAnalysis,
  ReadabilityMetrics,
  RepetitionAnalysis,
  SentenceAnalysis,
  VocabularyAnalysis,
  WordStatistics,
  WritingQualityScore
} from '../types/audit.ts';

export function computeWritingQualityScore(
  wordStats: WordStatistics,
  vocab: VocabularyAnalysis,
  sentences: SentenceAnalysis,
  paragraphs: ParagraphAnalysis,
  readability: ReadabilityMetrics,
  repetition: RepetitionAnalysis
): WritingQualityScore {
  if (wordStats.totalWords < 5) {
    return {
      overallScore: 0,
      grade: 'F',
      verdict: 'Insufficient text for linguistic audit.',
      subscores: {
        readabilityAndFlow: 0,
        lexicalDiversity: 0,
        structuralRhythm: 0,
        concisenessAndClarity: 0,
        mechanicsAndBalance: 0
      },
      stylometricTendency: {
        burstinessScore: 0,
        cadenceUniformity: 'Natural/Varied',
        transitionDensity: 'Balanced',
        lexicalFlatteningIndex: 0
      },
      recommendations: [
        {
          type: 'info',
          category: 'Input Length',
          message: 'Provide at least 30-50 words for meaningful linguistic analysis.',
          action: 'Type or paste a sample text to begin.'
        }
      ]
    };
  }

  // 1. Readability & Flow (0 - 100)
  // Optimal Flesch reading ease is around 50 - 75 (accessible, clear)
  let readabilityFlow = 85;
  const fre = readability.fleschReadingEase;
  if (fre < 30) {
    readabilityFlow -= 35; // Too dense / academic jargon
  } else if (fre < 50) {
    readabilityFlow -= 15;
  } else if (fre > 85) {
    readabilityFlow -= 10; // overly simplistic
  }

  // Penalty if average sentence length is extreme (>30 words or <8 words)
  const asl = sentences.averageSentenceLength;
  if (asl > 30) {
    readabilityFlow -= 20;
  } else if (asl > 24) {
    readabilityFlow -= 10;
  } else if (asl < 8) {
    readabilityFlow -= 15;
  }
  readabilityFlow = Math.max(10, Math.min(100, readabilityFlow));

  // 2. Lexical Diversity (0 - 100)
  // Based on TTR scaled by text size, and Hapax legomena percentage
  let lexicalScore = 70;
  if (vocab.typeTokenRatio > 0.6) lexicalScore += 15;
  else if (vocab.typeTokenRatio < 0.35) lexicalScore -= 25;
  else if (vocab.typeTokenRatio < 0.45) lexicalScore -= 10;

  if (vocab.hapaxPercentage > 50) lexicalScore += 15;
  else if (vocab.hapaxPercentage < 30) lexicalScore -= 15;

  if (vocab.lexicalDensity > 55) lexicalScore += 10;
  else if (vocab.lexicalDensity < 40) lexicalScore -= 15;
  lexicalScore = Math.max(15, Math.min(100, lexicalScore));

  // 3. Structural Rhythm & Burstiness (0 - 100)
  // Human writing has organic variance in sentence length (CV usually 0.40 - 0.75).
  // AI synthetic text frequently has uniform sentence lengths (CV < 0.30).
  const cv = sentences.coefficientOfVariation;
  let rhythmScore = 50;
  if (cv >= 0.45 && cv <= 0.85) {
    rhythmScore = 95; // Excellent organic rhythm
  } else if (cv >= 0.35 && cv < 0.45) {
    rhythmScore = 80; // Good rhythm
  } else if (cv < 0.25) {
    rhythmScore = 45; // Robotic / highly uniform cadence
  } else if (cv > 0.95) {
    rhythmScore = 65; // Highly erratic
  }

  // Penalty for consecutive starters
  const consecutiveRepetitions = sentences.repetitiveConsecutiveStarters.reduce((acc, c) => acc + c.count, 0);
  if (consecutiveRepetitions > 2) {
    rhythmScore -= Math.min(25, consecutiveRepetitions * 5);
  }
  rhythmScore = Math.max(15, Math.min(100, rhythmScore));

  // 4. Conciseness & Clarity (0 - 100)
  // Penalizes repetition index, cliché hits, and duplicate sentences
  let clarityScore = 100;
  clarityScore -= (repetition.repetitionIndex * 0.6);
  clarityScore -= (repetition.clicheAndFillerHits.length * 4);
  clarityScore -= (repetition.duplicateSentences.length * 15);
  clarityScore = Math.max(20, Math.min(100, Math.round(clarityScore)));

  // 5. Mechanics & Balance (0 - 100)
  let mechanicsScore = 85;
  // Complex word ratio balance (ideally between 8% and 25%)
  const cwp = wordStats.complexWordsPercentage;
  if (cwp > 35) mechanicsScore -= 20;
  else if (cwp < 5 && wordStats.totalWords > 50) mechanicsScore -= 15;

  // Paragraph balance
  if (paragraphs.totalParagraphs > 1 && paragraphs.paragraphLengthStdDev > 50) {
    mechanicsScore -= 10;
  }
  mechanicsScore = Math.max(20, Math.min(100, mechanicsScore));

  // Weighted overall score
  // Readability (30%) + Lexical (25%) + Rhythm (20%) + Clarity (15%) + Mechanics (10%)
  const overallScore = Math.round(
    (readabilityFlow * 0.30) +
    (lexicalScore * 0.25) +
    (rhythmScore * 0.20) +
    (clarityScore * 0.15) +
    (mechanicsScore * 0.10)
  );

  // Letter Grade
  let grade: WritingQualityScore['grade'] = 'B';
  let verdict = 'Good quality writing with balanced readability.';
  if (overallScore >= 92) {
    grade = 'A+';
    verdict = 'Exemplary prose: exceptional lexical variety, dynamic sentence cadence, and crisp clarity.';
  } else if (overallScore >= 83) {
    grade = 'A';
    verdict = 'High quality writing: engaging flow, rich vocabulary, and clear structural rhythm.';
  } else if (overallScore >= 72) {
    grade = 'B';
    verdict = 'Solid communication: clear and readable, with minor opportunities to vary sentence structure.';
  } else if (overallScore >= 60) {
    grade = 'C';
    verdict = 'Adequate but uneven: noticeable repetition or monotone rhythm affecting readability.';
  } else if (overallScore >= 45) {
    grade = 'D';
    verdict = 'Needs revision: repetitive syntax, cliché patterns, or excessive sentence density.';
  } else {
    grade = 'F';
    verdict = 'Major structural and clarity issues requiring comprehensive rewriting.';
  }

  // Stylometric Tendency
  const burstinessScore = Math.round(Math.min(100, (cv / 0.70) * 100));
  let cadenceUniformity: WritingQualityScore['stylometricTendency']['cadenceUniformity'] = 'Natural/Varied';
  if (cv < 0.28) {
    cadenceUniformity = 'Highly Monotonous (Synthetic Tendency)';
  } else if (cv < 0.40) {
    cadenceUniformity = 'Moderately Uniform';
  }

  let transitionDensity: WritingQualityScore['stylometricTendency']['transitionDensity'] = 'Balanced';
  if (paragraphs.transitionsPerParagraph > 2.5) {
    transitionDensity = 'Heavy / Over-Signposted';
  } else if (paragraphs.transitionsPerParagraph < 0.5) {
    transitionDensity = 'Sparse';
  }

  const lexicalFlatteningIndex = Math.round(Math.max(0, 100 - (vocab.hapaxPercentage * 1.5)));

  // Recommendations
  const recommendations: WritingQualityScore['recommendations'] = [];

  if (sentences.coefficientOfVariation < 0.30 && sentences.totalSentences >= 4) {
    recommendations.push({
      type: 'warning',
      category: 'Rhythm & Cadence',
      message: 'Sentence lengths are highly uniform (burstiness CV < 0.30), creating a flat or automated feel.',
      action: 'Vary sentence length: intersperse punchy short sentences (5-10 words) among longer compound sentences.'
    });
  }

  if (repetition.clicheAndFillerHits.length > 0) {
    const topCliches = repetition.clicheAndFillerHits.slice(0, 3).map(c => `"${c.phrase}"`).join(', ');
    recommendations.push({
      type: 'warning',
      category: 'Clichés & Stock Phrases',
      message: `Detected recurring stock phrases: ${topCliches}.`,
      action: 'Replace generic filler with precise verbs and concrete evidence.'
    });
  }

  if (asl > 26) {
    recommendations.push({
      type: 'warning',
      category: 'Sentence Length',
      message: `Average sentence length is high (${asl} words/sentence). Readers may experience cognitive fatigue.`,
      action: 'Break compound thoughts into distinct declarative sentences.'
    });
  }

  if (vocab.typeTokenRatio < 0.40 && wordStats.totalWords > 80) {
    recommendations.push({
      type: 'info',
      category: 'Vocabulary Diversity',
      message: `Type-Token Ratio is relatively low (${vocab.typeTokenRatio}). Words are repeated frequently.`,
      action: 'Use synonyms or rephrase repeating motifs to broaden vocabulary richness.'
    });
  }

  if (sentences.repetitiveConsecutiveStarters.length > 0) {
    const topConsecutive = sentences.repetitiveConsecutiveStarters[0];
    recommendations.push({
      type: 'warning',
      category: 'Sentence Openers',
      message: `Sentences ${topConsecutive.sentenceIndices.join(', ')} open with the same word ("${topConsecutive.starter}").`,
      action: 'Invert sentence clauses or start with prepositional or participial phrases to vary flow.'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      category: 'Style & Balance',
      message: 'Prose exhibits excellent sentence variation, rich vocabulary, and clean readability.',
      action: 'Your draft is well-calibrated for clarity and reader engagement.'
    });
  }

  return {
    overallScore,
    grade,
    verdict,
    subscores: {
      readabilityAndFlow: readabilityFlow,
      lexicalDiversity: lexicalScore,
      structuralRhythm: rhythmScore,
      concisenessAndClarity: clarityScore,
      mechanicsAndBalance: mechanicsScore
    },
    stylometricTendency: {
      burstinessScore,
      cadenceUniformity,
      transitionDensity,
      lexicalFlatteningIndex
    },
    recommendations
  };
}
