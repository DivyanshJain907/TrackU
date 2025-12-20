import { connectDB } from "@/lib/db";
import { Club } from "@/models/Club";
import { User } from "@/models/User";
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

    const { name, description } = await req.json();

    if (!name || name.trim() === "") {
      return Response.json(
        { error: "Club name is required" },
        { status: 400 }
      );
    }

    // Check if club already exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return Response.json(
        { error: "Club already exists" },
        { status: 400 }
      );
    }

    // Create new club
    const club = new Club({
      name,
      description: description || "",
      leader: payload.userId,
    });

    await club.save();

    // Update user as club leader
    await User.findByIdAndUpdate(payload.userId, {
      club: club._id,
      isClubLeader: true,
    });

    return Response.json(
      {
        message: "Club created successfully",
        club: {
          _id: club._id,
          name: club.name,
          description: club.description,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Club creation error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
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

    const clubs = await Club.find({}).select("_id name description leader");

    return Response.json(clubs, { status: 200 });
  } catch (error) {
    console.error("Get clubs error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
