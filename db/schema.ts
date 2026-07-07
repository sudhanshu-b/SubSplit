import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  numeric,
  char,
  integer,
  smallint,
  date,
  timestamp,
  index,
  unique,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// ENUMS
// PostgreSQL enums are created once in the DB. Drizzle syncs them via migration.
// ---------------------------------------------------------------------------

export const subscriptionStatus = pgEnum("subscription_status", [
  "draft",
  "active",
  "full",
  "expired",
  "cancelled",
]);

export const membershipStatus = pgEnum("membership_status", [
  "pending",
  "active",
  "left",
  "removed",
  "rejected",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

export const paymentTerms = pgEnum("payment_terms", [
  "upfront",
  "split_30",
]);

// ---------------------------------------------------------------------------
// APP_USER
// This doubles as Better Auth's user table. When we wire up Better Auth we
// will point it at this table via its `user` config so it doesn't create a
// separate competing table.
// ---------------------------------------------------------------------------

export const appUser = pgTable("app_user", {
  // text instead of uuid — Better Auth generates its own cuid2-style IDs.
  // All FK columns referencing this must also be text.
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  // Better Auth expects this field to be named emailVerified (its convention).
  // The DB column is still is_email_verified — no migration needed for this rename.
  emailVerified: boolean("is_email_verified").notNull().default(false),
  image: text("image"),
  isPhoneVerified: boolean("is_phone_verified").notNull().default(false),
  // Cached aggregate derived from reviews — updated by app logic, not a live calculation.
  trustScore: numeric("trust_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// SERVICE
// Reference catalog: Netflix, Spotify, YouTube Premium, etc.
// Seeded by us; not user-created in Phase 1.
// ---------------------------------------------------------------------------

export const service = pgTable("service", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  url: text("url"),
  category: text("category"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// SUBSCRIPTION
// The shared listing a host creates. "Post" and "subscription" are merged here.
// Remaining seats are computed on read: total_seats minus active memberships.
// ---------------------------------------------------------------------------

export const subscription = pgTable(
  "subscription",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => service.id),
    hostId: text("host_id")
      .notNull()
      .references(() => appUser.id),
    totalSeats: integer("total_seats").notNull(),
    priceTotal: numeric("price_total", { precision: 10, scale: 2 }).notNull(),
    // Generated column — Postgres computes and stores this automatically.
    pricePerSeat: numeric("price_per_seat", {
      precision: 10,
      scale: 2,
    }).generatedAlwaysAs(sql`price_total / total_seats`),
    currency: char("currency", { length: 3 }).notNull().default("USD"),
    region: text("region"),
    status: subscriptionStatus("status").notNull().default("draft"),
    durationDays: integer("duration_days"),
    paymentTerms: paymentTerms("payment_terms"),
    activeFrom: date("active_from"),
    activeTill: date("active_till"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("total_seats_positive", sql`total_seats > 0`),
    check("price_total_non_negative", sql`price_total >= 0`),
    check(
      "active_dates_valid",
      sql`active_till is null or active_from is null or active_till > active_from`,
    ),
    index("idx_subscription_service").on(table.serviceId),
    index("idx_subscription_host").on(table.hostId),
    index("idx_subscription_status").on(table.status),
    index("idx_subscription_region").on(table.region),
  ],
);

// ---------------------------------------------------------------------------
// MEMBERSHIP
// One row per (subscription, member) pair. Tracks the join request lifecycle.
// ---------------------------------------------------------------------------

export const membership = pgTable(
  "membership",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscription.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => appUser.id),
    status: membershipStatus("status").notNull().default("pending"),
    amountPaid: numeric("amount_paid", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // A user can only have one membership row per subscription listing.
    unique("membership_unique").on(table.subscriptionId, table.memberId),
    index("idx_membership_sub").on(table.subscriptionId),
    index("idx_membership_member").on(table.memberId),
  ],
);

// ---------------------------------------------------------------------------
// REVIEW
// Users rate each other after a subscription period. Feeds trust_score.
// ---------------------------------------------------------------------------

export const review = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscription.id, { onDelete: "cascade" }),
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => appUser.id),
    revieweeId: text("reviewee_id")
      .notNull()
      .references(() => appUser.id),
    rating: smallint("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("rating_range", sql`rating between 1 and 5`),
    check("no_self_review", sql`reviewer_id <> reviewee_id`),
    unique("review_unique").on(
      table.subscriptionId,
      table.reviewerId,
      table.revieweeId,
    ),
    index("idx_review_reviewee").on(table.revieweeId),
  ],
);

// ---------------------------------------------------------------------------
// CONVERSATION + PARTICIPANTS + MESSAGE
// In-app messaging. A conversation is scoped to a subscription listing.
// If the listing is deleted, the conversation stays (set null) so history
// isn't lost.
// ---------------------------------------------------------------------------

export const conversation = pgTable("conversation", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").references(() => subscription.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const conversationParticipant = pgTable(
  "conversation_participant",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => appUser.id),
  },
  (table) => [primaryKey({ columns: [table.conversationId, table.userId] })],
);

export const message = pgTable(
  "message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => appUser.id),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_message_conversation").on(table.conversationId)],
);

// ---------------------------------------------------------------------------
// BETTER AUTH TABLES
// Better Auth owns and manages these three tables. Do not write to them
// directly from your app code — go through Better Auth's API instead.
// ---------------------------------------------------------------------------

// One row per active login. When a user signs in, a session is created here.
// When they sign out or the session expires, the row is deleted.
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => appUser.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

// Links a user to an auth provider. For email/password there is one account
// row per user (providerId = "credential"). When you add Google login later,
// a second account row will be created for that provider.
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => appUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

// Stores short-lived tokens for email verification and password reset links.
// Each row is deleted once the token is used or it expires.
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});
