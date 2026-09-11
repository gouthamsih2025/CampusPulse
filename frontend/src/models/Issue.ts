import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIssue extends Document {
  ticketCode: string;
  title: string;
  description: string;
  category: string;
  building: string;
  room: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  reporterName: string;
  reporterEmail: string;
  reporterRole: "student" | "staff" | "faculty";
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema: Schema = new Schema(
  {
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Issue description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      default: "Infrastructure",
    },
    building: {
      type: String,
      required: [true, "Building is required"],
      trim: true,
    },
    room: {
      type: String,
      required: [true, "Room or location is required"],
      trim: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"],
      default: "OPEN",
      required: true,
    },
    reporterName: {
      type: String,
      required: [true, "Reporter name is required"],
      trim: true,
    },
    reporterEmail: {
      type: String,
      required: [true, "Reporter email is required"],
      lowercase: true,
      trim: true,
    },
    reporterRole: {
      type: String,
      enum: ["student", "staff", "faculty"],
      default: "student",
    },
    assignedTo: {
      type: String,
      default: "",
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Issue: Model<IIssue> =
  mongoose.models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);

export default Issue;
