"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { TicketSeverity, TicketStatus } from "@/types";

interface Issue { _id: string; ticketCode: string; title: string; building: string; severity: TicketSeverity; status: TicketStatus; createdAt: string; }

export default function StaffDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/issues").then(r => r.json()).then(d => setIssues(d.data || d || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const open = issues.filter(i => i.status === "OPEN");
  const inProgress = issues.filter(i => i.status === "IN_PROGRESS");
  const resolved = issues.filter(i => i.status === "RESOLVED");
  const critical = issues.filter(i => i.severity === "CRITICAL");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Staff Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor and manage campus issues assigned to your team.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Open", value: open.length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "In Progress", value: inProgress.length, icon: Clock, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Resolved", value: resolved.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Critical", value: critical.length, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-4">
            <div className={`h-10 w-10 rounded-xl ${k.bg} flex items-center justify-center mb-3`}><k.icon className={`h-5 w-5 ${k.color}`} /></div>
            <p className="text-2xl font-bold text-slate-900">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label} Issues</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Open Issues</CardTitle>
          <Link href="/staff/issues"><Button variant="ghost" size="sm">Manage all <ChevronRight className="h-3 w-3 ml-1" /></Button></Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {open.slice(0, 5).map(i => (
            <div key={i._id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs text-slate-400">{i.ticketCode}</span>
                  <SeverityBadge severity={i.severity} />
                </div>
                <p className="text-sm font-medium text-slate-900 truncate">{i.title}</p>
                <p className="text-xs text-slate-500">{i.building} • {new Date(i.createdAt).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={i.status} />
            </div>
          ))}
          {open.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No open issues — great work!</p>}
        </CardContent>
      </Card>
    </div>
  );
}
