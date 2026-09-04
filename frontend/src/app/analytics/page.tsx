"use client";

import { useEffect, useState } from "react";
import { DashboardAnalytics } from "@/types";
import { api } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building2,
  PieChart,
} from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalytics()
      .then(setData)
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Computing campus operational telemetry...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        Unable to load analytics data. Ensure backend is running.
      </div>
    );
  }

  const resolutionRate =
    data.total_tickets > 0 ? Math.round((data.resolved_tickets / data.total_tickets) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Campus Operational Analytics
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
            Real-Time
          </span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Telemetry on facilities health, recurring breakdown hotspots, and turnaround performance.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</span>
          <div className="text-3xl font-black text-slate-900">{data.total_tickets}</div>
          <p className="text-[11px] text-slate-500">Logged since system initialization</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolution Rate</span>
          <div className="text-3xl font-black text-emerald-600">{resolutionRate}%</div>
          <p className="text-[11px] text-slate-500">{data.resolved_tickets} tickets closed/resolved</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Turnaround</span>
          <div className="text-3xl font-black text-indigo-600">{data.avg_resolution_hours} hrs</div>
          <p className="text-[11px] text-slate-500">From creation to verified fix</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Hazards</span>
          <div className="text-3xl font-black text-rose-600">{data.critical_tickets}</div>
          <p className="text-[11px] text-slate-500">Flagged for immediate safety triage</p>
        </div>
      </div>

      {/* Two Column Section: Category Distribution & Hotspots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-600" />
              Issues by Category & SLA
            </h2>
          </div>

          <div className="space-y-4">
            {data.by_category.map((c) => {
              const pct = data.total_tickets > 0 ? Math.round((c.count / data.total_tickets) * 100) : 0;
              return (
                <div key={c.category_name} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-800">{c.category_name}</span>
                    <span className="text-slate-500">
                      {c.count} ({pct}%) • {c.resolved_count} resolved
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hotspot Buildings */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              Campus Breakdown Hotspots
            </h2>
          </div>

          <div className="space-y-3">
            {data.hotspot_buildings.map((h, idx) => (
              <div
                key={h.building}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{h.building}</span>
                    <span className="text-[11px] text-slate-500">
                      {h.open_count} open • {h.high_priority_count} high priority
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-slate-900">{h.count}</span>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Reports</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline Table */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          Recent Daily Intake Volume
        </h2>

        <div className="grid grid-cols-7 gap-2 text-center pt-2">
          {data.recent_activity_trend.map((item) => (
            <div key={item.date} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium block">{item.date}</span>
              <span className="text-xl font-black text-slate-900 block">{item.new_tickets}</span>
              <span className="text-[10px] text-slate-500 block">tickets</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
