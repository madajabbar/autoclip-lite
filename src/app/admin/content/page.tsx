"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, Video, DollarSign, Layout } from "lucide-react";

export default function AdminContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showClipSelector, setShowClipSelector] = useState(false);
  const [availableClips, setAvailableClips] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    pricing_plans: [],
    contact_info: {},
    demo_video: ""
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  const openClipSelector = async () => {
    setShowClipSelector(true);
    const res = await fetch("/api/admin/all-clips");
    const data = await res.json();
    if (data.clips) setAvailableClips(data.clips);
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) alert(`Setting ${key} diperbarui!`);
    } catch (e) {
      alert("Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-primary"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Konten</h1>
        <p className="text-muted-foreground mt-2">Atur teks, harga, dan media di seluruh website Anda.</p>
      </div>

      {/* Demo Video Section */}
      <section className="bg-card border border-border p-10 rounded-[40px] space-y-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Video className="text-primary w-6 h-6" />
            <h2 className="text-xl font-bold text-foreground">Video Demo Utama</h2>
          </div>
          <button 
            onClick={openClipSelector}
            className="text-xs bg-muted hover:bg-muted/80 border border-border px-4 py-2 rounded-xl text-primary font-bold transition-all"
          >
            Pilih dari Clip Tergenerate
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground ml-1">URL YouTube atau Path Clip Lokal</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={settings.demo_video} 
              onChange={(e) => setSettings({...settings, demo_video: e.target.value})}
              className="flex-grow bg-muted border border-border focus:border-primary rounded-2xl py-4 px-6 outline-none transition-all placeholder:text-muted-foreground/30 text-foreground"
              placeholder="https://youtube.com/... atau /autoclip-results/..."
            />
            <button 
              onClick={() => handleSave('demo_video', settings.demo_video)}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </div>
      </section>

      {/* Clip Selector Modal */}
      {showClipSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-2xl rounded-[40px] p-8 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Pilih Clip Terbaik</h2>
              <button onClick={() => setShowClipSelector(false)} className="p-2 hover:bg-muted rounded-full transition-all text-foreground/50 hover:text-foreground">✕</button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {availableClips.length === 0 && <p className="text-center text-muted-foreground py-10">Belum ada clip yang dihasilkan.</p>}
              {availableClips.map((clip) => (
                <div key={clip.id} className="p-4 bg-muted/50 border border-border rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm truncate max-w-[300px] text-foreground">{clip.video_title}</span>
                    <span className="text-xs text-muted-foreground">Mulai: {clip.start_time} - Topik: {clip.topic || 'Klip'}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSettings({...settings, demo_video: clip.url});
                      setShowClipSelector(false);
                    }}
                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl text-xs font-bold transition-all"
                  >
                    Gunakan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Info Section */}
      <section className="bg-card border border-border p-10 rounded-[40px] space-y-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="text-primary w-6 h-6" />
          <h2 className="text-xl font-bold text-foreground">Informasi Kontak</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground ml-1">Email Support</label>
            <input 
              type="text" 
              value={settings.contact_info.email || ""} 
              onChange={(e) => setSettings({...settings, contact_info: {...settings.contact_info, email: e.target.value}})}
              className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground ml-1">Telepon</label>
            <input 
              type="text" 
              value={settings.contact_info.phone || ""} 
              onChange={(e) => setSettings({...settings, contact_info: {...settings.contact_info, phone: e.target.value}})}
              className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none text-foreground"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-muted-foreground ml-1">Alamat Kantor</label>
            <input 
              type="text" 
              value={settings.contact_info.address || ""} 
              onChange={(e) => setSettings({...settings, contact_info: {...settings.contact_info, address: e.target.value}})}
              className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none text-foreground"
            />
          </div>
        </div>
        <button 
          onClick={() => handleSave('contact_info', settings.contact_info)}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Save className="w-4 h-4" /> Simpan Informasi Kontak
        </button>
      </section>

      <div className="p-10 text-center border border-dashed border-border rounded-[40px] text-muted-foreground">
        <DollarSign className="w-8 h-8 mx-auto opacity-20 mb-2 text-primary" />
        Editor Harga akan menyusul di versi pembaruan berikutnya. <br /> Anda tetap bisa mengubahnya via Database untuk saat ini.
      </div>
    </div>
  );
}
