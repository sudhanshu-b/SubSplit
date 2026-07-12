import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 px-6 py-8">

      {/* ── Logo — links back to the landing page ── */}
      <Link href="/" className="inline-flex items-center flex-shrink-0 w-fit">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-light.png" alt="LetsSplit" className="h-9 w-auto object-contain dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark.png"  alt="LetsSplit" className="h-9 w-auto object-contain hidden dark:block" />
      </Link>

      {/* ── Form ── */}
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>

    </div>
  );
}
