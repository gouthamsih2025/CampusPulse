import { NextResponse } from "next/server";

export async function GET() {
  const categories = [
    { id: 1, name: "Electrical", sla_hours: 12, description: "Power supply, lighting, fans, AC units, and switches" },
    { id: 2, name: "Plumbing", sla_hours: 8, description: "Water leakage, pipe burst, taps, restrooms, and drainage" },
    { id: 3, name: "IT & Audio-Visual", sla_hours: 24, description: "Wi-Fi connectivity, projectors, monitors, and sound systems" },
    { id: 4, name: "Furniture & Carpentry", sla_hours: 48, description: "Chairs, desks, whiteboards, doors, locks, and windows" },
    { id: 5, name: "Cleaning & Hygiene", sla_hours: 6, description: "Waste collection, washroom sanitation, and spills" },
    { id: 6, name: "Civil & Infrastructure", sla_hours: 72, description: "Ceiling tiles, wall cracks, staircases, and outdoor pathways" },
    { id: 7, name: "General / Other", sla_hours: 24, description: "Miscellaneous campus requests" },
  ];

  return NextResponse.json(categories);
}
