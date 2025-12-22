import { connectDB } from "@/lib/db";
import { Club } from "@/models/Club";
import { User } from "@/models/User";
import { TeamMember } from "@/models/TeamMember";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid club ID" }, { status: 400 });
    }

    await connectDB();

    // Find the club first
    const club = await Club.findById(id);

    if (!club) {
      console.error(`Club not found with ID: ${id}`);
      return Response.json({ error: "Club not found" }, { status: 404 });
    }

    // Get all users associated with this club
    const clubUsers = await User.find({ club: id });
    const clubUserIds = clubUsers.map((user) => user._id);

    // Delete all team members of this club
    await TeamMember.deleteMany({ club: id });

    // Delete all attendance records for team members in this club
    await Attendance.deleteMany({ member: { $in: clubUserIds } });

    // Delete all users of this club
    await User.deleteMany({ club: id });

    // Delete the club leader's reference to club
    if (club.leader) {
      await User.findByIdAndUpdate(club.leader, { club: null });
    }

    // Delete the club itself
    await Club.findByIdAndDelete(id);

    return Response.json({ 
      message: "Club and all associated data deleted successfully",
      deletedUsers: clubUserIds.length
    });
  } catch (error) {
    console.error("Delete club error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid club ID" }, { status: 400 });
    }

    await connectDB();

    const club = await Club.findByIdAndUpdate(
      id,
      { name: body.name, description: body.description },
      { new: true }
    );

    if (!club) {
      return Response.json({ error: "Club not found" }, { status: 404 });
    }

    return Response.json(club);
  } catch (error) {
    console.error("Update club error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
