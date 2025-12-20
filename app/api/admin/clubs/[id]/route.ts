import { connectDB } from "@/lib/db";
import { Club } from "@/models/Club";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    const club = await Club.findByIdAndDelete(id);

    if (!club) {
      return Response.json({ error: "Club not found" }, { status: 404 });
    }

    return Response.json({ message: "Club deleted successfully" });
  } catch (error) {
    console.error("Delete club error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
