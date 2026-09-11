import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Registration, Event } from "@/models";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updated = await Registration.findByIdAndUpdate(params.id, body, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update registration" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const registration = await Registration.findByIdAndDelete(params.id);
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Decrement registered count on event
    if (registration.status === "confirmed") {
      await Event.findByIdAndUpdate(registration.eventId, { $inc: { registeredCount: -1 } });
    }

    return NextResponse.json({ success: true, message: "Registration cancelled" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete registration" }, { status: 500 });
  }
}
