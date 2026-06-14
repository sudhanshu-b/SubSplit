import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { appUser, session, account, verification } from "@/db/schema";
import { sendMail, verificationEmailHtml, resetPasswordEmailHtml, welcomeEmailHtml } from "@/lib/mailer";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: appUser,
      session,
      account,
      verification,
    },
  }),

  secret:  process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "https://letssplit.in",
    "https://www.letssplit.in",
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean) as string[],

  session: {
    cookieCache: {
      enabled: true,
      maxAge:  5 * 60,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      try {
        await sendMail({
          to:      user.email,
          subject: "Reset your password — LetsSplit",
          from:    "LetsSplit <support@letssplit.in>",
          html:    resetPasswordEmailHtml(user.name, url),
        });
        console.log("[mail] password reset sent to", user.email);
      } catch (err) {
        console.error("[mail] password reset FAILED for", user.email, err);
      }
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      console.log("[mail] sendVerificationEmail CALLED — to:", user.email, "url:", url);
      try {
        await sendMail({
          to:      user.email,
          subject: "Verify your email — LetsSplit",
          from:    "LetsSplit <hello@letssplit.in>",
          html:    verificationEmailHtml(user.name, url),
        });
        console.log("[mail] verification SENT to", user.email);
      } catch (err) {
        console.error("[mail] verification FAILED for", user.email, err);
      }
    },
  },

  user: {
    additionalFields: {
      phone:           { type: "string",  required: false },
      isPhoneVerified: { type: "boolean", defaultValue: false, required: false },
      trustScore:      { type: "number",  required: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await sendMail({
              to:      user.email,
              subject: "Welcome to LetsSplit",
              from:    "LetsSplit <hello@letssplit.in>",
              html:    welcomeEmailHtml(user.name),
            });
            console.log("[mail] welcome sent to", user.email);
          } catch (err) {
            console.error("[mail] welcome FAILED for", user.email, err);
          }
        },
      },
    },
  },
});

export type Auth = typeof auth;
