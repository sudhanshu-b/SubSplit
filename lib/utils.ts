import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Only ever redirect to a same-origin relative path after auth — a raw `next`
// query param could otherwise be used to bounce a signed-in user off-site.
export function safeRedirect(next: string | null | undefined, fallback = "/home") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return fallback;
  }
  return next;
}
