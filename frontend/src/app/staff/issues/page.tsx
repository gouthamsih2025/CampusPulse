"use client";
import { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { TicketSeverity, TicketStatus } from "@/types";

interface Issue { _id: string; ticketCode: string; title: string; building: string; room: string; severity: TicketSeverity; status: TicketStatus; reporterName: string; category: string; createdAt: string; }

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const STATUS_FILTERS = ["All", ...STATUSES];

export default function StaffIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "All") params.set("status", statusFilter);
    fetch(`/api/issues?${params}`).then(r => r.json()).then(d => setIssues(d.data || d || [])).finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: TicketStatus) => {
    setUpdating(id);
    await fetch(`/api/issues/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setUpdating(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Issue Management</h1><p className="text-slate-500 text-sm mt-1">Update and manage all campus issue reports.</p></div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-1.5" />Refresh</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${statusFilter === s ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{s.replace("_", " ")}</button>
        ))}
      </div>

      {loading ? <LoadingState message="Loading issues..." /> : issues.length === 0 ? <EmptyState icon={AlertCircle} title="No issues" description="No issues match the current filter." /> : (
        <div className="space-y-3">
          {issues.map(i => (
            <div key={i._id} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-400">{i.ticketCode}</span>
                    <SeverityBadge severity={i.severity} />
                    <Badge variant="outline" className="capitalize">{i.category.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{i.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{i.building}{i.room ? ` • Room ${i.room}` : ""} • {i.reporterName} • {new Date(i.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={i.status} />
                  <select value={i.status} disabled={updating === i._id} onChange={e => updateStatus(i._id, e.target.value as TicketStatus)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
