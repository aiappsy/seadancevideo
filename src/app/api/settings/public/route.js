import { NextResponse } from "next/server";
import { SettingsService } from "@/lib/services/settings";

export async function GET() {
  try {
    const settings = await SettingsService.getPublicSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_PUBLIC_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch public settings" }, { status: 500 });
  }
}
