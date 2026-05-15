import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, scans, findings, type Product } from '@/lib/db/schema';
import { SCRAPERS, PLATFORMS } from '@/lib/scrapers';
import type { PlatformId, Listing } from '@/lib/scrapers/types';
import { matchListingToProduct } from './match';

// Similarity threshold above which a listing becomes a stored finding.
// 0.25 is intentionally generous — we'd rather over-record candidates
// and let the operator dismiss noise than miss listings entirely.
const FINDING_THRESHOLD = 0.25;

export interface ScanSummary {
  tenantId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  perPlatform: Array<{
    platform: PlatformId;
    productsRun: number;
    completed: number;
    blocked: number;
    failed: number;
    candidatesFound: number;
  }>;
  totalFindings: number;
}

export async function runScanForTenant(tenantId: string): Promise<ScanSummary> {
  const startedAt = new Date();
  const t0 = Date.now();

  const productRows = await db
    .select()
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.active, true)));

  const summary: ScanSummary = {
    tenantId,
    startedAt: startedAt.toISOString(),
    completedAt: '',
    durationMs: 0,
    perPlatform: PLATFORMS.map((p) => ({
      platform: p,
      productsRun: 0,
      completed: 0,
      blocked: 0,
      failed: 0,
      candidatesFound: 0,
    })),
    totalFindings: 0,
  };

  // Fan out the (product × platform) grid in parallel; per-scrape timeouts cap wall-time.
  const jobs = productRows.flatMap((p) =>
    PLATFORMS.map((platform) => ({
      product: p,
      platform,
      run: () => scanProductOnPlatform(tenantId, p, platform),
    })),
  );
  const settled = await Promise.allSettled(jobs.map((j) => j.run()));
  for (let i = 0; i < settled.length; i++) {
    const { platform } = jobs[i];
    const slot = summary.perPlatform.find((s) => s.platform === platform)!;
    slot.productsRun += 1;
    const r = settled[i];
    if (r.status === 'rejected') {
      slot.failed += 1;
      continue;
    }
    const result = r.value;
    if (result.status === 'completed') {
      slot.completed += 1;
      slot.candidatesFound += result.candidatesFound;
      summary.totalFindings += result.candidatesFound;
    } else if (result.status === 'blocked') {
      slot.blocked += 1;
    } else {
      slot.failed += 1;
    }
  }

  summary.completedAt = new Date().toISOString();
  summary.durationMs = Date.now() - t0;
  return summary;
}

type ScanResult =
  | { status: 'completed'; candidatesFound: number }
  | { status: 'blocked'; reason: string }
  | { status: 'failed'; error: string };

async function scanProductOnPlatform(
  tenantId: string,
  product: Product,
  platform: PlatformId,
): Promise<ScanResult> {
  const [scan] = await db
    .insert(scans)
    .values({
      tenantId,
      productId: product.id,
      platform,
      status: 'running',
    })
    .returning({ id: scans.id });

  try {
    const scraper = SCRAPERS[platform];
    const queries = buildQueries(product);
    let allListings: Listing[] = [];
    let blockedReason: string | null = null;
    let failed: string | null = null;

    for (const q of queries) {
      const outcome = await scraper.search({ platform, keyword: q, limit: 20 });
      if (outcome.status === 'completed') {
        allListings = allListings.concat(outcome.listings);
      } else if (outcome.status === 'blocked') {
        blockedReason = outcome.reason;
      } else {
        failed = outcome.error;
      }
    }

    // Dedupe by URL
    const seen = new Set<string>();
    const unique = allListings.filter((l) => {
      if (seen.has(l.url)) return false;
      seen.add(l.url);
      return true;
    });

    if (unique.length === 0) {
      if (blockedReason) {
        await db
          .update(scans)
          .set({ status: 'blocked', completedAt: new Date(), error: blockedReason })
          .where(eq(scans.id, scan.id));
        return { status: 'blocked', reason: blockedReason };
      }
      if (failed) {
        await db
          .update(scans)
          .set({ status: 'failed', completedAt: new Date(), error: failed })
          .where(eq(scans.id, scan.id));
        return { status: 'failed', error: failed };
      }
      await db
        .update(scans)
        .set({ status: 'completed', completedAt: new Date(), candidatesFound: 0 })
        .where(eq(scans.id, scan.id));
      return { status: 'completed', candidatesFound: 0 };
    }

    // Score each listing, persist the ones above threshold
    let saved = 0;
    for (const listing of unique) {
      const match = await matchListingToProduct(listing, product, { fetchImage: false });
      if (match.similarity < FINDING_THRESHOLD) continue;

      // Avoid duplicate finding per (tenant, listing_url)
      const existing = await db
        .select({ id: findings.id })
        .from(findings)
        .where(and(eq(findings.tenantId, tenantId), eq(findings.listingUrl, listing.url)))
        .limit(1);
      if (existing.length > 0) continue;

      await db.insert(findings).values({
        tenantId,
        productId: product.id,
        scanId: scan.id,
        platform: listing.platform,
        listingUrl: listing.url,
        listingTitle: listing.title,
        sellerName: listing.sellerName,
        sellerUrl: listing.sellerUrl,
        priceIdr: listing.priceIdr,
        imageUrl: listing.imageUrl,
        matchedKeywords: match.matchedKeywords,
        matchedPatterns: [],
        similarityScore: match.similarity.toFixed(3),
        status: 'new',
        notes: `auto: text=${match.textSimilarity}, img=${match.imageSimilarity ?? 'n/a'}, kw=[${match.matchedKeywords.join(',')}]`,
      });
      saved += 1;
    }

    await db
      .update(scans)
      .set({ status: 'completed', completedAt: new Date(), candidatesFound: saved })
      .where(eq(scans.id, scan.id));
    return { status: 'completed', candidatesFound: saved };
  } catch (err) {
    await db
      .update(scans)
      .set({ status: 'failed', completedAt: new Date(), error: String(err).slice(0, 500) })
      .where(eq(scans.id, scan.id));
    return { status: 'failed', error: String(err) };
  }
}

function buildQueries(product: Product): string[] {
  const base = [`${product.brand ?? ''} ${product.name}`.trim(), product.name].filter(Boolean);
  const kw = (product.keywords ?? []).slice(0, 1);
  const set = new Set<string>([...base, ...kw].map((s) => s.trim()).filter((s) => s.length >= 3));
  return Array.from(set).slice(0, 2);
}
