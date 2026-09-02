import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { StorageService } from "@/lib/services/storage";

export async function POST(req) {
  try {
    const data = await req.json();
    const requestId = data.request_id || data.id;

    if (!requestId) {
      console.error("[FAL_WEBHOOK_ERROR] Missing request_id in payload", data);
      return NextResponse.json({ error: "Missing request_id" }, { status: 400 });
    }

    const creationRef = db.collection("creations").doc(requestId);
    const creationDoc = await creationRef.get();

    if (!creationDoc.exists) {
      console.warn(`[FAL_WEBHOOK] Creation ${requestId} not found.`);
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (data.status === "FAILED" || data.error) {
      await creationRef.update({
        status: "failed",
        error: data.error || "Generation failed",
        updatedAt: new Date().toISOString(),
      });
    } else {
      const payload = data.payload || data;
      const videoUrl =
        payload.video?.url ||
        payload.outputs?.[0]?.url ||
        (typeof payload.output === "string" ? payload.output : null);

      if (videoUrl) {
        await creationRef.update({
          status: "completed",
          imageUrl: videoUrl,
          updatedAt: new Date().toISOString(),
        });

        StorageService.mirrorVideoToFirebase(videoUrl, requestId).catch((e) =>
          console.error("[FAL_MIRROR_FAIL]", e)
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FAL_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
