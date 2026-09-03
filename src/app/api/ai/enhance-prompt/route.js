import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SettingsService } from "@/lib/services/settings";
import { UserService } from "@/lib/services/user";
import { GeminiService } from "@/lib/services/gemini";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, model = "wan-2.1", camera = "", imageBase64 = null, mimeType = "image/jpeg" } = await req.json();
    if (!prompt?.trim() && !imageBase64) {
      return NextResponse.json({ error: "Prompt or image reference is required" }, { status: 400 });
    }

    const settings = await SettingsService.getSettings();

    // Check user BYOK key
    let userGeminiKey = "";
    if (session?.user?.id) {
      try {
        const profile = await UserService.getUserProfile(session.user.id);
        userGeminiKey = profile?.byokGeminiKey || "";
      } catch (e) {}
    }

    const apiKey = GeminiService.resolveApiKey(userGeminiKey, settings);

    if (apiKey) {
      try {
        const enhanced = await GeminiService.enhancePrompt({
          prompt: (prompt || "").trim(),
          model,
          camera,
          imageBase64,
          mimeType,
          apiKey,
        });

        if (enhanced) {
          return NextResponse.json({ enhancedPrompt: enhanced, engine: "gemini-2.0-flash" });
        }
      } catch (err) {
        console.warn("[GEMINI_ENHANCE_FALLBACK]", err.message);
      }
    }

    // Heuristic cinematic prompt expansion fallback if no Gemini key is set
    const cinematicEnhancements = [
      "cinematic 35mm film grain, moody volumetric lighting, slow smooth tracking camera, photorealistic depth of field, 8k render",
      "hyper-detailed cinematic composition, dynamic lighting with golden hour rim light, 4k ultra-realistic motion dynamics",
      "anamorphic lens flare, photorealistic atmospheric haze, high-fidelity fluid motion, master cinematography",
    ];
    const picked = cinematicEnhancements[Math.floor(Math.random() * cinematicEnhancements.length)];
    const fallbackPrompt = `${(prompt || "cinematic scene").trim()}, ${camera ? camera + ", " : ""}${picked}`;

    return NextResponse.json({ enhancedPrompt: fallbackPrompt, engine: "heuristic-fallback" });
  } catch (error) {
    console.error("[ENHANCE_PROMPT_ERROR]", error);
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 });
  }
}
