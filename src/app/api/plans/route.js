import { NextResponse } from "next/server";
import { PlansService } from "@/lib/services/plans";

export async function GET() {
  try {
    const plans = await PlansService.getPlans(true);
    return NextResponse.json(plans);
  } catch (error) {
    console.error("[PLANS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
  }
}
