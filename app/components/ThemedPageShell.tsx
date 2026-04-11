import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { ReactNode } from 'react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

type ThemedPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function ThemedPageShell({ title, subtitle, children }: ThemedPageShellProps) {
  return (
    <div className={`${poppins.className} min-h-screen bg-[#eaf6f1] text-[#1f2422]`}>
      <header className="border-b border-[#d7e9e1] bg-[#eef8f4] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="text-3xl font-semibold tracking-[-0.05em] text-[#1a1f1d] sm:text-4xl">
            TRACKU
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" className="text-[#202724]">Home</Link>
            <Link href="/about" className="text-[#6f7874] hover:text-[#202724]">About</Link>
            <Link href="/pricing" className="text-[#6f7874] hover:text-[#202724]">Pricing</Link>
            <Link href="/contact" className="text-[#6f7874] hover:text-[#202724]">Contact</Link>
          </nav>
          <Link href="/register" className="rounded-lg bg-[#49c89f] px-4 py-2 text-sm font-semibold text-white">
            Sign Up
          </Link>
        </div>
      </header>

      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <section className="mb-10 rounded-3xl border border-[#d7e9e1] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-10">
            <h1 className="text-3xl font-bold leading-tight text-[#19201d] sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5f6a66] sm:text-base">{subtitle}</p>
          </section>

          <section className="grid gap-6">{children}</section>
        </div>
      </main>

      <footer className="bg-[#e7f3ee] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
          <div>
            <p className="text-4xl font-semibold tracking-[-0.03em] text-[#49c89f]">TRACKU</p>
            <p className="mt-3 text-sm font-semibold text-[#212926]">Get started now try our product</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#a2aca8]">Support</h4>
            <ul className="mt-4 space-y-2 text-sm text-[#2a322f]">
              <li><Link href="/help-centre">Help centre</Link></li>
              <li><Link href="/account-information">Account information</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#a2aca8]">Talk to support</h4>
            <ul className="mt-4 space-y-2 text-sm text-[#2a322f]">
              <li><Link href="/talk-to-support">Talk to support</Link></li>
              <li><Link href="/support-docs">Support docs</Link></li>
              <li><Link href="/system-status">System status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#a2aca8]">Update</h4>
            <ul className="mt-4 space-y-2 text-sm text-[#2a322f]">
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
