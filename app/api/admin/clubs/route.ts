import { connectDB } from "@/lib/db";
import { Club } from "@/models/Club";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const clubs = await Club.find()
      .populate("leader", "username email")
      .sort({ createdAt: -1 });

    return Response.json(clubs);
  } catch (error) {
    console.error("Fetch clubs error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
