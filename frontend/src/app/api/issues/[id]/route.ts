import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Issue } from "@/models";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    let issue = null;
    if (params.id.match(/^[0-9a-fA-F]{24}$/)) {
      issue = await Issue.findById(params.id).lean();
    }
    if (!issue) {
      issue = await Issue.findOne({ ticketCode: params.id }).lean();
    }

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    return NextResponse.json(issue);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch issue" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();

    let updated = null;
    if (params.id.match(/^[0-9a-fA-F]{24}$/)) {
      updated = await Issue.findByIdAndUpdate(params.id, body, { new: true }).lean();
    } else {
      updated = await Issue.findOneAndUpdate({ ticketCode: params.id }, body, { new: true }).lean();
    }

    if (!updated) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update issue" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    let deleted = null;
    if (params.id.match(/^[0-9a-fA-F]{24}$/)) {
      deleted = await Issue.findByIdAndDelete(params.id);
    } else {
      deleted = await Issue.findOneAndDelete({ ticketCode: params.id });
    }

    if (!deleted) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Issue deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete issue" }, { status: 500 });
  }
}
