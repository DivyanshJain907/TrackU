import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-950 via-black to-purple-950"></div>
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
            <img
              src="/image2.png"
              alt="TrackU Logo"
              className="w-14 h-14 rounded-lg"
            />
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition">
                Home
              </Link>
              <Link href="/about" className="text-white border-b-2 border-purple-500">
                About
              </Link>
              <Link href="/company" className="text-gray-300 hover:text-white transition">
                Company
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-white transition">
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">About TrackU</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Empowering leaders to manage, track, and grow their organizations with precision and insight
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            TrackU is built with a singular vision: to simplify member management and activity tracking for clubs, chapters, societies, and communities. We believe that every leader deserves powerful tools to understand their team's contribution, recognize achievements, and drive organizational growth.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">What We Do</h3>
            <ul className="text-gray-300 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-purple-400 text-xl">✓</span>
                <span>Real-time attendance tracking for all members</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 text-xl">✓</span>
                <span>Comprehensive member activity monitoring</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 text-xl">✓</span>
                <span>Performance analytics and insights</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 text-xl">✓</span>
                <span>Seamless team collaboration</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Who We Serve</h3>
            <ul className="text-gray-300 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">→</span>
                <span><strong>Club Leaders</strong> - Track members across events</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">→</span>
                <span><strong>Chapter Heads</strong> - Manage distributed teams</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">→</span>
                <span><strong>Society Organizers</strong> - Oversee large groups</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">→</span>
                <span><strong>Community Managers</strong> - Foster engagement</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-8">Why Choose TrackU?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl text-purple-400 mb-4">📊</div>
              <h4 className="text-xl font-bold text-white mb-2">Data-Driven Insights</h4>
              <p className="text-gray-300">Make informed decisions with comprehensive analytics about member participation and engagement.</p>
            </div>
            <div>
              <div className="text-4xl text-blue-400 mb-4">⚡</div>
              <h4 className="text-xl font-bold text-white mb-2">Simple & Intuitive</h4>
              <p className="text-gray-300">User-friendly interface that requires minimal training. Start tracking in minutes, not days.</p>
            </div>
            <div>
              <div className="text-4xl text-green-400 mb-4">🔒</div>
              <h4 className="text-xl font-bold text-white mb-2">Secure & Reliable</h4>
              <p className="text-gray-300">Your data is encrypted and protected. Focus on leadership while we handle security.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link href="/register">
            <button className="bg-linear-to-r from-purple-500 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition">
              Start Tracking Today
            </button>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
