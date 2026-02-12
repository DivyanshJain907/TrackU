import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
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

    // Get current user's club
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !currentUser.club) {
      return Response.json(
        { error: "User has no club" },
        { status: 404 }
      );
    }

    // Fetch all users in the same club
    const clubMembers = await User.find({ club: currentUser.club })
      .select("username email isClubLeader isApproved createdAt")
      .sort({ isClubLeader: -1, createdAt: 1 })
      .lean();

    return Response.json({
      members: clubMembers.map(member => ({
        id: member._id,
        username: member.username,
        email: member.email,
        isClubLeader: member.isClubLeader,
        isApproved: member.isApproved,
        joinedAt: member.createdAt,
      })),
      totalMembers: clubMembers.length,
    });
  } catch (error) {
    console.error("Error fetching club members:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
