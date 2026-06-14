import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import NavbarController from "@/components/navbar-controller";

// Inter Tight — condensed, editorial, premium. Tight letter-spacing and
// a wide weight range make it ideal for large display headings and clean UI.
const font = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LetsSplit",
  description: "Split subscriptions with others",
  icons: {
    icon: "/favicon.ico",
  },
};

const themeScript = `
(() => {
  try {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : prefersDark
        ? "dark"
        : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.remove("dark");
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={font.className}>
        {/* NavbarController hides the app navbar on the landing page ("/")
            so the landing page can render its own floating pill navbar. */}
        <NavbarController />
        {children}
      </body>
    </html>
  );
}
