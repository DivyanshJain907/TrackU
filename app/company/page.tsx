import Link from "next/link";

export default function Company() {
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
              <Link href="/company" className="text-white border-b-2 border-purple-500">
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
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">About Our Company</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built by leaders, for leaders. Transforming how organizations track member engagement and drive success.
          </p>
        </div>

        {/* Company Overview */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Our Story</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            TrackU was founded with a simple realization: many organizational leaders struggle with manual tracking of member activities, attendance, and contributions. Spreadsheets are cumbersome, emails get lost, and valuable insights remain hidden.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            We created TrackU to solve this problem with a modern, intuitive platform that brings clarity to organizational management. From small clubs to large communities, TrackU empowers leaders to make data-driven decisions.
          </p>
        </div>

        {/* Core Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-purple-400 mb-3">🎯 Simplicity</h3>
              <p className="text-gray-300">Complex features don't help anyone. We design for clarity and ease of use.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-3">📈 Growth</h3>
              <p className="text-gray-300">We help organizations grow by providing insights that drive member engagement.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-green-400 mb-3">🤝 Community</h3>
              <p className="text-gray-300">We believe in the power of communities and support their success with the right tools.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-pink-400 mb-3">🔐 Trust</h3>
              <p className="text-gray-300">Your data is sacred. We prioritize privacy and security above all else.</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            We envision a world where every organizational leader has access to powerful, affordable tools to understand and support their team. TrackU is just the beginning of that mission.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="/contact">
            <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition">
              Get In Touch
            </button>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
