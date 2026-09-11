import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const query: any = {};
    if (role) query.role = role;

    const users = await User.find(query).sort({ name: 1 }).lean();
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const newUser = await User.create({
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      role: body.role || "student",
      department: body.department || "",
      studentId: body.studentId || "",
      phone: body.phone || "",
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}
