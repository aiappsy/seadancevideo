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

    const { scene1Prompt, scene2Idea = "" } = await req.json();
    if (!scene1Prompt?.trim()) {
      return NextResponse.json({ error: "Scene 1 prompt is required" }, { status: 400 });
    }

    const settings = await SettingsService.getSettings();

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
        const nextScenePrompt = await GeminiService.generateContinuity({
          scene1Prompt: scene1Prompt.trim(),
          scene2Idea: scene2Idea.trim(),
          apiKey,
        });

        return NextResponse.json({
          nextScenePrompt,
          engine: "gemini-2.0-flash",
        });
      } catch (err) {
        console.warn("[GEMINI_CONTINUITY_FALLBACK]", err.message);
      }
    }

    // Heuristic continuity fallback
    const fallback = `${scene2Idea ? scene2Idea.trim() + ", " : "direct continuation shot, "}matching lighting and character from previous scene: ${scene1Prompt.slice(0, 100)}...`;

    return NextResponse.json({
      nextScenePrompt: fallback,
      engine: "heuristic-fallback",
    });
  } catch (error) {
    console.error("[CONTINUITY_ROUTE_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate scene continuity" }, { status: 500 });
  }
}
