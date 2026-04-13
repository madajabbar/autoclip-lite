"use client";

import { useState, useEffect } from "react";
import { Mail, Shield, CheckCircle, XCircle, Loader2, Search, UserPlus } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editForm, setEditForm] = useState({ email: "", role: "", password: "" });
  const [addForm, setAddForm] = useState({ email: "", password: "", role: "USER", is_verified: true });

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_verified: !currentStatus })
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      alert("Gagal mengubah status verifikasi.");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({ email: user.email, role: user.role, password: "" });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        fetchUsers();
        setEditingUser(null);
      }
    } catch (e) {
      alert("Gagal menyimpan perubahan.");
    }
  };

  const handleCreateUser = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
        setIsAddingUser(false);
        setAddForm({ email: "", password: "", role: "USER", is_verified: true });
      } else {
        alert(data.error || "Gagal membuat user.");
      }
    } catch (e) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Hapus user ini selamanya?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      alert("Gagal menghapus user.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen User</h1>
          <p className="text-muted-foreground mt-2">Kelola otorisasi dan akses pengguna platform.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Cari user (email)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-primary/50 transition-all text-foreground"
            />
          </div>
          
          <button 
            onClick={() => setIsAddingUser(true)}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah User</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-muted text-muted-foreground text-sm uppercase">
            <tr>
              <th className="px-8 py-5 font-semibold">User</th>
              <th className="px-8 py-5 font-semibold">Status</th>
              <th className="px-8 py-5 font-semibold">Role</th>
              <th className="px-8 py-5 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {user.email[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground">{user.email}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => toggleVerification(user.id, user.is_verified)}
                    className={`flex items-center space-x-1.5 text-sm font-medium px-4 py-1.5 rounded-full transition-all ${
                      user.is_verified 
                        ? 'text-green-500 bg-green-500/10 border border-green-500/20' 
                        : 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20'
                    }`}
                  >
                    {user.is_verified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>{user.is_verified ? 'Verified' : 'Unverified (Click to verify)'}</span>
                  </button>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-sm font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'text-primary' : 'text-muted-foreground'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="px-4 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-[40px] p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Edit User</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground ml-1">Role</label>
                <select 
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none appearance-none text-foreground"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground ml-1">New Password (Empty to skip)</label>
                <input 
                  type="password" 
                  value={editForm.password}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none text-foreground"
                  placeholder="********"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setEditingUser(null)}
                className="flex-grow py-4 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold transition-all"
              >
                Batal
              </button>
              <button 
                onClick={saveEdit}
                className="flex-grow py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-[40px] p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Tambah User Baru</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none text-foreground"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground ml-1">Password</label>
                <input 
                  type="password" 
                  value={addForm.password}
                  onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                  className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none text-foreground"
                  placeholder="********"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground ml-1">Role</label>
                <select 
                  value={addForm.role}
                  onChange={(e) => setAddForm({...addForm, role: e.target.value})}
                  className="w-full bg-muted border border-border rounded-2xl py-4 px-6 outline-none appearance-none text-foreground"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <input 
                  type="checkbox" 
                  id="is_verified"
                  checked={addForm.is_verified}
                  onChange={(e) => setAddForm({...addForm, is_verified: e.target.checked})}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="is_verified" className="text-sm font-medium text-foreground cursor-pointer">
                  Langsung Verifikasi Akun
                </label>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setIsAddingUser(false)}
                className="flex-grow py-4 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleCreateUser}
                className="flex-grow py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
              >
                Buat User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
