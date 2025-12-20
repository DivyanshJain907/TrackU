import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    const user = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error("Approve user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
