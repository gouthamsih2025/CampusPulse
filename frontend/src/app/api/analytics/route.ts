import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Issue, Event, Announcement, Project, Registration } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();

    const [totalIssues, openIssues, inProgressIssues, resolvedIssues, criticalIssues] =
      await Promise.all([
        Issue.countDocuments(),
        Issue.countDocuments({ status: "OPEN" }),
        Issue.countDocuments({ status: "IN_PROGRESS" }),
        Issue.countDocuments({ status: { $in: ["RESOLVED", "CLOSED"] } }),
        Issue.countDocuments({ severity: "CRITICAL" }),
      ]);

    const [totalEvents, totalAnnouncements, totalProjects, totalRegistrations] =
      await Promise.all([
        Event.countDocuments(),
        Announcement.countDocuments(),
        Project.countDocuments(),
        Registration.countDocuments(),
      ]);

    // Issues by category aggregation
    const categoryAgg = await Issue.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          resolved_count: {
            $sum: {
              $cond: [{ $in: ["$status", ["RESOLVED", "CLOSED"]] }, 1, 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const by_category = categoryAgg.map((item) => ({
      category_name: item._id || "General",
      count: item.count,
      resolved_count: item.resolved_count,
    }));

    // Hotspot buildings aggregation
    const buildingAgg = await Issue.aggregate([
      {
        $group: {
          _id: "$building",
          count: { $sum: 1 },
          open_count: {
            $sum: { $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0] },
          },
          high_priority_count: {
            $sum: {
              $cond: [{ $in: ["$severity", ["HIGH", "CRITICAL"]] }, 1, 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    const hotspot_buildings = buildingAgg.map((item) => ({
      building: item._id || "Unspecified Block",
      count: item.count,
      open_count: item.open_count,
      high_priority_count: item.high_priority_count,
    }));

    // Severity Breakdown
    const severityAgg = await Issue.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);
    const by_severity = severityAgg.map((item) => ({
      severity: item._id || "MEDIUM",
      count: item.count,
    }));

    // Status Breakdown
    const statusAgg = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const by_status = statusAgg.map((item) => ({
      status: item._id || "OPEN",
      count: item.count,
    }));

    // Mock/recent trend 7 days
    const recent_activity_trend = [
      { date: "Day 1", new_tickets: Math.max(1, Math.round(totalIssues * 0.1)) },
      { date: "Day 2", new_tickets: Math.max(2, Math.round(totalIssues * 0.15)) },
      { date: "Day 3", new_tickets: Math.max(1, Math.round(totalIssues * 0.12)) },
      { date: "Day 4", new_tickets: Math.max(3, Math.round(totalIssues * 0.2)) },
      { date: "Day 5", new_tickets: Math.max(2, Math.round(totalIssues * 0.18)) },
      { date: "Day 6", new_tickets: Math.max(1, Math.round(totalIssues * 0.14)) },
      { date: "Today", new_tickets: Math.max(1, Math.round(totalIssues * 0.11)) },
    ];

    return NextResponse.json({
      total_tickets: totalIssues,
      open_tickets: openIssues,
      in_progress_tickets: inProgressIssues,
      resolved_tickets: resolvedIssues,
      critical_tickets: criticalIssues,
      avg_resolution_hours: 18.4,
      total_events: totalEvents,
      total_announcements: totalAnnouncements,
      total_projects: totalProjects,
      total_registrations: totalRegistrations,
      by_category,
      by_severity,
      by_status,
      hotspot_buildings,
      recent_activity_trend,
    });
  } catch (error: any) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: error.message || "Failed to compute analytics" }, { status: 500 });
  }
}
