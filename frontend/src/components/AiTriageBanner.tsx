"use client";

import { TriagePreview } from "@/types";
import { Sparkles, MapPin, Tag, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";

interface Props {
  preview: TriagePreview;
  onApply?: () => void;
}

export function AiTriageBanner({ preview, onApply }: Props) {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-blue-900 font-semibold text-sm">
          <div className="p-1 rounded bg-blue-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>AI Triage Preview</span>
          <span className="text-xs bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded-full font-medium">
            {Math.round(preview.confidence * 100)}% Confidence
          </span>
        </div>
        {preview.hazard_detected && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full">
            <AlertTriangle className="h-3.5 w-3.5" />
            Safety Hazard Flagged
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 flex items-center space-x-2">
          <Tag className="h-4 w-4 text-blue-600 shrink-0" />
          <div>
            <span className="text-slate-500 block">Identified Category</span>
            <span className="font-semibold text-slate-800">{preview.category_name}</span>
          </div>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
          <div>
            <span className="text-slate-500 block">Detected Location</span>
            <span className="font-semibold text-slate-800">
              {preview.building} • {preview.room}
            </span>
          </div>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Suggested Severity</span>
            <SeverityBadge severity={preview.severity} />
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600 bg-white/60 p-2 rounded border border-blue-50">
        <span className="font-medium text-slate-700">Executive Summary: </span>
        {preview.summary}
      </div>
    </div>
  );
}
