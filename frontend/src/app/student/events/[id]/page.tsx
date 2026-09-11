"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2 } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface Event { _id: string; title: string; date: string; venue: string; category: string; status: string; registeredCount: number; capacity: number; organizer: string; description?: string; }

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${id}`).then(r => r.json()).then(d => setEvent(d.data || d)).finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }
    setSubmitting(true); setError("");
    const res = await fetch("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId: id, studentEmail: email }) });
    const data = await res.json();
    if (res.ok) { setSuccess(true); setEvent(prev => prev ? { ...prev, registeredCount: prev.registeredCount + 1 } : prev); }
    else { setError(data.error || "Registration failed."); }
    setSubmitting(false);
  };

  if (loading) return <LoadingState message="Loading event..." />;
  if (!event) return <div className="text-center py-20 text-slate-500">Event not found.</div>;

  const pct = event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition"><ArrowLeft className="h-4 w-4" /> Back to Events</button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge variant="brand">{event.category}</Badge>
          <Badge variant={event.status === "upcoming" ? "success" : "outline"}>{event.status}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{event.title}</h1>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar className="h-4 w-4 text-brand-500" />{new Date(event.date).toLocaleString("en-IN")}</div>
          <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4 text-brand-500" />{event.venue}</div>
          <div className="flex items-center gap-2 text-sm text-slate-600"><Users className="h-4 w-4 text-brand-500" />{event.registeredCount} / {event.capacity} registered ({pct}% full)</div>
          <div className="text-sm text-slate-600"><span className="font-medium">Organizer:</span> {event.organizer}</div>
        </div>
        {event.description && <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>}
        <div className="w-full bg-slate-100 rounded-full h-2 mt-4"><div className={`h-2 rounded-full ${pct>=100?"bg-rose-500":pct>75?"bg-amber-500":"bg-brand-500"}`} style={{width:`${Math.min(pct,100)}%`}} /></div>
      </div>

      <Card>
        <CardHeader><CardTitle>Register for this Event</CardTitle></CardHeader>
        <CardContent>
          {success ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div><p className="font-semibold text-emerald-900">Registered successfully!</p><p className="text-sm text-emerald-700">You&apos;ll receive a confirmation email shortly.</p></div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Student Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@campus.edu" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={submitting || pct >= 100}>
                {submitting ? "Registering..." : pct >= 100 ? "Event Full" : "Register Now"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
