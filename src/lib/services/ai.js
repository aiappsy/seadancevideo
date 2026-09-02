import { UserService } from "./user";
import { db } from "../firebase/admin";
import { SettingsService } from "./settings";

/**
 * Service to manage AI generations across multiple engines (MuAPI Seedance, Fal.ai Wan 2.1, Kling, Minimax)
 * with Firestore persistence, dynamic rates, and BYOK support.
 */
export const AIService = {
  /**
   * Calculate credit cost based on dynamic rates in Firestore settings
   */
  async getCreditCost(mode, duration, quality, resolution, model = "seedance-2.0") {
    const settings = await SettingsService.getSettings();
    const rates = settings.ai?.creditRates || {};

    const dur = parseInt(duration || 5, 10);

    // Multi-engine specific rates
    if (model === "wan-2.1") {
      const rate = rates.wan_2_1_rate || 30;
      return Math.ceil(dur * rate);
    }
    if (model === "kling-1.5") {
      const rate = rates.kling_1_5_rate || 55;
      return Math.ceil(dur * rate);
    }
    if (model === "minimax") {
      const rate = rates.minimax_rate || 50;
      return Math.ceil(dur * rate);
    }

    // Seedance calculation
    const isMini = model === "seedance-mini";
    const isReference = mode === "reference-to-video";
    const is720p = resolution === "720p";
    let rate;

    if (isReference) {
      if (is720p) {
        rate = quality === "high" ? rates.reference_720p_high || 60 : rates.reference_720p_basic || 42;
      } else {
        rate = quality === "high" ? rates.reference_480p_high || 48 : rates.reference_480p_basic || 36;
      }
    } else {
      if (is720p) {
        rate = quality === "high" ? rates.t2v_720p_high || 50 : rates.t2v_720p_basic || 30;
      } else {
        rate = quality === "high" ? rates.t2v_480p_high || 30 : rates.t2v_480p_basic || 24;
      }
    }

    if (isMini) {
      const discountPercent = rates.miniDiscountPercent || 50;
      const multiplier = (100 - discountPercent) / 100;
      rate = Math.max(10, Math.round(rate * multiplier));
    }

    return Math.ceil(dur * rate);
  },

  /**
   * Determine engine provider from model identifier
   */
  getEngineProvider(model) {
    if (model.startsWith("seedance")) return "muapi";
    if (["wan-2.1", "kling-1.5", "minimax"].includes(model)) return "fal";
    return "muapi";
  },

  /**
   * Map model and mode to Fal.ai model path
   */
  getFalModelId(model, mode) {
    const isI2V = mode === "image-to-video";
    if (model === "wan-2.1") {
      return isI2V ? "fal-ai/wan/v2.1/i2v-14b" : "fal-ai/wan/v2.1/t2v-14b";
    }
    if (model === "kling-1.5") {
      return isI2V
        ? "fal-ai/kling-video/v1.5/pro/image-to-video"
        : "fal-ai/kling-video/v1.5/pro/text-to-video";
    }
    if (model === "minimax") {
      return isI2V
        ? "fal-ai/minimax-video/image-to-video"
        : "fal-ai/minimax-video/text-to-video";
    }
    return "fal-ai/wan/v2.1/t2v-14b";
  },

  /**
   * Execute a generation request across MuAPI or Fal.ai
   */
  async generate(userId, {
    mode = "text-to-video",
    prompt,
    aspect_ratio = "16:9",
    resolution = "720p",
    duration = 5,
    quality = "basic",
    model = "seedance-2.0",
    images_list = [],
    video_files = [],
    audio_files = []
  }) {
    const settings = await SettingsService.getSettings();
    const provider = this.getEngineProvider(model);

    // Check if user is using Bring Your Own Key (BYOK)
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const isByokActive = Boolean(userData?.byokEnabled && (userData?.byokApiKey || userData?.byokFalKey));

    let cost = 0;
    let apiKey = "";

    if (isByokActive) {
      cost = 0; // BYOK users pay 0 platform credits
      apiKey = provider === "fal" && userData?.byokFalKey ? userData.byokFalKey : userData.byokApiKey;
    } else {
      cost = await this.getCreditCost(mode, duration, quality, resolution, model);
      await UserService.deductCredits(userId, cost);

      if (provider === "fal") {
        apiKey = settings.ai?.falApiKey || process.env.FAL_KEY;
        if (!apiKey) {
          await UserService.addCredits(userId, cost);
          throw new Error("Fal.ai API key is not configured in Admin Settings.");
        }
      } else {
        const isMini = model === "seedance-mini";
        apiKey = isMini
          ? settings.ai?.seedanceMiniApiKey || settings.ai?.seedanceApiKey
          : settings.ai?.seedanceApiKey;

        if (!apiKey) {
          await UserService.addCredits(userId, cost);
          throw new Error("Seedance/MuAPI Master API key is not configured in Admin Settings.");
        }
      }
    }

    const appUrl = settings.general?.appUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // -------------------------------------------------------------
    // ROUTE A: Fal.ai Engine (Wan 2.1, Kling 1.5, Minimax)
    // -------------------------------------------------------------
    if (provider === "fal") {
      const falModelId = this.getFalModelId(model, mode);
      const webhookUrl = `${appUrl}/api/webhook/fal`;
      const submitUrl = `https://queue.fal.run/${falModelId}?fal_webhook=${encodeURIComponent(webhookUrl)}`;

      const payload = {
        prompt: prompt || "",
        aspect_ratio: aspect_ratio === "9:16" ? "9:16" : "16:9",
        duration: parseInt(duration, 10) === 10 ? "10" : "5",
      };

      if (images_list && images_list.length > 0) {
        payload.image_url = images_list[0];
      }

      const submitRes = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!submitRes.ok) {
        const errorText = await submitRes.text();
        if (!isByokActive && cost > 0) await UserService.addCredits(userId, cost);
        throw new Error(`Fal.ai Submission Failed (${submitRes.status}): ${errorText}`);
      }

      const resData = await submitRes.json();
      const requestId = resData.request_id;
      if (!requestId) {
        if (!isByokActive && cost > 0) await UserService.addCredits(userId, cost);
        throw new Error("No request_id received from Fal.ai");
      }

      // Persist creation to Firestore
      try {
        await db.collection("creations").doc(requestId).set({
          id: requestId,
          userId,
          prompt: prompt || "",
          aspectRatio: aspect_ratio,
          resolution,
          duration: parseInt(duration, 10),
          quality,
          model,
          provider: "fal",
          falModelId,
          mode,
          isByok: isByokActive,
          inputImages: images_list || [],
          requestId,
          status: "processing",
          cost,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error("[FIRESTORE_FAL_CREATION_SAVE_ERROR]", e);
      }

      return { request_id: requestId, isByok: isByokActive, provider: "fal" };
    }

    // -------------------------------------------------------------
    // ROUTE B: MuAPI Engine (Seedance 2.0 & Seedance 2 Mini)
    // -------------------------------------------------------------
    let type;
    if (mode === "text-to-video") type = "t2v";
    else if (mode === "image-to-video") type = "i2v";
    else if (mode === "reference-to-video") type = "reference";
    else type = "t2v";

    const isMini = model === "seedance-mini";
    const endpoints = isMini ? settings.ai?.miniEndpoints : settings.ai?.endpoints;
    const endpoint = endpoints?.[type]?.[resolution] || endpoints?.[type]?.["720p"];

    if (!endpoint) {
      if (!isByokActive && cost > 0) await UserService.addCredits(userId, cost);
      throw new Error(`Endpoint not found for mode: ${mode} and resolution: ${resolution}`);
    }

    const webhookUrl = `${appUrl}/api/webhook/muapi`;
    const submitUrl = `${endpoint}?webhook=${encodeURIComponent(webhookUrl)}`;

    const payload = {
      prompt: prompt || "",
      aspect_ratio,
      duration: parseInt(duration, 10),
      quality,
    };

    if (type === "i2v" || type === "reference") {
      payload.images_list = (images_list || []).slice(0, 9);
    }
    if (type === "reference") {
      payload.video_files = (video_files || []).slice(0, 3);
      payload.audio_files = (audio_files || []).slice(0, 3);
    }

    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      if (!isByokActive && cost > 0) await UserService.addCredits(userId, cost);
      throw new Error(`MuAPI Submission Failed (${submitRes.status}): ${errorText}`);
    }

    const resData = await submitRes.json();
    const requestId = resData.request_id || resData.id;
    if (!requestId) {
      if (!isByokActive && cost > 0) await UserService.addCredits(userId, cost);
      throw new Error("No request_id received from Seedance API");
    }

    try {
      await db.collection("creations").doc(requestId).set({
        id: requestId,
        userId,
        prompt: prompt || "",
        aspectRatio: aspect_ratio,
        resolution,
        duration: parseInt(duration, 10),
        quality,
        model,
        provider: "muapi",
        mode,
        isByok: isByokActive,
        videoFiles: video_files || [],
        audioFiles: audio_files || [],
        inputImages: images_list || [],
        requestId,
        status: "processing",
        cost,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error("[FIRESTORE_CREATION_SAVE_ERROR]", dbError);
    }

    return { request_id: requestId, isByok: isByokActive, provider: "muapi" };
  },

  async edit(userId, params) {
    return this.generate(userId, params);
  },

  async checkStatus(requestId, userId, metadata) {
    if (!requestId) return { status: "processing" };

    const creationRef = db.collection("creations").doc(requestId);
    const creationDoc = await creationRef.get();

    if (!creationDoc.exists) return { status: "processing" };

    const creation = creationDoc.data();
    if (creation.status === "completed") {
      return { status: "completed", imageUrl: creation.imageUrl };
    }
    if (creation.status === "failed") {
      throw new Error(creation.error || "Generation failed.");
    }

    const provider = creation.provider || this.getEngineProvider(creation.model || "seedance-2.0");

    // -------------------------------------------------------------
    // Status Poll: Fal.ai
    // -------------------------------------------------------------
    if (provider === "fal") {
      let apiKey = "";
      if (creation.isByok) {
        const userDoc = await db.collection("users").doc(userId).get();
        apiKey = userDoc.exists ? (userDoc.data().byokFalKey || userDoc.data().byokApiKey) : "";
      } else {
        const settings = await SettingsService.getSettings();
        apiKey = settings.ai?.falApiKey || process.env.FAL_KEY;
      }

      if (!apiKey) return { status: "processing" };

      const falModelId = creation.falModelId || this.getFalModelId(creation.model, creation.mode);
      try {
        const statusRes = await fetch(
          `https://queue.fal.run/${falModelId}/requests/${requestId}/status`,
          {
            headers: { Authorization: `Key ${apiKey}` },
          }
        );

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.status === "COMPLETED") {
            const resultRes = await fetch(
              statusData.response_url || `https://queue.fal.run/${falModelId}/requests/${requestId}`,
              { headers: { Authorization: `Key ${apiKey}` } }
            );

            if (resultRes.ok) {
              const resJson = await resultRes.json();
              const videoUrl = resJson.video?.url || resJson.outputs?.[0]?.url || resJson.output;

              if (videoUrl) {
                await creationRef.update({
                  status: "completed",
                  imageUrl: videoUrl,
                  updatedAt: new Date().toISOString(),
                });
                return { status: "completed", imageUrl: videoUrl };
              }
            }
          } else if (statusData.status === "FAILED") {
            const errorMsg = statusData.error || "Fal.ai generation failed";
            await creationRef.update({
              status: "failed",
              error: errorMsg,
              updatedAt: new Date().toISOString(),
            });

            if (!creation.isByok && creation.cost > 0) {
              await UserService.addCredits(userId, creation.cost);
            }
            throw new Error(errorMsg);
          }
        }
      } catch (err) {
        console.error("[FAL_STATUS_POLL_ERROR]", err);
      }
      return { status: "processing" };
    }

    // -------------------------------------------------------------
    // Status Poll: MuAPI (Seedance)
    // -------------------------------------------------------------
    let apiKey = "";
    if (creation.isByok) {
      const userDoc = await db.collection("users").doc(userId).get();
      apiKey = userDoc.exists ? userDoc.data().byokApiKey : "";
    } else {
      const settings = await SettingsService.getSettings();
      const isMini = creation.model === "seedance-mini";
      apiKey = isMini ? settings.ai?.seedanceMiniApiKey : settings.ai?.seedanceApiKey;
    }

    if (!apiKey) return { status: "processing" };

    try {
      const res = await fetch(`https://api.muapi.ai/api/v1/predictions/${requestId}/result`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });

      if (res.ok) {
        const result = await res.json();
        const checkStatus = result.status || result.state;
        if (checkStatus === "completed" || checkStatus === "succeeded") {
          const outputs = result.outputs || [];
          const outputUrl = outputs[0] || (typeof result.output === "string" ? result.output : result.output?.urls?.get);

          if (outputUrl) {
            await creationRef.update({
              status: "completed",
              imageUrl: outputUrl,
              updatedAt: new Date().toISOString(),
            });
            return { status: "completed", imageUrl: outputUrl };
          }
        } else if (checkStatus === "failed") {
          const errorMsg = result.error || "Generation failed";
          await creationRef.update({
            status: "failed",
            error: errorMsg,
            updatedAt: new Date().toISOString(),
          });

          if (!creation.isByok && creation.cost > 0) {
            await UserService.addCredits(userId, creation.cost);
          }
          throw new Error(errorMsg);
        }
      }
    } catch (e) {
      console.error("[POLLING_ERROR_CHECK_STATUS]", e);
    }

    return { status: "processing" };
  },
};

export default AIService;
