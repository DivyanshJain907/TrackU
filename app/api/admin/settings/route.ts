import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, isAdmin } from "@/lib/auth";
import { addActivityLog } from "@/app/api/admin/activity/route";

// In-memory settings storage (in production, you'd use a database)
const defaultSettings = {
  maintenanceMode: false,
  maxUsersPerClub: 50,
  allowNewRegistrations: true,
  defaultUserRole: "member" as const,
  maxAttendanceRecordsDisplay: 100,
};

let appSettings = { ...defaultSettings };

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

    return Response.json(appSettings);
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

    // Store old settings for diff
    const oldSettings = { ...appSettings };

    // Update settings
    appSettings = {
      maintenanceMode: body.maintenanceMode,
      maxUsersPerClub: Math.max(1, body.maxUsersPerClub),
      allowNewRegistrations: body.allowNewRegistrations,
      defaultUserRole: body.defaultUserRole,
      maxAttendanceRecordsDisplay: Math.max(10, body.maxAttendanceRecordsDisplay),
    };

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
          to: appSettings,
        },
      }
    );

    return Response.json(appSettings);
  } catch (error) {
    console.error("Update settings error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
