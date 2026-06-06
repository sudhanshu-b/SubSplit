import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// toNextJsHandler wraps the Better Auth server instance into standard
// Next.js GET/POST handler functions that the App Router expects.
export const { GET, POST } = toNextJsHandler(auth);
