"use client";
import { useEffect, useState } from "react";
import { FolderKanban, Github, ExternalLink, Users } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

interface Project { _id: string; title: string; clubName: string; category: string; teamLead: string; status: string; tags: string[]; githubUrl?: string; demoUrl?: string; description?: string; }

const STATUSES = ["All", "active", "completed", "archived"];

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    fetch(`/api/projects?${params}`).then(r => r.json()).then(d => setProjects(d.data || d || [])).finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Campus Projects</h1>
        <p className="text-slate-500 text-sm mt-1">Explore open-source projects by campus clubs and teams.</p>
      </div>
      <div className="flex gap-2">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition ${status === s ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{s}</button>
        ))}
      </div>
      {loading ? <LoadingState message="Loading projects..." /> : projects.length === 0 ? <EmptyState icon={FolderKanban} title="No projects found" description="Try a different filter." /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={p.status === "active" ? "success" : p.status === "completed" ? "brand" : "outline"} className="capitalize">{p.status}</Badge>
                <Badge variant="tech">{p.category}</Badge>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{p.title}</h3>
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Users className="h-3 w-3" />{p.clubName} • Led by {p.teamLead}</p>
              {p.description && <p className="text-xs text-slate-600 line-clamp-2 mb-3">{p.description}</p>}
              <div className="flex flex-wrap gap-1 mb-3">
                {p.tags.map(t => <span key={t} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>)}
              </div>
              <div className="flex gap-2">
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition"><Github className="h-3.5 w-3.5" />GitHub</a>}
                {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition"><ExternalLink className="h-3.5 w-3.5" />Demo</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
