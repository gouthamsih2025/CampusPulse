import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Registration, Event } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const studentEmail = searchParams.get("studentEmail");

    const query: any = {};
    if (eventId) query.eventId = eventId;
    if (studentEmail) query.studentEmail = studentEmail.toLowerCase().trim();

    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(registrations);
  } catch (error: any) {
    console.error("GET /api/registrations error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch registrations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.eventId || !body.studentName || !body.studentEmail) {
      return NextResponse.json(
        { error: "Event ID, student name, and student email are required" },
        { status: 400 }
      );
    }

    const event = await Event.findById(body.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check duplicate
    const existing = await Registration.findOne({
      eventId: body.eventId,
      studentEmail: body.studentEmail.toLowerCase().trim(),
    });
    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 409 }
      );
    }

    // Check capacity
    const isFull = event.registeredCount >= event.capacity;
    const regStatus = isFull ? "waitlisted" : "confirmed";

    const registration = await Registration.create({
      eventId: event._id,
      eventTitle: event.title,
      studentName: body.studentName.trim(),
      studentEmail: body.studentEmail.toLowerCase().trim(),
      studentId: body.studentId || "",
      phone: body.phone || "",
      department: body.department || "",
      status: regStatus,
    });

    // Increment registered count if confirmed
    if (regStatus === "confirmed") {
      await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });
    }

    return NextResponse.json(registration, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/registrations error:", error);
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Registration id is required' }, { status: 400 });
    }
    const deleted = await Registration.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    // Decrement registeredCount if it was confirmed
    if (deleted.status === 'confirmed') {
      await Event.findByIdAndUpdate(deleted.eventId, { $inc: { registeredCount: -1 } });
    }
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/registrations error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete registration' }, { status: 500 });
  }
}

