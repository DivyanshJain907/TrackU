import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function HelpCentrePage() {
  return (
    <ThemedPageShell
      title="Help centre"
      subtitle="Find quick answers, setup guidance, and workflows for leaders and members."
    >
      <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
        <h2 className="text-lg font-bold text-[#1f2623] sm:text-xl">Common topics</h2>
        <ul className="mt-4 space-y-2 text-sm text-[#55615d] sm:text-base">
          <li>Getting started as a leader</li>
          <li>Managing members and clubs</li>
          <li>Attendance and activity workflows</li>
          <li>Troubleshooting login and access</li>
        </ul>
      </article>
    </ThemedPageShell>
  );
}
