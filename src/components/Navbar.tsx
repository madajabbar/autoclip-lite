"use client";

import { useEffect, useState } from "react";
import { Scissors, User, LogOut, LayoutDashboard, Settings, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [authState, setAuthState] = useState<{ authenticated: boolean; user?: any }>({
    authenticated: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthState({ authenticated: true, user: data.user });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-colors duration-300">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        <a href="/" className="text-2xl font-bold tracking-tighter text-primary-container font-space flex items-center gap-2 group">
          <div className="bg-primary-container/20 p-1.5 rounded-lg border border-primary-container/30 group-hover:scale-110 transition-transform">
            <Scissors className="w-5 h-5 text-primary-container" />
          </div>
          AutoClip
        </a>
        
        <nav className="hidden md:flex gap-8 items-center">
          <a href="/features" className="font-space tracking-tight text-sm uppercase text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="/pricing" className="font-space tracking-tight text-sm uppercase text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="/contact" className="font-space tracking-tight text-sm uppercase text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-6">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            aria-label="Toggle Theme"
          >
            {mounted && (
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ scale: 0, rotate: 90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </button>

          {loading ? (
            <div className="w-24 h-8 bg-muted animate-pulse rounded-lg" />
          ) : authState.authenticated ? (
            <div className="flex items-center space-x-4">
              {authState.user?.role === 'ADMIN' && (
                <a href="/admin" className="hidden sm:flex text-xs font-bold text-primary-container hover:text-primary-container/80 transition-colors items-center gap-1 uppercase tracking-wider">
                  <Settings className="w-3 h-3" /> Admin
                </a>
              )}
              <a href="/dashboard" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 uppercase tracking-wider">
                <User className="w-3 h-3" /> Profile
              </a>
              <a 
                href="/generate" 
                className="px-6 py-2 bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
              >
                Launch App
              </a>
              <button 
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <a href="/auth/login" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">Sign In</a>
              <a 
                href="/auth/register" 
                className="px-6 py-2 bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
              >
                Initialize
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
