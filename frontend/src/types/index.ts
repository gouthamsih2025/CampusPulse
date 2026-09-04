export type TicketSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
export type UserRole = "STUDENT" | "STAFF" | "ADMIN" | "TECHNICIAN";

export interface Category {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  sla_hours: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  created_at: string;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  author_name: string;
  author_role: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketAuditLog {
  id: number;
  ticket_id: number;
  actor_name: string;
  action: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_code: string;
  title: string;
  description: string;
  category_id: number;
  building: string;
  room: string;
  severity: TicketSeverity;
  status: TicketStatus;
  reporter_name: string;
  reporter_email: string;
  assigned_to?: number;
  ai_summary?: string;
  ai_confidence?: number;
  is_ai_triaged: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  category?: Category;
  assignee?: User;
}

export interface TicketDetail extends Ticket {
  comments: TicketComment[];
  audit_logs: TicketAuditLog[];
}

export interface TriagePreview {
  category_name: string;
  suggested_title: string;
  building: string;
  room: string;
  severity: TicketSeverity;
  summary: string;
  confidence: number;
  hazard_detected: boolean;
  explanation: string;
}

export interface DashboardAnalytics {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  critical_tickets: number;
  avg_resolution_hours: number;
  by_category: { category_name: string; count: number; resolved_count: number }[];
  by_severity: { severity: string; count: number }[];
  by_status: { status: string; count: number }[];
  hotspot_buildings: { building: string; count: number; open_count: number; high_priority_count: number }[];
  recent_activity_trend: { date: string; new_tickets: number }[];
}
