"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Zap, Video, Users, Terminal, Plus, Settings, HelpCircle, LogOut, Moon, Sun, Menu, X, Scissors } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState("USER");

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);


  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create AutoClip", href: "/generate", icon: Scissors },
    { name: "Active Jobs", href: "/dashboard#jobs", icon: Zap },
    { name: "Media Library", href: "/dashboard#media", icon: Video },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-space flex selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-muted/80 backdrop-blur rounded-lg border border-border"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-0 flex flex-col h-full z-40 bg-card/90 backdrop-blur-2xl w-64 border-r border-border font-space text-xs tracking-widest transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-6 py-8 flex flex-col gap-1">
          <h1 className="text-primary-container font-black tracking-widest text-lg uppercase">Auto_Ops</h1>
          <p className="text-muted-foreground text-[10px]">V2.4.0-STABLE</p>
        </div>
        
        <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 uppercase tracking-widest ${
                  isActive 
                    ? "bg-primary-container/10 text-primary-container border-l-4 border-primary-container shadow-[0_0_15px_rgba(0,240,255,0.05)] font-bold" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <link.icon className={`w-4 h-4 ${isActive ? 'text-primary-container' : ''}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4">
          <Link href="/generate" className="w-full bg-primary-container text-on-primary-container font-bold py-3 px-4 rounded flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Plus className="w-4 h-4" />
            New Automation
          </Link>
        </div>
        
        <div className="border-t border-border py-4 px-2 space-y-1">
          {userRole === "ADMIN" && (
            <a 
              href="/admin"
              className="w-full flex items-center justify-between px-4 py-3 text-primary hover:bg-primary/10 rounded-lg transition-all uppercase tracking-widest font-bold mb-2 border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4" />
                <span>Admin Console</span>
              </div>
            </a>
          )}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between px-4 py-3 text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-all uppercase tracking-widest"
          >
            <div className="flex items-center gap-3">
              {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-border shadow-sm">
          <div className="flex justify-between items-center w-full px-6 py-4">
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold tracking-tighter text-foreground uppercase hidden sm:block">
                {pathname === '/admin' ? 'Admin Console' : 'Dashboard'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass-card px-3 py-1.5 flex items-center gap-2 rounded border-border">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Engine Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="py-6 px-8 flex flex-col sm:flex-row justify-between items-center border-t border-border bg-background mt-auto">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">© 2024 AUTOCLIP_DIGITAL_PRECISION</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="text-[10px] text-muted-foreground hover:text-primary-container transition-colors uppercase tracking-widest cursor-pointer">Security Protocols</span>
            <span className="text-[10px] text-muted-foreground hover:text-primary-container transition-colors uppercase tracking-widest cursor-pointer">Terminal Access</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
