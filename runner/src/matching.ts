import type { Pattern } from './patterns.js';

export interface MatchResult {
  matched: boolean;
  signals: string[];
}

// Patterns are authored with PCRE-style inline mode modifiers like `(?i)`,
// which JavaScript's RegExp doesn't accept. Strip the leading group and
// promote its letters to flags.
function compile(rx: string): RegExp | null {
  let flags = '';
  let body = rx;
  const inline = body.match(/^\(\?([imsux]+)\)/);
  if (inline) {
    flags = inline[1].replace(/[^imsu]/g, '');
    body = body.slice(inline[0].length);
  }
  try {
    return new RegExp(body, flags);
  } catch {
    return null;
  }
}

export function matchPattern(haystack: string, pattern: Pattern): MatchResult {
  const lower = haystack.toLowerCase();
  const signals: string[] = [];

  for (const kw of pattern.keywords ?? []) {
    if (typeof kw !== 'string' || kw.length === 0) continue;
    if (lower.includes(kw.toLowerCase())) signals.push(`keyword:${kw}`);
  }

  for (const rx of pattern.regex_hints ?? []) {
    if (typeof rx !== 'string') continue;
    const re = compile(rx);
    if (re && re.test(haystack)) signals.push(`regex:${rx}`);
  }

  return { matched: signals.length > 0, signals };
}
