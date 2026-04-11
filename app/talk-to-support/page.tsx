import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function TalkToSupportPage() {
  return (
    <ThemedPageShell
      title="Talk to support"
      subtitle="Need help from our team? Reach us through email or phone during business hours."
    >
      <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
        <p className="text-sm text-[#55615d] sm:text-base">
          Email: divyanshjain883@gmail.com
        </p>
        <p className="mt-2 text-sm text-[#55615d] sm:text-base">
          Phone: +91 9761854883
        </p>
        <p className="mt-4 text-sm text-[#55615d] sm:text-base">
          Hours: Monday to Friday, 9:00 AM to 6:00 PM IST
        </p>
      </article>
    </ThemedPageShell>
  );
}
