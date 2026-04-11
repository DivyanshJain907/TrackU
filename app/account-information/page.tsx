import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function AccountInformationPage() {
  return (
    <ThemedPageShell
      title="Account information"
      subtitle="Manage your profile, role details, and account settings in one place."
    >
      <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
        <h2 className="text-lg font-bold text-[#1f2623] sm:text-xl">What you can manage</h2>
        <ul className="mt-4 space-y-2 text-sm text-[#55615d] sm:text-base">
          <li>Profile details and contact information</li>
          <li>Password and security settings</li>
          <li>Role and club assignment visibility</li>
          <li>Notifications and communication preferences</li>
        </ul>
      </article>
    </ThemedPageShell>
  );
}
