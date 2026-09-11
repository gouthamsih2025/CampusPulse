"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Search } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

interface Event { _id: string; title: string; date: string; venue: string; category: string; status: string; registeredCount: number; capacity: number; organizer: string; }

const CATEGORIES = ["All", "Technical", "Cultural", "Sports", "Academic", "Workshop"];

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (search) params.set("search", search);
    fetch(`/api/events?${params}`).then(r => r.json()).then(d => setEvents(d.data || d || [])).finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Campus Events</h1>
        <p className="text-slate-500 text-sm mt-1">Browse and register for upcoming campus events.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${category === c ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? <LoadingState message="Loading events..." /> : events.length === 0 ? <EmptyState icon={Calendar} title="No events found" description="Try adjusting your filters." /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map(e => {
            const pct = e.capacity > 0 ? Math.round((e.registeredCount / e.capacity) * 100) : 0;
            const full = pct >= 100;
            return (
              <Link key={e._id} href={`/student/events/${e._id}`} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-5 hover:border-brand-300 hover:shadow-md transition group block">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={e.status === "upcoming" ? "brand" : "outline"}>{e.status}</Badge>
                  <Badge variant="outline">{e.category}</Badge>
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 transition mb-1">{e.title}</h3>
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(e.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Users className="h-3 w-3" />{e.registeredCount} / {e.capacity} registered</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full transition-all ${full ? "bg-rose-500" : pct > 75 ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${Math.min(pct,100)}%` }} /></div>
                <p className="text-[10px] text-slate-400 mt-1">{full ? "Full" : `${100-pct}% spots left`}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
