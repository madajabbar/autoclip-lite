"use client";

import { useState, useEffect } from "react";
import { Upload, Save, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  
  const [settings, setSettings] = useState({
    logo_position: "TOP_CENTER",
    logo_size: "MEDIUM",
    logo_opacity: 1.0,
    existing_logo_url: ""
  });

  useEffect(() => {
    fetch("/api/user/settings")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            logo_position: data.logo_position || "TOP_CENTER",
            logo_size: data.logo_size || "MEDIUM",
            logo_opacity: data.logo_opacity !== undefined ? data.logo_opacity : 1.0,
            existing_logo_url: data.logo_url || ""
          });
          if (data.logo_url) {
            setLogoPreview(data.logo_url);
          }
        }
        setLoading(false);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    
    const formData = new FormData();
    if (logoFile) formData.append("logo", logoFile);
    formData.append("logo_position", settings.logo_position);
    formData.append("logo_size", settings.logo_size);
    formData.append("logo_opacity", settings.logo_opacity.toString());
    formData.append("existing_logo_url", settings.existing_logo_url);

    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Pengaturan berhasil disimpan!");
        if (data.logo_url) {
          setSettings(s => ({ ...s, existing_logo_url: data.logo_url }));
        }
      } else {
        setMessage(data.error || "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      setMessage("Terjadi kesalahan jaringan.");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 font-space">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-primary-container">Preferensi Video</h1>
      </div>

      <div className="glass-card p-6 rounded-xl space-y-6">
        <h2 className="text-lg font-bold border-b border-border pb-2">Watermark Logo</h2>
        
        {/* Upload Logo */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Logo Perusahaan / Kreator</label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-lg bg-surface flex items-center justify-center overflow-hidden border border-border">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary-container/80 transition-colors"
              />
              <p className="text-xs text-muted-foreground">Logo akan otomatis di-crop menjadi rasio 1:1 (kotak) pada video final.</p>
            </div>
          </div>
        </div>

        {/* Ukuran Logo */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Ukuran Logo</label>
          <div className="flex gap-4">
            {['SMALL', 'MEDIUM', 'LARGE'].map((size) => (
              <label key={size} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="logo_size" 
                  value={size} 
                  checked={settings.logo_size === size}
                  onChange={(e) => setSettings({ ...settings, logo_size: e.target.value })}
                  className="accent-primary-container"
                />
                <span className="text-sm">{size === 'SMALL' ? 'Kecil' : size === 'MEDIUM' ? 'Sedang' : 'Besar'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Posisi Logo */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Posisi Logo</label>
          <select 
            value={settings.logo_position}
            onChange={(e) => setSettings({ ...settings, logo_position: e.target.value })}
            className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
          >
            <option value="TOP_LEFT">Atas Kiri</option>
            <option value="TOP_CENTER">Atas Tengah</option>
            <option value="TOP_RIGHT">Atas Kanan</option>
            <option value="BOTTOM_LEFT">Bawah Kiri</option>
            <option value="BOTTOM_CENTER">Bawah Tengah</option>
            <option value="BOTTOM_RIGHT">Bawah Kanan</option>
          </select>
        </div>

        {/* Opacity Logo */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
            <span>Transparansi (Opacity)</span>
            <span>{Math.round(settings.logo_opacity * 100)}%</span>
          </label>
          <input 
            type="range" 
            min="0.1" 
            max="1.0" 
            step="0.05" 
            value={settings.logo_opacity}
            onChange={(e) => setSettings({ ...settings, logo_opacity: parseFloat(e.target.value) })}
            className="w-full accent-primary-container"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className={`text-sm font-bold ${message.includes('Gagal') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary-container/80 text-on-primary-container px-6 py-3 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          SIMPAN
        </button>
      </div>
    </div>
  );
}
