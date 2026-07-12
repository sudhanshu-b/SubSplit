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
  "recruiting",        // accepting members
  "ready_to_purchase", // minimum members reached, host preparing to buy
  "active",            // subscription purchased, sharing live
  "completed",         // plan period ended naturally
  "cancelled",         // host cancelled before going active
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

export const userRole = pgEnum("user_role", [
  "USER",
  "ADMIN",
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
  role: userRole("role").notNull().default("USER"),
  banned: boolean("banned").notNull().default(false),
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
    status: subscriptionStatus("status").notNull().default("recruiting"),
    durationDays: integer("duration_days"),
    paymentTerms: paymentTerms("payment_terms"),
    upiId: text("upi_id"),
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
    lastRemindedAt: timestamp("last_reminded_at", { withTimezone: true }),
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
// MEMBERSHIP_PAYMENT
// Tracks individual payment installments per membership.
// proof_image_url stores a base64 data URL (MVP — move to object storage later).
// ---------------------------------------------------------------------------

export const membershipPayment = pgTable(
  "membership_payment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    membershipId: uuid("membership_id")
      .notNull()
      .references(() => membership.id, { onDelete: "cascade" }),
    installmentNumber: integer("installment_number").notNull().default(1), // 1 or 2
    amount: numeric("amount", { precision: 10, scale: 2 }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    transactionRef: text("transaction_ref"),
    proofImageUrl: text("proof_image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("mp_unique").on(table.membershipId, table.installmentNumber),
    index("idx_mp_membership").on(table.membershipId),
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
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
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
// REPORT
// A user flagging another user for the admin team to review. Submitted via
// support email today (see FAQ) — this table just gives admins a place to
// see a count once a report is logged against an account.
// ---------------------------------------------------------------------------

export const report = pgTable(
  "report",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reportedUserId: text("reported_user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    reporterId: text("reporter_id").references(() => appUser.id),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_report_reported_user").on(table.reportedUserId)],
);

// ---------------------------------------------------------------------------
// TESTIMONIAL
// Quotes shown in the landing page's testimonials section. Managed from the
// admin panel; only published rows are shown publicly.
// ---------------------------------------------------------------------------

export const testimonial = pgTable("testimonial", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull(),
  body: text("body").notNull(),
  // Short highlighted stat shown above the quote, e.g. metric="₹600",
  // metricLabel="saved per month".
  metric: text("metric").notNull(),
  metricLabel: text("metric_label").notNull(),
  // Optional photo — falls back to colored initials when absent.
  avatarUrl: text("avatar_url"),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// FEEDBACK
// Submitted by users to report bugs or request features. Reviewed in admin.
// ---------------------------------------------------------------------------

export const feedbackType = pgEnum("feedback_type", [
  "bug",
  "feature_request",
  "other",
]);

export const feedbackStatus = pgEnum("feedback_status", [
  "open",
  "in_review",
  "done",
  "closed",
]);

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => appUser.id, { onDelete: "cascade" }),
    type: feedbackType("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: feedbackStatus("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_feedback_user").on(table.userId),
    index("idx_feedback_status").on(table.status),
  ],
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
