"use client";

import { useState, useEffect } from "react";
import { Users, Video, DollarSign, Activity, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, jobsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/jobs")
        ]);
        
        const usersData = await usersRes.json();
        const jobsData = await jobsRes.json();

        if (usersData.users && jobsData.jobs) {
          setStats({
            totalUsers: usersData.users.length,
            verifiedUsers: usersData.users.filter((u: any) => u.is_verified).length,
            totalJobs: jobsData.jobs.length,
            activeJobs: jobsData.jobs.filter((j: any) => j.status === 'PROCESSING' || j.status === 'PENDING').length,
            admins: usersData.users.filter((u: any) => u.role === 'ADMIN').length,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-primary-container w-10 h-10" />
    </div>
  );

  const cardData = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: <Users className="w-5 h-5" />, color: "text-primary-container border-primary-container/30 bg-primary-container/10" },
    { label: "Verified Accounts", value: stats?.verifiedUsers || 0, icon: <Activity className="w-5 h-5" />, color: "text-green-400 border-green-500/30 bg-green-500/10" },
    { label: "Total Jobs", value: stats?.totalJobs || 0, icon: <Video className="w-5 h-5" />, color: "text-secondary-container border-secondary-container/30 bg-secondary-container/10" },
    { label: "Admin Team", value: stats?.admins || 0, icon: <DollarSign className="w-5 h-5" />, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  ];

  return (
    <div className="space-y-10 relative z-10 font-space">
      <div className="flex justify-between items-end">
        <div>
          <p className="font-mono text-xs text-primary-container uppercase mb-1 tracking-widest">System Overview</p>
          <h1 className="text-3xl font-bold text-foreground uppercase tracking-wider">Dashboard Console</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, i) => (
          <div key={i} className="glass-card p-6 rounded-xl space-y-4 hover:border-primary-container/40 transition-all border border-border">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${card.color}`}>
                {card.icon}
              </div>
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{card.label}</p>
              <h2 className="text-4xl font-bold mt-2 tracking-tight text-foreground">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for chart/table */}
      <div className="glass-card rounded-2xl p-10 h-[400px] flex items-center justify-center border border-border border-dashed relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-container/5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>
        <div className="text-muted-foreground/60 space-y-4 relative z-10 text-center">
          <Activity className="w-12 h-12 mx-auto text-primary-container opacity-50" />
          <p className="font-mono text-xs uppercase tracking-widest">Telemetry Data will appear here</p>
        </div>
      </div>
    </div>
  );
}
