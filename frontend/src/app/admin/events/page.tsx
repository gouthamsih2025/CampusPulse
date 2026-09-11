"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, X, Calendar, Users } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Event { _id: string; title: string; date: string; venue: string; category: string; status: string; registeredCount: number; capacity: number; organizer: string; }

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", venue: "", category: "Technical", capacity: 100, organizer: "", description: "", status: "upcoming" });

  const load = () => fetch("/api/events").then(r => r.json()).then(d => setEvents(d.data || d || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false); setForm({ title: "", date: "", venue: "", category: "Technical", capacity: 100, organizer: "", description: "", status: "upcoming" }); load();
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" }); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Events</h1><p className="text-slate-500 text-sm mt-1">Create and manage campus events.</p></div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? <><X className="h-4 w-4 mr-1" />Cancel</> : <><Plus className="h-4 w-4 mr-1" />Create Event</>}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create New Event</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="text-sm font-medium text-slate-700 block mb-1">Title *</label><input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Date *</label><input required type="datetime-local" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Venue *</label><input required value={form.venue} onChange={e => setForm({...form,venue:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Category</label><select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">{["Technical","Cultural","Sports","Academic","Workshop"].map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="text-sm font-medium text-slate-700 block mb-1">Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({...form,capacity:parseInt(e.target.value)||100})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium text-slate-700 block mb-1">Organizer *</label><input required value={form.organizer} onChange={e => setForm({...form,organizer:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium text-slate-700 block mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" /></div>
              <div className="sm:col-span-2"><Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Event"}</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingState message="Loading events..." /> : (
        <div className="space-y-3">
          {events.length === 0 && <p className="text-center text-slate-400 py-8">No events yet.</p>}
          {events.map(e => (
            <div key={e._id} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><span className="font-semibold text-slate-900 text-sm">{e.title}</span><Badge variant="brand">{e.category}</Badge><Badge variant={e.status==="upcoming"?"success":"outline"} className="capitalize">{e.status}</Badge></div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(e.date).toLocaleString()}</span>
                  <span>{e.venue}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{e.registeredCount}/{e.capacity}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(e._id)} className="text-slate-400 hover:text-rose-600 transition p-1 rounded-lg hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
