"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudLoader from "@/app/components/CloudLoader";
import BulkActivityUpdate from "@/app/components/BulkActivityUpdate";

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
  imageUrl?: string;
}

export default function Dashboard() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [username, setUsername] = useState("");
  const [club, setClub] = useState<Club | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSecondDeleteConfirm, setShowSecondDeleteConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showClubSettings, setShowClubSettings] = useState(false);
  const [clubSettingsData, setClubSettingsData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    uploadMode: "url" as "url" | "upload",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState(""); // For debugging
  const [showClubUsers, setShowClubUsers] = useState(false);
  const [clubUsers, setClubUsers] = useState<Array<{
    id: string;
    username: string;
    email: string;
    isClubLeader: boolean;
    isApproved: boolean;
    joinedAt: string;
  }>>([]);
  const [loadingClubUsers, setLoadingClubUsers] = useState(false);
  const [clubMembersCount, setClubMembersCount] = useState(0);
  const [showUpdateHistory, setShowUpdateHistory] = useState(false);
  const [updateHistory, setUpdateHistory] = useState<Array<{
    _id: string;
    points: number;
    hours: number;
    remark: string;
    date: string;
    addedBy: { username: string; email: string };
    addedAt: string;
  }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
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

    // Check for maintenance mode
    checkMaintenanceMode(token);

    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Fetch club info and members
    fetchClubInfo(token);
    fetchMembers(token);
    loadClubMembersCount(token);

  }, [router]);

  const checkMaintenanceMode = async (token: string) => {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.maintenanceMode) {
          router.replace("/maintenance");
        }
      }
    } catch (err) {
      console.error("Error checking maintenance mode:", err);
    }
  };

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
      setRefreshing(false);
    }
  };

  // Refresh function for manual refresh
  const handleRefresh = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      setRefreshing(true);
      await fetchMembers(token);
      await fetchClubInfo(token);
    }
  };

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await fetchMembers(token);
        await fetchClubInfo(token);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchClubInfo = async (token: string) => {
    try {
      const res = await fetch("/api/club", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch club info");
      }

      const data = await res.json();
      console.log("Club data fetched:", data);
      if (data.imageUrl) {
        console.log("Image URL found:", data.imageUrl.substring(0, 100) + "...");
      }
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

    // Check if remark is provided
    if (!updateData.remark || updateData.remark.trim() === "") {
      setError("Remarks are required to update member details");
      return;
    }

    // Build update object - send incremental values
    const updatePayload: any = {};
    if (updateData.points !== "") {
      updatePayload.points = Number(updateData.points); // Send just the new points
    }
    if (updateData.hours !== "") {
      updatePayload.hours = Number(updateData.hours); // Send just the new hours
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

  const fetchClubUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingClubUsers(true);
    try {
      const res = await fetch("/api/club/members", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch club members");
      }

      const data = await res.json();
      setClubUsers(data.members);
      setShowClubUsers(true);
    } catch (err) {
      setError("Failed to load club users");
    } finally {
      setLoadingClubUsers(false);
    }
  };

  const loadClubMembersCount = async (token: string) => {
    try {
      const res = await fetch("/api/club/members", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch club members count");
      }

      const data = await res.json();
      setClubMembersCount(data.members.length);
    } catch (err) {
      console.error("Failed to load club members count:", err);
    }
  };

  const fetchUpdateHistory = async (memberId: string) => {
    try {
      setLoadingHistory(true);
      setError("");
      const token = localStorage.getItem("token");
      
      console.log("Fetching update history for member:", memberId);
      console.log("API URL:", `/api/team-members/${memberId}/activity`);
      
      const res = await fetch(`/api/team-members/${memberId}/activity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);
      
      const data = await res.json();
      console.log("Response data:", data);
      
      if (!res.ok) {
        console.error("API Error:", data);
        throw new Error(data.error || data.details || "Failed to fetch update history");
      }

      setUpdateHistory(data.updateHistory || []);
      setShowUpdateHistory(true);
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to load update history";
      setError(errorMsg);
      alert(`Error details: ${errorMsg}`); // Temporary alert to see error
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteUpdate = async (memberId: string, updateId: string) => {
    if (!confirm("Are you sure you want to delete this update? The totals will be recalculated.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/team-members/${memberId}/activity?updateId=${updateId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete update");
      }

      const data = await res.json();
      
      // Update the member in the list
      setMembers((prevMembers) =>
        prevMembers.map((m) => (m._id === memberId ? data.member : m))
      );

      // Refresh the history
      await fetchUpdateHistory(memberId);
      
      setSuccessMessage("Update deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete update");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isClubLeader");
    localStorage.removeItem("isApproved");
    router.push("/");
  };

  const openClubSettings = () => {
    if (club) {
      setClubSettingsData({
        name: club.name,
        description: club.description || "",
        imageUrl: club.imageUrl || "",
        uploadMode: "url",
      });
      setShowClubSettings(true);
    }
  };

  const handleSaveClubSettings = async () => {
    try {
      setSavingSettings(true);
      const token = localStorage.getItem("token");
      if (!token || !club) {
        alert("Authentication error");
        setSavingSettings(false);
        return;
      }

      // Validate that at least name is provided
      if (!clubSettingsData.name.trim()) {
        alert("Club name is required");
        setSavingSettings(false);
        return;
      }

      console.log("Saving club settings:", {
        name: clubSettingsData.name,
        description: clubSettingsData.description,
        hasImage: !!clubSettingsData.imageUrl,
        imageSize: clubSettingsData.imageUrl?.length,
      });

      const res = await fetch(`/api/club/${club.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: clubSettingsData.name,
          description: clubSettingsData.description,
          imageUrl: clubSettingsData.imageUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to parse error response" }));
        alert(`Failed to update club: ${errorData.error || "Unknown error"}`);
        setSavingSettings(false);
        return;
      }

      const updatedClub = await res.json();
      console.log("Club updated:", updatedClub);
      setClub(updatedClub);
      setShowClubSettings(false);
      setSuccessMessage("Club settings updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving club settings:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eaf6f1]">
        <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#d4efe5] blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-[#cfe9df] blur-3xl"></div>
        <div className="relative z-10 text-center">
          <CloudLoader />
          <p className="mt-4 font-semibold text-[#2a342f]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eaf6f1]">
      <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#d4efe5] blur-3xl"></div>
      <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-[#cfe9df] blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-[#d7e9e1] bg-[#eef8f4]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-8">
          <div className="flex justify-between items-start sm:items-center gap-3 sm:gap-6">
            <div className="space-y-1 sm:space-y-2 flex-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src="/image2.png"
                  alt="TrackU Logo"
                  className="w-12 sm:w-20 h-12 sm:h-20 rounded-xl sm:rounded-2xl shadow-lg"
                />
                <div>
                  <h1 className="text-xl sm:text-5xl font-bold text-[#1f2623]">
                    TrackU
                  </h1>
                  <p className="hidden text-xs font-semibold text-[#5f6b67] sm:block sm:text-sm">
                    Manage Your Team
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation - Mobile and Desktop */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Layout - Icon buttons */}
              <div className="flex sm:hidden gap-2">
                <Link
                  href="/performers"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cfe4db] bg-white text-[#2b3531] transition duration-300 hover:border-[#9fd4bf] hover:bg-[#f3fbf7]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </Link>
                <Link
                  href="/attendance"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#49c89f] font-semibold text-white transition duration-300 hover:bg-[#3db58d]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex gap-4 items-center">
                <Link
                  href="/performers"
                  className="group relative flex items-center gap-2 rounded-2xl border border-[#cfe4db] bg-white px-6 py-3 font-semibold text-[#2b3531] transition duration-300 hover:-translate-y-1 hover:border-[#9fd4bf] hover:bg-[#f3fbf7] hover:shadow-xl"
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Performers
                </Link>
                <Link
                  href="/attendance"
                  className="group relative flex items-center gap-2 rounded-2xl bg-[#49c89f] px-6 py-3 font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#3db58d] hover:shadow-2xl"
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Attendance
                </Link>

                {/* Members Badge */}
                <div className="flex items-center gap-2 rounded-2xl border border-[#cfe4db] bg-white px-4 py-2 transition hover:border-[#9fd4bf]">
                  <svg className="h-5 w-5 text-[#49c89f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-base font-bold text-[#2b3531]">{members.length} Members</span>
                </div>
              </div>

              {/* Settings Button */}
              <button
                onClick={openClubSettings}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#49c89f] transition hover:scale-110 hover:shadow-lg sm:h-12 sm:w-12"
                title="Club Settings"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* User Profile Button */}
              {username && (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f8f71] transition hover:scale-110 hover:shadow-lg sm:h-12 sm:w-12"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[#d7e9e1] bg-white shadow-xl">
                      <div className="border-b border-[#e2efe9] px-4 py-3">
                        <p className="text-sm font-semibold text-[#2b3531]">{username}</p>
                      </div>
                      <button
                        onClick={() => {
                          fetchClubUsers();
                          setIsProfileMenuOpen(false);
                        }}
                        disabled={loadingClubUsers}
                        className="flex w-full items-center gap-2 border-b border-[#e2efe9] px-4 py-3 text-left text-sm font-semibold text-[#2f8f71] transition hover:bg-[#f4fbf8] hover:text-[#237559] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        View Logged Leaders
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        {/* Club Header */}
        {club && (
          <div className="relative overflow-hidden rounded-3xl shadow-2xl mb-12">
            {/* Background Image - Only if imageUrl exists */}
            {club.imageUrl ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${club.imageUrl})`,
                    zIndex: 0,
                  }}
                ></div>
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-linear-to-br from-[#102019]/45 via-[#1d5a49]/35 to-[#102019]/45 backdrop-blur-sm" style={{ zIndex: 1 }}></div>
              </>
            ) : (
              /* Fallback gradient when no image */
              <div className="absolute inset-0 bg-linear-to-br from-[#113123]/85 via-[#1e5c46]/80 to-[#113123]/85 backdrop-blur-xl" style={{ zIndex: 0 }}></div>
            )}
            {/* Content */}
            <div className="relative z-10 p-12">
              <div className="flex flex-col items-center justify-center gap-6 text-center">
                <div className="max-w-3xl">
                  <h1 className="text-6xl sm:text-7xl font-bold drop-shadow-lg mb-3 bg-linear-to-r from-purple-200 via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    {club.name}
                  </h1>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="h-1 w-12 bg-linear-to-r from-purple-400 to-blue-400 rounded-full"></div>
                  <p className="text-[#dff7ec] text-xl font-bold">Club Dashboard</p>
                  <div className="h-1 w-12 bg-linear-to-r from-blue-400 to-purple-400 rounded-full"></div>
                </div>
                <p className="text-gray-100 text-lg sm:text-xl max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
                  {club.description}
                </p>
              </div>
            </div>
            </div>
          </div>
        )}

        {error && (
          <div className="animate-in fade-in slide-in-from-top-2 mb-8 flex items-start gap-4 rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-4 font-semibold text-red-700 transition hover:border-red-300">
            <svg className="w-6 h-6 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-16a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
            <div>
              <p className="mb-1 font-bold text-red-700">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="animate-in fade-in slide-in-from-top-2 mb-8 flex items-start gap-4 rounded-2xl border-2 border-green-200 bg-green-50 px-6 py-4 font-semibold text-green-700 transition hover:border-green-300">
            <svg className="w-6 h-6 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="mb-1 font-bold text-green-700">Success</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Search Bar and Add Member Button */}
        <div className="mb-8 flex gap-2 items-center">
          {/* Search Bar */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-[#bfe8d8] to-[#d7efe6] opacity-0 blur group-focus-within:opacity-100 transition duration-300"></div>
            <input
              type="text"
              placeholder="Search by name or enrollment number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full rounded-2xl border-2 border-[#cfe4db] bg-white py-4 pl-14 pr-12 text-base font-medium text-[#1f2623] placeholder-[#8fa39d] shadow-lg transition duration-300 hover:border-[#9fd4bf] hover:shadow-xl focus:border-[#49c89f] focus:outline-none focus:ring-2 focus:ring-[#49c89f]/20"
            />
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#49c89f]"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-[#8fa39d] transition hover:text-[#2f8f71]"
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

          {/* Bulk Activity Button */}
          <button
            onClick={() => setShowBulkUpdate(!showBulkUpdate)}
            className="group flex shrink-0 items-center justify-center gap-1.5 rounded-lg border-2 border-[#6ecfb2] bg-[#49c89f] px-2 py-2.5 text-xs font-bold text-white transition duration-300 hover:scale-105 hover:-translate-y-1 hover:bg-[#39b68d] sm:gap-2 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm md:px-8 md:py-4 md:text-base"
            title="Bulk Activity Update"
          >
            {showBulkUpdate ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Close</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Bulk</span>
              </>
            )}
          </button>

          {/* Add Member Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="group flex shrink-0 items-center justify-center gap-1.5 rounded-lg border-2 border-[#9fd4bf] bg-white px-2 py-2.5 text-xs font-bold text-[#2b3531] transition duration-300 hover:scale-105 hover:-translate-y-1 hover:bg-[#f3fbf7] sm:gap-2 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm md:px-8 md:py-4 md:text-base"
            title="Add New Member"
          >
            {showAddForm ? (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Close</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Member</span>
              </>
            )}
          </button>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="animate-in fade-in mb-6 flex items-center gap-3 rounded-2xl border-2 border-[#cde4da] bg-[#f5fbf8] p-4">
            <svg className="h-5 w-5 shrink-0 text-[#49c89f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-[#4e5a56]">
              Found <span className="text-base font-bold text-[#2f8f71]">{filteredMembers.length}</span>{" "}
              <span className="font-semibold">
                member{filteredMembers.length !== 1 ? "s" : ""}
              </span>{" "}
              matching "<span className="font-bold text-[#2b3531]">{searchQuery}</span>"
            </div>
          </div>
        )}

        {/* Add Member Form */}
        {showAddForm && (
          <div className="animate-in fade-in slide-in-from-top-2 mb-8 rounded-3xl border-2 border-[#cde4da] bg-white p-8 shadow-2xl transition hover:border-[#9fd4bf]">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-[#49c89f] p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#1f2623]">Add New Team Member</h2>
            </div>
            <form onSubmit={handleAddMember} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="rounded-2xl border-2 border-[#cde4da] bg-[#f6fcfa] px-5 py-4 font-semibold text-[#1f2623] shadow-lg transition placeholder-[#8fa39d] hover:border-[#9fd4bf] focus:border-[#49c89f] focus:outline-none focus:ring-2 focus:ring-[#49c89f]/20"
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
                  className="rounded-2xl border-2 border-[#cde4da] bg-[#f6fcfa] px-5 py-4 font-semibold text-[#1f2623] shadow-lg transition placeholder-[#8fa39d] hover:border-[#9fd4bf] focus:border-[#49c89f] focus:outline-none focus:ring-2 focus:ring-[#49c89f]/20"
                />
              </div>
              <input
                type="text"
                placeholder="Position (e.g., Captain, Vice-Captain, Member)"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full rounded-2xl border-2 border-[#cde4da] bg-[#f6fcfa] px-5 py-4 font-semibold text-[#1f2623] shadow-lg transition placeholder-[#8fa39d] hover:border-[#9fd4bf] focus:border-[#49c89f] focus:outline-none focus:ring-2 focus:ring-[#49c89f]/20"
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#49c89f] px-6 py-4 text-lg font-bold text-white transition hover:-translate-y-1 hover:bg-[#39b68d] hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Member
              </button>
            </form>
          </div>
        )}

        {/* Bulk Activity Update Form */}
        {showBulkUpdate && (
          <div className="mb-8">
            <BulkActivityUpdate />
          </div>
        )}

        {/* Team Members List */}
        {members.length === 0 ? (
          <div className="rounded-3xl border-2 border-[#cde4da] bg-white p-16 text-center shadow-2xl transition hover:border-[#9fd4bf]">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#e7f8f1]">
              <svg className="h-10 w-10 text-[#49c89f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <p className="mb-2 text-lg font-semibold text-[#2b3531]">
              No Team Members Yet
            </p>
            <p className="mx-auto mb-6 max-w-md text-base text-[#6d7874]">
              Your team list is empty. Start by clicking the "Add Member" button to add your first team member!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#49c89f] px-8 py-3 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#39b68d] hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Member
            </button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="rounded-3xl border-2 border-[#ecdcb2] bg-[#fff9e8] p-16 text-center shadow-2xl transition hover:border-[#dfc889]">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#ffeec5]">
              <svg className="h-10 w-10 text-[#c49a30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="mb-2 text-lg font-semibold text-[#5f4f26]">
              No Results Found
            </p>
            <p className="mx-auto mb-6 max-w-md text-base text-[#7a6a3f]">
              Your search for "<span className="font-bold text-[#9a7a2f]">{searchQuery}</span>" didn't match any members.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#d5a340] px-8 py-3 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#c09031] hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className="group relative overflow-hidden rounded-2xl border border-[#cde4da] bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#9fd4bf] hover:shadow-xl"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-[#dff5ed]/0 to-[#cfeadd]/0 transition duration-300 group-hover:from-[#dff5ed]/80 group-hover:to-[#cfeadd]/40"></div>

                <div className="relative z-10 mb-3">
                  <div className="flex items-start justify-between mb-3 gap-4">
                    {/* Member Name and ID - Left side */}
                    <div>
                      <h3 className="text-lg font-bold text-[#1f2623] transition duration-300 group-hover:text-[#2f8f71]">
                        {member.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[#7a8580]">
                        ID: {member.enrollmentNumber}
                      </p>
                    </div>

                    {/* Creator Info - Right side */}
                    <div className="text-right">
                      {member.createdBy && (
                        <p className="mb-1 text-xs text-[#7a8580]">
                          Added by:{" "}
                          <span className="font-semibold text-[#2f8f71]">
                            {member.createdBy.username}
                          </span>
                        </p>
                      )}
                      {member.lastUpdatedBy && (
                        <p className="text-xs text-[#7a8580]">
                          Last updated by:{" "}
                          <span className="font-semibold text-[#2f8f71]">
                            {member.lastUpdatedBy.username}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {member.position && (
                    <div className="mb-3 inline-flex items-center gap-1 rounded-lg border border-[#ecdcb2] bg-[#fff5d8] px-3 py-1 transition hover:border-[#dfc889]">
                      <span className="text-sm">📍</span>
                      <p className="text-xs font-bold text-[#9a7a2f]">
                        {member.position}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats Section */}
                <div className="relative z-10 mb-3 grid grid-cols-2 gap-3 border-y border-[#e1eee8] py-3">
                  <div className="rounded-lg border border-[#cde4da] bg-[#f5fbf8] p-3 text-center transition group-hover:shadow-lg">
                    <p className="text-2xl font-bold text-[#2f8f71]">
                      {member.points}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#5f6b67]">
                      ⭐ Task
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#cde4da] bg-[#f5fbf8] p-3 text-center transition group-hover:shadow-lg">
                    <p className="text-2xl font-bold text-[#2f8f71]">
                      {member.hours}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#5f6b67]">
                      ⏱️ Hours
                    </p>
                  </div>
                </div>

                {/* Remarks Section */}
                {(member.remarks ?? []).length > 0 && (
                  <div className="mb-3 relative z-10">
                    <p className="mb-2 flex items-center gap-1 text-xs font-bold text-[#2b3531]">
                      <span className="text-sm">💬</span>
                      Remarks ({(member.remarks ?? []).length})
                    </p>
                    <div className="max-h-32 overflow-y-auto rounded-lg border border-[#e1eee8] bg-[#f7fcfa] p-2 transition hover:border-[#cde4da]">
                      {(member.remarks ?? []).map((remark, idx) => (
                        <div
                          key={idx}
                          className="mb-2 border-b border-[#e1eee8] pb-2 text-xs text-[#5f6b67] last:border-b-0"
                        >
                          <p className="mb-0.5 font-bold text-[#2f8f71]">
                            {remark.text}
                          </p>
                          <p className="text-xs text-[#8a9590]">
                            📅 {new Date(remark.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-6 gap-2 relative z-10">
                  <button
                    onClick={() => openEditForm(member)}
                    className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-white px-3 py-2 rounded-lg transition duration-200 text-xs font-bold shadow-lg hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => openUpdateForm(member)}
                    className="col-span-3 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 active:from-purple-800 active:to-purple-900 text-white px-3 py-2 rounded-lg transition duration-200 text-xs font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5"
                  >
                    ⬆️ Update
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      fetchUpdateHistory(member._id);
                    }}
                    className="bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 active:from-cyan-800 active:to-cyan-900 text-white px-3 py-2 rounded-lg transition duration-200 font-bold shadow-lg hover:shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 text-lg"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setShowDeleteConfirm(true);
                    }}
                    className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 text-white px-2 py-2 rounded-lg transition duration-200 font-bold shadow-lg hover:shadow-xl hover:shadow-red-500/40 transform hover:-translate-y-0.5 w-12 mx-auto text-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Member Modal */}
        {showEditForm && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0f1f19]/40 p-2 backdrop-blur-sm sm:p-4">
            <div className="my-4 w-full max-w-md rounded-2xl border-2 border-[#cde4da] bg-white p-4 shadow-2xl sm:p-6">
              <h2 className="mb-3 text-xl font-bold text-[#2f8f71] sm:mb-4 sm:text-2xl">
                Edit Member Information
              </h2>

              <form
                onSubmit={handleEditMember}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#2b3531] sm:mb-2 sm:text-sm">
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
                    className="w-full rounded-xl border-2 border-[#cde4da] bg-[#f6fcfa] px-3 py-2 text-sm text-[#1f2623] focus:border-[#49c89f] focus:outline-none focus:ring-2 focus:ring-[#49c89f]/20 sm:px-4 sm:text-base"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#2b3531] sm:mb-2 sm:text-sm">
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
                    className="w-full rounded-xl border-2 border-[#cde4da] bg-[#f6fcfa] px-3 py-2 text-sm text-[#1f2623] focus:border-[#49c89f] focus:outline-none focus:ring-2 focus:ring-[#49c89f]/20 sm:px-4 sm:text-base"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#2b3531] sm:mb-2 sm:text-sm">
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
                    className="w-full rounded-xl border-2 border-[#cde4da] bg-[#f6fcfa] px-3 py-2 text-sm text-[#1f2623] focus:border-[#49c89f] focus:outline-none focus:ring-2 focus:ring-[#49c89f]/20 sm:px-4 sm:text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#49c89f] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#39b68d] sm:py-2 sm:text-base"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedMember(null);
                    }}
                    className="flex-1 rounded-xl border border-[#cde4da] bg-[#f6fcfa] px-4 py-2.5 text-sm font-bold text-[#2b3531] shadow-md transition hover:bg-[#eef9f4] sm:py-2 sm:text-base"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0f1f19]/40 p-2 backdrop-blur-sm sm:p-4">
            <div className="my-4 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-[#cde4da] bg-white p-4 shadow-2xl sm:p-6">
              <h2 className="mb-4 text-xl font-bold text-[#2f8f71] sm:text-2xl">
                Update {selectedMember.name}
              </h2>

              <form
                onSubmit={handleUpdateMember}
                className="space-y-3"
              >
                {/* Task Input */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#2f8f71] sm:text-sm">
                    Add Task <span className="text-[#4aa687]">(Current: {selectedMember.points})</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={updateData.points}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        points:
                          e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    placeholder="Enter task points"
                    className="w-full rounded-lg border border-[#d7e9e1] bg-[#f6fcfa] px-3 py-2 text-xs font-medium text-[#1f2623] transition placeholder-[#8fa39d] hover:border-[#9fd4bf] focus:border-[#49c89f] focus:outline-none focus:ring-1 focus:ring-[#49c89f]/20 sm:text-sm"
                  />
                </div>

                {/* Hours Input */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#2f8f71] sm:text-sm">
                    Add Hours <span className="text-[#4aa687]">(Current: {selectedMember.hours.toFixed(1)})</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={updateData.hours}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        hours:
                          e.target.value === "" ? "" : parseFloat(e.target.value),
                      })
                    }
                    placeholder="Enter hours (e.g., 5.4)"
                    className="w-full rounded-lg border border-[#d7e9e1] bg-[#f6fcfa] px-3 py-2 text-xs font-medium text-[#1f2623] transition placeholder-[#8fa39d] hover:border-[#9fd4bf] focus:border-[#49c89f] focus:outline-none focus:ring-1 focus:ring-[#49c89f]/20 sm:text-sm"
                  />
                </div>

                {/* Date Input */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#2f8f71] sm:text-sm">
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
                    className="w-full rounded-lg border border-[#d7e9e1] bg-[#f6fcfa] px-3 py-2 text-xs font-medium text-[#1f2623] transition placeholder-[#8fa39d] hover:border-[#9fd4bf] focus:border-[#49c89f] focus:outline-none focus:ring-1 focus:ring-[#49c89f]/20 sm:text-sm"
                  />
                  <p className="mt-1 text-[10px] text-[#8a9590] sm:text-xs">
                    Defaults to today
                  </p>
                </div>

                {/* Remark Input */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#2f8f71] sm:text-sm">
                    Add Remark <span className="font-bold text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={updateData.remark}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, remark: e.target.value })
                    }
                    placeholder="Add a note or remark... (Required)"
                    className="w-full resize-none rounded-lg border border-[#d7e9e1] bg-[#f6fcfa] px-3 py-2 text-xs font-medium text-[#1f2623] transition placeholder-[#8fa39d] hover:border-[#9fd4bf] focus:border-[#49c89f] focus:outline-none focus:ring-1 focus:ring-[#49c89f]/20 sm:text-sm"
                    rows={2}
                  />
                </div>

                {/* Buttons */}
                <div className="mt-4 flex gap-2 border-t border-[#e2efe9] pt-3">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#49c89f] px-3 py-2 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#39b68d] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:text-sm"
                  >
                    {updateLoading ? (
                      <>
                        <CloudLoader size="14px" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateForm(false);
                      setSelectedMember(null);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#cde4da] bg-[#f6fcfa] px-3 py-2 text-xs font-bold text-[#2b3531] shadow-lg transition hover:bg-[#eef9f4] hover:shadow-xl sm:text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Club Users Modal */}
        {showClubUsers && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0f1f19]/40 p-2 backdrop-blur-sm sm:p-4">
            <div className="my-4 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-[#cde4da] bg-white p-4 shadow-2xl sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#2f8f71] sm:text-xl">
                  Logged Club Leaders ({clubUsers.length})
                </h2>
                <button
                  onClick={() => setShowClubUsers(false)}
                  className="text-[#8fa39d] transition hover:text-[#2f8f71]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingClubUsers ? (
                <div className="flex justify-center items-center py-8">
                  <CloudLoader size="40px" />
                </div>
              ) : clubUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#6d7874]">No members found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clubUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-lg border border-[#d7e9e1] bg-[#f7fcfa] p-3 transition hover:border-[#9fd4bf]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-[#1f2623]">
                              {user.username}
                            </p>
                            {user.isClubLeader && (
                              <span className="whitespace-nowrap rounded-full bg-[#d5a340] px-2 py-0.5 text-[10px] font-bold text-white">
                                Leader
                              </span>
                            )}
                            {user.isApproved && !user.isClubLeader && (
                              <span className="whitespace-nowrap rounded-full bg-[#49c89f] px-2 py-0.5 text-[10px] font-bold text-white">
                                Approved
                              </span>
                            )}
                            {!user.isApproved && (
                              <span className="whitespace-nowrap rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-[#6d7874]">
                            {user.email}
                          </p>
                          <p className="mt-1 text-[10px] text-[#8fa39d]">
                            Joined: {new Date(user.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowClubUsers(false)}
                className="mt-4 w-full rounded-lg border border-[#cde4da] bg-[#f6fcfa] px-3 py-2 text-sm font-semibold text-[#2b3531] shadow-lg transition hover:bg-[#eef9f4] hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Update History Modal */}
        {showUpdateHistory && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0f1f19]/40 p-2 backdrop-blur-sm sm:p-4">
            <div className="my-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#cde4da] bg-white p-4 shadow-2xl sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#2f8f71] sm:text-xl">
                    Update History
                  </h2>
                  <p className="mt-1 text-sm text-[#6d7874]">{selectedMember.name} - {updateHistory.length} updates</p>
                </div>
                <button
                  onClick={() => {
                    setShowUpdateHistory(false);
                    setUpdateHistory([]);
                  }}
                  className="text-[#8fa39d] transition hover:text-[#2f8f71]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center items-center py-8">
                  <CloudLoader size="40px" />
                </div>
              ) : updateHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f8f1]">
                    <svg className="h-8 w-8 text-[#49c89f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#6d7874]">No update history found</p>
                  <p className="mt-2 text-xs text-[#8fa39d]">Updates will appear here once you start tracking member progress</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {updateHistory.map((update) => (
                    <div
                      key={update._id}
                      className="rounded-lg border border-[#d7e9e1] bg-[#f7fcfa] p-4 transition hover:border-[#9fd4bf]"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="rounded border border-[#cde4da] bg-[#ecf9f4] px-2 py-1 text-xs font-bold text-[#2f8f71]">
                              ⭐ {update.points} Tasks
                            </span>
                            <span className="rounded border border-[#cde4da] bg-[#ecf9f4] px-2 py-1 text-xs font-bold text-[#2f8f71]">
                              ⏱️ {update.hours} Hours
                            </span>
                          </div>
                          <p className="mb-1 text-sm text-[#4e5a56]">
                            <span className="font-semibold text-[#2f8f71]">📅 Record Date:</span>{" "}
                            {new Date(update.date).toLocaleDateString()}
                          </p>
                          {update.remark && (
                            <p className="mb-1 text-sm italic text-[#6d7874]">
                              💬 "{update.remark}"
                            </p>
                          )}
                          <p className="mt-2 text-xs text-[#8fa39d]">
                            Added by <span className="font-semibold text-[#2f8f71]">{update.addedBy.username}</span> on{" "}
                            {new Date(update.addedAt).toLocaleDateString()} at{" "}
                            {new Date(update.addedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteUpdate(selectedMember._id, update._id)}
                          className="shrink-0 rounded-lg bg-red-500 p-2 text-xs font-bold text-white shadow-lg transition hover:bg-red-600"
                          title="Delete this update"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowUpdateHistory(false);
                  setUpdateHistory([]);
                }}
                className="mt-4 w-full rounded-lg border border-[#cde4da] bg-[#f6fcfa] px-3 py-2 text-sm font-semibold text-[#2b3531] shadow-lg transition hover:bg-[#eef9f4] hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* First Delete Confirmation Modal */}
        {showDeleteConfirm && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1f19]/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border-2 border-red-200 bg-white p-6 shadow-2xl sm:p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
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
              <h2 className="mb-4 text-center text-2xl font-bold text-red-700">
                Delete Member?
              </h2>
              <p className="mb-2 text-center font-medium text-[#2b3531]">
                Are you sure you want to delete{" "}
                <span className="font-bold text-red-700">
                  {selectedMember.name}
                </span>
                ?
              </p>
              <p className="mb-6 text-center text-sm text-[#6d7874]">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setShowSecondDeleteConfirm(true);
                  }}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 font-bold text-white shadow-md transition hover:bg-red-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 rounded-xl border border-[#cde4da] bg-[#f6fcfa] px-4 py-2.5 font-bold text-[#2b3531] shadow-md transition hover:bg-[#eef9f4]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Second Delete Confirmation Modal */}
        {showSecondDeleteConfirm && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1f19]/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border-4 border-red-500 bg-white p-6 shadow-2xl sm:p-8">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-600">
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
              <h2 className="mb-4 text-center text-2xl font-bold text-red-800">
                Final Confirmation
              </h2>
              <p className="mb-2 text-center font-semibold text-[#2b3531]">
                This is your last chance!
              </p>
              <p className="mb-6 text-center text-sm text-[#6d7874]">
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
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white shadow-md transition hover:bg-red-700"
                >
                  Permanently Delete
                </button>
                <button
                  onClick={() => {
                    setShowSecondDeleteConfirm(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 rounded-xl border border-[#cde4da] bg-[#f6fcfa] px-4 py-2.5 font-bold text-[#2b3531] shadow-md transition hover:bg-[#eef9f4]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Club Settings Modal */}
        {showClubSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1f19]/40 p-3 backdrop-blur-sm sm:p-4 md:p-6">
            <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-[#cde4da] bg-white p-4 shadow-2xl sm:p-6 md:max-w-4xl md:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                  <div className="rounded-2xl bg-[#49c89f] p-2 shrink-0 sm:p-3 md:p-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="truncate text-lg font-bold text-[#1f2623] sm:text-2xl md:text-3xl">Club Settings</h2>
                </div>
                <button
                  onClick={() => setShowClubSettings(false)}
                  className="ml-2 shrink-0 text-[#8fa39d] transition hover:text-[#2f8f71]"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {/* Club Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#2b3531] sm:mb-2 sm:text-sm md:mb-3 md:text-base">Club Name</label>
                  <input
                    type="text"
                    value={clubSettingsData.name}
                    onChange={(e) => setClubSettingsData({ ...clubSettingsData, name: e.target.value })}
                    className="w-full rounded-2xl border border-[#cde4da] bg-[#f6fcfa] px-3 py-2 text-sm text-[#1f2623] transition focus:border-[#49c89f] focus:outline-none sm:px-4 sm:py-3 md:px-5 md:py-4 md:text-base"
                    placeholder="Enter club name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#2b3531] sm:mb-2 sm:text-sm md:mb-3 md:text-base">Description</label>
                  <textarea
                    value={clubSettingsData.description}
                    onChange={(e) => setClubSettingsData({ ...clubSettingsData, description: e.target.value })}
                    className="w-full resize-none rounded-2xl border border-[#cde4da] bg-[#f6fcfa] px-3 py-2 text-sm text-[#1f2623] transition focus:border-[#49c89f] focus:outline-none sm:px-4 sm:py-3 md:px-5 md:py-4 md:text-base"
                    placeholder="Enter club description"
                    rows={3}
                  />
                </div>

                {/* Banner Image - URL or Upload */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#2b3531] sm:mb-3 sm:text-sm md:mb-4 md:text-base">Banner Image</label>
                  
                  {/* Image Upload Tabs */}
                  <div className="flex gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-5">
                    <button
                      type="button"
                      onClick={() => setClubSettingsData({ ...clubSettingsData, uploadMode: 'url' } as any)}
                      className={`flex-1 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition ${
                        (clubSettingsData as any).uploadMode !== 'upload'
                          ? 'bg-[#49c89f] text-white'
                          : 'bg-[#f6fcfa] text-[#5f6b67] hover:bg-[#eef9f4] border border-[#cde4da]'
                      }`}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setClubSettingsData({ ...clubSettingsData, uploadMode: 'upload' } as any)}
                      className={`flex-1 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition ${
                        (clubSettingsData as any).uploadMode === 'upload'
                          ? 'bg-[#49c89f] text-white'
                          : 'bg-[#f6fcfa] text-[#5f6b67] hover:bg-[#eef9f4] border border-[#cde4da]'
                      }`}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 inline mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Upload
                    </button>
                  </div>

                  {/* URL Input */}
                  {(clubSettingsData as any).uploadMode !== 'upload' && (
                    <input
                      type="url"
                      value={clubSettingsData.imageUrl}
                      onChange={(e) => setClubSettingsData({ ...clubSettingsData, imageUrl: e.target.value })}
                      className="w-full rounded-2xl border border-[#cde4da] bg-[#f6fcfa] px-3 py-2 text-sm text-[#1f2623] transition focus:border-[#49c89f] focus:outline-none sm:px-4 sm:py-3 md:px-5 md:py-4 md:text-base"
                      placeholder="https://example.com/image.jpg"
                    />
                  )}

                  {/* File Upload Input */}
                  {(clubSettingsData as any).uploadMode === 'upload' && (
                    <div>
                      <label className="flex w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#9fd4bf] bg-[#f6fcfa] px-3 py-6 transition hover:border-[#49c89f] hover:bg-[#eef9f4] sm:px-4 sm:py-8 md:px-6 md:py-12">
                        <div className="text-center">
                          <svg className="mx-auto mb-1.5 h-6 w-6 text-[#8fa39d] sm:mb-2 sm:h-8 sm:w-8 md:mb-3 md:h-10 md:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <p className="text-xs font-semibold text-[#2b3531] sm:text-sm md:text-base">Drop image or click to upload</p>
                          <p className="mt-0.5 text-[10px] text-[#8fa39d] sm:mt-1 sm:text-xs md:mt-2 md:text-sm">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setImageLoadStatus(""); // Reset status
                            
                            if (file.size > 5 * 1024 * 1024) {
                              alert("File size must be less than 5MB");
                              return;
                            }
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                let width = img.width;
                                let height = img.height;
                                
                                // Resize if larger than 1200px width
                                if (width > 1200) {
                                  height = (height * 1200) / width;
                                  width = 1200;
                                }
                                
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  const compressedImage = canvas.toDataURL("image/jpeg", 0.90);
                                  console.log("Image compressed successfully", {
                                    originalSize: file.size,
                                    compressedSize: compressedImage.length,
                                    quality: "90%",
                                    maxWidth: "1200px",
                                  });
                                  setClubSettingsData({
                                    ...clubSettingsData,
                                    imageUrl: compressedImage,
                                  });
                                }
                              };
                              img.onerror = () => {
                                alert("Failed to load image. Please try another file.");
                              };
                              img.src = result;
                            };
                            reader.onerror = () => {
                              alert("Failed to read file. Please try again.");
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  <p className="mt-1.5 text-xs text-[#8fa39d] sm:mt-2 md:mt-3 md:text-sm">Recommended size: 1200x400px or wider</p>
                  {clubSettingsData.imageUrl && (
                    <div className="mt-2 sm:mt-4 md:mt-6">
                      <p className="mb-1.5 text-xs font-semibold text-[#2b3531] sm:mb-2 md:mb-3 md:text-sm">Preview:</p>
                      <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-lg border-2 border-[#9fd4bf] bg-[#f6fcfa] sm:h-40 md:h-56">
                        <img
                          src={clubSettingsData.imageUrl}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                          onLoad={(e) => {
                            console.log("Preview image loaded successfully");
                            setImageLoadStatus("loaded");
                          }}
                          onError={(e) => {
                            console.error("Preview image failed to load", e);
                            setImageLoadStatus("error");
                          }}
                        />
                        {!imageLoadStatus && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#eef9f4]">
                            <p className="text-xs text-[#8fa39d] sm:text-sm md:text-base">Loading image...</p>
                          </div>
                        )}
                      </div>
                      {imageLoadStatus === "loaded" && (
                        <p className="mt-1.5 text-xs text-green-600 sm:mt-2 md:mt-3 md:text-sm">✓ Image ready - Click "Save Changes" to apply</p>
                      )}
                      {imageLoadStatus === "error" && (
                        <p className="mt-1.5 text-xs text-orange-500 sm:mt-2 md:mt-3 md:text-sm">⚠ Preview issue but will still save</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8 md:mt-10">
                <button
                  onClick={handleSaveClubSettings}
                  disabled={savingSettings}
                  className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-[#49c89f] px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-[#39b68d] sm:gap-2 sm:px-6 sm:py-3 sm:text-base md:gap-3 md:px-8 md:py-4 md:text-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingSettings ? (
                    <>
                      <CloudLoader />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowClubSettings(false)}
                  disabled={savingSettings}
                  className="flex-1 rounded-2xl border border-[#cde4da] bg-[#f6fcfa] px-4 py-2 text-xs font-bold text-[#2b3531] shadow-md transition hover:bg-[#eef9f4] sm:px-6 sm:py-3 sm:text-base md:px-8 md:py-4 md:text-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
