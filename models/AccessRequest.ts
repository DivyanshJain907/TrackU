import mongoose from "mongoose";

const accessRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: String,
    email: String,
    phone: String,
    requestMessage: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

export const AccessRequest =
  mongoose.models.AccessRequest ||
  mongoose.model("AccessRequest", accessRequestSchema);
