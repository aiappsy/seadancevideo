import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { StorageService } from "@/lib/services/storage";

export async function POST(req) {
  try {
    const data = await req.json();
    const requestId = data.id || data.request_id;

    if (!requestId) {
      console.error("[MUAPI_WEBHOOK_ERROR] Missing request id in payload", data);
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    const creationRef = db.collection("creations").doc(requestId);
    const creationDoc = await creationRef.get();

    if (!creationDoc.exists) {
      console.warn(`[MUAPI_WEBHOOK] Creation with requestId ${requestId} not found.`);
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (data.error && data.error !== "") {
      await creationRef.update({
        status: "failed",
        error: data.error,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const outputs = data.outputs || [];
      const imageUrl = outputs.length > 0 ? outputs[0] : (typeof data.output === "string" ? data.output : null);

      await creationRef.update({
        status: "completed",
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString(),
      });

      if (imageUrl) {
        StorageService.mirrorVideoToFirebase(imageUrl, requestId).catch((e) =>
          console.error("[MUAPI_MIRROR_FAIL]", e)
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MUAPI_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
