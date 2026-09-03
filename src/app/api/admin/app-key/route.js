import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-admin";
import { AppKeyService } from "@/lib/services/app-key";

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const keyData = await AppKeyService.getMasterAppKey();
    return NextResponse.json(keyData);
  } catch (error) {
    console.error("[ADMIN_APP_KEY_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch master app key" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const newKeyData = await AppKeyService.rotateMasterAppKey(auth.user?.id || auth.session?.user?.id || "admin");
    return NextResponse.json({
      success: true,
      ...newKeyData,
      message: "New Master App API Key generated successfully",
    });
  } catch (error) {
    console.error("[ADMIN_APP_KEY_ROTATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to rotate master app key" }, { status: 500 });
  }
}
