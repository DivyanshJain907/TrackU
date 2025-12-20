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
  createdAt: string;
}

export default function AdminClubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
      const res = await fetch("/api/admin/clubs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch clubs");
        return;
      }

      const data = await res.json();
      setClubs(data);
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    if (!confirm("Are you sure you want to delete this club?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/clubs/${clubId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Failed to delete club");
        return;
      }

      setClubs((prev) => prev.filter((club) => club._id !== clubId));
    } catch (err) {
      alert("An error occurred");
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
                  <span className="font-semibold">Members:</span> {club.members?.length || 0}
                </p>
                <p>
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(club.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => handleDeleteClub(club._id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Delete Club
              </button>
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
