import { connectDB } from "@/lib/db";
import { Club } from "@/models/Club";
import { User } from "@/models/User";
import { verifyToken, isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the token
    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findById(payload.userId);
    if (!user || !isAdmin(user.email)) {
      return Response.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const clubs = await Club.find()
      .populate("leader", "username email")
      .lean()
      .sort({ createdAt: -1 });

    return Response.json(clubs || []);
  } catch (error) {
    console.error("Fetch clubs error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
