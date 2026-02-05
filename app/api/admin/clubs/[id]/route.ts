import { connectDB } from "@/lib/db";
import { Club } from "@/models/Club";
import { User } from "@/models/User";
import { TeamMember } from "@/models/TeamMember";
import { Attendance } from "@/models/Attendance";
import { AccessRequest } from "@/models/AccessRequest";
import { MemberFile } from "@/models/MemberFile";
import { MemberStatus } from "@/models/MemberStatus";
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

    // Get all team members of this club
    const teamMembers = await TeamMember.find({ club: id });

    // Delete all member files and their status records
    for (const member of teamMembers) {
      if (member.memberFile) {
        await MemberStatus.deleteMany({ member: member.memberFile });
        await MemberFile.findByIdAndDelete(member.memberFile);
      }
    }

    // Delete all team members of this club
    await TeamMember.deleteMany({ club: id });

    // Delete all attendance records created by users in this club
    await Attendance.deleteMany({ createdBy: { $in: clubUserIds } });

    // Also delete attendance records that reference members of this club
    await Attendance.updateMany(
      { "attendees.memberId": { $in: teamMembers.map((m) => m._id) } },
      { $pull: { attendees: { memberId: { $in: teamMembers.map((m) => m._id) } } } }
    );

    // Delete any empty attendance records
    await Attendance.deleteMany({ attendees: { $size: 0 } });

    // Reject all pending access requests for users in this club
    await AccessRequest.updateMany(
      { user: { $in: clubUserIds }, status: "pending" },
      {
        status: "rejected",
        rejectionReason: "Club was deleted",
        reviewedAt: new Date(),
      }
    );

    // Delete all access requests related to club users
    await AccessRequest.deleteMany({ user: { $in: clubUserIds } });

    // Delete all users of this club
    await User.deleteMany({ club: id });

    // Delete the club leader's reference to club (in case they're not deleted)
    if (club.leader) {
      await User.findByIdAndUpdate(club.leader, { 
        club: null,
        isClubLeader: false
      });
    }

    // Delete the club itself
    await Club.findByIdAndDelete(id);

    return Response.json({
      message: "Club and all associated data deleted successfully",
      deletedUsers: clubUserIds.length,
      deletedMembers: teamMembers.length,
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
      { name: body.name, description: body.description, imageUrl: body.imageUrl },
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
