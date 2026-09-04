"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ShieldAlert, ArrowRight, Clock, HelpCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function TrackLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/track/${encodeURIComponent(code.trim())}`);
    }
  };

  const sampleTickets = [
    { code: "CP-2026-100201", desc: "AC water leakage hazard in AB1-305", status: "OPEN" },
    { code: "CP-2026-100202", desc: "Ceiling fan sparking in AB2-204", status: "IN_PROGRESS" },
    { code: "CP-2026-100204", desc: "Water pressure issue in Hostel B", status: "RESOLVED" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <header className="text-center space-y-2">
        <Badge variant="brand" size="sm">Real-Time Tracking</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Track an Issue Ticket
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Monitor lifecycle progress, technician notes, and audit updates for any reported campus problem.
        </p>
      </header>

      {/* Lookup Card */}
      <Card as="section" aria-labelledby="track-card-title">
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="tracking-code-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Ticket Reference Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" aria-hidden="true" />
                <input
                  id="tracking-code-input"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CP-2026-100201"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white transition"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Tracking tokens are generated immediately upon issue submission (format: <code className="font-mono text-brand-700">CP-YYYY-XXXXXX</code>).
              </p>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" leftIcon={<Search className="h-4 w-4" />}>
              Lookup Ticket Status
            </Button>
          </form>

          {/* Sample quick lookup links */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Or explore live demo tickets:
            </p>
            <div className="space-y-2">
              {sampleTickets.map((t) => (
                <Link
                  key={t.code}
                  href={`/track/${t.code}`}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50/60 border border-slate-200/80 hover:border-brand-200 flex items-center justify-between text-xs transition group"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-brand-700 group-hover:text-brand-800">
                      {t.code}
                    </span>
                    <span className="text-slate-600 block text-[11px]">{t.desc}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-brand-600 font-semibold text-[11px]">
                    <span>View</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
