import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { raw_text, description } = await req.json();
    const text = (raw_text || description || "").trim();

    if (!text) {
      return NextResponse.json({ error: "Text description is required for triage" }, { status: 400 });
    }

    const lower = text.toLowerCase();

    // Determine category based on NLP keywords
    let category_name = "Infrastructure";
    if (lower.match(/\b(ac|air condition|fan|light|lamp|bulb|switch|plug|power|wire|fuse|short circuit|socket|electricity|electrical)\b/i)) {
      category_name = "Electrical";
    } else if (lower.match(/\b(water|pipe|leak|tap|faucet|toilet|flush|sink|drain|sewage|plumbing|basin|washroom)\b/i)) {
      category_name = "Plumbing";
    } else if (lower.match(/\b(wifi|internet|network|router|lan|cable|projector|audio|speaker|mic|screen|tv|av|monitor|computer|pc)\b/i)) {
      category_name = "IT & Audio-Visual";
    } else if (lower.match(/\b(chair|desk|table|bench|podium|door|window|lock|key|carpentry|furniture|board|whiteboard)\b/i)) {
      category_name = "Furniture & Carpentry";
    } else if (lower.match(/\b(trash|garbage|dust|dirt|clean|dustbin|smell|stink|cleaning|janitor)\b/i)) {
      category_name = "Cleaning & Hygiene";
    }

    // Determine severity based on emergency / risk keywords
    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";
    if (lower.match(/\b(fire|spark|smoke|blast|shock|emergency|hazard|danger|slip|falling|flood|overflow|broken glass)\b/i)) {
      severity = "CRITICAL";
    } else if (lower.match(/\b(urgent|disrupting|exam|leak|leaking|not working|broken|damaged|severe|important)\b/i)) {
      severity = "HIGH";
    } else if (lower.match(/\b(minor|cosmetic|slow|dusty|noise|scratch|creak)\b/i)) {
      severity = "LOW";
    }

    // Extract Building & Room codes using regex pattern matching
    let building = "Academic Block 1";
    if (lower.includes("ab2") || lower.includes("academic block 2")) building = "Academic Block 2";
    else if (lower.includes("ab3") || lower.includes("academic block 3")) building = "Academic Block 3";
    else if (lower.includes("hostel a")) building = "Hostel Block A";
    else if (lower.includes("hostel b")) building = "Hostel Block B";
    else if (lower.includes("library")) building = "Campus Central Library";
    else if (lower.includes("cafeteria") || lower.includes("canteen")) building = "Student Cafeteria";
    else if (lower.includes("sports")) building = "Sports Complex";

    // Match room numbers e.g. AB1-305, Room 204, LH-1, Lab 3, 305
    const roomMatch = text.match(/\b([A-Z0-9]+-[0-9]+|Room\s*\d+|LH-\d+|Lab\s*\d+|\d{3})\b/i);
    const room = roomMatch ? roomMatch[0] : "General Area";

    // Generate smart suggested title
    const firstSentence = text.split(".")[0].trim();
    const suggested_title = firstSentence.length > 50 ? firstSentence.slice(0, 47) + "..." : firstSentence;

    return NextResponse.json({
      category_name,
      severity,
      building,
      room,
      suggested_title,
      confidence_score: 0.94,
      ai_matched_rule: `Natural Language Rule: ${category_name} (${severity})`,
      summary: `Auto-triaged: Identified ${category_name} issue in ${building} (${room}) with ${severity} priority.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process NLP triage" }, { status: 500 });
  }
}
