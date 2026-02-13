import mongoose from "mongoose";

const remarksSchema = new mongoose.Schema({
  text: String,
  date: { type: Date, default: Date.now },
});

const updateHistorySchema = new mongoose.Schema({
  points: {
    type: Number,
    default: 0,
  },
  hours: {
    type: Number,
    default: 0,
  },
  remark: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    enrollmentNumber: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      default: "",
    },
    memberFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemberFile",
    },
    points: {
      type: Number,
      default: 0,
    },
    hours: {
      type: Number,
      default: 0,
    },
    remarks: [remarksSchema],
    updateHistory: [updateHistorySchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
  },
  { timestamps: true }
);

export const TeamMember =
  mongoose.models.TeamMember || mongoose.model("TeamMember", teamMemberSchema);
