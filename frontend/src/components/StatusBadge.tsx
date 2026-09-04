import { TicketStatus } from "@/types";
import { Clock, Wrench, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Props {
  status: TicketStatus;
  className?: string;
}

const statusConfig: Record<
  TicketStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  OPEN: {
    label: "Open",
    bg: "bg-amber-50/80",
    text: "text-amber-800",
    border: "border-amber-300",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-blue-50/80",
    text: "text-blue-800",
    border: "border-blue-300",
    icon: Wrench,
  },
  RESOLVED: {
    label: "Resolved",
    bg: "bg-emerald-50/80",
    text: "text-emerald-800",
    border: "border-emerald-300",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Closed",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-300",
    icon: XCircle,
  },
};

export function StatusBadge({ status, className }: Props) {
  const item = statusConfig[status] || statusConfig.OPEN;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.bg} ${item.text} ${item.border} ${className || ""}`}
      aria-label={`Status: ${item.label}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </span>
  );
}
