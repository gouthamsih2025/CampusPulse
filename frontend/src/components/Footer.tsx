export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 CampusPulse System. Built for smart campus reliability & operations.</p>
        <div className="flex items-center space-x-4 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Operational Systems Live
          </span>
          <span>•</span>
          <span>FastAPI + Next.js</span>
        </div>
      </div>
    </footer>
  );
}
