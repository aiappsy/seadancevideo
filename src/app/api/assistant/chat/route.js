import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SettingsService } from "@/lib/services/settings";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const { message, history = [] } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const settings = await SettingsService.getSettings();
    const openRouterKey = settings.ai?.openRouterApiKey || process.env.OPENROUTER_API_KEY;

    // 1. If OpenRouter is available, use live LLM with Studio Director persona
    if (openRouterKey) {
      const systemPrompt = `You are the MaxMotion AI Studio Director & Technical Expert.
Your purpose is to advise creators on:
1. Which AI video engine to choose:
   - "wan-2.1" (Alibaba 14B): Best for atmospheric lighting, sci-fi, cinematic composition, and low credit cost.
   - "kling-1.5" (Kling Pro): Best for photorealistic human bodies, physical motion, dancing, parkour, and hand coherence.
   - "minimax" (Hailuo Video-01): Best for character close-ups, emotional acting, facial micro-expressions, and storytelling.
   - "seedance-2.0": Best for high-energy motion, vehicles, and fast action.
   - "seedance-mini": Best for quick testing at 50% credit discount.
2. Directing prompts: Camera angles (pan, tilt, zoom, orbit), lens choices (35mm, 85mm, anamorphic), lighting (golden hour, volumetric neon).
3. MaxMotion platform features: BYOK (zero credit platform cost with personal key), credits packages, and permanent Firebase video storage.

Format your responses concisely and warmly. If you recommend or craft a prompt for the user, format your final response with a JSON block at the end like:
\`\`\`json
{
  "suggestedPrompt": "<the exact video prompt>",
  "suggestedModel": "<wan-2.1 | kling-1.5 | minimax | seedance-2.0 | seedance-mini>",
  "suggestedRatio": "<16:9 | 9:16>"
}
\`\`\``;

      const formattedMessages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: message.trim() },
      ];

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: formattedMessages,
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content || "";

        // Extract JSON suggestion if present
        let suggestedPrompt = null;
        let suggestedModel = null;
        let suggestedRatio = null;
        let cleanReply = rawContent;

        const jsonMatch = rawContent.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            suggestedPrompt = parsed.suggestedPrompt;
            suggestedModel = parsed.suggestedModel;
            suggestedRatio = parsed.suggestedRatio;
            cleanReply = rawContent.replace(/```json[\s\S]*?```/, "").trim();
          } catch (e) {}
        }

        return NextResponse.json({
          reply: cleanReply,
          suggestedPrompt,
          suggestedModel,
          suggestedRatio,
        });
      }
    }

    // 2. Intelligent Knowledge Fallback if OpenRouter key is not configured
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
      reply = `**BYOK (Bring Your Own Key)** allows you to plug your personal Fal.ai or MuAPI key into your Settings. When active, you pay **0 platform credits** for generations!

If you prefer not to manage external API accounts, our **AI Included** subscription plans provide built-in credit allowances where we manage all GPU infrastructure for you.`;
    } else {
      reply = `Welcome to **MaxMotion AI**! Here is a quick guide to choosing the right tool:

1. **Wan 2.1**: Best for cinematic scenery, sci-fi, and lighting.
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
    });
  } catch (error) {
    console.error("[ASSISTANT_CHAT_ERROR]", error);
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}
