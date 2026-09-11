"use client";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface Registration {
  _id: string;
  eventTitle: string;
  studentName: string;
  studentEmail: string;
  status: "confirmed" | "waitlisted" | "cancelled";
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/registrations");
    const data = await res.json();
    setRegistrations(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteReg = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    await fetch(`/api/registrations?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registrations</h1>
      {loading ? (
        <LoadingState message="Loading registrations..." />
      ) : registrations.length === 0 ? (
        <EmptyState icon={Trash2} title="No registrations" description="No registrations found." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg shadow-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">Event</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">Student</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r._id} className="border-t border-slate-200">
                  <td className="px-4 py-2">{r.eventTitle}</td>
                  <td className="px-4 py-2">{r.studentName}</td>
                  <td className="px-4 py-2 text-sm text-slate-600">{r.studentEmail}</td>
                  <td className="px-4 py-2 capitalize">{r.status}</td>
                  <td className="px-4 py-2">
                    <Button variant="danger" size="sm" onClick={() => deleteReg(r._id)}>
                      <Trash2 className="h-4 w-4 mr-1" />Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
