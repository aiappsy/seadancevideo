import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-admin";
import { SettingsService } from "@/lib/services/settings";

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const settings = await SettingsService.getSettings(true);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[ADMIN_SETTINGS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await verifyAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const updated = await SettingsService.updateSettings(body, auth.user.id);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("[ADMIN_SETTINGS_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
