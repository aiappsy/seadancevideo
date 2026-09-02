"use client";

import { useState, useEffect } from "react";
import { FaBullhorn, FaPaperPlane, FaTrash, FaUsers, FaUser, FaInfoCircle } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function AdminCommunicationPage() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [targetUserId, setTargetUserId] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [msgRes, usersRes] = await Promise.all([
        fetch("/api/admin/communication"),
        fetch("/api/admin/users"),
      ]);

      if (msgRes.ok) setMessages(await msgRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (e) {
      toast.error("Failed to load communication history");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }

    try {
      setSending(true);
      const res = await fetch("/api/admin/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          targetUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch message");

      toast.success(
        targetUserId === "all"
          ? "Broadcast sent to all users!"
          : "Direct message dispatched to user!"
      );
      setTitle("");
      setMessage("");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/communication?id=${msgId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Message deleted");
        fetchData();
      } else {
        toast.error("Delete failed");
      }
    } catch (e) {
      toast.error("Error deleting message");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
          User Communication Hub
        </h1>
        <p className="text-xs text-muted mt-1">
          Broadcast system notifications, promotions, or send targeted direct messages to specific users.
        </p>
      </div>

      {/* Compose Box */}
      <div className="bg-glass-bg border border-glass-border rounded-xl p-6 shadow-lg">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-4">
          <FaPaperPlane size={12} /> Dispatch Announcement or Message
        </h2>

        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                Recipient Target
              </label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="all">📢 Broadcast to All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    👤 {u.name} ({u.email || u.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                Announcement Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="info">Information / General Update</option>
                <option value="promo">Special Promotion / Deal</option>
                <option value="warning">System Alert / Maintenance</option>
                <option value="system">Engine Update</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-muted block mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New Seedance 2 Mini Model Available Now!"
              className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-muted block mb-1">
              Message Body
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement or direct message here..."
              className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
            >
              <FaPaperPlane size={11} />
              <span>{sending ? "Sending..." : "Dispatch Message"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Message History */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Dispatched Message History ({messages.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center bg-glass-bg border border-glass-border rounded-xl text-xs text-muted">
            No messages have been sent yet.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-glass-bg border border-glass-border rounded-xl flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        m.type === "warning"
                          ? "bg-amber-500/20 text-amber-300"
                          : m.type === "promo"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-primary/20 text-primary"
                      }`}
                    >
                      {m.type}
                    </span>
                    <span className="text-[10px] text-muted font-bold flex items-center gap-1">
                      {m.targetUserId === "all" ? (
                        <>
                          <FaUsers size={10} /> All Users
                        </>
                      ) : (
                        <>
                          <FaUser size={10} /> User: {m.targetUserId}
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-muted">
                      • {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground">{m.title}</h3>
                  <p className="text-xs text-secondary-text leading-relaxed whitespace-pre-wrap">
                    {m.message}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteMessage(m.id)}
                  className="p-2 text-muted hover:text-red-400 transition-colors rounded"
                  title="Delete"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
