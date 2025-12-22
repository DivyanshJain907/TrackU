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
    <div className={`min-h-screen flex items-center justify-center p-4 ${isRejected ? "bg-red-50" : "bg-blue-50 to-indigo-100"}`}>
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
          className={`w-full font-semibold py-2 px-4 rounded-lg transition duration-200 text-white ${isRejected ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {isRejected ? "Return to Login" : "Return to Login"}
        </button>
      </div>
    </div>
  );
}
