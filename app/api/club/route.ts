import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Club } from "@/models/Club";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's club
    const user = await User.findById(payload.userId);
    if (!user || !user.club) {
      return Response.json(
        { error: "User has no club" },
        { status: 404 }
      );
    }

    // Fetch club details
    const club = await Club.findById(user.club);
    if (!club) {
      return Response.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    return Response.json({
      id: club._id,
      name: club.name,
      description: club.description,
    });
  } catch (error) {
    console.error("Error fetching club info:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
