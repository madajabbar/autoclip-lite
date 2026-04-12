"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token tidak ditemukan.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.error || "Gagal memverifikasi akun.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Terjadi kesalahan koneksi.");
      }
    };

    verify();
  }, [token]);

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-md w-full bg-card border border-border p-10 rounded-[40px] text-center space-y-6 shadow-sm"
    >
      {status === "loading" && (
        <div className="py-8 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Sedang Memverifikasi...</h2>
          <p className="text-muted-foreground italic">Mohon tunggu sebentar sementara kami memvalidasi akun Anda.</p>
        </div>
      )}

      {status === "success" && (
        <>
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Berhasil!</h2>
          <p className="text-muted-foreground">Akun Anda telah aktif. Sekarang Anda bisa masuk dan mulai membuat konten.</p>
          <button 
            onClick={() => window.location.href = "/auth/login"}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all font-bold shadow-lg shadow-primary/20"
          >
            Login Sekarang
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Verifikasi Gagal</h2>
          <p className="text-muted-foreground">{message}</p>
          <button 
            onClick={() => window.location.href = "/auth/register"}
            className="w-full py-4 bg-muted hover:bg-muted/80 border border-border rounded-2xl transition-all font-bold text-foreground"
          >
            Coba Daftar Lagi
          </button>
        </>
      )}
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors duration-300">
      <Suspense fallback={
        <div className="bg-card border border-border p-10 rounded-[40px] shadow-sm flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Memuat halaman verifikasi...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
