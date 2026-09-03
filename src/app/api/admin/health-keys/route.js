import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-admin";
import { SettingsService } from "@/lib/services/settings";

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settings = await SettingsService.getSettings();
    const results = {};

    // 1. Google Gemini Flash Ping
    const geminiKey = settings.ai?.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      results.gemini = { configured: false, status: "unconfigured" };
    } else {
      const t0 = Date.now();
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "ping" }] }] }),
          }
        );
        results.gemini = {
          configured: true,
          status: r.ok ? "operational" : "degraded",
          latencyMs: Date.now() - t0,
        };
      } catch (e) {
        results.gemini = { configured: true, status: "error", message: e.message };
      }
    }

    // 2. Fal.ai Ping
    const falKey = settings.ai?.falApiKey || process.env.FAL_KEY;
    if (!falKey) {
      results.fal = { configured: false, status: "unconfigured" };
    } else {
      const t0 = Date.now();
      try {
        const r = await fetch("https://queue.fal.run/fal-ai/fast-sdxl/requests/ping_test", {
          headers: { Authorization: `Key ${falKey}` },
        });
        results.fal = {
          configured: true,
          status: r.status !== 401 && r.status !== 403 ? "operational" : "degraded",
          latencyMs: Date.now() - t0,
        };
      } catch (e) {
        results.fal = { configured: true, status: "error", message: e.message };
      }
    }

    // 3. MuAPI / Seedance Ping
    const muKey = settings.ai?.seedanceApiKey || process.env.SEEDANCE_V2_API_KEY;
    if (!muKey) {
      results.muapi = { configured: false, status: "unconfigured" };
    } else {
      const t0 = Date.now();
      try {
        const r = await fetch("https://api.muapi.ai/api/v1/predictions/test_ping/result", {
          headers: { "x-api-key": muKey },
        });
        results.muapi = {
          configured: true,
          status: r.status !== 401 && r.status !== 403 ? "operational" : "degraded",
          latencyMs: Date.now() - t0,
        };
      } catch (e) {
        results.muapi = { configured: true, status: "error", message: e.message };
      }
    }

    // 4. ElevenLabs Voiceover Ping
    const elevenKey = settings.ai?.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY;
    if (!elevenKey) {
      results.elevenlabs = { configured: false, status: "unconfigured" };
    } else {
      const t0 = Date.now();
      try {
        const { ElevenLabsService } = await import("@/lib/services/elevenlabs");
        await ElevenLabsService.testApiKey(elevenKey);
        results.elevenlabs = { configured: true, status: "operational", latencyMs: Date.now() - t0 };
      } catch (e) {
        results.elevenlabs = { configured: true, status: "degraded", message: e.message };
      }
    }

    // 5. Resend Email Ping
    const resendKey = settings.ai?.resendApiKey || process.env.RESEND_API_KEY;
    if (!resendKey) {
      results.resend = { configured: false, status: "unconfigured" };
    } else {
      const t0 = Date.now();
      try {
        const { EmailService } = await import("@/lib/services/email");
        await EmailService.testApiKey(resendKey);
        results.resend = { configured: true, status: "operational", latencyMs: Date.now() - t0 };
      } catch (e) {
        results.resend = { configured: true, status: "degraded", message: e.message };
      }
    }

    // 6. Stripe Config Status
    const stripeKey = settings.billing?.stripe?.secretKey || process.env.STRIPE_SECRET_KEY;
    results.stripe = {
      configured: Boolean(stripeKey),
      status: stripeKey ? "operational" : "unconfigured",
      enabled: Boolean(settings.billing?.stripe?.enabled),
    };

    // 7. PayPal Config Status
    const payPalClientId = settings.billing?.paypal?.clientId || process.env.PAYPAL_CLIENT_ID;
    results.paypal = {
      configured: Boolean(payPalClientId),
      status: payPalClientId ? "operational" : "unconfigured",
      mode: settings.billing?.paypal?.mode || "sandbox",
      enabled: Boolean(settings.billing?.paypal?.enabled),
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: results,
    });
  } catch (error) {
    console.error("[HEALTH_KEYS_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
