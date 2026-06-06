"use client";

import { createAuthClient } from "better-auth/react";

// createAuthClient points to your Next.js app's auth API route.
// In the browser it infers the base URL from window.location automatically,
// so baseURL is only needed for server-side usage in client components (rare).
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

// Named exports so components can import just what they need:
//   import { signIn, signOut, useSession } from "@/lib/auth-client"
export const { signIn, signOut, signUp, useSession } = authClient;
