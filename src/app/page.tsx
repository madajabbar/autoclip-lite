"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scissors, Zap, Shield, Globe, ArrowRight, Play, CheckCircle2, User, Star } from "lucide-react";

export default function LandingPage() {
  const [demoVideo, setDemoVideo] = useState("https://www.youtube.com/watch?v=6d2KuiZDFrg");
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Settings
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings?.demo_video) setDemoVideo(data.settings.demo_video);
      });

    // Fetch Reviews
    fetch("/api/admin/reviews")
      .then(res => res.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-space overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 md:pt-32 overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary-container/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-secondary-container/5 blur-[100px] rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 max-w-7xl">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-primary-container/30 bg-primary-container/10 text-primary text-[10px] tracking-[0.3em] font-bold uppercase w-fit"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary-container animate-pulse" />
              CMS Terintegrasi
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-[72px] leading-[1.1] font-bold tracking-tight mb-6 text-foreground"
            >
              UBAH VIDEO PANJANG <br />
              JADI KLIP VIRAL <span className="text-primary text-glow">OTOMATIS.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-on-surface-variant max-w-xl mb-10"
            >
              Hemat jam kerja dengan AI Clipping terpintar. Tambahkan subtitle dinamis dan potret highlight terbaik video Anda dalam satu klik.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="/auth/register"
                className="px-8 py-4 bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-200 flex items-center gap-2"
              >
                Mulai Sekarang
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={demoVideo}
                className="px-8 py-4 border border-primary-container text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary-container/5 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Lihat Demo
              </a>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="glass-card w-full rounded-xl overflow-hidden relative group aspect-square lg:aspect-auto lg:h-[600px]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-40 z-10 pointer-events-none"></div>
              
              {/* Floating Data Points */}
              <div className="absolute top-6 right-6 z-20 glass-card px-4 py-2 text-[10px] font-mono text-primary border-primary-container/20 uppercase tracking-wider">
                RENDER_STATUS: ACTIVE
              </div>
              <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-container animate-pulse rounded-full"></div>
                <span className="text-[10px] font-mono tracking-widest text-foreground/70">LIVE_ENGINE_V2.0</span>
              </div>

              {/* Video Player */}
              <div className="absolute inset-0 z-0 opacity-80 group-hover:scale-105 transition-transform duration-[2000ms]">
                {demoVideo.includes("youtube.com") || demoVideo.includes("youtu.be") ? (
                  <iframe 
                    className="w-full h-full scale-[1.3] pointer-events-none"
                    src={demoVideo.replace("watch?v=", "embed/").split("&")[0] + "?autoplay=1&mute=1&controls=0&loop=1"} 
                    title="AutoClip Demo"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    className="w-full h-full object-cover"
                    src={demoVideo}
                    autoPlay
                    muted
                    loop
                  ></video>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 bg-surface relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col mb-16 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Fitur Core Engine</h2>
            <p className="text-on-surface-variant max-w-2xl">Arsitektur modular yang dirancang untuk mempercepat alur kerja video Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:min-h-[600px]">
            <div className="md:col-span-2 glass-card p-10 flex flex-col justify-end group hover:border-primary-container/40 transition-all min-h-[300px]">
              <Zap className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4 uppercase">AI Magic Clipping</h3>
              <p className="text-on-surface-variant max-w-md">Algoritma kami mendeteksi highlight video secara otomatis berbasis konteks percakapan dengan presisi tinggi.</p>
            </div>
            
            <div className="glass-card p-10 border-secondary-container/20 hover:border-secondary-container/50 transition-all flex flex-col justify-between">
              <div>
                <Globe className="w-10 h-10 text-on-secondary-container mb-6" />
                <h3 className="text-xl font-bold text-foreground mb-2 uppercase">Whisper AI Lokal</h3>
              </div>
              <p className="text-on-surface-variant">Transkripsi super akurat tanpa perlu koneksi internet, menjamin privasi & keamanan data Anda.</p>
            </div>
            
            <div className="glass-card p-10 hover:border-primary-container/40 transition-all flex flex-col justify-between">
              <div>
                <Shield className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold text-foreground mb-2 uppercase">Subtitle Dinamis</h3>
              </div>
              <p className="text-on-surface-variant">Berbagai preset gaya subtitle viral seperti TikTok atau Netflix dengan mapping metadata cerdas.</p>
            </div>
            
            <div className="md:col-span-2 glass-card p-10 flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-primary-container/5 to-transparent">
              <div className="w-full md:w-1/2">
                <h3 className="text-2xl font-bold text-foreground mb-4 uppercase">Integrasi CMS</h3>
                <p className="text-on-surface-variant">Kelola aset dan metadata proyek Anda. Sinkronisasi sempurna dengan arsitektur headless untuk kontrol penuh.</p>
              </div>
              <div className="w-full md:w-1/2 h-full min-h-[160px] relative rounded-lg overflow-hidden border border-border bg-card flex items-center justify-center">
                <div className="text-[10px] font-mono text-primary/50 uppercase tracking-widest text-center">
                  [ System Active ] <br/> <br/> 
                  Processing Node: 0x8F <br/>
                  Latency: 12ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Metrik Kepuasan</h2>
              <p className="text-on-surface-variant">Divalidasi oleh ribuan kreator dan tim berkinerja tinggi.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 glass-card border-border hover:border-primary-container/30 transition-all flex flex-col"
                >
                  <div className="flex text-tertiary-fixed-dim mb-6">
                    {[...Array(review.rating || 5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-on-surface-variant italic mb-8 flex-grow">"{review.comment}"</p>
                  <div className="flex items-center space-x-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 bg-primary-container/10 border border-primary-container/20 rounded flex items-center justify-center text-primary font-bold uppercase">
                      {review.user_name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">{review.user_name}</h4>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">{review.user_role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-surface relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Pilih Paket Performa</h2>
            <p className="text-on-surface-variant">Rencana terukur untuk kreator mandiri hingga agensi global.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              tier="Lite"
              label="PRECISION_ENTRY"
              price="0"
              features={["5 Video / Bulan", "Subtitle Standar", "Watermark Video"]}
            />
            <PricingCard
              tier="Pro"
              label="PRECISION_ADVANCED"
              price="199k"
              popular
              features={["Unlimited Video", "Subtitle Premium", "Tanpa Watermark", "Prioritas Render"]}
            />
            <PricingCard
              tier="Enterprise"
              label="PRECISION_ELITE"
              price="Custom"
              features={["Akses API REST", "Model AI Khusus", "Dedicated Server", "Multi-user Access"]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="glass-card p-12 md:p-24 text-center rounded-2xl relative overflow-hidden border-primary-container/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 via-transparent to-secondary-container/10 opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 tracking-tighter uppercase">
              SIAP UNTUK <span className="text-primary text-glow">UPGRADE?</span>
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto mb-12 text-lg">
              Bergabunglah dengan ribuan kreator sukses yang telah mengotomatisasi produksi video mereka dengan AutoClip.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <a href="/auth/register" className="px-12 py-5 bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                Buat Akun
              </a>
              <a href="#" className="text-foreground text-xs font-bold uppercase border-b border-primary-container pb-1 hover:text-primary-container transition-colors tracking-widest">
                Dokumentasi API
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background w-full border-t border-border mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-8 max-w-screen-2xl mx-auto gap-8">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="text-primary font-bold text-lg flex items-center justify-center md:justify-start gap-2">
              <Scissors className="w-4 h-4" /> AutoClip
            </div>
            <div className="text-[10px] tracking-widest uppercase text-slate-600">
              © 2026 AUTOCLIP_DIGITAL_PRECISION. All rights reserved.
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-[10px] tracking-widest uppercase text-slate-600 hover:text-primary-container transition-colors">Privacy</a>
            <a href="#" className="text-[10px] tracking-widest uppercase text-slate-600 hover:text-primary-container transition-colors">Terms of Service</a>
            <a href="/contact" className="text-[10px] tracking-widest uppercase text-slate-600 hover:text-primary-container transition-colors">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({ tier, label, price, features, popular }: { tier: string, label: string, price: string, features: string[], popular?: boolean }) {
  return (
    <div className={`glass-card p-8 flex flex-col transition-all ${popular ? 'border-primary-container/50 bg-primary-container/5 relative scale-105 z-20' : 'hover:border-border'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container text-[10px] font-bold px-4 py-1 uppercase tracking-widest rounded-sm">
          Paling Populer
        </div>
      )}
      <div className={`text-[10px] font-bold tracking-widest mb-2 uppercase ${popular ? 'text-primary' : 'text-slate-400'}`}>
        {label}
      </div>
      <div className="text-4xl font-bold text-foreground mb-6">
        {price === "Custom" ? "Custom" : `Rp ${price}`}
        {price !== "Custom" && <span className="text-sm font-normal text-slate-500">/bln</span>}
      </div>
      <ul className="space-y-4 mb-10 flex-grow">
        {features.map((f, i) => (
          <li key={i} className={`flex items-center gap-3 text-sm ${popular ? 'text-foreground' : 'text-on-surface-variant'}`}>
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${popular ? 'text-primary' : 'text-primary-container/70'}`} />
            {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-all ${popular ? 'bg-primary-container text-on-primary-container hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]' : 'border border-border text-foreground hover:bg-white/5'}`}>
        Pilih {tier}
      </button>
    </div>
  );
}
