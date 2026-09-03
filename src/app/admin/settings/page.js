"use client";

import { useState, useEffect } from "react";
import {
  FaSave,
  FaSlidersH,
  FaCreditCard,
  FaCogs,
  FaLock,
  FaShieldAlt,
  FaHdd,
  FaLightbulb,
  FaPlus,
  FaTrash,
  FaTerminal,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // New Template form state
  const [newTplTitle, setNewTplTitle] = useState("");
  const [newTplPrompt, setNewTplPrompt] = useState("");
  const [newTplModel, setNewTplModel] = useState("wan-2.1");
  const [newTplCategory, setNewTplCategory] = useState("Cinematic");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data);
    } catch (e) {
      toast.error("Error loading system settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings updated successfully!");
    } catch (e) {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!newTplTitle.trim() || !newTplPrompt.trim()) {
      toast.error("Please enter a title and prompt");
      return;
    }

    const newTemplate = {
      id: `tpl_${Date.now()}`,
      title: newTplTitle.trim(),
      prompt: newTplPrompt.trim(),
      model: newTplModel,
      aspectRatio: "16:9",
      category: newTplCategory,
    };

    const currentTemplates = settings.templates || [];
    setSettings({
      ...settings,
      templates: [...currentTemplates, newTemplate],
    });

    setNewTplTitle("");
    setNewTplPrompt("");
    toast.success("Template added! Remember to click Save Settings.");
  };

  const handleDeleteTemplate = (id) => {
    const updated = (settings.templates || []).filter((t) => t.id !== id);
    setSettings({ ...settings, templates: updated });
    toast.success("Template removed. Click Save Settings to persist.");
  };

  if (loading || !settings) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            System Configuration
          </h1>
          <p className="text-xs text-muted mt-1">
            Dynamic settings stored in Firestore. Changes reflect across all users without redeployment.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-all flex items-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50"
        >
          <FaSave size={12} />
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-glass-border pb-2">
        {[
          { id: "general", label: "General & Branding", icon: FaCogs },
          { id: "ai", label: "AI Engine & Rates", icon: FaSlidersH },
          { id: "billing", label: "Payment Gateways", icon: FaCreditCard },
          { id: "storage", label: "Storage & Legal", icon: FaHdd },
          { id: "mcp", label: "MCP & Developer API", icon: FaTerminal },
          { id: "templates", label: "Inspiration Templates", icon: FaLightbulb },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-glass-bg border border-glass-border text-muted hover:text-foreground"
              }`}
            >
              <Icon size={12} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General */}
      {activeTab === "general" && (
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
            Branding & Application Identity
          </h3>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
              Application Name (Brand)
            </label>
            <div className="flex gap-2 mb-2">
              {["MaxMotion AI", "MaxScene AI", "CineScene AI", "SeeMax AI"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, appName: preset },
                    })
                  }
                  className={`px-3 py-1 text-[10px] font-bold rounded-md border transition-all ${
                    settings.general?.appName === preset
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-glass-hover border-glass-border text-muted hover:text-foreground"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={settings.general?.appName || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, appName: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Default Theme
              </label>
              <select
                value={settings.general?.theme || "slate-indigo"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, theme: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="slate-indigo">Slate Indigo (Default)</option>
                <option value="cyberpunk">Cyberpunk Neon</option>
                <option value="emerald">Emerald Matrix</option>
                <option value="sunset">Warm Sunset</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Welcome Credits for New Signups
              </label>
              <input
                type="number"
                value={settings.general?.defaultCredits ?? 10}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: {
                      ...settings.general,
                      defaultCredits: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={settings.general?.supportEmail || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, supportEmail: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Tab 2: AI Engine */}
      {activeTab === "ai" && (
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <FaLock size={10} /> Master API Credentials (For AI Included Users)
            </h3>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Master Seedance / MuAPI Key
              </label>
              <input
                type="password"
                value={settings.ai?.seedanceApiKey || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ai: { ...settings.ai, seedanceApiKey: e.target.value },
                  })
                }
                placeholder="Enter MuAPI Master Key"
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Master Fal.ai API Key (For Wan 2.1, Kling 1.5 & Minimax)
              </label>
              <input
                type="password"
                value={settings.ai?.falApiKey || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ai: { ...settings.ai, falApiKey: e.target.value },
                  })
                }
                placeholder="Enter Fal.ai Key (e.g. key_...)"
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Master Google Gemini Flash API Key (For AI Director & Vision Analysis)
              </label>
              <input
                type="password"
                value={settings.ai?.geminiApiKey || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ai: { ...settings.ai, geminiApiKey: e.target.value },
                  })
                }
                placeholder="Enter Gemini API Key (e.g. AIzaSy...)"
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                OpenRouter API Key (Alternative Copilot Fallback)
              </label>
              <input
                type="password"
                value={settings.ai?.openRouterApiKey || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ai: { ...settings.ai, openRouterApiKey: e.target.value },
                  })
                }
                placeholder="Enter OpenRouter Key (e.g. sk-or-v1-...)"
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* Credit Rates Configuration */}
          <div className="space-y-4 pt-4 border-t border-glass-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Credit Cost Multipliers (Rate per second)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-muted block">T2V 720p High</label>
                <input
                  type="number"
                  value={settings.ai?.creditRates?.t2v_720p_high || 50}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: {
                        ...settings.ai,
                        creditRates: {
                          ...settings.ai.creditRates,
                          t2v_720p_high: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted block">T2V 720p Basic</label>
                <input
                  type="number"
                  value={settings.ai?.creditRates?.t2v_720p_basic || 30}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: {
                        ...settings.ai,
                        creditRates: {
                          ...settings.ai.creditRates,
                          t2v_720p_basic: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted block">Ref 720p High</label>
                <input
                  type="number"
                  value={settings.ai?.creditRates?.reference_720p_high || 60}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: {
                        ...settings.ai,
                        creditRates: {
                          ...settings.ai.creditRates,
                          reference_720p_high: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted block">Mini Discount %</label>
                <input
                  type="number"
                  value={settings.ai?.creditRates?.miniDiscountPercent || 50}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: {
                        ...settings.ai,
                        creditRates: {
                          ...settings.ai.creditRates,
                          miniDiscountPercent: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted block">Wan 2.1 Rate/s</label>
                <input
                  type="number"
                  value={settings.ai?.creditRates?.wan_2_1_rate || 30}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: {
                        ...settings.ai,
                        creditRates: {
                          ...settings.ai.creditRates,
                          wan_2_1_rate: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted block">Kling 1.5 Rate/s</label>
                <input
                  type="number"
                  value={settings.ai?.creditRates?.kling_1_5_rate || 55}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: {
                        ...settings.ai,
                        creditRates: {
                          ...settings.ai.creditRates,
                          kling_1_5_rate: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted block">Minimax Rate/s</label>
                <input
                  type="number"
                  value={settings.ai?.creditRates?.minimax_rate || 50}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: {
                        ...settings.ai,
                        creditRates: {
                          ...settings.ai.creditRates,
                          minimax_rate: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted block">4K Upscale Cost</label>
                <input
                  type="number"
                  value={settings.ai?.creditRates?.upscaleCreditCost || 25}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: {
                        ...settings.ai,
                        creditRates: {
                          ...settings.ai.creditRates,
                          upscaleCreditCost: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted block">AI Audio / Foley Cost</label>
                <input
                  type="number"
                  value={settings.ai?.creditRates?.audioCreditCost || 10}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: {
                        ...settings.ai,
                        creditRates: {
                          ...settings.ai.creditRates,
                          audioCreditCost: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-glass-hover border border-glass-border rounded text-xs text-amber-300 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Gateways */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* Stripe Config */}
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Stripe Payment Gateway
                </h3>
                <p className="text-[10px] text-muted">Direct credit card payments and subscriptions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.billing?.stripe?.enabled ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      billing: {
                        ...settings.billing,
                        stripe: {
                          ...settings.billing?.stripe,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-glass-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Publishable Key
              </label>
              <input
                type="text"
                value={settings.billing?.stripe?.publishableKey || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    billing: {
                      ...settings.billing,
                      stripe: {
                        ...settings.billing?.stripe,
                        publishableKey: e.target.value,
                      },
                    },
                  })
                }
                placeholder="pk_test_..."
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Secret Key
              </label>
              <input
                type="password"
                value={settings.billing?.stripe?.secretKey || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    billing: {
                      ...settings.billing,
                      stripe: {
                        ...settings.billing?.stripe,
                        secretKey: e.target.value,
                      },
                    },
                  })
                }
                placeholder="sk_test_..."
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          {/* PayPal Config */}
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  PayPal REST Gateway
                </h3>
                <p className="text-[10px] text-muted">PayPal account & wallet checkouts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.billing?.paypal?.enabled ?? false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      billing: {
                        ...settings.billing,
                        paypal: {
                          ...settings.billing?.paypal,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-glass-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Environment
                </label>
                <select
                  value={settings.billing?.paypal?.mode || "sandbox"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      billing: {
                        ...settings.billing,
                        paypal: {
                          ...settings.billing?.paypal,
                          mode: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="live">Live (Production)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={settings.billing?.paypal?.clientId || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      billing: {
                        ...settings.billing,
                        paypal: {
                          ...settings.billing?.paypal,
                          clientId: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="PayPal Client ID"
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Client Secret
              </label>
              <input
                type="password"
                value={settings.billing?.paypal?.clientSecret || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    billing: {
                      ...settings.billing,
                      paypal: {
                        ...settings.billing?.paypal,
                        clientSecret: e.target.value,
                      },
                    },
                  })
                }
                placeholder="PayPal Secret Key"
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Storage & Legal */}
      {activeTab === "storage" && (
        <div className="space-y-6">
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Permanent Video Mirroring (Firebase Storage)
                </h3>
                <p className="text-[10px] text-muted">
                  Automatically mirrors completed outputs from upstream CDNs to your Firebase Storage bucket so links never expire.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.storage?.mirrorToFirebase ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      storage: {
                        ...settings.storage,
                        mirrorToFirebase: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-glass-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                Storage Bucket Name (Optional override)
              </label>
              <input
                type="text"
                value={settings.storage?.bucketName || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    storage: { ...settings.storage, bucketName: e.target.value },
                  })
                }
                placeholder="Leave blank to use default project bucket"
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <FaShieldAlt size={10} /> Legal Entity Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Company / Legal Entity Name
                </label>
                <input
                  type="text"
                  value={settings.general?.companyName || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, companyName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Legal Jurisdiction
                </label>
                <input
                  type="text"
                  value={settings.general?.legalJurisdiction || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, legalJurisdiction: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <FaShieldAlt size={10} /> GDPR & Compliance Configuration
            </h3>

            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <div>
                <p className="text-xs font-bold text-foreground">Cookie Consent Banner</p>
                <p className="text-[10px] text-muted">Show GDPR & CCPA cookie consent floating prompt for visitors</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compliance?.cookieBannerEnabled ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      compliance: {
                        ...settings.compliance,
                        cookieBannerEnabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-glass-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Privacy Contact / DPO Email
                </label>
                <input
                  type="email"
                  value={settings.compliance?.privacyContactEmail || "privacy@maxmotion.ai"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      compliance: { ...settings.compliance, privacyContactEmail: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Automated Data Retention (Days, 0 = Indefinite)
                </label>
                <input
                  type="number"
                  value={settings.compliance?.dataRetentionDays ?? 0}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      compliance: {
                        ...settings.compliance,
                        dataRetentionDays: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: MCP & Developer API */}
      {activeTab === "mcp" && (
        <div className="space-y-6">
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <FaTerminal className="text-amber-400" /> Model Context Protocol (MCP) Server
                </h3>
                <p className="text-[10px] text-muted">
                  Allows users to connect Claude, Cursor, and ChatGPT directly to MaxMotion AI video generation engines.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.mcp?.enabled ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mcp: {
                        ...settings.mcp,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-glass-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Rate Limit Per User (Requests / Minute)
                </label>
                <input
                  type="number"
                  value={settings.mcp?.rateLimitPerMin || 30}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mcp: { ...settings.mcp, rateLimitPerMin: parseInt(e.target.value, 10) },
                    })
                  }
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Live MCP Server Endpoint
                </label>
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? `${window.location.origin}/api/mcp` : "https://maxmotion.ai/api/mcp"}
                  className="w-full px-3 py-2 bg-glass-hover/50 border border-glass-border rounded-md text-xs font-mono text-amber-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Inspiration Templates */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* Add Template Box */}
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <FaPlus size={10} /> Add Studio Inspiration Template
            </h3>

            <form onSubmit={handleAddTemplate} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-muted block mb-1 uppercase font-bold">
                    Title Pill
                  </label>
                  <input
                    type="text"
                    required
                    value={newTplTitle}
                    onChange={(e) => setNewTplTitle(e.target.value)}
                    placeholder="e.g. Neon Cyberpunk"
                    className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-muted block mb-1 uppercase font-bold">
                    Recommended Model
                  </label>
                  <select
                    value={newTplModel}
                    onChange={(e) => setNewTplModel(e.target.value)}
                    className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="wan-2.1">Wan 2.1 (Cinematic)</option>
                    <option value="kling-1.5">Kling 1.5 (Physics)</option>
                    <option value="seedance-2.0">Seedance 2.0 (HD)</option>
                    <option value="seedance-mini">Seedance Mini (Fast)</option>
                    <option value="minimax">Minimax (Hailuo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-muted block mb-1 uppercase font-bold">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTplCategory}
                    onChange={(e) => setNewTplCategory(e.target.value)}
                    placeholder="e.g. Cinematic, Sci-Fi"
                    className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted block mb-1 uppercase font-bold">
                  Prompt Text
                </label>
                <textarea
                  rows={2}
                  required
                  value={newTplPrompt}
                  onChange={(e) => setNewTplPrompt(e.target.value)}
                  placeholder="The exact prompt to populate into the studio prompt box..."
                  className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                >
                  <FaPlus size={10} /> Add Template
                </button>
              </div>
            </form>
          </div>

          {/* Existing Templates List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Current Studio Templates ({(settings.templates || []).length})
            </h3>

            <div className="space-y-2">
              {(settings.templates || []).map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3.5 bg-glass-bg border border-glass-border rounded-xl flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {tpl.title}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                        {tpl.model}
                      </span>
                      <span className="text-[9px] text-muted">{tpl.category}</span>
                    </div>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      &ldquo;{tpl.prompt}&rdquo;
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="p-2 text-muted hover:text-red-400 transition-colors"
                    title="Remove Template"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
