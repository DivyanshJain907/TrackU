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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3fff9] flex items-center justify-center p-4">
        <div className="rounded-2xl border border-[#d7e9e1] bg-white px-8 py-6 text-[#1d2623] shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          Checking request status...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3fff9] flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl border p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)] ${isRejected ? "border-red-200 bg-red-50/40" : "border-[#d7e9e1] bg-white"}`}>
        <div className="mb-6">
          <div className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${isRejected ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
            {isRejected ? "Access Denied" : "Pending Review"}
          </div>
        </div>

        <h1 className={`mb-4 text-2xl font-bold ${isRejected ? "text-red-900" : "text-[#1d2623]"}`}>
          {isRejected ? "Access Request Rejected" : "Access Pending Approval"}
        </h1>

        <p className={`mb-6 ${isRejected ? "text-red-700" : "text-[#5f6a66]"}`}>
          {isRejected 
            ? "Unfortunately, your access request has been declined." 
            : "Thank you for registering! Your access request is currently being reviewed by our administrator."}
        </p>

        <div className={`mb-8 rounded-xl border p-4 ${isRejected ? "border-red-200 bg-red-50" : "border-[#bde6d6] bg-[#f1fff8]"}`}>
          <p className={`text-sm ${isRejected ? "text-red-900" : "text-blue-900"}`}>
            <span className="font-semibold">Status:</span> {isRejected ? "Rejected" : "Awaiting Admin Review"}
          </p>
          <p className={`mt-2 text-sm ${isRejected ? "text-red-900" : "text-[#1d5a49]"}`}>
            {isRejected 
              ? accessRequest?.rejectionReason || "You have been found suspicious and are banned for now."
              : "An admin will review your request and approve your access shortly."}
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-[#d7e9e1] bg-[#f8fffb] p-4">
          <p className="mb-3 text-sm text-[#5f6a66]">
            <span className="font-semibold">{isRejected ? "For More Information:" : "Need Help?"}</span>
          </p>
          <div className="space-y-2">
            <p className="text-sm text-[#5f6a66]">
              <span className="font-semibold">Administrator:</span> Divyansh Jain
            </p>
            <p className="text-sm text-[#5f6a66]">
              <span className="font-semibold">Email:</span>{" "}
              <a
                href={`mailto:divyanshjain883@gmail.com`}
                className="text-[#319b7a] hover:underline"
              >
                divyanshjain883@gmail.com
              </a>
            </p>
            <p className="text-sm text-[#5f6a66]">
              <span className="font-semibold">Contact:</span>{" "}
              <a
                href="tel:9761854883"
                className="text-[#319b7a] hover:underline"
              >
                +91 9761854883
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${isRejected ? "bg-red-600 hover:bg-red-700 hover:shadow-red-500/30" : "bg-[#49c89f] hover:bg-[#3fb18d] hover:shadow-[#49c89f]/30"}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isRejected ? "Return to Login" : "Return to Login"}
        </button>
      </div>
    </div>
  );
}
