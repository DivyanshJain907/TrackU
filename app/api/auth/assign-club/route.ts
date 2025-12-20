import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Club } from "@/models/Club";
import { verifyToken } from "@/lib/auth";

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

    // Get user
    const user = await User.findById(payload.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a club
    if (user.club) {
      return Response.json(
        {
          message: "User already has a club assigned",
          clubId: user.club,
        },
        { status: 200 }
      );
    }

    // Check if a personal club already exists for this user
    let club = await Club.findOne({ leader: user._id });

    if (!club) {
      // Create a new personal club
      club = new Club({
        name: `${user.username}'s Club`,
        description: `Personal club for ${user.username}`,
        leader: user._id,
      });
      await club.save();
    }

    // Assign club to user
    user.club = club._id;
    await user.save();

    return Response.json(
      {
        message: "Club assigned successfully",
        clubId: club._id,
        clubName: club.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Assign club error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
