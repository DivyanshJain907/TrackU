import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { TeamMember } from "@/models/TeamMember";
import { Club } from "@/models/Club";
import { Attendance } from "@/models/Attendance";
import { verifyToken, isAdmin } from "@/lib/auth";

// In-memory cache with TTL (since Redis isn't installed, using in-memory cache)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY = "admin_stats";

function getCachedStats() {
  const cached = cache.get(CACHE_KEY);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(CACHE_KEY);
  return null;
}

function setCachedStats(data: any) {
  cache.set(CACHE_KEY, { data, timestamp: Date.now() });
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
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !isAdmin(currentUser.email)) {
      return Response.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Try to get from cache first
    const cachedStats = getCachedStats();
    if (cachedStats) {
      return Response.json(cachedStats, {
        headers: {
          "Cache-Control": "public, max-age=300",
          "X-Cache": "HIT",
        },
      });
    }

    // Get admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL;

    // Fetch all statistics in parallel, excluding admin user
    const [totalUsers, approvedUsers, pendingUsers, totalTeamMembers, totalClubs, totalAttendance] = await Promise.all([
      User.countDocuments({ email: { $ne: adminEmail } }),
      User.countDocuments({ email: { $ne: adminEmail }, isApproved: true }),
      User.countDocuments({ email: { $ne: adminEmail }, isApproved: false }),
      TeamMember.countDocuments(),
      Club.countDocuments(),
      Attendance.countDocuments(),
    ]);

    // Calculate attendance stats
    const [presentCount, absentCount, excusedCount] = await Promise.all([
      Attendance.countDocuments({ status: "present" }),
      Attendance.countDocuments({ status: "absent" }),
      Attendance.countDocuments({ status: "excused" }),
    ]);

    const attendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0;

    const statsData = {
      users: {
        total: totalUsers,
        approved: approvedUsers,
        pending: pendingUsers,
      },
      teamMembers: totalTeamMembers,
      clubs: totalClubs,
      attendance: {
        total: totalAttendance,
        present: presentCount,
        absent: absentCount,
        excused: excusedCount,
        rate: attendanceRate,
      },
    };

    // Cache the stats
    setCachedStats(statsData);

    return Response.json(statsData, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
