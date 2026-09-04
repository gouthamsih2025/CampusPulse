import React from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor = "text-brand-600",
  iconBg = "bg-brand-50",
  className,
}: KpiCardProps) {
  return (
    <article
      className={cn(
        "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card flex items-start justify-between transition hover:border-slate-300",
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        {subtext && <p className="text-[11px] text-slate-500">{subtext}</p>}
      </div>

      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100",
          iconBg,
          iconColor
        )}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </div>
    </article>
  );
}
