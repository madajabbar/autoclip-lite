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

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const cardData = [
    { label: "Total Pengguna", value: stats?.totalUsers || 0, icon: <Users className="w-5 h-5" />, color: "bg-blue-500/10 text-blue-500" },
    { label: "Akun Terverifikasi", value: stats?.verifiedUsers || 0, icon: <Activity className="w-5 h-5" />, color: "bg-green-500/10 text-green-500" },
    { label: "Total Video (Job)", value: stats?.totalJobs || 0, icon: <Video className="w-5 h-5" />, color: "bg-yellow-500/10 text-yellow-500" },
    { label: "Tim Admin", value: stats?.admins || 0, icon: <DollarSign className="w-5 h-5" />, color: "bg-purple-500/10 text-purple-500" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ringkasan Sistem</h1>
        <p className="text-muted-foreground mt-2">Pantau metrik utama platform Anda secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-[30px] space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <h2 className="text-3xl font-bold mt-1 tracking-tight text-foreground">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for chart/table */}
      <div className="bg-muted/30 border border-border rounded-[40px] p-10 text-center h-[400px] flex items-center justify-center border-dashed">
        <div className="text-muted-foreground/60 space-y-2">
          <Activity className="w-10 h-10 mx-auto opacity-20" />
          <p>Grafik Aktivitas Akan Muncul Di Sini</p>
        </div>
      </div>
    </div>
  );
}
