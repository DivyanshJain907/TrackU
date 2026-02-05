import { connectDB } from "@/lib/db";
import { Club } from "@/models/Club";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

// Increase body size limit for image uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid club ID" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectDB();

    // Get user's club to verify they can edit it
    const user = await User.findById(payload.userId);
    if (!user || !user.club || user.club.toString() !== id) {
      return Response.json(
        { error: "Unauthorized - You can only edit your own club" },
        { status: 403 }
      );
    }

    // Update the club
    const club = await Club.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
      },
      { new: true }
    );

    if (!club) {
      return Response.json({ error: "Club not found" }, { status: 404 });
    }

    console.log("Club updated successfully", {
      clubId: club._id,
      hasImageUrl: !!club.imageUrl,
      imageUrlLength: club.imageUrl?.length,
    });

    return Response.json({
      id: club._id,
      name: club.name,
      description: club.description,
      imageUrl: club.imageUrl,
    });
  } catch (error) {
    console.error("Update club error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
