/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppUser {
  email: string;
  name: string;
  createdAt: string;
}

export interface AuditHistoryRecord {
  id: string;
  userEmail: string;
  title: string;
  timestamp: string;
  rawText: string;
  wordCount: number;
  sentenceCount: number;
  overallScore: number;
  grade: string;
  consensusGrade: number;
  readingEase: number;
  burstinessCV: number;
  repetitionIndex: number;
  snippet: string;
}
