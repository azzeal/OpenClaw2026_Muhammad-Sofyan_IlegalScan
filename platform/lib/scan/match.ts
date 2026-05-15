import type { Listing } from '@/lib/scrapers/types';
import type { Product } from '@/lib/db/schema';
import { textSimilarity, keywordHits } from '@/lib/similarity/text';
import { imageAverageHash, hashSimilarity } from '@/lib/similarity/phash';
import { httpGetBytes } from '@/lib/scrapers/http';

export interface MatchResult {
  matchedKeywords: string[];
  textSimilarity: number;
  imageSimilarity: number | null;
  similarity: number;
}

// Combined similarity:
//   - keyword hits get a +0.20 boost each, capped at +0.60
//   - text Jaccard contributes up to 0.40
//   - image pHash contributes up to 0.40 if both reference + listing images available
//   - final score clamped to [0, 1]
// If neither text nor keywords match at all, we skip image hashing (cheap exit).
export async function matchListingToProduct(
  listing: Listing,
  product: Pick<Product, 'name' | 'brand' | 'keywords' | 'referenceImageUrl'>,
  opts: { fetchImage?: boolean } = {},
): Promise<MatchResult> {
  const fetchImage = opts.fetchImage ?? true;

  const haystack = `${listing.title} ${listing.sellerName ?? ''}`;
  const target = `${product.name} ${product.brand ?? ''}`;
  const text = textSimilarity(haystack, target);

  const kwHits = keywordHits(haystack, product.keywords ?? []);
  const kwBoost = Math.min(0.6, kwHits.length * 0.2);

  // Cheap exit: nothing matched textually, no point in image hashing
  if (text < 0.05 && kwHits.length === 0) {
    return { matchedKeywords: [], textSimilarity: 0, imageSimilarity: null, similarity: 0 };
  }

  let imageSim: number | null = null;
  if (fetchImage && product.referenceImageUrl && listing.imageUrl) {
    const [refBuf, listBuf] = await Promise.all([
      httpGetBytes(product.referenceImageUrl),
      httpGetBytes(listing.imageUrl),
    ]);
    if (refBuf && listBuf) {
      const [refHash, listHash] = await Promise.all([imageAverageHash(refBuf), imageAverageHash(listBuf)]);
      if (refHash !== null && listHash !== null) {
        imageSim = hashSimilarity(refHash, listHash);
      }
    }
  }

  const textComp = Math.min(0.4, text * 0.4);
  const imageComp = imageSim !== null ? Math.min(0.4, imageSim * 0.4) : 0;
  const similarity = Math.min(1, kwBoost + textComp + imageComp);

  return {
    matchedKeywords: kwHits,
    textSimilarity: round3(text),
    imageSimilarity: imageSim !== null ? round3(imageSim) : null,
    similarity: round3(similarity),
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
