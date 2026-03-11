import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET single attendance record
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    await connectDB();

    // Import User model to verify club access
    const { User } = await import("@/models/User");
    const user = await User.findById(decoded.userId);
    if (!user || !user.club) {
      return NextResponse.json({ error: "User not associated with a club" }, { status: 403 });
    }

    const { id } = await params;
    const attendance = await Attendance.findById(id)
      .populate("createdBy", "username email")
      .populate("lastUpdatedBy", "username email");

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    // Verify attendance belongs to user's club
    if (attendance.club.toString() !== user.club.toString()) {
      return NextResponse.json(
        { error: "Access denied - attendance record is from another club" },
        { status: 403 }
      );
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance record" },
      { status: 500 }
    );
  }
}

// PUT update attendance record
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    await connectDB();

    // Import User model to verify club access
    const { User } = await import("@/models/User");
    const user = await User.findById(decoded.userId);
    if (!user || !user.club) {
      return NextResponse.json({ error: "User not associated with a club" }, { status: 403 });
    }

    const { id } = await params;

    // Check if attendance belongs to user's club BEFORE updating
    const existingAttendance = await Attendance.findById(id);
    if (!existingAttendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    if (existingAttendance.club.toString() !== user.club.toString()) {
      return NextResponse.json(
        { error: "Access denied - attendance record is from another club" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      meetingTitle,
      meetingDate,
      meetingType,
      duration,
      location,
      description,
      attendees,
    } = body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      {
        meetingTitle,
        meetingDate,
        meetingType,
        duration,
        location,
        description,
        attendees,
        lastUpdatedBy: decoded.userId,
      },
      { new: true }
    )
      .populate("createdBy", "username email")
      .populate("lastUpdatedBy", "username email");

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance record" },
      { status: 500 }
    );
  }
}

// DELETE attendance record
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    await connectDB();

    // Import User model to verify club access
    const { User } = await import("@/models/User");
    const user = await User.findById(decoded.userId);
    if (!user || !user.club) {
      return NextResponse.json({ error: "User not associated with a club" }, { status: 403 });
    }

    const { id } = await params;

    // Check if attendance belongs to user's club BEFORE deleting
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    if (attendance.club.toString() !== user.club.toString()) {
      return NextResponse.json(
        { error: "Access denied - attendance record is from another club" },
        { status: 403 }
      );
    }

    await Attendance.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance record" },
      { status: 500 }
    );
  }
}
