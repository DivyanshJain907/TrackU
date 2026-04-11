"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CloudLoader from "@/app/components/CloudLoader";

interface ActivityLog {
  _id: string;
  action: string;
  description: string;
  performedBy: { _id: string; username: string };
  timestamp: string;
  details?: Record<string, any>;
}

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchActivityLogs();
  }, [router]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch activity logs");
        return;
      }

      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    let matches = true;

    if (filterAction !== "all" && log.action !== filterAction) {
      matches = false;
    }

    if (startDate && new Date(log.timestamp) < new Date(startDate)) {
      matches = false;
    }

    if (endDate && new Date(log.timestamp) > new Date(endDate)) {
      matches = false;
    }

    return matches;
  });

  const actions = Array.from(new Set(logs.map((log) => log.action)));

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-700";
      case "update":
        return "bg-sky-100 text-sky-700";
      case "delete":
        return "bg-red-100 text-red-700";
      case "approve":
        return "bg-violet-100 text-violet-700";
      case "login":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4fff9] relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute -top-16 -left-20 h-96 w-96 rounded-full bg-[#c9ffe7] blur-3xl opacity-70" />
          <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-[#b9f4e0] blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-[#e5fff4] blur-3xl opacity-80" />
        </div>
        <div className="relative z-10 text-center">
          <CloudLoader />
          <p className="text-emerald-700 text-lg font-semibold mt-4">Loading activity logs...</p>
        </div>
      </div>
    );
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
        <div className="min-h-screen px-3 sm:px-6 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push("/admin")}
              className="mb-6 flex items-center gap-2 px-4 py-2 text-emerald-900 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 font-semibold shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900">Activity Logs</h1>
              <p className="text-emerald-700 text-sm sm:text-base mt-1 sm:mt-2">Total Activities: {logs.length}</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-emerald-50 transition text-center shadow-sm">
                <p className="text-emerald-600 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Activities</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-2">{logs.length}</p>
              </div>
              <div className="bg-green-50 backdrop-blur-xl border border-green-200 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-green-100 transition text-center">
                <p className="text-green-700 text-xs sm:text-sm font-medium uppercase tracking-wide">Created</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700 mt-2">
                  {logs.filter((l) => l.action === "create").length}
                </p>
              </div>
              <div className="bg-sky-50 backdrop-blur-xl border border-sky-200 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-sky-100 transition text-center">
                <p className="text-sky-700 text-xs sm:text-sm font-medium uppercase tracking-wide">Updated</p>
                <p className="text-2xl sm:text-3xl font-bold text-sky-700 mt-2">
                  {logs.filter((l) => l.action === "update").length}
                </p>
              </div>
              <div className="bg-red-50 backdrop-blur-xl border border-red-200 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-red-100 transition text-center">
                <p className="text-red-700 text-xs sm:text-sm font-medium uppercase tracking-wide">Deleted</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-2">
                  {logs.filter((l) => l.action === "delete").length}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-3 sm:space-y-0 sm:flex gap-3">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 focus:outline-none focus:border-emerald-400 transition"
              >
                <option value="all">All Actions</option>
                {Array.from(new Set(logs.map((log) => log.action))).map((action) => (
                  <option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 focus:outline-none focus:border-emerald-400 transition"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 focus:outline-none focus:border-emerald-400 transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Activity Timeline */}
            <div className="space-y-3 sm:space-y-4">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log._id}
                    className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-emerald-50 transition shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action.toUpperCase()}
                          </span>
                          <span className="text-emerald-600 text-xs sm:text-sm">
                            by {log.performedBy?.username || "Unknown"}
                          </span>
                        </div>
                        <p className="text-emerald-900 font-semibold text-sm sm:text-base mb-2">
                          {log.description}
                        </p>
                        <p className="text-emerald-600 text-xs">
                          📅 {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="mt-3 cursor-pointer">
                            <summary className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-emerald-50 rounded text-xs text-emerald-700 overflow-auto max-h-40 border border-emerald-100">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-emerald-600">
                  No activity logs found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
