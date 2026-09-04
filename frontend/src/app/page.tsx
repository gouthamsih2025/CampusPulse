"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  PlusCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2,
  BarChart3,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Send,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/track/${encodeURIComponent(trackingCode.trim())}`);
    }
  };

  const workflowSteps = [
    {
      step: "01",
      title: "Report",
      description: "Students or faculty describe what's broken in plain language.",
      icon: PlusCircle,
      accent: "text-brand-600 bg-brand-50 border-brand-200",
    },
    {
      step: "02",
      title: "AI Triage",
      description: "NLP engine extracts location, category, hazard, and urgency in real time.",
      icon: Sparkles,
      accent: "text-cyan-600 bg-cyan-50 border-cyan-200",
    },
    {
      step: "03",
      title: "Assignment",
      description: "Ticket routes automatically to the responsible campus maintenance technician.",
      icon: Wrench,
      accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      step: "04",
      title: "Resolution",
      description: "On-site repairs logged with verifiable lifecycle status and audit notes.",
      icon: CheckCircle2,
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      step: "05",
      title: "Campus Insights",
      description: "Leadership monitors recurring breakdown hotspots and SLA compliance.",
      icon: BarChart3,
      accent: "text-purple-600 bg-purple-50 border-purple-200",
    },
  ];

  const valueProps = [
    {
      title: "AI-Powered Issue Triage",
      description:
        "No complex drop-down mazes. Type 'AC leaking in AB1-305' and our server-side NLP extracts the building, room, and severity instantly.",
      icon: Sparkles,
      tag: "Intelligent Layer",
    },
    {
      title: "Transparent Lifecycle Tracking",
      description:
        "Track tickets in real time using a unique tracking token. View exact status transitions, technician dispatches, and resolution notes.",
      icon: Clock,
      tag: "Live Visibility",
    },
    {
      title: "Actionable Campus Analytics",
      description:
        "Transform isolated complaints into operational intelligence. Pinpoint recurring equipment failures across academic blocks.",
      icon: BarChart3,
      tag: "Data Driven",
    },
    {
      title: "Safety & Hazard Prevention",
      description:
        "Critical emergencies—such as electrical sparking or flooding—are immediately elevated to high-priority triage for fast dispatch.",
      icon: ShieldCheck,
      tag: "Campus Safety",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Hero Section */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden rounded-3xl bg-navy-950 text-white p-8 sm:p-14 lg:p-16 border border-slate-800 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <Badge variant="tech" size="md" className="bg-slate-800/90 text-cyan-300 border-cyan-800/80">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <span>Campus Operations Platform</span>
          </Badge>

          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            Smarter Campus. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-cyan-300 to-teal-200">
              Faster Resolution.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            CampusPulse streamlines how students and staff report infrastructure issues,
            tracks real-time repairs with full transparency, and empowers campus administrators
            to eliminate recurring operational bottlenecks.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/report">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<PlusCircle className="h-5 w-5" />}
                className="bg-brand-600 hover:bg-brand-500"
              >
                Report an Issue
              </Button>
            </Link>

            <Link href="/track">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Search className="h-4 w-4" />}
                className="bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                Track an Issue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Lookup Bar */}
      <section
        aria-labelledby="quick-track-heading"
        className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card max-w-3xl mx-auto"
      >
        <div className="text-center space-y-1.5 mb-5">
          <h2 id="quick-track-heading" className="text-lg font-bold text-slate-900">
            Track an Existing Ticket
          </h2>
          <p className="text-xs text-slate-500">
            Enter your 10-digit ticket token (e.g. <code className="font-mono text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">CP-2026-100201</code>) to check live status.
          </p>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
          <label htmlFor="quick-track-input" className="sr-only">
            Ticket Tracking Code
          </label>
          <input
            id="quick-track-input"
            type="text"
            required
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="CP-2026-XXXXXX"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:bg-white transition"
          />
          <Button type="submit" variant="primary" size="md" leftIcon={<Search className="h-4 w-4" />}>
            Track Status
          </Button>
        </form>
      </section>

      {/* How It Works Section */}
      <section aria-labelledby="workflow-heading" className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="brand" size="sm">End-to-End Workflow</Badge>
          <h2 id="workflow-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How CampusPulse Operates
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            From initial student report to verified technician fix and operational telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {workflowSteps.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.step}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {s.step}
                    </span>
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center border ${s.accent}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Differentiating Feature Pillars */}
      <section aria-labelledby="features-heading" className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="brand" size="sm">Core Capabilities</Badge>
          <h2 id="features-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why CampusPulse Stands Out
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Engineered specifically for university operations, facilities management, and fast turnarounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {valueProps.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-card space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <Badge variant="default" size="sm">{item.tag}</Badge>
                </div>
                <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Institutional CTA Strip */}
      <section
        aria-labelledby="cta-heading"
        className="bg-gradient-to-br from-brand-900 to-navy-950 text-white rounded-3xl p-8 sm:p-10 border border-brand-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
      >
        <div className="space-y-2 max-w-xl">
          <h2 id="cta-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to upgrade campus operations?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Report an issue in seconds or open the operations console to manage incoming tickets.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <Link href="/report">
            <Button variant="primary" size="md" className="bg-brand-500 hover:bg-brand-400">
              Submit Issue Report
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="secondary" size="md" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
              Admin Operations
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
