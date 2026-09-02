import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SettingsService } from "@/lib/services/settings";
import { db } from "@/lib/firebase/admin";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, duration = 5, creationId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const settings = await SettingsService.getSettings();
    const apiKey = settings.ai?.falApiKey || process.env.FAL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Fal.ai API key not configured in Admin Settings." },
        { status: 400 }
      );
    }

    // Call Fal.ai MMAudio v2 for video sound and atmospheric audio synthesis
    const res = await fetch("https://fal.run/fal-ai/mmaudio-v2", {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Cinematic high-fidelity sound effects, atmospheric foley, ambient audio for: ${prompt}`,
        duration: Math.min(10, Math.max(3, parseInt(duration, 10) || 5)),
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Audio synthesis failed");
    }

    const data = await res.json();
    const audioUrl = data.audio?.url || data.audio_file?.url || null;

    if (creationId && audioUrl) {
      await db.collection("creations").doc(creationId).update({
        audioUrl,
        hasAudio: true,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      audioUrl,
    });
  } catch (error) {
    console.error("[AUDIO_SYNTHESIS_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate audio" },
      { status: 500 }
    );
  }
}
