import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SettingsService } from "@/lib/services/settings";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const settings = await SettingsService.getSettings();
    const openRouterKey = settings.ai?.openRouterApiKey || process.env.OPENROUTER_API_KEY;

    if (openRouterKey) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content:
                "You are an expert cinematic AI video director. Given the user's idea, rewrite it into a single, high-fidelity, photorealistic video prompt under 55 words. Include specific camera movement (e.g. slow tracking shot, 35mm lens), cinematic lighting, volumetric atmosphere, and realistic physics. Respond ONLY with the rewritten prompt.",
            },
            { role: "user", content: prompt.trim() },
          ],
          max_tokens: 120,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const enhanced = data.choices?.[0]?.message?.content?.trim();
        if (enhanced) {
          return NextResponse.json({ enhancedPrompt: enhanced });
        }
      }
    }

    // Heuristic cinematic prompt expansion fallback if no OpenRouter key is set
    const cinematicEnhancements = [
      "cinematic 35mm film grain, moody volumetric lighting, slow smooth tracking camera, photorealistic depth of field, 8k render",
      "hyper-detailed cinematic composition, dynamic lighting with golden hour rim light, 4k ultra-realistic motion dynamics",
      "anamorphic lens flare, photorealistic atmospheric haze, high-fidelity fluid motion, master cinematography",
    ];
    const picked = cinematicEnhancements[Math.floor(Math.random() * cinematicEnhancements.length)];
    const fallbackPrompt = `${prompt.trim()}, ${picked}`;

    return NextResponse.json({ enhancedPrompt: fallbackPrompt });
  } catch (error) {
    console.error("[ENHANCE_PROMPT_ERROR]", error);
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 });
  }
}
