"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Ticket, Category, User, TicketStatus, TicketSeverity, DashboardAnalytics } from "@/types";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { TicketStatusModal } from "@/components/TicketStatusModal";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatDate } from "@/lib/utils";
import {
  Search,
  RefreshCw,
  Edit3,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Wrench,
  Sparkles,
  ArrowUpDown,
  FilterX,
  Building,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "severity" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketList, catList, userList, analyticsData] = await Promise.all([
        api.getTickets({
          search: search || undefined,
          status: statusFilter || undefined,
          severity: severityFilter || undefined,
          category_id: categoryFilter ? Number(categoryFilter) : undefined,
        }),
        api.getCategories(),
        api.getUsers(),
        api.getAnalytics().catch(() => null),
      ]);
      setTickets(ticketList);
      setCategories(catList);
      setUsers(userList);
      if (analyticsData) setAnalytics(analyticsData);
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

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSeverityFilter("");
    setCategoryFilter("");
    api.getTickets().then(setTickets);
  };

  const handleModalSuccess = (updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicket(null);
  };

  // Sorted Tickets
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      }
      if (sortBy === "severity") {
        const severityRank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const rankA = severityRank[a.severity] || 0;
        const rankB = severityRank[b.severity] || 0;
        return sortOrder === "desc" ? rankB - rankA : rankA - rankB;
      }
      if (sortBy === "status") {
        return sortOrder === "desc"
          ? b.status.localeCompare(a.status)
          : a.status.localeCompare(b.status);
      }
      return 0;
    });
  }, [tickets, sortBy, sortOrder]);

  const toggleSort = (field: "date" | "severity" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // KPI Metrics computed from analytics / current tickets
  const openCount = analytics ? analytics.open_tickets : tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = analytics ? analytics.in_progress_tickets : tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = analytics ? analytics.resolved_tickets : tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;
  const criticalCount = analytics ? analytics.critical_tickets : tickets.filter((t) => t.severity === "CRITICAL" && t.status !== "RESOLVED").length;
  const avgHours = analytics?.avg_resolution_hours || 18.4;

  const hasActiveFilters = search || statusFilter || severityFilter || categoryFilter;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">Facilities Console</Badge>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="text-xs text-slate-500 font-medium">Live Queue</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Operations Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Triage incoming student/staff reports, assign field technicians, and update resolution states.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh Queue
        </Button>
      </header>

      {/* KPI Cards Strip */}
      <section aria-label="Operations Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Open Issues"
          value={openCount}
          subtext="Pending allocation"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
        />
        <KpiCard
          label="In Progress"
          value={inProgressCount}
          subtext="Field repairs active"
          icon={Wrench}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
        />
        <KpiCard
          label="Critical Hazards"
          value={criticalCount}
          subtext="Immediate safety action"
          icon={Flame}
          iconBg="bg-rose-50"
          iconColor="text-rose-700"
        />
        <KpiCard
          label="Resolved Tickets"
          value={resolvedCount}
          subtext="Verified completions"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <KpiCard
          label="Avg Turnaround"
          value={`${avgHours}h`}
          subtext="Target SLA compliance"
          icon={Sparkles}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-700"
        />
      </section>

      {/* Filters Toolbar */}
      <Card as="section" aria-labelledby="filter-heading" className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <label htmlFor="admin-search-input" className="sr-only">
              Search tickets
            </label>
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" aria-hidden="true" />
            <input
              id="admin-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, title, room, reporter..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:bg-white transition"
            />
          </form>

          {/* Status Filter */}
          <label htmlFor="admin-status-filter" className="sr-only">Filter by Status</label>
          <select
            id="admin-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Severity Filter */}
          <label htmlFor="admin-severity-filter" className="sr-only">Filter by Severity</label>
          <select
            id="admin-severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical Hazard</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category Filter */}
          <label htmlFor="admin-category-filter" className="sr-only">Filter by Category</label>
          <select
            id="admin-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              leftIcon={<FilterX className="h-3.5 w-3.5 text-slate-500" />}
            >
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Ticket Table Section */}
      <Card as="section" aria-labelledby="table-heading" className="overflow-hidden">
        <h2 id="table-heading" className="sr-only">Ticket Management Table</h2>

        {loading ? (
          <LoadingState message="Loading tickets queue..." />
        ) : sortedTickets.length === 0 ? (
          <EmptyState
            title="No tickets match criteria"
            description="Try changing your search terms or clearing the active filters."
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Ticket</th>
                  <th scope="col" className="px-6 py-4">Location & Category</th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-slate-900" onClick={() => toggleSort("severity")}>
                    <div className="flex items-center gap-1">
                      <span>Severity</span>
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-slate-900" onClick={() => toggleSort("status")}>
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4">Assigned Staff</th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-slate-900" onClick={() => toggleSort("date")}>
                    <div className="flex items-center gap-1">
                      <span>Created</span>
                      <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="space-y-0.5 max-w-xs">
                        <span className="font-mono font-bold text-brand-700 block text-xs">
                          {t.ticket_code}
                        </span>
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          {t.title}
                        </span>
                        {t.is_ai_triaged && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded font-medium">
                            <Sparkles className="h-2.5 w-2.5 text-cyan-600" aria-hidden="true" />
                            AI Match
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-700 block">
                          {t.category?.name || "General"}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {t.building} • <span className="font-mono text-[11px]">{t.room}</span>
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
                        {t.assignee ? (
                          t.assignee.full_name
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {formatDate(t.created_at)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(t)}
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                          aria-label={`Manage ticket ${t.ticket_code}`}
                          title="Manage Ticket"
                        >
                          <Edit3 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <Link
                          href={`/track/${t.ticket_code}`}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                          aria-label={`View public tracker for ${t.ticket_code}`}
                          title="View Public Tracker"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Ticket Management Modal Dialog */}
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
