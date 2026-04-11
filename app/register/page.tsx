"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudLoader from "@/app/components/CloudLoader";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClubLeader, setIsClubLeader] = useState(false);
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    // Validate username - only alphabets and spaces allowed
    if (!/^[a-zA-Z ]+$/.test(username)) {
      setError("Username must contain only alphabets and spaces");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Validate phone number - only 10 digits and first digit >= 6 (Indian format)
    const phoneDigitsOnly = phone.replace(/\D/g, "");
    if (phoneDigitsOnly.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }
    if (parseInt(phoneDigitsOnly[0]) < 6) {
      setError("Phone number must start with a digit >= 6 (valid Indian format)");
      setLoading(false);
      return;
    }

    if (!isClubLeader) {
      setError("Only club leaders can register. Please contact an admin for access.");
      setLoading(false);
      return;
    }

    if (isClubLeader && !clubName.trim()) {
      setError("Club name is required for club leaders");
      setLoading(false);
      return;
    }

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          phone,
          password,
          isClubLeader: true,
          clubName: clubName.trim(),
          clubDescription: clubDescription.trim(),
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setError(registerData.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess("Registration successful! Awaiting admin approval...");
      localStorage.setItem("token", registerData.token);
      localStorage.setItem("userId", registerData.userId);
      localStorage.setItem("username", registerData.username || "");
      localStorage.setItem("isAdmin", "false");
      localStorage.setItem("isClubLeader", "true");
      localStorage.setItem("isApproved", registerData.isApproved ? "true" : "false");
      
      setTimeout(() => {
        router.push("/pending");
      }, 2000);
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

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#49c89f] shadow-[0_12px_24px_rgba(73,200,159,0.35)]">
            <img
              src="/image2.png"
              alt="TrackU Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="mb-2 mt-4 text-2xl font-bold text-[#1d2522] sm:text-3xl">Club Leader Registration</h1>
          <p className="text-sm text-[#5f6b67]">Create your club and manage members</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-[#d7e9e1] bg-white shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
          {/* Form Section */}
          <div className="px-6 sm:px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-[#25302c]"
                >
                  Username
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      // Allow only alphabets and spaces
                      const value = e.target.value.replace(/[^a-zA-Z ]/g, "");
                      setUsername(value);
                    }}
                    placeholder="username"
                    required
                    className="w-full rounded-xl border border-[#d7e9e1] bg-[#f6fcfa] py-3 pl-10 pr-4 text-[#1e2724] placeholder-[#8fa39d] outline-none transition focus:border-[#49c89f]"
                  />
                </div>
              </div>

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

              {/* Phone Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[#25302c]"
                >
                  Phone Number
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      // Allow only digits and limit to 10
                      let value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      // If first digit is less than 6, don't allow
                      if (value.length > 0 && parseInt(value[0]) < 6) {
                        value = value.slice(1);
                      }
                      setPhone(value);
                    }}
                    placeholder="9XXXXXXXXX"
                    className="w-full rounded-xl border border-[#d7e9e1] bg-[#f6fcfa] py-3 pl-10 pr-4 text-[#1e2724] placeholder-[#8fa39d] outline-none transition focus:border-[#49c89f]"
                    maxLength={10}
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

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[#25302c]"
                >
                  Confirm Password
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
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-[#d7e9e1] bg-[#f6fcfa] py-3 pl-10 pr-12 text-[#1e2724] placeholder-[#8fa39d] outline-none transition focus:border-[#49c89f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
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

              {/* Club Leader Toggle */}
              <div className="rounded-xl border border-[#d7e9e1] bg-[#f5fbf8] p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClubLeader}
                    onChange={(e) => setIsClubLeader(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#49c89f]"
                  />
                  <span className="text-sm font-semibold text-[#2a342f]">
                    I want to create a club
                  </span>
                </label>
              </div>

              {/* Club Fields - Show only if club leader */}
              {isClubLeader && (
                <>
                  <div>
                    <label
                      htmlFor="clubName"
                      className="mb-2 block text-sm font-semibold text-[#25302c]"
                    >
                      Club Name
                    </label>
                    <input
                      id="clubName"
                      type="text"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="e.g., Music Club"
                      className="w-full rounded-xl border border-[#d7e9e1] bg-[#f6fcfa] px-4 py-3 text-[#1e2724] placeholder-[#8fa39d] outline-none transition focus:border-[#49c89f]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="clubDescription"
                      className="mb-2 block text-sm font-semibold text-[#25302c]"
                    >
                      Club Description (Optional)
                    </label>
                    <textarea
                      id="clubDescription"
                      value={clubDescription}
                      onChange={(e) => setClubDescription(e.target.value)}
                      placeholder="Describe your club..."
                      rows={3}
                      className="w-full rounded-xl border border-[#d7e9e1] bg-[#f6fcfa] px-4 py-3 text-[#1e2724] placeholder-[#8fa39d] outline-none transition focus:border-[#49c89f]"
                    />
                  </div>
                </>
              )}

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

              {/* Success Message */}
              {success && (
                <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-medium text-green-700">{success}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-[#49c89f] px-4 py-3.5 font-bold text-white transition hover:bg-[#3db58d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <CloudLoader size="20px" />
                    <span className="ml-2">Creating account...</span>
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 px-4 text-center text-sm font-medium text-[#6d7874]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#2f8f71] transition hover:text-[#25775d]"
          >
            Sign In
          </Link>
        </p>
        <p className="mt-2 px-4 text-center text-xs text-[#8c9793]">
          TrackU Team Activity Tracker • Secure & Reliable
        </p>
      </div>
    </div>
  );
}
