"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";

// Routes that manage their own layout — no shared navbar or spacer needed
const NO_NAV_ROUTES = ["/", "/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

/**
 * Renders the shared app Navbar on every route EXCEPT the landing page and
 * auth pages (sign-in / sign-up manage their own full-screen split layout).
 */
export default function NavbarController() {
  const pathname = usePathname();
  if (NO_NAV_ROUTES.includes(pathname)) return null;
  return (
    <>
      <Navbar />
      {/* Spacer so page content clears the fixed floating pill navbar */}
      <div className="h-20" />
    </>
  );
}
