import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Event } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = {};
    if (category && category !== "All") query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { organizer: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query).sort({ date: 1, createdAt: -1 }).lean();
    return NextResponse.json(events);
  } catch (error: any) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.venue || !body.date || !body.organizer) {
      return NextResponse.json(
        { error: "Title, venue, date, and organizer are required" },
        { status: 400 }
      );
    }

    const newEvent = await Event.create({
      title: body.title.trim(),
      description: body.description || "",
      category: body.category || "Technical",
      venue: body.venue.trim(),
      date: body.date,
      time: body.time || "10:00 AM",
      organizer: body.organizer.trim(),
      capacity: Number(body.capacity) || 100,
      registeredCount: 0,
      bannerUrl: body.bannerUrl || "",
      status: body.status || "upcoming",
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
  }
}
