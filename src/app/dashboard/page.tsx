"use client";

import { useState, useEffect } from "react";
import { Loader2, XCircle, Clock, Video, Download, RefreshCw, Layers, Play } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Job = {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  url?: string;
  type: string;
  video_title?: string;
  current_step?: string;
  results: any[] | null;
  error?: string;
  created_at: string;
};

import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "processing" | "results">("all");
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setMounted(true);
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan/menghapus job ini? Semua file terkait akan terhapus permanen.")) return;
    
    // Optimistic UI update
    setJobs(prev => prev.filter(j => j.id !== id));
    
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menghapus job");
        fetchJobs(); // Revert on fail
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
      fetchJobs();
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!job) return false;
    if (tab === "all") return true;
    if (tab === "processing") return job.status === "PENDING" || job.status === "PROCESSING";
    if (tab === "results") return job.status === "COMPLETED";
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground uppercase tracking-wider">
              <Layers className="text-primary-container w-8 h-8" />
              Terminal Jobs
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm font-mono uppercase tracking-widest">Monitor AI process & view clip outputs.</p>
          </div>
          <button 
            onClick={() => { setLoading(true); fetchJobs(); }}
            className="flex items-center space-x-2 px-6 py-2 bg-muted hover:bg-accent border border-border rounded-lg transition-all text-xs font-bold uppercase tracking-widest text-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-container' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted p-1 rounded-lg w-fit border border-border">
          {(["all", "processing", "results"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setCurrentPage(1); }}
              className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
                tab === t ? "bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,240,255,0.2)]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-12 h-12 text-primary-container animate-spin" />
            <p className="text-on-surface-variant font-mono text-xs uppercase tracking-widest">Fetching data nodes...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="border border-dashed border-border rounded-3xl py-24 text-center bg-muted">
            <Video className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">No active tasks in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {currentJobs.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card rounded-2xl p-6 hover:border-primary-container/40 transition-all space-y-6 relative overflow-hidden"
                >
                  {job.status === "PROCESSING" && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                      <div className="h-full bg-primary-container animate-pulse w-1/2 rounded-r-full shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
                    </div>
                  )}
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">ID: {(job.id || "").slice(0, 8)}</span>
                          <StatusBadge status={job.status} />
                        </div>
                        <h3 className="text-lg font-bold line-clamp-1 text-foreground uppercase tracking-wider">
                          {job.video_title || (job.type === 'youtube' ? `YT: ${job.url}` : 'LOCAL_UPLOAD')}
                          <span className="ml-2 text-xs text-slate-500 font-mono">
                            [{job.created_at ? new Date(job.created_at).toLocaleDateString() : '...'}]
                          </span>
                        </h3>
                        <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          INIT: {job.created_at ? new Date(job.created_at).toLocaleString() : "Unknown"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {job.status === "COMPLETED" && job.results && Array.isArray(job.results) && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-primary-container bg-primary-container/10 border border-primary-container/20 px-3 py-1 rounded uppercase tracking-widest">{job.results.length} Outputs Valid</span>
                          </div>
                        )}
                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          {job.status === "PENDING" || job.status === "PROCESSING" ? "Cancel Job" : "Delete"}
                        </button>
                      </div>
                    </div>

                  {/* Results Display */}
                  {job.status === "COMPLETED" && job.results && Array.isArray(job.results) && (
                    <JobResults results={job.results} />
                  )}

                  {job.status === "FAILED" && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3 mt-4">
                      <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-xs uppercase tracking-widest">Process Failed</p>
                        <p className="text-[10px] font-mono opacity-80 mt-1">{job.error || "System encountered an error during task execution."}</p>
                      </div>
                    </div>
                  )}

                  {job.status === "PROCESSING" && (
                    <div className="bg-primary-container/5 border border-primary-container/20 p-4 rounded-lg flex items-center gap-3 mt-4">
                      <Loader2 className="w-5 h-5 text-primary-container animate-spin" />
                      <div>
                        <p className="text-xs text-primary-container font-bold uppercase tracking-widest">{job.current_step || "Engine is crunching your data..."}</p>
                        <p className="text-[10px] text-primary-container/60 mt-1 font-mono uppercase tracking-widest">Please hold. Connection active.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 mt-6 bg-card border border-border rounded-xl">
                <span className="text-xs text-muted-foreground font-mono">
                  Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredJobs.length)} dari {filteredJobs.length} job
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 text-xs font-bold transition-all text-foreground uppercase tracking-wider"
                  >
                    Prev
                  </button>
                  <div className="flex items-center px-4 font-mono text-xs font-bold bg-background border border-border rounded-lg">
                    {currentPage} / {totalPages}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 text-xs font-bold transition-all text-foreground uppercase tracking-wider"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: Job["status"] }) {
  switch (status) {
    case "PENDING":
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-muted text-muted-foreground border border-border tracking-widest">PENDING</span>;
    case "PROCESSING":
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-primary-container/10 text-primary-container border border-primary-container/30 tracking-widest">PROCESSING</span>;
    case "COMPLETED":
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-green-500/10 text-green-400 border border-green-500/30 tracking-widest">COMPLETED</span>;
    case "FAILED":
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-red-500/10 text-red-400 border border-red-500/30 tracking-widest">FAILED</span>;
    default:
      return null;
  }
}

function JobResults({ results }: { results: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClips = results.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentClips.map((clip: any) => (
          <div key={clip.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary-container/50 transition-colors">
            <Link href={`/play?url=${encodeURIComponent(clip.url)}&title=${encodeURIComponent(clip.title)}`} className="aspect-[9/16] bg-surface-container relative flex items-center justify-center group/play cursor-pointer block overflow-hidden border-b border-border">
              <div className="absolute inset-0 bg-black/40 group-hover/play:bg-black/20 transition-colors z-10" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 z-0">
                  <Video className="w-12 h-12 mb-2" />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Data Rendered</span>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary-container/90 text-on-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover/play:scale-110 transition-transform z-20">
                 <Play className="w-6 h-6 ml-1" fill="currentColor" />
              </div>
            </Link>
            <div className="p-4 flex items-center justify-between">
               <div className="min-w-0">
                 <p className="text-xs font-bold uppercase tracking-wider truncate text-foreground">{clip.title}</p>
                 <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">DUR: {clip.duration}</p>
               </div>
               <a href={clip.url} download className="p-2 bg-muted hover:bg-primary-container/20 border border-border hover:border-primary-container/50 rounded flex items-center justify-center text-muted-foreground hover:text-primary-container transition-colors">
                 <Download className="w-4 h-4" />
               </a>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 border-t border-border pt-4">
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, results.length)} of {results.length} clips
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded bg-muted hover:bg-muted/80 disabled:opacity-50 text-[10px] font-bold transition-all text-foreground uppercase tracking-widest"
            >
              Prev
            </button>
            <div className="flex items-center px-3 font-mono text-[10px] font-bold">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded bg-muted hover:bg-muted/80 disabled:opacity-50 text-[10px] font-bold transition-all text-foreground uppercase tracking-widest"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
