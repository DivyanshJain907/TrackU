"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 animate-spin">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
          </div>
          <p className="text-white text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Galaxy Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-black to-purple-950"></div>

        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-70"
            style={{
              width: Math.random() * 2 + "px",
              height: Math.random() * 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              animationDelay: Math.random() * 2 + "s",
            }}
          ></div>
        ))}

        {/* Floating Color Blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-32 right-1/3 w-96 h-96 bg-pink-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Back Button */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
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
          <h1 className="text-4xl font-bold mb-2">System Settings</h1>
          <p className="text-gray-400">Configure application settings</p>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200">
              {success}
            </div>
          )}

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Mode */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-lg font-semibold text-white">Maintenance Mode</p>
                  <p className="text-sm text-gray-400 mt-1">
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
                  className="w-6 h-6 rounded accent-blue-500"
                />
              </label>
            </div>

            {/* Allow New Registrations */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-lg font-semibold text-white">
                    Allow New Registrations
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
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
                  className="w-6 h-6 rounded accent-blue-500"
                />
              </label>
            </div>

            {/* Max Users Per Club */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors">
              <label className="block">
                <p className="text-lg font-semibold text-white mb-2">
                  Max Users Per Club
                </p>
                <p className="text-sm text-gray-400 mb-4">
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
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </label>
            </div>

            {/* Default User Role */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors">
              <label className="block">
                <p className="text-lg font-semibold text-white mb-2">
                  Default User Role
                </p>
                <p className="text-sm text-gray-400 mb-4">
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
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="member" className="bg-slate-900">
                    Member
                  </option>
                  <option value="leader" className="bg-slate-900">
                    Leader
                  </option>
                </select>
              </label>
            </div>

            {/* Max Attendance Records */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors lg:col-span-2">
              <label className="block">
                <p className="text-lg font-semibold text-white mb-2">
                  Max Attendance Records Display
                </p>
                <p className="text-sm text-gray-400 mb-4">
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
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
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
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
