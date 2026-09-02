import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/lib/services/ai";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
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
    } = body;

    if (!prompt && mode === "text-to-video") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let result;
    if (mode === "reference-to-video") {
      result = await AIService.edit(session.user.id, {
        mode,
        prompt,
        images_list,
        video_files,
        audio_files,
        aspect_ratio,
        resolution,
        duration,
        quality,
        model,
      });
    } else {
      result = await AIService.generate(session.user.id, {
        mode,
        prompt,
        aspect_ratio,
        resolution,
        duration,
        quality,
        model,
        images_list,
        video_files,
        audio_files,
      });
    }

    return NextResponse.json({
      ...result,
      metadata: { prompt, aspect_ratio, resolution, model },
    });
  } catch (error) {
    const errorMessage = error?.message || "";
    if (
      errorMessage === "Insufficient credits" ||
      errorMessage === "Insufficient credits available" ||
      errorMessage.toLowerCase().includes("insufficient credits")
    ) {
      return NextResponse.json(
        { error: "Insufficient credits. Please top up your balance on the pricing page." },
        { status: 403 }
      );
    }

    console.error("[AI_SEEDANCE]", error);
    return NextResponse.json({ error: errorMessage || "Internal Error" }, { status: 500 });
  }
}
