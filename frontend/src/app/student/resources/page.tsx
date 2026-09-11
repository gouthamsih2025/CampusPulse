import dynamic from "next/dynamic";

const ResourcesExplorer = dynamic(
  () => import("@/components/ResourcesExplorer"),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-20 text-slate-400">Loading resources...</div> }
);

export default function StudentResourcesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Learning Resources</h1>
        <p className="text-slate-500 text-sm mt-1">Browse open-source repositories and learning materials curated for campus.</p>
      </div>
      <ResourcesExplorer />
    </div>
  );
}
