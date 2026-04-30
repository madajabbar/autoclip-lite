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

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "processing" | "results">("all");
  const [mounted, setMounted] = useState(false);

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

  const filteredJobs = jobs.filter((job) => {
    if (!job) return false;
    if (tab === "all") return true;
    if (tab === "processing") return job.status === "PENDING" || job.status === "PROCESSING";
    if (tab === "results") return job.status === "COMPLETED";
    return true;
  });

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Layers className="text-primary w-8 h-8" />
              Job Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Pantau proses AI dan lihat riwayat klip Anda.</p>
          </div>
          <button 
            onClick={() => { setLoading(true); fetchJobs(); }}
            className="flex items-center space-x-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-all text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-card p-1 rounded-xl w-fit border border-border">
          {(["all", "processing", "results"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground text-glow text-sm">Sedang mengambil data pekerjaan Anda...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="border border-dashed border-border rounded-3xl py-24 text-center">
            <Video className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Tidak ada pekerjaan ditemukan di kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-6"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground/60">ID: {(job.id || "").slice(0, 8)}</span>
                        <StatusBadge status={job.status} />
                      </div>
                      <h3 className="text-lg font-semibold line-clamp-1 text-foreground">
                        {job.video_title || (job.type === 'youtube' ? `YouTube: ${job.url}` : 'Manual File Upload')}
                        <span className="ml-2 text-sm text-muted-foreground font-normal">
                          [{job.created_at ? new Date(job.created_at).toLocaleDateString() : '...'}]
                        </span>
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.created_at ? new Date(job.created_at).toLocaleString() : "Unknown date"}
                      </p>
                    </div>

                    {job.status === "COMPLETED" && job.results && Array.isArray(job.results) && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full">{job.results.length} Clips Ready</span>
                      </div>
                    )}
                  </div>

                  {/* Results Display */}
                  {job.status === "COMPLETED" && job.results && Array.isArray(job.results) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-border pt-6">
                      {job.results.map((clip: any) => (
                        <div key={clip.id} className="bg-background/50 border border-border rounded-xl  overflow-hidden group hover:border-primary/50 transition-colors">
                          <Link href={`/play?url=${encodeURIComponent(clip.url)}&title=${encodeURIComponent(clip.title)}`} className="aspect-[9/16] bg-muted relative flex items-center justify-center group/play cursor-pointer block overflow-hidden">
                            <div className="absolute inset-0 bg-black/40 group-hover/play:bg-black/20 transition-colors z-10" />
                            {/* Teks placeholder jika gambar thumbnail belum ada */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 z-0">
                                <Video className="w-12 h-12 mb-2" />
                                <span className="text-xs font-bold uppercase">Video Ready</span>
                            </div>
                            {/* Tombol Play */}
                            <div className="w-14 h-14 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl group-hover/play:scale-110 transition-transform z-20">
                               <Play className="w-6 h-6 ml-1" fill="currentColor" />
                            </div>
                          </Link>
                          <div className="p-3 flex items-center justify-between">
                             <div className="min-w-0">
                               <p className="text-sm font-medium truncate text-foreground">{clip.title}</p>
                               <p className="text-xs text-muted-foreground">{clip.duration}</p>
                             </div>
                             <a href={clip.url} download className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary transition-colors">
                               <Download className="w-4 h-4" />
                             </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {job.status === "FAILED" && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-start gap-3">
                      <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Proses Gagal</p>
                        <p className="text-xs opacity-80">{job.error || "Terjadi kesalahan saat memproses video."}</p>
                      </div>
                    </div>
                  )}

                  {job.status === "PROCESSING" && (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <div>
                        <p className="text-sm text-primary font-medium">{job.current_step || "Sistem sedang memproses klip Anda..."}</p>
                        <p className="text-[10px] text-primary/60 mt-0.5 font-bold uppercase tracking-wider">Mohon tunggu, jangan tutup aplikasi.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Job["status"] }) {
  switch (status) {
    case "PENDING":
      return <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-muted text-muted-foreground border border-border">PENDING</span>;
    case "PROCESSING":
      return <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">PROCESSING</span>;
    case "COMPLETED":
      return <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-green-500/10 text-green-500 border border-green-500/20">COMPLETED</span>;
    case "FAILED":
      return <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-red-500/10 text-red-500 border border-red-500/20">FAILED</span>;
    default:
      return null;
  }
}
