import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function SystemStatusPage() {
  return (
    <ThemedPageShell
      title="System status"
      subtitle="Live information about service availability and platform reliability."
    >
      <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
        <p className="text-sm font-semibold text-[#2f8f71] sm:text-base">All core services are operational.</p>
        <p className="mt-3 text-sm text-[#55615d] sm:text-base">No active incidents reported at this time.</p>
      </article>
    </ThemedPageShell>
  );
}
