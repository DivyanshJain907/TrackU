import ThemedPageShell from '@/app/components/ThemedPageShell';

const faqs = [
  {
    question: 'How do I get started?',
    answer: 'Create an account, create or join a club, and begin tracking attendance from your dashboard.',
  },
  {
    question: 'Can I manage multiple clubs?',
    answer: 'Yes. Admin users can manage multiple clubs and review activity from one workspace.',
  },
  {
    question: 'Is my data secure?',
    answer: 'TrackU uses secure authentication and follows standard data protection practices.',
  },
  {
    question: 'Do members need separate accounts?',
    answer: 'Members can be tracked by leaders, and account workflows depend on your club setup.',
  },
];

export default function FaqPage() {
  return (
    <ThemedPageShell
      title="FAQ"
      subtitle="Answers to common questions about using TrackU for club and team management."
    >
      {faqs.map((item) => (
        <article key={item.question} className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
          <h2 className="text-lg font-bold text-[#1f2623] sm:text-xl">{item.question}</h2>
          <p className="mt-3 text-sm leading-7 text-[#55615d] sm:text-base">{item.answer}</p>
        </article>
      ))}
    </ThemedPageShell>
  );
}
