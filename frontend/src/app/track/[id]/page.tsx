"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TicketDetail } from "@/types";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
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
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function TrackTicketPage() {
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
      setError(err.message || "Could not find ticket.");
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
      alert("Failed to post update: " + err.message);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Fetching ticket status...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Ticket Not Found</h2>
        <p className="text-xs text-slate-500">{error || "No record matches this tracking token."}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button & Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </button>
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <SeverityBadge severity={ticket.severity} />
        </div>
      </div>

      {/* Main Ticket Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {ticket.ticket_code}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{ticket.title}</h1>
            <p className="text-xs text-slate-400">
              Reported on {formatDate(ticket.created_at)} by <span className="font-semibold text-slate-700">{ticket.reporter_name}</span>
            </p>
          </div>
        </div>

        {/* Location & Metadata Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium block">Category</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-blue-500" />
              {ticket.category?.name || "General"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium block">Location</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-indigo-500" />
              {ticket.building} • {ticket.room}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium block">Assigned Staff</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-slate-500" />
              {ticket.assignee ? ticket.assignee.full_name : "Pending Dispatch"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium block">Target SLA</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              {ticket.category?.sla_hours || 24} Hours
            </div>
          </div>
        </div>

        {/* Description Body */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Problem Description</h3>
          <p className="text-sm text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* AI Triage Executive Summary if available */}
        {ticket.ai_summary && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-800">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              AI Operational Synopsis
            </div>
            <p className="text-slate-700">{ticket.ai_summary}</p>
          </div>
        )}
      </div>

      {/* Two Column Layout: Updates & Audit Trail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Comment / Progress Updates Chain */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Communication & Updates ({ticket.comments.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {ticket.comments.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    {c.author_name}{" "}
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-normal">
                      {c.author_role}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDate(c.created_at)}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{c.comment}</p>
              </div>
            ))}
          </div>

          {/* Post Update Form */}
          <form onSubmit={handleAddComment} className="space-y-3 pt-2 border-t border-slate-100">
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a message or inquiry..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={postingComment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
              >
                {postingComment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Audit Trail Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-600" />
              Lifecycle Audit Trail ({ticket.audit_logs.length})
            </h3>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {ticket.audit_logs.map((log) => (
              <div key={log.id} className="relative pl-6 pb-2 text-xs border-l-2 border-slate-200 last:border-transparent">
                <span className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="font-semibold text-slate-800">{log.action.replace("_", " ")}</span>
                  <span className="text-slate-400">{formatDate(log.created_at)}</span>
                </div>
                <p className="text-slate-500">
                  By <span className="font-medium text-slate-700">{log.actor_name}</span>
                </p>
                {log.new_value && (
                  <p className="text-slate-600 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                    {log.old_value ? `${log.old_value} → ` : ""}
                    <span className="font-medium text-slate-900">{log.new_value}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
