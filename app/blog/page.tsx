import Link from 'next/link';
import ThemedPageShell from '@/app/components/ThemedPageShell';

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "How to Maximize Member Engagement in Your Organization",
      excerpt: "Learn proven strategies to keep your team members engaged and motivated throughout the year.",
      date: "December 22, 2025",
      category: "Leadership",
      image: "📊",
    },
    {
      id: 2,
      title: "5 Key Metrics Every Leader Should Track",
      excerpt: "Discover the essential metrics that indicate organizational health and member satisfaction.",
      date: "December 22, 2025",
      category: "Analytics",
      image: "📈",
    },
    {
      id: 3,
      title: "Building a Data-Driven Culture in Your Club",
      excerpt: "Transform your organization by leveraging data insights to make better decisions.",
      date: "December 22, 2025",
      category: "Culture",
      image: "🎯",
    },
    {
      id: 4,
      title: "Attendance Tracking Best Practices",
      excerpt: "Master the art of tracking member participation and identify trends in your organization.",
      date: "December 22, 2025",
      category: "Operations",
      image: "✅",
    },
    {
      id: 5,
      title: "Scaling Your Organization: From Small Club to Large Community",
      excerpt: "Strategies for managing growth while maintaining member satisfaction and engagement.",
      date: "December 22, 2025",
      category: "Growth",
      image: "🚀",
    },
    {
      id: 6,
      title: "Member Retention: Proven Tactics for Long-Term Engagement",
      excerpt: "Keep your best members committed with these evidence-based retention strategies.",
      date: "December 22, 2025",
      category: "Retention",
      image: "💪",
    },
  ];

  return (
    <ThemedPageShell
      title="TrackU Blog"
      subtitle="Insights, guides, and practical advice for building high-performing club operations."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-[#d7e9e1] bg-white p-6 transition hover:border-[#9bd5c1]"
            >
              <div className="text-5xl mb-4">{post.image}</div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-[#e9f7f1] px-3 py-1 text-sm text-[#2f8f71]">
                  {post.category}
                </span>
                <span className="text-xs text-[#8a9490]">{post.date}</span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#1f2623]">{post.title}</h3>
              <p className="mb-4 text-[#6a7671]">{post.excerpt}</p>
              <button className="font-semibold text-[#2f8f71] transition hover:text-[#247a5f]">
                Read More →
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-[#d7e9e1] bg-[#f5fbf8] p-8 md:p-12">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#1f2623]">Stay Updated</h2>
            <p className="mb-6 text-[#55615d]">Subscribe for product updates and operation playbooks.</p>
            <div className="mx-auto flex max-w-md gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-[#d7e9e1] bg-white px-4 py-3 text-[#2d3834] outline-none"
              />
              <button className="rounded-lg bg-[#49c89f] px-6 py-3 font-bold text-white transition hover:bg-[#39b68d]">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="mb-4 text-2xl font-bold text-[#1f2623]">Ready to track your organization?</h3>
          <Link href="/register">
            <button className="rounded-xl bg-[#49c89f] px-8 py-4 font-bold text-white transition hover:bg-[#39b68d]">
              Get Started Now
            </button>
          </Link>
        </div>
    </ThemedPageShell>
  );
}
