import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMember",
    required: true,
  },
  memberName: String,
  enrollmentNumber: String,
  status: {
    type: String,
    enum: ["present", "absent", "late"],
    default: "present",
  },
  checkInTime: Date,
  remarks: String,
});

const attendanceSchema = new mongoose.Schema(
  {
    meetingTitle: {
      type: String,
      required: true,
    },
    meetingDate: {
      type: Date,
      required: true,
    },
    meetingType: {
      type: String,
      enum: ["regular", "special", "emergency", "workshop"],
      default: "regular",
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    location: String,
    description: String,
    attendees: [attendeeSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
