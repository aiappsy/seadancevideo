import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";
import { UserService } from "@/lib/services/user";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id || session.user.email;
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      await UserService.getCredits(userId);
    }

    const data = (await userRef.get()).data() || {};
    const hasKey = Boolean(data.byokApiKey);
    const maskedKey = hasKey
      ? `••••••••••••${data.byokApiKey.slice(-4)}`
      : "";

    const hasFalKey = Boolean(data.byokFalKey);
    const maskedFalKey = hasFalKey
      ? `••••••••••••${data.byokFalKey.slice(-4)}`
      : "";

    const hasGeminiKey = Boolean(data.byokGeminiKey);
    const maskedGeminiKey = hasGeminiKey
      ? `••••••••••••${data.byokGeminiKey.slice(-4)}`
      : "";

    return NextResponse.json({
      id: userId,
      name: data.name || session.user.name || "Creator",
      email: data.email || session.user.email || "",
      image: data.image || session.user.image || null,
      credits: typeof data.credits === "number" ? data.credits : 10,
      role: data.role || "user",
      byokEnabled: Boolean(data.byokEnabled),
      hasByokKey: hasKey,
      maskedByokKey: maskedKey,
      hasByokFalKey: hasFalKey,
      maskedByokFalKey: maskedFalKey,
      hasByokGeminiKey: hasGeminiKey,
      maskedByokGeminiKey: maskedGeminiKey,
      apiKey: data.apiKey || null,
      activePlanId: data.activePlanId || "free",
      planType: data.planType || "free",
      preferences: data.preferences || {
        defaultModel: "wan-2.1",
        defaultAspectRatio: "16:9",
        defaultResolution: "720p",
        defaultCameraMotion: "auto",
        autoGenerateAudio: false,
      },
    });
  } catch (error) {
    console.error("[USER_PROFILE_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id || session.user.email;
    const body = await req.json();
    const { name, byokApiKey, byokFalKey, byokGeminiKey, byokEnabled, preferences, action } = body;

    // Test MuAPI key action
    if (action === "test_byok_key") {
      const keyToTest = byokApiKey?.trim();
      if (!keyToTest) {
        return NextResponse.json({ error: "Please enter a key to test" }, { status: 400 });
      }

      const pingRes = await fetch("https://api.muapi.ai/api/v1/predictions/test_ping/result", {
        headers: { "x-api-key": keyToTest },
      });

      if (pingRes.status === 401 || pingRes.status === 403) {
        return NextResponse.json({ error: "Invalid API key: Unauthorized by MuAPI" }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "MuAPI Key verified successfully!" });
    }

    // Test Fal.ai key action
    if (action === "test_byok_fal_key") {
      const keyToTest = byokFalKey?.trim();
      if (!keyToTest) {
        return NextResponse.json({ error: "Please enter a Fal.ai key to test" }, { status: 400 });
      }

      const pingRes = await fetch("https://queue.fal.run/fal-ai/fast-sdxl/requests/ping_test", {
        headers: { Authorization: `Key ${keyToTest}` },
      });

      if (pingRes.status === 401 || pingRes.status === 403) {
        return NextResponse.json({ error: "Invalid API key: Unauthorized by Fal.ai" }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Fal.ai Key verified successfully!" });
    }

    // Test Gemini Flash key action
    if (action === "test_byok_gemini_key") {
      const keyToTest = byokGeminiKey?.trim();
      if (!keyToTest) {
        return NextResponse.json({ error: "Please enter a Gemini API key to test" }, { status: 400 });
      }

      try {
        const pingRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyToTest}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: "ping" }] }],
            }),
          }
        );

        if (!pingRes.ok) {
          const errData = await pingRes.json().catch(() => ({}));
          return NextResponse.json(
            { error: errData.error?.message || "Invalid API key: Unauthorized by Google Gemini" },
            { status: 400 }
          );
        }

        return NextResponse.json({ success: true, message: "Google Gemini Flash key verified successfully!" });
      } catch (err) {
        return NextResponse.json({ error: "Connection to Gemini API failed: " + err.message }, { status: 400 });
      }
    }

    const updates = { updatedAt: new Date().toISOString() };

    if (name !== undefined) updates.name = name;
    if (byokApiKey !== undefined && byokApiKey.trim() !== "") {
      updates.byokApiKey = byokApiKey.trim();
    }
    if (byokFalKey !== undefined && byokFalKey.trim() !== "") {
      updates.byokFalKey = byokFalKey.trim();
    }
    if (byokGeminiKey !== undefined && byokGeminiKey.trim() !== "") {
      updates.byokGeminiKey = byokGeminiKey.trim();
    }
    if (typeof byokEnabled === "boolean") {
      updates.byokEnabled = byokEnabled;
    }
    if (preferences && typeof preferences === "object") {
      updates.preferences = preferences;
    }

    await db.collection("users").doc(userId).set(updates, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[USER_PROFILE_PATCH_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
