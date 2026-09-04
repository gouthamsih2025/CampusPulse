"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  PlusCircle,
  Search,
  LayoutDashboard,
  BarChart3,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: ShieldAlert },
    { name: "Report Issue", href: "/report", icon: PlusCircle },
    { name: "Track Issue", href: "/track", icon: Search },
    { name: "Admin Portal", href: "/admin", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <Link
          href="/"
          className="flex items-center space-x-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg p-1"
          aria-label="CampusPulse Home"
        >
          <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-subtle group-hover:bg-brand-700 transition">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              Campus<span className="text-brand-600">Pulse</span>
              <span className="text-[9px] uppercase font-bold tracking-wider bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200/60">
                SaaS
              </span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
              Campus Operations & Issue Triage
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center space-x-1"
        >
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
                  isActive
                    ? "bg-brand-50 text-brand-700 border border-brand-200/60 shadow-subtle"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-brand-600" : "text-slate-400"
                  )}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Mobile Trigger */}
        <div className="flex items-center space-x-3">
          <Link
            href="/report"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span>New Report</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Close menu" : "Open main menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-dropdown animate-in slide-in-from-top-2 duration-150"
        >
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition",
                  isActive
                    ? "bg-brand-50 text-brand-700 font-bold border border-brand-200"
                    : "text-slate-700 hover:bg-slate-50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-brand-600" : "text-slate-400"
                  )}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
