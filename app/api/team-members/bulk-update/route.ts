import { connectDB } from "@/lib/db";
import { TeamMember } from "@/models/TeamMember";
import { MemberStatus } from "@/models/MemberStatus";
import { User } from "@/models/User";
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

export async function POST(req: Request) {
  try {
    await connectDB();
    const userId = verifyToken(req);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberIds, points, hours, remark, date } = await req.json();

    // Validate input
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return Response.json(
        { error: "Invalid memberIds array" },
        { status: 400 }
      );
    }

    if (points === undefined && hours === undefined) {
      return Response.json(
        { error: "At least points or hours must be provided" },
        { status: 400 }
      );
    }

    // Get username of the person making the update
    const updatingUser = await User.findById(userId);
    const updaterName = updatingUser?.username || "Unknown";

    const updatedMembers = [];
    const errors = [];

    // Update each member
    for (const memberId of memberIds) {
      try {
        const member = await TeamMember.findOne({ _id: memberId });
        if (!member) {
          errors.push(`Member ${memberId} not found`);
          continue;
        }

        // Prepare update history entry
        const updateEntry: any = {
          points: points || 0,
          hours: hours || 0,
          remark: remark || "",
          date: date ? new Date(date) : new Date(),
          addedBy: userId,
          addedAt: new Date(),
        };

        // Add to update history
        if (!Array.isArray((member as any).updateHistory)) {
          (member as any).updateHistory = [];
        }
        (member as any).updateHistory.push(updateEntry);

        // Add incremental values to totals
        if (points !== undefined) {
          member.points = member.points + points;
        }
        if (hours !== undefined) {
          member.hours = member.hours + hours;
        }

        // Add remark
        if (remark) {
          if (!Array.isArray((member as any).remarks)) {
            (member as any).remarks = [];
          }
          const remarkEntry: any = {
            text: `${remark} (Updated by: ${updaterName})`,
          };
          if (date) {
            remarkEntry.date = new Date(date);
          }
          (member as any).remarks.push(remarkEntry);
        }

        // Track who last updated this member
        (member as any).lastUpdatedBy = userId;
        await member.save();

        // Populate user data before adding to response
        await member.populate("createdBy", "username email");
        await member.populate("lastUpdatedBy", "username email");

        // Record a status history entry
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

        updatedMembers.push(member);
      } catch (error) {
        console.error(`Error updating member ${memberId}:`, error);
        errors.push(`Failed to update member ${memberId}`);
      }
    }

    return Response.json({
      success: true,
      updatedCount: updatedMembers.length,
      failedCount: errors.length,
      updatedMembers,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
