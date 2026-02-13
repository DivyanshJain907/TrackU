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
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
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
        <div className="relative z-10 text-center">
          <CloudLoader />
          <p className="text-white text-lg font-semibold mt-4">Loading users...</p>
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
              className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-linear-to-r from-purple-600/40 to-blue-600/40 border border-purple-500/50 rounded-lg hover:from-purple-600/60 hover:to-blue-600/60 hover:border-purple-500/70 transition-all duration-200 font-semibold shadow-lg hover:shadow-purple-500/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
              <p className="text-gray-400 text-sm sm:text-base mt-1 sm:mt-2">Total Users: {users.length}</p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 space-y-3 sm:space-y-0 sm:flex gap-3">
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition"
              >
                <option value="all">All Users</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="leaders">Club Leaders</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No users found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition"
                  >
                    {/* Header with badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white">{user.username}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">{user.email}</p>
                      </div>
                      <div className="ml-2 flex flex-col gap-1">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 text-center">
                          {user.isClubLeader ? "Leader" : "Member"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full text-center ${
                            user.isApproved
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
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
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Phone</p>
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
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                            />
                          ) : (
                            <a href={`tel:${user.phone}`} className="text-blue-400 hover:text-blue-300 text-sm">
                              {user.phone}
                            </a>
                          )}
                        </div>
                      )}

                      {user.club?.name && (
                        <div>
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Club</p>
                          <p className="text-white text-sm">{user.club.name}</p>
                        </div>
                      )}

                      {editingId === user._id && (
                        <>
                          <div>
                            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Username</p>
                            <input
                              type="text"
                              value={editData.username}
                              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                            />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Email</p>
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
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
                            className="flex-1 px-3 py-2 bg-green-600/20 border border-green-500 hover:bg-green-600/40 text-green-400 text-sm font-medium rounded-lg transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 px-3 py-2 bg-gray-600/20 border border-gray-500 hover:bg-gray-600/40 text-gray-300 text-sm font-medium rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="w-full px-3 py-2 bg-blue-600/20 border border-blue-500 hover:bg-blue-600/40 text-blue-400 text-sm font-medium rounded-lg transition-all"
                          >
                            Edit
                          </button>
                          {!user.isApproved && (
                            <button
                              onClick={() => handleApproveUser(user._id)}
                              className="w-full px-3 py-2 bg-green-600/20 border border-green-500 hover:bg-green-600/40 text-green-400 text-sm font-medium rounded-lg transition-all"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="w-full px-3 py-2 bg-red-600/20 border border-red-500 hover:bg-red-600/40 text-red-400 text-sm font-medium rounded-lg transition-all"
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
