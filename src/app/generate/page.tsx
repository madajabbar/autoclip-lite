"use client";

import { useState, useEffect } from "react";
import { Tv, Upload, Scissors, Download, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

export default function Page() {
  const [tab, setTab] = useState<"youtube" | "upload">("youtube");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [results, setResults] = useState<{ id: string; url: string; title: string; duration: string }[]>([]);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Persistence: Check localStorage on mount
  useEffect(() => {
    const savedJobId = localStorage.getItem("autoclip_active_job");
    if (savedJobId) {
      setActiveJobId(savedJobId);
    }
  }, []);

  // Polling Logic
  useEffect(() => {
    if (!activeJobId) return;

    let pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${activeJobId}`);
        if (!res.ok) throw new Error("Gagal mengecek status");
        
        const data = await res.json();
        
        if (data.status === "COMPLETED") {
          setResults(data.results || []);
          setLoading(false);
          setActiveJobId(null);
          localStorage.removeItem("autoclip_active_job");
          clearInterval(pollInterval);
        } else if (data.status === "FAILED") {
          alert("Gagal: " + (data.error || "Terjadi kesalahan internal."));
          setLoading(false);
          setActiveJobId(null);
          localStorage.removeItem("autoclip_active_job");
          clearInterval(pollInterval);
        } else if (data.status === "PROCESSING") {
          setLoadingText(data.current_step || "Sedang memproses video (AI & FFmpeg)...");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [activeJobId]);

  const handleGenerate = async () => {
    setLoading(true);
    setLoadingText("Mendaftarkan tugas ke antrian...");
    
    try {
      const formData = new FormData();
      if (tab === "upload" && file) {
        formData.append("file", file);
      } else if (tab === "youtube" && url) {
        formData.append("url", url);
      } else {
        alert("Please provide a video!");
        setLoading(false);
        return;
      }

      if (csvFile) {
        formData.append("csv", csvFile);
      }

      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert("Error: " + (data.error || "Something went wrong"));
        setLoading(false);
        return;
      }

      setActiveJobId(data.jobId);
      localStorage.setItem("autoclip_active_job", data.jobId);
      alert("Sukses! Tugas Anda telah masuk antrian. Anda bisa memantau progresnya di halaman Dashboard.");
      
      // Clear input after success to allow adding more jobs
      setUrl("");
      setFile(null);
      setCsvFile(null);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12 pb-12 pt-4">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4"
          >
            <Scissors className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            AutoClip Magic
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Hasilkan klip pendek dari video panjang dengan AI. Otomatis potong dan tempelkan subtitle bergaya kekinian.
          </p>
        </div>

        {/* Builder Box */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden"
        >
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-lg font-medium animate-pulse text-foreground">{loadingText}</p>
            </div>
          )}

          <div className="flex bg-muted p-1 rounded-xl w-fit mx-auto mb-8 border border-border">
            <button
              onClick={() => setTab("youtube")}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "youtube" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>YouTube URL</span>
            </button>
            <button
              onClick={() => setTab("upload")}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "upload" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Video</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "youtube" ? (
              <motion.div
                key="youtube"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Tautan YouTube</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-muted border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors bg-muted/50">
                  <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Drag & drop video di sini, atau</p>
                  <label className="cursor-pointer text-primary hover:text-primary/80 font-bold pb-0.5 border-b border-primary/30">
                    Pilih File
                    <input type="file" className="hidden" accept="video/mp4,video/x-m4v,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                  {file && <p className="mt-4 text-sm text-green-500 font-bold">Terpilih: {file.name}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Optional CSV Upload */}
          <div className="mt-8 border-t border-border pt-8">
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <span className="bg-primary/20 text-primary p-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Opsional</span>
              CSV Panduan Waktu
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Gunakan CSV dengan header: <code>start_time, end_time, topic, summary</code> untuk menentukan persis bagian mana yang ingin dipotong. 
              <br />
              Atau <a href="/template.csv" download className="text-primary hover:underline font-medium">Download Template CSV</a>.
            </p>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-muted hover:bg-muted/80 border border-border px-4 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium text-foreground">
                <Upload className="w-4 h-4" />
                Pilih File CSV
                <input type="file" className="hidden" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
              </label>
              {csvFile && <div className="text-sm text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 font-bold">{csvFile.name} siap.</div>}
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button 
              onClick={handleGenerate}
              disabled={loading || (tab === "youtube" && !url) || (tab === "upload" && !file)}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-10 py-4 rounded-xl font-bold text-lg flex items-center space-x-2 transition-all shadow-xl shadow-primary/20 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Scissors className="w-5 h-5" />
              <span>Generate Magic Clips</span>
            </button>
          </div>
        </motion.div>

        {/* Results Section */}
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold border-b border-border pb-4 text-foreground">Hasil Potongan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((clip) => (
                <div key={clip.id} className="bg-card border border-border rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-[9/16] bg-black relative flex items-center justify-center overflow-hidden">
                    <video 
                      src={clip.url} 
                      controls 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-1 text-foreground">{clip.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">Durasi: {clip.duration}</p>
                    </div>
                    <a href={clip.url} download className="p-3 bg-muted hover:bg-muted/80 rounded-full transition-colors text-primary border border-border inline-flex shadow-sm">
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
