import Link from "next/link";

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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-black to-purple-950"></div>
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => {
            const size = Math.random() * 2;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const opacity = Math.random() * 0.7 + 0.3;
            const duration = Math.random() * 3 + 2;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: `${top}%`,
                  opacity: opacity,
                  animation: `twinkle ${duration}s infinite`
                }}
              ></div>
            );
          })}
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-3000"></div>
      </div>
      <div className="relative z-10">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-white font-bold text-2xl">TrackU</div>
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition">
                Home
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition">
                About
              </Link>
              <Link href="/company" className="text-gray-300 hover:text-white transition">
                Company
              </Link>
              <Link href="/blog" className="text-white border-b-2 border-purple-500">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">TrackU Blog</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Insights, tips, and best practices for leading organizations and tracking member engagement
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:border-purple-500/50 transition hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="text-5xl mb-4">{post.image}</div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">{post.date}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
              <p className="text-gray-400 mb-4">{post.excerpt}</p>
              <button className="text-purple-400 hover:text-purple-300 font-semibold transition">
                Read More →
              </button>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-6">Subscribe to our newsletter for the latest insights on member tracking and organizational growth</p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to track your organization?</h3>
          <Link href="/register">
            <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition">
              Get Started Now
            </button>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
