/**
 * Gemini Flash Omnimodal Intelligence Service
 * Powers the MaxMotion AI Studio Director, Multimodal Prompt Optimizer,
 * and Multi-Scene Continuity Sequencer using Google Gemini 2.0 Flash.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const GeminiService = {
  /**
   * Resolve active API key (User BYOK > Admin Config > Environment)
   */
  resolveApiKey(customKey, systemSettings) {
    return (
      customKey ||
      systemSettings?.ai?.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      systemSettings?.ai?.openRouterApiKey ||
      process.env.OPENROUTER_API_KEY ||
      ""
    );
  },

  /**
   * Universal call to Gemini Flash with multimodal and text support
   */
  async generateContent({ systemPrompt, userMessage, history = [], imageBase64 = null, mimeType = "image/jpeg", apiKey = "" }) {
    if (!apiKey) {
      throw new Error("No Gemini or OpenRouter API key configured");
    }

    // A. If standard Google Gemini API key (AIzaSy...)
    if (!apiKey.startsWith("sk-or-")) {
      const contents = [];

      // Include previous history
      if (history && history.length > 0) {
        history.slice(-6).forEach((h) => {
          contents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        });
      }

      // Build current user message parts (Multimodal if image provided)
      const currentParts = [];
      if (imageBase64) {
        currentParts.push({
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          },
        });
      }
      currentParts.push({ text: userMessage });
      contents.push({ role: "user", parts: currentParts });

      const requestBody = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.95,
        },
      };

      if (systemPrompt) {
        requestBody.systemInstruction = {
          parts: [{ text: systemPrompt }],
        };
      }

      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // B. If OpenRouter Key (sk-or-...)
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    if (history && history.length > 0) {
      history.slice(-6).forEach((h) => {
        messages.push({ role: h.role, content: h.content });
      });
    }

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userMessage },
          {
            type: "image_url",
            image_url: {
              url: imageBase64.startsWith("data:") ? imageBase64 : `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      });
    } else {
      messages.push({ role: "user", content: userMessage });
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter Gemini error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "";
  },

  /**
   * Studio Director Chat Advice
   */
  async chatDirector({ message, history = [], imageBase64 = null, mimeType = "image/jpeg", apiKey = "" }) {
    const systemPrompt = `You are the MaxMotion AI Studio Director & Technical Expert powered by Gemini Flash Omnimodal Intelligence.
Your purpose is to advise creators on directing cutting-edge AI videos:
1. Which AI video engine to choose:
   - "wan-2.1" (Alibaba 14B Cinema): Best for volumetric lighting, 35mm textures, sci-fi, architecture, and lowest credit rate.
   - "kling-1.5" (Kling Pro): Best for photorealistic human bodies, physics, walking, dancing, martial arts, and hands.
   - "minimax" (Hailuo Video-01): Best for character close-ups, emotional micro-expressions, and dialogue scenes.
   - "seedance-2.0": Flagship ByteDance engine for high-energy motion, car drifts, and action.
   - "seedance-mini": Fast 50% discount preview iterations.
2. Directing parameters: Camera moves (slow pan, dolly zoom, low tracking), lens choice, atmospheric lighting.
3. If an image is provided: Analyze the framing, lighting, color palette, and subject to write an optimal prompt for Wan 2.1 or Kling.

Format your response concisely. Whenever you propose a prompt, include a JSON snippet at the end:
\`\`\`json
{
  "suggestedPrompt": "<exact video prompt under 55 words>",
  "suggestedModel": "<wan-2.1 | kling-1.5 | minimax | seedance-2.0 | seedance-mini>",
  "suggestedRatio": "<16:9 | 9:16>"
}
\`\`\``;

    const rawText = await this.generateContent({
      systemPrompt,
      userMessage: message,
      history,
      imageBase64,
      mimeType,
      apiKey,
    });

    let suggestedPrompt = null;
    let suggestedModel = null;
    let suggestedRatio = null;
    let cleanReply = rawText;

    const jsonMatch = rawText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        suggestedPrompt = parsed.suggestedPrompt;
        suggestedModel = parsed.suggestedModel;
        suggestedRatio = parsed.suggestedRatio;
        cleanReply = rawText.replace(/```json[\s\S]*?```/, "").trim();
      } catch (e) {}
    }

    return {
      reply: cleanReply,
      suggestedPrompt,
      suggestedModel,
      suggestedRatio,
    };
  },

  /**
   * Fast Prompt Enhancement (with optional image input)
   */
  async enhancePrompt({ prompt, model = "wan-2.1", camera = "", imageBase64 = null, mimeType = "image/jpeg", apiKey = "" }) {
    const systemPrompt = `You are a world-class cinematic video director for AI diffusion models.
Your task is to take the creator's idea and rewrite it into a single, production-grade video prompt under 55 words.
Incorporate:
- Specific camera movement (e.g., slow dolly zoom, low tracking shot, 35mm lens)
- Cinematic lighting (e.g., volumetric neon, golden hour rim lighting, caustic reflections)
- Master photorealism and physics
Target engine: ${model}.
${camera ? `Requested camera movement: ${camera}.` : ""}
Output ONLY the final prompt text. No quotes, no preamble, no markdown formatting.`;

    const enhanced = await this.generateContent({
      systemPrompt,
      userMessage: prompt || "Direct an epic cinematic scene based on this image",
      imageBase64,
      mimeType,
      apiKey,
    });

    return enhanced.trim().replace(/^["']|["']$/g, "");
  },

  /**
   * Storyboard Sequencer Continuity Generator
   */
  async generateContinuity({ scene1Prompt, scene2Idea = "", apiKey = "" }) {
    const systemPrompt = `You are an AI Continuity Director for cinematic reels.
Given Scene 1 of a video reel, create Scene 2's prompt ensuring strict continuity:
- Maintain matching character appearance, clothing colors, and time-of-day lighting.
- Advance the narrative or camera angle naturally (e.g. wide shot -> medium close-up).
- Keep prompt under 50 words.
Output ONLY the prompt for Scene 2.`;

    const userMessage = `Scene 1: "${scene1Prompt}"\nScene 2 Concept: "${scene2Idea || "Natural continuation of the scene"}"`;

    const result = await this.generateContent({
      systemPrompt,
      userMessage,
      apiKey,
    });

    return result.trim().replace(/^["']|["']$/g, "");
  },
};

export default GeminiService;
