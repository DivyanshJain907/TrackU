import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function BetaTestPage() {
  return (
    <ThemedPageShell
      title="Beta test"
      subtitle="Preview upcoming features and help improve TrackU through beta feedback."
    >
      <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
        <p className="text-sm text-[#55615d] sm:text-base">
          Beta enrollment opens periodically. Contact support to request participation.
        </p>
      </article>
    </ThemedPageShell>
  );
}
