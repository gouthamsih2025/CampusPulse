"use client";

import { useState, useEffect, useRef } from "react";
import { Ticket, TicketSeverity, TicketStatus, User } from "@/types";
import { X, Check, Loader2, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "./ui/Button";

interface Props {
  ticket: Ticket;
  users: User[];
  onClose: () => void;
  onSuccess: (updated: Ticket) => void;
}

export function TicketStatusModal({ ticket, users, onClose, onSuccess }: Props) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [severity, setSeverity] = useState<TicketSeverity>(ticket.severity);
  const [assignedTo, setAssignedTo] = useState<number | undefined>(ticket.assigned_to || undefined);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    firstInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updated = await api.updateTicket(ticket.id, {
        status,
        severity,
        assigned_to: assignedTo,
        resolution_notes: notes ? notes : undefined,
        admin_actor_name: "Admin Operations",
      });
      onSuccess(updated);
    } catch (err: any) {
      setError(err.message || "Failed to update ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-modal border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="modal-title" className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Manage Ticket {ticket.ticket_code}
            </h2>
            <p id="modal-description" className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {ticket.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ticket-status-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Lifecycle Status
              </label>
              <select
                id="ticket-status-select"
                ref={firstInputRef}
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full text-xs font-medium rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label htmlFor="ticket-severity-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Severity Level
              </label>
              <select
                id="ticket-severity-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as TicketSeverity)}
                className="w-full text-xs font-medium rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ticket-assignee-select" className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Field Staff
            </label>
            <select
              id="ticket-assignee-select"
              value={assignedTo || ""}
              onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full text-xs font-medium rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
            >
              <option value="">-- Unassigned (General Queue) --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.department || u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ticket-resolution-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution Note / Action Taken
            </label>
            <textarea
              id="ticket-resolution-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Technician replaced water valve on 3rd floor. Pressure tested successfully."
              className="w-full text-xs rounded-xl border border-slate-300 p-3 text-slate-800 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={loading} leftIcon={<Check className="h-4 w-4" />}>
              Save Updates
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
