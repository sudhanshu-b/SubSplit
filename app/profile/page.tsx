import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type ProfileUser = {
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  trustScore?: number | string | null;
  isPhoneVerified?: boolean | null;
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const user = session.user as ProfileUser;
  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">
          View the account details attached to your LetsSplit profile.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 overflow-hidden rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="m-auto">{initials}</span>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="truncate text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Email
            </p>
            <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Phone
            </p>
            <p className="text-sm font-medium text-gray-900">
              {user.phone || "Not added"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Phone status
            </p>
            <p className="text-sm font-medium text-gray-900">
              {user.isPhoneVerified ? "Verified" : "Not verified"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Trust score
            </p>
            <p className="text-sm font-medium text-gray-900">
              {user.trustScore ?? "Not available"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
