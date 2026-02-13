import { connectDB } from "@/lib/db";
import { TeamMember } from "@/models/TeamMember";
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

// GET update history for a member
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Fetching update history for member ID:", id);
    
    await connectDB();
    console.log("Database connected");
    
    const userId = verifyToken(req);
    console.log("User ID from token:", userId);
    
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Finding member by ID...");
    const member = await TeamMember.findById(id);
    
    if (!member) {
      console.log("Member not found");
      return Response.json({ error: "Member not found" }, { status: 404 });
    }
    
    console.log("Member found:", member.name);
    console.log("Member has updateHistory:", !!(member as any).updateHistory);
    console.log("updateHistory length:", ((member as any).updateHistory || []).length);

    // Get update history, default to empty array if not exists
    const updateHistory = (member as any).updateHistory || [];
    
    // Try to populate only if there are entries
    if (updateHistory.length > 0) {
      console.log("Attempting to populate addedBy...");
      await member.populate("updateHistory.addedBy", "username email");
    }
    
    // Sort by most recent first
    const sortedHistory = [...updateHistory].sort((a: any, b: any) => {
      const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return dateB - dateA;
    });

    console.log("Returning sorted history, count:", sortedHistory.length);
    return Response.json({ updateHistory: sortedHistory });
  } catch (error) {
    console.error("Error fetching update history:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return Response.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// DELETE a specific update from history
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const updateId = searchParams.get("updateId");

    if (!updateId) {
      return Response.json({ error: "Update ID required" }, { status: 400 });
    }

    await connectDB();
    const userId = verifyToken(req);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await TeamMember.findById(id);
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    const updateHistory = (member as any).updateHistory || [];
    const updateIndex = updateHistory.findIndex(
      (u: any) => u._id.toString() === updateId
    );

    if (updateIndex === -1) {
      return Response.json({ error: "Update not found" }, { status: 404 });
    }

    // Get the update entry before removing
    const removedUpdate = updateHistory[updateIndex];

    // Remove the update from history
    updateHistory.splice(updateIndex, 1);

    // Recalculate total points and hours from remaining history
    let totalPoints = 0;
    let totalHours = 0;
    
    updateHistory.forEach((update: any) => {
      totalPoints += update.points || 0;
      totalHours += update.hours || 0;
    });

    // Update member totals
    member.points = totalPoints;
    member.hours = totalHours;

    // Remove the corresponding remark if it exists
    const remarkToRemove = `${removedUpdate.remark} (Updated by:`;
    (member as any).remarks = ((member as any).remarks || []).filter(
      (r: any) => !r.text.startsWith(remarkToRemove) || 
      new Date(r.date).getTime() !== new Date(removedUpdate.date).getTime()
    );

    (member as any).lastUpdatedBy = userId;
    await member.save();

    // Populate user data before returning
    await member.populate("createdBy", "username email");
    await member.populate("lastUpdatedBy", "username email");
    await member.populate("updateHistory.addedBy", "username email");

    return Response.json({ 
      message: "Update deleted successfully",
      member 
    });
  } catch (error) {
    console.error("Error deleting update:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
