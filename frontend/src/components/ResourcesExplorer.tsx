"use client";
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { BookOpen, Github, ExternalLink, Search, ArrowLeft, Star, GitFork, Eye } from "lucide-react";

interface Resource {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  topics: string[];
  category?: string;
}

function ResourceList({ resources, loading }: { resources: Resource[]; loading: boolean }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";

  const categories = ["All", ...Array.from(new Set(resources.map(r => r.category || r.language || "Other").filter(Boolean)))];

  const filtered = resources.filter(r => {
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "All" || (r.category || r.language) === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* React Router badge */}
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
        <span className="h-1.5 w-1.5 bg-violet-500 rounded-full"></span>
        Powered by React Router
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearchParams(p => { const n = new URLSearchParams(p); n.set("q", e.target.value); return n; })}
            placeholder="Search resources..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setSearchParams(p => { const n = new URLSearchParams(p); n.set("category", c); return n; })} className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${category === c ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading from GitHub API...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400"><BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" /><p>No resources found.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-5 hover:border-brand-300 hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/resources/${r.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Github className="h-4 w-4 text-slate-600" />
                  {r.language && <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.language}</span>}
                </div>
                {r.category && <span className="text-[10px] font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200/60">{r.category}</span>}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{r.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{r.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Star className="h-3 w-3" />{r.stargazers_count?.toLocaleString() || 0}</span>
                <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{r.forks_count?.toLocaleString() || 0}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{r.watchers_count?.toLocaleString() || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceDetail({ resources }: { resources: Resource[] }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resource = resources.find(r => String(r.id) === id);

  if (!resource) return (
    <div className="text-center py-20">
      <p className="text-slate-500 mb-4">Resource not found.</p>
      <button onClick={() => navigate("/")} className="text-brand-600 font-medium hover:underline">Back to Resources</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Resources
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
        <div className="flex items-center gap-2 mb-4">
          <Github className="h-5 w-5 text-slate-700" />
          {resource.language && <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{resource.language}</span>}
          {resource.category && <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full border border-brand-200/60">{resource.category}</span>}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{resource.name}</h1>
        <p className="text-sm text-slate-500 mb-2">{resource.full_name}</p>
        <p className="text-slate-600 mb-6">{resource.description}</p>
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center"><p className="text-2xl font-bold text-slate-900">{resource.stargazers_count?.toLocaleString()}</p><p className="text-xs text-slate-500">Stars</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-slate-900">{resource.forks_count?.toLocaleString()}</p><p className="text-xs text-slate-500">Forks</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-slate-900">{resource.watchers_count?.toLocaleString()}</p><p className="text-xs text-slate-500">Watchers</p></div>
        </div>
        {resource.topics && resource.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {resource.topics.map(t => <span key={t} className="text-xs font-medium bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full border border-violet-200/60">{t}</span>)}
          </div>
        )}
        <a href={resource.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition">
          <Github className="h-4 w-4" /> View on GitHub <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export default function ResourcesExplorer() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resources")
      .then(r => r.json())
      .then(d => setResources(d.data || d || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<ResourceList resources={resources} loading={loading} />} />
        <Route path="/resources/:id" element={<ResourceDetail resources={resources} />} />
      </Routes>
    </BrowserRouter>
  );
}
