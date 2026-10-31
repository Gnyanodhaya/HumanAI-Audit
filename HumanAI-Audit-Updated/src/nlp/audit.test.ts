/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { countSyllables, isComplexWord } from './syllables.ts';
import { splitSentences, tokenizeWords, normalizeText } from './preprocess.ts';
import { computeWordStatistics } from './wordStats.ts';
import { computeVocabularyAnalysis } from './vocabulary.ts';
import { computeSentenceAnalysis } from './sentenceAnalysis.ts';
import { computeReadabilityMetrics } from './readability.ts';
import { computeRepetitionAnalysis } from './repetition.ts';
import { computeWritingQualityScore } from './qualityScore.ts';
import { runAudit } from './auditEngine.ts';

test('Syllable counter handles monosyllabic, multisyllabic, and silent vowels', () => {
  assert.equal(countSyllables('the'), 1);
  assert.equal(countSyllables('walked'), 1); // silent -ed
  assert.equal(countSyllables('wanted'), 2); // sounded -ed
  assert.equal(countSyllables('table'), 2);  // -le ending
  assert.equal(countSyllables('communication'), 5);
  assert.equal(countSyllables('extraordinary'), 5);
  assert.equal(countSyllables('rhythm'), 2);
  assert.equal(countSyllables('area'), 3);
});

test('Complex word detection checks for 3+ syllables excluding simple suffixes', () => {
  assert.equal(isComplexWord('cat', 1), false);
  assert.equal(isComplexWord('simple', 2), false);
  assert.equal(isComplexWord('sophisticated', 5), true);
  assert.equal(isComplexWord('investigation', 5), true);
});

test('Sentence splitter preserves abbreviations, decimals, and ellipses', () => {
  const text = 'Dr. Smith met with Mr. Jones at 3.14 p.m. regarding the U.S. economy. He asked: "Is this correct?" Yes, it was... definitely.';
  const sentences = splitSentences(text);
  
  // Should NOT split on Dr., Mr., 3.14, U.S., or ...
  assert.equal(sentences.length, 3);
  assert.ok(sentences[0].includes('Dr. Smith'));
  assert.ok(sentences[0].includes('3.14'));
  assert.ok(sentences[1].includes('"Is this correct?"'));
  assert.ok(sentences[2].includes('Yes, it was... definitely.'));
});

test('Word statistics accurately calculates totals, lengths, and syllable distribution', () => {
  const text = 'The quick brown fox jumps over the lazy dog.';
  const tokens = tokenizeWords(text);
  const stats = computeWordStatistics(text, tokens);

  assert.equal(stats.totalWords, 9);
  assert.equal(stats.uniqueWords, 8); // 'the' repeats twice
  assert.ok(stats.averageWordLength > 3);
  assert.ok(stats.totalSyllables >= 9);
});

test('Vocabulary analysis computes authentic TTR, Hapax Legomena, and Lexical Density', () => {
  const sample = 'Art is long, life is short, art endures forever.';
  const tokens = tokenizeWords(sample);
  const vocab = computeVocabularyAnalysis(tokens);

  assert.equal(vocab.frequencyDistribution.find(f => f.word === 'art')?.count, 2);
  assert.equal(vocab.frequencyDistribution.find(f => f.word === 'is')?.count, 2);
  // 'long', 'life', 'short', 'endures', 'forever' appear once (5 hapax)
  assert.equal(vocab.hapaxLegomenaCount, 5);
  assert.ok(vocab.typeTokenRatio > 0 && vocab.typeTokenRatio <= 1);
  assert.ok(vocab.lexicalDensity > 0 && vocab.lexicalDensity <= 100);
});

test('Sentence analysis calculates variance, standard deviation, and burstiness CV', () => {
  const sample = 'Look at this. This is a significantly longer sentence designed to demonstrate length variation across sentences in a paragraph. Done.';
  const audit = runAudit(sample);

  assert.equal(audit.sentences.totalSentences, 3);
  assert.ok(audit.sentences.minSentenceLength <= 3);
  assert.ok(audit.sentences.maxSentenceLength >= 15);
  assert.ok(audit.sentences.sentenceLengthStdDev > 0);
  assert.ok(audit.sentences.coefficientOfVariation > 0); // Burstiness metric
});

test('Readability metrics output valid standard formula bounds', () => {
  const text = 'Simple prose is easy to read. Children like short words. The cat sat on the mat. The sun was hot today.';
  const audit = runAudit(text);

  // Flesch Reading Ease should be high (> 80) for very simple text
  assert.ok(audit.readability.fleschReadingEase > 75);
  // Flesch-Kincaid Grade should be low (< 5)
  assert.ok(audit.readability.fleschKincaidGrade < 5);
  assert.ok(audit.readability.gunningFog < 8);
  assert.ok(audit.readability.automatedReadabilityIndex < 6);
});

test('Repetition detector flags clichés and repeated n-grams', () => {
  const text = 'We must delve into this subject. It is important to note that we must delve into this subject again and again.';
  const audit = runAudit(text);

  assert.ok(audit.repetition.repeatedTrigrams.some(t => t.phrase.includes('delve into')));
  assert.ok(audit.repetition.clicheAndFillerHits.some(c => c.phrase === 'delve into'));
  assert.ok(audit.repetition.repetitionIndex > 0);
});

test('Writing quality score generates composite grade and actionable recommendations', () => {
  const text = 'The investigation of systemic anomalies necessitates a comprehensive synthesis of contemporary methodologies. In addition, further empirical verification remains crucial for validation.';
  const audit = runAudit(text);

  assert.ok(audit.quality.overallScore >= 0 && audit.quality.overallScore <= 100);
  assert.ok(['A+', 'A', 'B', 'C', 'D', 'F'].includes(audit.quality.grade));
  assert.ok(audit.quality.recommendations.length > 0);
  assert.ok(audit.quality.subscores.readabilityAndFlow >= 0);
});
