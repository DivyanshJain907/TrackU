"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export default function MaintenancePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");

    // If user is admin, redirect to admin dashboard
    if (isAdmin === "true" && token) {
      router.replace("/admin");
      return;
    }

    // If not logged in, redirect to login
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [router]);

  return (
    <div className={`${poppins.className} min-h-screen bg-[#eaf6f1] px-4 py-14 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#d7e9e1] bg-white p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-10">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#fff6df]">
          <svg className="h-10 w-10 text-[#b68a1f]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#1f2623] sm:text-4xl">Maintenance Mode</h1>
        <p className="mt-4 text-base text-[#55615d] sm:text-lg">We are performing scheduled maintenance to improve your experience.</p>
        <p className="mt-2 text-sm text-[#7a8580] sm:text-base">The application will be back online shortly.</p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.refresh()}
            className="rounded-lg bg-[#49c89f] px-8 py-3 font-semibold text-white transition hover:bg-[#39b68d]"
          >
            Retry
          </button>
          <Link
            href="/login"
            className="rounded-lg border border-[#cde4da] bg-[#f7fcfa] px-8 py-3 font-semibold text-[#2d3834] transition hover:bg-[#eef9f4]"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
