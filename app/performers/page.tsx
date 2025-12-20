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
    router.replace("/login");
  };

  // Sort members by hours
  const sortedByHours = [...members].sort((a, b) => b.hours - a.hours);
  const topPerformers = sortedByHours.slice(0, 5);
  const bottomPerformers = sortedByHours.slice(-5).reverse();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Performance Report
              </h1>
              <p className="text-amber-100 mt-1 text-sm sm:text-base">
                Top & Bottom Performers by Hours
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-amber-100">
                  Logged in as
                </p>
                <p className="font-semibold text-sm sm:text-base">{username}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Link
                  href="/dashboard"
                  className="flex-1 sm:flex-none bg-white text-amber-700 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-amber-50 transition text-sm sm:text-base text-center"
                >
                  ← Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <div>
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">
                    Top 5 Performers
                  </h2>
                  <p className="text-green-100 text-xs sm:text-sm">
                    Highest Hours
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-b-2xl shadow-xl p-3 sm:p-6 border-2 border-green-200">
              {topPerformers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No members found
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {topPerformers.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-md transition"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white text-base sm:text-lg ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-500"
                              : index === 2
                              ? "bg-gradient-to-br from-orange-400 to-orange-600"
                              : "bg-gradient-to-br from-green-500 to-green-700"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg text-gray-800 truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {member.enrollmentNumber}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl sm:text-3xl font-bold text-green-700">
                          {member.hours}
                        </p>
                        <p className="text-xs text-gray-600">Hours</p>
                        <p className="text-xs sm:text-sm text-amber-600 font-semibold mt-1">
                          {member.points} pts
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
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                </svg>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">
                    Bottom 5 Performers
                  </h2>
                  <p className="text-red-100 text-xs sm:text-sm">
                    Lowest Hours
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-b-2xl shadow-xl p-3 sm:p-6 border-2 border-red-200">
              {bottomPerformers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No members found
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {bottomPerformers.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 hover:shadow-md transition"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-white text-base sm:text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg text-gray-800 truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {member.enrollmentNumber}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl sm:text-3xl font-bold text-red-700">
                          {member.hours}
                        </p>
                        <p className="text-xs text-gray-600">Hours</p>
                        <p className="text-xs sm:text-sm text-amber-600 font-semibold mt-1">
                          {member.points} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-amber-200">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
            Overall Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Total Members
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                {members.length}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-700">
                {members.length > 0
                  ? (
                      members.reduce((sum, m) => sum + m.hours, 0) /
                      members.length
                    ).toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Total Hours
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-700">
                {members.reduce((sum, m) => sum + m.hours, 0)}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Total Points
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-700">
                {members.reduce((sum, m) => sum + m.points, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
