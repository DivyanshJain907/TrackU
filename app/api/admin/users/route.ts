import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL;

    // Fetch all users except the admin user
    const users = await User.find({ email: { $ne: adminEmail } })
      .populate("club", "name")
      .lean()
      .sort({ createdAt: -1 });
    
    return Response.json(users || []);
  } catch (error) {
    console.error("Fetch users error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
