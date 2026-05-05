"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Suspense } from "react";

function PlayVideo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url");
  const title = searchParams.get("title") || "Video Player";

  if (!url) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-space">
        <p className="text-foreground/50 font-mono text-xs uppercase tracking-widest">Video URL Invalid.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-space pt-20">
      {/* Navbar Overlay */}
      <div className="p-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
        <h1 className="font-bold text-xs uppercase tracking-widest truncate max-w-[150px] md:max-w-md text-foreground/90">{title}</h1>
        <a 
          href={url} 
          download 
          className="flex items-center gap-2 bg-primary-container hover:bg-primary-container/80 text-on-primary-container px-4 py-2 rounded transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">Download</span>
        </a>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/5 blur-[100px] rounded-full pointer-events-none z-0"></div>
         <div className="relative z-10 aspect-[9/16] h-full max-h-[80vh] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.1)] ring-1 ring-primary-container/20 glass-card">
            <video 
              src={url} 
              controls 
              className="w-full h-full object-cover bg-black" 
            />
         </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div></div>}>
      <PlayVideo />
    </Suspense>
  );
}
