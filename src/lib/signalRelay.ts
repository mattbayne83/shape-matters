import type { RelayLevel } from '../types';

// ── Replacement dictionaries ────────────────────────────────────────

const NUMBER_PATTERNS: [RegExp, string][] = [
  [/\$[\d,.]+[MBKmk]?\b/g, 'a significant amount'],
  [/\d+(\.\d+)?%/g, 'a notable percentage'],
  [/\d{2,}[\s]?PSI\b/gi, 'elevated pressure'],
  [/\d{2,}[\s]?(units?|pieces?|items?)\b/gi, 'several $1'],
  [/\b\d{3,}(,\d{3})*\b/g, 'a large number'],
];

const LOCATION_PATTERNS: [RegExp, string][] = [
  [/\b(Line|Section|Unit|Building|Terminal|Gate|Bay)\s+[A-Z0-9-]+\b/gi, 'one of our $1s'],
  [/\b[A-Z][a-z]+\s+(Corp|Inc|LLC|Ltd|Co)\b/g, 'a client'],
  [/\b[A-Z][a-z]{2,}\b(?=\s+(said|found|reported|discovered|flagged|noted))/g, 'someone'],
];

const URGENCY_REPLACEMENTS: [RegExp, string][] = [
  [/\bcritical\s+failure\b/gi, 'potential issue'],
  [/\bcritical\b/gi, 'potential'],
  [/\burgent(ly)?\b/gi, 'noteworthy'],
  [/\bimmediately\b/gi, 'when possible'],
  [/\bas soon as possible\b/gi, 'at an appropriate time'],
  [/\bemergency\b/gi, 'situation'],
  [/\bthreatening to\b/gi, 'considering'],
  [/\bdemanding\b/gi, 'requesting'],
  [/\bfailed\b/gi, 'experienced issues'],
  [/\bbroken\b/gi, 'not functioning as expected'],
  // collapse "X at elevated pressure" → "elevated pressure" (de-duplication artifact from number stripping)
  [/\w+\s+at\s+(elevated\s+pressure)\b/gi, '$1'],
];

const PASSIVE_REPLACEMENTS: [RegExp, string][] = [
  [/\bI discovered\b/gi, 'It was noted'],
  [/\bI found\b/gi, 'It was found'],
  [/\bI noticed\b/gi, 'It was observed'],
  [/\bwe need to\b/gi, 'it may be worth considering'],
  [/\bwe must\b/gi, 'it is suggested that we'],
  [/\bI recommend\b/gi, 'One option would be to'],
  [/\bwe can\b/gi, 'there may be an opportunity to'],
];

const OWNERSHIP_REPLACEMENTS: [RegExp, string][] = [
  [/\bthe team identified\b/gi, "it's been flagged"],
  [/\bthe team found\b/gi, "it's been noted"],
  [/\bthe team reported\b/gi, "it's been reported"],
  [/\bwe identified\b/gi, "it's been flagged"],
  [/\bsomeone found\b/gi, "it's been noted"],
  [/\bsomeone reported\b/gi, "it's been reported"],
  [/\bsomeone discovered\b/gi, "it's been noted"],
  [/\bour team\b/gi, 'the organization'],
];

const ACTION_REPLACEMENTS: [RegExp, string][] = [
  // collapse "we should ..." sentences to compact status language
  [/\bwe should\b[^.!?]*/gi, 'this is under review'],
  [/\bwe need to\s+(\w+)/gi, '$1ing is under review'],
  [/\bwe recommend\s+(\w+)ing\b/gi, '$1ing is being considered'],
  [/\bpropose[ds]?\s+(to\s+)?(\w+)/gi, '$2ing possibilities are being explored'],
  [/\bfix\s+(this|that|it|the)\b/gi, 'address $1 matter'],
  [/\bswitch\s+(to|from)\b/gi, 'evaluate alternatives $1'],
];

// ── Engine ──────────────────────────────────────────────────────────

function applyPatterns(text: string, patterns: [RegExp, string][]): string {
  let result = text;
  for (const [regex, replacement] of patterns) {
    result = result.replace(regex, replacement);
  }
  return result;
}

export function applyRelayTransforms(message: string, level: number): string {
  if (level <= 0 || !message) return message;

  let result = message;

  // L1-L2: Numbers + Names
  if (level >= 1) {
    result = applyPatterns(result, NUMBER_PATTERNS);
    result = applyPatterns(result, LOCATION_PATTERNS);
  }

  // L3-L5: Urgency + Passive
  if (level >= 3) {
    result = applyPatterns(result, URGENCY_REPLACEMENTS);
    result = applyPatterns(result, PASSIVE_REPLACEMENTS);
  }

  // L6+: Ownership + Action→Observation
  if (level >= 6) {
    result = applyPatterns(result, OWNERSHIP_REPLACEMENTS);
    result = applyPatterns(result, ACTION_REPLACEMENTS);
  }

  return result.replace(/\s{2,}/g, ' ').trim();
}

export function truncateRelayLevels(source: RelayLevel[], orgLevels: number): RelayLevel[] {
  const relayCount = Math.max(0, orgLevels - 1);
  return source.slice(0, Math.min(relayCount, source.length));
}
