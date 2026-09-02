"use client";

import { useState, useEffect } from "react";
import {
  FaSearch,
  FaCoins,
  FaShieldAlt,
  FaBan,
  FaCheckCircle,
  FaKey,
  FaUserEdit,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditsDelta, setCreditsDelta] = useState(50);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (e) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      setUpdating(true);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success("User updated!");
      fetchUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <Toaster position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            User Management & Ledgers
          </h1>
          <p className="text-xs text-muted mt-1">
            Search users, adjust credits, configure BYOK permissions, and toggle access roles.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-glass-bg border border-glass-border px-3 py-1.5 rounded-lg max-w-xs w-full">
          <FaSearch className="text-muted text-xs" />
          <input
            type="text"
            placeholder="Search email, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="bg-transparent text-xs text-foreground outline-none w-full placeholder:text-muted"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-glass-bg border border-glass-border rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-glass-border bg-glass-hover/40 text-[10px] uppercase font-bold text-muted tracking-wider">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Engine Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-glass-hover/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{u.name}</div>
                      <div className="text-[11px] text-muted truncate max-w-[200px]">
                        {u.email}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          u.role === "admin"
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-glass-hover text-muted"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-foreground">
                      <span className="text-primary font-black">{u.credits}</span> pts
                    </td>
                    <td className="p-3">
                      {u.byokEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <FaKey size={8} /> BYOK
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted">AI Included</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold capitalize ${
                          u.status === "suspended" ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {u.status || "active"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 bg-glass-hover hover:bg-glass-bg border border-glass-border text-foreground rounded text-[10px] font-bold transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Management Action Drawer/Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">{selectedUser.name}</h3>
                <p className="text-xs text-muted truncate">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Adjust Credits */}
            <div className="space-y-2 p-3 bg-glass-hover/50 rounded-lg border border-glass-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block flex items-center gap-1">
                <FaCoins className="text-primary" /> Adjust Credits (Current: {selectedUser.credits})
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={creditsDelta}
                  onChange={(e) => setCreditsDelta(parseInt(e.target.value, 10) || 0)}
                  className="w-24 px-2 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground font-bold text-center"
                />
                <button
                  disabled={updating}
                  onClick={() =>
                    handleUpdateUser(selectedUser.id, { creditsAdjustment: creditsDelta })
                  }
                  className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primary-hover transition-colors"
                >
                  Add (+{creditsDelta})
                </button>
                <button
                  disabled={updating}
                  onClick={() =>
                    handleUpdateUser(selectedUser.id, { creditsAdjustment: -creditsDelta })
                  }
                  className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-xs font-bold hover:bg-red-500/30 transition-colors"
                >
                  Deduct (-{creditsDelta})
                </button>
              </div>
            </div>

            {/* Role & Status Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted block">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    handleUpdateUser(selectedUser.id, { role: e.target.value })
                  }
                  className="w-full px-2 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted block">Status</label>
                <select
                  value={selectedUser.status || "active"}
                  onChange={(e) =>
                    handleUpdateUser(selectedUser.id, { status: e.target.value })
                  }
                  className="w-full px-2 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* BYOK Toggle */}
            <div className="flex items-center justify-between p-3 bg-glass-hover/40 rounded-lg border border-glass-border">
              <div>
                <span className="text-xs font-bold text-foreground block">BYOK Access</span>
                <span className="text-[10px] text-muted">Allow user to bypass platform credits</span>
              </div>
              <button
                onClick={() =>
                  handleUpdateUser(selectedUser.id, { byokEnabled: !selectedUser.byokEnabled })
                }
                className={`px-3 py-1 rounded text-[10px] font-bold ${
                  selectedUser.byokEnabled
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-divider text-muted"
                }`}
              >
                {selectedUser.byokEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
