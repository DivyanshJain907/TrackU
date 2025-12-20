import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const records = await Attendance.find()
      .populate("member", "name email")
      .populate("event", "name date")
      .sort({ date: -1 });

    return Response.json(records);
  } catch (error) {
    console.error("Fetch attendance error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
