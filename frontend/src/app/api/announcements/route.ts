import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Announcement } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const target = searchParams.get("target");
    const search = searchParams.get("search");

    const query: any = {};
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (target && target !== "all") {
      query.targetAudience = { $in: ["all", target] };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const announcements = await Announcement.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(announcements);
  } catch (error: any) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const newAnnouncement = await Announcement.create({
      title: body.title.trim(),
      content: body.content.trim(),
      category: body.category || "General",
      priority: body.priority || "medium",
      authorName: body.authorName || "Campus Administration",
      targetAudience: body.targetAudience || "all",
      isPinned: Boolean(body.isPinned),
    });

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json({ error: error.message || "Failed to create announcement" }, { status: 500 });
  }
}
