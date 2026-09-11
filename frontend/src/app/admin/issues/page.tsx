"use client";
import { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Badge } from "@/components/ui/Badge";
import type { TicketSeverity, TicketStatus } from "@/types";

interface Issue {
  _id: string;
  ticketCode: string;
  title: string;
  building: string;
  room: string;
  severity: TicketSeverity;
  status: TicketStatus;
  reporterName: string;
  category: string;
  createdAt: string;
}

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const STATUS_FILTERS = ["All", ...STATUSES];

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "All") params.set("status", statusFilter);
    fetch(`/api/issues?${params}`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : []);
        setIssues(list);
      })
      .catch(err => {
        console.error("Failed to load issues:", err);
        setIssues([]);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  // Separate active and resolved issues for display safely
  const safeIssues = Array.isArray(issues) ? issues : [];
  const activeIssues = safeIssues.filter(i => i.status !== "RESOLVED" && i.status !== "CLOSED");
  const resolvedIssues = safeIssues.filter(i => i.status === "RESOLVED" || i.status === "CLOSED");

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: TicketStatus) => {
    setUpdating(id);
    await fetch(`/api/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    load();
  };

  const deleteIssue = async (id: string) => {
    if (!confirm("Delete this issue permanently?")) return;
    await fetch(`/api/issues?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Issue Management (Admin)</h1>
          <p className="text-slate-500 text-sm mt-1">Full control over campus issue reports.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1.5" />Refresh
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${statusFilter === s ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading issues..." />
      ) : activeIssues.length === 0 && resolvedIssues.length === 0 ? (
        <EmptyState icon={AlertCircle} title="No issues" description="No issues match the current filter." />
      ) : (
        <div className="space-y-6">
          {activeIssues.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Active Queue ({activeIssues.length})</h2>
              {activeIssues.map(i => (
                <div key={i._id} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-slate-400">{i.ticketCode}</span>
                        <SeverityBadge severity={i.severity} />
                        <Badge variant="outline" className="capitalize">{i.category ? i.category.replace("_", " ") : "General"}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{i.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {i.building}{i.room ? ` • Room ${i.room}` : ""} • {i.reporterName} • {new Date(i.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={i.status} />
                      <select
                        value={i.status}
                        disabled={updating === i._id}
                        onChange={e => updateStatus(i._id, e.target.value as TicketStatus)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}> {s.replace("_", " ")} </option>
                        ))}
                      </select>
                      <Button variant="danger" size="sm" onClick={() => deleteIssue(i._id)}>
                        <Trash2 className="h-4 w-4 mr-1" />Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resolvedIssues.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Resolved & Completed Issues ({resolvedIssues.length})
              </h2>
              {resolvedIssues.map(i => (
                <div key={i._id} className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 opacity-90">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-slate-400">{i.ticketCode}</span>
                        <SeverityBadge severity={i.severity} />
                        <Badge variant="outline" className="capitalize">{i.category ? i.category.replace("_", " ") : "General"}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 line-through decoration-slate-400">{i.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {i.building}{i.room ? ` • Room ${i.room}` : ""} • {i.reporterName} • {new Date(i.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={i.status} />
                      <select
                        value={i.status}
                        disabled={updating === i._id}
                        onChange={e => updateStatus(i._id, e.target.value as TicketStatus)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}> {s.replace("_", " ")} </option>
                        ))}
                      </select>
                      <Button variant="danger" size="sm" onClick={() => deleteIssue(i._id)}>
                        <Trash2 className="h-4 w-4 mr-1" />Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
