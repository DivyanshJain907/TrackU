"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

interface AccessRequest {
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export default function PendingApprovalPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchAccessRequest();
  }, []);

  const fetchAccessRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        console.log("No token or userId");
        return;
      }

      const res = await fetch(`/api/admin/access-requests?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Access requests data:", data);
        
        if (Array.isArray(data) && data.length > 0) {
          // Get the most recent request
          const userRequest = data[0];
          console.log("Found request:", userRequest);
          setAccessRequest(userRequest);
        } else {
          console.log("No requests found");
        }
      } else {
        console.log("API error:", res.status);
      }
    } catch (err) {
      console.error("Error fetching access request:", err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh status every 3 seconds
  useEffect(() => {
    if (!mounted) return;
    
    fetchAccessRequest();
    
    // Set up interval to refresh status
    const interval = setInterval(() => {
      fetchAccessRequest();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isClubLeader");
    localStorage.removeItem("isApproved");
    router.push("/");
  };

  const isRejected = accessRequest?.status === "rejected";

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-black to-purple-950"></div>
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
      <div className="relative z-10">
      <div className={`rounded-lg shadow-lg p-8 max-w-md w-full text-center ${isRejected ? "bg-white border-2 border-red-200" : "bg-white"}`}>
        <div className="mb-6">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${isRejected ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
            {isRejected ? "Access Denied" : "Pending Review"}
          </div>
        </div>

        <h1 className={`text-2xl font-bold mb-4 ${isRejected ? "text-red-900" : "text-gray-900"}`}>
          {isRejected ? "Access Request Rejected" : "Access Pending Approval"}
        </h1>

        <p className={`mb-6 ${isRejected ? "text-red-700" : "text-gray-600"}`}>
          {isRejected 
            ? "Unfortunately, your access request has been declined." 
            : "Thank you for registering! Your access request is currently being reviewed by our administrator."}
        </p>

        <div className={`rounded-lg p-4 mb-8 ${isRejected ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}>
          <p className={`text-sm ${isRejected ? "text-red-900" : "text-blue-900"}`}>
            <span className="font-semibold">Status:</span> {isRejected ? "Rejected" : "Awaiting Admin Review"}
          </p>
          <p className={`text-sm mt-2 ${isRejected ? "text-red-900" : "text-blue-900"}`}>
            {isRejected 
              ? accessRequest?.rejectionReason || "You have been found suspicious and are banned for now."
              : "An admin will review your request and approve your access shortly."}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-semibold">{isRejected ? "For More Information:" : "Need Help?"}</span>
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Administrator:</span> Divyansh Jain
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Email:</span>{" "}
              <a
                href={`mailto:divyanshjain883@gmail.com`}
                className="text-blue-600 hover:underline"
              >
                divyanshjain883@gmail.com
              </a>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Contact:</span>{" "}
              <a
                href="tel:9761854883"
                className="text-blue-600 hover:underline"
              >
                +91 9761854883
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={`w-full font-semibold py-3 px-4 rounded-xl transition duration-200 text-white flex items-center justify-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5 ${isRejected ? "bg-red-600 hover:bg-red-700 hover:shadow-red-500/30" : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30"}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isRejected ? "Return to Login" : "Return to Login"}
        </button>
      </div>
      </div>
    </div>
  );
}
