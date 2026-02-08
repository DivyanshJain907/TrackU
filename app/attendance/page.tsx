"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudLoader from "@/app/components/CloudLoader";

interface Attendee {
  memberId: string;
  memberName: string;
  enrollmentNumber: string;
  status: "present" | "absent" | "late";
  checkInTime?: Date;
  remarks?: string;
}

interface AttendanceRecord {
  _id: string;
  meetingTitle: string;
  meetingDate: string;
  meetingType: string;
  duration: number;
  location?: string;
  description?: string;
  attendees: Attendee[];
  createdBy?: { username: string; email: string };
  lastUpdatedBy?: { username: string; email: string };
  createdAt: string;
}

interface TeamMember {
  _id: string;
  name: string;
  enrollmentNumber: string;
}

export default function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [username, setUsername] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    meetingTitle: "",
    meetingDate: "",
    meetingType: "regular",
    duration: 60,
    location: "",
    description: "",
  });

  const [selectedAttendees, setSelectedAttendees] = useState<
    Map<string, Attendee>
  >(new Map());

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

    fetchAttendance(token);
    fetchTeamMembers(token);
  }, [router]);

  const fetchAttendance = async (token: string) => {
    try {
      const res = await fetch("/api/attendance", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        throw new Error("Failed to fetch attendance records");
      }

      const data = await res.json();
      setAttendanceRecords(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (token: string) => {
    try {
      const res = await fetch("/api/team-members", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a: TeamMember, b: TeamMember) =>
          a.name.localeCompare(b.name)
        );
        setTeamMembers(sortedData);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isClubLeader");
    localStorage.removeItem("isApproved");
    router.replace("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Mark all team members as absent by default if not selected
      const attendees: Attendee[] = teamMembers.map((member) => {
        const existing = selectedAttendees.get(member._id);
        if (existing) {
          return existing;
        }
        // Default to absent if not marked
        return {
          memberId: member._id,
          memberName: member.name,
          enrollmentNumber: member.enrollmentNumber,
          status: "absent" as const,
          checkInTime: new Date(),
        };
      });

      // Validate date format
      const dateObj = new Date(formData.meetingDate);
      if (isNaN(dateObj.getTime())) {
        setError("Invalid meeting date. Please select a valid date.");
        setLoading(false);
        setTimeout(() => setError(""), 3000);
        return;
      }

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          meetingDate: dateObj.toISOString(), // Ensure proper ISO format
          attendees,
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);
      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(
          data.details || data.error || "Failed to create attendance record"
        );
      }

      setSuccessMessage("Attendance recorded successfully!");
      setShowAddForm(false);
      setFormData({
        meetingTitle: "",
        meetingDate: "",
        meetingType: "regular",
        duration: 60,
        location: "",
        description: "",
      });
      setSelectedAttendees(new Map());
      fetchAttendance(token);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error submitting attendance:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberAttendance = (
    member: TeamMember,
    status: "present" | "absent" | "late"
  ) => {
    setSelectedAttendees((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(member._id);

      if (existing && existing.status === status) {
        newMap.delete(member._id);
      } else {
        newMap.set(member._id, {
          memberId: member._id,
          memberName: member.name,
          enrollmentNumber: member.enrollmentNumber,
          status,
          checkInTime: new Date(),
        });
      }

      return newMap;
    });
  };

  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete attendance record");
      }

      setSuccessMessage("Attendance record deleted successfully!");
      fetchAttendance(token);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    const dateStr = new Date(record.meetingDate).toISOString().slice(0, 16);
    setFormData({
      meetingTitle: record.meetingTitle,
      meetingDate: dateStr,
      meetingType: record.meetingType,
      duration: record.duration,
      location: record.location || "",
      description: record.description || "",
    });

    const attendeesMap = new Map<string, Attendee>();
    record.attendees.forEach((attendee) => {
      attendeesMap.set(attendee.memberId, attendee);
    });
    setSelectedAttendees(attendeesMap);
    setShowEditForm(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Mark all team members as absent by default if not selected
      const attendees: Attendee[] = teamMembers.map((member) => {
        const existing = selectedAttendees.get(member._id);
        if (existing) {
          return existing;
        }
        // Default to absent if not marked
        return {
          memberId: member._id,
          memberName: member.name,
          enrollmentNumber: member.enrollmentNumber,
          status: "absent" as const,
          checkInTime: new Date(),
        };
      });

      const dateObj = new Date(formData.meetingDate);
      if (isNaN(dateObj.getTime())) {
        setError("Invalid meeting date. Please select a valid date.");
        setLoading(false);
        setTimeout(() => setError(""), 3000);
        return;
      }

      const res = await fetch(`/api/attendance/${selectedRecord._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          meetingDate: dateObj.toISOString(),
          attendees,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.details || data.error || "Failed to update attendance record"
        );
      }

      setSuccessMessage("Attendance record updated successfully!");
      setShowEditForm(false);
      setSelectedRecord(null);
      setFormData({
        meetingTitle: "",
        meetingDate: "",
        meetingType: "regular",
        duration: 60,
        location: "",
        description: "",
      });
      setSelectedAttendees(new Map());
      fetchAttendance(token);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating attendance:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-indigo-950 via-black to-purple-950"></div>
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
        <div className="relative z-10 text-center">
          <CloudLoader size="50px" />
          <p className="mt-4 text-purple-300 font-semibold">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-950 via-black to-purple-950"></div>
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

      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
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
                  <h1 className="text-xl sm:text-5xl font-bold bg-linear-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Attendance
                  </h1>
                  <p className="text-purple-200 text-xs sm:text-sm font-semibold hidden sm:block">
                    Track Meeting Attendance
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation - Mobile and Desktop */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Layout */}
              <div className="flex sm:hidden gap-2">
                <Link
                  href="/dashboard"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur text-white w-10 h-10 rounded-lg font-semibold transition duration-300 border border-white/30 hover:border-white/60 flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-white/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <Link
                  href="/performers"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur text-white w-10 h-10 rounded-lg font-semibold transition duration-300 border border-white/30 hover:border-white/60 flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-white/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex gap-4 items-center">
                <Link
                  href="/dashboard"
                  className="group relative bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-3 rounded-2xl font-semibold transition duration-300 border border-white/30 hover:border-white/60 flex items-center gap-2 hover:shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/performers"
                  className="group relative bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-3 rounded-2xl font-semibold transition duration-300 border border-white/30 hover:border-white/60 flex items-center gap-2 hover:shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Performers
                </Link>
              </div>

              {/* User Profile Dropdown - Mobile and Desktop */}
              {username && (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-purple-400 to-blue-400 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-110"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-purple-500/30 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="px-4 py-3 border-b border-purple-500/20">
                        <p className="text-white font-semibold text-sm">{username}</p>
                        <p className="text-purple-300 text-xs mt-1">Club Member</p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-700/20 transition flex items-center gap-2 font-semibold text-sm"
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
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
            Meeting Attendance
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl hover:shadow-lg font-semibold whitespace-nowrap transition-all transform hover:-translate-y-1 border border-indigo-500/50"
          >
            Record New Meeting
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-600/20 border-2 border-green-500/50 text-green-300 px-6 py-4 rounded-2xl mb-8 font-semibold flex items-start gap-4 backdrop-blur-sm hover:border-green-500/80 transition animate-in fade-in slide-in-from-top-2">
            <svg className="w-6 h-6 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-green-200 mb-1">Success</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-600/20 border-2 border-red-500/50 text-red-300 px-6 py-4 rounded-2xl mb-8 font-semibold flex items-start gap-4 backdrop-blur-sm hover:border-red-500/80 transition animate-in fade-in slide-in-from-top-2">
            <svg className="w-6 h-6 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-16a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
            <div>
              <p className="font-bold text-red-200 mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Attendance Records Table */}
        <div className="bg-linear-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-linear-to-r from-purple-700/50 to-blue-700/50 border-b border-purple-500/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-200 uppercase tracking-wider">
                    Meeting Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-200 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-200 uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-200 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-purple-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      <p className="text-lg font-semibold mb-2">No attendance records found</p>
                      <p className="text-sm text-slate-500">Create your first meeting record to get started!</p>
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-purple-700/20 transition-colors border-b border-slate-700/50 last:border-b-0">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-300">
                          {record.meetingTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          {new Date(record.meetingDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-700/50 text-blue-200 border border-blue-500/50">
                          {record.meetingType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          <span className="text-green-400 font-semibold">
                            {
                              record.attendees.filter(
                                (a) => a.status === "present" || a.status === "late"
                              ).length
                            }
                          </span>
                          {" / "}
                          <span className="text-slate-400">
                            {record.attendees.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          {record.duration}
                          <span className="text-slate-500"> min</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-700/30 px-3 py-1 rounded-lg transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-700/30 px-3 py-1 rounded-lg transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-700/30 px-3 py-1 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-3">
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-lg font-semibold mb-2">No attendance records found</p>
                <p className="text-sm text-slate-500">Create your first meeting record to get started!</p>
              </div>
            ) : (
              attendanceRecords.map((record) => (
                <div
                  key={record._id}
                  className="bg-slate-700/50 border border-purple-500/30 rounded-xl p-4 hover:bg-purple-700/20 transition-colors space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-blue-300 flex-1 wrap">
                      {record.meetingTitle}
                    </h3>
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-700/50 text-blue-200 border border-blue-500/50 whitespace-nowrap">
                      {record.meetingType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                    <div>
                      <span className="text-slate-500">Date:</span> {new Date(record.meetingDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-slate-500">Duration:</span> {record.duration} min
                    </div>
                  </div>
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-500">Attendees:</span>{" "}
                    <span className="text-green-400 font-semibold">
                      {
                        record.attendees.filter(
                          (a) => a.status === "present" || a.status === "late"
                        ).length
                      }
                    </span>
                    {" / "}
                    <span className="text-slate-400">
                      {record.attendees.length}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2 justify-end">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-700/30 px-3 py-1 text-sm rounded-lg transition-all"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-700/30 px-3 py-1 text-sm rounded-lg transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-700/30 px-3 py-1 text-sm rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Meeting Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-500/30">
              <h2 className="text-3xl font-bold mb-6 bg-linear-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                Record Meeting Attendance
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="meeting-title"
                      className="block text-sm font-semibold text-purple-200 mb-2"
                    >
                      Meeting Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="meeting-title"
                      type="text"
                      value={formData.meetingTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                      placeholder="Enter meeting title"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="meeting-date"
                      className="block text-sm font-semibold text-purple-200 mb-2"
                    >
                      Meeting Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="meeting-date"
                      type="datetime-local"
                      value={formData.meetingDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="meeting-type"
                      className="block text-sm font-semibold text-purple-200 mb-2"
                    >
                      Meeting Type
                    </label>
                    <select
                      id="meeting-type"
                      value={formData.meetingType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 transition-all"
                    >
                      <option value="regular">Regular</option>
                      <option value="special">Special</option>
                      <option value="emergency">Emergency</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-semibold text-purple-200 mb-2"
                    >
                      Duration (minutes)
                    </label>
                    <input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                      min="1"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="location"
                    className="block text-sm font-semibold text-purple-200 mb-2"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                    placeholder="Enter location"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-purple-200 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                    rows={3}
                    placeholder="Enter meeting description"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-purple-200 mb-3">
                    Mark Attendance
                  </label>
                  <div className="border border-purple-500/30 bg-slate-700/30 rounded-2xl p-4 max-h-60 overflow-y-auto">
                    {teamMembers.map((member) => {
                      const attendee = selectedAttendees.get(member._id);
                      return (
                        <div
                          key={member._id}
                          className="flex items-center justify-between py-3 px-3 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/30 rounded-lg transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-slate-100">
                              {member.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {member.enrollmentNumber}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "present")
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                attendee?.status === "present"
                                  ? "bg-green-600/80 text-white shadow-lg shadow-green-500/30"
                                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "late")
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                attendee?.status === "late"
                                  ? "bg-amber-600/80 text-white shadow-lg shadow-amber-500/30"
                                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "absent")
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                attendee?.status === "absent"
                                  ? "bg-red-600/80 text-white shadow-lg shadow-red-500/30"
                                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/50 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Save Attendance"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedAttendees(new Map());
                    }}
                    disabled={loading}
                    className="flex-1 bg-slate-700/50 border border-slate-600 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-bold transition-all disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Meeting Form Modal */}
        {showEditForm && selectedRecord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-500/30">
              <h2 className="text-3xl font-bold mb-6 bg-linear-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                Edit Meeting Attendance
              </h2>
              <form onSubmit={handleUpdateSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="edit-meeting-title"
                      className="block text-sm font-semibold text-purple-200 mb-2"
                    >
                      Meeting Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="edit-meeting-title"
                      type="text"
                      value={formData.meetingTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-meeting-date"
                      className="block text-sm font-semibold text-purple-200 mb-2"
                    >
                      Meeting Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="edit-meeting-date"
                      type="datetime-local"
                      value={formData.meetingDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="edit-meeting-type"
                      className="block text-sm font-semibold text-purple-200 mb-2"
                    >
                      Meeting Type
                    </label>
                    <select
                      id="edit-meeting-type"
                      value={formData.meetingType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 transition-all"
                    >
                      <option value="regular">Regular</option>
                      <option value="special">Special</option>
                      <option value="emergency">Emergency</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="edit-duration"
                      className="block text-sm font-semibold text-purple-200 mb-2"
                    >
                      Duration (minutes)
                    </label>
                    <input
                      id="edit-duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                      min="1"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-location"
                    className="block text-sm font-semibold text-purple-200 mb-2"
                  >
                    Location
                  </label>
                  <input
                    id="edit-location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                    placeholder="Enter location"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-description"
                    className="block text-sm font-semibold text-purple-200 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-700/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-100 placeholder-slate-400 transition-all"
                    rows={3}
                    placeholder="Enter meeting description"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-purple-200 mb-3">
                    Mark Attendance
                  </label>
                  <div className="border border-purple-500/30 bg-slate-700/30 rounded-2xl p-4 max-h-60 overflow-y-auto">
                    {teamMembers.map((member) => {
                      const attendee = selectedAttendees.get(member._id);
                      return (
                        <div
                          key={member._id}
                          className="flex items-center justify-between py-3 px-3 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/30 rounded-lg transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-slate-100">
                              {member.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {member.enrollmentNumber}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "present")
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                attendee?.status === "present"
                                  ? "bg-green-600/80 text-white shadow-lg shadow-green-500/30"
                                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "late")
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                attendee?.status === "late"
                                  ? "bg-amber-600/80 text-white shadow-lg shadow-amber-500/30"
                                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "absent")
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                attendee?.status === "absent"
                                  ? "bg-red-600/80 text-white shadow-lg shadow-red-500/30"
                                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/50 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed"
                  >
                    {loading ? "Updating..." : "Update Attendance"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedRecord(null);
                      setSelectedAttendees(new Map());
                      setFormData({
                        meetingTitle: "",
                        meetingDate: "",
                        meetingType: "regular",
                        duration: 60,
                        location: "",
                        description: "",
                      });
                    }}
                    disabled={loading}
                    className="flex-1 bg-slate-700/50 border border-slate-600 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-bold transition-all disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showViewModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-500/30">
              <h2 className="text-3xl font-bold mb-6 bg-linear-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                {selectedRecord.meetingTitle}
              </h2>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-700/40 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Date</p>
                  <p className="font-semibold text-slate-100 mt-1">
                    {new Date(selectedRecord.meetingDate).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-700/40 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Type</p>
                  <p className="font-semibold text-slate-100 mt-1 capitalize">
                    {selectedRecord.meetingType}
                  </p>
                </div>
                <div className="bg-slate-700/40 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Duration</p>
                  <p className="font-semibold text-slate-100 mt-1">
                    {selectedRecord.duration}
                    <span className="text-slate-400 ml-1">minutes</span>
                  </p>
                </div>
                <div className="bg-slate-700/40 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Location</p>
                  <p className="font-semibold text-slate-100 mt-1">
                    {selectedRecord.location || "N/A"}
                  </p>
                </div>
              </div>

              {selectedRecord.description && (
                <div className="mb-6 bg-slate-700/40 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Description</p>
                  <p className="font-medium text-slate-100">
                    {selectedRecord.description}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4 text-purple-200">
                  Attendance Details
                </h3>
                <div className="border border-purple-500/30 bg-slate-700/30 rounded-2xl overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-linear-to-r from-purple-700/50 to-blue-700/50 border-b border-purple-500/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-purple-200 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-purple-200 uppercase tracking-wider">
                          Enrollment
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-purple-200 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {selectedRecord.attendees.map((attendee, index) => (
                        <tr key={index} className="hover:bg-purple-700/20 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-100">
                            {attendee.memberName}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-300">
                            {attendee.enrollmentNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-block ${
                                attendee.status === "present"
                                  ? "bg-green-600/50 text-green-200 border border-green-500/50"
                                  : attendee.status === "late"
                                  ? "bg-amber-600/50 text-amber-200 border border-amber-500/50"
                                  : "bg-red-600/50 text-red-200 border border-red-500/50"
                              }`}
                            >
                              {attendee.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
