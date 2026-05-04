"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Trash2, Star, Loader2, User } from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Form State
  const [form, setForm] = useState({
    user_name: "",
    user_role: "",
    comment: "",
    rating: 5,
    avatar_url: ""
  });

  const fetchReviews = () => {
    fetch("/api/admin/reviews")
      .then(res => res.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        fetchReviews();
        setShowForm(false);
        setForm({ user_name: "", user_role: "", comment: "", rating: 5, avatar_url: "" });
      }
    } catch (e) {
      alert("Gagal menambah ulasan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus ulasan ini?")) return;
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchReviews();
    } catch (e) {
      alert("Gagal menghapus.");
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ulasan Pengguna</h1>
          <p className="text-muted-foreground mt-2">Kelola testimoni yang muncul di Landing Page.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> {showForm ? 'Batal' : 'Tambah Ulasan'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-primary p-10 rounded-[40px] space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground ml-1">Nama Pengguna</label>
              <input 
                required
                type="text" 
                value={form.user_name}
                onChange={(e) => setForm({...form, user_name: e.target.value})}
                className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none text-foreground focus:border-primary transition-colors"
                placeholder="Misal: Ahmad Fauzi"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground ml-1">Jabatan / Role</label>
              <input 
                required
                type="text" 
                value={form.user_role}
                onChange={(e) => setForm({...form, user_role: e.target.value})}
                className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none text-foreground focus:border-primary transition-colors"
                placeholder="Misal: Content Creator"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-muted-foreground ml-1">Komentar Testimoni</label>
              <textarea 
                required
                rows={3}
                value={form.comment}
                onChange={(e) => setForm({...form, comment: e.target.value})}
                className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none resize-none text-foreground focus:border-primary transition-colors"
                placeholder="Apa yang mereka katakan tentang AutoClip?"
              />
            </div>
          </div>
          <button type="submit" className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all">Simpan Testimoni</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentReviews.map((review) => (
          <div key={review.id} className="bg-card border border-border p-8 rounded-[40px] relative group h-fit shadow-sm hover:shadow-md transition-all">
            <button 
              onClick={() => handleDelete(review.id)}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <User />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{review.user_name}</h3>
                <p className="text-sm text-muted-foreground">{review.user_role}</p>
              </div>
            </div>
            <p className="text-foreground/80 italic mb-6 leading-relaxed">"{review.comment}"</p>
            <div className="flex text-yellow-500">
              {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center px-8 py-4 bg-card border border-border rounded-[20px]">
          <span className="text-xs text-muted-foreground font-mono">
            Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, reviews.length)} dari {reviews.length} ulasan
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 text-xs font-bold transition-all text-foreground uppercase tracking-wider"
            >
              Prev
            </button>
            <div className="flex items-center px-4 font-mono text-xs font-bold bg-background border border-border rounded-lg">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 text-xs font-bold transition-all text-foreground uppercase tracking-wider"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
