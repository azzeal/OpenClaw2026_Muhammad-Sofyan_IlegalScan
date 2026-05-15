export type PlatformId = 'shopee' | 'tokopedia' | 'tiktokshop';

export interface Listing {
  platform: PlatformId;
  url: string;
  title: string;
  sellerName?: string;
  sellerUrl?: string;
  priceIdr?: number;
  imageUrl?: string;
}

export interface ScrapeQuery {
  platform: PlatformId;
  keyword: string;
  limit?: number;
}

export type ScrapeOutcome =
  | { status: 'completed'; listings: Listing[] }
  | { status: 'blocked'; reason: string }
  | { status: 'failed'; error: string };

export interface Scraper {
  readonly platform: PlatformId;
  search(query: ScrapeQuery): Promise<ScrapeOutcome>;
}
