"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Settings, MessageSquare, LogOut, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menu = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, href: "/admin" },
    { id: "users", label: "Users", icon: <Users className="w-5 h-5" />, href: "/admin/users" },
    { id: "content", label: "Content", icon: <Settings className="w-5 h-5" />, href: "/admin/content" },
    { id: "reviews", label: "Reviews", icon: <MessageSquare className="w-5 h-5" />, href: "/admin/reviews" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl p-6 flex flex-col fixed h-full">
        <div className="flex items-center space-x-3 mb-12">
          <div className="bg-primary p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg uppercase tracking-widest text-primary">Admin CPU</span>
        </div>

        <nav className="flex-grow space-y-2">
          {menu.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="pt-6 border-t border-border">
          <button 
            onClick={() => window.location.href = "/"}
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-red-500 w-full transition-all rounded-xl hover:bg-red-500/5 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Keluar Panel</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
