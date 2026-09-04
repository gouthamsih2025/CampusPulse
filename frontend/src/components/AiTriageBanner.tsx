"use client";

import { TriagePreview } from "@/types";
import { Sparkles, MapPin, Tag, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";

interface Props {
  preview: TriagePreview;
  onApply?: () => void;
}

export function AiTriageBanner({ preview }: Props) {
  return (
    <section
      aria-label="AI Triage Analysis Preview"
      className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-dropdown space-y-4"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              AI Triage
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                {Math.round(preview.confidence * 100)}% Match
              </span>
            </h3>
          </div>
        </div>

        {preview.hazard_detected ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-800/80 px-2.5 py-1 rounded-full">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
            Safety Hazard Flagged
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            Ready to submit
          </span>
        )}
      </div>

      {/* Structured Extracted Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Tag className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <span>Category</span>
          </div>
          <p className="font-semibold text-white text-sm">{preview.category_name}</p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <MapPin className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
            <span>Detected Location</span>
          </div>
          <p className="font-semibold text-white text-sm">
            {preview.building} • <span className="font-mono">{preview.room}</span>
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span>Calculated Severity</span>
          </div>
          <div className="pt-0.5">
            <SeverityBadge severity={preview.severity} className="bg-slate-700 text-white border-slate-600" />
          </div>
        </div>
      </div>

      {/* AI Executive Summary */}
      <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/40 text-xs space-y-1">
        <span className="font-semibold text-slate-300 block">AI Summary:</span>
        <p className="text-slate-300 leading-relaxed">{preview.summary}</p>
      </div>

      {preview.explanation && (
        <p className="text-[11px] text-slate-400 italic">
          Logic: {preview.explanation}
        </p>
      )}
    </section>
  );
}
