"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudLoader from "@/app/components/CloudLoader";

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
    } catch (_err) {
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
      <div className="min-h-screen flex items-center justify-center bg-[#f3fff9]">
        <div className="text-center">
          <CloudLoader />
          <p className="mt-4 text-lg text-[#1d2623]">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3fff9] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1d2623]">Attendance Reports</h1>
            <p className="text-[#5f6a66]">Total Records: {records.length}</p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg bg-[#49c89f] px-4 py-2 font-semibold text-white transition hover:bg-[#3fb18d]"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-[#d7e9e1] bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
            <p className="text-sm text-[#5f6a66]">Total Records</p>
            <p className="text-3xl font-bold text-[#1d2623]">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-emerald-700">Present</p>
            <p className="text-3xl font-bold text-emerald-700">{stats.present}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-red-700">Absent</p>
            <p className="text-3xl font-bold text-red-700">{stats.absent}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-amber-700">Excused</p>
            <p className="text-3xl font-bold text-amber-700">{stats.excused}</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="mb-6 rounded-xl border border-[#d7e9e1] bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
          <p className="mb-2 text-sm text-[#5f6a66]">Overall Attendance Rate</p>
          <div className="h-4 w-full rounded-full bg-[#e6f4ee]">
            <div
              className="h-4 rounded-full bg-linear-to-r from-[#49c89f] to-[#2f9f7c] transition-all"
              style={{ width: `${presentPercentage}%` }}
            ></div>
          </div>
          <p className="mt-2 font-semibold text-[#1d2623]">{presentPercentage}%</p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-[#d7e9e1] bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 rounded-lg border border-[#cfe5dc] bg-[#f8fffb] px-4 py-2 text-[#1d2623] focus:border-[#49c89f] focus:outline-none"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-lg border border-[#cfe5dc] bg-[#f8fffb] px-4 py-2 text-[#1d2623] focus:border-[#49c89f] focus:outline-none"
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
        <div className="overflow-hidden rounded-xl border border-[#d7e9e1] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d7e9e1] bg-[#f1fff8]">
                  <th className="px-6 py-3 text-left font-semibold text-[#1d2623]">Member</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#1d2623]">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#1d2623]">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#1d2623]">Event</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#1d2623]">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record._id}
                    className="border-b border-[#edf6f2] transition hover:bg-[#f8fffb]"
                  >
                    <td className="px-6 py-4 text-[#1d2623]">{record.member?.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-[#5f6a66]">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === "present"
                            ? "bg-emerald-100 text-emerald-700"
                            : record.status === "absent"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#5f6a66]">{record.event?.name || "-"}</td>
                    <td className="px-6 py-4 text-[#5f6a66]">{record.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="py-8 text-center text-[#7b8782]">
              No attendance records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
