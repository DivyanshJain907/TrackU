"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StatsData {
  users: {
    total: number;
    approved: number;
    pending: number;
  };
  teamMembers: number;
  clubs: number;
  attendance: {
    total: number;
    present: number;
    absent: number;
    excused: number;
    rate: string;
  };
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<StatsData | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Unauthorized: Admin access only");
        setLoading(false);
        setTimeout(() => router.push("/dashboard"), 2000);
        return;
      }

      setIsAdmin(true);
      await fetchStats(token);
    } catch (err) {
      setError("Error verifying admin access");
      setLoading(false);
    }
  };

  const fetchStats = async (token: string) => {
    try {
      const res = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4 animate-spin">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"></div>
          </div>
          <p className="text-white text-lg font-semibold">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="text-center">
          <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-6 max-w-md">
            <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
            <p className="text-white mb-4">{error}</p>
            <p className="text-gray-300 text-sm">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-blue-700 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100 mt-2">Manage the application</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard"
                className="bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("userId");
                  localStorage.removeItem("username");
                  window.location.href = "/login";
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Total Users</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats?.users.total || 0}</h3>
                <p className="text-gray-400 text-xs mt-1">
                  {stats?.users.approved || 0} approved, {stats?.users.pending || 0} pending
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Team Members</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats?.teamMembers || 0}</h3>
                <p className="text-gray-400 text-xs mt-1">Active members</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 4.354c2.598 0 4.859 2.04 4.859 4.846a4.858 4.858 0 01-4.859 4.846M12 4.354c-2.598 0-4.859 2.04-4.859 4.846a4.858 4.858 0 004.859 4.846m0 7.5a2.86 2.86 0 01-2.857-2.857 2.86 2.86 0 112.857 2.857m0 0v2.857"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Clubs */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Clubs</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stats?.clubs || 0}</h3>
                <p className="text-gray-400 text-xs mt-1">Active clubs</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Controls Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Controls</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/access-requests"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-semibold transition flex items-center gap-3"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Access Requests
            </Link>

            <Link
              href="/admin/users"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-semibold transition flex items-center gap-3"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 4.354c2.598 0 4.859 2.04 4.859 4.846a4.858 4.858 0 01-4.859 4.846M12 4.354c-2.598 0-4.859 2.04-4.859 4.846a4.858 4.858 0 004.859 4.846m0 7.5a2.86 2.86 0 01-2.857-2.857 2.86 2.86 0 112.857 2.857m0 0v2.857"
                />
              </svg>
              Manage Users
            </Link>

            <Link
              href="/admin/clubs"
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-semibold transition flex items-center gap-3"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                />
              </svg>
              Club Management
            </Link>

            <Link
              href="/admin/attendance"
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-semibold transition flex items-center gap-3"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Attendance Reports
            </Link>

            <Link
              href="/admin/settings"
              className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg font-semibold transition flex items-center gap-3"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              System Settings
            </Link>

            <Link
              href="/admin/activity-logs"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg font-semibold transition flex items-center gap-3"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Activity Logs
            </Link>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-2">Welcome Admin</h3>
          <p className="text-gray-300">
            You have exclusive access to the admin dashboard. Use this area to manage users, view analytics, and configure system settings.
          </p>
        </div>
      </div>
    </div>
  );
}
