import { TicketSeverity } from "@/types";
import { AlertCircle, Flame, ShieldAlert, Check } from "lucide-react";

const config: Record<TicketSeverity, { label: string; bg: string; text: string; icon: any }> = {
  LOW: { label: "Low", bg: "bg-slate-100 text-slate-700 border-slate-200", text: "text-slate-700", icon: Check },
  MEDIUM: { label: "Medium", bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-700", icon: AlertCircle },
  HIGH: { label: "High", bg: "bg-orange-50 text-orange-700 border-orange-200", text: "text-orange-700", icon: ShieldAlert },
  CRITICAL: { label: "Critical Hazard", bg: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse", text: "text-rose-700", icon: Flame },
};

export function SeverityBadge({ severity }: { severity: TicketSeverity }) {
  const item = config[severity] || config.MEDIUM;
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.bg}`}>
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}
