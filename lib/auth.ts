import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { appUser, session, account, verification } from "@/db/schema";

export const auth = betterAuth({
  // Tells Better Auth to use our Postgres database via Drizzle.
  // We explicitly map each Better Auth model to our Drizzle table so it
  // uses our column definitions (including our custom app_user fields).
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: appUser,
      session,
      account,
      verification,
    },
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean) as string[],

  session: {
    // Cache the session payload in the cookie for 5 minutes.
    // API routes read from the cookie instead of querying the session table
    // on every request — eliminates the Supabase round-trip on most calls.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  // Enable email + password sign-up and sign-in.
  // This is the only auth method for Phase 1.
  emailAndPassword: {
    enabled: true,
    // Email verification is required before a user can sign in.
    // For this to work you must configure a real email provider.
    // Set to false during local development if you haven't wired up email yet.
    requireEmailVerification: false,
  },

  // Declare app-specific fields that live on app_user but aren't part of
  // Better Auth's core user model. Better Auth will include these in
  // select queries and expose them on the session user object.
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      isPhoneVerified: { type: "boolean", defaultValue: false, required: false },
      trustScore: { type: "number", required: false },
    },
  },
});

// Export the auth type so other files can infer the session shape.
export type Auth = typeof auth;
