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
        return "bg-green-500/20 text-green-400";
      case "update":
        return "bg-blue-500/20 text-blue-400";
      case "delete":
        return "bg-red-500/20 text-red-400";
      case "approve":
        return "bg-purple-500/20 text-purple-400";
      case "login":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
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
        <div className="relative z-10 text-center">
          <CloudLoader />
          <p className="text-white text-lg font-semibold mt-4">Loading activity logs...</p>
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

      {/* Content */}
      <div className="relative z-10">
        <div className="min-h-screen px-3 sm:px-6 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push("/admin")}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-lg font-medium transition-all hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Activity Logs</h1>
              <p className="text-gray-400 text-sm sm:text-base mt-1 sm:mt-2">Total Activities: {logs.length}</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition text-center">
                <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Activities</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-2">{logs.length}</p>
              </div>
              <div className="bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-green-500/30 transition text-center">
                <p className="text-green-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Created</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-400 mt-2">
                  {logs.filter((l) => l.action === "create").length}
                </p>
              </div>
              <div className="bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-blue-500/30 transition text-center">
                <p className="text-blue-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Updated</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-400 mt-2">
                  {logs.filter((l) => l.action === "update").length}
                </p>
              </div>
              <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-red-500/30 transition text-center">
                <p className="text-red-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Deleted</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-400 mt-2">
                  {logs.filter((l) => l.action === "delete").length}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-3 sm:space-y-0 sm:flex gap-3">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition"
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
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Activity Timeline */}
            <div className="space-y-3 sm:space-y-4">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log._id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition"
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
                          <span className="text-gray-400 text-xs sm:text-sm">
                            by {log.performedBy?.username || "Unknown"}
                          </span>
                        </div>
                        <p className="text-white font-semibold text-sm sm:text-base mb-2">
                          {log.description}
                        </p>
                        <p className="text-gray-400 text-xs">
                          📅 {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="mt-3 cursor-pointer">
                            <summary className="text-blue-400 hover:text-blue-300 text-xs font-semibold">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-gray-300 overflow-auto max-h-40 border border-white/10">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
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
