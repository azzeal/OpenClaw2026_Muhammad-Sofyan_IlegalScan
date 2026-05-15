import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://clearmark:clearmark@localhost:5432/clearmark_platform',
  },
  strict: true,
} satisfies Config;
