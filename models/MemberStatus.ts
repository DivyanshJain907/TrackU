import mongoose from "mongoose";

const memberStatusSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemberFile",
      required: true,
    },
    points: { type: Number, default: 0 },
    hours: { type: Number, default: 0 },
    remark: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MemberStatus =
  mongoose.models.MemberStatus ||
  mongoose.model("MemberStatus", memberStatusSchema);
