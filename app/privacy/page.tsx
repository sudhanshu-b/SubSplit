import Link from "next/link";

export const metadata = { title: "Privacy Policy · LetsSplit" };

const LAST_UPDATED = "July 12, 2026";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="py-6 border-b border-gray-100 dark:border-slate-800 last:border-0">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        <span className="text-gray-300 dark:text-slate-600 mr-2">{n}.</span>
        {title}
      </h2>
      <div className="space-y-3 text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-6 py-10 sm:py-14">

        <Link href="/" className="inline-flex items-center flex-shrink-0 w-fit mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="LetsSplit" className="h-9 w-auto object-contain dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png"  alt="LetsSplit" className="h-9 w-auto object-contain hidden dark:block" />
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-8">
          Last updated {LAST_UPDATED}
        </p>

        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-2">
          This policy explains what information LetsSplit (&ldquo;we&rdquo;) collects when you use
          the Platform, why we collect it, and the choices you have. It should be read alongside
          our{" "}
          <Link href="/terms" className="underline text-gray-900 dark:text-white font-medium">
            Terms of Use
          </Link>
          .
        </p>

        <Section n={1} title="Information we collect">
          <p>
            <span className="font-semibold text-gray-800 dark:text-slate-300">Account information</span>
            {" "}— your name, email address, password (stored hashed, never in plain text), and
            optionally a phone number and profile photo.
          </p>
          <p>
            <span className="font-semibold text-gray-800 dark:text-slate-300">Listing and membership data</span>
            {" "}— subscription plans you create or join, seat counts, pricing, and status
            (recruiting, active, completed, etc.).
          </p>
          <p>
            <span className="font-semibold text-gray-800 dark:text-slate-300">Payment records</span>
            {" "}— for split payments made outside the Platform (e.g. via UPI), we store the
            transaction reference and, if you choose to upload one, a screenshot of the payment
            confirmation as proof. LetsSplit does not process or hold funds itself.
          </p>
          <p>
            <span className="font-semibold text-gray-800 dark:text-slate-300">Messages</span> — text
            you send in a listing&rsquo;s group chat is stored so it can be delivered to other
            members of that group.
          </p>
          <p>
            <span className="font-semibold text-gray-800 dark:text-slate-300">Reviews</span> —
            ratings and comments you leave for other users after a plan completes.
          </p>
          <p>
            <span className="font-semibold text-gray-800 dark:text-slate-300">Usage and device data</span>
            {" "}— basic technical data like IP address and browser user agent, collected as part
            of keeping you signed in and securing your session.
          </p>
        </Section>

        <Section n={2} title="How we use this information">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To operate your account, listings, memberships, and group chats.</li>
            <li>To show other members of a group your name, photo, and payment status so the group can coordinate.</li>
            <li>To calculate the trust score shown on your public profile, based on reviews and platform history.</li>
            <li>To send transactional email — verification links, password resets, join-request notifications, and payment reminders.</li>
            <li>To detect fraud, abuse or violations of our Terms of Use.</li>
          </ul>
          <p>We do not use your data to serve third-party advertising, and we do not sell your personal information.</p>
        </Section>

        <Section n={3} title="What other users can see">
          <p>
            Your name and profile photo are visible to other members of any listing you host or
            join, and on your public host profile page if you&rsquo;ve hosted a listing. Your
            payment status within a group (paid / pending) is visible to that group&rsquo;s host.
            Your email and phone number are never shown to other users.
          </p>
        </Section>

        <Section n={4} title="Sharing with third parties">
          <p>
            We share information only with the service providers that help us run LetsSplit —
            for example, our email provider (to send verification and notification emails) and
            our hosting/database provider (to store the data described above). These providers
            are only permitted to use your data to provide their service to us.
          </p>
          <p>
            We may also disclose information if required by law, or to protect the rights,
            safety, or property of LetsSplit, our users, or the public.
          </p>
        </Section>

        <Section n={5} title="Data storage and security">
          <p>
            Your data is stored in a hosted PostgreSQL database. Uploaded images (profile photos
            and payment proofs) are currently stored as encoded data directly in the database
            rather than a separate file store. We use industry-standard practices such as
            password hashing and signed session cookies, but no method of storage or transmission
            is 100% secure, and we can&rsquo;t guarantee absolute security.
          </p>
        </Section>

        <Section n={6} title="Data retention">
          <p>
            We keep your account and listing history for as long as your account is active, and
            for a reasonable period after in case it&rsquo;s needed to resolve a dispute or
            comply with a legal obligation. You can request deletion as described below.
          </p>
        </Section>

        <Section n={7} title="Your choices and rights">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>You can update your name, phone number, and profile photo at any time from your profile page.</li>
            <li>You can request a copy of the personal data we hold about you.</li>
            <li>You can request that we delete your account and associated personal data, subject to records we&rsquo;re required to keep (e.g. for active memberships or unresolved disputes).</li>
          </ul>
          <p>
            To make a request, email{" "}
            <a href="mailto:support@letssplit.in" className="underline text-gray-900 dark:text-white font-medium">
              support@letssplit.in
            </a>
            {" "}from the address on your account.
          </p>
        </Section>

        <Section n={8} title="Cookies and sessions">
          <p>
            We use a single essential cookie to keep you signed in. We don&rsquo;t use tracking or
            advertising cookies.
          </p>
        </Section>

        <Section n={9} title="Children's privacy">
          <p>
            LetsSplit is not directed at, and should not be used by, anyone under 18. We don&rsquo;t
            knowingly collect information from children.
          </p>
        </Section>

        <Section n={10} title="Changes to this policy">
          <p>
            We may update this policy from time to time. If we make material changes, we&rsquo;ll
            update the date above and, where appropriate, notify you.
          </p>
        </Section>

        <Section n={11} title="Contact">
          <p>
            Questions about this policy? Reach us at{" "}
            <a href="mailto:support@letssplit.in" className="underline text-gray-900 dark:text-white font-medium">
              support@letssplit.in
            </a>
            .
          </p>
        </Section>

      </div>
    </main>
  );
}
