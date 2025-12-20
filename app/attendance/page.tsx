"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    router.replace("/login");
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Attendance Tracking
              </h1>
              <p className="text-amber-100 mt-1 text-sm">
                Manage Meeting Attendance
              </p>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className="bg-white text-amber-700 px-4 py-2 rounded-lg font-semibold hover:bg-amber-50 transition text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/performers"
                className="bg-white text-amber-700 px-4 py-2 rounded-lg font-semibold hover:bg-amber-50 transition text-sm"
              >
                Performers
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition text-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-amber-100 focus:outline-none self-end"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 pb-3 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-white text-amber-700 px-4 py-2.5 rounded-lg transition font-semibold text-center"
              >
                Dashboard
              </Link>
              <Link
                href="/performers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-white text-amber-700 px-4 py-2.5 rounded-lg transition font-semibold text-center"
              >
                Performers
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition font-semibold"
              >
                Logout
              </button>
            </div>
          )}

          {username && (
            <div className="flex items-center space-x-2 text-amber-100 mt-3">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold">
                Logged in as <span className="text-white">{username}</span>
              </span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Meeting Attendance
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium whitespace-nowrap"
          >
            Record New Meeting
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Attendance Records Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meeting Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-800"
                  >
                    No attendance records found. Create your first meeting
                    record!
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.meetingTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(record.meetingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {record.meetingType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {
                          record.attendees.filter(
                            (a) => a.status === "present" || a.status === "late"
                          ).length
                        }{" "}
                        / {record.attendees.length}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.duration} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record._id)}
                        className="text-red-600 hover:text-red-900"
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

        {/* Add Meeting Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Record Meeting Attendance
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="meeting-title"
                      className="block text-sm font-medium text-gray-900 mb-2"
                    >
                      Meeting Title *
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="meeting-date"
                      className="block text-sm font-medium text-gray-900 mb-2"
                    >
                      Meeting Date *
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="meeting-type"
                      className="block text-sm font-medium text-gray-900 mb-2"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
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
                      className="block text-sm font-medium text-gray-900 mb-2"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      min="1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-900 mb-2"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Mark Attendance
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {teamMembers.map((member) => {
                      const attendee = selectedAttendees.get(member._id);
                      return (
                        <div
                          key={member._id}
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-800 hover:bg-gray-300">
                              {member.enrollmentNumber}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "present")
                              }
                              className={`px-3 py-1 rounded text-sm ${
                                attendee?.status === "present"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "late")
                              }
                              className={`px-3 py-1 rounded text-sm ${
                                attendee?.status === "late"
                                  ? "bg-yellow-600 text-white"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "absent")
                              }
                              className={`px-3 py-1 rounded text-sm ${
                                attendee?.status === "absent"
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-200 text-gray-700"
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
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium disabled:cursor-not-allowed"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Edit Meeting Attendance
              </h2>
              <form onSubmit={handleUpdateSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="edit-meeting-title"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Meeting Title *
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-meeting-date"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Meeting Date *
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="edit-meeting-type"
                      className="block text-sm font-semibold text-gray-900 mb-2"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
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
                      className="block text-sm font-semibold text-gray-900 mb-2"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      min="1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-location"
                    className="block text-sm font-semibold text-gray-900 mb-2"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="edit-description"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mark Attendance
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                    {teamMembers.map((member) => {
                      const attendee = selectedAttendees.get(member._id);
                      return (
                        <div
                          key={member._id}
                          className="flex items-center justify-between py-2 border-b last:border-b-0 bg-white px-3 rounded mb-2"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-700">
                              {member.enrollmentNumber}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "present")
                              }
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                attendee?.status === "present"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "late")
                              }
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                attendee?.status === "late"
                                  ? "bg-yellow-600 text-white"
                                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleMemberAttendance(member, "absent")
                              }
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                attendee?.status === "absent"
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium disabled:cursor-not-allowed"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {selectedRecord.meetingTitle}
              </h2>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Date:</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedRecord.meetingDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Type:</p>
                  <p className="font-medium capitalize text-gray-900">
                    {selectedRecord.meetingType}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Duration:
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedRecord.duration} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Location:
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedRecord.location || "N/A"}
                  </p>
                </div>
              </div>

              {selectedRecord.description && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Description:
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedRecord.description}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  Attendance Details
                </h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">
                          Enrollment
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedRecord.attendees.map((attendee, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {attendee.memberName}
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {attendee.enrollmentNumber}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                attendee.status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : attendee.status === "late"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
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
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
