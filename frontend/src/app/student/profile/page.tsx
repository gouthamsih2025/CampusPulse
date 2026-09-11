"use client";
import { useState } from "react";
import { Mail, Building2, Hash, Phone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const DEMO_PROFILES = [
  { name: "Arjun Sharma", email: "arjun.sharma@campus.edu", role: "student", department: "Computer Science", studentId: "CS2023001", phone: "+91-9876543210" },
  { name: "Priya Nair", email: "priya.nair@campus.edu", role: "student", department: "Electronics", studentId: "EC2023045", phone: "+91-9876543211" },
  { name: "Dr. Ravi Kumar", email: "ravi.kumar@campus.edu", role: "staff", department: "Facilities", studentId: "STF001", phone: "+91-9876543212" },
];

export default function StudentProfilePage() {
  const [profileIdx, setProfileIdx] = useState(0);
  const profile = DEMO_PROFILES[profileIdx];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Demo profile — switch between personas to explore.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
        ⚠️ <strong>Demo Mode:</strong> This is a demonstration profile selector. In a real application, this would be replaced by proper authentication.
      </div>

      <Card>
        <CardHeader><CardTitle>Switch Demo Persona</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {DEMO_PROFILES.map((p, i) => (
            <button key={i} onClick={() => setProfileIdx(i)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition ${i === profileIdx ? "bg-brand-50 border-brand-200 text-brand-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <div className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
              {p.name}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6 text-white">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold mb-3">{profile.name.split(" ").map(w=>w[0]).join("")}</div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-brand-200 text-sm">{profile.department}</p>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4"><Badge variant={profile.role === "staff" ? "warning" : "brand"} className="capitalize">{profile.role}</Badge></div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Mail, label: "Email", value: profile.email },
              { icon: Building2, label: "Department", value: profile.department },
              { icon: Hash, label: "ID", value: profile.studentId },
              { icon: Phone, label: "Phone", value: profile.phone },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center"><f.icon className="h-4 w-4 text-slate-400" /></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">{f.label}</p><p className="text-sm text-slate-900 font-medium">{f.value}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
