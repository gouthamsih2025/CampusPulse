"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category, TicketSeverity, TriagePreview } from "@/types";
import { api } from "@/lib/api";
import { AiTriageBanner } from "@/components/AiTriageBanner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  Building,
  Info,
} from "lucide-react";

export default function ReportIssuePage() {
  const router = useRouter();

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
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
  const [copied, setCopied] = useState(false);

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

  // Debounced AI Triage preview
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

        // Auto-fill suggested fields
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
        const matchedCat = categories.find(
          (c) =>
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
    }, 600);

    return () => clearTimeout(timer);
  }, [description, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError("Please choose an issue category.");
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

  const loadExample = () => {
    setDescription("The AC in AB1-305 has been leaking water since morning and students are almost slipping.");
    setReporterName("Aarav Mehta");
    setReporterEmail("aarav.m@student.campus.edu");
  };

  const copyCode = () => {
    if (successTicketCode) {
      navigator.clipboard.writeText(successTicketCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Success view
  if (successTicketCode) {
    return (
      <div className="max-w-xl mx-auto py-6">
        <Card as="section" aria-labelledby="success-heading" className="text-center p-8 sm:p-10 space-y-6">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200" aria-hidden="true">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h1 id="success-heading" className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Issue Ticket Logged!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your report has been received and routed to the campus facilities triage desk.
            </p>
          </div>

          {/* Reference token display with copy action */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Reference Tracking Token
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-black text-brand-700 tracking-wider">
                {successTicketCode}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                aria-label="Copy tracking token"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && <p className="text-[10px] text-emerald-600 font-semibold">Copied to clipboard!</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => router.push(`/track/${successTicketCode}`)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Track Live Status
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSuccessTicketCode(null);
                setTitle("");
                setDescription("");
                setTriagePreview(null);
              }}
            >
              Submit Another Report
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="brand" size="sm">Issue Dispatch</Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a Campus Issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Describe the problem naturally. Our smart triage assistant extracts the specifics automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-200 bg-cyan-50/80 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold transition shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-600" aria-hidden="true" />
          <span>Fill Sample AC Hazard</span>
        </button>
      </header>

      {/* Main Semantic Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-xs font-medium"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Natural Language Problem Description */}
        <Card as="fieldset">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle as="legend">1. Describe the Problem</CardTitle>
              {isTriaging && (
                <span className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-semibold" aria-live="polite">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Analyzing NLP...
                </span>
              )}
            </div>
            <CardDescription>
              Provide clear details about what happened, equipment status, or any immediate hazard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label htmlFor="issue-description" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="issue-description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 'The AC in AB1-305 has been leaking water since morning and students are almost slipping.'"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-slate-50/50 focus-visible:bg-white transition"
              />
            </div>

            {/* AI Triage Banner Preview */}
            {triagePreview && <AiTriageBanner preview={triagePreview} />}
          </CardContent>
        </Card>

        {/* Section 2: Ticket Specifics & Parameters */}
        <Card as="fieldset">
          <CardHeader>
            <CardTitle as="legend">2. Categorization & Location</CardTitle>
            <CardDescription>
              Review the fields auto-populated by AI Triage or adjust them as needed.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label htmlFor="issue-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Summary Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="issue-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Concise 5-8 word title"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="issue-category" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="issue-category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  disabled={loadingCategories}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white transition disabled:opacity-50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (SLA: {c.sla_hours}h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="issue-severity" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Severity / Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  id="issue-severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as TicketSeverity)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white transition"
                >
                  <option value="LOW">Low (Minor / Cosmetic)</option>
                  <option value="MEDIUM">Medium (Normal)</option>
                  <option value="HIGH">High (Disruptive)</option>
                  <option value="CRITICAL">Critical Hazard (Immediate Action)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="issue-building" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Building / Zone <span className="text-rose-500">*</span>
                </label>
                <input
                  id="issue-building"
                  type="text"
                  required
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. Academic Block 1, Hostel B"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="issue-room" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Room / Space Code <span className="text-rose-500">*</span>
                </label>
                <input
                  id="issue-room"
                  type="text"
                  required
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. AB1-305, Library 2nd Floor"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white transition"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Reporter Information */}
        <Card as="fieldset">
          <CardHeader>
            <CardTitle as="legend">3. Reporter Details</CardTitle>
            <CardDescription>
              Used for status notifications and technician follow-up.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reporter-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="reporter-name"
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Aarav Mehta"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white transition"
              />
            </div>

            <div>
              <label htmlFor="reporter-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Campus Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="reporter-email"
                type="email"
                required
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="aarav.m@student.campus.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white transition"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            leftIcon={<Send className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Submit Issue Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}
