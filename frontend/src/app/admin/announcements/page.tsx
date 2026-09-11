"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, X, Pin } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Announcement { _id: string; title: string; content: string; category: string; priority: string; isPinned: boolean; targetAudience: string; createdAt: string; }

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", priority: "normal", isPinned: false, targetAudience: "all" });

  const load = () => fetch("/api/announcements").then(r => r.json()).then(d => setAnnouncements(d.data || d || [])).finally(() => setLoading(false));
  useEffect(() => {
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const d = await res.json();
      setAnnouncements(d.data || d || []);
    } catch (e) {
      console.error(e);
      // Keep empty list; UI will show no announcements message
    } finally {
      setLoading(false);
    }
  };
  fetchAnnouncements();
}, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false); setForm({ title: "", content: "", category: "general", priority: "normal", isPinned: false, targetAudience: "all" }); load();
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE" }); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Announcements</h1><p className="text-slate-500 text-sm mt-1">Manage campus-wide announcements.</p></div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="h-4 w-4 mr-1" />Cancel</> : <><Plus className="h-4 w-4 mr-1" />New</>}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Announcement</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Title *</label><input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Content *</label><textarea required rows={4} value={form.content} onChange={e => setForm({...form,content:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-slate-700 block mb-1">Category</label><select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">{["general","academic","administrative","events","emergency"].map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="text-sm font-medium text-slate-700 block mb-1">Priority</label><select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">{["low","normal","high","urgent"].map(p => <option key={p}>{p}</option>)}</select></div>
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" id="pinned" checked={form.isPinned} onChange={e => setForm({...form,isPinned:e.target.checked})} className="rounded" /><label htmlFor="pinned" className="text-sm text-slate-700">Pin this announcement</label></div>
              <Button type="submit" disabled={submitting}>{submitting ? "Publishing..." : "Publish"}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingState message="Loading announcements..." /> : (
        <div className="space-y-3">
          {announcements.length === 0 && <p className="text-center text-slate-400 py-8">No announcements yet.</p>}
          {announcements.map(a => (
            <div key={a._id} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {a.isPinned && <Pin className="h-3.5 w-3.5 text-brand-600" />}
                  <span className="font-semibold text-slate-900 text-sm">{a.title}</span>
                  <Badge variant="outline" className="capitalize">{a.category}</Badge>
                  <Badge variant={a.priority === "urgent" ? "danger" : a.priority === "high" ? "warning" : "default"} className="capitalize">{a.priority}</Badge>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{a.content}</p>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(a.createdAt).toLocaleString()} • Target: {a.targetAudience}</p>
              </div>
              <button onClick={() => handleDelete(a._id)} className="text-slate-400 hover:text-rose-600 transition p-1 rounded-lg hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
