"use client";

import Link from "next/link";
import { PlusCircle, Search, ShieldAlert, Zap, BarChart3, CheckCircle2, ArrowRight, Sparkles, Clock, AlertTriangle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Assisted Campus Operations
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Fix campus issues faster. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Zero friction, intelligent triage.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            Report broken ACs, electrical faults, plumbing leaks, or lost items in seconds. Our smart classification engine automatically pinpoints location, severity, and routes tickets to facilities staff.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="h-5 w-5" />
              Report a Problem
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur border border-white/20 transition"
            >
              Admin Operations Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Natural Language Triage</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Simply type what happened (e.g. <i>"AC dripping water in AB1-305"</i>). The NLP parser extracts building, room, hazard, and urgency automatically.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Real-Time Resolution Tracking</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Unique tracking tokens allow students and faculty to check the exact lifecycle stage, technician notes, and historical audit trail without logging in.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Campus Operational Analytics</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Identify recurring maintenance hotspots across academic blocks, track SLA compliance, and monitor unresolved safety hazards before exams or events.
          </p>
        </div>
      </section>

      {/* Quick Lookup Card */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Already have a ticket code?</h2>
        <p className="text-sm text-slate-600">
          Enter your ticket tracking code (e.g., <code className="bg-white px-2 py-0.5 rounded text-blue-700 font-mono text-xs border">CP-2026-100201</code>) to check live progress.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = (form.elements.namedItem("code") as HTMLInputElement).value.trim();
            if (input) window.location.href = `/track/${encodeURIComponent(input)}`;
          }}
          className="flex items-center gap-2 max-w-md mx-auto"
        >
          <input
            name="code"
            type="text"
            required
            placeholder="CP-2026-XXXXXX"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
          >
            Track
          </button>
        </form>
      </section>
    </div>
  );
}
