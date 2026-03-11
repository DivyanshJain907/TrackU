import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { User } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Migration endpoint to update attendance records with club field
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    await connectDB();

    // Verify user is an admin or super admin
    const user = await User.findById(decoded.userId);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Find all attendance records without a club field
    const attendanceRecords = await Attendance.find({ club: { $exists: false } });

    if (attendanceRecords.length === 0) {
      return NextResponse.json({
        message: "No attendance records to migrate",
        migratedCount: 0,
      });
    }

    let migratedCount = 0;

    // Update each attendance record with the creator's club
    for (const record of attendanceRecords) {
      const createdByUser = await User.findById(record.createdBy);
      if (createdByUser && createdByUser.club) {
        record.club = createdByUser.club;
        await record.save();
        migratedCount++;
      }
    }

    return NextResponse.json({
      message: `Successfully migrated ${migratedCount} attendance records`,
      migratedCount,
      totalRecords: attendanceRecords.length,
    });
  } catch (error) {
    console.error("Error migrating attendance records:", error);
    return NextResponse.json(
      {
        error: "Failed to migrate attendance records",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
