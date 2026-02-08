"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudLoader from "@/app/components/CloudLoader";

interface TeamMember {
  _id: string;
  name: string;
  enrollmentNumber: string;
  points: number;
  hours: number;
  createdBy?: { username: string; email: string };
  lastUpdatedBy?: { username: string; email: string };
}

export default function Performers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [showAllPerformers, setShowAllPerformers] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<"hoursHigh" | "hoursLow" | "pointsHigh" | "pointsLow">("hoursHigh");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchMembers(token);
  }, [router]);

  const fetchMembers = async (token: string) => {
    try {
      const res = await fetch("/api/team-members", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        throw new Error("Failed to fetch members");
      }

      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isClubLeader");
    localStorage.removeItem("isApproved");
    router.replace("/");
  };

  // Sort members by hours and points
  const getSortedMembers = () => {
    const sorted = [...members];
    switch (sortOption) {
      case "hoursHigh":
        return sorted.sort((a, b) => b.hours - a.hours);
      case "hoursLow":
        return sorted.sort((a, b) => a.hours - b.hours);
      case "pointsHigh":
        return sorted.sort((a, b) => b.points - a.points);
      case "pointsLow":
        return sorted.sort((a, b) => a.points - b.points);
      default:
        return sorted.sort((a, b) => b.hours - a.hours);
    }
  };

  const sortedByHours = [...members].sort((a, b) => b.hours - a.hours);
  const topPerformers = sortedByHours.slice(0, 5);
  const bottomPerformers = sortedByHours.slice(-5).reverse();

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
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
        <div className="relative z-10 text-center">
          <CloudLoader size="50px" />
          <p className="mt-4 text-purple-300 font-semibold">Loading performers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-950 via-black to-purple-950"></div>
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{width: Math.random() * 2 + 'px', height: Math.random() * 2 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', opacity: Math.random() * 0.7 + 0.3, animation: `twinkle ${Math.random() * 3 + 2}s infinite`}}></div>
          ))}
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-3000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">       {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src="/image2.png"
                  alt="TrackU Logo"
                  className="w-20 h-20 rounded-2xl shadow-lg"
                />
                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold bg-linear-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Performance
                  </h1>
                  <p className="text-purple-200 text-sm font-semibold">
                    Top & Bottom Performers
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation - Mobile and Desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Mobile Layout */}
              <div className="flex sm:hidden gap-2">
                <Link
                  href="/dashboard"
                  className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur text-white px-3 py-2 rounded-xl font-semibold transition duration-300 border border-white/30 hover:border-white/60 flex items-center justify-center gap-1 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Dashboard
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex gap-4 items-center">
                <Link
                  href="/dashboard"
                  className="group relative bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-3 rounded-2xl font-semibold transition duration-300 border border-white/30 hover:border-white/60 flex items-center gap-2 hover:shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Dashboard
                </Link>
              </div>

              {/* User Profile Dropdown - Mobile and Desktop */}
              {username && (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center justify-center w-full sm:w-10 sm:h-10 bg-linear-to-br from-purple-400 to-blue-400 rounded-full sm:rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-110 py-2 sm:py-0 px-4 sm:px-0 gap-2 sm:gap-0 font-semibold text-white sm:text-white text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                    <span className="sm:hidden">Profile</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 sm:w-48 bg-slate-800 border border-purple-500/30 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="px-4 py-3 border-b border-purple-500/20">
                        <p className="text-white font-semibold text-sm">{username}</p>
                        <p className="text-purple-300 text-xs mt-1">Club Member</p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-700/20 transition flex items-center gap-2 font-semibold text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-14">
        {error && (
          <div className="bg-red-600/20 border-2 border-red-500/50 text-red-300 px-4 sm:px-6 py-4 rounded-2xl mb-8 font-semibold flex items-start gap-4 backdrop-blur-sm hover:border-red-500/80 transition animate-in fade-in slide-in-from-top-2">
            <svg className="w-6 h-6 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-16a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
            <div>
              <p className="font-bold text-red-200 mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Top Performers */}
          <div>
            <div className="bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-4 sm:py-5 shadow-2xl border-t-4 border-green-400">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Top 5 Performers</h2>
                  <p className="text-green-100 text-xs sm:text-sm">Highest Hours Contributed</p>
                </div>
              </div>
            </div>
            <div className="bg-linear-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-b-2xl sm:rounded-b-3xl shadow-2xl p-4 sm:p-6 border-2 border-green-500/30">
              {topPerformers.length === 0 ? (
                <p className="text-center text-gray-400 py-8 font-semibold">No members found</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {topPerformers.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-linear-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500/40 hover:border-green-500/70 hover:shadow-lg hover:shadow-green-500/20 transition group"
                    >
                      <div className="shrink-0">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg shadow-lg ${
                            index === 0
                              ? "bg-linear-to-br from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "bg-linear-to-br from-gray-300 to-gray-500"
                              : index === 2
                              ? "bg-linear-to-br from-orange-400 to-orange-600"
                              : "bg-linear-to-br from-green-500 to-green-700"
                          }`}
                        >
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg text-white group-hover:text-green-200 transition truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {member.enrollmentNumber}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl sm:text-3xl font-bold text-green-300 drop-shadow-lg">
                          {member.hours}
                        </p>
                        <p className="text-xs text-gray-400 font-semibold">Hours</p>
                        <p className="text-xs text-purple-300 font-bold mt-1">
                          ⭐ {member.points}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Performers */}
          <div>
            <div className="bg-linear-to-r from-orange-600 to-red-600 text-white rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-4 sm:py-5 shadow-2xl border-t-4 border-orange-400">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Bottom 5 Performers</h2>
                  <p className="text-orange-100 text-xs sm:text-sm">Lowest Hours Contributed</p>
                </div>
              </div>
            </div>
            <div className="bg-linear-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-b-2xl sm:rounded-b-3xl shadow-2xl p-4 sm:p-6 border-2 border-orange-500/30">
              {bottomPerformers.length === 0 ? (
                <p className="text-center text-gray-400 py-8 font-semibold">No members found</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {bottomPerformers.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-linear-to-r from-orange-600/20 to-red-600/20 border-2 border-orange-500/40 hover:border-orange-500/70 hover:shadow-lg hover:shadow-orange-500/20 transition group"
                    >
                      <div className="shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-orange-500 to-red-700 flex items-center justify-center font-bold text-white text-sm sm:text-lg shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg text-white group-hover:text-orange-200 transition truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {member.enrollmentNumber}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl sm:text-3xl font-bold text-orange-300 drop-shadow-lg">
                          {member.hours}
                        </p>
                        <p className="text-xs text-gray-400 font-semibold">Hours</p>
                        <p className="text-xs text-purple-300 font-bold mt-1">
                          ⭐ {member.points}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View All Performers Section */}
        <div className="mt-10">
          {!showAllPerformers ? (
            <button
              onClick={() => setShowAllPerformers(true)}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 border border-blue-500/50 hover:border-blue-500/80 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              View All {members.length} Performers
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-linear-to-br from-blue-500 to-purple-500 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">All Performers</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAllPerformers(false)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Sorting Controls */}
              <div className="mb-6 p-4 bg-slate-800/30 rounded-2xl border border-purple-500/30">
                <p className="text-sm font-semibold text-gray-300 mb-3">Sort by:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSortOption("hoursHigh")}
                    className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                      sortOption === "hoursHigh"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    Hours ↓
                  </button>
                  <button
                    onClick={() => setSortOption("hoursLow")}
                    className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                      sortOption === "hoursLow"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    Hours ↑
                  </button>
                  <button
                    onClick={() => setSortOption("pointsHigh")}
                    className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                      sortOption === "pointsHigh"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    Task ↓
                  </button>
                  <button
                    onClick={() => setSortOption("pointsLow")}
                    className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                      sortOption === "pointsLow"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    Task ↑
                  </button>
                </div>
              </div>

              <div className="bg-linear-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border-2 border-blue-500/30">
                {members.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 font-semibold">No members found</p>
                ) : (
                  <div className="space-y-3">
                    {getSortedMembers().map((member, index) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-linear-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/40 hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/20 transition group"
                        >
                          <div className="shrink-0">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                                index === 0
                                  ? "bg-linear-to-br from-yellow-400 to-yellow-600"
                                  : index === 1
                                  ? "bg-linear-to-br from-gray-300 to-gray-500"
                                  : index === 2
                                  ? "bg-linear-to-br from-orange-400 to-orange-600"
                                  : index < 10
                                  ? "bg-linear-to-br from-blue-500 to-blue-700"
                                  : "bg-linear-to-br from-purple-500 to-purple-700"
                              }`}
                            >
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-white group-hover:text-blue-200 transition truncate">
                              {member.name}
                            </h3>
                            <p className="text-xs text-gray-400 truncate">
                              {member.enrollmentNumber}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-3xl font-bold text-blue-300 drop-shadow-lg">
                              {member.hours}
                            </p>
                            <p className="text-xs text-gray-400 font-semibold">Hours</p>
                            <p className="text-xs text-purple-300 font-bold mt-1">
                              ⭐ {member.points} pts
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-10 bg-linear-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-purple-500/30 hover:border-purple-500/60 transition">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Overall Statistics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-5 bg-linear-to-br from-blue-600/30 to-blue-500/20 rounded-2xl border-2 border-blue-500/40 hover:border-blue-500/70 transition hover:shadow-lg hover:shadow-blue-500/20">
              <p className="text-sm text-gray-300 mb-2 font-semibold">Total Members</p>
              <p className="text-4xl font-bold text-blue-300 drop-shadow-lg">
                {members.length}
              </p>
            </div>
            <div className="text-center p-5 bg-linear-to-br from-green-600/30 to-green-500/20 rounded-2xl border-2 border-green-500/40 hover:border-green-500/70 transition hover:shadow-lg hover:shadow-green-500/20">
              <p className="text-sm text-gray-300 mb-2 font-semibold">Avg Hours</p>
              <p className="text-4xl font-bold text-green-300 drop-shadow-lg">
                {members.length > 0
                  ? (
                      members.reduce((sum, m) => sum + m.hours, 0) /
                      members.length
                    ).toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="text-center p-5 bg-linear-to-br from-purple-600/30 to-purple-500/20 rounded-2xl border-2 border-purple-500/40 hover:border-purple-500/70 transition hover:shadow-lg hover:shadow-purple-500/20">
              <p className="text-sm text-gray-300 mb-2 font-semibold">Total Hours</p>
              <p className="text-4xl font-bold text-purple-300 drop-shadow-lg">
                {members.reduce((sum, m) => sum + m.hours, 0)}
              </p>
            </div>
            <div className="text-center p-5 bg-linear-to-br from-amber-600/30 to-amber-500/20 rounded-2xl border-2 border-amber-500/40 hover:border-amber-500/70 transition hover:shadow-lg hover:shadow-amber-500/20">
              <p className="text-sm text-gray-300 mb-2 font-semibold">Total Points</p>
              <p className="text-4xl font-bold text-amber-300 drop-shadow-lg">
                {members.reduce((sum, m) => sum + m.points, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
