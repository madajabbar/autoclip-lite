"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Send, MapPin, Phone, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [info, setInfo] = useState<any>({
    email: "support@autoclip.ai",
    address: "Sudirman Central Business District, Jakarta",
    phone: "+62 812 3456 7890"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings?.contact_info) {
          setInfo(data.settings.contact_info);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Info Column */}
        <div className="space-y-12">
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
            >
              Ada Pertanyaan? <br /> <span className="text-primary text-glow">Hubungi Kami.</span>
            </motion.h1>
            <p className="text-muted-foreground">
              Tim kami siap membantu Anda 24/7. Kirimkan pesan atau kunjungi media sosial kami.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary shrink-0 border border-border">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Email Support</h3>
                <p className="text-sm text-muted-foreground">{info.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary shrink-0 border border-border">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Telepon</h3>
                <p className="text-sm text-muted-foreground">{info.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary shrink-0 border border-border">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Office</h3>
                <p className="text-sm text-muted-foreground">{info.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border p-8 md:p-10 rounded-[40px] shadow-sm hover:shadow-md transition-all space-y-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Nama Lengkap</label>
              <input type="text" placeholder="John Doe" className="w-full bg-muted border border-border focus:border-primary rounded-2xl py-4 px-6 outline-none transition-all text-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
              <input type="email" placeholder="john@example.com" className="w-full bg-muted border border-border focus:border-primary rounded-2xl py-4 px-6 outline-none transition-all text-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Subjek</label>
            <input type="text" placeholder="Tanya tentang paket Pro" className="w-full bg-muted border border-border focus:border-primary rounded-2xl py-4 px-6 outline-none transition-all text-foreground" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Pesan</label>
            <textarea rows={4} placeholder="Halo, saya ingin bertanya..." className="w-full bg-muted border border-border focus:border-primary rounded-2xl py-4 px-6 outline-none transition-all resize-none text-foreground" />
          </div>

          <button className="w-full py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 group">
            Kirim Pesan Sekarang
            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
