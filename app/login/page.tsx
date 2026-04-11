"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudLoader from "@/app/components/CloudLoader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check if user is pending approval
        if (data.status === "pending_approval") {
          localStorage.setItem("userId", data.userId);
          router.replace("/pending");
          return;
        }
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);
      localStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");
      localStorage.setItem("isClubLeader", data.isClubLeader ? "true" : "false");
      localStorage.setItem("isApproved", data.isApproved ? "true" : "false");

      // Redirect to admin if user is admin, otherwise dashboard
      if (data.isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eaf6f1] p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#d4efe5] blur-3xl"></div>
      <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-[#cfe9df] blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#49c89f] shadow-[0_12px_24px_rgba(73,200,159,0.35)]">
            <img
              src="/image2.png"
              alt="TrackU Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="mb-2 mt-4 text-3xl font-bold text-[#1d2522] sm:text-4xl">Welcome Back</h1>
          <p className="text-sm text-[#5f6b67]">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-[#d7e9e1] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
          {/* Form Section */}
          <div className="px-6 sm:px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#25302c]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-[#87a099]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-[#d7e9e1] bg-[#f6fcfa] py-3 pl-10 pr-4 text-[#1e2724] placeholder-[#8fa39d] outline-none transition focus:border-[#49c89f]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#25302c]"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-[#87a099]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-[#d7e9e1] bg-[#f6fcfa] py-3 pl-10 pr-12 text-[#1e2724] placeholder-[#8fa39d] outline-none transition focus:border-[#49c89f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5 text-[#87a099] transition hover:text-[#2f8f71]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-[#87a099] transition hover:text-[#2f8f71]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-red-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#49c89f] px-4 py-3.5 font-bold text-white transition hover:bg-[#3db58d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <CloudLoader size="20px" />
                    <span className="ml-2">Signing in...</span>
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 px-4 text-center text-sm font-medium text-[#6d7874]">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#2f8f71] transition hover:text-[#25775d]"
          >
            Sign Up
          </Link>
        </p>
        <p className="mt-2 px-4 text-center text-xs text-[#8c9793]">
          TrackU Team Activity Tracker • Secure & Reliable
        </p>
      </div>
    </div>
  );
}
