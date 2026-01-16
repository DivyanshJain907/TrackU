import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maxUsersPerClub: {
      type: Number,
      default: 50,
    },
    allowNewRegistrations: {
      type: Boolean,
      default: true,
    },
    defaultUserRole: {
      type: String,
      enum: ["member", "leader"],
      default: "member",
    },
    maxAttendanceRecordsDisplay: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
