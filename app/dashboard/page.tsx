"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CloudLoader from "@/app/components/CloudLoader";

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

    // Build update object - add new values to existing values
    const updatePayload: any = {};
    if (updateData.points !== "") {
      updatePayload.points = selectedMember.points + Number(updateData.points);
    }
    if (updateData.hours !== "") {
      updatePayload.hours = selectedMember.hours + Number(updateData.hours);
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
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
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
        <div className="relative z-10 text-center">
          <CloudLoader />
          <p className="mt-4 text-white font-semibold">
            Loading dashboard...
          </p>
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
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src="/image2.png"
                  alt="TrackU Logo"
                  className="w-20 h-20 rounded-2xl shadow-lg"
                />
                <h1 className="text-3xl sm:text-5xl font-bold bg-linear-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                  TrackU
                </h1>
              </div>
              <p className="text-purple-200 text-sm ml-16 font-semibold">
                Manage Your Team with Excellence
              </p>
            </div>

            {/* Navigation - Mobile and Desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Mobile Layout */}
              <div className="flex sm:hidden gap-2">
                <Link
                  href="/performers"
                  className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur text-white px-3 py-2 rounded-xl font-semibold transition duration-300 border border-white/30 hover:border-white/60 flex items-center justify-center gap-1 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Performers
                </Link>
                <Link
                  href="/attendance"
                  className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl font-semibold transition duration-300 flex items-center justify-center gap-1 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Attendance
                </Link>
              </div>

              {/* Members Badge - Mobile and Desktop */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-2xl hover:border-blue-500/60 hover:bg-blue-500/30 transition w-full sm:w-auto justify-center sm:justify-start">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-blue-200 font-bold text-sm sm:text-base">{members.length} Members</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex gap-4 items-center">
                <Link
                  href="/performers"
                  className="group relative bg-white/10 hover:bg-white/20 backdrop-blur text-white px-6 py-3 rounded-2xl font-semibold transition duration-300 border border-white/30 hover:border-white/60 flex items-center gap-2 hover:shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-1"
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
                  className="group relative bg-linear-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl font-semibold transition duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 flex items-center gap-2 transform hover:-translate-y-1"
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
              </div>

              {/* Settings and Profile Section */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Settings Button */}
                <button
                  onClick={openClubSettings}
                  className="flex items-center justify-center w-full sm:w-10 sm:h-10 bg-linear-to-br from-blue-400 to-cyan-400 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-110 py-2 sm:py-0 px-4 sm:px-0 gap-2 sm:gap-0 font-semibold text-white text-sm sm:text-base"
                  title="Club Settings"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="sm:hidden">Settings</span>
                </button>

                {/* User Profile Dropdown - Mobile and Desktop */}
              {username && (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center justify-center w-full sm:w-10 sm:h-10 bg-linear-to-br from-purple-400 to-blue-400 rounded-full sm:rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-110 py-2 sm:py-0 px-4 sm:px-0 gap-2 sm:gap-0 font-semibold text-white sm:text-white text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                    <span className="sm:hidden">Profile</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-purple-500/30 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="px-4 py-3 border-b border-purple-500/20">
                        <p className="text-white font-semibold text-sm">{username}</p>
                        <p className="text-purple-300 text-xs mt-1">Club Member</p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-700/20 transition flex items-center gap-2 font-semibold text-sm"
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
                <div className="absolute inset-0 bg-linear-to-br from-slate-900/40 via-purple-900/40 to-slate-900/40 backdrop-blur-sm" style={{ zIndex: 1 }}></div>
              </>
            ) : (
              /* Fallback gradient when no image */
              <div className="absolute inset-0 bg-linear-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-xl" style={{ zIndex: 0 }}></div>
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
                  <p className="text-purple-200 text-xl font-bold">Club Dashboard</p>
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
          <div className="bg-red-600/20 border-2 border-red-500/50 text-red-300 px-6 py-4 rounded-2xl mb-8 font-semibold flex items-start gap-4 backdrop-blur-sm hover:border-red-500/80 transition animate-in fade-in slide-in-from-top-2">
            <svg className="w-6 h-6 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-16a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
            <div>
              <p className="font-bold text-red-200 mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-600/20 border-2 border-green-500/50 text-green-300 px-6 py-4 rounded-2xl mb-8 font-semibold flex items-start gap-4 backdrop-blur-sm hover:border-green-500/80 transition animate-in fade-in slide-in-from-top-2">
            <svg className="w-6 h-6 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-green-200 mb-1">Success</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Search Bar and Add Member Button */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Search Bar */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-linear-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
            <input
              type="text"
              placeholder="Search by name or enrollment number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full pl-14 pr-12 py-4 border-2 border-purple-500/40 hover:border-purple-500/70 focus:border-purple-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-500 shadow-lg hover:shadow-xl transition duration-300 bg-slate-800/70 backdrop-blur-sm text-base font-medium"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none"
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
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

          {/* Add Member Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="group bg-linear-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 active:from-purple-800 active:via-purple-900 active:to-blue-800 text-white px-8 py-4 rounded-2xl transition duration-300 font-bold shadow-xl hover:shadow-2xl hover:shadow-purple-500/40 whitespace-nowrap transform hover:-translate-y-1 flex items-center justify-center gap-2 text-base hover:scale-105"
          >
            {showAddForm ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Member
              </>
            )}
          </button>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-linear-to-r from-purple-600/20 to-blue-600/20 border-2 border-purple-500/40 rounded-2xl backdrop-blur-sm flex items-center gap-3 animate-in fade-in">
            <svg className="w-5 h-5 text-purple-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-200">
              Found <span className="font-bold text-purple-300 text-base">{filteredMembers.length}</span>{" "}
              <span className="font-semibold">
                member{filteredMembers.length !== 1 ? "s" : ""}
              </span>{" "}
              matching "<span className="font-bold text-purple-200">{searchQuery}</span>"
            </div>
          </div>
        )}

        {/* Add Member Form */}
        {showAddForm && (
          <div className="bg-linear-to-br from-slate-800/70 to-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border-2 border-purple-500/30 hover:border-purple-500/60 transition animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Add New Team Member</h2>
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
                  className="px-5 py-4 bg-slate-700/60 border-2 border-purple-500/40 hover:border-purple-500/70 focus:border-purple-500 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500 font-semibold transition shadow-lg"
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
                  className="px-5 py-4 bg-slate-700/60 border-2 border-purple-500/40 hover:border-purple-500/70 focus:border-purple-500 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500 font-semibold transition shadow-lg"
                />
              </div>
              <input
                type="text"
                placeholder="Position (e.g., Captain, Vice-Captain, Member)"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full px-5 py-4 bg-slate-700/60 border-2 border-purple-500/40 hover:border-purple-500/70 focus:border-purple-500 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500 font-semibold transition shadow-lg"
              />
              <button
                type="submit"
                className="w-full bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white px-6 py-4 rounded-2xl transition font-bold shadow-lg hover:shadow-xl hover:shadow-green-500/40 transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Member
              </button>
            </form>
          </div>
        )}

        {/* Team Members List */}
        {members.length === 0 ? (
          <div className="bg-linear-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border-2 border-purple-500/30 hover:border-purple-500/60 transition">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-500/30 to-blue-500/30 rounded-full mb-6">
              <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <p className="text-gray-300 text-lg font-semibold mb-2">
              No Team Members Yet
            </p>
            <p className="text-gray-400 text-base mb-6 max-w-md mx-auto">
              Your team list is empty. Start by clicking the "Add Member" button to add your first team member!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-1 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Member
            </button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-linear-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border-2 border-amber-500/30 hover:border-amber-500/60 transition">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-amber-500/30 to-orange-500/30 rounded-full mb-6">
              <svg className="w-10 h-10 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-300 text-lg font-semibold mb-2">
              No Results Found
            </p>
            <p className="text-gray-400 text-base mb-6 max-w-md mx-auto">
              Your search for "<span className="font-bold text-amber-300">{searchQuery}</span>" didn't match any members.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:shadow-amber-500/40 transform hover:-translate-y-1 inline-flex items-center gap-2"
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
                className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-lg p-4 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 border border-purple-500/30 hover:border-purple-500/70 transform hover:-translate-y-1 overflow-hidden relative"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 transition duration-300"></div>

                <div className="relative z-10 mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-purple-200 group-hover:to-blue-200 group-hover:bg-clip-text transition duration-300">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ID: {member.enrollmentNumber}
                      </p>
                    </div>
                  </div>

                  {member.position && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg mb-3 hover:border-amber-500/70 transition">
                      <span className="text-sm">📍</span>
                      <p className="text-xs font-bold text-amber-300">
                        {member.position}
                      </p>
                    </div>
                  )}

                  {/* Creator Info */}
                  {member.createdBy && (
                    <p className="text-xs text-gray-500 mb-1">
                      Added by:{" "}
                      <span className="font-semibold text-blue-400">
                        {member.createdBy.username}
                      </span>
                    </p>
                  )}
                  {member.lastUpdatedBy && (
                    <p className="text-xs text-gray-500">
                      Last updated by:{" "}
                      <span className="font-semibold text-green-400">
                        {member.lastUpdatedBy.username}
                      </span>
                    </p>
                  )}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-3 mb-3 py-3 border-t border-b border-purple-500/30 relative z-10">
                  <div className="text-center p-3 bg-linear-to-br from-purple-500/30 to-blue-500/30 rounded-lg border border-purple-500/40 hover:border-purple-500/70 transition group-hover:shadow-lg group-hover:shadow-purple-500/20">
                    <p className="text-2xl font-bold text-purple-300 drop-shadow-lg">
                      {member.points}
                    </p>
                    <p className="text-xs text-gray-300 mt-1 font-semibold">
                      ⭐ Task
                    </p>
                  </div>
                  <div className="text-center p-3 bg-linear-to-br from-green-500/30 to-emerald-500/30 rounded-lg border border-green-500/40 hover:border-green-500/70 transition group-hover:shadow-lg group-hover:shadow-green-500/20">
                    <p className="text-2xl font-bold text-green-300 drop-shadow-lg">
                      {member.hours}
                    </p>
                    <p className="text-xs text-gray-300 mt-1 font-semibold">
                      ⏱️ Hours
                    </p>
                  </div>
                </div>

                {/* Remarks Section */}
                {(member.remarks ?? []).length > 0 && (
                  <div className="mb-3 relative z-10">
                    <p className="text-xs font-bold text-gray-200 mb-2 flex items-center gap-1">
                      <span className="text-sm">💬</span>
                      Remarks ({(member.remarks ?? []).length})
                    </p>
                    <div className="bg-slate-700/50 rounded-lg p-2 max-h-32 overflow-y-auto border border-purple-500/20 hover:border-purple-500/40 transition">
                      {(member.remarks ?? []).map((remark, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-300 mb-2 pb-2 border-b border-purple-500/20 last:border-b-0"
                        >
                          <p className="font-bold text-blue-300 mb-0.5">
                            {remark.text}
                          </p>
                          <p className="text-gray-500 text-xs">
                            📅 {new Date(remark.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 relative z-10">
                  <button
                    onClick={() => openEditForm(member)}
                    className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-white px-3 py-2 rounded-lg transition duration-200 text-xs font-bold shadow-lg hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => openUpdateForm(member)}
                    className="flex-1 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 active:from-purple-800 active:to-purple-900 text-white px-3 py-2 rounded-lg transition duration-200 text-xs font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5"
                  >
                    ⬆️ Update
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setShowDeleteConfirm(true);
                    }}
                    className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 text-white px-3 py-2 rounded-lg transition duration-200 text-xs font-bold shadow-lg hover:shadow-xl hover:shadow-red-500/40 transform hover:-translate-y-0.5"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full border-2 border-blue-200 my-4">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-3 sm:mb-4">
                Edit Member Information
              </h2>

              <form
                onSubmit={handleEditMember}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
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
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-50 border-2 border-blue-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
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
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-50 border-2 border-blue-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
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
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-50 border-2 border-blue-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 sm:py-2 rounded-xl transition font-bold shadow-md text-sm sm:text-base"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 sm:py-2 rounded-xl transition font-bold shadow-md text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full border-2 border-amber-200 my-4 max-h-[95vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-amber-700 mb-3 sm:mb-4">
                Update {selectedMember.name}
              </h2>

              <form
                onSubmit={handleUpdateMember}
                className="space-y-3 sm:space-y-4"
              >
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Add Task (Current: {selectedMember.points})
                  </label>
                  <input
                    type="number"
                    value={updateData.points}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        points:
                          e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    placeholder="Enter task to add"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Add Hours of Work (Current: {selectedMember.hours})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={updateData.hours}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        hours:
                          e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    placeholder="Enter hours to add"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
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
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Select the date for this record (defaults to today)
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">
                    Add Remark
                  </label>
                  <textarea
                    value={updateData.remark}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, remark: e.target.value })
                    }
                    placeholder="Add a note or remark..."
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-amber-50 border-2 border-amber-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-500"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex-1 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-2.5 sm:py-2 rounded-xl transition font-bold shadow-md text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    {updateLoading ? (
                      <>
                        <CloudLoader size="20px" />
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateForm(false);
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 sm:py-2 rounded-xl transition font-bold shadow-md text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* First Delete Confirmation Modal */}
        {showDeleteConfirm && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 border-red-300">
              <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-red-100 to-red-200 rounded-full mx-auto mb-4">
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
              <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">
                Delete Member?
              </h2>
              <p className="text-gray-700 mb-2 text-center font-medium">
                Are you sure you want to delete{" "}
                <span className="font-bold text-red-700">
                  {selectedMember.name}
                </span>
                ?
              </p>
              <p className="text-gray-600 text-sm mb-6 text-center">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setShowSecondDeleteConfirm(true);
                  }}
                  className="flex-1 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2.5 rounded-xl transition font-bold shadow-md"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl transition font-bold shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Second Delete Confirmation Modal */}
        {showSecondDeleteConfirm && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border-4 border-red-500">
              <div className="flex items-center justify-center w-20 h-20 bg-linear-to-br from-red-600 to-red-700 rounded-full mx-auto mb-4">
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
              <h2 className="text-2xl font-bold text-red-800 mb-4 text-center">
                Final Confirmation
              </h2>
              <p className="text-gray-700 mb-2 text-center font-semibold">
                This is your last chance!
              </p>
              <p className="text-gray-600 text-sm mb-6 text-center">
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
                  className="flex-1 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-4 py-2.5 rounded-xl transition font-bold shadow-md"
                >
                  Permanently Delete
                </button>
                <button
                  onClick={() => {
                    setShowSecondDeleteConfirm(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl transition font-bold shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Club Settings Modal */}
        {showClubSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border-2 border-blue-500/30 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Club Settings</h2>
                </div>
                <button
                  onClick={() => setShowClubSettings(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Club Name */}
                <div>
                  <label className="text-gray-300 text-sm font-semibold mb-2 block">Club Name</label>
                  <input
                    type="text"
                    value={clubSettingsData.name}
                    onChange={(e) => setClubSettingsData({ ...clubSettingsData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-2xl text-white focus:outline-none focus:border-blue-500/70 focus:bg-slate-700/70 transition"
                    placeholder="Enter club name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-gray-300 text-sm font-semibold mb-2 block">Description</label>
                  <textarea
                    value={clubSettingsData.description}
                    onChange={(e) => setClubSettingsData({ ...clubSettingsData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-2xl text-white focus:outline-none focus:border-blue-500/70 focus:bg-slate-700/70 transition resize-none"
                    placeholder="Enter club description"
                    rows={4}
                  />
                </div>

                {/* Banner Image - URL or Upload */}
                <div>
                  <label className="text-gray-300 text-sm font-semibold mb-3 block">Banner Image</label>
                  
                  {/* Image Upload Tabs */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setClubSettingsData({ ...clubSettingsData, uploadMode: 'url' } as any)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                        (clubSettingsData as any).uploadMode !== 'upload'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setClubSettingsData({ ...clubSettingsData, uploadMode: 'upload' } as any)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                        (clubSettingsData as any).uploadMode === 'upload'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-2xl text-white focus:outline-none focus:border-blue-500/70 focus:bg-slate-700/70 transition"
                      placeholder="https://example.com/image.jpg"
                    />
                  )}

                  {/* File Upload Input */}
                  {(clubSettingsData as any).uploadMode === 'upload' && (
                    <div>
                      <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-blue-500/30 rounded-2xl hover:border-blue-500/70 hover:bg-slate-700/50 transition cursor-pointer bg-slate-700/30">
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <p className="text-gray-300 font-semibold">Drop image here or click to upload</p>
                          <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
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

                  <p className="text-gray-400 text-xs mt-2">Recommended size: 1200x400px or wider</p>
                  {clubSettingsData.imageUrl && (
                    <div className="mt-4">
                      <p className="text-gray-300 text-xs font-semibold mb-2">Preview:</p>
                      <div className="relative h-40 rounded-lg overflow-hidden border-2 border-blue-500/50 bg-slate-700/30 flex items-center justify-center">
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
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-700/50">
                            <p className="text-gray-400 text-sm">Loading image...</p>
                          </div>
                        )}
                      </div>
                      {imageLoadStatus === "loaded" && (
                        <p className="text-green-400 text-xs mt-2">✓ Image ready - Click "Save Changes" to apply</p>
                      )}
                      {imageLoadStatus === "error" && (
                        <p className="text-orange-400 text-xs mt-2">⚠ Preview issue but will still save</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSaveClubSettings}
                  disabled={savingSettings}
                  className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-2xl transition font-bold shadow-lg hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                >
                  {savingSettings ? (
                    <>
                      <CloudLoader />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowClubSettings(false)}
                  disabled={savingSettings}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-2xl transition font-bold shadow-md"
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
