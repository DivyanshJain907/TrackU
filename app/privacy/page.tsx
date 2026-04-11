import Link from "next/link";
import ThemedPageShell from "@/app/components/ThemedPageShell";

export default function PrivacyPolicy() {
  return (
    <ThemedPageShell
      title="Privacy Policy"
      subtitle={`Last updated: ${new Date().toLocaleDateString()}`}
    >
      <div className="rounded-3xl border border-[#d7e9e1] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-12">
        <div className="space-y-8 text-[#40504b]">
          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">1. Information We Collect</h2>
            <p className="leading-relaxed">
              We collect information you provide directly to us, including but not limited to your name,
              email address, organization details, and member attendance data.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">2. How We Use Your Information</h2>
            <ul className="list-disc space-y-2 pl-6 leading-relaxed">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis to improve our service</li>
              <li>To monitor the usage of our service</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">3. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">4. Data Sharing</h2>
            <p className="leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">5. Your Rights</h2>
            <p className="leading-relaxed">
              You have the right to access, update, or delete your personal information. You may also
              request a copy of your data or object to certain processing activities.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold text-[#1d2623]">6. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our
              support channels.
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
