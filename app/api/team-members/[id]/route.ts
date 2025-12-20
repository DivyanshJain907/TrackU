import { connectDB } from "@/lib/db";
import { TeamMember } from "@/models/TeamMember";
import { MemberFile } from "@/models/MemberFile";
import { MemberStatus } from "@/models/MemberStatus";
import jwt from "jsonwebtoken";

function verifyToken(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const userId = verifyToken(req);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { points, hours, remark, date } = await req.json();

    const member = await TeamMember.findOne({ _id: id });
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    // Get username of the person making the update
    const User = (await import("@/models/User")).User;
    const updatingUser = await User.findById(userId);
    const updaterName = updatingUser?.username || "Unknown";

    if (points !== undefined) {
      member.points = points;
    }
    if (hours !== undefined) {
      member.hours = hours;
    }
    if (remark) {
      // ensure remarks is an array (defensive in case of malformed documents)
      if (!Array.isArray((member as any).remarks)) {
        (member as any).remarks = [];
      }
      const remarkEntry: any = {
        text: `${remark} (Updated by: ${updaterName})`,
      };
      // If a custom date is provided, use it; otherwise Mongoose will use default Date.now
      if (date) {
        remarkEntry.date = new Date(date);
      }
      (member as any).remarks.push(remarkEntry);
    }

    // Track who last updated this member
    (member as any).lastUpdatedBy = userId;
    await member.save();

    // Populate user data before returning
    await member.populate("createdBy", "username email");
    await member.populate("lastUpdatedBy", "username email");

    // Also record a status history entry linked to the MemberFile if available
    try {
      if (member.memberFile) {
        const status = new MemberStatus({
          member: member.memberFile,
          points: member.points,
          hours: member.hours,
          remark: remark || undefined,
          recordedBy: userId,
        });
        await status.save();
      }
    } catch (e) {
      console.error("Failed to save member status entry:", e);
    }
    return Response.json(member);
  } catch (error) {
    console.error("Error updating member:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const userId = verifyToken(req);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, enrollmentNumber, position } = await req.json();

    const member = await TeamMember.findOne({ _id: id });
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    // Update basic info
    if (name) {
      member.name = name;
    }
    if (enrollmentNumber) {
      member.enrollmentNumber = enrollmentNumber;
    }
    // Always update position if provided (even if empty string)
    if (position !== undefined) {
      (member as any).position = position;
    }

    // Track who last updated this member
    (member as any).lastUpdatedBy = userId;
    await member.save();

    // Also update the MemberFile if position was provided
    if (position !== undefined && member.memberFile) {
      await MemberFile.findByIdAndUpdate(
        member.memberFile,
        { position },
        { new: true }
      );
    }

    // Populate user data before returning
    await member.populate("createdBy", "username email");
    await member.populate("lastUpdatedBy", "username email");

    return Response.json(member);
  } catch (error) {
    console.error("Error editing member:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const userId = verifyToken(req);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await TeamMember.findById(id);
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    // Delete associated records
    const memberFileId = member.memberFile;

    // Delete all status entries
    await MemberStatus.deleteMany({ member: memberFileId });

    // Delete the member file
    await MemberFile.findByIdAndDelete(memberFileId);

    // Delete the team member snapshot
    await TeamMember.findByIdAndDelete(id);

    return Response.json(
      { message: "Member deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting member:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
