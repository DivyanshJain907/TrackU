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

    // Verify admin access (you'd need to decode the token and check)
    const users = await User.find().populate("club", "name");
    
    return Response.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
