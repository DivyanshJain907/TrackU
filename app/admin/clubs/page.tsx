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
      <div className="min-h-screen bg-[#f4fff9] relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute -top-16 -left-20 h-96 w-96 rounded-full bg-[#c9ffe7] blur-3xl opacity-70" />
          <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-[#b9f4e0] blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-[#e5fff4] blur-3xl opacity-80" />
        </div>
        <div className="relative z-10 text-center">
          <CloudLoader />
          <p className="text-emerald-700 text-lg font-semibold mt-4">Loading clubs...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900">Club Management</h1>
              <p className="text-emerald-700 text-sm sm:text-base mt-1 sm:mt-2">Total Clubs: {clubs.length}</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-400 transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Clubs Grid */}
            {filteredClubs.length === 0 ? (
              <div className="text-center py-12 text-emerald-600">
                <p>No clubs found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredClubs.map((club) => (
                  <div
                    key={club._id}
                    className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-emerald-50 transition shadow-sm"
                  >
                    {editingId === club._id ? (
                      <div className="space-y-3 mb-4">
                        <div>
                          <p className="text-emerald-500 text-xs font-medium uppercase tracking-wide mb-2">Club Name</p>
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 text-sm focus:outline-none focus:border-emerald-400"
                            placeholder="Club name"
                          />
                        </div>
                        <div>
                          <p className="text-emerald-500 text-xs font-medium uppercase tracking-wide mb-2">Description</p>
                          <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 text-sm focus:outline-none focus:border-emerald-400 resize-none"
                            placeholder="Club description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <p className="text-emerald-500 text-xs font-medium uppercase tracking-wide mb-2">Banner Image URL</p>
                          <input
                            type="url"
                            value={editData.imageUrl}
                            onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 text-sm focus:outline-none focus:border-emerald-400"
                            placeholder="https://example.com/image.jpg"
                          />
                          {editData.imageUrl && (
                            <p className="text-emerald-500 text-xs mt-2">Preview: Image will be used as dashboard background</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-2">{club.name}</h3>
                        <p className="text-emerald-600 text-xs sm:text-sm mb-4 line-clamp-2">
                          {club.description || "No description provided"}
                        </p>

                        <div className="space-y-2 text-xs sm:text-sm text-emerald-700">
                          <div>
                            <p className="text-emerald-500 font-medium">Leader</p>
                            <p className="text-emerald-900">{club.leader?.username || "Unknown"}</p>
                          </div>
                          <div>
                            <p className="text-emerald-500 font-medium">Email</p>
                            <a href={`mailto:${club.leader?.email}`} className="text-emerald-700 hover:text-emerald-800">
                              {club.leader?.email || "N/A"}
                            </a>
                          </div>
                          <div>
                            <p className="text-emerald-500 font-medium">Members</p>
                            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mt-1">
                              {club.teamMembersCount || 0} member{club.teamMembersCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div>
                            <p className="text-emerald-500 font-medium">Created</p>
                            <p className="text-emerald-900">{new Date(club.createdAt).toLocaleDateString()}</p>
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
                            className="w-full px-3 py-2 bg-green-100 border border-green-200 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClub(club)}
                            className="w-full px-3 py-2 bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 text-emerald-700 text-sm font-medium rounded-lg transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClub(club._id)}
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
