import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ResendVerification from "@/components/resend-verification";
import AvatarUpload from "@/components/avatar-upload";
import PhoneEditor from "@/components/phone-editor";

export const metadata = { title: "Profile · LetsSplit" };

type ProfileUser = {
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  trustScore?: number | string | null;
  isPhoneVerified?: boolean | null;
  emailVerified?: boolean | null;
  createdAt?: Date | string | null;
};

function Dot({ color, pulse = false }: { color: string; pulse?: boolean }) {
  return (
    <span
      className={`rounded-full inline-block flex-shrink-0 ${pulse ? "animate-pulse" : ""}`}
      style={{ width: 6, height: 6, backgroundColor: color }}
    />
  );
}

function Row({ label, value, aside }: { label: string; value: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-zinc-100 dark:border-zinc-800/70 last:border-0 gap-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 pt-0.5 flex-shrink-0 w-28">
        {label}
      </p>
      <div className="flex items-center gap-2 flex-1 justify-end text-right">
        {value}
        {aside}
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const user = session.user as ProfileUser;

  const firstName = user.name.split(" ")[0] ?? user.name;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  const trustScore = user.trustScore != null
    ? parseFloat(String(user.trustScore)).toFixed(1)
    : null;

  return (
    <main className="bg-zinc-50 dark:bg-[#0e0e10] min-h-[calc(100vh-80px)]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* ── Eyebrow ──────────────────────────────────────────────────── */}
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600 mb-5">
          Your profile
        </p>

        {/* ── Avatar + name ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-10">
          <AvatarUpload name={user.name} image={user.image ?? null} />

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug truncate">
              {firstName}
              {user.name.includes(" ") && (
                <span className="text-zinc-400 dark:text-zinc-500">
                  {" "}{user.name.slice(firstName.length)}
                </span>
              )}
            </h1>
            {memberSince && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 mb-2" />

        {/* ── Info rows ────────────────────────────────────────────────── */}
        <Row
          label="Email"
          value={
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {user.email}
            </span>
          }
          aside={
            user.emailVerified
              ? <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                  <Dot color="#22c55e" pulse />
                  verified
                </span>
              : <ResendVerification email={user.email} />
          }
        />

        <Row
          label="Phone"
          value={
            user.phone
              ? <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.phone}</span>
              : <span className="text-sm text-zinc-400 dark:text-zinc-600">Not added</span>
          }
          aside={
            <div className="flex items-center gap-2 shrink-0">
              {user.phone && (
                user.isPhoneVerified
                  ? <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                      <Dot color="#22c55e" pulse />
                      verified
                    </span>
                  : <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                      <Dot color="#f59e0b" />
                      not verified
                    </span>
              )}
              <PhoneEditor current={user.phone} />
            </div>
          }
        />

        <Row
          label="Trust score"
          value={
            trustScore
              ? (
                <span className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                    {trustScore}
                  </span>
                  <span className="text-[11px] text-zinc-400">/ 5.0</span>
                </span>
              )
              : <span className="text-sm text-zinc-400 dark:text-zinc-600">No reviews yet</span>
          }
        />

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 mt-2 mb-8" />

        {/* ── Footer actions ───────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {[
            { href: "/home",         label: "Dashboard"     },
            { href: "/browse",       label: "Browse plans"  },
            { href: "/listings/new", label: "List a plan"   },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="group inline-flex items-center gap-1 w-fit
                         text-[11px] font-semibold text-zinc-400 dark:text-zinc-500
                         hover:text-zinc-900 dark:hover:text-zinc-100
                         underline-offset-4 decoration-dotted decoration-zinc-300 dark:decoration-zinc-600
                         hover:underline transition-colors duration-150 whitespace-nowrap"
            >
              {label}
              <svg
                className="w-3 h-3 flex-shrink-0 transition-transform duration-200
                           group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          ))}
        </div>

      </div>
    </main>
  );
}
