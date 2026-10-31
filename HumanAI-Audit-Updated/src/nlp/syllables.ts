/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Accurately estimates syllable count for an English word using
 * phonotactic rules, dipthong clustering, and suffix/prefix heuristics.
 */
export function countSyllables(word: string): number {
  if (!word) return 0;
  
  // Clean word: lowercase, strip non-alpha
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length === 0) return 0;
  if (clean.length <= 3) return 1;

  // Specific common overrides / irregular words
  const overrides: Record<string, number> = {
    'the': 1, 'and': 1, 'are': 1, 'you': 1, 'one': 1, 'two': 1, 'three': 1,
    'four': 1, 'five': 1, 'six': 1, 'eight': 1, 'nine': 1, 'twelve': 1,
    'business': 2, 'every': 2, 'family': 3, 'favorite': 3, 'interesting': 4,
    'different': 3, 'temperature': 4, 'vegetable': 4, 'chocolate': 3,
    'queue': 1, 'rhythm': 2, 'syllable': 3, 'area': 3, 'idea': 3,
    'create': 2, 'creative': 3, 'creation': 3, 'poem': 2, 'poet': 2,
    'poetry': 3, 'science': 2, 'society': 4, 'reality': 4, 'theory': 3,
    'video': 3, 'audio': 3, 'radio': 3, 'lion': 2, 'quiet': 2, 'fluent': 2
  };

  if (overrides[clean]) {
    return overrides[clean];
  }

  let text = clean;

  // Handle prefix adjustments
  let prefixCount = 0;
  if (text.startsWith('co') && /^[aeiou]/i.test(text.slice(2))) {
    // cooperate, coordinate -> co-op, co-ord (2 syllables)
    prefixCount += 1;
    text = text.slice(2);
  } else if (text.startsWith('pre') && /^[aeiou]/i.test(text.slice(3))) {
    // preexist, preeminent
    prefixCount += 1;
    text = text.slice(3);
  } else if (text.startsWith('re') && /^[aeiou]/i.test(text.slice(2))) {
    // reenter, reexamine
    prefixCount += 1;
    text = text.slice(2);
  }

  // Handle silent suffixes
  // -ed ending: past tense is usually silent unless preceded by t or d (e.g. walked=1, wanted=2)
  if (text.endsWith('ed')) {
    if (!text.endsWith('ted') && !text.endsWith('ded')) {
      text = text.slice(0, -2);
    }
  } else if (text.endsWith('es')) {
    // -es ending: silent unless preceded by s, z, x, ch, sh
    if (!/(?:[sxz]|ch|sh)es$/.test(text)) {
      text = text.slice(0, -2);
    }
  } else if (text.endsWith('e') && !text.endsWith('ee') && !text.endsWith('le')) {
    // silent ending e
    text = text.slice(0, -1);
  }

  // Count vowel groups
  // Group consecutive vowels into single syllable (diphthongs/triphthongs)
  const vowelMatches = text.match(/[aeiouy]+/g);
  let count = vowelMatches ? vowelMatches.length : 0;

  // Words ending in consonant + le (e.g. table, bottle, little) add 1 syllable if not counted
  if (/[bcdfghjklmnpqrstvwxyz]le$/.test(clean) && !text.endsWith('le')) {
    count += 1;
  }

  // -ia, -io, -iu, -eo, -ua, -uo vowel pairs often split into two syllables (e.g. medium, mania, radio, foliage)
  // But -tion, -sion, -cian, -tian are pronounced as a single syllable (/shun/), NOT hiatus
  const nonHiatusClean = clean.replace(/(?:tion|sion|cian|tian)/g, '');
  const hiatusMatches = nonHiatusClean.match(/(?:[bcdfgjklmnpqrstvwxyz])(?:ia|io|iu|eo|ua|uo)/g);
  if (hiatusMatches) {
    count += hiatusMatches.length;
  }

  // -ing ending adds a syllable
  if (clean.endsWith('ing') && !text.endsWith('ing')) {
    count += 1;
  }

  const total = prefixCount + count;
  return Math.max(1, total);
}

/**
 * Checks whether a word is considered 'complex' for readability metrics
 * (3 or more syllables, excluding common 2-syllable suffixes like -ed, -es, -ing).
 */
export function isComplexWord(word: string, syllables: number): boolean {
  if (syllables < 3) return false;
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  // Ignore proper nouns starting with uppercase in raw text (handled in caller)
  // Gunning Fog excludes words that become 3 syllables only because of -ed, -es, or -ing
  if (clean.endsWith('ed') || clean.endsWith('es') || clean.endsWith('ing')) {
    const baseSyllables = countSyllables(clean.replace(/(?:ed|es|ing)$/, ''));
    if (baseSyllables < 3) return false;
  }
  return true;
}
