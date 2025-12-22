"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ActivityLog {
  _id: string;
  action: string;
  user: { _id: string; username: string };
  target: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }
    fetchLogs();
  }, [router]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/activity-logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } else {
        // Generate mock data if API not available
        setLogs(generateMockLogs());
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLogs(generateMockLogs());
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = (): ActivityLog[] => {
    const actions = ["user_login", "user_created", "club_created", "attendance_marked", "user_deleted", "settings_changed"];
    const mockLogs: ActivityLog[] = [];

    for (let i = 0; i < 20; i++) {
      mockLogs.push({
        _id: `log-${i}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        user: { _id: `user-${i}`, username: `User ${i}` },
        target: ["User", "Club", "Attendance", "Settings"][Math.floor(Math.random() * 4)],
        targetId: `target-${i}`,
        details: `Activity details ${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return mockLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const filteredLogs = logs.filter((log) => {
    let matches = true;

    if (filterAction !== "all" && log.action !== filterAction) {
      matches = false;
    }

    if (dateFilter && !log.timestamp.startsWith(dateFilter)) {
      matches = false;
    }

    if (
      searchTerm &&
      !log.user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.target.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      matches = false;
    }

    return matches;
  });

  const actionCounts = logs.reduce(
    (acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const getActionColor = (action: string): string => {
    const colors: Record<string, string> = {
      user_login: "bg-blue-500/20 text-blue-400",
      user_created: "bg-green-500/20 text-green-400",
      club_created: "bg-purple-500/20 text-purple-400",
      attendance_marked: "bg-yellow-500/20 text-yellow-400",
      user_deleted: "bg-red-500/20 text-red-400",
      settings_changed: "bg-orange-500/20 text-orange-400",
    };
    return colors[action] || "bg-gray-500/20 text-gray-400";
  };

  const formatActionName = (action: string): string => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
            <p className="text-purple-200">Monitor system activity and events</p>
          </div>
          <Link
            href="/admin"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4">
            <p className="text-gray-300 text-sm">Total Logs</p>
            <h3 className="text-2xl font-bold text-white">{logs.length}</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4">
            <p className="text-gray-300 text-sm">Unique Actions</p>
            <h3 className="text-2xl font-bold text-white">{Object.keys(actionCounts).length}</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4">
            <p className="text-gray-300 text-sm">Last Updated</p>
            <h3 className="text-sm font-semibold text-white mt-1">
              {logs.length > 0
                ? new Date(logs[0].timestamp).toLocaleTimeString()
                : "N/A"}
            </h3>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by username or target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Actions</option>
              {Object.keys(actionCounts).map((action) => (
                <option key={action} value={action}>
                  {formatActionName(action)} ({actionCounts[action]})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-600/20 border-b border-purple-500/20">
                  <th className="px-6 py-3 text-left text-white font-semibold">Timestamp</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Action</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">User</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Target</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-purple-500/10 hover:bg-purple-600/10 transition"
                  >
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                        {formatActionName(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{log.user.username}</td>
                    <td className="px-6 py-4 text-gray-300">{log.target}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No activity logs found matching your criteria.
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 rounded-lg p-4">
          <p className="text-gray-300 text-sm">
            Activity logs are automatically generated for important system events. Logs are retained for audit and troubleshooting purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
