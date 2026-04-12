"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (res.ok) {
        // Redirect to dashboard
        window.location.href = "/generate";
      } else {
        alert(data.error || "Login gagal");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-card border border-border p-8 md:p-12 rounded-[40px] shadow-sm relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Selamat Datang</h1>
          <p className="text-muted-foreground">Masuk untuk melanjutkan proses Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
              <input
                required
                type="email"
                placeholder="anda@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted border border-border focus:border-primary rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted border border-border focus:border-primary rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-foreground"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <a href="/auth/register" className="text-primary hover:underline font-bold">Bikin Sekarang</a>
        </p>
      </motion.div>
    </div>
  );
}
