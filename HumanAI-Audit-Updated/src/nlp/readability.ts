/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadabilityMetrics, SentenceInfo, TokenInfo, WordStatistics } from '../types/audit.ts';

export function computeReadabilityMetrics(
  tokens: TokenInfo[],
  sentences: SentenceInfo[],
  wordStats: WordStatistics
): ReadabilityMetrics {
  const totalWords = tokens.length;
  const totalSentences = Math.max(1, sentences.length);
  const totalSyllables = wordStats.totalSyllables;
  const complexWords = wordStats.complexWords;
  const totalCharsNoSpaces = wordStats.totalCharactersNoSpaces;

  if (totalWords === 0) {
    return {
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      gunningFog: 0,
      colemanLiau: 0,
      smogIndex: 0,
      automatedReadabilityIndex: 0,
      consensusGradeLevel: 0,
      readingEaseLabel: 'N/A',
      gradeLevelInterpretation: 'No text provided',
      estimatedReadingTimeMinutes: 0,
      estimatedSpeakingTimeMinutes: 0
    };
  }

  const wordsPerSentence = totalWords / totalSentences;
  const syllablesPerWord = totalSyllables / totalWords;

  // 1. Flesch Reading Ease
  // 206.835 - (1.015 * ASL) - (84.6 * ASW)
  const rawFRE = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
  const fleschReadingEase = Number(Math.max(0, Math.min(100, rawFRE)).toFixed(1));

  // 2. Flesch-Kincaid Grade Level
  // 0.39 * ASL + 11.8 * ASW - 15.59
  const rawFKGL = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;
  const fleschKincaidGrade = Number(Math.max(0, rawFKGL).toFixed(1));

  // 3. Gunning Fog Index
  // 0.4 * [ ASL + 100 * (complex_words / words) ]
  const complexPercentage = (complexWords / totalWords) * 100;
  const rawFog = 0.4 * (wordsPerSentence + complexPercentage);
  const gunningFog = Number(Math.max(0, rawFog).toFixed(1));

  // 4. Coleman-Liau Index
  // 0.0588 * L - 0.296 * S - 15.8
  // L = avg letters per 100 words, S = avg sentences per 100 words
  const lettersPer100 = (totalCharsNoSpaces / totalWords) * 100;
  const sentencesPer100 = (totalSentences / totalWords) * 100;
  const rawCLI = (0.0588 * lettersPer100) - (0.296 * sentencesPer100) - 15.8;
  const colemanLiau = Number(Math.max(0, rawCLI).toFixed(1));

  // 5. SMOG Index
  // 1.0430 * sqrt(polysyllables * (30 / sentences)) + 3.1291
  const polysyllables = wordStats.polysyllabicWords;
  const smogFormulaBase = polysyllables * (30 / totalSentences);
  const rawSMOG = (1.0430 * Math.sqrt(Math.max(0, smogFormulaBase))) + 3.1291;
  const smogIndex = Number(Math.max(0, rawSMOG).toFixed(1));

  // 6. Automated Readability Index (ARI)
  // 4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43
  const charsPerWord = totalCharsNoSpaces / totalWords;
  const rawARI = (4.71 * charsPerWord) + (0.5 * wordsPerSentence) - 21.43;
  const automatedReadabilityIndex = Number(Math.max(0, rawARI).toFixed(1));

  // Consensus Grade Level (trimmed average of grade indices)
  const gradeIndices = [fleschKincaidGrade, gunningFog, colemanLiau, smogIndex, automatedReadabilityIndex]
    .filter(g => g > 0);
  const consensusGradeLevel = gradeIndices.length > 0
    ? Number((gradeIndices.reduce((a, b) => a + b, 0) / gradeIndices.length).toFixed(1))
    : 0;

  // Reading Ease Label
  let readingEaseLabel = 'Standard';
  if (fleschReadingEase >= 90) readingEaseLabel = 'Very Easy (5th Grade)';
  else if (fleschReadingEase >= 80) readingEaseLabel = 'Easy (6th Grade)';
  else if (fleschReadingEase >= 70) readingEaseLabel = 'Fairly Easy (7th Grade)';
  else if (fleschReadingEase >= 60) readingEaseLabel = 'Standard (8th-9th Grade)';
  else if (fleschReadingEase >= 50) readingEaseLabel = 'Fairly Difficult (10th-12th Grade)';
  else if (fleschReadingEase >= 30) readingEaseLabel = 'Difficult (College Level)';
  else readingEaseLabel = 'Very Confusing (Graduate / Academic)';

  // Grade Interpretation
  let gradeLevelInterpretation = 'General Adult Audience';
  if (consensusGradeLevel <= 6) gradeLevelInterpretation = 'Elementary / Accessible to Everyone';
  else if (consensusGradeLevel <= 8) gradeLevelInterpretation = 'Middle School / Broad Public';
  else if (consensusGradeLevel <= 12) gradeLevelInterpretation = 'High School / General Audience';
  else if (consensusGradeLevel <= 16) gradeLevelInterpretation = 'Undergraduate / Professional Audience';
  else gradeLevelInterpretation = 'Specialized / Academic & Scholarly';

  // Time estimates
  // Reading: ~220 words per minute
  // Speaking: ~135 words per minute
  const estimatedReadingTimeMinutes = Number((totalWords / 220).toFixed(1));
  const estimatedSpeakingTimeMinutes = Number((totalWords / 135).toFixed(1));

  return {
    fleschReadingEase,
    fleschKincaidGrade,
    gunningFog,
    colemanLiau,
    smogIndex,
    automatedReadabilityIndex,
    consensusGradeLevel,
    readingEaseLabel,
    gradeLevelInterpretation,
    estimatedReadingTimeMinutes,
    estimatedSpeakingTimeMinutes
  };
}
