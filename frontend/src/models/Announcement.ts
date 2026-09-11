import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: "Academic" | "Hostel" | "Emergency" | "Events" | "General";
  priority: "low" | "medium" | "high" | "urgent";
  authorName: string;
  targetAudience: "all" | "students" | "staff";
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Announcement content is required"],
    },
    category: {
      type: String,
      enum: ["Academic", "Hostel", "Emergency", "Events", "General"],
      default: "General",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    authorName: {
      type: String,
      default: "Campus Administration",
      trim: true,
    },
    targetAudience: {
      type: String,
      enum: ["all", "students", "staff"],
      default: "all",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
