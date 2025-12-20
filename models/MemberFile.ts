import mongoose from 'mongoose';

const memberFileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    enrollmentNumber: { type: String, required: true },
    position: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const MemberFile = mongoose.models.MemberFile || mongoose.model('MemberFile', memberFileSchema);
