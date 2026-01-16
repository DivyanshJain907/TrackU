"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Club {
  _id: string;
  name: string;
  description?: string;
  leader: { _id: string; username: string; email: string };
  members: string[];
  teamMembersCount: number;
  createdAt: string;
}

export default function AdminClubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", description: "" });
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }
    fetchClubs();
  }, [router]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/clubs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(`Failed to fetch clubs: ${errorData.error || "Unknown error"}`);
        return;
      }

      const data = await res.json();
      setClubs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`An error occurred: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    if (!confirm("Are you sure you want to delete this club? This will also delete all associated users and data.")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found");
        return;
      }

      console.log(`Deleting club with ID: ${clubId}`);
      const res = await fetch(`/api/admin/clubs/${clubId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Delete error:", errorData);
        alert(`Failed to delete club: ${errorData.error || "Unknown error"}`);
        return;
      }

      const data = await res.json();
      alert(`${data.message} (${data.deletedUsers} users removed)`);
      setClubs((prev) => prev.filter((club) => club._id !== clubId));
    } catch (err) {
      console.error("Delete exception:", err);
      alert(`An error occurred: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleEditClub = (club: Club) => {
    setEditingId(club._id);
    setEditData({ name: club.name, description: club.description || "" });
  };

  const handleSaveEdit = async (clubId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found");
        return;
      }

      const res = await fetch(`/api/admin/clubs/${clubId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(`Failed to update club: ${errorData.error || "Unknown error"}`);
        return;
      }

      setClubs((prev) =>
        prev.map((club) =>
          club._id === clubId
            ? { ...club, name: editData.name, description: editData.description }
            : club
        )
      );
      setEditingId(null);
      alert("Club updated successfully!");
    } catch (err) {
      alert(`An error occurred: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4 animate-spin">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"></div>
          </div>
          <p className="text-white text-lg">Loading clubs...</p>
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
            <h1 className="text-3xl font-bold text-white">Club Management</h1>
            <p className="text-purple-200">Total Clubs: {clubs.length}</p>
          </div>
          <Link
            href="/admin"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Search */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-4 mb-6">
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club._id}
              className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/40 transition"
            >
              {editingId === club._id ? (
                <>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white mb-2"
                    placeholder="Club name"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white mb-4"
                    placeholder="Club description"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(club._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">{club.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {club.description || "No description provided"}
                  </p>

                  <div className="space-y-2 mb-4 text-sm text-gray-300">
                    <p>
                      <span className="font-semibold">Leader:</span> {club.leader?.username || "Unknown"}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {club.leader?.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold">Members:</span>{" "}
                      <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold">
                        {club.teamMembersCount || 0} member{club.teamMembersCount !== 1 ? "s" : ""}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Created:</span>{" "}
                      {new Date(club.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClub(club)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No clubs found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
