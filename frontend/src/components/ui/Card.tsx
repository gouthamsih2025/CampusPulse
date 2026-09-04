import React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  as: Component = "div",
  children,
  ...props
}: {
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Component
      className={cn(
        "bg-white rounded-2xl border border-slate-200/80 shadow-card transition-all",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-5 border-b border-slate-100 flex flex-col gap-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  as: Component = "h3",
  children,
  ...props
}: {
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Component
      className={cn("text-base font-semibold text-slate-900 tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-slate-500 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}
