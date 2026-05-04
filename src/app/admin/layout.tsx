"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Settings, MessageSquare, LogOut, ShieldCheck, Activity, ArrowLeft, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const menu = [
    { id: "dashboard", label: "System Console", icon: <LayoutDashboard className="w-5 h-5" />, href: "/admin" },
    { id: "users", label: "User Management", icon: <Users className="w-5 h-5" />, href: "/admin/users" },
    { id: "jobs", label: "Job Monitor", icon: <Activity className="w-5 h-5" />, href: "/admin/jobs" },
    { id: "content", label: "Content Control", icon: <Settings className="w-5 h-5" />, href: "/admin/content" },
    { id: "reviews", label: "Feedback/Reviews", icon: <MessageSquare className="w-5 h-5" />, href: "/admin/reviews" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 font-space selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/90 backdrop-blur-xl flex flex-col fixed h-full z-40">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="font-bold text-lg uppercase tracking-widest text-primary block">Admin CPU</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">v2.4.0-CORE</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all uppercase tracking-widest text-xs font-bold ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border space-y-2">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between px-4 py-3 text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl transition-all uppercase tracking-widest text-xs font-bold"
          >
            <div className="flex items-center space-x-3">
              {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </button>
          
          <a 
            href="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-primary transition-all rounded-xl hover:bg-primary/10 group uppercase tracking-widest text-xs font-bold w-full"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to App</span>
          </a>
          
          <button 
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:text-red-400 w-full transition-all rounded-xl hover:bg-red-500/10 group uppercase tracking-widest text-xs font-bold"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>System Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 min-h-screen flex flex-col bg-background relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-10">
          <div className="flex items-center gap-4">
             <div className="glass-card px-3 py-1.5 flex items-center gap-2 rounded border-border">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Root Access Active</span>
             </div>
          </div>
        </header>

        <div className="p-10 relative z-10 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
