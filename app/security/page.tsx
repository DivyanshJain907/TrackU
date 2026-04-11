import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function Security() {
  return (
    <ThemedPageShell
      title="Your Data, Your Security"
      subtitle="TrackU applies modern security controls to keep your organization data safe, private, and available."
    >
      {[
        {
          title: 'End-to-end encryption',
          text: 'Traffic is encrypted in transit and sensitive data is protected at rest using strong encryption standards.',
        },
        {
          title: 'Secure authentication',
          text: 'Passwords are hashed securely and account sessions use robust token handling and access checks.',
        },
        {
          title: 'Backup and recovery',
          text: 'Data backups are maintained regularly to reduce downtime risk and support disaster recovery.',
        },
        {
          title: 'Access control',
          text: 'Role-based permissions limit access to only what each member needs for their responsibilities.',
        },
      ].map((item) => (
        <article key={item.title} className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
          <h2 className="text-lg font-bold text-[#1f2623] sm:text-xl">{item.title}</h2>
          <p className="mt-3 text-sm leading-7 text-[#55615d] sm:text-base">{item.text}</p>
        </article>
      ))}

      <article className="rounded-3xl border border-[#d7e9e1] bg-[#f5fbf8] p-7 text-center sm:p-8">
        <h3 className="text-lg font-bold text-[#1f2623] sm:text-xl">Security contact</h3>
        <p className="mt-3 text-sm text-[#55615d] sm:text-base">If you find a potential security issue, report it to our team.</p>
        <p className="mt-2 text-sm font-semibold text-[#2f8f71] sm:text-base">divyanshjain883@gmail.com</p>
      </article>
    </ThemedPageShell>
  );
}
