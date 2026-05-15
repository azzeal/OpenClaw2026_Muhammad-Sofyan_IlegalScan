import type { Scraper, ScrapeQuery, ScrapeOutcome } from './types';
import { detectBlock, httpGet } from './http';

// TikTok Shop's search surface is region-gated and aggressively anti-bot.
// This scraper attempts the public discovery endpoint but is expected to
// be blocked from most serverless egress IPs. We surface that honestly
// rather than fabricate results.
export const tiktokShopScraper: Scraper = {
  platform: 'tiktokshop',
  async search({ keyword }: ScrapeQuery): Promise<ScrapeOutcome> {
    const url = `https://shop.tiktok.com/view/search?q=${encodeURIComponent(keyword)}`;
    try {
      const r = await httpGet(url, { timeoutMs: 12000 });
      const block = detectBlock(r.body, r.status);
      if (block) return { status: 'blocked', reason: block };
      if (r.status >= 400) return { status: 'failed', error: `http_${r.status}` };

      // The page is a JS shell; no usable SSR. Mark as blocked-by-design.
      const hasJsShell = r.body.includes('__INITIAL_STATE__') || r.body.includes('"id":"app"');
      if (hasJsShell) {
        return {
          status: 'blocked',
          reason: 'js-only-shell (requires headless browser, not supported on Vercel free/pro)',
        };
      }

      return { status: 'completed', listings: [] };
    } catch (err) {
      return { status: 'failed', error: String(err) };
    }
  },
};
