import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Find user and check if they're admin
    const user = await User.findById(payload.userId).lean();
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    if (!isAdmin(user.email)) {
      return Response.json(
        { error: "Admin access only" },
        { status: 403 }
      );
    }

    return Response.json(
      { message: "Admin verified", isAdmin: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin verification error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
