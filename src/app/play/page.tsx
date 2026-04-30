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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/50">Video URL tidak valid.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navbar */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>
        <h1 className="font-semibold text-sm truncate max-w-[150px] md:max-w-md text-white/90">{title}</h1>
        <a 
          href={url} 
          download 
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl transition-all shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline font-bold text-sm">Download</span>
        </a>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-neutral-950">
         <div className="relative aspect-[9/16] h-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <video 
              src={url} 
              controls 
              autoPlay 
              className="w-full h-full object-cover bg-black" 
            />
         </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <PlayVideo />
    </Suspense>
  );
}
