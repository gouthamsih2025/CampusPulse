import { Category, DashboardAnalytics, Ticket, TicketDetail, TriagePreview, User } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: "Network response was not ok" }));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Categories
  getCategories: () => fetcher<Category[]>("/categories"),

  // Triage Preview
  triagePreview: (rawText: string) =>
    fetcher<TriagePreview>("/tickets/triage-preview", {
      method: "POST",
      body: JSON.stringify({ raw_text: rawText }),
    }),

  // Tickets
  createTicket: (payload: any) =>
    fetcher<Ticket>("/tickets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTickets: (params?: {
    status?: string;
    severity?: string;
    category_id?: number;
    building?: string;
    search?: string;
    reporter_email?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== "") {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    return fetcher<Ticket[]>(`/tickets${qStr ? `?${qStr}` : ""}`);
  },

  getTicket: (idOrCode: string) => fetcher<TicketDetail>(`/tickets/${idOrCode}`),

  updateTicket: (id: number, payload: any) =>
    fetcher<Ticket>(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  addComment: (ticketId: number, comment: { author_name: string; comment: string; author_role?: string; is_internal?: boolean }) =>
    fetcher<any>(`/tickets/${ticketId}/comments`, {
      method: "POST",
      body: JSON.stringify(comment),
    }),

  // Users
  getUsers: () => fetcher<User[]>("/users"),

  // Analytics
  getAnalytics: () => fetcher<DashboardAnalytics>("/analytics/dashboard"),
};
