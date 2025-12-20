"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      router.replace("/dashboard");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4 animate-spin">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"></div>
          </div>
          <p className="text-white text-lg">Loading users...</p>
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
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-purple-200">Total Users: {users.length}</p>
          </div>
          <Link
            href="/admin"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Users</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="leaders">Club Leaders</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-600/20 border-b border-purple-500/20">
                  <th className="px-6 py-3 text-left text-white font-semibold">Username</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Type</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Club</th>
                  <th className="px-6 py-3 text-left text-white font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-purple-500/10 hover:bg-purple-600/10 transition"
                  >
                    <td className="px-6 py-4 text-white">{user.username}</td>
                    <td className="px-6 py-4 text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 text-gray-300">{user.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                        {user.isClubLeader ? "Leader" : "Member"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isApproved
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {user.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{user.club?.name || "-"}</td>
                    <td className="px-6 py-4 flex gap-2">
                      {!user.isApproved && (
                        <button
                          onClick={() => handleApproveUser(user._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No users found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
