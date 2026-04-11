import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function SupportDocsPage() {
  return (
    <ThemedPageShell
      title="Support docs"
      subtitle="Reference guides and operational documentation for teams using TrackU."
    >
      <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
        <ul className="space-y-2 text-sm text-[#55615d] sm:text-base">
          <li>Leader onboarding guide</li>
          <li>Attendance setup checklist</li>
          <li>Member data import tips</li>
          <li>Admin and access request flow</li>
        </ul>
      </article>
    </ThemedPageShell>
  );
}
