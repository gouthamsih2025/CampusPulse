"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category, TicketSeverity, TriagePreview } from "@/types";
import { api } from "@/lib/api";
import { AiTriageBanner } from "@/components/AiTriageBanner";
import { Sparkles, Send, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function ReportIssuePage() {
  const router = useRouter();

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [severity, setSeverity] = useState<TicketSeverity>("MEDIUM");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");

  // AI Triage State
  const [triagePreview, setTriagePreview] = useState<TriagePreview | null>(null);
  const [isTriaging, setIsTriaging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicketCode, setSuccessTicketCode] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    api
      .getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0 && !categoryId) {
          setCategoryId(data[0].id);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Debounced AI Triage preview when description has enough words
  useEffect(() => {
    if (description.trim().length < 15) {
      setTriagePreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsTriaging(true);
        const preview = await api.triagePreview(description);
        setTriagePreview(preview);

        // Auto-fill fields if user hasn't typed their own
        if (!building || building === "General Campus") {
          setBuilding(preview.building);
        }
        if (!room || room === "Unspecified Room") {
          setRoom(preview.room);
        }
        if (!title) {
          setTitle(preview.suggested_title);
        }
        setSeverity(preview.severity);

        // Match category
        const matchedCat = categories.find((c) =>
          c.name.toLowerCase().includes(preview.category_name.toLowerCase()) ||
          preview.category_name.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCat) {
          setCategoryId(matchedCat.id);
        }
      } catch (err) {
        console.warn("Auto-triage preview unavailable:", err);
      } finally {
        setIsTriaging(false);
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [description, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const ticket = await api.createTicket({
        title: title.trim(),
        description: description.trim(),
        category_id: Number(categoryId),
        building: building.trim(),
        room: room.trim(),
        severity,
        reporter_name: reporterName.trim(),
        reporter_email: reporterEmail.trim(),
        auto_triage: true,
      });

      setSuccessTicketCode(ticket.ticket_code);
    } catch (err: any) {
      setError(err.message || "Failed to submit ticket. Please check backend connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Preset example filler for demo
  const loadExample = () => {
    setDescription("The AC in AB1-305 has been leaking water since morning and students are almost slipping.");
    setReporterName("Aarav Mehta");
    setReporterEmail("aarav.m@student.campus.edu");
  };

  if (successTicketCode) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-6">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Issue Ticket Logged!</h2>
          <p className="text-sm text-slate-600">
            Your issue has been routed to the campus operations desk. Keep this reference token to track resolution updates.
          </p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Tracking Code</span>
          <span className="font-mono text-2xl font-bold text-blue-600">{successTicketCode}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => router.push(`/track/${successTicketCode}`)}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            <span>Track Status Live</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSuccessTicketCode(null);
              setTitle("");
              setDescription("");
              setTriagePreview(null);
            }}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
          >
            Submit Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Report a Campus Issue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Describe the problem naturally. Our smart triage assistant extracts the specifics automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          Fill Sample AC Hazard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-700 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Natural Language Description Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            {isTriaging && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analyzing report...
              </span>
            )}
          </div>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what's wrong. (e.g. 'The AC in AB1-305 has been leaking water since morning and students are almost slipping.')"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-slate-400 bg-slate-50/50"
          />
        </div>

        {/* Live AI Triage Feedback Banner */}
        {triagePreview && <AiTriageBanner preview={triagePreview} />}

        {/* Structured Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short title of the problem"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              disabled={loadingCategories}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Severity / Urgency <span className="text-rose-500">*</span>
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as TicketSeverity)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="LOW">Low (Minor / Cosmetic)</option>
              <option value="MEDIUM">Medium (Normal)</option>
              <option value="HIGH">High (Disruptive)</option>
              <option value="CRITICAL">Critical (Immediate Safety Hazard)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Campus Building / Zone <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="e.g. Academic Block 1, Hostel B"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Room or Specific Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. AB1-305, 2nd Floor Corridor"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Your Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="e.g. Aarav Mehta"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Campus Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              placeholder="name@student.campus.edu"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting Ticket...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
