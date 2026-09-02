/**
 * AI Engine Optimizer
 * Provides intelligent model recommendations, prompt sanitization,
 * and resilient network retry logic with exponential backoff.
 */
export const AIOptimizer = {
  /**
   * Recommend the optimal AI video engine based on prompt semantics and mode
   */
  recommendEngine(prompt = "", mode = "text-to-video") {
    const text = prompt.toLowerCase();

    // 1. Minimax Hailuo: Character Acting, Facial Expressions, Storytelling
    if (
      text.includes("face") ||
      text.includes("talking") ||
      text.includes("expression") ||
      text.includes("smile") ||
      text.includes("speaking") ||
      text.includes("acting") ||
      text.includes("dialogue") ||
      text.includes("portrait") ||
      text.includes("close-up of a person")
    ) {
      return {
        engine: "minimax",
        name: "Minimax Hailuo",
        reason: "Recognized character close-up or facial expression. Minimax excels at realistic human acting and micro-expressions.",
        confidence: 0.92,
      };
    }

    // 2. Kling 1.5 Pro: Complex Anatomy, Physics & Choreography
    if (
      text.includes("walking") ||
      text.includes("running") ||
      text.includes("dancing") ||
      text.includes("martial arts") ||
      text.includes("fight") ||
      text.includes("physics") ||
      text.includes("hands") ||
      text.includes("parkour") ||
      text.includes("gymnastics")
    ) {
      return {
        engine: "kling-1.5",
        name: "Kling 1.5",
        reason: "Recognized full-body human motion or physical dynamics. Kling 1.5 leads in physical coherence and anatomy preservation.",
        confidence: 0.89,
      };
    }

    // 3. Wan 2.1: Cinematic Lighting, Scenery, Sci-Fi & Photorealism
    if (
      text.includes("cinematic") ||
      text.includes("landscape") ||
      text.includes("drone shot") ||
      text.includes("nature") ||
      text.includes("mountains") ||
      text.includes("sci-fi") ||
      text.includes("cyberpunk") ||
      text.includes("sunset") ||
      text.includes("lighting") ||
      text.includes("atmosphere")
    ) {
      return {
        engine: "wan-2.1",
        name: "Wan 2.1",
        reason: "Recognized cinematic scene composition. Alibaba Wan 2.1 delivers exceptional 14B volumetric lighting and photorealism at low inference cost.",
        confidence: 0.88,
      };
    }

    // 4. Seedance 2.0: High-Energy Motion & Fast Production
    if (
      text.includes("car") ||
      text.includes("drift") ||
      text.includes("speed") ||
      text.includes("explosion") ||
      text.includes("action") ||
      text.includes("flying")
    ) {
      return {
        engine: "seedance-2.0",
        name: "Seedance 2.0",
        reason: "Recognized high-velocity action scene. Seedance 2.0 delivers punchy camera dynamics and fast turnaround.",
        confidence: 0.85,
      };
    }

    // Default recommendation
    return {
      engine: "seedance-2.0",
      name: "Seedance 2.0",
      reason: "Balanced flagship model for all-round video synthesis.",
      confidence: 0.75,
    };
  },

  /**
   * Sanitize prompt text and parameters to avoid malformed inputs and token waste
   */
  sanitizePrompt(prompt = "") {
    if (!prompt) return "";
    return prompt
      .trim()
      .replace(/[\r\n]+/g, " ") // normalize newlines
      .replace(/\s{2,}/g, " ")  // collapse multiple spaces
      .replace(/,{2,}/g, ",")   // remove multiple consecutive commas
      .slice(0, 1000);          // enforce 1000 character maximum
  },

  /**
   * Resilient execution with exponential backoff for upstream AI provider network calls
   */
  async executeWithRetry(operationFn, maxRetries = 3, baseDelayMs = 800) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operationFn();
      } catch (err) {
        lastError = err;
        // Don't retry client errors (400, 401, 403, 404)
        if (err.status && err.status >= 400 && err.status < 500) {
          throw err;
        }

        if (attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          console.warn(`[AI_OPTIMIZER_RETRY] Attempt ${attempt} failed: ${err.message}. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  },
};

export default AIOptimizer;
