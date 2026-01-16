import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Settings } from "@/models/Settings";
import { verifyToken, isAdmin } from "@/lib/auth";
import { addActivityLog } from "@/app/api/admin/activity/route";

// Default settings
const defaultSettings = {
  maintenanceMode: false,
  maxUsersPerClub: 50,
  allowNewRegistrations: true,
  defaultUserRole: "member" as const,
  maxAttendanceRecordsDisplay: 100,
};

// Helper function to verify admin token
async function verifyAdminToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await User.findById(payload.userId);
  if (!user || !isAdmin(user.email)) {
    return null;
  }

  return payload.userId;
}

export async function GET(req: Request) {
  try {
    const adminUserId = await verifyAdminToken(req);
    if (!adminUserId) {
      return Response.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    await connectDB();

    let settings = await Settings.findOne().lean();
    if (!settings) {
      // Create default settings if not found
      settings = await Settings.create(defaultSettings);
    }

    return Response.json(settings);
  } catch (error) {
    console.error("Fetch settings error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const adminUserId = await verifyAdminToken(req);
    if (!adminUserId) {
      return Response.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();

    // Validate settings
    if (typeof body.maintenanceMode !== "boolean" ||
        typeof body.allowNewRegistrations !== "boolean" ||
        typeof body.maxUsersPerClub !== "number" ||
        typeof body.maxAttendanceRecordsDisplay !== "number" ||
        !["member", "leader"].includes(body.defaultUserRole)) {
      return Response.json(
        { error: "Invalid settings format" },
        { status: 400 }
      );
    }

    // Get current settings for diff
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(defaultSettings);
    }

    const oldSettings = settings.toObject();

    // Update settings
    settings.maintenanceMode = body.maintenanceMode;
    settings.maxUsersPerClub = Math.max(1, body.maxUsersPerClub);
    settings.allowNewRegistrations = body.allowNewRegistrations;
    settings.defaultUserRole = body.defaultUserRole;
    settings.maxAttendanceRecordsDisplay = Math.max(10, body.maxAttendanceRecordsDisplay);

    const updatedSettings = await settings.save();

    // Log activity
    const adminUser = await User.findById(adminUserId);
    addActivityLog(
      "update",
      "System settings were updated",
      {
        _id: adminUserId,
        username: adminUser?.username || "Unknown",
      },
      {
        changes: {
          from: oldSettings,
          to: updatedSettings.toObject(),
        },
      }
    );

    return Response.json(updatedSettings.toObject());
  } catch (error) {
    console.error("Update settings error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
