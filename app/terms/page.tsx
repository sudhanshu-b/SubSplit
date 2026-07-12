import Link from "next/link";

export const metadata = { title: "Terms of Use · LetsSplit" };

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

export default function TermsPage() {
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
          Terms of Use
        </h1>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-8">
          Last updated {LAST_UPDATED}
        </p>

        <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 px-4 py-3.5 mb-2">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
            The short version
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            LetsSplit helps people coordinate splitting the cost of subscriptions they already
            have. We are not Netflix, Spotify, or any other service — we don&rsquo;t own those
            accounts, and we don&rsquo;t decide whether sharing them is allowed. That&rsquo;s
            between you, your group, and the service provider&rsquo;s own terms. Read Section 5
            before you list or join a plan.
          </p>
        </div>

        <Section n={1} title="Acceptance of these Terms">
          <p>
            By creating an account or otherwise using LetsSplit (the &ldquo;Platform&rdquo;), you
            agree to be bound by these Terms of Use (&ldquo;Terms&rdquo;) and our{" "}
            <Link href="/privacy" className="underline text-gray-900 dark:text-white font-medium">
              Privacy Policy
            </Link>
            . If you do not agree, do not use the Platform.
          </p>
        </Section>

        <Section n={2} title="What LetsSplit is">
          <p>
            LetsSplit is a coordination tool. Hosts can list a subscription plan they already
            subscribe to and indicate how many seats or shares they&rsquo;re willing to split;
            members can request to join a listing, chat with the group, and track who has paid
            their share.
          </p>
          <p>
            LetsSplit does not sell, resell, provide, or have any affiliation with Netflix,
            Spotify, YouTube, or any other subscription service referenced on the Platform. We do
            not process the underlying subscription payment to those services, do not create or
            manage the accounts being shared, and are not a party to the subscription contract
            between any user and any third-party provider.
          </p>
        </Section>

        <Section n={3} title="Eligibility and your account">
          <p>
            You must be at least 18 years old and able to form a binding contract to use
            LetsSplit. You&rsquo;re responsible for the accuracy of the information you provide,
            for keeping your login credentials confidential, and for all activity under your
            account.
          </p>
        </Section>

        <Section n={4} title="Hosts and members">
          <p>
            <span className="font-semibold text-gray-800 dark:text-slate-300">Hosts</span> are
            solely responsible for the listings they create — the price, seat count, payment
            terms, and for actually providing access to the subscription to approved members.
            LetsSplit does not guarantee that a host will honor a listing, keep a subscription
            active, or refund a member.
          </p>
          <p>
            <span className="font-semibold text-gray-800 dark:text-slate-300">Members</span> are
            responsible for paying their agreed share directly to the host by whatever method the
            host specifies, and for verifying a listing looks legitimate before joining. LetsSplit
            does not hold, escrow, or guarantee any payment made between users.
          </p>
          <p>
            Any dispute over payment, access, refunds, or conduct between a host and a member is
            between those users. LetsSplit may, at its discretion, help mediate or may suspend
            accounts involved, but is under no obligation to resolve the dispute or make anyone
            whole.
          </p>
        </Section>

        <Section n={5} title="Subscription sharing is your responsibility — read this">
          <p>
            Most subscription services define, in their own terms of service, who is allowed to
            use an account or plan (for example, restricting a &ldquo;household&rdquo; or
            &ldquo;family&rdquo; plan to people living at the same address, or capping the number
            of simultaneous streams). Those restrictions vary by service, change over time, and
            are set entirely by the third-party provider — not by LetsSplit.
          </p>
          <p className="font-semibold text-gray-800 dark:text-slate-300">
            LetsSplit does not review, verify, endorse, or guarantee that any listing on the
            Platform complies with the terms of service of the subscription being shared, or with
            any law applicable to you. We take no position on whether a particular arrangement is
            permitted by the underlying provider.
          </p>
          <p>
            It is your sole responsibility to check the relevant service&rsquo;s terms before
            listing or joining a plan, and to make your own judgment about whether a
            cost-sharing arrangement is appropriate. Consequences of sharing a subscription in a
            way a provider does not allow — including suspension, cancellation, or loss of access
            to the account — are between you and that provider. LetsSplit is not responsible for,
            and will not compensate you for, any such outcome.
          </p>
          <p>
            We may remove a listing or restrict an account if we&rsquo;re made aware it involves
            unlawful activity, but doing so (or not doing so) is not a representation by
            LetsSplit that any other listing is lawful or compliant.
          </p>
        </Section>

        <Section n={6} title="Acceptable use">
          <p>You agree not to use the Platform to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Impersonate another person or misrepresent a listing, price, or seat availability.</li>
            <li>Collect payment for a subscription you have no intention of providing access to.</li>
            <li>Harass, threaten, or abuse another user in messages or reviews.</li>
            <li>Share content that is illegal, infringing, or that you don&rsquo;t have the right to share.</li>
            <li>Circumvent, disable, or interfere with the security or normal operation of the Platform.</li>
          </ul>
          <p>
            We may suspend or terminate accounts that violate this section, remove listings, or
            take other action we consider reasonably necessary.
          </p>
        </Section>

        <Section n={7} title="Reviews and trust scores">
          <p>
            Trust scores and reviews shown on profiles are generated from other users&rsquo;
            ratings and platform activity. They are informational signals only, not a guarantee
            of a host&rsquo;s or member&rsquo;s reliability, and LetsSplit makes no representation
            as to their accuracy.
          </p>
        </Section>

        <Section n={8} title="Disclaimers">
          <p>
            The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without
            warranties of any kind, whether express or implied, including merchantability, fitness
            for a particular purpose, and non-infringement. We don&rsquo;t warrant that the
            Platform will be uninterrupted, error-free, or secure, or that any listing is accurate.
          </p>
        </Section>

        <Section n={9} title="Limitation of liability">
          <p>
            To the maximum extent permitted by law, LetsSplit and its team will not be liable for
            any indirect, incidental, special, consequential, or punitive damages, or for any loss
            of a subscription, account access, or funds paid to another user, arising out of your
            use of the Platform or any subscription-sharing arrangement made through it.
          </p>
        </Section>

        <Section n={10} title="Indemnification">
          <p>
            You agree to indemnify and hold LetsSplit harmless from any claim, demand, or
            liability — including reasonable legal fees — arising from your use of the Platform,
            your listings, your arrangement with other users, or your violation of any third-party
            subscription service&rsquo;s terms or applicable law.
          </p>
        </Section>

        <Section n={11} title="Termination">
          <p>
            You may stop using the Platform at any time. We may suspend or terminate your access
            if we believe you&rsquo;ve violated these Terms or created risk or legal exposure for
            LetsSplit or other users.
          </p>
        </Section>

        <Section n={12} title="Changes to these Terms">
          <p>
            We may update these Terms from time to time. If we make material changes, we&rsquo;ll
            update the date above and, where appropriate, notify you. Continued use of the
            Platform after changes take effect means you accept the revised Terms.
          </p>
        </Section>

        <Section n={13} title="Governing law">
          <p>
            These Terms are governed by the laws of India, without regard to conflict-of-law
            principles. Courts located in India will have exclusive jurisdiction over any dispute
            arising from these Terms, to the extent permitted by law.
          </p>
        </Section>

        <Section n={14} title="Contact">
          <p>
            Questions about these Terms? Reach us at{" "}
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
