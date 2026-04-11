import Link from 'next/link';
import ThemedPageShell from '@/app/components/ThemedPageShell';

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
    <ThemedPageShell
      title="Simple, Transparent Pricing"
      subtitle="Choose the plan that fits your organization size and support needs."
    >
      <article className="rounded-2xl border border-[#eadfb8] bg-[#fff9e8] p-6">
        <h3 className="text-base font-bold text-[#5e4f1f] sm:text-lg">Limited Free Offer</h3>
        <p className="mt-2 text-sm leading-7 text-[#6b6039] sm:text-base">
          TrackU is offering the starter plan free for the first 10 clubs. Register early to secure your spot.
        </p>
      </article>

      <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-3xl border p-8 transition ${
                plan.highlighted
                  ? "border-[#47c39a] bg-[#e7f8f1] shadow-lg"
                  : "border-[#d7e9e1] bg-white"
              }`}
            >
              <h3 className="mb-2 text-2xl font-bold text-[#1f2623]">{plan.name}</h3>
              <p className="mb-4 text-sm text-[#6a7671]">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1f2623]">{plan.price}</span>
                {plan.period && <span className="ml-2 text-[#6a7671]">{plan.period}</span>}
              </div>

              <Link href={plan.name === "Starter" ? "/login" : plan.name === "Enterprise" ? "/contact" : "#"}>
                <button
                  className={`mb-8 w-full rounded-lg py-3 font-bold transition ${
                    plan.highlighted
                      ? "bg-[#49c89f] text-white"
                      : "border border-[#cde4da] text-[#2d3834] hover:bg-[#f3fbf7]"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>

              <div className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-lg text-[#49c89f]">✓</span>
                    <span className="text-[#55615d]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <article className="rounded-3xl border border-[#d7e9e1] bg-white p-8 md:p-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#1f2623] sm:text-3xl">Frequently Asked Questions</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-lg font-bold text-[#1f2623]">Can I upgrade or downgrade anytime?</h4>
              <p className="text-[#55615d]">Yes, plan changes can be made when your needs change.</p>
            </div>
            <div>
              <h4 className="mb-2 text-lg font-bold text-[#1f2623]">Is there a free trial?</h4>
              <p className="text-[#55615d]">The starter tier is available at no cost for eligible clubs.</p>
            </div>
            <div>
              <h4 className="mb-2 text-lg font-bold text-[#1f2623]">Do you offer annual discounts?</h4>
              <p className="text-[#55615d]">Yes, annual commitments can include discounted pricing.</p>
            </div>
            <div>
              <h4 className="mb-2 text-lg font-bold text-[#1f2623]">What payment methods do you accept?</h4>
              <p className="text-[#55615d]">Major cards and common business payment methods are supported.</p>
            </div>
          </div>
        </article>

        <div className="text-center">
          <h3 className="mb-4 text-2xl font-bold text-[#1f2623]">Ready to get started?</h3>
          <Link href="/register">
            <button className="rounded-xl bg-[#49c89f] px-8 py-4 font-bold text-white transition hover:bg-[#39b68d]">
              Start Free Today
            </button>
          </Link>
        </div>
    </ThemedPageShell>
  );
}
