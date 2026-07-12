"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "@/lib/auth";

// In the browser always use the current origin so there's never a cross-origin
// mismatch regardless of which domain the app is deployed to.
// During SSR (no window) fall back to the env var so server-side calls work.
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL,
  // Type-only — lets useSession() know about phone/trustScore/role etc.
  // without duplicating the field definitions from lib/auth.ts.
  plugins: [inferAdditionalFields<Auth>()],
});

// Named exports so components can import just what they need:
//   import { signIn, signOut, useSession } from "@/lib/auth-client"
export const { signIn, signOut, signUp, useSession } = authClient;
