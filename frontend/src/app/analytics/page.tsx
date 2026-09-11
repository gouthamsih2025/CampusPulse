"use client";

import { useEffect, useState } from "react";
import { DashboardAnalytics } from "@/types";
import { api } from "@/lib/api";
import { KpiCard } from "@/components/KpiCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  BarChart3,
  TrendingUp,
  Building2,
  PieChart,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((resData) => {
        if (resData && !resData.error) {
          setData(resData);
        } else {
          console.error("Analytics response error:", resData?.error);
        }
      })
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Aggregating campus operational metrics..." />;
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-500 text-xs">
        Unable to load telemetry data. Please ensure the backend is running.
      </div>
    );
  }

  const resolutionRate =
    data.total_tickets > 0
      ? Math.round((data.resolved_tickets / data.total_tickets) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="sm">Operational Telemetry</Badge>
          <span className="text-xs text-slate-500 font-medium">Real-Time Aggregations</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Campus Operational Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Telemetry on facilities health, recurring breakdown hotspots, and resolution performance.
        </p>
      </header>

      {/* Primary KPI Metrics */}
      <section aria-label="Operational Summary Stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Intake Volume"
          value={data.total_tickets}
          subtext="Logged across all campus blocks"
          icon={Layers}
          iconBg="bg-slate-100"
          iconColor="text-slate-800"
        />
        <KpiCard
          label="Resolution Rate"
          value={`${resolutionRate}%`}
          subtext={`${data.resolved_tickets} tickets resolved / closed`}
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <KpiCard
          label="Avg Turnaround Time"
          value={`${data.avg_resolution_hours} hrs`}
          subtext="From submission to verified fix"
          icon={Clock}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-700"
        />
        <KpiCard
          label="Critical Safety Hazards"
          value={data.critical_tickets}
          subtext="High priority expedited tickets"
          icon={Flame}
          iconBg="bg-rose-50"
          iconColor="text-rose-700"
        />
      </section>

      {/* Two Column Layout: Categories & Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown & SLAs */}
        <Card as="section" aria-labelledby="category-breakdown-heading">
          <CardHeader>
            <CardTitle id="category-breakdown-heading" className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-brand-600" aria-hidden="true" />
              <span>Issues by Operational Category</span>
            </CardTitle>
            <CardDescription>
              Volume and resolution progress per facility department.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {data.by_category.map((c) => {
              const pct =
                data.total_tickets > 0
                  ? Math.round((c.count / data.total_tickets) * 100)
                  : 0;
              return (
                <div key={c.category_name} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-slate-800 font-semibold">{c.category_name}</span>
                    <span className="text-slate-500 text-[11px]">
                      {c.count} tickets ({pct}%) • <span className="text-emerald-700 font-semibold">{c.resolved_count} resolved</span>
                    </span>
                  </div>
                  <div
                    className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${c.category_name} percentage of total issues`}
                  >
                    <div
                      className="bg-brand-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Campus Hotspot Locations */}
        <Card as="section" aria-labelledby="hotspots-heading">
          <CardHeader>
            <CardTitle id="hotspots-heading" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              <span>Campus Breakdown Hotspots</span>
            </CardTitle>
            <CardDescription>
              Facilities areas experiencing the highest frequency of issue reports.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {data.hotspot_buildings.map((h, idx) => (
              <div
                key={h.building}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0"
                    aria-hidden="true"
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">{h.building}</span>
                    <span className="text-[11px] text-slate-500">
                      {h.open_count} open •{" "}
                      <span className={h.high_priority_count > 0 ? "text-rose-600 font-semibold" : ""}>
                        {h.high_priority_count} critical/high
                      </span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-slate-900 block">{h.count}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Reports</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Daily Intake Timeline Volume */}
      <Card as="section" aria-labelledby="timeline-volume-heading">
        <CardHeader>
          <CardTitle id="timeline-volume-heading" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>Recent Daily Issue Intake</span>
          </CardTitle>
          <CardDescription>
            Report volume trends over the past 7 days.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5 text-center">
            {data.recent_activity_trend.map((item) => (
              <div
                key={item.date}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1"
              >
                <span className="text-[11px] text-slate-400 font-medium block">{item.date}</span>
                <span className="text-xl font-black text-slate-900 block">{item.new_tickets}</span>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">tickets</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
