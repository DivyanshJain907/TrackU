import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { AccessRequest } from "@/models/AccessRequest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const start = Date.now();
    
    // Parse request body first (before DB connection)
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user with lean() for faster queries (returns plain object instead of Mongoose document)
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if user is admin first
    const adminStatus = isAdmin(user.email);

    // Check if user is approved (skip approval check for admins)
    if (!user.isApproved && !adminStatus) {
      // Check if access request already exists
      let accessRequest = await AccessRequest.findOne({ 
        user: user._id,
        status: "pending"
      });

      // If no pending request, create one
      if (!accessRequest) {
        accessRequest = new AccessRequest({
          user: user._id,
          username: user.username,
          email: user.email,
          requestMessage: `Access request from ${user.username}`,
          status: "pending"
        });
        await accessRequest.save();
      }

      return Response.json(
        { 
          error: "Your access is awaiting admin approval. Please contact the administrator.",
          status: "pending_approval",
          userId: user._id
        },
        { status: 403 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    
    const duration = Date.now() - start;
    
    return Response.json(
      {
        message: "Login successful",
        token,
        userId: user._id,
        username: user.username,
        isAdmin: adminStatus,
        isClubLeader: user.isClubLeader,
        isApproved: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
