import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HomeClient from "@/components/home-client";

export const metadata = { title: "Home · LetsSplit" };

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <HomeClient
      userName={session.user.name ?? ""}
      userEmail={session.user.email ?? ""}
    />
  );
}
