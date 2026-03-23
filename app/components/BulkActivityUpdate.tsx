"use client";

import { useEffect, useState } from "react";

interface TeamMember {
  _id: string;
  name: string;
  enrollmentNumber: string;
  points: number;
  hours: number;
  position?: string;
}

export default function BulkActivityUpdate() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [points, setPoints] = useState<number | "">("");
  const [hours, setHours] = useState<number | "">("");
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("/api/team-members", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch team members");
        return;
      }

      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while fetching members"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map((m) => m._id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (selectedMembers.size === 0) {
      setError("Please select at least one team member");
      return;
    }

    if (points === "" && hours === "") {
      setError("Please enter at least points or hours");
      return;
    }

    if (!remark.trim()) {
      setError("Please provide a remark/description");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/team-members/bulk-update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberIds: Array.from(selectedMembers),
          points: points === "" ? undefined : points,
          hours: hours === "" ? undefined : hours,
          remark,
          date,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Failed to update members");
        return;
      }

      const result = await res.json();
      setSuccessMessage(
        `Successfully updated ${result.updatedCount} member(s)${
          result.failedCount > 0 ? `. ${result.failedCount} failed.` : "."
        }`
      );

      // Reset form
      setSelectedMembers(new Set());
      setPoints("");
      setHours("");
      setRemark("");
      setDate(new Date().toISOString().split("T")[0]);

      // Refresh members list
      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-linear-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-cyan-500/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-cyan-500 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-6">
        <div className="p-2 sm:p-3 bg-linear-to-br from-cyan-500 to-blue-500 rounded-lg sm:rounded-xl shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words">Bulk Activity Update</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Add points/hours to multiple members</p>
        </div>
      </div>

      {/* Main Grid - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Members List */}
        <div className="md:col-span-2 order-2 md:order-1">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 text-sm sm:text-base"
              />
            </div>

            {/* Select all */}
            <div className="mb-4 p-3 bg-slate-700 rounded border border-slate-600 flex items-center gap-2">
              <input
                type="checkbox"
                id="selectAll"
                checked={
                  filteredMembers.length > 0 &&
                  selectedMembers.size === filteredMembers.length
                }
                onChange={handleSelectAll}
                className="cursor-pointer w-4 h-4"
              />
              <label htmlFor="selectAll" className="text-white cursor-pointer flex-1 text-sm sm:text-base font-medium">
                Select All
              </label>
              <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                {selectedMembers.size}/{filteredMembers.length}
              </span>
            </div>

            {/* Members list */}
            <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm">No members found</p>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member._id}
                    className={`p-3 rounded border cursor-pointer transition-colors text-sm sm:text-base ${
                      selectedMembers.has(member._id)
                        ? "bg-cyan-600 border-cyan-500"
                        : "bg-slate-700 border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => handleSelectMember(member._id)}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(member._id)}
                        onChange={() => handleSelectMember(member._id)}
                        className="cursor-pointer mt-0.5 w-4 h-4 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{member.name}</div>
                        <div className="text-xs sm:text-sm text-gray-400 truncate">
                          {member.enrollmentNumber}
                          {member.position && ` • ${member.position}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {member.points}pts • {member.hours}h
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Form - Sticky on mobile, right column on desktop */}
        <div className="md:col-span-1 order-1 md:order-2">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6 sticky top-4 sm:top-6"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Details</h3>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded text-green-400 text-xs sm:text-sm">
                {successMessage}
              </div>
            )}

            {/* Points */}
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
                Points
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) =>
                  setPoints(e.target.value === "" ? "" : parseInt(e.target.value))
                }
                placeholder="10"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>

            {/* Hours */}
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
                Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={hours}
                onChange={(e) =>
                  setHours(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
                placeholder="2.5"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>

            {/* Remark */}
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
                Remark *
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="e.g., Workshop"
                rows={2}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none text-sm"
              />
            </div>

            {/* Date */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || selectedMembers.size === 0}
              className={`w-full py-2.5 rounded font-medium transition-colors text-sm sm:text-base ${
                submitting || selectedMembers.size === 0
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800"
              }`}
            >
              {submitting
                ? "Updating..."
                : selectedMembers.size === 0
                ? "Select Members"
                : `Update ${selectedMembers.size}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
