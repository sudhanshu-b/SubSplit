export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0e0e10]">
      <div className="text-center">
        <p className="text-7xl font-black text-zinc-900 dark:text-zinc-100">404</p>
        <p className="mt-3 text-base font-medium text-zinc-500 dark:text-zinc-400">
          Page not found
        </p>
        <a
          href="/home"
          className="mt-6 inline-block text-sm font-semibold text-zinc-900 dark:text-zinc-100 underline underline-offset-4"
        >
          Go home
        </a>
      </div>
    </main>
  );
}
