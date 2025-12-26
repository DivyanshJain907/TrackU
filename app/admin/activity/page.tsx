"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      router.replace("/dashboard");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4 animate-spin">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"></div>
          </div>
          <p className="text-white text-lg">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
            <p className="text-purple-200">Total Activities: {logs.length}</p>
          </div>
          <Link
            href="/admin"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Activities</p>
            <p className="text-3xl font-bold text-white">{logs.length}</p>
          </div>
          <div className="bg-green-500/10 backdrop-blur border border-green-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Created</p>
            <p className="text-3xl font-bold text-green-400">
              {logs.filter((l) => l.action === "create").length}
            </p>
          </div>
          <div className="bg-blue-500/10 backdrop-blur border border-blue-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Updated</p>
            <p className="text-3xl font-bold text-blue-400">
              {logs.filter((l) => l.action === "update").length}
            </p>
          </div>
          <div className="bg-red-500/10 backdrop-blur border border-red-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Deleted</p>
            <p className="text-3xl font-bold text-red-400">
              {logs.filter((l) => l.action === "delete").length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="End Date"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Activity Timeline */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg overflow-hidden">
          <div className="divide-y divide-purple-500/20">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 hover:bg-purple-600/10 transition border-l-4 border-purple-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action.toUpperCase()}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {log.performedBy?.username || "Unknown"}
                        </span>
                      </div>
                      <p className="text-white font-semibold mb-1">
                        {log.description}
                      </p>
                      <p className="text-gray-400 text-xs">
                        📅{" "}
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <details className="mt-2 cursor-pointer">
                          <summary className="text-purple-300 text-xs font-semibold hover:text-purple-200">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-slate-900 rounded text-xs text-gray-300 overflow-auto max-h-40">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No activity logs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
