"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, Category, User, TicketStatus, TicketSeverity } from "@/types";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { TicketStatusModal } from "@/components/TicketStatusModal";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  RefreshCw,
  Edit3,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Modal for editing ticket
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketList, catList, userList] = await Promise.all([
        api.getTickets({
          search: search || undefined,
          status: statusFilter || undefined,
          severity: severityFilter || undefined,
          category_id: categoryFilter ? Number(categoryFilter) : undefined,
        }),
        api.getCategories(),
        api.getUsers(),
      ]);
      setTickets(ticketList);
      setCategories(catList);
      setUsers(userList);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleModalSuccess = (updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicket(null);
  };

  // Quick stats computed from current tickets
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const criticalCount = tickets.filter((t) => t.severity === "CRITICAL" && t.status !== "RESOLVED").length;

  return (
    <div className="space-y-8">
      {/* Top Banner & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Operations Command Center
            <span className="text-xs bg-slate-900 text-white font-mono px-2 py-0.5 rounded-full font-semibold">
              Live Queue
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Triage incoming student/staff reports, assign field technicians, and update resolution states.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unassigned / Open</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{openCount}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{inProgressCount}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Critical Hazards</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, title, room, reporter..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </form>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Category & Location</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No tickets found matching current criteria.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-blue-600 block">{t.ticket_code}</span>
                        <span className="font-semibold text-slate-800 line-clamp-1">{t.title}</span>
                        {t.is_ai_triaged && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded font-medium">
                            <Sparkles className="h-3 w-3" />
                            AI Classified
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-700 block">{t.category?.name || "General"}</span>
                        <span className="text-slate-400">
                          {t.building} • {t.room}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <SeverityBadge severity={t.severity} />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium">
                        {t.assignee ? t.assignee.full_name : <span className="text-slate-400 italic">Unassigned</span>}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">{formatDate(t.created_at)}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Manage Ticket"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/track/${t.ticket_code}`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="View Public Tracker"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Management Modal */}
      {selectedTicket && (
        <TicketStatusModal
          ticket={selectedTicket}
          users={users}
          onClose={() => setSelectedTicket(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
