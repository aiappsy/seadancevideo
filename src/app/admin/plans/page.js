"use client";

import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaKey,
  FaCoins,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "ai_included", // 'ai_included' | 'byok'
    interval: "one_time", // 'one_time' | 'month' | 'year'
    price: 10,
    credits: 250,
    description: "",
    featuresText: "",
    isPopular: false,
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (res.ok) setPlans(data);
    } catch (e) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        id: plan.id,
        name: plan.name,
        type: plan.type || "ai_included",
        interval: plan.interval || "one_time",
        price: plan.price,
        credits: plan.credits || 0,
        description: plan.description || "",
        featuresText: (plan.features || []).join("\n"),
        isPopular: Boolean(plan.isPopular),
        isActive: plan.isActive !== false,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        id: `plan_${Date.now().toString().slice(-6)}`,
        name: "",
        type: "ai_included",
        interval: "one_time",
        price: 10,
        credits: 200,
        description: "",
        featuresText: "HD Video Generation\nSeedance 2.0 & Mini Access\nDirect MP4 Downloads",
        isPopular: false,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined) {
      toast.error("Plan name and price are required");
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      credits: formData.type === "byok" ? 0 : parseInt(formData.credits, 10) || 0,
      features: formData.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);
      const method = editingPlan ? "PUT" : "POST";
      const res = await fetch("/api/admin/plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(editingPlan ? "Plan updated!" : "Plan created!");
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans?id=${planId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Plan deleted");
        fetchPlans();
      } else {
        toast.error("Failed to delete plan");
      }
    } catch (e) {
      toast.error("Error deleting plan");
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, isActive: !plan.isActive }),
      });
      if (res.ok) {
        fetchPlans();
        toast.success(`Plan ${plan.isActive ? "deactivated" : "activated"}`);
      }
    } catch (e) {
      toast.error("Toggle failed");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Plan & Subscription Management
          </h1>
          <p className="text-xs text-muted mt-1">
            Configure credit packs (AI Included) and BYOK memberships shown to customers.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-all flex items-center gap-2 shadow-md shadow-primary/20"
        >
          <FaPlus size={12} />
          <span>New Pricing Plan</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isByok = plan.type === "byok";
            return (
              <div
                key={plan.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  plan.isActive
                    ? "bg-glass-bg border-glass-border"
                    : "bg-glass-bg/40 border-glass-border/40 opacity-60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isByok
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-primary/20 text-primary border border-primary/30"
                          }`}
                        >
                          {isByok ? <FaKey size={8} /> : <FaCoins size={8} />}
                          {isByok ? "BYOK Membership" : "AI Included"}
                        </span>
                        {plan.isPopular && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                            Popular
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-foreground mt-1.5">
                        {plan.name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-foreground">
                        ${plan.price}
                      </span>
                      <span className="text-[10px] text-muted block">
                        {plan.interval === "month"
                          ? "/ month"
                          : plan.interval === "year"
                          ? "/ year"
                          : "one-time"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-secondary-text leading-relaxed min-h-[2.5rem]">
                    {plan.description}
                  </p>

                  <div className="p-2 rounded bg-glass-hover/60 text-xs font-bold text-foreground">
                    {isByok
                      ? "0 Platform Credits (Use Own API Key)"
                      : `${plan.credits} Art Credits Included`}
                  </div>

                  <ul className="space-y-1 text-xs text-muted">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <FaCheck size={10} className="text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-glass-border flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                      plan.isActive
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : "bg-divider text-muted hover:bg-glass-hover"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      className="p-2 text-muted hover:text-foreground hover:bg-glass-hover rounded transition-colors"
                      title="Edit Plan"
                    >
                      <FaEdit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete Plan"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {editingPlan ? "Edit Pricing Plan" : "Create Pricing Plan"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
                  placeholder="e.g. Pro Creator Pack"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                    Structure Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="ai_included">AI Included (Credits)</option>
                    <option value="byok">BYOK (Own API Key)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                    Billing Interval
                  </label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="one_time">One-Time Payment</option>
                    <option value="month">Monthly Subscription</option>
                    <option value="year">Annual Subscription</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                    Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                    Credits Allowance
                  </label>
                  <input
                    type="number"
                    disabled={formData.type === "byok"}
                    value={formData.type === "byok" ? 0 : formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
                  placeholder="Short marketing blurb..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-muted block mb-1">
                  Features List (One feature per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary font-mono text-[11px]"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded text-primary"
                  />
                  <span>Mark as "Most Popular"</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-primary"
                  />
                  <span>Active & Visible</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-glass-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-glass-hover text-muted hover:text-foreground text-xs font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white text-xs font-bold rounded hover:bg-primary-hover shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
