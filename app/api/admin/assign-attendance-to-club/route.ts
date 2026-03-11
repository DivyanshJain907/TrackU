import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { Club } from "@/models/Club";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Endpoint to assign attendance records to a specific club
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);
    await connectDB();

    const body = await req.json();
    const { clubName } = body;

    if (!clubName) {
      return NextResponse.json(
        { error: "Club name is required" },
        { status: 400 }
      );
    }

    // Find the club by name
    const club = await Club.findOne({ name: clubName });
    if (!club) {
      return NextResponse.json(
        { error: `Club "${clubName}" not found` },
        { status: 404 }
      );
    }

    // Find all attendance records without a club
    const attendanceRecords = await Attendance.find({ club: { $exists: false } });

    if (attendanceRecords.length === 0) {
      return NextResponse.json({
        message: "No attendance records to update",
        updatedCount: 0,
      });
    }

    // Update all attendance records to associate with this club
    const updateResult = await Attendance.updateMany(
      { club: { $exists: false } },
      { $set: { club: club._id } }
    );

    return NextResponse.json({
      message: `Successfully assigned ${updateResult.modifiedCount} attendance records to "${clubName}" club`,
      club: {
        id: club._id,
        name: club.name,
      },
      updatedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error assigning attendance records:", error);
    return NextResponse.json(
      {
        error: "Failed to assign attendance records",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
