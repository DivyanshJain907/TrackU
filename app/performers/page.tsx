"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  // Sort members by hours
  const sortedByHours = [...members].sort((a, b) => b.hours - a.hours);
  const topPerformers = sortedByHours.slice(0, 5);
  const bottomPerformers = sortedByHours.slice(-5).reverse();

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
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
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-purple-300 font-semibold">Loading performers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-black to-purple-950"></div>
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
      <div className="relative z-10 bg-gradient-to-r from-purple-700/90 via-blue-700/90 to-purple-700/90 backdrop-blur-xl text-white shadow-2xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Performance
                  </h1>
                  <p className="text-purple-200 text-sm font-semibold">
                    Top & Bottom Performers
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex gap-4 items-center">
              <Link
                href="/dashboard"
                className="group relative bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-3 rounded-2xl font-semibold transition duration-300 border border-white/30 hover:border-white/60 flex items-center gap-2 hover:shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              {username && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur border border-white/30 rounded-2xl hover:border-white/60 hover:bg-white/20 transition group">
                  <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-white font-semibold whitespace-nowrap group-hover:text-purple-200 transition">
                    {username}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="group relative bg-red-600/80 hover:bg-red-700 backdrop-blur text-white px-6 py-3 rounded-2xl font-semibold transition duration-300 border border-red-500/50 hover:border-red-500/80 shadow-lg hover:shadow-xl hover:shadow-red-500/20 flex items-center gap-2 transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => {}} className="md:hidden text-white hover:text-purple-200 focus:outline-none transition transform hover:scale-110" aria-label="Toggle menu">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 sm:py-14">
        {error && (
          <div className="bg-red-600/20 border-2 border-red-500/50 text-red-300 px-6 py-4 rounded-2xl mb-8 font-semibold flex items-start gap-4 backdrop-blur-sm hover:border-red-500/80 transition animate-in fade-in slide-in-from-top-2">
            <svg className="w-6 h-6 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-16a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
            <div>
              <p className="font-bold text-red-200 mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <div>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-3xl px-6 py-5 shadow-2xl border-t-4 border-green-400">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Top 5 Performers</h2>
                  <p className="text-green-100 text-sm">Highest Hours Contributed</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-b-3xl shadow-2xl p-6 border-2 border-green-500/30">
              {topPerformers.length === 0 ? (
                <p className="text-center text-gray-400 py-8 font-semibold">No members found</p>
              ) : (
                <div className="space-y-3">
                  {topPerformers.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500/40 hover:border-green-500/70 hover:shadow-lg hover:shadow-green-500/20 transition group"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-500"
                              : index === 2
                              ? "bg-gradient-to-br from-orange-400 to-orange-600"
                              : "bg-gradient-to-br from-green-500 to-green-700"
                          }`}
                        >
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-white group-hover:text-green-200 transition truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {member.enrollmentNumber}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-3xl font-bold text-green-300 drop-shadow-lg">
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

          {/* Bottom Performers */}
          <div>
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-3xl px-6 py-5 shadow-2xl border-t-4 border-orange-400">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Bottom 5 Performers</h2>
                  <p className="text-orange-100 text-sm">Lowest Hours Contributed</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-b-3xl shadow-2xl p-6 border-2 border-orange-500/30">
              {bottomPerformers.length === 0 ? (
                <p className="text-center text-gray-400 py-8 font-semibold">No members found</p>
              ) : (
                <div className="space-y-3">
                  {bottomPerformers.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-600/20 to-red-600/20 border-2 border-orange-500/40 hover:border-orange-500/70 hover:shadow-lg hover:shadow-orange-500/20 transition group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-white group-hover:text-orange-200 transition truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {member.enrollmentNumber}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-3xl font-bold text-orange-300 drop-shadow-lg">
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
        </div>

        {/* View All Performers Section */}
        <div className="mt-10">
          {!showAllPerformers ? (
            <button
              onClick={() => setShowAllPerformers(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 border border-blue-500/50 hover:border-blue-500/80 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              View All {members.length} Performers
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">All Performers</h3>
                </div>
                <button
                  onClick={() => setShowAllPerformers(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold transition"
                >
                  Close
                </button>
              </div>

              <div className="bg-gradient-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border-2 border-blue-500/30">
                {members.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 font-semibold">No members found</p>
                ) : (
                  <div className="space-y-3">
                    {[...members]
                      .sort((a, b) => b.hours - a.hours)
                      .map((member, index) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/40 hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/20 transition group"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                                index === 0
                                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                  : index === 1
                                  ? "bg-gradient-to-br from-gray-300 to-gray-500"
                                  : index === 2
                                  ? "bg-gradient-to-br from-orange-400 to-orange-600"
                                  : index < 10
                                  ? "bg-gradient-to-br from-blue-500 to-blue-700"
                                  : "bg-gradient-to-br from-purple-500 to-purple-700"
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
                          <div className="text-right flex-shrink-0">
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
        <div className="mt-10 bg-gradient-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-purple-500/30 hover:border-purple-500/60 transition">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Overall Statistics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-5 bg-gradient-to-br from-blue-600/30 to-blue-500/20 rounded-2xl border-2 border-blue-500/40 hover:border-blue-500/70 transition hover:shadow-lg hover:shadow-blue-500/20">
              <p className="text-sm text-gray-300 mb-2 font-semibold">Total Members</p>
              <p className="text-4xl font-bold text-blue-300 drop-shadow-lg">
                {members.length}
              </p>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-green-600/30 to-green-500/20 rounded-2xl border-2 border-green-500/40 hover:border-green-500/70 transition hover:shadow-lg hover:shadow-green-500/20">
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
            <div className="text-center p-5 bg-gradient-to-br from-purple-600/30 to-purple-500/20 rounded-2xl border-2 border-purple-500/40 hover:border-purple-500/70 transition hover:shadow-lg hover:shadow-purple-500/20">
              <p className="text-sm text-gray-300 mb-2 font-semibold">Total Hours</p>
              <p className="text-4xl font-bold text-purple-300 drop-shadow-lg">
                {members.reduce((sum, m) => sum + m.hours, 0)}
              </p>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-amber-600/30 to-amber-500/20 rounded-2xl border-2 border-amber-500/40 hover:border-amber-500/70 transition hover:shadow-lg hover:shadow-amber-500/20">
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
