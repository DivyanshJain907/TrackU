import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { Club } from "@/models/Club";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Diagnostic endpoint to check clubs and attendance records
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);
    await connectDB();

    // Get all clubs
    const clubs = await Club.find().select("_id name");

    // Get all attendance records without club field
    const attendanceWithoutClub = await Attendance.find({ club: { $exists: false } }).select("_id meetingTitle createdBy");

    // Get all attendance records with club field
    const attendanceWithClub = await Attendance.find({ club: { $exists: true } }).select("_id meetingTitle club");

    return NextResponse.json({
      clubs: clubs.map(c => ({ id: c._id.toString(), name: c.name })),
      attendanceRecordsWithoutClub: attendanceWithoutClub.length,
      attendanceRecordsWithClub: attendanceWithClub.length,
      attendanceWithoutClubDetails: attendanceWithoutClub.map(a => ({
        id: a._id.toString(),
        title: a.meetingTitle,
      })),
    });
  } catch (error) {
    console.error("Error fetching diagnostic info:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch diagnostic info",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
