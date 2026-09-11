"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, FolderKanban, BookOpen, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const sidebarLinks = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/student/events", label: "Events", icon: Calendar },
  { href: "/student/projects", label: "Projects", icon: FolderKanban },
  { href: "/student/resources", label: "Resources", icon: BookOpen },
  { href: "/student/issues", label: "My Issues", icon: AlertCircle },
  { href: "/student/profile", label: "Profile", icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <aside className="hidden md:flex flex-col w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-3 space-y-1 sticky top-24">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pb-1">Student Portal</p>
            {sidebarLinks.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", active ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/60" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}>
                  <Icon className={cn("h-4 w-4", active ? "text-brand-600" : "text-slate-400")} />
                  {label}
                </Link>
              );
            })}
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
