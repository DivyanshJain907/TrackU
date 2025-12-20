"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AttendanceRecord {
  _id: string;
  member: { _id: string; name: string };
  event?: { _id: string; name: string };
  date: string;
  status: "present" | "absent" | "excused";
  remarks?: string;
}

export default function AdminAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent" | "excused">("all");
  const [dateFilter, setDateFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }
    fetchAttendance();
  }, [router]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/attendance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch attendance records");
        return;
      }

      const data = await res.json();
      setRecords(data);
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    let matches = true;

    if (filterStatus !== "all" && record.status !== filterStatus) {
      matches = false;
    }

    if (dateFilter && !record.date.startsWith(dateFilter)) {
      matches = false;
    }

    return matches;
  });

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    excused: records.filter((r) => r.status === "excused").length,
  };

  const presentPercentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4 animate-spin">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"></div>
          </div>
          <p className="text-white text-lg">Loading attendance records...</p>
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
            <h1 className="text-3xl font-bold text-white">Attendance Reports</h1>
            <p className="text-purple-200">Total Records: {records.length}</p>
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
            <p className="text-gray-400 text-sm">Total Records</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-green-500/10 backdrop-blur border border-green-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Present</p>
            <p className="text-3xl font-bold text-green-400">{stats.present}</p>
          </div>
          <div className="bg-red-500/10 backdrop-blur border border-red-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Absent</p>
            <p className="text-3xl font-bold text-red-400">{stats.absent}</p>
          </div>
          <div className="bg-yellow-500/10 backdrop-blur border border-yellow-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Excused</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.excused}</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4 mb-6">
          <p className="text-gray-400 text-sm mb-2">Overall Attendance Rate</p>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${presentPercentage}%` }}
            ></div>
          </div>
          <p className="text-white font-semibold mt-2">{presentPercentage}%</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="excused">Excused</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Records Table */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-600/20 border-b border-purple-500/20">
                  <th className="px-6 py-3 text-left text-white font-semibold">Member</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Event</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record._id}
                    className="border-b border-purple-500/10 hover:bg-purple-600/10 transition"
                  >
                    <td className="px-6 py-4 text-white">{record.member?.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === "present"
                            ? "bg-green-500/20 text-green-400"
                            : record.status === "absent"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{record.event?.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-300">{record.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No attendance records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
