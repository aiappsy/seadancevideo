"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaUsers,
  FaVideo,
  FaDollarSign,
  FaKey,
  FaArrowRight,
  FaCogs,
  FaBullhorn,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    byokUsers: 0,
    totalCreations: 0,
    totalPlans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, plansRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/plans"),
      ]);

      const users = usersRes.ok ? await usersRes.json() : [];
      const plans = plansRes.ok ? await plansRes.json() : [];

      setStats({
        totalUsers: users.length,
        byokUsers: users.filter((u) => u.byokEnabled).length,
        totalCreations: 0, // Placeholder or fetch
        totalPlans: plans.length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
          Platform Overview & Telemetry
        </h1>
        <p className="text-xs text-muted mt-1">
          Monitor active user metrics, BYOK adoption, subscription plans, and dynamic system state.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-glass-bg border border-glass-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Total Users
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FaUsers size={14} />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground">
            {loading ? "..." : stats.totalUsers}
          </span>
          <p className="text-[10px] text-muted mt-1">Registered accounts</p>
        </div>

        <div className="p-5 rounded-xl bg-glass-bg border border-glass-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              BYOK Active Users
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FaKey size={14} />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-400">
            {loading ? "..." : stats.byokUsers}
          </span>
          <p className="text-[10px] text-muted mt-1">Using own API key</p>
        </div>

        <div className="p-5 rounded-xl bg-glass-bg border border-glass-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Active Plans
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FaDollarSign size={14} />
            </div>
          </div>
          <span className="text-2xl font-black text-foreground">
            {loading ? "..." : stats.totalPlans}
          </span>
          <p className="text-[10px] text-muted mt-1">Pricing tiers available</p>
        </div>

        <div className="p-5 rounded-xl bg-glass-bg border border-glass-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Engine Status
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FaVideo size={14} />
            </div>
          </div>
          <span className="text-base font-bold text-emerald-400">Operational</span>
          <p className="text-[10px] text-muted mt-1">Seedance 2.0 & Mini</p>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/settings"
          className="p-5 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <FaCogs className="text-primary text-xl" />
            <FaArrowRight className="text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="text-sm font-bold text-foreground">System Settings</h3>
          <p className="text-xs text-muted mt-1">
            Configure Master API keys, theme defaults, credit multipliers, Stripe & PayPal keys.
          </p>
        </Link>

        <Link
          href="/admin/plans"
          className="p-5 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <FaDollarSign className="text-emerald-400 text-xl" />
            <FaArrowRight className="text-muted group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Plan Management</h3>
          <p className="text-xs text-muted mt-1">
            Create and edit AI Included credit tiers and BYOK subscriptions dynamically.
          </p>
        </Link>

        <Link
          href="/admin/communication"
          className="p-5 rounded-xl bg-glass-bg border border-glass-border hover:bg-glass-hover transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <FaBullhorn className="text-amber-400 text-xl" />
            <FaArrowRight className="text-muted group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Communication Hub</h3>
          <p className="text-xs text-muted mt-1">
            Broadcast announcements or send targeted direct messages to users.
          </p>
        </Link>
      </div>
    </div>
  );
}
