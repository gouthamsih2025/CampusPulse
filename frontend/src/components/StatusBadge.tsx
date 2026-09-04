import { TicketStatus } from "@/types";
import { Clock, Wrench, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const config: Record<TicketStatus, { label: string; bg: string; text: string; icon: any }> = {
  OPEN: { label: "Open", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Clock },
  IN_PROGRESS: { label: "In Progress", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: Wrench },
  RESOLVED: { label: "Resolved", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
  CLOSED: { label: "Closed", bg: "bg-slate-100 border-slate-200", text: "text-slate-700", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: XCircle },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const item = config[status] || config.OPEN;
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.bg} ${item.text}`}>
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}
