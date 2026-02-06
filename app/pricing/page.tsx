import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small clubs getting started",
      features: [
        "Up to 50 members",
        "Basic attendance tracking",
        "Member profiles",
        "Monthly reports",
      ],
      cta: "Get Started",
      highlighted: false,
      period: "",
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Unlimited members",
        "All Professional features",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      highlighted: false,
      period: "",
    },
  ];

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
              <Link href="/pricing" className="text-white border-b-2 border-purple-500">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan for your organization. No hidden fees.
          </p>
        </div>

        {/* Early Access Notice */}
        <div className="bg-linear-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-6 mb-8 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0">⏰</span>
            <div>
              <h3 className="text-lg font-bold text-yellow-300 mb-2">Limited Free Offer</h3>
              <p className="text-gray-300">
                TrackU is currently offering the <strong className="text-white">Starter plan completely free for the first 10 clubs</strong>. After we reach 10 clubs, pricing will be introduced with some changes to the plan features. Register now to get lifetime free access!
              </p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-3xl border p-8 backdrop-blur-xl transition ${
                plan.highlighted
                  ? "bg-white/20 border-purple-500 shadow-2xl shadow-purple-500/30 relative -mt-4"
                  : "bg-white/10 border-white/20 hover:border-white/30"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-purple-500 to-blue-600 px-4 py-1 rounded-full text-white text-sm font-bold">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-400 ml-2">{plan.period}</span>}
              </div>

              <Link href={plan.name === "Starter" ? "/login" : plan.name === "Enterprise" ? "/contact" : "#"}>
                <button
                  className={`w-full py-3 rounded-lg font-bold mb-8 transition ${
                    plan.highlighted
                      ? "bg-linear-to-r from-purple-500 to-blue-600 text-white hover:shadow-lg"
                      : "border-2 border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>

              <div className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-green-400 text-lg">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Can I upgrade or downgrade anytime?</h4>
              <p className="text-gray-300">Yes! You can change your plan at any time. Changes take effect on your next billing cycle.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Is there a free trial?</h4>
              <p className="text-gray-300">Yes, the Starter plan is completely free with no trial period needed.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Do you offer discounts for annual billing?</h4>
              <p className="text-gray-300">Yes! Annual plans come with 20% discount. Contact our sales team for details.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-300">We accept all major credit cards, UPI, and bank transfers for Indian customers.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
          <Link href="/register">
            <button className="bg-linear-to-r from-purple-500 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition">
              Start Free Today
            </button>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
