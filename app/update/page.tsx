import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function UpdatePage() {
  return (
    <ThemedPageShell
      title="Update"
      subtitle="Latest product and platform updates for TrackU users."
    >
      <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
        <ul className="space-y-2 text-sm text-[#55615d] sm:text-base">
          <li>Improved dashboard performance</li>
          <li>Refined attendance reporting views</li>
          <li>Enhanced access request visibility</li>
        </ul>
      </article>
    </ThemedPageShell>
  );
}
