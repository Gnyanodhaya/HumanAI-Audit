/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppUser, AuditHistoryRecord } from '../types/auth.ts';
import { AuditReport } from '../types/audit.ts';

const USER_SESSION_KEY = 'humanai_active_user';
const USERS_DB_KEY = 'humanai_registered_users';
const HISTORY_KEY_PREFIX = 'humanai_history_';
const THEME_KEY = 'humanai_theme_preference';

/**
 * Retrieves the currently logged in user session, if any
 */
export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Saves current user session
 */
export function setCurrentUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch {
    // LocalStorage quota or access error
  }
}

/**
 * Authenticates user with email and password without limits
 */
export function authenticateUser(email: string, _password: string): AppUser {
  const cleanEmail = email.trim().toLowerCase();
  const namePart = cleanEmail.split('@')[0] || 'Auditor';
  const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  // Store in registered users directory
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    const users: Record<string, AppUser> = raw ? JSON.parse(raw) : {};

    const user: AppUser = {
      email: cleanEmail,
      name: displayName,
      createdAt: users[cleanEmail]?.createdAt || new Date().toISOString()
    };

    users[cleanEmail] = user;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    setCurrentUser(user);
    return user;
  } catch {
    const fallbackUser: AppUser = {
      email: cleanEmail,
      name: displayName,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(fallbackUser);
    return fallbackUser;
  }
}

/**
 * Logs out the active user
 */
export function logoutUser(): void {
  setCurrentUser(null);
}

/**
 * Retrieves history records for a user
 */
export function getUserHistory(userEmail: string): AuditHistoryRecord[] {
  if (!userEmail) return [];
  try {
    const key = `${HISTORY_KEY_PREFIX}${userEmail.toLowerCase()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list: AuditHistoryRecord[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Saves or updates an audit report into history
 */
export function recordAuditInHistory(userEmail: string, report: AuditReport): AuditHistoryRecord {
  const email = userEmail.toLowerCase();
  const existing = getUserHistory(email);

  // Create clean snippet from text
  const cleanSnippet = report.rawText.replace(/\s+/g, ' ').trim().slice(0, 140) + '...';
  const title = report.fileName || (cleanSnippet.slice(0, 45) + '...');

  const record: AuditHistoryRecord = {
    id: report.id,
    userEmail: email,
    title,
    timestamp: report.timestamp,
    rawText: report.rawText,
    wordCount: report.wordStats.totalWords,
    sentenceCount: report.sentences.totalSentences,
    overallScore: report.quality.overallScore,
    grade: report.quality.grade,
    consensusGrade: report.readability.consensusGradeLevel,
    readingEase: report.readability.fleschReadingEase,
    burstinessCV: report.sentences.coefficientOfVariation,
    repetitionIndex: report.repetition.repetitionIndex,
    snippet: cleanSnippet
  };

  // Avoid identical consecutive duplicates
  const filtered = existing.filter(item => item.id !== record.id && item.rawText !== record.rawText);
  // Add to top of history, max 50 items
  const updated = [record, ...filtered].slice(0, 50);

  try {
    const key = `${HISTORY_KEY_PREFIX}${email}`;
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // Handle storage quota
  }

  return record;
}

/**
 * Deletes a single history record
 */
export function deleteHistoryRecord(userEmail: string, recordId: string): AuditHistoryRecord[] {
  const email = userEmail.toLowerCase();
  const existing = getUserHistory(email);
  const updated = existing.filter(r => r.id !== recordId);

  try {
    const key = `${HISTORY_KEY_PREFIX}${email}`;
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // Storage issue
  }

  return updated;
}

/**
 * Clears all history for the user
 */
export function clearAllUserHistory(userEmail: string): void {
  const email = userEmail.toLowerCase();
  try {
    const key = `${HISTORY_KEY_PREFIX}${email}`;
    localStorage.removeItem(key);
  } catch {
    // Storage issue
  }
}

/**
 * Theme is permanently set to dark mode
 */
export function getSavedTheme(): 'dark' {
  return 'dark';
}

export function saveThemePreference(_theme: 'light' | 'dark'): void {
  // Permanently dark mode
}
