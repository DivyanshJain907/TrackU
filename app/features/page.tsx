import Link from "next/link";

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
              <Link href="/features" className="text-white border-b-2 border-purple-500">
                Features
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Powerful Features</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to effectively manage and track your club members
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 hover:border-purple-500/50 transition hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Key Highlights */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Choose TrackU Features?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-purple-400 mb-2">✨ Easy to Use</h4>
              <p className="text-gray-300">Intuitive interface that requires minimal training. Start tracking in minutes.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-blue-400 mb-2">⚡ Real-Time Updates</h4>
              <p className="text-gray-300">Get instant notifications and updates on member activities as they happen.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-green-400 mb-2">📊 Data-Driven Insights</h4>
              <p className="text-gray-300">Make informed decisions with comprehensive analytics and visual reports.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-pink-400 mb-2">🔄 Fully Customizable</h4>
              <p className="text-gray-300">Tailor TrackU to your organization's specific needs and workflows.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
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
