import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { TeamMember } from "@/models/TeamMember";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET all attendance records
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    jwt.verify(token, JWT_SECRET);
    await connectDB();

    const attendance = await Attendance.find()
      .populate("createdBy", "username email")
      .populate("lastUpdatedBy", "username email")
      .sort({ meetingDate: -1 });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

// POST create new attendance record
export async function POST(req: NextRequest) {
  try {
    console.log("=== Attendance POST Request Started ===");
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log("No token provided");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Verifying JWT token...");
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log("Token verified, userId:", decoded.userId);

    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected");

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const {
      meetingTitle,
      meetingDate,
      meetingType,
      duration,
      location,
      description,
      attendees,
    } = body;

    if (!meetingTitle || !meetingDate) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Meeting title and date are required" },
        { status: 400 }
      );
    }

    console.log("Creating attendance record...");
    const attendance = new Attendance({
      meetingTitle,
      meetingDate,
      meetingType,
      duration,
      location,
      description,
      attendees,
      createdBy: decoded.userId,
      lastUpdatedBy: decoded.userId,
    });

    console.log("Saving to database...");
    await attendance.save();
    console.log("Saved successfully");

    await attendance.populate("createdBy", "username email");

    console.log("=== Attendance POST Request Completed ===");
    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("=== Error creating attendance ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        error: "Failed to create attendance record",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
