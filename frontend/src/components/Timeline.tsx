import React from "react";
import { TicketStatus } from "@/types";
import { Check, Clock, Sparkles, UserCheck, Wrench, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineProps {
  status: TicketStatus;
  isAiTriaged?: boolean;
  hasAssignee?: boolean;
  resolvedAt?: string;
  createdAt: string;
}

interface Step {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

export function Timeline({ status, isAiTriaged, hasAssignee }: TimelineProps) {
  const steps: Step[] = [
    {
      id: "reported",
      label: "Reported",
      description: "Ticket logged by student/staff",
      icon: Clock,
    },
    {
      id: "triaged",
      label: "AI Triaged",
      description: isAiTriaged ? "Auto-classified severity & location" : "Directly categorized",
      icon: Sparkles,
    },
    {
      id: "assigned",
      label: "Assigned",
      description: hasAssignee ? "Dispatched to facilities technician" : "Pending staff allocation",
      icon: UserCheck,
    },
    {
      id: "in_progress",
      label: "In Progress",
      description: "Repair/inspection underway on site",
      icon: Wrench,
    },
    {
      id: "resolved",
      label: "Resolved",
      description: "Verified fix & closed out",
      icon: CheckCircle2,
    },
  ];

  // Determine current step index based on state
  let currentStepIndex = 0;
  if (status === "RESOLVED" || status === "CLOSED") {
    currentStepIndex = 4;
  } else if (status === "IN_PROGRESS") {
    currentStepIndex = 3;
  } else if (hasAssignee) {
    currentStepIndex = 2;
  } else if (isAiTriaged) {
    currentStepIndex = 1;
  } else {
    currentStepIndex = 0;
  }

  return (
    <nav aria-label="Ticket Resolution Progress" className="w-full">
      <ol className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex || (status === "RESOLVED" && idx === 4);
          const isCurrent = idx === currentStepIndex && status !== "RESOLVED";
          const isUpcoming = idx > currentStepIndex;
          const Icon = step.icon;

          return (
            <li
              key={step.id}
              className={cn(
                "relative p-3.5 rounded-xl border transition-all",
                isCompleted && "bg-emerald-50/50 border-emerald-200 text-emerald-950",
                isCurrent && "bg-brand-50/80 border-brand-300 ring-2 ring-brand-600/20 text-brand-950",
                isUpcoming && "bg-slate-50/70 border-slate-200 text-slate-500"
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isCompleted && "bg-emerald-600 text-white",
                    isCurrent && "bg-brand-600 text-white animate-pulse",
                    isUpcoming && "bg-slate-200 text-slate-600"
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                </span>
                <span className="font-bold text-xs">
                  {step.label}
                  {isCurrent && <span className="sr-only"> (current stage)</span>}
                  {isCompleted && <span className="sr-only"> (completed)</span>}
                  {isUpcoming && <span className="sr-only"> (upcoming)</span>}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
