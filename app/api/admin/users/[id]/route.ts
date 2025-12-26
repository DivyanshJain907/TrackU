import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Club } from "@/models/Club";
import { TeamMember } from "@/models/TeamMember";
import { MemberFile } from "@/models/MemberFile";
import { MemberStatus } from "@/models/MemberStatus";
import { Attendance } from "@/models/Attendance";
import { AccessRequest } from "@/models/AccessRequest";
import { verifyToken, isAdmin } from "@/lib/auth";
import { addActivityLog } from "@/app/api/admin/activity/route";
import mongoose from "mongoose";

// Helper function to verify admin token
async function verifyAdminToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await User.findById(payload.userId);
  if (!user || !isAdmin(user.email)) {
    return null;
  }

  return payload.userId;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await verifyAdminToken(req);
    if (!adminUserId) {
      return Response.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const user = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error("Approve user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await verifyAdminToken(req);
    if (!adminUserId) {
      return Response.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Import activity logger
    const { addActivityLog } = require("@/app/api/admin/activity/route");

    // If user is a club leader, handle club deletion
    if (user.isClubLeader) {
      const club = await Club.findOne({ leader: id });
      if (club) {
        // Get all team members in this club to delete their related data
        const teamMembers = await TeamMember.find({ club: club._id });
        const memberIds = teamMembers.map((member) => member._id);

        // Delete member files and status records
        for (const member of teamMembers) {
          if (member.memberFile) {
            await MemberStatus.deleteMany({ member: member.memberFile });
            await MemberFile.findByIdAndDelete(member.memberFile);
          }
        }

        // Delete all team members
        await TeamMember.deleteMany({ club: club._id });

        // Delete attendance records
        await Attendance.deleteMany({ createdBy: id });

        // Get all users in this club
        const clubUsers = await User.find({ club: club._id });
        const clubUserIds = clubUsers.map((u) => u._id);

        // Reject pending access requests for club users
        await AccessRequest.updateMany(
          { user: { $in: clubUserIds }, status: "pending" },
          {
            status: "rejected",
            rejectionReason: "User account was deleted",
            reviewedAt: new Date(),
          }
        );

        // Delete all access requests for this user
        await AccessRequest.deleteMany({ user: id });

        // Delete all club users
        await User.deleteMany({ club: club._id });

        // Delete the club
        await Club.findByIdAndDelete(club._id);
      }
    } else {
      // User is not a club leader, just delete related data
      // Delete their created content
      await TeamMember.deleteMany({ createdBy: id });
      await Attendance.deleteMany({ createdBy: id });
      await AccessRequest.deleteMany({ user: id });
    }

    // Finally, delete the user
    await User.findByIdAndDelete(id);

    // Log activity
    const adminUser = await User.findById(adminUserId);
    addActivityLog(
      "delete",
      `User ${user.username} (${user.email}) was permanently deleted`,
      {
        _id: adminUserId,
        username: adminUser?.username || "Unknown",
      },
      {
        deletedUserId: id,
        deletedUsername: user.username,
        deletedEmail: user.email,
        wasClubLeader: user.isClubLeader,
      }
    );

    return Response.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
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
    const adminUserId = await verifyAdminToken(req);
    if (!adminUserId) {
      return Response.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const user = await User.findByIdAndUpdate(
      id,
      { email: body.email, phone: body.phone },
      { new: true }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Log activity
    const { addActivityLog } = require("@/app/api/admin/activity/route");
    const adminUser = await User.findById(adminUserId);
    addActivityLog(
      "update",
      `User ${user.username} information was updated`,
      {
        _id: adminUserId,
        username: adminUser?.username || "Unknown",
      },
      {
        targetUserId: id,
        targetUsername: user.username,
        changes: { email: body.email, phone: body.phone },
      }
    );

    return Response.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
