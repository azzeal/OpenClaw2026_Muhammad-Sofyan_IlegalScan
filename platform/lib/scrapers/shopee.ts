import type { Scraper, ScrapeQuery, ScrapeOutcome, Listing } from './types';
import { detectBlock, httpGet } from './http';

interface ShopeeItemBasic {
  itemid: number;
  shopid: number;
  name: string;
  price: number;
  price_min: number;
  image: string;
  shop_location: string;
}

interface ShopeeResp {
  items?: Array<{ item_basic?: ShopeeItemBasic }>;
}

export const shopeeScraper: Scraper = {
  platform: 'shopee',
  async search({ keyword, limit = 20 }: ScrapeQuery): Promise<ScrapeOutcome> {
    const url = new URL('https://shopee.co.id/api/v4/search/search_items');
    url.searchParams.set('by', 'relevancy');
    url.searchParams.set('keyword', keyword);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('newest', '0');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('page_type', 'search');
    url.searchParams.set('scenario', 'PAGE_GLOBAL_SEARCH');
    url.searchParams.set('version', '2');

    try {
      const r = await httpGet(url.toString(), {
        referer: `https://shopee.co.id/search?keyword=${encodeURIComponent(keyword)}`,
        headers: {
          accept: 'application/json',
          'x-api-source': 'pc',
          'x-shopee-language': 'id',
          'x-requested-with': 'XMLHttpRequest',
        },
      });

      const block = detectBlock(r.body, r.status);
      if (block) return { status: 'blocked', reason: block };
      if (r.status >= 400) return { status: 'failed', error: `http_${r.status}` };

      let json: ShopeeResp;
      try {
        json = JSON.parse(r.body) as ShopeeResp;
      } catch {
        return { status: 'blocked', reason: 'non-json (anti-bot interstitial)' };
      }

      const items = json.items ?? [];
      const listings: Listing[] = items
        .map((it) => it.item_basic)
        .filter((b): b is ShopeeItemBasic => !!b)
        .map((b) => {
          const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80);
          return {
            platform: 'shopee' as const,
            url: `https://shopee.co.id/${slug}-i.${b.shopid}.${b.itemid}`,
            title: b.name,
            priceIdr: Math.round((b.price ?? b.price_min ?? 0) / 100000),
            imageUrl: b.image ? `https://cf.shopee.co.id/file/${b.image}` : undefined,
            sellerUrl: `https://shopee.co.id/shop/${b.shopid}`,
          };
        });
      return { status: 'completed', listings };
    } catch (err) {
      return { status: 'failed', error: String(err) };
    }
  },
};
