import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const doc = await db.collection("creations").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    const data = doc.data();
    // Return sanitized public video data
    return NextResponse.json({
      id: doc.id,
      prompt: data.prompt || "",
      imageUrl: data.imageUrl || data.storageUrl || "",
      aspectRatio: data.aspectRatio || "16:9",
      resolution: data.resolution || "720p",
      duration: data.duration || 5,
      model: data.model || "seedance-2.0",
      createdAt: data.createdAt,
    });
  } catch (error) {
    console.error("[GET_CREATION_BY_ID_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
