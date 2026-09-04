"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TicketDetail } from "@/types";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Timeline } from "@/components/Timeline";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Tag,
  User,
  MessageSquare,
  History,
  Send,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Calendar,
  Building,
} from "lucide-react";

export default function TrackTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrCode = params?.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New comment state
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const fetchTicket = async () => {
    if (!idOrCode) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTicket(idOrCode);
      setTicket(data);
    } catch (err: any) {
      setError(err.message || `No ticket found with reference '${idOrCode}'.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [idOrCode]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim() || !ticket) return;

    setPostingComment(true);
    try {
      await api.addComment(ticket.id, {
        author_name: authorName.trim(),
        comment: newComment.trim(),
        author_role: "Student",
        is_internal: false,
      });
      setNewComment("");
      await fetchTicket();
    } catch (err: any) {
      alert("Failed to submit message: " + err.message);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return <LoadingState message="Fetching live ticket details..." />;
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="text-center p-8 space-y-4">
          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Ticket Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link href="/track">
              <Button variant="primary" size="sm">
                Try Another Code
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Top navigation & action bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/track"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Tracker</span>
        </Link>
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <SeverityBadge severity={ticket.severity} />
        </div>
      </header>

      {/* Main Ticket Summary Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                {ticket.ticket_code}
              </span>
              {ticket.is_ai_triaged && (
                <Badge variant="tech" size="sm">
                  <Sparkles className="h-3 w-3 text-cyan-600" aria-hidden="true" />
                  <span>AI Triaged</span>
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {ticket.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reported on {formatDate(ticket.created_at)} by </span>
              <strong className="text-slate-700 font-semibold">{ticket.reporter_name}</strong>
            </p>
          </div>
        </div>

        {/* 5-Stage Visual Lifecycle Progress Tracker */}
        <section aria-label="Resolution Lifecycle Progress" className="py-2">
          <h2 className="sr-only">Resolution Stage Tracker</h2>
          <Timeline
            status={ticket.status}
            isAiTriaged={ticket.is_ai_triaged}
            hasAssignee={!!ticket.assigned_to}
            createdAt={ticket.created_at}
            resolvedAt={ticket.resolved_at}
          />
        </section>

        {/* Metadata Parameter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-slate-400 font-medium block">Category</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              {ticket.category?.name || "General Infrastructure"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-slate-400 font-medium block">Location</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
              {ticket.building} • <span className="font-mono">{ticket.room}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-slate-400 font-medium block">Assigned Staff</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
              {ticket.assignee ? ticket.assignee.full_name : "Pending Dispatch"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-slate-400 font-medium block">Target Turnaround</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              {ticket.category?.sla_hours || 24} Hours Target
            </p>
          </div>
        </div>

        {/* Description */}
        <section aria-labelledby="desc-heading" className="space-y-2">
          <h2 id="desc-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Original Issue Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </section>

        {/* AI Synopsis if present */}
        {ticket.ai_summary && (
          <section
            aria-labelledby="ai-synopsis-heading"
            className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5"
          >
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
              <h2 id="ai-synopsis-heading" className="text-xs">
                AI Operational Synopsis
              </h2>
            </div>
            <p className="text-slate-300 leading-relaxed">{ticket.ai_summary}</p>
          </section>
        )}
      </Card>

      {/* Two Column Layout: Updates & Complete Audit Trail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Comments & Communication Thread */}
        <Card as="section" aria-labelledby="updates-heading" className="p-6 space-y-5">
          <header className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 id="updates-heading" className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Updates & Inquiry ({ticket.comments.length})
            </h2>
          </header>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {ticket.comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No notes posted yet.</p>
            ) : (
              ticket.comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {c.author_name}{" "}
                      <span className="text-[10px] text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded font-medium">
                        {c.author_role}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{c.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Message Form */}
          <form onSubmit={handleAddComment} className="space-y-3 pt-3 border-t border-slate-100">
            <label htmlFor="student-comment-author" className="sr-only">
              Your Name
            </label>
            <input
              id="student-comment-author"
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name (e.g. Aarav Mehta)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white"
            />
            <div className="flex gap-2">
              <label htmlFor="student-comment-input" className="sr-only">
                Add update or message
              </label>
              <input
                id="student-comment-input"
                type="text"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask an update or provide extra details..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={postingComment} leftIcon={<Send className="h-3.5 w-3.5" />}>
                Post
              </Button>
            </div>
          </form>
        </Card>

        {/* Audit Trail Timeline */}
        <Card as="section" aria-labelledby="audit-heading" className="p-6 space-y-5">
          <header className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 id="audit-heading" className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              Lifecycle Audit Trail ({ticket.audit_logs.length})
            </h2>
          </header>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {ticket.audit_logs.map((log) => (
              <div
                key={log.id}
                className="relative pl-6 pb-2 text-xs border-l-2 border-slate-200 last:border-transparent"
              >
                <span className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-brand-600 ring-4 ring-white" aria-hidden="true" />
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="font-semibold text-slate-800">{log.action.replace("_", " ")}</span>
                  <span className="text-slate-400">{formatDate(log.created_at)}</span>
                </div>
                <p className="text-slate-500">
                  By <span className="font-medium text-slate-700">{log.actor_name}</span>
                </p>
                {log.new_value && (
                  <p className="text-slate-600 mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 font-mono text-[11px]">
                    {log.old_value ? `${log.old_value} → ` : ""}
                    <span className="font-medium text-slate-900">{log.new_value}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </article>
  );
}
