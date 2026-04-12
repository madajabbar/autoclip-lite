"use client";

import { motion } from "framer-motion";
import { Scissors, Zap, Shield, Globe, Layers, BarChart, Cpu, Sparkles } from "lucide-react";

const features = [
  {
    icon: <Scissors />,
    title: "AI Clipping",
    description: "Algoritma kami secara cerdas memotong video panjang Anda menjadi klip-klip viral yang siap diunggah ke TikTok, Reels, atau Shorts."
  },
  {
    icon: <Zap />,
    title: "Instant Processing",
    description: "Proses rendering super cepat menggunakan akselerasi perangkat keras, memungkinkan Anda menghasilkan puluhan klip dalam hitungan menit."
  },
  {
    icon: <Globe />,
    title: "Multi-Language AI",
    description: "Mendukung transkripsi dan subtitle dalam berbagai bahasa menggunakan teknologi Whisper AI terbaru dari OpenAI."
  },
  {
    icon: <Sparkles />,
    title: "Dynamic Subtitles",
    description: "Subtitle yang interaktif dan bergaya trendi. Kata-kata yang sedang diucapkan akan di-highlight secara otomatis untuk meningkatkan engagement."
  },
  {
    icon: <Cpu />,
    title: "Local Execution",
    description: "Pemrosesan audio dan video terjadi secara lokal, memastikan data berharga Anda tidak pernah keluar dari server yang aman."
  },
  {
    icon: <Layers />,
    title: "Batch Processing",
    description: "Unggah daftar timestamp melalui CSV dan biarkan sistem kami memproses semuanya secara otomatis tanpa pengawasan."
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Header */}
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-bold tracking-tight text-foreground"
          >
            Teknologi Hebat di Balik <br /> <span className="text-primary text-glow">Kreativitas Anda.</span>
          </motion.h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Kami menggabungkan AI tercanggih dengan kemudahan penggunaan untuk memberikan Anda alat produksi video terbaik di kelasnya.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 bg-card border border-border rounded-[40px] hover:border-primary/50 transition-all group hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-muted border border-border rounded-[50px] p-12 md:p-20 text-center space-y-8"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">Siap Menghebatkan Konten Anda?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto"> Bergabunglah dengan ribuan kreator yang sudah beralih ke AutoClip untuk efisiensi produksi video yang maksimal.</p>
          <div className="flex justify-center">
            <a href="/auth/register" className="px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all">
              Mulai Gunakan Fitur Pro
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
