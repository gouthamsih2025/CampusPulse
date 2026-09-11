import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  sla_hours: number;
  description?: string;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    sla_hours: { type: Number, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
