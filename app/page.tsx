"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { useState } from 'react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className={`${poppins.className} min-h-screen bg-[#eaf6f1] text-[#1f2422]`}>
      <main>
        <section className="bg-[#eef8f4] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <header className="flex items-center justify-between py-4">
              <p className="text-3xl font-semibold tracking-[-0.06em] text-[#1a1f1d] sm:text-4xl">TRACKU</p>

              <nav className="hidden items-center gap-7 text-[12px] font-medium md:flex">
                <Link href="/" className="text-[#1f2523]">Home</Link>
                <Link href="/product" className="text-[#8f9894] hover:text-[#1f2523]">Product</Link>
                <Link href="/faq" className="text-[#8f9894] hover:text-[#1f2523]">FAQ</Link>
                <Link href="/about" className="text-[#8f9894] hover:text-[#1f2523]">About Us</Link>
              </nav>

              <div className="flex items-center gap-3 text-[12px] font-medium">
                <Link href="/login" className="text-[#7c8581] hover:text-[#1f2523]">Login</Link>
                <Link href="/register" className="rounded-lg bg-[#4ac89f] px-3 py-2 font-semibold text-white">
                  Sign Up
                </Link>
              </div>
            </header>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h1 className="max-w-md text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-[#171d1b] sm:text-5xl lg:text-6xl">
                  Manage Your Clubs Effortlessly
                </h1>
                <div className="mt-6 h-1.5 w-67.5 rounded-full bg-[#49c89f]"></div>
                <p className="mt-8 max-w-md text-base leading-7 text-[#2f3935] sm:text-lg sm:leading-8">
                  TrackU is a comprehensive club management system designed to help you track attendance, manage
                  members, organize events, and keep your club running smoothly.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-4 sm:gap-5">
                  <Link href="/register" className="rounded-full bg-[#49c89f] px-6 py-3 text-sm font-semibold text-white sm:px-7 sm:text-base">
                    Try free trial
                  </Link>
                  <Link href="/about" className="inline-flex items-center gap-2 text-sm font-medium text-[#202724] sm:text-base">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#313835] text-[10px]">▶</span>
                    View Demo
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute right-[-8%] top-10 h-105 w-120 rounded-[45%] bg-[#e3ead3]"></div>
                <div className="relative z-10">
                  <div className="absolute left-0 top-0 z-20 rounded-xl bg-white px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] text-[#c0c4c2]">Add Member</p>
                    <div className="mt-1 flex items-center gap-4">
                      <p className="text-[13px] font-semibold text-[#2a312e]">Member Name..</p>
                      <span className="rounded-full bg-[#4dcba2] px-3 py-1 text-[10px] font-semibold text-white">Add +</span>
                    </div>
                  </div>
                  <Image
                    src="/hero.png"
                    alt="TrackU hero"
                    width={900}
                    height={700}
                    className="relative ml-8 mt-12 h-auto w-full max-w-140"
                    priority
                  />
                  <div className="absolute -bottom-1 left-8 z-20 rounded-lg bg-white px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] text-[#c7ccca]">Add Task</p>
                    <p className="text-[12px] font-medium text-[#38423e]">On Ground Duty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f3f0f8] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
            <div>
              <h2 className="max-w-lg text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-[#1d221f] sm:text-4xl lg:text-5xl">Powerful features, built into TRACKU</h2>
              <p className="mt-8 max-w-lg text-sm leading-6 text-[#9ca4a0] sm:text-base sm:leading-7">
                Smart tools designed to simplify management, improve accuracy, and boost productivity
              </p>
              <div className="mt-12 flex flex-wrap gap-8 sm:mt-16 sm:gap-14">
                <div>
                  <p className="text-lg text-[#f3c146] sm:text-xl">★★★★★</p>
                  <p className="mt-1 text-lg font-bold text-[#222826] sm:text-xl">4.9 / 5 rating</p>
                  <p className="mt-1 text-base text-[#8f9894] sm:text-lg">databricks</p>
                </div>
                <div>
                  <p className="text-lg text-[#f3c146] sm:text-xl">★★★★☆</p>
                  <p className="mt-1 text-lg font-bold text-[#222826] sm:text-xl">4.8 / 5 rating</p>
                  <p className="mt-1 text-base text-[#8f9894] sm:text-lg">Chainalysis</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-4">
              {[
                {
                  title: 'Fast and Reliable',
                  desc: 'Streamline your workflow with speed, stability, and seamless collaboration.',
                },
                {
                  title: 'Attendance Tracking',
                  desc: 'Monitor attendance effortlessly with accurate insights and easy-to-generate reports',
                },
                {
                  title: 'Member Management',
                  desc: 'Manage and engage your members efficiently with a simple and intuitive system.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d9e7e0] bg-[#f7fffb] text-[#49c89f]">
                    ✦
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#262d2a] sm:text-3xl">{item.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#a0a8a4] sm:text-base sm:leading-7">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#dff1ea] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="max-w-xl text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-[#171d1b] sm:text-4xl lg:text-5xl">What Benefits Will You Get with TrackU</h2>
              <ul className="mt-12 space-y-6">
                {[
                  'Centralized Club Management',
                  'Accurate Attendance & Contribution Tracking',
                  'Time-Saving Automation',
                  'Improved Accountability & Transparency',
                  'Real-Time Insights & Reports',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-base font-medium text-[#2d3834] sm:text-lg lg:text-xl">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#49c89f] text-sm text-white">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-3xl bg-[#e6ebe9] p-2 shadow-[0_14px_42px_rgba(0,0,0,0.14)]">
                <Image
                  src="/benifits.png"
                  alt="TrackU benefits"
                  width={900}
                  height={900}
                  className="h-auto w-full rounded-3xl object-cover"
                />
              </div>
              <div className="absolute -left-7 top-8 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <p className="text-sm font-semibold text-[#202724]">Amanda Young</p>
                <p className="text-xs text-[#9ba39f]">Club Leader</p>
              </div>
              <div className="absolute -right-5 top-36 rounded-xl bg-white px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <p className="text-xs text-[#a4aba8]">Total Members</p>
                <p className="text-2xl font-bold text-[#232a27]">25</p>
              </div>
              <div className="absolute -bottom-4.5 left-10 rounded-xl bg-white px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <p className="text-sm font-semibold text-[#2a3430]">Task Added Successfully</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#edf8f4] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-[#181f1c] sm:text-4xl lg:text-5xl">Choose Plan That&apos;s Right For You</h2>
              <p className="mt-7 text-sm text-[#9da5a2] sm:text-base">Choose plan that works best for you, feel free to contact us (India pricing, {billingCycle})</p>
            </div>

            <div className="mx-auto mt-10 flex w-fit rounded-xl bg-white p-1 shadow-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-lg px-8 py-3 text-[15px] font-semibold ${billingCycle === 'monthly' ? 'bg-[#49c89f] text-white' : 'text-[#313835]'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-lg px-8 py-3 text-[15px] font-semibold ${billingCycle === 'yearly' ? 'bg-[#49c89f] text-white' : 'text-[#313835]'}`}
              >
                Yearly
              </button>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <h3 className="text-3xl font-bold text-[#252c29] sm:text-4xl">Free</h3>
                <p className="mt-2 text-[15px] text-[#a4aba8]">Have a go and test your superpowers</p>
                <p className="mt-5 text-4xl font-bold text-[#222826] sm:text-5xl">Rs 0</p>
                <ul className="mt-8 space-y-4 text-[16px] text-[#3e4844]">
                  <li>2 Users</li>
                  <li>2 Files</li>
                  <li>Public Share & Comments</li>
                  <li>Chat Support</li>
                  <li>New income apps</li>
                </ul>
                <Link href="/register" className="mt-9 block rounded-xl bg-[#f5f7f6] py-3 text-center text-[16px] font-semibold text-[#43bf95]">
                  Signup for free
                </Link>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-[#57c8a3] p-8 text-white shadow-[0_20px_50px_rgba(28,114,85,0.34)]">
                <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[135%] -translate-x-1/2 rounded-[50%] bg-[#78d6b7]/70"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold sm:text-4xl">Pro</h3>
                  <p className="mt-2 text-[15px] text-[#e8fff6]">Experiment the power of infinitive possibilities</p>
                  <p className="mt-5 text-4xl font-bold sm:text-5xl">{billingCycle === 'monthly' ? 'Rs 99' : 'Rs 800'}</p>
                  {billingCycle === 'yearly' ? (
                    <span className="mt-2 inline-block rounded-md bg-[#7cd8ba] px-3 py-1 text-[12px] font-semibold">Save Rs 388 a year</span>
                  ) : (
                    <span className="mt-2 inline-block rounded-md bg-[#7cd8ba] px-3 py-1 text-[12px] font-semibold">Billed monthly</span>
                  )}
                  <ul className="mt-8 space-y-4 text-[16px] text-[#f5fffa]">
                    <li>4 Users</li>
                    <li>All apps</li>
                    <li>Unlimited editable exports</li>
                    <li>Folders and collaboration</li>
                    <li>All incoming apps</li>
                  </ul>
                  <Link href="/register" className="mt-9 block rounded-xl bg-white py-3 text-center text-[16px] font-bold text-[#47bf97]">
                    Go to Pro
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <h3 className="text-3xl font-bold text-[#252c29] sm:text-4xl">Business</h3>
                <p className="mt-2 text-[15px] text-[#a4aba8]">Unveil new superpowers and join the Design League</p>
                <p className="mt-5 text-4xl font-bold text-[#222826] sm:text-5xl">{billingCycle === 'monthly' ? 'Rs 199' : 'Rs 1600'}</p>
                <ul className="mt-8 space-y-4 text-[16px] text-[#3e4844]">
                  <li>All the features of pro plan</li>
                  <li>Account success Manager</li>
                  <li>Single Sign-On (SSO)</li>
                  <li>Co-conception program</li>
                  <li>Collaboration-Soon</li>
                </ul>
                <Link href="/register" className="mt-9 block rounded-xl bg-[#f5f7f6] py-3 text-center text-[16px] font-semibold text-[#43bf95]">
                  Go to Business
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#dff2eb] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="max-w-lg text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-[#151c19] sm:text-4xl lg:text-5xl">What People Are Saying About TRACKU</h2>
              <p className="mt-7 max-w-lg text-sm leading-7 text-[#33403b] sm:text-base sm:leading-8">
                TrackU is helping clubs stay organized, track contributions, and manage teams without the usual chaos.
              </p>
              <p className="mt-8 text-5xl font-bold leading-none sm:text-6xl">&ldquo;</p>
              <p className="max-w-lg text-base leading-7 text-[#202724] sm:text-lg sm:leading-8">
                &ldquo;TrackU completely changed how we manage our club. No more spreadsheets or confusion - everything is
                organized, transparent, and easy to track. It saves us hours every week.&rdquo;
              </p>
              <p className="mt-5 text-base font-bold text-[#131918] sm:text-lg">Club Cordinator, University Society</p>
              <div className="mt-7 flex items-center gap-3">
                {[
                  "https://i.pravatar.cc/120?img=12",
                  "https://i.pravatar.cc/120?img=24",
                  "https://i.pravatar.cc/120?img=36",
                  "https://i.pravatar.cc/120?img=48",
                ].map((avatarUrl, i) => (
                  <div key={i} className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
                    <img src={avatarUrl} alt={`avatar-${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
                <button type="button" className="ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#2a322f] text-[#2a322f]">
                  ▶
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#202943] p-10 text-white shadow-[0_20px_60px_rgba(18,27,48,0.34)]">
              <h3 className="text-center text-3xl font-bold sm:text-4xl lg:text-5xl">Get Started</h3>
              <form className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-[16px] text-[#d7e0f2]">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-[#3f4c6b] bg-white px-4 py-3 text-[#1f2740] outline-none"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[16px] text-[#d7e0f2]">Message</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-[#3f4c6b] bg-white px-4 py-3 text-[#1f2740] outline-none"
                    placeholder="What are you say ?"
                  ></textarea>
                </div>
                <button type="button" className="w-full rounded-lg bg-[#4ac89f] py-3 text-[16px] font-semibold text-white">
                  Request Demo
                </button>
                <p className="text-right text-[13px] text-[#d2d8e8]">or Start Free Trial</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#e7f3ee] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
          <div>
            <p className="text-4xl font-semibold tracking-[-0.03em] text-[#49c89f] sm:text-5xl">TRACKU</p>
            <p className="mt-4 text-sm font-semibold text-[#212926] sm:text-base">Get started now try our product</p>
            <div className="mt-6 flex rounded-full border border-[#a8d5c5] bg-[#edf8f4] p-1">
              <input
                type="email"
                placeholder="Enter your email here"
                className="w-full bg-transparent px-4 py-2 text-[14px] outline-none"
              />
              <button type="button" className="rounded-full bg-[#4ac89f] px-4 text-white">➜</button>
            </div>
          </div>

          <div>
            <h4 className="text-[14px] font-semibold uppercase text-[#c6ceca]">Support</h4>
            <ul className="mt-5 space-y-3 text-sm text-[#28312e] sm:text-base">
              <li><Link href="/help-centre">Help centre</Link></li>
              <li><Link href="/account-information">Account information</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[14px] font-semibold uppercase text-[#c6ceca]">Talk to support</h4>
            <ul className="mt-5 space-y-3 text-sm text-[#28312e] sm:text-base">
              <li><Link href="/talk-to-support">Talk to support</Link></li>
              <li><Link href="/support-docs">Support docs</Link></li>
              <li><Link href="/system-status">System status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[14px] font-semibold uppercase text-[#c6ceca]">Update</h4>
            <ul className="mt-5 space-y-3 text-sm text-[#28312e] sm:text-base">
              <li><Link href="/update">Update</Link></li>
              <li><Link href="/security">Security</Link></li>
              <li><Link href="/beta-test">Beta test</Link></li>
              <li><Link href="/pricing-product">Pricing product</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}


