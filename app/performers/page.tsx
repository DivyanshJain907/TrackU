"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import CloudLoader from "@/app/components/CloudLoader";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

interface TeamMember {
  _id: string;
  name: string;
  enrollmentNumber: string;
  points: number;
  hours: number;
  createdBy?: { username: string; email: string };
  lastUpdatedBy?: { username: string; email: string };
}

interface AttendanceRecord {
  _id: string;
  meetingTitle: string;
  meetingDate: string;
  attendees: Array<{
    memberId: string;
    memberName: string;
    enrollmentNumber: string;
    status: "present" | "absent" | "late";
  }>;
}

interface MemberAttendanceStats {
  memberId: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

export default function Performers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [showAllPerformers, setShowAllPerformers] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<"hoursHigh" | "hoursLow" | "pointsHigh" | "pointsLow">("hoursHigh");
  const [attendanceStats, setAttendanceStats] = useState<Map<string, MemberAttendanceStats>>(new Map());
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
    fetchAttendance(token);
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

  const fetchAttendance = async (token: string) => {
    try {
      const res = await fetch("/api/attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch attendance");
      }

      const data: AttendanceRecord[] = await res.json();
      const statsMap = new Map<string, MemberAttendanceStats>();

      // Calculate attendance stats for each member
      data.forEach((record) => {
        record.attendees.forEach((attendee) => {
          const memberId = attendee.memberId;
          const existing = statsMap.get(memberId) || {
            memberId,
            present: 0,
            absent: 0,
            late: 0,
            total: 0,
            percentage: 0,
          };

          existing.total += 1;
          if (attendee.status === "present") {
            existing.present += 1;
          } else if (attendee.status === "absent") {
            existing.absent += 1;
          } else if (attendee.status === "late") {
            existing.late += 1;
          }

          existing.percentage = existing.total > 0 ? Math.round((existing.present / existing.total) * 100) : 0;
          statsMap.set(memberId, existing);
        });
      });

      setAttendanceStats(statsMap);
    } catch (err) {
      console.error("Failed to load attendance:", err);
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

  const handleEditProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const profileRes = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = profileRes.ok ? await profileRes.json() : null;
      const currentUsername = profileData?.username || username || "";
      const currentEmail = profileData?.email || "";
      const currentPhone = profileData?.phone || "";

      const newUsername = prompt("Enter your username", currentUsername);
      if (newUsername === null) return;

      const newEmail = prompt("Enter your email", currentEmail);
      if (newEmail === null) return;

      const newPhone = prompt("Enter your phone number (10 digits)", currentPhone);
      if (newPhone === null) return;

      const updateRes = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          phone: newPhone,
        }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        setError(updateData.error || "Failed to update profile");
        return;
      }

      const updatedUsername = updateData?.user?.username || newUsername.trim();
      setUsername(updatedUsername);
      localStorage.setItem("username", updatedUsername);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  // Sort members by hours and points
  const getSortedMembers = () => {
    const sorted = [...members];
    switch (sortOption) {
      case "hoursHigh":
        return sorted.sort((a, b) => b.hours - a.hours);
      case "hoursLow":
        return sorted.sort((a, b) => a.hours - b.hours);
      case "pointsHigh":
        return sorted.sort((a, b) => b.points - a.points);
      case "pointsLow":
        return sorted.sort((a, b) => a.points - b.points);
      default:
        return sorted.sort((a, b) => b.hours - a.hours);
    }
  };

  const sortedByHours = [...members].sort((a, b) => b.hours - a.hours);
  const topPerformers = sortedByHours.slice(0, 5);
  const bottomPerformers = sortedByHours.slice(-5).reverse();

  if (loading) {
    return (
      <div className={`${poppins.className} min-h-screen bg-[#eaf6f1] relative overflow-hidden flex items-center justify-center`}>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute -top-20 -left-16 h-80 w-80 rounded-full bg-[#c9ffe7] blur-3xl opacity-70" />
          <div className="absolute top-24 right-0 h-72 w-72 rounded-full bg-[#b9f4e0] blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-[#defdef] blur-3xl opacity-70" />
        </div>
        <div className="relative z-10 text-center">
          <CloudLoader size="50px" />
          <p className="mt-4 text-[#1f6f58] font-semibold">Loading performers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${poppins.className} min-h-screen bg-[#eaf6f1] text-[#1f2422] relative overflow-hidden`}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-16 -left-20 h-96 w-96 rounded-full bg-[#c9ffe7] blur-3xl opacity-70" />
        <div className="absolute top-28 right-0 h-80 w-80 rounded-full bg-[#b9f4e0] blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-[#e5fff4] blur-3xl opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10">       {/* Header */}
      <div className="bg-white/85 backdrop-blur-xl border-b border-emerald-100 sticky top-0 z-50 shadow-[0_8px_30px_rgba(16,65,53,0.08)]">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-8">
          <div className="flex justify-between items-start sm:items-center gap-3 sm:gap-6">
            <div className="space-y-1 sm:space-y-2 flex-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src="/image2.png"
                  alt="TrackU Logo"
                  className="w-12 sm:w-20 h-12 sm:h-20 rounded-xl sm:rounded-2xl shadow-lg"
                />
                <div>
                  <h1 className="text-xl sm:text-5xl font-bold bg-linear-to-r from-emerald-900 to-emerald-600 bg-clip-text text-transparent">
                    Performance
                  </h1>
                  <p className="text-emerald-700 text-xs sm:text-sm font-semibold hidden sm:block">
                    Top & Bottom Performers
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation - Mobile and Desktop */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Layout - Small Dashboard Button */}
              <div className="flex sm:hidden gap-2">
                <Link
                  href="/dashboard"
                  className="bg-white hover:bg-emerald-50 text-emerald-800 w-10 h-10 rounded-lg font-semibold transition duration-300 border border-emerald-200 hover:border-emerald-300 flex items-center justify-center gap-1 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex gap-4 items-center">
                <Link
                  href="/dashboard"
                  className="group relative bg-white hover:bg-emerald-50 text-emerald-900 px-6 py-3 rounded-2xl font-semibold transition duration-300 border border-emerald-200 hover:border-emerald-300 flex items-center gap-2 hover:shadow-xl hover:shadow-emerald-100 transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Dashboard
                </Link>
              </div>

              {/* User Profile Dropdown - Mobile and Desktop */}
              {username && (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-full hover:shadow-lg hover:shadow-emerald-300 transition transform hover:scale-110"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-emerald-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="px-4 py-3 border-b border-emerald-100">
                        <p className="text-emerald-900 font-semibold text-sm">{username}</p>
                        <p className="text-emerald-600 text-xs mt-1">Club Member</p>
                      </div>
                      <button
                        onClick={() => {
                          handleEditProfile();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition flex items-center gap-2 font-semibold text-sm border-b border-emerald-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition flex items-center gap-2 font-semibold text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-14">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 sm:px-6 py-4 rounded-2xl mb-8 font-semibold flex items-start gap-4 hover:border-red-300 transition animate-in fade-in slide-in-from-top-2 shadow-sm">
            <svg className="w-6 h-6 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-16a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
            <div>
              <p className="font-bold text-red-800 mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Top Performers */}
          <div>
            <div className="bg-linear-to-r from-emerald-700 to-emerald-600 text-white rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-4 sm:py-5 shadow-lg border-t-4 border-emerald-400">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Top 5 Performers</h2>
                  <p className="text-emerald-100 text-xs sm:text-sm">Highest Hours Contributed</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl rounded-b-2xl sm:rounded-b-3xl shadow-[0_16px_36px_rgba(16,65,53,0.08)] p-4 sm:p-6 border-2 border-emerald-100">
              {topPerformers.length === 0 ? (
                <p className="text-center text-emerald-600 py-8 font-semibold">No members found</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {topPerformers.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f7fff9] border-2 border-emerald-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 transition group"
                    >
                      <div className="shrink-0">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-lg shadow-lg ${
                            index === 0
                              ? "bg-linear-to-br from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "bg-linear-to-br from-gray-300 to-gray-500"
                              : index === 2
                              ? "bg-linear-to-br from-orange-400 to-orange-600"
                              : "bg-linear-to-br from-green-500 to-green-700"
                          }`}
                        >
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg text-emerald-900 group-hover:text-emerald-700 transition truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs text-emerald-500 truncate">
                          {member.enrollmentNumber}
                        </p>
                        {attendanceStats.has(member._id) && (
                          <div className="mt-1 flex gap-2 text-xs">
                            <span className="text-emerald-700 font-semibold">
                              ✓ {attendanceStats.get(member._id)?.present}
                            </span>
                            <span className="text-red-600 font-semibold">
                              ✗ {attendanceStats.get(member._id)?.absent}
                            </span>
                            <span className="text-amber-600 font-semibold">
                              ⏱ {attendanceStats.get(member._id)?.late}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl sm:text-3xl font-bold text-emerald-700">
                          {member.hours}
                        </p>
                        <p className="text-xs text-emerald-500 font-semibold">Hours</p>
                        <p className="text-xs text-emerald-700 font-bold mt-1">
                          ⭐ {member.points}
                        </p>
                        {attendanceStats.has(member._id) && (
                          <p className="text-xs font-bold text-emerald-700 mt-1">
                            📊 {attendanceStats.get(member._id)?.percentage}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Performers */}
          <div>
            <div className="bg-linear-to-r from-[#5b7168] to-[#415149] text-white rounded-t-2xl sm:rounded-t-3xl px-4 sm:px-6 py-4 sm:py-5 shadow-lg border-t-4 border-[#7e938b]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">Bottom 5 Performers</h2>
                  <p className="text-[#dfe7e3] text-xs sm:text-sm">Lowest Hours Contributed</p>
                </div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl rounded-b-2xl sm:rounded-b-3xl shadow-[0_16px_36px_rgba(16,65,53,0.08)] p-4 sm:p-6 border-2 border-[#dbe7e2]">
              {bottomPerformers.length === 0 ? (
                <p className="text-center text-[#4f615a] py-8 font-semibold">No members found</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {bottomPerformers.map((member, index) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f7fbf9] border-2 border-[#dbe7e2] hover:border-[#c9d9d2] hover:shadow-lg hover:shadow-[#dfeae5] transition group"
                    >
                      <div className="shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-[#7a8f86] to-[#576a62] flex items-center justify-center font-bold text-white text-sm sm:text-lg shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg text-[#22302b] group-hover:text-[#2f3f39] transition truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs text-[#7a8a84] truncate">
                          {member.enrollmentNumber}
                        </p>
                        {attendanceStats.has(member._id) && (
                          <div className="mt-1 flex gap-2 text-xs">
                            <span className="text-emerald-700 font-semibold">
                              ✓ {attendanceStats.get(member._id)?.present}
                            </span>
                            <span className="text-red-600 font-semibold">
                              ✗ {attendanceStats.get(member._id)?.absent}
                            </span>
                            <span className="text-amber-600 font-semibold">
                              ⏱ {attendanceStats.get(member._id)?.late}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl sm:text-3xl font-bold text-[#415149]">
                          {member.hours}
                        </p>
                        <p className="text-xs text-[#7a8a84] font-semibold">Hours</p>
                        <p className="text-xs text-[#415149] font-bold mt-1">
                          ⭐ {member.points}
                        </p>
                        {attendanceStats.has(member._id) && (
                          <p className="text-xs font-bold text-[#415149] mt-1">
                            📊 {attendanceStats.get(member._id)?.percentage}%
                          </p>
                        )}
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
              className="w-full bg-linear-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-emerald-100 transition duration-300 border border-emerald-700/20 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              View All {members.length} Performers
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900">All Performers</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAllPerformers(false)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Sorting Controls */}
              <div className="mb-6 p-4 bg-white/80 rounded-2xl border border-emerald-100 shadow-sm">
                <p className="text-sm font-semibold text-emerald-700 mb-3">Sort by:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSortOption("hoursHigh")}
                    className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                      sortOption === "hoursHigh"
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    Hours ↓
                  </button>
                  <button
                    onClick={() => setSortOption("hoursLow")}
                    className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                      sortOption === "hoursLow"
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    Hours ↑
                  </button>
                  <button
                    onClick={() => setSortOption("pointsHigh")}
                    className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                      sortOption === "pointsHigh"
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    Task ↓
                  </button>
                  <button
                    onClick={() => setSortOption("pointsLow")}
                    className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                      sortOption === "pointsLow"
                        ? "bg-emerald-700 text-white"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    Task ↑
                  </button>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_16px_36px_rgba(16,65,53,0.08)] p-6 border-2 border-emerald-100">
                {members.length === 0 ? (
                  <p className="text-center text-emerald-600 py-8 font-semibold">No members found</p>
                ) : (
                  <div className="space-y-3">
                    {getSortedMembers().map((member, index) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-[#f7fff9] border-2 border-emerald-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 transition group"
                        >
                          <div className="shrink-0">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg ${
                                index === 0
                                  ? "bg-linear-to-br from-yellow-400 to-yellow-600"
                                  : index === 1
                                  ? "bg-linear-to-br from-gray-300 to-gray-500"
                                  : index === 2
                                  ? "bg-linear-to-br from-orange-400 to-orange-600"
                                  : index < 10
                                  ? "bg-linear-to-br from-blue-500 to-blue-700"
                                  : "bg-linear-to-br from-purple-500 to-purple-700"
                              }`}
                            >
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-emerald-900 group-hover:text-emerald-700 transition truncate">
                              {member.name}
                            </h3>
                            <p className="text-xs text-emerald-500 truncate">
                              {member.enrollmentNumber}
                            </p>
                            {attendanceStats.has(member._id) && (
                              <div className="mt-2 flex gap-3 text-xs">
                                <span className="px-2 py-1 bg-emerald-100 border border-emerald-200 rounded text-emerald-700 font-semibold">
                                  ✓ {attendanceStats.get(member._id)?.present}
                                </span>
                                <span className="px-2 py-1 bg-red-100 border border-red-200 rounded text-red-700 font-semibold">
                                  ✗ {attendanceStats.get(member._id)?.absent}
                                </span>
                                <span className="px-2 py-1 bg-amber-100 border border-amber-200 rounded text-amber-700 font-semibold">
                                  ⏱ {attendanceStats.get(member._id)?.late}
                                </span>
                                <span className="px-2 py-1 bg-emerald-100 border border-emerald-200 rounded text-emerald-700 font-semibold">
                                  📊 {attendanceStats.get(member._id)?.percentage}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-3xl font-bold text-emerald-700">
                              {member.hours}
                            </p>
                            <p className="text-xs text-emerald-500 font-semibold">Hours</p>
                            <p className="text-xs text-emerald-700 font-bold mt-1">
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
        <div className="mt-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_16px_36px_rgba(16,65,53,0.08)] p-8 border-2 border-emerald-100 hover:border-emerald-200 transition">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900">Overall Statistics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-5 bg-[#f7fff9] rounded-2xl border-2 border-emerald-100 hover:border-emerald-200 transition hover:shadow-lg hover:shadow-emerald-100">
              <p className="text-sm text-emerald-600 mb-2 font-semibold">Total Members</p>
              <p className="text-4xl font-bold text-emerald-700">
                {members.length}
              </p>
            </div>
            <div className="text-center p-5 bg-[#f7fff9] rounded-2xl border-2 border-emerald-100 hover:border-emerald-200 transition hover:shadow-lg hover:shadow-emerald-100">
              <p className="text-sm text-emerald-600 mb-2 font-semibold">Avg Hours</p>
              <p className="text-4xl font-bold text-emerald-700">
                {members.length > 0
                  ? (
                      members.reduce((sum, m) => sum + m.hours, 0) /
                      members.length
                    ).toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="text-center p-5 bg-[#f7fff9] rounded-2xl border-2 border-emerald-100 hover:border-emerald-200 transition hover:shadow-lg hover:shadow-emerald-100">
              <p className="text-sm text-emerald-600 mb-2 font-semibold">Total Hours</p>
              <p className="text-4xl font-bold text-emerald-700">
                {members.reduce((sum, m) => sum + m.hours, 0)}
              </p>
            </div>
            <div className="text-center p-5 bg-[#f7fbf9] rounded-2xl border-2 border-[#dbe7e2] hover:border-[#c9d9d2] transition hover:shadow-lg hover:shadow-[#dfeae5]">
              <p className="text-sm text-[#4f615a] mb-2 font-semibold">Total Points</p>
              <p className="text-4xl font-bold text-[#415149]">
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
