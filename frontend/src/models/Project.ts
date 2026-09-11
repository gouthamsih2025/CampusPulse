import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  clubName: string;
  category: "Web" | "Mobile" | "AI/ML" | "IoT" | "Robotics" | "Design" | "Open Source";
  teamLead: string;
  status: "active" | "recruiting" | "completed";
  githubUrl?: string;
  demoUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    clubName: {
      type: String,
      required: [true, "Club or team name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["Web", "Mobile", "AI/ML", "IoT", "Robotics", "Design", "Open Source"],
      default: "Web",
      required: true,
    },
    teamLead: {
      type: String,
      required: [true, "Team lead name is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "recruiting", "completed"],
      default: "active",
    },
    githubUrl: {
      type: String,
      default: "",
    },
    demoUrl: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
