"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2 as Check, 
  Zap as ZapIcon, 
  Rocket as RocketIcon, 
  Building2 as BuildingIcon, 
  Loader2 as Loader 
} from "lucide-react";

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings?.pricing_plans) {
          setPlans(data.settings.pricing_plans);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader className="animate-spin text-primary w-8 h-8" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
          >
            Investasi untuk Konten <span className="text-primary text-glow">Berkualitas.</span>
          </motion.h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan produksi video Anda. Batalkan kapan saja tanpa biaya tambahan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-10 rounded-[40px] border relative overflow-hidden transition-all hover:scale-[1.02] ${
                plan.popular 
                  ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/20' 
                  : 'bg-card border-border hover:border-primary/30 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-bl-3xl">
                  Best Value
                </div>
              )}
              
              <div className="space-y-6">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center border border-border text-primary">
                  {plan.icon === 'Rocket' ? <RocketIcon className="w-6 h-6" /> : plan.icon === 'Building2' ? <BuildingIcon className="w-6 h-6" /> : <ZapIcon className="w-6 h-6" />}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">Rp {plan.price}</span>
                  <span className="text-muted-foreground text-sm">/bulan</span>
                </div>

                <ul className="space-y-4 pt-4 border-t border-border">
                  {plan.features?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-2xl font-bold transition-all mt-4 ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20' 
                    : 'bg-muted hover:bg-muted/80 border border-border text-foreground'
                }`}>
                  Pilih {plan.name}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
