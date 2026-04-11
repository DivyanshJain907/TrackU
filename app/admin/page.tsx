"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStats } from "@/lib/useStats";
import CloudLoader from "@/app/components/CloudLoader";

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
  const [verifyLoading, setVerifyLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const { data: stats, loading: statsLoading, refetch: refetchStats, isFromCache } = useStats(token);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const tokenValue = localStorage.getItem("token");
      if (!tokenValue) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenValue}`,
        },
      });

      if (!res.ok) {
        setError("Unauthorized: Admin access only");
        setVerifyLoading(false);
        setTimeout(() => router.push("/dashboard"), 2000);
        return;
      }

      setIsAdmin(true);
      setToken(tokenValue);
      setVerifyLoading(false);
    } catch (err) {
      setError("Error verifying admin access");
      setVerifyLoading(false);
    }
  };

  if (verifyLoading) {
    return (
      <div className="min-h-screen bg-[#f4fff9] relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute -top-16 -left-20 h-96 w-96 rounded-full bg-[#c9ffe7] blur-3xl opacity-70" />
          <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-[#b9f4e0] blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-[#e5fff4] blur-3xl opacity-80" />
        </div>
        <div className="relative z-10 text-center">
          <div className="mb-4">
            <CloudLoader />
          </div>
          <p className="text-[#1f6f58] text-lg font-semibold">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4fff9] relative overflow-hidden flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute -top-16 -left-20 h-96 w-96 rounded-full bg-[#c9ffe7] blur-3xl opacity-70" />
          <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-[#b9f4e0] blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-[#e5fff4] blur-3xl opacity-80" />
        </div>
        <div className="relative z-10 text-center">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 max-w-md shadow-sm">
            <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-red-500 text-sm">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f4fff9] relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-16 -left-20 h-96 w-96 rounded-full bg-[#c9ffe7] blur-3xl opacity-70" />
        <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-[#b9f4e0] blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-[#e5fff4] blur-3xl opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-white/85 backdrop-blur-xl border-b border-emerald-100 text-emerald-900 shadow-[0_8px_30px_rgba(16,65,53,0.08)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-linear-to-r from-emerald-900 to-emerald-600 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-emerald-700 text-sm sm:text-base mt-1 sm:mt-2">Manage the application</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("username");
                localStorage.removeItem("isAdmin");
                localStorage.removeItem("isClubLeader");
                localStorage.removeItem("isApproved");
                window.location.href = "/";
              }}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white p-2 sm:p-3 rounded-lg transition hover:shadow-lg hover:shadow-red-200 flex items-center justify-center shrink-0"
              title="Logout"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Cache Status Indicator */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {statsLoading && (
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Loading stats...</span>
              </div>
            )}
            {!statsLoading && isFromCache && (
              <div className="flex items-center gap-2 text-amber-600">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Showing cached data</span>
              </div>
            )}
            {!statsLoading && !isFromCache && stats && (
              <div className="flex items-center gap-2 text-emerald-700">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                <span>Fresh data</span>
              </div>
            )}
            {statsLoading === false && !stats && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Failed to load stats</span>
              </div>
            )}
          </div>
          <button
            onClick={refetchStats}
            disabled={statsLoading}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {statsLoading ? "Refreshing..." : "Refresh Stats"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Total Users */}
          <div className="bg-white/90 backdrop-blur-xl rounded-lg sm:rounded-2xl border border-emerald-100 p-4 hover:border-emerald-200 transition text-center shadow-sm">
            <div className="bg-emerald-100 p-2.5 rounded-lg w-fit mx-auto mb-3">
              <svg
                className="w-6 h-6 text-emerald-700"
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
            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-900">{stats?.users.total || 0}</h3>
            <p className="text-emerald-700 text-xs sm:text-sm font-medium mt-2">Total Users</p>
            <p className="text-emerald-500 text-xs mt-2">
              {stats?.users.approved || 0} approved, {stats?.users.pending || 0} pending
            </p>
          </div>

          {/* Team Members */}
          <div className="bg-white/90 backdrop-blur-xl rounded-lg sm:rounded-2xl border border-emerald-100 p-4 hover:border-emerald-200 transition text-center shadow-sm">
            <div className="bg-emerald-100 p-2.5 rounded-lg w-fit mx-auto mb-3">
              <svg
                className="w-6 h-6 text-emerald-700"
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
            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-900">{stats?.teamMembers || 0}</h3>
            <p className="text-emerald-700 text-xs sm:text-sm font-medium mt-2">Team Members</p>
            <p className="text-emerald-500 text-xs mt-2">Active members</p>
          </div>

          {/* Total Clubs */}
          <div className="bg-white/90 backdrop-blur-xl rounded-lg sm:rounded-2xl border border-emerald-100 p-4 hover:border-emerald-200 transition text-center shadow-sm">
            <div className="bg-emerald-100 p-2.5 rounded-lg w-fit mx-auto mb-3">
              <svg
                className="w-6 h-6 text-emerald-700"
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
            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-900">{stats?.clubs || 0}</h3>
            <p className="text-emerald-700 text-xs sm:text-sm font-medium mt-2">Clubs</p>
            <p className="text-emerald-500 text-xs mt-2">Active clubs</p>
          </div>
        </div>

        {/* Admin Controls Section */}
        <div className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-xl rounded-lg sm:rounded-2xl border border-emerald-100 p-4 sm:p-6 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-900 mb-4 sm:mb-6">Admin Controls</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href="/admin/access-requests"
              className="bg-[#f7fff9] hover:bg-emerald-50 border border-emerald-100 text-emerald-900 p-4 sm:p-5 rounded-xl font-semibold transition backdrop-blur-xl flex flex-col items-center sm:items-start gap-3 text-sm sm:text-base hover:shadow-lg hover:shadow-emerald-100"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6 shrink-0"
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
              <div className="text-center sm:text-left">
                <div className="font-semibold">Access Requests</div>
                <div className="text-xs text-emerald-600">Manage pending requests</div>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="bg-[#f7fff9] hover:bg-emerald-50 border border-emerald-100 text-emerald-900 p-4 sm:p-5 rounded-xl font-semibold transition backdrop-blur-xl flex flex-col items-center sm:items-start gap-3 text-sm sm:text-base hover:shadow-lg hover:shadow-emerald-100"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6 shrink-0"
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
              <div className="text-center sm:text-left">
                <div className="font-semibold">Manage Users</div>
                <div className="text-xs text-emerald-600">Edit & approve users</div>
              </div>
            </Link>

            <Link
              href="/admin/clubs"
              className="bg-[#f7fff9] hover:bg-emerald-50 border border-emerald-100 text-emerald-900 p-4 sm:p-5 rounded-xl font-semibold transition backdrop-blur-xl flex flex-col items-center sm:items-start gap-3 text-sm sm:text-base hover:shadow-lg hover:shadow-emerald-100"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6 shrink-0"
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
              <div className="text-center sm:text-left">
                <div className="font-semibold">Club Management</div>
                <div className="text-xs text-emerald-600">View & manage clubs</div>
              </div>
            </Link>

            <Link
              href="/admin/activity"
              className="bg-[#f7fff9] hover:bg-emerald-50 border border-emerald-100 text-emerald-900 p-4 sm:p-5 rounded-xl font-semibold transition backdrop-blur-xl flex flex-col items-center sm:items-start gap-3 text-sm sm:text-base hover:shadow-lg hover:shadow-emerald-100"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6 shrink-0"
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
              <div className="text-center sm:text-left">
                <div className="font-semibold">Activity Logs</div>
                <div className="text-xs text-emerald-600">View system activity</div>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="bg-[#f7fff9] hover:bg-emerald-50 border border-emerald-100 text-emerald-900 p-4 sm:p-5 rounded-xl font-semibold transition backdrop-blur-xl flex flex-col items-center sm:items-start gap-3 text-sm sm:text-base hover:shadow-lg hover:shadow-emerald-100"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6 shrink-0"
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
              <div className="text-center sm:text-left">
                <div className="font-semibold">System Settings</div>
                <div className="text-xs text-emerald-600">Configure settings</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity Widget */}
        <RecentActivityWidget token={token} />

        {/* Welcome Message */}
        <div className="mt-6 sm:mt-8 bg-white/90 border border-emerald-100 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-2">Welcome Admin</h3>
          <p className="text-emerald-700 text-sm sm:text-base">
            You have exclusive access to the admin dashboard. Use this area to manage users, view analytics, and configure system settings.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

function RecentActivityWidget({ token }: { token: string | null }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [token]);

  const fetchActivities = async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setActivities(data.slice(0, 5)); // Show only last 5
        setLoading(false);
      } else if (res.status === 401 || res.status === 403) {
        setError("Authorization failed");
        setLoading(false);
      } else {
        setError("Failed to load activities");
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setError("Unable to fetch activities");
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return "✨";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      case "approve":
        return "✅";
      default:
        return "📝";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "border-l-emerald-500";
      case "update":
        return "border-l-sky-500";
      case "delete":
        return "border-l-red-500";
      case "approve":
        return "border-l-violet-500";
      default:
        return "border-l-slate-400";
    }
  };

  return (
    <div className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-900">Recent Activity</h2>
        <Link href="/admin/activity" className="text-emerald-700 hover:text-emerald-900 text-xs sm:text-sm font-semibold transition">
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-emerald-600">Loading activities...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className={`p-4 bg-[#f7fff9] border border-emerald-100 border-l-4 ${getActionColor(
                activity.action
              )} rounded-lg hover:bg-emerald-50 transition`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{getActionIcon(activity.action)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-900 text-sm font-semibold wrap">
                    {activity.description}
                  </p>
                  <p className="text-emerald-600 text-xs mt-1">
                    By {activity.performedBy?.username || "Unknown"} • {" "}
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-emerald-600 text-center py-8">No activities yet</p>
      )}
    </div>
  );
}
