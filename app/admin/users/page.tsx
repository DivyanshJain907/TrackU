"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CloudLoader from "@/app/components/CloudLoader";

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  isClubLeader: boolean;
  isApproved: boolean;
  club?: { _id: string; name: string };
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "approved" | "pending" | "leaders">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ username: "", email: "", phone: "" });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch users");
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    if (filterType === "approved") return matchesSearch && user.isApproved;
    if (filterType === "pending") return matchesSearch && !user.isApproved;
    if (filterType === "leaders") return matchesSearch && user.isClubLeader;

    return matchesSearch;
  });

  const handleApproveUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        alert("Failed to approve user");
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isApproved: true } : user
        )
      );
    } catch (err) {
      alert("An error occurred");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Failed to delete user");
        return;
      }

      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      alert("An error occurred");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingId(user._id);
    setEditData({ username: user.username, email: user.email, phone: user.phone || "" });
  };

  const handleSaveEdit = async (userId: string) => {
    // Validate username
    if (!editData.username || editData.username.trim().length === 0) {
      alert("Username cannot be empty");
      return;
    }
    // Validate phone - must be exactly 10 digits and first digit >= 6 (Indian format)
    if (editData.phone && editData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }
    if (editData.phone && parseInt(editData.phone[0]) < 6) {
      alert("Phone number must start with a digit >= 6 (valid Indian format)");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(`Failed to update user: ${errorData.error || "Unknown error"}`);
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, username: editData.username, email: editData.email, phone: editData.phone }
            : user
        )
      );
      setEditingId(null);
      alert("User updated successfully!");
    } catch (err) {
      alert(`An error occurred: ${err instanceof Error ? err.message : "Unknown error"}`);
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
          <p className="text-emerald-700 text-lg font-semibold mt-4">Loading users...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900">User Management</h1>
              <p className="text-emerald-700 text-sm sm:text-base mt-1 sm:mt-2">Total Users: {users.length}</p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 space-y-3 sm:space-y-0 sm:flex gap-3">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-400 transition"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 focus:outline-none focus:border-emerald-400 transition"
              >
                <option value="all">All Users</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="leaders">Club Leaders</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-emerald-600">
                <p>No users found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-emerald-50 transition shadow-sm"
                  >
                    {/* Header with badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-emerald-900">{user.username}</h3>
                        <p className="text-emerald-600 text-xs sm:text-sm mt-1">{user.email}</p>
                      </div>
                      <div className="ml-2 flex flex-col gap-1">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 text-center">
                          {user.isClubLeader ? "Leader" : "Member"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full text-center ${
                            user.isApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {user.isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 mb-4">
                      {user.phone && (
                        <div>
                          <p className="text-emerald-500 text-xs font-medium uppercase tracking-wide">Phone</p>
                          {editingId === user._id ? (
                            <input
                              type="tel"
                              value={editData.phone}
                              onChange={(e) => {
                                let digitsOnly = e.target.value.replace(/\D/g, '');
                                let limited = digitsOnly.slice(0, 10);
                                if (limited.length > 0 && parseInt(limited[0]) < 6) {
                                  limited = limited.slice(1);
                                }
                                setEditData({ ...editData, phone: limited });
                              }}
                              placeholder="9XXXXXXXXX"
                              maxLength={10}
                              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 text-sm focus:outline-none focus:border-emerald-400"
                            />
                          ) : (
                            <a href={`tel:${user.phone}`} className="text-emerald-700 hover:text-emerald-800 text-sm">
                              {user.phone}
                            </a>
                          )}
                        </div>
                      )}

                      {user.club?.name && (
                        <div>
                          <p className="text-emerald-500 text-xs font-medium uppercase tracking-wide">Club</p>
                          <p className="text-emerald-900 text-sm">{user.club.name}</p>
                        </div>
                      )}

                      {editingId === user._id && (
                        <>
                          <div>
                            <p className="text-emerald-500 text-xs font-medium uppercase tracking-wide">Username</p>
                            <input
                              type="text"
                              value={editData.username}
                              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 text-sm focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                          <div>
                            <p className="text-emerald-500 text-xs font-medium uppercase tracking-wide">Email</p>
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 text-sm focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {editingId === user._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(user._id)}
                            className="flex-1 px-3 py-2 bg-green-100 border border-green-200 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="w-full px-3 py-2 bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 text-emerald-700 text-sm font-medium rounded-lg transition-all"
                          >
                            Edit
                          </button>
                          {!user.isApproved && (
                            <button
                              onClick={() => handleApproveUser(user._id)}
                              className="w-full px-3 py-2 bg-green-100 border border-green-200 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-all"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="w-full px-3 py-2 bg-red-100 border border-red-200 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
