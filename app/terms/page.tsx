import Link from "next/link";
import ThemedPageShell from "@/app/components/ThemedPageShell";

export default function TermsOfService() {
  return (
    <ThemedPageShell
      title="Terms of Service"
      subtitle={`Last updated: ${new Date().toLocaleDateString()}`}
    >
      <div className="rounded-3xl border border-[#d7e9e1] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-12">
        <div className="space-y-8 text-[#40504b]">
          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using TrackU, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">2. Use License</h2>
            <p className="mb-3 leading-relaxed">
              Permission is granted to temporarily use TrackU for personal, educational, and
              organizational club management purposes.
            </p>
            <ul className="list-disc space-y-2 pl-6 leading-relaxed">
              <li>You must not modify or copy the materials for commercial redistribution</li>
              <li>You must not use the service for illegal or unauthorized purposes</li>
              <li>You must not attempt to reverse engineer any software contained in TrackU</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">3. User Accounts</h2>
            <p className="leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and
              password and for restricting access to your computer.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">4. Data and Privacy</h2>
            <p className="leading-relaxed">
              Your use of TrackU is also governed by our Privacy Policy. Please review our
              Privacy Policy, which also governs the Site and informs users of our data collection practices.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">5. Service Availability</h2>
            <p className="leading-relaxed">
              We strive to maintain service availability but do not guarantee uninterrupted
              access. We reserve the right to modify or discontinue the service at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">6. Limitation of Liability</h2>
            <p className="leading-relaxed">
              TrackU and its suppliers shall not be liable for any damages arising out of
              the use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">7. Contact Information</h2>
            <p className="leading-relaxed">
              For questions regarding these Terms of Service, please contact us through
              our support channels.
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-[#d7e9e1] pt-6">
          <Link href="/" className="font-semibold text-[#319b7a] transition hover:text-[#277d62]">
            Back to Home
          </Link>
        </div>
      </div>
    </ThemedPageShell>
  );
}
