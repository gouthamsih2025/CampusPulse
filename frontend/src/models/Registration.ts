import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  studentName: string;
  studentEmail: string;
  studentId?: string;
  phone?: string;
  department?: string;
  status: "confirmed" | "waitlisted" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required"],
    },
    eventTitle: {
      type: String,
      required: [true, "Event title is required"],
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    studentEmail: {
      type: String,
      required: [true, "Student email is required"],
      lowercase: true,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "waitlisted", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate registrations for same email and event
RegistrationSchema.index({ eventId: 1, studentEmail: 1 }, { unique: true });

export const Registration: Model<IRegistration> =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
