import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  category: "Technical" | "Cultural" | "Sports" | "Workshop" | "Hackathon" | "General";
  venue: string;
  date: string;
  time: string;
  organizer: string;
  capacity: number;
  registeredCount: number;
  bannerUrl?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    category: {
      type: String,
      enum: ["Technical", "Cultural", "Sports", "Workshop", "Hackathon", "General"],
      default: "Technical",
      required: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required (YYYY-MM-DD)"],
    },
    time: {
      type: String,
      required: [true, "Time is required (e.g. 10:00 AM)"],
    },
    organizer: {
      type: String,
      required: [true, "Organizer / Club name is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      default: 100,
      min: 1,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
