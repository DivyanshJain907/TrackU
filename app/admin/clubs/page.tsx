"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CloudLoader from "@/app/components/CloudLoader";

interface Club {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
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
  const [editData, setEditData] = useState({ name: "", description: "", imageUrl: "" });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
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
    setEditData({ name: club.name, description: club.description || "", imageUrl: club.imageUrl || "" });
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
            ? { ...club, name: editData.name, description: editData.description, imageUrl: editData.imageUrl }
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
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-black to-purple-950"></div>
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
          <p className="text-white text-lg font-semibold mt-4">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-black to-purple-950"></div>
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
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-lg font-medium transition-all hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Club Management</h1>
              <p className="text-gray-400 text-sm sm:text-base mt-1 sm:mt-2">Total Clubs: {clubs.length}</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Clubs Grid */}
            {filteredClubs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No clubs found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredClubs.map((club) => (
                  <div
                    key={club._id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition"
                  >
                    {editingId === club._id ? (
                      <div className="space-y-3 mb-4">
                        <div>
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Club Name</p>
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                            placeholder="Club name"
                          />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Description</p>
                          <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 resize-none"
                            placeholder="Club description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Banner Image URL</p>
                          <input
                            type="url"
                            value={editData.imageUrl}
                            onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                            placeholder="https://example.com/image.jpg"
                          />
                          {editData.imageUrl && (
                            <p className="text-gray-400 text-xs mt-2">Preview: Image will be used as dashboard background</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{club.name}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2">
                          {club.description || "No description provided"}
                        </p>

                        <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                          <div>
                            <p className="text-gray-400 font-medium">Leader</p>
                            <p className="text-white">{club.leader?.username || "Unknown"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Email</p>
                            <a href={`mailto:${club.leader?.email}`} className="text-blue-400 hover:text-blue-300">
                              {club.leader?.email || "N/A"}
                            </a>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Members</p>
                            <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold mt-1">
                              {club.teamMembersCount || 0} member{club.teamMembersCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium">Created</p>
                            <p className="text-white">{new Date(club.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {editingId === club._id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(club._id)}
                            className="w-full px-3 py-2 bg-green-600/20 border border-green-500 hover:bg-green-600/40 text-green-400 text-sm font-medium rounded-lg transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="w-full px-3 py-2 bg-gray-600/20 border border-gray-500 hover:bg-gray-600/40 text-gray-300 text-sm font-medium rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClub(club)}
                            className="w-full px-3 py-2 bg-blue-600/20 border border-blue-500 hover:bg-blue-600/40 text-blue-400 text-sm font-medium rounded-lg transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClub(club._id)}
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
