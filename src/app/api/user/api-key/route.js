import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDoc = await db.collection("users").doc(session.user.id).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = userDoc.data();
    return NextResponse.json({
      apiKey: data.apiKey || null,
      createdAt: data.apiKeyCreatedAt || null,
    });
  } catch (error) {
    console.error("[GET_API_KEY_ERROR]", error);
    return NextResponse.json({ error: "Failed to retrieve API key" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate secure random API key prefixed with mm_live_
    const randomBytes = crypto.randomBytes(24).toString("hex");
    const newApiKey = `mm_live_${randomBytes}`;
    const createdAt = new Date().toISOString();

    await db.collection("users").doc(session.user.id).set(
      {
        apiKey: newApiKey,
        apiKeyCreatedAt: createdAt,
      },
      { merge: true }
    );

    return NextResponse.json({
      apiKey: newApiKey,
      createdAt,
      message: "New MaxMotion API Key generated successfully",
    });
  } catch (error) {
    console.error("[POST_API_KEY_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 });
  }
}
