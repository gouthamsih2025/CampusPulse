import React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    required?: boolean;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }) => React.ReactNode;
}

export function FormField({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  const descriptionId = description ? `${id}-desc` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          {label} {required && <span className="text-rose-500" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(required)</span>}
        </label>
      </div>

      {description && (
        <p id={descriptionId} className="text-xs text-slate-500">
          {description}
        </p>
      )}

      {children({
        id,
        required,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": !!error,
      })}

      {error && (
        <p id={errorId} className="text-xs font-medium text-rose-600 flex items-center gap-1" role="alert">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
