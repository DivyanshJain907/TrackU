import Link from "next/link";

export default function Security() {
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
            <img
              src="/image2.png"
              alt="TrackU Logo"
              className="w-14 h-14 rounded-lg"
            />
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition">
                Home
              </Link>
              <Link href="/security" className="text-white border-b-2 border-purple-500">
                Security
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Your Data, Your Security</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We take security seriously. TrackU implements industry-leading practices to protect your information.
          </p>
        </div>

        {/* Security Features */}
        <div className="space-y-8 mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <div className="flex gap-6">
              <div className="text-5xl flex-shrink-0">🔐</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">End-to-End Encryption</h3>
                <p className="text-gray-300 leading-relaxed">
                  All data transmitted between your device and our servers is encrypted using TLS 1.3 protocol. Your sensitive information is protected at rest using AES-256 encryption.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <div className="flex gap-6">
              <div className="text-5xl flex-shrink-0">✓</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Secure Authentication</h3>
                <p className="text-gray-300 leading-relaxed">
                  We implement secure password hashing with bcrypt, support two-factor authentication (2FA), and use JWT tokens for session management. Your account is protected with industry best practices.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <div className="flex gap-6">
              <div className="text-5xl flex-shrink-0">🛡️</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Regular Security Audits</h3>
                <p className="text-gray-300 leading-relaxed">
                  We conduct regular security audits and penetration testing by third-party security experts. Our infrastructure is continuously monitored for vulnerabilities and threats.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <div className="flex gap-6">
              <div className="text-5xl flex-shrink-0">📊</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Data Backups</h3>
                <p className="text-gray-300 leading-relaxed">
                  Your data is automatically backed up multiple times daily across geographically distributed data centers. We maintain 30-day backup retention to ensure data recovery.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <div className="flex gap-6">
              <div className="text-5xl flex-shrink-0">👤</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Access Control</h3>
                <p className="text-gray-300 leading-relaxed">
                  Role-based access control (RBAC) ensures that team members only access data they need. Admin approval is required for sensitive operations.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <div className="flex gap-6">
              <div className="text-5xl flex-shrink-0">⚠️</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Incident Response</h3>
                <p className="text-gray-300 leading-relaxed">
                  We have a dedicated security team on-call 24/7 to respond to any potential security incidents. All incidents are logged and reported to affected users within 24 hours.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <div className="flex gap-6">
              <div className="text-5xl flex-shrink-0">📋</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Compliance</h3>
                <p className="text-gray-300 leading-relaxed">
                  TrackU complies with GDPR, data protection regulations, and follows industry standards for information security. We conduct regular compliance audits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Standards */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">Security Standards & Certifications</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-purple-400 mb-2">✓ OWASP Top 10</h4>
              <p className="text-gray-300">We follow OWASP Top 10 guidelines to prevent common web vulnerabilities.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-blue-400 mb-2">✓ TLS/SSL</h4>
              <p className="text-gray-300">All connections are secured with TLS 1.3 encryption protocol.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-green-400 mb-2">✓ GDPR Compliant</h4>
              <p className="text-gray-300">Full GDPR compliance with user data rights and privacy controls.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-pink-400 mb-2">✓ Regular Audits</h4>
              <p className="text-gray-300">Third-party security audits conducted quarterly.</p>
            </div>
          </div>
        </div>

        {/* Contact for Security Issues */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Found a Security Issue?</h3>
          <p className="text-gray-300 mb-6">
            If you discover a security vulnerability, please report it responsibly to our security team.
          </p>
          <p className="text-purple-400 font-semibold mb-4">divyanshjain883@gmail.com</p>
          <p className="text-gray-400 text-sm">
            We appreciate responsible disclosure and will work with you to address the issue promptly.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to secure your organization data?</h3>
          <Link href="/register">
            <button className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition">
              Get Started Securely
            </button>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
