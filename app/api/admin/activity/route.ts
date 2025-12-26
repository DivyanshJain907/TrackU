import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, isAdmin } from "@/lib/auth";
import mongoose from "mongoose";

// Simple in-memory activity log storage for now
const activityLogs: Array<{
  _id: string;
  action: string;
  description: string;
  performedBy: { _id: string; username: string };
  timestamp: string;
  details?: Record<string, any>;
}> = [];

// Function to add logs (exported for other APIs)
export function addActivityLog(
  action: string,
  description: string,
  performedBy: { _id: string; username: string },
  details?: Record<string, any>
) {
  const log = {
    _id: new mongoose.Types.ObjectId().toString(),
    action,
    description,
    performedBy,
    timestamp: new Date().toISOString(),
    details,
  };
  activityLogs.push(log);
  // Keep only last 1000 logs to avoid memory overflow
  if (activityLogs.length > 1000) {
    activityLogs.shift();
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the token
    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findById(payload.userId);
    if (!user || !isAdmin(user.email)) {
      return Response.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Return activity logs sorted by timestamp (newest first)
    const sortedLogs = [...activityLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return Response.json(sortedLogs);
  } catch (error) {
    console.error("Fetch activity logs error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
