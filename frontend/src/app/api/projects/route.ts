import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Project } from "@/models";

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
        { clubName: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const projects = await Project.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.description || !body.clubName || !body.teamLead) {
      return NextResponse.json(
        { error: "Title, description, club name, and team lead are required" },
        { status: 400 }
      );
    }

    const newProject = await Project.create({
      title: body.title.trim(),
      description: body.description.trim(),
      clubName: body.clubName.trim(),
      category: body.category || "Web",
      teamLead: body.teamLead.trim(),
      status: body.status || "active",
      githubUrl: body.githubUrl || "",
      demoUrl: body.demoUrl || "",
      tags: Array.isArray(body.tags) ? body.tags : (body.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}
