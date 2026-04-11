import Link from 'next/link';
import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function About() {
  return (
    <ThemedPageShell
      title="About TrackU"
      subtitle="TrackU helps clubs and teams run with less manual work and better visibility into member activity."
    >
      <article className="rounded-3xl border border-[#d7e9e1] bg-[#f5fbf8] p-7 sm:p-8">
        <h2 className="text-xl font-bold text-[#1f2623] sm:text-2xl">Our Mission</h2>
        <p className="mt-3 text-sm leading-7 text-[#55615d] sm:text-base">
          We are building the easiest way for student clubs, societies, and teams to track attendance, member
          participation, and contribution data in one place.
        </p>
      </article>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
          <h3 className="text-lg font-bold text-[#1f2623] sm:text-xl">What We Do</h3>
          <ul className="mt-4 space-y-3 text-sm text-[#55615d] sm:text-base">
            <li>Attendance and activity tracking</li>
            <li>Member progress visibility</li>
            <li>Simple leader workflows</li>
            <li>Team-level reports and insights</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
          <h3 className="text-lg font-bold text-[#1f2623] sm:text-xl">Who Uses TrackU</h3>
          <ul className="mt-4 space-y-3 text-sm text-[#55615d] sm:text-base">
            <li>Club leaders and coordinators</li>
            <li>Chapter heads and committees</li>
            <li>Student societies and communities</li>
            <li>Operations teams and administrators</li>
          </ul>
        </article>
      </div>

      <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
        <h3 className="text-lg font-bold text-[#1f2623] sm:text-xl">Ready to get started?</h3>
        <p className="mt-3 text-sm leading-7 text-[#55615d] sm:text-base">
          Create an account and start managing your club with a cleaner workflow.
        </p>
        <Link href="/register" className="mt-5 inline-block rounded-lg bg-[#49c89f] px-5 py-3 text-sm font-semibold text-white sm:text-base">
          Start Tracking Today
        </Link>
      </article>
    </ThemedPageShell>
  );
}
