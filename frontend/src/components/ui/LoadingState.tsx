import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center space-y-3",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-7 w-7 text-brand-600 animate-spin" aria-hidden="true" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
      <span className="sr-only">Loading content, please wait</span>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center space-x-4 py-3">
      <div className="h-4 bg-slate-200 rounded w-24"></div>
      <div className="h-4 bg-slate-200 rounded flex-1"></div>
      <div className="h-4 bg-slate-200 rounded w-20"></div>
      <div className="h-4 bg-slate-200 rounded w-16"></div>
    </div>
  );
}
