"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Calendar, AlertCircle, ChevronRight, Megaphone } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Announcement { _id: string; title: string; content: string; category: string; priority: string; isPinned: boolean; createdAt: string; }
interface Event { _id: string; title: string; date: string; venue: string; category: string; status: string; registeredCount: number; capacity: number; }

export default function StudentDashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/announcements").then(r => r.json()),
      fetch("/api/events?status=upcoming").then(r => r.json()),
    ]).then(([ann, evts]) => {
      setAnnouncements(ann.data || ann || []);
      setEvents(evts.data || evts || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading your dashboard..." />;

  const pinned = announcements.filter(a => a.isPinned);
  const upcoming = events.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening on campus.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Upcoming Events", value: events.length, icon: Calendar, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Announcements", value: announcements.length, icon: Megaphone, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "My Open Issues", value: 0, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${k.bg} flex items-center justify-center`}><k.icon className={`h-5 w-5 ${k.color}`} /></div>
            <div><p className="text-2xl font-bold text-slate-900">{k.value}</p><p className="text-xs text-slate-500">{k.label}</p></div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4 text-brand-600" /> Pinned Announcements</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {pinned.length === 0 && <p className="text-slate-400 text-sm">No pinned announcements.</p>}
          {pinned.map(a => (
            <div key={a._id} className="flex items-start gap-3 p-3 bg-brand-50 rounded-xl border border-brand-200/60">
              <Megaphone className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-900">{a.title}</p><p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.content}</p></div>
              <Badge variant="brand" className="shrink-0">{a.category}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-brand-600" /> Upcoming Events</CardTitle>
          <Link href="/student/events"><Button variant="ghost" size="sm">View all <ChevronRight className="h-3 w-3 ml-1" /></Button></Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length === 0 && <p className="text-slate-400 text-sm">No upcoming events.</p>}
          {upcoming.map(e => (
            <Link key={e._id} href={`/student/events/${e._id}`} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition">
              <div className="h-10 w-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0"><Calendar className="h-5 w-5 text-brand-600" /></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">{e.title}</p><p className="text-xs text-slate-500">{new Date(e.date).toLocaleDateString()} • {e.venue}</p></div>
              <Badge variant="outline">{e.category}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
