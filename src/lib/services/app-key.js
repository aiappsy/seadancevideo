import { db } from "../firebase/admin";
import { SettingsService } from "./settings";
import crypto from "crypto";

const CONFIG_DOC_ID = "config";
const SETTINGS_COLLECTION = "system_settings";

export const AppKeyService = {
  /**
   * Get the current Master App API Key (or generate one if not yet set)
   */
  async getMasterAppKey() {
    try {
      const settings = await SettingsService.getSettings();
      if (settings?.masterAppKey) {
        return {
          key: settings.masterAppKey,
          createdAt: settings.masterAppKeyCreatedAt || null,
        };
      }

      // Check environment variable
      if (process.env.APP_API_KEY) {
        return {
          key: process.env.APP_API_KEY,
          createdAt: null,
          isFromEnv: true,
        };
      }

      // Auto-generate initial master app key
      return await this.rotateMasterAppKey("system_init");
    } catch (e) {
      console.error("[GET_MASTER_APP_KEY_ERROR]", e);
      return { key: null, error: e.message };
    }
  },

  /**
   * Generate or rotate a new Master Application API Key
   */
  async rotateMasterAppKey(adminUserId = "admin") {
    const randomHex = crypto.randomBytes(28).toString("hex");
    const newKey = `mm_app_${randomHex}`;
    const createdAt = new Date().toISOString();

    const docRef = db.collection(SETTINGS_COLLECTION).doc(CONFIG_DOC_ID);
    await docRef.set(
      {
        masterAppKey: newKey,
        masterAppKeyCreatedAt: createdAt,
        masterAppKeyUpdatedBy: adminUserId,
      },
      { merge: true }
    );

    return {
      key: newKey,
      createdAt,
      updatedBy: adminUserId,
    };
  },

  /**
   * Universal key validator (supports Master App Key & User Personal Live Key)
   */
  async validateApiKey(keyString) {
    if (!keyString || typeof keyString !== "string") {
      return { isValid: false, error: "Missing API key" };
    }

    const cleanKey = keyString.trim().replace(/^Bearer\s+/i, "");

    // 1. Check Master App Key
    try {
      const settings = await SettingsService.getSettings();
      const masterKey = settings?.masterAppKey || process.env.APP_API_KEY;

      if (masterKey && cleanKey === masterKey) {
        return {
          isValid: true,
          type: "master_app",
          role: "admin",
          id: "app_system",
          name: "Master Application Connection",
          isMasterKey: true,
        };
      }
    } catch (e) {
      console.warn("[APP_KEY_SETTINGS_CHECK_FAILED]", e.message);
    }

    // 2. Check User Personal Live Key (mm_live_...)
    try {
      const snapshot = await db
        .collection("users")
        .where("apiKey", "==", cleanKey)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        return {
          isValid: true,
          type: "user_personal",
          id: userDoc.id,
          role: userData.role || "user",
          user: userData,
          credits: typeof userData.credits === "number" ? userData.credits : 10,
          isMasterKey: false,
        };
      }
    } catch (e) {
      console.warn("[APP_KEY_USER_CHECK_FAILED]", e.message);
    }

    return { isValid: false, error: "Invalid API key" };
  },

  /**
   * Helper to authenticate request via Bearer token, x-api-key, or x-app-key
   */
  async authenticateRequest(req) {
    const authHeader = req.headers.get("authorization");
    const appKeyHeader = req.headers.get("x-app-key");
    const apiKeyHeader = req.headers.get("x-api-key");

    let rawKey = null;
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      rawKey = authHeader.slice(7).trim();
    } else if (appKeyHeader) {
      rawKey = appKeyHeader.trim();
    } else if (apiKeyHeader) {
      rawKey = apiKeyHeader.trim();
    }

    if (!rawKey) return null;
    return await this.validateApiKey(rawKey);
  },
};

export default AppKeyService;
