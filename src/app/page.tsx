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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-muted border border-border rounded-full mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">CMS Terintegrasi: Atur Konten Langsung dari Admin</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-8xl font-bold tracking-tight mb-8 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent"
          >
            Ubah Video Panjang <br /> Jadi Klip Viral <span className="text-primary text-glow">Otomatis.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            Hemat jam kerja dengan AI Clipping terpintar. Tambahkan subtitle dinamis dan potret highlight terbaik video Anda dalam satu klik.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="/auth/register"
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center gap-2 group"
            >
              Mulai Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={demoVideo}
              className="px-8 py-4 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-2xl font-bold text-lg transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Lihat Demo
            </a>
          </motion.div>
        </div>
      </section>

      {/* Video Browser Mockup Section */}
      <section className="pb-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-2 md:p-4 bg-card/50 border border-border rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-3xl group"
          >
            {/* Browser Dots */}
            <div className="flex space-x-2 mb-4 ml-4 mt-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>

            {/* Video Container */}
            <div className="aspect-video bg-black/60 rounded-[30px] overflow-hidden relative">
              {demoVideo.includes("youtube.com") || demoVideo.includes("youtu.be") ? (
                <iframe 
                  className="w-full h-full"
                  src={demoVideo.replace("watch?v=", "embed/").split("&")[0]} 
                  title="AutoClip Demo"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  className="w-full h-full object-cover"
                  src={demoVideo}
                  controls
                  autoPlay
                  muted
                  loop
                ></video>
              )}
            </div>

            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
          </motion.div>
        </div>
      </section>

      {/* Testimonials from Admin */}
      {reviews.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Apa Kata Mereka?</h2>
              <p className="text-muted-foreground">Bergabunglah dengan ribuan kreator sukses lainnya.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-card border border-border rounded-[40px] space-y-6 shadow-sm"
                >
                  <div className="flex text-yellow-500">
                    {[...Array(review.rating || 5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-foreground/80 italic">"{review.comment}"</p>
                  <div className="flex items-center space-x-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {review.user_name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold">{review.user_name}</h4>
                      <p className="text-xs text-muted-foreground">{review.user_role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Fitur Canggih untuk Content Creator</h2>
            <p className="text-muted-foreground">Teknologi mutakhir yang memudahkan alur kerja video Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="AI Magic Clipping"
              description="Algoritma kami mendeteksi highlight video secara otomatis berbasis konteks percakapan."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Whisper AI Lokal"
              description="Transkripsi super akurat tanpa perlu koneksi internet, menjamin keamanan data Anda."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Subtitle Dinamis"
              description="Pilih berbagai gaya subtitle viral seperti TikTok, Netflix, atau anime dengan satu klik."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Pilih Paket Anda</h2>
            <p className="text-muted-foreground">Mulai gratis dan tingkatkan seiring pertumbuhan Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              tier="Lite"
              price="0"
              description="Untuk pemula yang ingin mencoba"
              features={["5 Video / Bulan", "Subtitle Standar", "Watermark Video"]}
            />
            <PricingCard
              tier="Pro"
              price="199k"
              popular
              description="Untuk kreator konten serius"
              features={["Unlimited Video", "Subtitle Premium", "Tanpa Watermark", "Dukungan Prioritas"]}
            />
            <PricingCard
              tier="Enterprise"
              price="Custom"
              description="Untuk agensi dan tim besar"
              features={["API Access", "Custom Model AI", "Dedicated Server", "Multi-user Access"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1 rounded-lg">
              <Scissors className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">AutoClip</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="text-sm">
            © 2026 AutoClip. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-card border border-border rounded-3xl hover:border-primary/50 transition-all group shadow-sm hover:shadow-md">
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function PricingCard({ tier, price, description, features, popular }: { tier: string, price: string, description: string, features: string[], popular?: boolean }) {
  return (
    <div className={`p-8 rounded-3xl border transition-all flex flex-col ${popular ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/10' : 'bg-card border-border hover:border-primary/30 shadow-sm'}`}>
      {popular && (
        <span className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-full w-fit mb-4">Paling Populer</span>
      )}
      <h3 className="text-2xl font-bold mb-2">{tier}</h3>
      <p className="text-muted-foreground text-sm mb-6">{description}</p>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-bold">Rp {price}</span>
        {price !== "Custom" && <span className="text-muted-foreground text-sm">/bulan</span>}
      </div>
      <ul className="space-y-4 mb-10 flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-4 rounded-2xl font-bold transition-all ${popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-muted hover:bg-muted/80 border border-border text-foreground'}`}>
        Pilih {tier}
      </button>
    </div>
  );
}
