import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Issue } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const category = searchParams.get("category");
    const reporterEmail = searchParams.get("reporterEmail");
    const search = searchParams.get("search");

    const query: any = {};
    if (status && status !== "ALL") query.status = status;
    if (severity && severity !== "ALL") query.severity = severity;
    if (category && category !== "ALL") query.category = category;
    if (reporterEmail) query.reporterEmail = reporterEmail.toLowerCase().trim();
    if (search) {
      query.$or = [
        { ticketCode: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { building: { $regex: search, $options: "i" } },
        { room: { $regex: search, $options: "i" } },
      ];
    }

    const issues = await Issue.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(issues);
  } catch (error: any) {
    console.error("GET /api/issues error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch issues" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.description || !body.building || !body.room || !body.reporterName) {
      return NextResponse.json(
        { error: "Title, description, building, room, and reporter name are required" },
        { status: 400 }
      );
    }

    // Generate unique ticket code
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketCode = `CP-${year}-${randomNum}`;

    const newIssue = await Issue.create({
      ticketCode,
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category || "Infrastructure",
      building: body.building.trim(),
      room: body.room.trim(),
      severity: body.severity || "MEDIUM",
      status: "OPEN",
      reporterName: body.reporterName.trim(),
      reporterEmail: (body.reporterEmail || "student@campus.edu").toLowerCase().trim(),
      reporterRole: body.reporterRole || "student",
      assignedTo: body.assignedTo || "",
      resolutionNotes: body.resolutionNotes || "",
    });

    return NextResponse.json(newIssue, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/issues error:", error);
    return NextResponse.json({ error: error.message || "Failed to create issue" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Issue id is required' }, { status: 400 });
    }
    const deleted = await Issue.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/issues error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete issue' }, { status: 500 });
  }
}

