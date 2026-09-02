import { db } from "../firebase/admin";
import baseConfig from "../config";

const SETTINGS_COLLECTION = "system_settings";
const CONFIG_DOC_ID = "config";

let cachedSettings = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30000;

import { defaultTemplates } from "../templates";
export { defaultTemplates };

export const defaultSystemSettings = {
  general: {
    appName: "MaxMotion AI",
    theme: "slate-indigo",
    defaultCredits: 10,
    supportEmail: "support@maxmotion.ai",
    maintenanceMode: false,
    companyName: "MaxMotion AI Technologies Inc.",
    legalJurisdiction: "Delaware, United States",
  },
  storage: {
    mirrorToFirebase: true,
    bucketName: process.env.FIREBASE_STORAGE_BUCKET || "",
  },
  ai: {
    provider: "multi",
    seedanceApiKey: process.env.SEEDANCE_V2_API_KEY || "",
    seedanceMiniApiKey: process.env.SEEDANCE_V2_API_KEY || "",
    falApiKey: process.env.FAL_KEY || process.env.FAL_API_KEY || "",
    openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
    defaultModel: "seedance-2.0",
    enabledEngines: {
      "seedance-2.0": true,
      "seedance-mini": true,
      "wan-2.1": true,
      "kling-1.5": true,
      "minimax": true,
    },
    creditRates: {
      t2v_720p_high: 50,
      t2v_720p_basic: 30,
      t2v_480p_high: 30,
      t2v_480p_basic: 24,
      reference_720p_high: 60,
      reference_720p_basic: 42,
      reference_480p_high: 48,
      reference_480p_basic: 36,
      miniDiscountPercent: 50,
      wan_2_1_rate: 30,
      kling_1_5_rate: 55,
      minimax_rate: 50,
      upscaleCreditCost: 25,
      audioCreditCost: 10,
    },
    endpoints: baseConfig.ai.seedance.endpoints,
    miniEndpoints: baseConfig.ai.seedanceMini.endpoints,
  },
  mcp: {
    enabled: true,
    rateLimitPerMin: 30,
    allowAnonymous: false,
  },
  compliance: {
    cookieBannerEnabled: true,
    privacyContactEmail: "privacy@maxmotion.ai",
    dataRetentionDays: 0,
  },
  templates: defaultTemplates,
  billing: {
    stripe: {
      enabled: true,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      secretKey: process.env.STRIPE_SECRET_KEY || "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    },
    paypal: {
      enabled: false,
      mode: "sandbox",
      clientId: process.env.PAYPAL_CLIENT_ID || "",
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    },
  },
};

export const SettingsService = {
  async getSettings(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && cachedSettings && now - lastFetchTime < CACHE_TTL_MS) {
      return cachedSettings;
    }

    try {
      const docRef = db.collection(SETTINGS_COLLECTION).doc(CONFIG_DOC_ID);
      const doc = await docRef.get();

      if (!doc.exists) {
        await docRef.set({
          ...defaultSystemSettings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        cachedSettings = defaultSystemSettings;
      } else {
        const data = doc.data();
        cachedSettings = {
          general: { ...defaultSystemSettings.general, ...(data.general || {}) },
          storage: { ...defaultSystemSettings.storage, ...(data.storage || {}) },
          templates: data.templates && data.templates.length > 0 ? data.templates : defaultTemplates,
          ai: {
            ...defaultSystemSettings.ai,
            ...(data.ai || {}),
            enabledEngines: {
              ...defaultSystemSettings.ai.enabledEngines,
              ...(data.ai?.enabledEngines || {}),
            },
            creditRates: {
              ...defaultSystemSettings.ai.creditRates,
              ...(data.ai?.creditRates || {}),
            },
          },
          mcp: { ...defaultSystemSettings.mcp, ...(data.mcp || {}) },
          compliance: { ...defaultSystemSettings.compliance, ...(data.compliance || {}) },
          billing: {
            stripe: { ...defaultSystemSettings.billing.stripe, ...(data.billing?.stripe || {}) },
            paypal: { ...defaultSystemSettings.billing.paypal, ...(data.billing?.paypal || {}) },
          },
        };
      }
      lastFetchTime = now;
      return cachedSettings;
    } catch (error) {
      console.error("[SETTINGS_GET_ERROR]", error);
      return defaultSystemSettings;
    }
  },

  async getPublicSettings() {
    const all = await this.getSettings();
    return {
      appName: all.general.appName,
      theme: all.general.theme,
      defaultCredits: all.general.defaultCredits,
      supportEmail: all.general.supportEmail,
      companyName: all.general.companyName,
      legalJurisdiction: all.general.legalJurisdiction,
      maintenanceMode: all.general.maintenanceMode,
      defaultModel: all.ai.defaultModel,
      enabledEngines: all.ai.enabledEngines || defaultSystemSettings.ai.enabledEngines,
      hasOpenRouter: Boolean(all.ai.openRouterApiKey),
      templates: all.templates || defaultTemplates,
      stripe: {
        enabled: all.billing.stripe.enabled,
        publishableKey: all.billing.stripe.publishableKey,
      },
      paypal: {
        enabled: all.billing.paypal.enabled,
        mode: all.billing.paypal.mode,
        clientId: all.billing.paypal.clientId,
      },
      creditRates: all.ai.creditRates,
    };
  },

  async updateSettings(newSettings, adminUserId) {
    const docRef = db.collection(SETTINGS_COLLECTION).doc(CONFIG_DOC_ID);
    const updated = {
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUserId || "admin",
    };

    await docRef.set(updated, { merge: true });
    cachedSettings = null;
    return await this.getSettings(true);
  },
};

export default SettingsService;
