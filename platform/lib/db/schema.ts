import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  primaryKey,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const tenantStatus = pgEnum('tenant_status', [
  'trialing',
  'active',
  'past_due',
  'canceled',
]);

export const subscriptionStatus = pgEnum('subscription_status', [
  'trialing',
  'active',
  'past_due',
  'canceled',
]);

export const findingStatus = pgEnum('finding_status', [
  'new',
  'confirmed',
  'dismissed',
  'reported',
  'resolved',
]);

export const platform = pgEnum('platform', ['shopee', 'tokopedia', 'tiktokshop', 'other']);

export const scanStatus = pgEnum('scan_status', [
  'queued',
  'running',
  'completed',
  'failed',
  'blocked',
]);

// ─── auth: users ──────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── tenants (= subscriber brands) ─────────────────────────────────────────
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  legalName: text('legal_name'),
  industry: text('industry'),
  status: tenantStatus('status').notNull().default('trialing'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tenantMembers = pgTable(
  'tenant_members',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('owner'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.tenantId] }),
    byTenant: index('tenant_members_by_tenant').on(t.tenantId),
  }),
);

// ─── products (what each tenant wants monitored) ───────────────────────────
export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    brand: text('brand'),
    referenceImageUrl: text('reference_image_url'),
    keywords: text('keywords').array().default(sql`'{}'::text[]`),
    nie: text('nie'),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    byTenant: index('products_by_tenant').on(t.tenantId),
  }),
);

// ─── scans (one per cron run per product per platform) ─────────────────────
export const scans = pgTable(
  'scans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    platform: platform('platform').notNull(),
    status: scanStatus('status').notNull().default('queued'),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    candidatesFound: integer('candidates_found').notNull().default(0),
    error: text('error'),
  },
  (t) => ({
    byTenant: index('scans_by_tenant').on(t.tenantId),
    byStatus: index('scans_by_status').on(t.status),
  }),
);

// ─── findings (each detected counterfeit listing) ──────────────────────────
export const findings = pgTable(
  'findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    scanId: uuid('scan_id').references(() => scans.id, { onDelete: 'cascade' }),
    platform: platform('platform').notNull(),
    listingUrl: text('listing_url').notNull(),
    listingTitle: text('listing_title'),
    sellerName: text('seller_name'),
    sellerUrl: text('seller_url'),
    priceIdr: integer('price_idr'),
    imageUrl: text('image_url'),
    matchedKeywords: text('matched_keywords').array().default(sql`'{}'::text[]`),
    matchedPatterns: text('matched_patterns').array().default(sql`'{}'::text[]`),
    similarityScore: numeric('similarity_score', { precision: 4, scale: 3 }),
    status: findingStatus('status').notNull().default('new'),
    notes: text('notes'),
    discoveredAt: timestamp('discovered_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    byTenant: index('findings_by_tenant').on(t.tenantId),
    byProduct: index('findings_by_product').on(t.productId),
    byStatus: index('findings_by_status').on(t.status),
  }),
);

// ─── subscriptions (one per tenant) ────────────────────────────────────────
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' })
    .unique(),
  status: subscriptionStatus('status').notNull().default('trialing'),
  amountIdr: integer('amount_idr').notNull().default(100000),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  dokuInvoiceId: text('doku_invoice_id'),
  dokuPaymentMethod: text('doku_payment_method'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── notification preferences ──────────────────────────────────────────────
export const notificationPrefs = pgTable('notification_prefs', {
  tenantId: uuid('tenant_id')
    .primaryKey()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  telegramChatId: text('telegram_chat_id'),
  telegramVerified: boolean('telegram_verified').notNull().default(false),
  notifyOnNewFinding: boolean('notify_on_new_finding').notNull().default(true),
  notifyOnReportReady: boolean('notify_on_report_ready').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── audit / event log for support visibility ──────────────────────────────
export const eventLog = pgTable(
  'event_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    event: text('event').notNull(),
    payload: text('payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ byTenant: index('event_log_by_tenant').on(t.tenantId) }),
);

export type User = typeof users.$inferSelect;
export type Tenant = typeof tenants.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Scan = typeof scans.$inferSelect;
export type Finding = typeof findings.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
