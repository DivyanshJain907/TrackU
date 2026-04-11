import Link from 'next/link';
import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function ProductPage() {
  return (
    <ThemedPageShell
      title="Product"
      subtitle="TrackU gives club leaders a focused workspace to manage members, track attendance, and review activity insights."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
          <h2 className="text-lg font-bold text-[#1f2623] sm:text-xl">Core modules</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#55615d] sm:text-base">
            <li>Member directory and status tracking</li>
            <li>Attendance and contribution logs</li>
            <li>Role-based admin approvals</li>
            <li>Club-level activity reporting</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-[#d7e9e1] bg-[#f5fbf8] p-7 sm:p-8">
          <h2 className="text-lg font-bold text-[#1f2623] sm:text-xl">Built for teams</h2>
          <p className="mt-4 text-sm leading-7 text-[#55615d] sm:text-base">
            Designed for student clubs and organizations that want less manual tracking and more visibility.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-lg bg-[#49c89f] px-5 py-3 text-sm font-semibold text-white">
              Create Account
            </Link>
            <Link href="/pricing" className="rounded-lg border border-[#cde4da] bg-white px-5 py-3 text-sm font-semibold text-[#2d3834]">
              View Pricing
            </Link>
          </div>
        </article>
      </div>
    </ThemedPageShell>
  );
}
