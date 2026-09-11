import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed database",
        hint: "Ensure MongoDB is running locally or MONGODB_URI is correctly configured.",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
