"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500/20 rounded-full mb-6">
            <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-4">Maintenance Mode</h1>
        <p className="text-xl text-purple-200 mb-8">
          We're performing scheduled maintenance to improve your experience.
        </p>
        <p className="text-gray-400 mb-8">
          The application will be back online shortly. Please check back later.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.refresh()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Retry
          </button>
          <Link
            href="/login"
            className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
