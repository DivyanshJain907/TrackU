import { connectDB } from "@/lib/db";
import { TeamMember } from "@/models/TeamMember";
import { MemberFile } from "@/models/MemberFile";
import { MemberStatus } from "@/models/MemberStatus";
import { User } from "@/models/User";
import { Club } from "@/models/Club";
import { verifyToken } from "@/lib/auth";

// Helper function to ensure user has a club
async function ensureUserHasClub(userId: string) {
  let user = await User.findById(userId);
  if (!user) return null;

  if (!user.club) {
    // Check if a personal club exists for this user
    let club = await Club.findOne({ leader: userId });

    if (!club) {
      // Create a new personal club
      club = new Club({
        name: `${user.username}'s Club`,
        description: `Personal club for ${user.username}`,
        leader: userId,
      });
      await club.save();
    }

    // Assign club to user
    user.club = club._id;
    await user.save();
  }

  return user.club;
}

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
      return Response.json([], { status: 200 });
    }

    // Fetch members only for this club
    const members = await TeamMember.find({ club: user.club })
      .populate("createdBy", "username email")
      .populate("lastUpdatedBy", "username email")
      .sort({ createdAt: -1 });
    return Response.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const { name, enrollmentNumber, position } = await req.json();

    // Validate inputs
    if (!name || !name.trim()) {
      return Response.json(
        { error: "Member name is required" },
        { status: 400 }
      );
    }

    if (!enrollmentNumber || !enrollmentNumber.trim()) {
      return Response.json(
        { error: "Enrollment number is required" },
        { status: 400 }
      );
    }

    // Get user's club (auto-create if missing)
    const clubId = await ensureUserHasClub(payload.userId);
    if (!clubId) {
      return Response.json(
        { error: "Failed to assign club to user" },
        { status: 400 }
      );
    }

    // Check if member with same name already exists in this club
    const existingMember = await TeamMember.findOne({
      club: clubId,
      name: name.trim(),
    });

    if (existingMember) {
      return Response.json(
        { error: "A member with this name already exists in your club" },
        { status: 409 }
      );
    }

    // Check if enrollment number already exists in this club
    const existingEnrollment = await TeamMember.findOne({
      club: clubId,
      enrollmentNumber: enrollmentNumber.trim(),
    });

    if (existingEnrollment) {
      return Response.json(
        { error: "This enrollment number already exists in your club" },
        { status: 409 }
      );
    }

    // Create MemberFile (master record)
    const memberFile = new MemberFile({
      name: name.trim(),
      enrollmentNumber: enrollmentNumber.trim(),
      position: position || "",
      createdBy: payload.userId,
    });
    await memberFile.save();

    // Create TeamMember snapshot for quick access / UI
    const member = new TeamMember({
      name: name.trim(),
      enrollmentNumber: enrollmentNumber.trim(),
      position: position || "",
      createdBy: payload.userId,
      memberFile: memberFile._id,
      club: clubId,
    });
    await member.save();

    // Create initial status entry
    const status = new MemberStatus({
      member: memberFile._id,
      points: member.points,
      hours: member.hours,
      remark: "Created",
      recordedBy: payload.userId,
    });
    await status.save();

    // Populate creator info before returning
    await member.populate("createdBy", "username email");

    return Response.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
