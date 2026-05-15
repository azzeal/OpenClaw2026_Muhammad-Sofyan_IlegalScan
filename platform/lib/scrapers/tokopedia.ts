import * as cheerio from 'cheerio';
import type { Scraper, ScrapeQuery, ScrapeOutcome, Listing } from './types';
import { detectBlock, httpGet } from './http';

export const tokopediaScraper: Scraper = {
  platform: 'tokopedia',
  async search({ keyword, limit = 20 }: ScrapeQuery): Promise<ScrapeOutcome> {
    const url = `https://www.tokopedia.com/search?navsource=&page=1&q=${encodeURIComponent(keyword)}&srp_component_id=02.01.00.00&st=product`;
    try {
      const r = await httpGet(url, { timeoutMs: 15000 });
      const block = detectBlock(r.body, r.status);
      if (block) return { status: 'blocked', reason: block };
      if (r.status >= 400) return { status: 'failed', error: `http_${r.status}` };

      const $ = cheerio.load(r.body);
      const listings: Listing[] = [];

      $('div[data-testid="divProductWrapper"] a[data-testid^="lnkProductContainer"], a[data-testid^="lnkProductContainer"]')
        .slice(0, limit)
        .each((_, el) => {
          const $el = $(el);
          const href = $el.attr('href');
          if (!href) return;
          const title = $el.find('[data-testid="spnSRPProdName"], span[data-testid="spnProdName"]').first().text().trim();
          const priceText = $el.find('[data-testid="spnSRPProdPrice"]').first().text().trim();
          const sellerName = $el.find('[data-testid="spnSRPProdTabShopName"]').first().text().trim();
          const imageUrl = $el.find('img').first().attr('src');
          if (!title) return;
          listings.push({
            platform: 'tokopedia',
            url: href.startsWith('http') ? href : `https://www.tokopedia.com${href}`,
            title,
            priceIdr: parsePriceIdr(priceText),
            sellerName: sellerName || undefined,
            imageUrl: imageUrl || undefined,
          });
        });

      // Fallback: if SSR markup is JS-only, the structured product list may live in a JSON island.
      if (listings.length === 0) {
        const m = r.body.match(/"products":\[(.*?)\],"totalData/);
        if (!m) return { status: 'blocked', reason: 'empty-html-no-json-island' };
      }

      return { status: 'completed', listings };
    } catch (err) {
      return { status: 'failed', error: String(err) };
    }
  },
};

function parsePriceIdr(text: string): number | undefined {
  if (!text) return undefined;
  const digits = text.replace(/[^0-9]/g, '');
  if (!digits) return undefined;
  return Number(digits);
}
