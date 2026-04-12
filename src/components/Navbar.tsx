"use client";

import { useEffect, useState } from "react";
import { Scissors, User, LogOut, LayoutDashboard, Settings, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center space-x-3 group">
          <div className="bg-primary p-1.5 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">AutoClip</span>
        </a>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all active:scale-95"
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
                    <Sun className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ scale: 0, rotate: 90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </button>

          {loading ? (
            <div className="w-20 h-8 bg-muted animate-pulse rounded-xl" />
          ) : authState.authenticated ? (
            <div className="flex items-center space-x-4">
              {authState.user?.role === 'ADMIN' && (
                <a href="/admin" className="hidden sm:flex text-sm font-medium text-primary hover:text-primary/80 transition-colors items-center gap-2">
                  <Settings className="w-4 h-4" /> admin
                </a>
              )}
              <a href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <User className="w-4 h-4" /> Profile
              </a>
              <a 
                href="/generate" 
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Go to App
              </a>
              <button 
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <a href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</a>
              <a 
                href="/auth/register" 
                className="px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 transition-all"
              >
                Get Started
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
