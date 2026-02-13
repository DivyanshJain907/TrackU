"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CloudLoader from "@/app/components/CloudLoader";

interface AccessRequest {
  _id: string;
  user: { _id: string; username: string; email: string; club?: { _id: string; name: string } };
  username: string;
  email: string;
  phone?: string;
  requestMessage: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewedBy?: { username: string };
}

export default function AdminAccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetchRequests();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/access-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch requests");
        return;
      }

      const data = await res.json();
      setRequests(data);
      setError("");
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/access-requests/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        alert("Failed to approve request");
        return;
      }

      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: "approved" } : req
        )
      );
    } catch (err) {
      alert("An error occurred");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/access-requests/${id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rejectionReason: reason }),
      });

      if (!res.ok) {
        alert("Failed to reject request");
        return;
      }

      setRequests((prev) =>
        prev.map((req) =>
          req._id === id
            ? {
                ...req,
                status: "rejected",
                rejectionReason: reason,
              }
            : req
        )
      );
    } catch (err) {
      alert("An error occurred");
    }
  };

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((req) => req.status === activeTab);

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
        <div className="min-h-screen px-3 sm:px-6 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push("/admin")}
              className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-linear-to-r from-purple-600/40 to-blue-600/40 border border-purple-500/50 rounded-lg hover:from-purple-600/60 hover:to-blue-600/60 hover:border-purple-500/70 transition-all duration-200 font-semibold shadow-lg hover:shadow-purple-500/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </button>

            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Access Requests</h1>
                <p className="text-gray-400 text-sm sm:text-base mt-1 sm:mt-2">Manage user access requests</p>
              </div>
              <button
                onClick={() => fetchRequests()}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600/20 border border-blue-500 hover:bg-blue-600/40 disabled:opacity-50 text-blue-400 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {refreshing ? (
                  <>
                    <CloudLoader size="20px" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 sm:gap-4 overflow-x-auto pb-2">
              {["all", "pending", "approved", "rejected"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 sm:px-4 py-2 text-sm sm:text-base font-medium rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <CloudLoader size="50px" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No {activeTab === "all" ? "requests" : `${activeTab} requests`} found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg sm:rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition"
                  >
                    {/* Status Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white">{request.username}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">{request.email}</p>
                      </div>
                      <span
                        className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          request.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : request.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 mb-4">
                      {request.user?.club?.name && (
                        <div>
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Club</p>
                          <p className="text-white text-sm font-medium">{request.user.club.name}</p>
                        </div>
                      )}

                      {request.phone && (
                        <div>
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Phone</p>
                          <a
                            href={`tel:${request.phone}`}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            {request.phone}
                          </a>
                        </div>
                      )}

                      <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Date</p>
                        <p className="text-gray-300 text-sm">
                          {new Date(request.createdAt).toLocaleDateString()} {new Date(request.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {request.requestMessage && (
                        <div>
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Message</p>
                          <p className="text-gray-300 text-sm line-clamp-2">{request.requestMessage}</p>
                        </div>
                      )}

                      {request.status === "rejected" && request.rejectionReason && (
                        <div>
                          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Rejection Reason</p>
                          <p className="text-red-400 text-sm">{request.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="flex-1 px-3 py-2 bg-green-600/20 border border-green-500 hover:bg-green-600/40 text-green-400 text-sm font-medium rounded-lg transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="flex-1 px-3 py-2 bg-red-600/20 border border-red-500 hover:bg-red-600/40 text-red-400 text-sm font-medium rounded-lg transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
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
