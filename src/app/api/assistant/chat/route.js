import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SettingsService } from "@/lib/services/settings";
import { UserService } from "@/lib/services/user";
import { GeminiService } from "@/lib/services/gemini";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const { message, history = [], imageBase64 = null, mimeType = "image/jpeg" } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const settings = await SettingsService.getSettings();

    // Check if user has personal BYOK Gemini key
    let userGeminiKey = "";
    if (session?.user?.id) {
      try {
        const profile = await UserService.getUserProfile(session.user.id);
        userGeminiKey = profile?.byokGeminiKey || "";
      } catch (e) {}
    }

    const apiKey = GeminiService.resolveApiKey(userGeminiKey, settings);

    // 1. If Gemini / OpenRouter is available, use Gemini Flash Omnimodal Intelligence
    if (apiKey) {
      try {
        const result = await GeminiService.chatDirector({
          message: message.trim(),
          history,
          imageBase64,
          mimeType,
          apiKey,
        });

        return NextResponse.json({
          reply: result.reply,
          suggestedPrompt: result.suggestedPrompt,
          suggestedModel: result.suggestedModel,
          suggestedRatio: result.suggestedRatio,
          engine: "gemini-2.0-flash",
        });
      } catch (geminiError) {
        console.warn("[GEMINI_ASSISTANT_FALLBACK]", geminiError.message);
      }
    }

    // 2. Intelligent Knowledge Fallback if Gemini key is not configured
    const lower = message.toLowerCase();
    let reply = "";
    let suggestedPrompt = null;
    let suggestedModel = "wan-2.1";
    let suggestedRatio = "16:9";

    if (lower.includes("human") || lower.includes("actor") || lower.includes("face") || lower.includes("person")) {
      reply = `For human characters and emotional storytelling, **Minimax (Hailuo)** and **Kling 1.5** are your best options.

- **Minimax** excels at subtle facial expressions, acting, and dialogue close-ups.
- **Kling 1.5** is the gold standard for full-body physical movement, walking, dancing, and hand consistency.`;
      suggestedPrompt = "Cinematic 85mm portrait of a character in dramatic rim lighting, subtle emotional expression, photorealistic 8k";
      suggestedModel = "minimax";
    } else if (lower.includes("landscape") || lower.includes("cinematic") || lower.includes("sci-fi") || lower.includes("lighting")) {
      reply = `For expansive landscapes, volumetric lighting, and sci-fi environments, **Wan 2.1 (Alibaba 14B)** is the top recommendation. It produces remarkable atmospheric depth and photorealistic 35mm film textures at our lowest credit rate.`;
      suggestedPrompt = "Sweeping cinematic drone shot across misty Scandinavian fjords at sunrise, volumetric morning haze, photorealistic 8k depth of field";
      suggestedModel = "wan-2.1";
    } else if (lower.includes("byok") || lower.includes("api key") || lower.includes("credits")) {
      reply = `**BYOK (Bring Your Own Key)** allows you to plug your personal Fal.ai, MuAPI, or Gemini key into your Settings. When active, you pay **0 platform credits** for generations!

If you prefer not to manage external API accounts, our **AI Included** subscription plans provide built-in credit allowances where we manage all GPU infrastructure for you.`;
    } else {
      reply = `Welcome to **MaxMotion AI**! Here is a quick guide to choosing the right tool:

1. **Wan 2.1**: Best for cinematic scenery, sci-fi, and volumetric lighting.
2. **Kling 1.5**: Best for realistic human physical motion and anatomy.
3. **Minimax Hailuo**: Best for character acting and expressive portraits.
4. **Seedance 2.0 / Mini**: Best for high-speed action and fast testing (50% discount).`;
      suggestedPrompt = "A cinematic sports car drifting through neon rain puddles at night, anamorphic lens flare, photorealistic motion";
      suggestedModel = "wan-2.1";
    }

    return NextResponse.json({
      reply,
      suggestedPrompt,
      suggestedModel,
      suggestedRatio,
      engine: "heuristic-director",
    });
  } catch (error) {
    console.error("[ASSISTANT_CHAT_ERROR]", error);
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}
