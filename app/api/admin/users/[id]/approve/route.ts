import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, isAdmin } from "@/lib/auth";
import { addActivityLog } from "@/app/api/admin/activity/route";

// Helper function to verify admin token
async function verifyAdminToken(req: Request): Promise<{ userId: string; user: any } | null> {
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

  return { userId: payload.userId, user };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminData = await verifyAdminToken(req);
    if (!adminData) {
      return Response.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const targetUser = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Log activity
    addActivityLog(
      "approve",
      `User ${targetUser.username} (${targetUser.email}) was approved`,
      {
        _id: adminData.userId,
        username: adminData.user.username,
      },
      {
        targetUserId: id,
        targetUsername: targetUser.username,
        targetEmail: targetUser.email,
      }
    );

    return Response.json(targetUser);
  } catch (error) {
    console.error("Approve user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
