"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, PlusCircle, LayoutDashboard, BarChart3, Search } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/report", label: "Report Issue", icon: PlusCircle },
    { href: "/admin", label: "Admin Operations", icon: LayoutDashboard },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
              Campus<span className="text-blue-600">Pulse</span>
              <span className="text-[10px] uppercase font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Ops</span>
            </span>
            <p className="text-xs text-slate-500 hidden sm:block">Campus Operations & Issue Triage</p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
