"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
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
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
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

      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`An error occurred: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4 animate-spin">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"></div>
          </div>
          <p className="text-white text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">System Settings</h1>
            <p className="text-purple-200">Configure application settings</p>
          </div>
          <Link
            href="/admin"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 text-green-400">
            {success}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-6 space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-purple-500/10">
            <div>
              <h3 className="text-lg font-semibold text-white">Maintenance Mode</h3>
              <p className="text-gray-400 text-sm">Enable to temporarily disable the application</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMode: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          {/* Allow New Registrations */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-purple-500/10">
            <div>
              <h3 className="text-lg font-semibold text-white">Allow New Registrations</h3>
              <p className="text-gray-400 text-sm">Allow new users to register in the system</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowNewRegistrations}
                onChange={(e) =>
                  setSettings({ ...settings, allowNewRegistrations: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          {/* Max Users Per Club */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/10">
            <label className="block text-lg font-semibold text-white mb-2">
              Max Users Per Club
            </label>
            <p className="text-gray-400 text-sm mb-3">
              Maximum number of users allowed in a single club
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
              className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Default User Role */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/10">
            <label className="block text-lg font-semibold text-white mb-2">
              Default User Role
            </label>
            <p className="text-gray-400 text-sm mb-3">
              Default role assigned to new users
            </p>
            <select
              value={settings.defaultUserRole}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultUserRole: e.target.value as "member" | "leader",
                })
              }
              className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="member">Member</option>
              <option value="leader">Leader</option>
            </select>
          </div>

          {/* Max Attendance Records */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/10">
            <label className="block text-lg font-semibold text-white mb-2">
              Max Attendance Records Display
            </label>
            <p className="text-gray-400 text-sm mb-3">
              Maximum attendance records to display in reports
            </p>
            <input
              type="number"
              min="10"
              value={settings.maxAttendanceRecordsDisplay}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxAttendanceRecordsDisplay: parseInt(e.target.value) || 10,
                })
              }
              className="w-full px-4 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveSettings}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Save Settings
            </button>
            <button
              onClick={loadSettings}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Settings Information</h3>
          <p className="text-gray-300 text-sm">
            System settings control the behavior of the entire application. Changes take effect immediately for new operations. Existing sessions may need to refresh to see updates.
          </p>
        </div>
      </div>
    </div>
  );
}
