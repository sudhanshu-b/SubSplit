import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appUser, session, account, verification } from "@/db/schema";
import { sendMail, verificationEmailHtml, resetPasswordEmailHtml, welcomeEmailHtml } from "@/lib/mailer";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

// Profile photos are uploaded as base64 data URLs (see AvatarUpload) and stored
// directly in the `image` column — remote OAuth avatar URLs pass through untouched.
function assertValidAvatar(image: unknown) {
  if (typeof image !== "string" || !image || !image.startsWith("data:")) return;
  const match = image.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,([\s\S]+)$/);
  if (!match) throw new APIError("BAD_REQUEST", { message: "Invalid image format." });
  if (Buffer.byteLength(match[1], "base64") > MAX_AVATAR_BYTES) {
    throw new APIError("BAD_REQUEST", { message: "Image must be smaller than 5 MB." });
  }
}

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
    // Disabled: the cookie cache serializes the full user record (including
    // the base64 `image` avatar) into a request cookie. A multi-MB photo
    // blows past header size limits and the whole app 431s on every request.
    cookieCache: {
      enabled: false,
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
      // input: false — role and banned are never settable via sign-up or the
      // update-user endpoint. Only a direct database update can change them.
      role:            { type: "string",  defaultValue: "USER",  required: false, input: false },
      banned:          { type: "boolean", defaultValue: false,   required: false, input: false },
    },
  },

  databaseHooks: {
    user: {
      update: {
        before: async (user) => {
          assertValidAvatar(user.image);
        },
        after: async (user) => {
          if (user.emailVerified === true) {
            const [fullUser] = await db
              .select({ email: appUser.email, name: appUser.name })
              .from(appUser)
              .where(eq(appUser.id, user.id as string))
              .limit(1);
            if (fullUser) {
              try {
                await sendMail({
                  to:      fullUser.email,
                  subject: "Welcome to LetsSplit",
                  from:    "LetsSplit <hello@letssplit.in>",
                  html:    welcomeEmailHtml(fullUser.name),
                });
                console.log("[mail] welcome sent to", fullUser.email);
              } catch (err) {
                console.error("[mail] welcome FAILED for", fullUser.email, err);
              }
            }
          }
        },
      },
    },
    session: {
      create: {
        before: async (newSession) => {
          const [user] = await db
            .select({ banned: appUser.banned })
            .from(appUser)
            .where(eq(appUser.id, newSession.userId))
            .limit(1);
          if (user?.banned) {
            throw new APIError("FORBIDDEN", { message: "This account has been suspended." });
          }
        },
      },
    },
  },
});

export type Auth = typeof auth;
