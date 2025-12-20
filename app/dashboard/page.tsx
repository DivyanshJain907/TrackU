"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TeamMember {
  _id: string;
  name: string;
  enrollmentNumber: string;
  position?: string;
  points: number;
  hours: number;
  remarks?: Array<{ text: string; date: string }>;
  createdBy?: { username: string; email: string };
  lastUpdatedBy?: { username: string; email: string };
}

interface Club {
  id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [username, setUsername] = useState("");
  const [club, setClub] = useState<Club | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSecondDeleteConfirm, setShowSecondDeleteConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    enrollmentNumber: "",
    position: "",
  });

  const [editData, setEditData] = useState({
    name: "",
    enrollmentNumber: "",
    position: "",
  });

  const [updateData, setUpdateData] = useState({
    points: "" as number | "",
    hours: "" as number | "",
    remark: "",
    date: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const isAdmin = localStorage.getItem("isAdmin");
    const isApproved = localStorage.getItem("isApproved");

    if (!token) {
      router.replace("/login");
      return;
    }

    // Redirect admin users to admin dashboard
    if (isAdmin === "true") {
      router.replace("/admin");
      return;
    }

    // Redirect unapproved users to pending page
    if (isApproved !== "true") {
      router.replace("/pending");
      return;
    }

    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Fetch club info and members
    fetchClubInfo(token);
    fetchMembers(token);

    // Auto-logout on browser/tab close
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("isAdmin");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name));
      setFilteredMembers(sorted);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members
        .filter(
          (member) =>
            member.name.toLowerCase().includes(query) ||
            member.enrollmentNumber.toLowerCase().includes(query)
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  const fetchMembers = async (token: string) => {
    try {
      const res = await fetch("/api/team-members", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch members");
      }

      const data = await res.json();
      const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setMembers(sortedData);
      setFilteredMembers(sortedData);
    } catch (err) {
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const fetchClubInfo = async (token: string) => {
    try {
      const res = await fetch("/api/club", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch club info");
      }

      const data = await res.json();
      setClub(data);
    } catch (err) {
      console.error("Failed to load club info:", err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/team-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add member");
        return;
      }

      const newMember = data;
      // Ensure the new member has an _id before adding to state
      if (newMember && newMember._id) {
        const updatedMembers = [...members, newMember].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setMembers(updatedMembers);
        setSuccessMessage("Member added successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
      setFormData({ name: "", enrollmentNumber: "", position: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding member:", err);
      setError("Failed to add member. Please check your input and try again.");
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    // Build update object - add new values to existing values
    const updatePayload: any = {};
    if (updateData.points !== "") {
      updatePayload.points = selectedMember.points + Number(updateData.points);
    }
    if (updateData.hours !== "") {
      updatePayload.hours = selectedMember.hours + Number(updateData.hours);
    }
    if (updateData.remark) {
      updatePayload.remark = updateData.remark;
    }
    if (updateData.date) {
      updatePayload.date = updateData.date;
    }

    // Don't send update if nothing was changed
    if (Object.keys(updatePayload).length === 0) {
      setError("Please enter at least one value to update");
      return;
    }

    setUpdateLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/team-members/${selectedMember._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) throw new Error("Failed to update member");

      const updatedMember = await res.json();
      const updatedMembers = members
        .map((m) => (m._id === updatedMember._id ? updatedMember : m))
        .sort((a, b) => a.name.localeCompare(b.name));
      setMembers(updatedMembers);
      setShowUpdateForm(false);
      setSelectedMember(null);
      setUpdateData({ points: "", hours: "", remark: "", date: "" });
      setSuccessMessage("Member updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to update member");
      setSuccessMessage("");
    } finally {
      setUpdateLoading(false);
    }
  };

  const openUpdateForm = (member: TeamMember) => {
    setSelectedMember(member);
    const today = new Date().toISOString().split("T")[0];
    setUpdateData({
      points: "",
      hours: "",
      remark: "",
      date: today,
    });
    setShowUpdateForm(true);
  };

  const openEditForm = (member: TeamMember) => {
    setSelectedMember(member);
    setEditData({
      name: member.name || "",
      enrollmentNumber: member.enrollmentNumber || "",
      position: member.position || "",
    });
    setShowEditForm(true);
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/team-members/${selectedMember._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error("Failed to edit member");

      const updatedMember = await res.json();
      const updatedMembers = members
        .map((m) => (m._id === updatedMember._id ? updatedMember : m))
        .sort((a, b) => a.name.localeCompare(b.name));
      setMembers(updatedMembers);
      setShowEditForm(false);
      setSelectedMember(null);
      setEditData({ name: "", enrollmentNumber: "", position: "" });
      setError("");
      setSuccessMessage("Member information updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to edit member details");
      setSuccessMessage("");
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/team-members/${selectedMember._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete member");

      setMembers(members.filter((m) => m._id !== selectedMember._id));
      setShowDeleteConfirm(false);
      setShowSecondDeleteConfirm(false);
      setSelectedMember(null);
      setError("");
      setSuccessMessage("Member deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete member");
      setSuccessMessage("");
      setShowDeleteConfirm(false);
      setShowSecondDeleteConfirm(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800 font-semibold">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                TrackU Dashboard
              </h1>
              <p className="text-amber-100 mt-1 text-sm">Manage Your Team</p>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-2">
              <Link
                href="/performers"
                className="bg-white text-amber-700 px-4 py-2 rounded-lg font-semibold hover:bg-amber-50 transition text-sm"
              >
                View Performers
              </Link>
              <Link
                href="/attendance"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm shadow-md"
              >
                Attendance
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
              className="md:hidden text-white hover:text-amber-100 focus:outline-none"
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

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 pb-3 space-y-2">
              <Link
                href="/performers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-white text-amber-700 px-4 py-2.5 rounded-lg transition font-semibold text-center"
              >
                View Performers
              </Link>
              <Link
                href="/attendance"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg transition font-semibold text-center"
              >
                Attendance
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Club Header */}
        {club && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-amber-900 mb-3">
              {club.name}
            </h1>
            <p className="text-gray-700 text-lg sm:text-xl">
              {club.description}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6 font-semibold">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6 font-semibold">
            {successMessage}
          </div>
        )}

        {/* Search Bar and Add Member Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or enrollment number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-500 shadow-sm bg-white"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Add Member Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl transition font-bold shadow-md whitespace-nowrap"
          >
            {showAddForm ? "✕ Cancel" : "+ Add Team Member"}
          </button>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 text-sm text-gray-700 font-medium">
            Found{" "}
            <span className="font-bold text-amber-700">
              {filteredMembers.length}
            </span>{" "}
            member(s) matching "{searchQuery}"
          </div>
        )}

        {/* Add Member Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Add New Team Member
            </h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="px-4 py-3 bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Enrollment Number"
                  value={formData.enrollmentNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enrollmentNumber: e.target.value,
                    })
                  }
                  required
                  className="px-4 py-3 bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-500"
                />
              </div>
              <input
                type="text"
                placeholder="Position (e.g., Captain, Vice-Captain, Member)"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full px-4 py-3 bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl transition font-bold shadow-md"
              >
                Add Member
              </button>
            </form>
          </div>
        )}

        {/* Team Members List */}
        {members.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-amber-200">
            <p className="text-gray-700 text-lg font-semibold">
              No team members added yet. Click "Add Team Member" to get started!
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-amber-200">
            <p className="text-gray-700 text-lg font-semibold">
              No members found matching your search.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-amber-600 hover:text-amber-700 font-semibold"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-2xl shadow-xl p-5 hover:shadow-2xl transition border-2 border-amber-200"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {member.enrollmentNumber}
                  </p>
                  {member.position && (
                    <p className="text-base font-bold text-amber-700 mt-2 bg-amber-50 px-3 py-1 rounded-lg inline-block">
                      📍 {member.position}
                    </p>
                  )}
                  {member.createdBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Added by:{" "}
                      <span className="font-semibold text-amber-600">
                        {member.createdBy.username}
                      </span>
                    </p>
                  )}
                  {member.lastUpdatedBy && (
                    <p className="text-xs text-gray-500">
                      Last updated by:{" "}
                      <span className="font-semibold text-green-600">
                        {member.lastUpdatedBy.username}
                      </span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t-2 border-b-2 border-amber-100">
                  <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                    <p className="text-2xl font-bold text-amber-700">
                      {member.points}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Points</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <p className="text-2xl font-bold text-green-700">
                      {member.hours}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Hours</p>
                  </div>
                </div>

                {/* Remarks Section */}
                {(member.remarks ?? []).length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Remarks ({(member.remarks ?? []).length}):
                    </p>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 max-h-32 overflow-y-auto border border-amber-200">
                      {(member.remarks ?? []).map((remark, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-700 mb-2 pb-2 border-b border-amber-200 last:border-b-0"
                        >
                          <p className="font-medium text-blue-700">
                            {remark.text}
                          </p>
                          <p className="text-gray-500">
                            {new Date(remark.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(member)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-xl transition text-sm font-bold shadow-sm"
                  >
                    Edit Info
                  </button>
                  <button
                    onClick={() => openUpdateForm(member)}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-3 py-2 rounded-xl transition text-sm font-bold shadow-sm"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setShowDeleteConfirm(true);
                    }}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-2 rounded-xl transition text-sm font-bold shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Member Modal */}
        {showEditForm && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full border-2 border-blue-200 my-4">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-3 sm:mb-4">
                Edit Member Information
              </h2>

              <form
                onSubmit={handleEditMember}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    required
                    placeholder="Enter full name"
                    aria-label="Full Name"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-50 border-2 border-blue-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    value={editData.enrollmentNumber}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        enrollmentNumber: e.target.value,
                      })
                    }
                    required
                    placeholder="Enter enrollment number"
                    aria-label="Enrollment Number"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-50 border-2 border-blue-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={editData.position}
                    onChange={(e) =>
                      setEditData({ ...editData, position: e.target.value })
                    }
                    placeholder="Enter position (e.g., Captain, Vice-Captain)"
                    aria-label="Position"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-50 border-2 border-blue-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 sm:py-2 rounded-xl transition font-bold shadow-md text-sm sm:text-base"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 sm:py-2 rounded-xl transition font-bold shadow-md text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Update Member Modal */}
        {showUpdateForm && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full border-2 border-amber-200 my-4 max-h-[95vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-amber-700 mb-3 sm:mb-4">
                Update {selectedMember.name}
              </h2>

              <form
                onSubmit={handleUpdateMember}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Add Points (Current: {selectedMember.points})
                  </label>
                  <input
                    type="number"
                    value={updateData.points}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        points:
                          e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    placeholder="Enter points to add"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Add Hours of Work (Current: {selectedMember.hours})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={updateData.hours}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        hours:
                          e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    placeholder="Enter hours to add"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Record Date
                  </label>
                  <input
                    type="date"
                    value={updateData.date}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, date: e.target.value })
                    }
                    max={new Date().toISOString().split("T")[0]}
                    aria-label="Record date for this entry"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Select the date for this record (defaults to today)
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Add Remark
                  </label>
                  <textarea
                    value={updateData.remark}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, remark: e.target.value })
                    }
                    placeholder="Add a note or remark..."
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-500"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-2.5 sm:py-2 rounded-xl transition font-bold shadow-md text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    {updateLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateForm(false);
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 sm:py-2 rounded-xl transition font-bold shadow-md text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* First Delete Confirmation Modal */}
        {showDeleteConfirm && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 border-red-300">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">
                Delete Member?
              </h2>
              <p className="text-gray-700 mb-2 text-center font-medium">
                Are you sure you want to delete{" "}
                <span className="font-bold text-red-700">
                  {selectedMember.name}
                </span>
                ?
              </p>
              <p className="text-gray-600 text-sm mb-6 text-center">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setShowSecondDeleteConfirm(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2.5 rounded-xl transition font-bold shadow-md"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl transition font-bold shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Second Delete Confirmation Modal */}
        {showSecondDeleteConfirm && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-4 border-red-500">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-4 text-center">
                Final Confirmation
              </h2>
              <p className="text-gray-700 mb-2 text-center font-semibold">
                This is your last chance!
              </p>
              <p className="text-gray-600 text-sm mb-6 text-center">
                Deleting{" "}
                <span className="font-bold text-red-700">
                  {selectedMember.name}
                </span>{" "}
                will permanently remove all their data, including points, hours,
                and remarks.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteMember}
                  className="flex-1 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-4 py-2.5 rounded-xl transition font-bold shadow-md"
                >
                  Permanently Delete
                </button>
                <button
                  onClick={() => {
                    setShowSecondDeleteConfirm(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl transition font-bold shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
