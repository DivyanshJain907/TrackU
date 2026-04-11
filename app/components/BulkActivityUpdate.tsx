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
      <div className="rounded-2xl border-2 border-[#cde4da] bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-[#49c89f] sm:mb-4 sm:h-12 sm:w-12"></div>
          <p className="text-sm text-[#6d7874] sm:text-base">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border-2 border-[#cde4da] bg-white p-4 shadow-2xl transition hover:border-[#9fd4bf] sm:rounded-3xl sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-6">
        <div className="shrink-0 rounded-lg bg-[#49c89f] p-2 sm:rounded-xl sm:p-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="wrap-break-word text-xl font-bold text-[#1f2623] sm:text-2xl md:text-3xl">Bulk Activity Update</h2>
          <p className="mt-0.5 text-xs text-[#6d7874] sm:mt-1 sm:text-sm">Add points/hours to multiple members</p>
        </div>
      </div>

      {/* Main Grid - Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Members List */}
        <div className="md:col-span-2 order-2 md:order-1">
          <div className="rounded-lg border border-[#d7e9e1] bg-[#f7fcfa] p-4 sm:p-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-[#d7e9e1] bg-white px-3 py-2 text-sm text-[#1f2623] placeholder-[#8fa39d] focus:border-[#49c89f] focus:outline-none sm:px-4 sm:text-base"
              />
            </div>

            {/* Select all */}
            <div className="mb-4 flex items-center gap-2 rounded border border-[#d7e9e1] bg-white p-3">
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
              <label htmlFor="selectAll" className="flex-1 cursor-pointer text-sm font-medium text-[#2b3531] sm:text-base">
                Select All
              </label>
              <span className="whitespace-nowrap text-xs text-[#8fa39d] sm:text-sm">
                {selectedMembers.size}/{filteredMembers.length}
              </span>
            </div>

            {/* Members list */}
            <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#8fa39d]">No members found</p>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member._id}
                    className={`p-3 rounded border cursor-pointer transition-colors text-sm sm:text-base ${
                      selectedMembers.has(member._id)
                        ? "bg-[#49c89f] border-[#3db58d]"
                        : "bg-white border-[#d7e9e1] hover:border-[#9fd4bf]"
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
                        <div className="truncate font-medium text-[#1f2623]">{member.name}</div>
                        <div className="truncate text-xs text-[#6d7874] sm:text-sm">
                          {member.enrollmentNumber}
                          {member.position && ` • ${member.position}`}
                        </div>
                        <div className="mt-1 text-xs text-[#8fa39d]">
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
            className="sticky top-4 rounded-lg border border-[#d7e9e1] bg-[#f7fcfa] p-4 sm:top-6 sm:p-6"
          >
            <h3 className="mb-4 text-lg font-bold text-[#1f2623] sm:text-xl">Details</h3>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-600 sm:text-sm">
                {error}
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-xs text-green-600 sm:text-sm">
                {successMessage}
              </div>
            )}

            {/* Points */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-[#5f6b67] sm:text-sm">
                Points
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) =>
                  setPoints(e.target.value === "" ? "" : parseInt(e.target.value))
                }
                placeholder="10"
                className="w-full rounded border border-[#d7e9e1] bg-white px-3 py-2 text-sm text-[#1f2623] placeholder-[#8fa39d] focus:border-[#49c89f] focus:outline-none"
              />
            </div>

            {/* Hours */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-[#5f6b67] sm:text-sm">
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
                className="w-full rounded border border-[#d7e9e1] bg-white px-3 py-2 text-sm text-[#1f2623] placeholder-[#8fa39d] focus:border-[#49c89f] focus:outline-none"
              />
            </div>

            {/* Remark */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-[#5f6b67] sm:text-sm">
                Remark *
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="e.g., Workshop"
                rows={2}
                className="w-full resize-none rounded border border-[#d7e9e1] bg-white px-3 py-2 text-sm text-[#1f2623] placeholder-[#8fa39d] focus:border-[#49c89f] focus:outline-none"
              />
            </div>

            {/* Date */}
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-medium text-[#5f6b67] sm:text-sm">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border border-[#d7e9e1] bg-white px-3 py-2 text-sm text-[#1f2623] focus:border-[#49c89f] focus:outline-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting || selectedMembers.size === 0}
              className={`w-full py-2.5 rounded font-medium transition-colors text-sm sm:text-base ${
                submitting || selectedMembers.size === 0
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-[#49c89f] text-white hover:bg-[#3db58d]"
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
