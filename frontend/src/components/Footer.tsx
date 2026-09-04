import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/90 bg-white text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <Link
              href="/"
              className="flex items-center space-x-2.5 inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg"
            >
              <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-extrabold text-slate-900 text-base">
                Campus<span className="text-brand-600">Pulse</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Intelligent campus operations and facilities issue-management platform.
              Automating report categorization, SLA tracking, and recurring hazard prevention.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Platform</p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/report" className="hover:text-brand-600 transition">
                  Report Problem
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-brand-600 transition">
                  Track Resolution
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-600 transition">
                  Operations Console
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-brand-600 transition">
                  Telemetry & Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: System Status */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">System State</p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span>Operational Core Online</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                AI Triage & REST APIs connected.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CampusPulse System. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>Next.js App Router</span>
            <span>•</span>
            <span>PostgreSQL Relational DB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
