"use client";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Plus, X } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { TicketSeverity, TicketStatus } from "@/types";

interface Issue { _id: string; ticketCode: string; title: string; building: string; room: string; severity: TicketSeverity; status: TicketStatus; createdAt: string; }

const BUILDINGS = ["Main Block", "Science Block", "CS Block", "Library", "Hostel A", "Hostel B", "Cafeteria", "Sports Complex"];
const CATEGORIES = ["electrical", "plumbing", "cleaning", "infrastructure", "lost_found", "other"];

export default function StudentIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTicketCode, setNewTicketCode] = useState("");
  const [form, setForm] = useState({ title: "", description: "", building: "", room: "", severity: "LOW" as TicketSeverity, category: "other", reporterName: "Demo Student", reporterEmail: "student@campus.edu", reporterRole: "student" });

  const load = () => fetch("/api/issues?reporterEmail=student@campus.edu").then(r => r.json()).then(d => setIssues(d.data || d || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const res = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) { setNewTicketCode(data.data?.ticketCode || data.ticketCode || ""); setShowForm(false); load(); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">My Issues</h1><p className="text-slate-500 text-sm mt-1">Track your reported campus issues.</p></div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="h-4 w-4 mr-1" />Cancel</> : <><Plus className="h-4 w-4 mr-1" />Report Issue</>}</Button>
      </div>

      {newTicketCode && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div><p className="font-semibold text-emerald-900">Issue reported!</p><p className="text-sm text-emerald-700">Ticket code: <span className="font-mono font-bold">{newTicketCode}</span></p></div>
          <button onClick={() => setNewTicketCode("")} className="ml-auto text-emerald-600 hover:text-emerald-800"><X className="h-4 w-4" /></button>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Report a New Issue</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="text-sm font-medium text-slate-700 block mb-1">Title *</label><input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Brief description of the issue" /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium text-slate-700 block mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" placeholder="Provide more details..." /></div>
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Building *</label><select required value={form.building} onChange={e => setForm({...form,building:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="">Select building</option>{BUILDINGS.map(b => <option key={b}>{b}</option>)}</select></div>
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Room</label><input value={form.room} onChange={e => setForm({...form,room:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. 201" /></div>
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Severity</label><select value={form.severity} onChange={e => setForm({...form,severity:e.target.value as TicketSeverity})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                {(["LOW","MEDIUM","HIGH","CRITICAL"] as const).map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Category</label><select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_"," ")}</option>)}</select></div>
              <div className="sm:col-span-2"><Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Issue"}</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingState message="Loading issues..." /> : (
        <div className="space-y-3">
          {issues.length === 0 && <div className="text-center py-12 text-slate-400"><AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-40" /><p>No issues reported yet.</p></div>}
          {issues.map(i => (
            <div key={i._id} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-500">{i.ticketCode}</span>
                  <SeverityBadge severity={i.severity} />
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate">{i.title}</p>
                <p className="text-xs text-slate-500">{i.building} {i.room && `• Room ${i.room}`} • {new Date(i.createdAt).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={i.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
