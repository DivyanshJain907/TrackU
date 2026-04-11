import Link from "next/link";
import ThemedPageShell from "@/app/components/ThemedPageShell";

export default function Company() {
  return (
    <ThemedPageShell
      title="About Our Company"
      subtitle="Built by leaders, for leaders. Transforming how organizations track member engagement and drive success."
    >
      <div className="rounded-3xl border border-[#d7e9e1] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-12">
        <h2 className="text-3xl font-bold text-[#19201d]">Our Story</h2>
        <p className="mt-4 text-base leading-8 text-[#5f6a66] md:text-lg">
          TrackU was founded with a simple realization: many organizational leaders
          struggle with manual tracking of member activities, attendance, and
          contributions. Spreadsheets are cumbersome, emails get lost, and
          valuable insights remain hidden.
        </p>
        <p className="mt-4 text-base leading-8 text-[#5f6a66] md:text-lg">
          We created TrackU to solve this problem with a modern, intuitive
          platform that brings clarity to organizational management. From small
          clubs to large communities, TrackU empowers leaders to make
          data-driven decisions.
        </p>
      </div>

      <div className="rounded-3xl border border-[#d7e9e1] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-12">
        <h2 className="text-3xl font-bold text-[#19201d]">Our Core Values</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            ["Simplicity", "Complex features do not help anyone. We design for clarity and ease of use."],
            ["Growth", "We help organizations grow by providing insights that drive member engagement."],
            ["Community", "We believe in the power of communities and support their success with the right tools."],
            ["Trust", "Your data is sacred. We prioritize privacy and security above all else."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-[#d7e9e1] bg-[#f7fffb] p-6">
              <h3 className="text-xl font-bold text-[#1f2a26]">{title}</h3>
              <p className="mt-2 text-sm text-[#5f6a66] md:text-base">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-[#d7e9e1] bg-white p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-12">
        <h2 className="text-3xl font-bold text-[#19201d]">Our Vision</h2>
        <p className="mt-4 text-base leading-8 text-[#5f6a66] md:text-lg">
          We envision a world where every organizational leader has access to
          powerful, affordable tools to understand and support their team.
          TrackU is just the beginning of that mission.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-block rounded-xl bg-[#49c89f] px-8 py-3 font-bold text-white transition hover:bg-[#3fb18d]"
        >
          Get In Touch
        </Link>
      </div>
    </ThemedPageShell>
  );
}
