import { TicketSeverity } from "@/types";
import { Check, AlertCircle, AlertTriangle, Flame } from "lucide-react";

interface Props {
  severity: TicketSeverity;
  className?: string;
}

const severityConfig: Record<
  TicketSeverity,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  LOW: {
    label: "Low",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: Check,
  },
  MEDIUM: {
    label: "Medium",
    bg: "bg-blue-50/80",
    text: "text-blue-800",
    border: "border-blue-300",
    icon: AlertCircle,
  },
  HIGH: {
    label: "High",
    bg: "bg-amber-50/90",
    text: "text-amber-900",
    border: "border-amber-300",
    icon: AlertTriangle,
  },
  CRITICAL: {
    label: "Critical Hazard",
    bg: "bg-rose-50",
    text: "text-rose-900 font-bold",
    border: "border-rose-400",
    icon: Flame,
  },
};

export function SeverityBadge({ severity, className }: Props) {
  const item = severityConfig[severity] || severityConfig.MEDIUM;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.bg} ${item.text} ${item.border} ${className || ""}`}
      aria-label={`Severity: ${item.label}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </span>
  );
}
