import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SettingsService } from "@/lib/services/settings";
import { db } from "@/lib/firebase/admin";
import { AppKeyService } from "@/lib/services/app-key";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const keyAuth = !session?.user ? await AppKeyService.authenticateRequest(req) : null;

    if (!session?.user?.id && !keyAuth?.isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, text, type = "sound_effects", voiceId, duration = 5, creationId } = await req.json();

    if (!prompt && !text) {
      return NextResponse.json({ error: "Prompt or text is required" }, { status: 400 });
    }

    const settings = await SettingsService.getSettings();

    // Route 1: Voiceover & Narration via ElevenLabs
    if (type === "voiceover") {
      let apiKey = null;

      // Check User BYOK first
      if (session?.user?.id) {
        const userDoc = await db.collection("users").doc(session.user.id).get();
        if (userDoc.exists && userDoc.data().byokElevenLabsKey) {
          apiKey = userDoc.data().byokElevenLabsKey;
        }
      }

      if (!apiKey) {
        apiKey = settings.ai?.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY;
      }

      if (!apiKey) {
        return NextResponse.json(
          { error: "ElevenLabs API key not configured. Please add your key in Settings." },
          { status: 400 }
        );
      }

      const { ElevenLabsService } = await import("@/lib/services/elevenlabs");
      const speechResult = await ElevenLabsService.generateSpeech({
        text: text || prompt,
        voiceId,
        apiKey,
      });

      if (creationId && speechResult.audioUrl) {
        await db.collection("creations").doc(creationId).update({
          voiceoverUrl: speechResult.audioUrl,
          hasVoiceover: true,
          updatedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        type: "voiceover",
        audioUrl: speechResult.audioUrl,
        voiceId: speechResult.voiceId,
      });
    }

    // Route 2: Atmospheric Sound Effects via Fal.ai MMAudio
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
      type: "sound_effects",
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
