import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { TeamMember } from "@/models/TeamMember";
import { Club } from "@/models/Club";
import { Attendance } from "@/models/Attendance";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all statistics in parallel
    const [totalUsers, approvedUsers, pendingUsers, totalTeamMembers, totalClubs, totalAttendance] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: true }),
      User.countDocuments({ isApproved: false }),
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

    return Response.json({
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
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
