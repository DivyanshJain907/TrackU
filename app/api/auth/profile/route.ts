import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { User } from "@/models/User";

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(payload.userId).select("username email phone");
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      username: user.username,
      email: user.email,
      phone: user.phone || "",
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, email, phone } = await req.json();

    if (!username || !email) {
      return Response.json(
        { error: "Username and email are required" },
        { status: 400 }
      );
    }

    const trimmedUsername = String(username).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = phone ? String(phone).replace(/\D/g, "") : "";

    if (!/^[a-zA-Z ]+$/.test(trimmedUsername)) {
      return Response.json(
        { error: "Username must contain only alphabets and spaces" },
        { status: 400 }
      );
    }

    if (normalizedPhone) {
      if (normalizedPhone.length !== 10) {
        return Response.json(
          { error: "Phone number must be exactly 10 digits" },
          { status: 400 }
        );
      }
      if (parseInt(normalizedPhone[0], 10) < 6) {
        return Response.json(
          { error: "Phone number must start with a digit >= 6 (valid Indian format)" },
          { status: 400 }
        );
      }
    }

    const existingEmail = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: payload.userId },
    });
    if (existingEmail) {
      return Response.json({ error: "Email already registered" }, { status: 400 });
    }

    if (normalizedPhone) {
      const existingPhone = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: payload.userId },
      });
      if (existingPhone) {
        return Response.json(
          { error: "Phone number already registered" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      payload.userId,
      {
        username: trimmedUsername,
        email: trimmedEmail,
        phone: normalizedPhone,
      },
      { new: true }
    ).select("username email phone");

    if (!updatedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      message: "Profile updated successfully",
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
