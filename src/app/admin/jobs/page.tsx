"use client";

import { useState, useEffect } from "react";
import { Clock, RefreshCw, Activity, CheckCircle, XCircle, Loader2, AlertCircle, Youtube, Upload, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJobs = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
    } catch (e) {
      console.error("Gagal mengambil data jobs.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Hapus data job ini? Video yang sudah diproses juga akan hilang dari sistem.")) return;
    
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchJobs();
      } else {
        alert("Gagal menghapus job.");
      }
    } catch (e) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const filteredJobs = jobs.filter(j => 
    (j.user_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse';
      case 'FAILED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PROCESSING': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'FAILED': return <XCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Monitor</h1>
          <p className="text-muted-foreground mt-2">Pantau antrean dan status pemrosesan video secara real-time.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari email user..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-primary/50 transition-all text-foreground"
            />
          </div>
          
          <button 
            onClick={fetchJobs}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-muted hover:bg-muted/80 text-foreground px-5 py-3 rounded-2xl font-bold transition-all border border-border"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Manual'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-[30px] space-y-1 shadow-sm">
          <p className="text-sm text-muted-foreground font-medium">Total Jobs</p>
          <p className="text-3xl font-bold text-foreground">{jobs.length}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-[30px] space-y-1 shadow-sm">
          <p className="text-sm text-blue-500 font-medium tracking-wide border-b border-blue-500/10 pb-1">Running</p>
          <p className="text-3xl font-bold text-blue-500 pt-1">
            {jobs.filter(j => j.status === 'PROCESSING').length}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-[30px] space-y-1 shadow-sm">
          <p className="text-sm text-green-500 font-medium tracking-wide border-b border-green-500/10 pb-1">Completed</p>
          <p className="text-3xl font-bold text-green-500 pt-1">
            {jobs.filter(j => j.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-[30px] space-y-1 shadow-sm">
          <p className="text-sm text-red-500 font-medium tracking-wide border-b border-red-500/10 pb-1">Failed</p>
          <p className="text-3xl font-bold text-red-500 pt-1">
            {jobs.filter(j => j.status === 'FAILED').length}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5 font-semibold">User / ID</th>
                <th className="px-8 py-5 font-semibold">Type</th>
                <th className="px-8 py-5 font-semibold">Status</th>
                <th className="px-8 py-5 font-semibold">Created At</th>
                <th className="px-8 py-5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground italic">
                    {searchTerm ? `Tidak ditemukan job untuk "${searchTerm}"` : "Belum ada antrean job."}
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">{job.user_email || 'Guest/Unknown'}</div>
                          <div className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit uppercase">ID: {job.id.split('-')[0]}...</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-sm text-foreground">
                          {job.type === 'youtube' ? <Youtube className="w-4 h-4 text-red-500" /> : <Upload className="w-4 h-4 text-blue-500" />}
                          <span className="capitalize">{job.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(job.status)}`}>
                            {getStatusIcon(job.status)}
                            <span>{job.status}</span>
                          </div>
                          {job.status === 'COMPLETED' && job.results && job.results.length > 0 && (
                            <div className="text-[10px] text-green-500 font-bold block ml-1">{job.results.length} Clips OK</div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-muted-foreground">
                        {new Date(job.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {job.status === 'COMPLETED' && job.results && job.results.length > 0 && (
                            <button 
                              onClick={() => {
                                const el = document.getElementById(`results-${job.id}`);
                                if (el) el.classList.toggle('hidden');
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all"
                            >
                              <Video className="w-3 h-3" />
                              <span>Lihat Hasil</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Hapus Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expandable Results Area */}
                    <tr id={`results-${job.id}`} className="hidden bg-muted/10 border-b border-border">
                        <td colSpan={5} className="px-8 py-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {job.results && job.results.map((clip: any) => (
                                    <div key={clip.id} className="bg-card border border-border rounded-2xl overflow-hidden group">
                                        <div className="aspect-[9/16] bg-black relative">
                                            <video src={clip.url} controls className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[10px] font-bold truncate text-foreground mb-1">{clip.title}</p>
                                            <a 
                                              href={clip.url} 
                                              download 
                                              className="flex items-center justify-center space-x-1 w-full py-1.5 bg-muted hover:bg-muted/80 text-[10px] font-bold rounded-lg transition-all"
                                            >
                                                <Download className="w-3 h-3" />
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
