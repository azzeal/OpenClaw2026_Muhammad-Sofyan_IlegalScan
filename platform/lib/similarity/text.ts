function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(
    normalize(s)
      .split(' ')
      .filter((t) => t.length >= 2),
  );
}

// Jaccard token overlap between two strings.
export function textSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return inter / union;
}

// Returns the count of keyword tokens present in `haystack` (case-insensitive).
export function keywordHits(haystack: string, keywords: string[]): string[] {
  const low = haystack.toLowerCase();
  const hits: string[] = [];
  for (const k of keywords) {
    if (typeof k !== 'string') continue;
    const norm = k.trim().toLowerCase();
    if (norm && low.includes(norm)) hits.push(k.trim());
  }
  return hits;
}
