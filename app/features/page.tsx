import Link from "next/link";
import ThemedPageShell from "@/app/components/ThemedPageShell";

export default function Features() {
  const features = [
    {
      title: "Real-Time Attendance Tracking",
      description: "Track member attendance automatically with timestamps and location data",
      icon: "✓"
    },
    {
      title: "Member Management",
      description: "Organize and manage all member information in one centralized system",
      icon: "👥"
    },
    {
      title: "Activity Monitoring",
      description: "Monitor individual member activities and contributions",
      icon: "📊"
    },
    {
      title: "Performance Analytics",
      description: "Get detailed insights into member performance and engagement metrics",
      icon: "📈"
    },
    {
      title: "Automated Reports",
      description: "Generate comprehensive reports automatically and export them easily",
      icon: "📄"
    },
    {
      title: "Role-Based Access",
      description: "Control who can see and edit member data with role-based permissions",
      icon: "🔐"
    },
    {
      title: "Mobile Responsive",
      description: "Access TrackU from any device - desktop, tablet, or smartphone",
      icon: "📱"
    },
    {
      title: "Team Collaboration",
      description: "Collaborate with multiple team members and club leaders seamlessly",
      icon: "🤝"
    },
    {
      title: "Event Management",
      description: "Organize and manage club events with member participation tracking",
      icon: "🎯"
    },
  ];

  return (
    <ThemedPageShell
      title="Powerful Features"
      subtitle="Everything you need to effectively manage and track your club members."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#d7e9e1] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="mb-3 text-3xl">{feature.icon}</div>
            <h3 className="text-xl font-bold text-[#1d2623]">{feature.title}</h3>
            <p className="mt-2 text-sm text-[#5f6a66] md:text-base">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[#d7e9e1] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-12">
        <h2 className="text-center text-3xl font-bold text-[#19201d]">Why Choose TrackU Features?</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#d7e9e1] bg-[#f7fffb] p-5">
            <h4 className="text-lg font-bold text-[#1f2a26]">Easy to Use</h4>
            <p className="mt-2 text-sm text-[#5f6a66]">Intuitive interface that requires minimal training. Start tracking in minutes.</p>
          </div>
          <div className="rounded-2xl border border-[#d7e9e1] bg-[#f7fffb] p-5">
            <h4 className="text-lg font-bold text-[#1f2a26]">Real-Time Updates</h4>
            <p className="mt-2 text-sm text-[#5f6a66]">Get instant notifications and updates on member activities as they happen.</p>
          </div>
          <div className="rounded-2xl border border-[#d7e9e1] bg-[#f7fffb] p-5">
            <h4 className="text-lg font-bold text-[#1f2a26]">Data-Driven Insights</h4>
            <p className="mt-2 text-sm text-[#5f6a66]">Make informed decisions with comprehensive analytics and visual reports.</p>
          </div>
          <div className="rounded-2xl border border-[#d7e9e1] bg-[#f7fffb] p-5">
            <h4 className="text-lg font-bold text-[#1f2a26]">Fully Customizable</h4>
            <p className="mt-2 text-sm text-[#5f6a66]">Tailor TrackU to your organization's specific needs and workflows.</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#d7e9e1] bg-white p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-12">
        <h3 className="text-2xl font-bold text-[#1d2623]">Ready to track your organization?</h3>
        <Link
          href="/register"
          className="mt-5 inline-block rounded-xl bg-[#49c89f] px-8 py-3 font-bold text-white transition hover:bg-[#3fb18d]"
        >
          Get Started Now
        </Link>
      </div>
    </ThemedPageShell>
  );
}
