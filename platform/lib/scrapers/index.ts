import type { PlatformId, Scraper } from './types';
import { shopeeScraper } from './shopee';
import { tokopediaScraper } from './tokopedia';
import { tiktokShopScraper } from './tiktokshop';

export const SCRAPERS: Record<PlatformId, Scraper> = {
  shopee: shopeeScraper,
  tokopedia: tokopediaScraper,
  tiktokshop: tiktokShopScraper,
};

export const PLATFORMS: PlatformId[] = ['shopee', 'tokopedia', 'tiktokshop'];

export * from './types';
