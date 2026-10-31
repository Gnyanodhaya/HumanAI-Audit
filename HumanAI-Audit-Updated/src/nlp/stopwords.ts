/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ENGLISH_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has',
  'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her',
  'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some',
  'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would',
  'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours',
  'yourself', 'yourselves'
]);

export const TRANSITION_PHRASES: string[] = [
  'furthermore', 'moreover', 'in addition', 'additionally', 'consequently',
  'as a result', 'on the other hand', 'in contrast', 'nevertheless', 'nonetheless',
  'subsequently', 'in conclusion', 'to summarize', 'in summary', 'overall',
  'ultimately', 'notably', 'importantly', 'specifically', 'in particular',
  'for instance', 'for example', 'similarly', 'likewise', 'first and foremost',
  'on the contrary', 'in fact', 'as such', 'henceforth', 'therefore', 'thus'
];

export interface ClicheDefinition {
  phrase: string;
  category: 'Overused Transition' | 'AI Hallmark' | 'Verbose Filler' | 'Corporate Jargon';
  suggestion: string;
}

export const CLICHE_AND_FILLER_DICTIONARY: ClicheDefinition[] = [
  { phrase: 'delve into', category: 'AI Hallmark', suggestion: 'Consider "explore", "examine", or "investigate"' },
  { phrase: 'delves into', category: 'AI Hallmark', suggestion: 'Consider "explores", "examines", or "analyzes"' },
  { phrase: 'tapestry of', category: 'AI Hallmark', suggestion: 'Consider "network", "array", or direct description' },
  { phrase: 'rich tapestry', category: 'AI Hallmark', suggestion: 'Consider "variety", "diversity", or "complex history"' },
  { phrase: 'testament to', category: 'AI Hallmark', suggestion: 'Consider "evidence of", "proof", or "shows"' },
  { phrase: 'stands as a testament', category: 'AI Hallmark', suggestion: 'Consider "demonstrates" or "illustrates"' },
  { phrase: 'beacon of', category: 'AI Hallmark', suggestion: 'Consider "model", "leader", or concrete description' },
  { phrase: 'plays a crucial role', category: 'AI Hallmark', suggestion: 'Consider "is critical", "drives", or "enables"' },
  { phrase: 'plays a pivotal role', category: 'AI Hallmark', suggestion: 'Consider "guides", "leads", or "accelerates"' },
  { phrase: 'paramount importance', category: 'AI Hallmark', suggestion: 'Consider "essential" or "vital"' },
  { phrase: 'in today\'s fast-paced world', category: 'Verbose Filler', suggestion: 'Cut entirely or state specific context' },
  { phrase: 'in the modern era', category: 'Verbose Filler', suggestion: 'Consider "today" or specify the timeframe' },
  { phrase: 'it is important to note', category: 'Verbose Filler', suggestion: 'Cut and state the point directly' },
  { phrase: 'it is worth noting', category: 'Verbose Filler', suggestion: 'Cut and state the point directly' },
  { phrase: 'needless to say', category: 'Verbose Filler', suggestion: 'Cut entirely if it is indeed needless' },
  { phrase: 'at the end of the day', category: 'Verbose Filler', suggestion: 'Consider "ultimately" or "in conclusion"' },
  { phrase: 'shed light on', category: 'Overused Transition', suggestion: 'Consider "clarify", "reveal", or "explain"' },
  { phrase: 'serves to', category: 'Verbose Filler', suggestion: 'Replace with the active verb directly' },
  { phrase: 'in order to', category: 'Verbose Filler', suggestion: 'Simply use "to"' },
  { phrase: 'due to the fact that', category: 'Verbose Filler', suggestion: 'Replace with "because"' },
  { phrase: 'for the purpose of', category: 'Verbose Filler', suggestion: 'Replace with "for" or "to"' },
  { phrase: 'in a bid to', category: 'Corporate Jargon', suggestion: 'Consider "to" or "aiming to"' },
  { phrase: 'synergy', category: 'Corporate Jargon', suggestion: 'Consider "cooperation", "teamwork", or "alignment"' },
  { phrase: 'leverage', category: 'Corporate Jargon', suggestion: 'Consider "use", "apply", or "harness"' },
  { phrase: 'paradigm shift', category: 'Corporate Jargon', suggestion: 'Consider "fundamental change" or "transformation"' },
  { phrase: 'holistic approach', category: 'Corporate Jargon', suggestion: 'Consider "integrated view" or "complete plan"' }
];

export const PRONOUN_STARTERS = new Set(['i', 'we', 'you', 'he', 'she', 'it', 'they', 'this', 'that', 'these', 'those', 'my', 'our', 'their', 'his', 'her']);
export const CONJUNCTION_STARTERS = new Set(['and', 'but', 'or', 'so', 'yet', 'for', 'nor', 'however', 'moreover', 'furthermore', 'therefore', 'although', 'because', 'while', 'since', 'though', 'whereas']);
export const ADVERB_STARTERS = new Set(['finally', 'first', 'firstly', 'secondly', 'thirdly', 'then', 'now', 'often', 'sometimes', 'usually', 'clearly', 'notably', 'recently', 'importantly', 'overall', 'ultimately', 'indeed', 'perhaps', 'fortunately', 'unfortunately']);
export const ARTICLE_STARTERS = new Set(['the', 'a', 'an']);
export const PREPOSITION_STARTERS = new Set(['in', 'on', 'at', 'with', 'by', 'from', 'to', 'for', 'about', 'under', 'over', 'through', 'during', 'before', 'after']);
