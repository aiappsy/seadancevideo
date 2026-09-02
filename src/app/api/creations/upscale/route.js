import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";
import { UserService } from "@/lib/services/user";
import { SettingsService } from "@/lib/services/settings";

const UPSCALE_CREDIT_COST = 25;

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { creationId } = await req.json();

    if (!creationId) {
      return NextResponse.json({ error: "creationId is required" }, { status: 400 });
    }

    const creationDoc = await db.collection("creations").doc(creationId).get();
    if (!creationDoc.exists) {
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    const creationData = creationDoc.data();
    if (creationData.userId !== userId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const videoUrl = creationData.imageUrl;
    if (!videoUrl) {
      return NextResponse.json({ error: "Video is still processing or has no URL" }, { status: 400 });
    }

    // Check user credits
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data() || {};
    const isByok = Boolean(userData.byokEnabled && (userData.byokFalKey || userData.byokApiKey));

    if (!isByok && (userData.credits || 0) < UPSCALE_CREDIT_COST) {
      return NextResponse.json(
        { error: `Insufficient credits. 4K Upscale requires ${UPSCALE_CREDIT_COST} credits.` },
        { status: 403 }
      );
    }

    const settings = await SettingsService.getSettings();
    const apiKey = isByok
      ? (userData.byokFalKey || userData.byokApiKey)
      : (settings.ai?.falApiKey || process.env.FAL_KEY);

    if (!apiKey) {
      return NextResponse.json(
        { error: "Fal.ai API key is required for 4K video upscaling." },
        { status: 400 }
      );
    }

    // Deduct credits if not BYOK
    if (!isByok) {
      await UserService.deductCredits(userId, UPSCALE_CREDIT_COST);
    }

    // Submit to Fal.ai video upscaler
    const falRes = await fetch("https://queue.fal.run/fal-ai/video-upscaler", {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_url: videoUrl,
        scale: 2, // 2x upscale (720p -> 1440p / 4K)
      }),
    });

    if (!falRes.ok) {
      if (!isByok) await UserService.addCredits(userId, UPSCALE_CREDIT_COST);
      const err = await falRes.json();
      throw new Error(err.detail || "Upscaler submission failed");
    }

    const falData = await falRes.json();
    const upscaleRequestId = falData.request_id;

    await creationDoc.ref.update({
      upscaleStatus: "processing",
      upscaleRequestId,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "4K Upscaling initiated successfully (~30-60s)",
      requestId: upscaleRequestId,
    });
  } catch (error) {
    console.error("[UPSCALE_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to upscale video" },
      { status: 500 }
    );
  }
}
