"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CloudLoader from "@/app/components/CloudLoader";

interface Settings {
  maintenanceMode: boolean;
  maxUsersPerClub: number;
  allowNewRegistrations: boolean;
  defaultUserRole: "member" | "leader";
  maxAttendanceRecordsDisplay: number;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    maintenanceMode: false,
    maxUsersPerClub: 50,
    allowNewRegistrations: true,
    defaultUserRole: "member",
    maxAttendanceRecordsDisplay: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, [router]);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        router.push("/dashboard");
        return;
      }

      loadSettings(token);
    } catch (err) {
      router.push("/dashboard");
    }
  };

  const loadSettings = async (token: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        // Use default settings if API not available
        console.log("Using default settings");
        setError("Failed to load settings from server, using defaults");
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Error loading settings: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        setError(`Failed to save settings: ${errorData.error || "Unknown error"}`);
        return;
      }

      const updatedSettings = await res.json();
      setSettings(updatedSettings);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`An error occurred: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4fff9] text-emerald-900 relative overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute -top-16 -left-20 h-96 w-96 rounded-full bg-[#c9ffe7] blur-3xl opacity-70" />
          <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-[#b9f4e0] blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-[#e5fff4] blur-3xl opacity-80" />
        </div>
        <div className="relative z-10 text-center">
          <CloudLoader />
          <p className="text-emerald-700 text-lg mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4fff9] text-emerald-900 overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-20 h-96 w-96 rounded-full bg-[#c9ffe7] blur-3xl opacity-70" />
        <div className="absolute top-24 right-0 h-80 w-80 rounded-full bg-[#b9f4e0] blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-[#e5fff4] blur-3xl opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Back Button */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 px-4 py-2 text-emerald-900 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 font-semibold shadow-sm"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Admin
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-emerald-900">System Settings</h1>
          <p className="text-emerald-700">Configure application settings</p>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
              {success}
            </div>
          )}

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Mode */}
            <div className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-xl p-6 hover:bg-emerald-50 transition-colors shadow-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-lg font-semibold text-emerald-900">Maintenance Mode</p>
                  <p className="text-sm text-emerald-600 mt-1">
                    Enable to prevent new user access
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.target.checked,
                    })
                  }
                  className="w-6 h-6 rounded accent-emerald-600"
                />
              </label>
            </div>

            {/* Allow New Registrations */}
            <div className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-xl p-6 hover:bg-emerald-50 transition-colors shadow-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-lg font-semibold text-emerald-900">
                    Allow New Registrations
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    Allow new users to sign up
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowNewRegistrations}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowNewRegistrations: e.target.checked,
                    })
                  }
                  className="w-6 h-6 rounded accent-emerald-600"
                />
              </label>
            </div>

            {/* Max Users Per Club */}
            <div className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-xl p-6 hover:bg-emerald-50 transition-colors shadow-sm">
              <label className="block">
                <p className="text-lg font-semibold text-emerald-900 mb-2">
                  Max Users Per Club
                </p>
                <p className="text-sm text-emerald-600 mb-4">
                  Maximum members allowed per club
                </p>
                <input
                  type="number"
                  min="1"
                  value={settings.maxUsersPerClub}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxUsersPerClub: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </label>
            </div>

            {/* Default User Role */}
            <div className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-xl p-6 hover:bg-emerald-50 transition-colors shadow-sm">
              <label className="block">
                <p className="text-lg font-semibold text-emerald-900 mb-2">
                  Default User Role
                </p>
                <p className="text-sm text-emerald-600 mb-4">
                  Role assigned to new members
                </p>
                <select
                  value={settings.defaultUserRole}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultUserRole: e.target.value as "member" | "leader",
                    })
                  }
                  className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="member">
                    Member
                  </option>
                  <option value="leader">
                    Leader
                  </option>
                </select>
              </label>
            </div>

            {/* Max Attendance Records */}
            <div className="bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-xl p-6 hover:bg-emerald-50 transition-colors lg:col-span-2 shadow-sm">
              <label className="block">
                <p className="text-lg font-semibold text-emerald-900 mb-2">
                  Max Attendance Records Display
                </p>
                <p className="text-sm text-emerald-600 mb-4">
                  Maximum records shown in attendance page
                </p>
                <input
                  type="number"
                  min="1"
                  value={settings.maxAttendanceRecordsDisplay}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxAttendanceRecordsDisplay: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 placeholder-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-2 bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={() =>
                setSettings({
                  maintenanceMode: false,
                  maxUsersPerClub: 50,
                  allowNewRegistrations: true,
                  defaultUserRole: "member",
                  maxAttendanceRecordsDisplay: 100,
                })
              }
              className="px-6 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
