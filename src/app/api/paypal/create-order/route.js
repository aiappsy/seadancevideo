import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PlansService } from "@/lib/services/plans";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    const plan = await PlansService.getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const customId = JSON.stringify({
      userId: session.user.id,
      planId: plan.id,
    });

    const order = await createPayPalOrder({
      planId: plan.id,
      amount: plan.price,
      currency: "USD",
      description: `${plan.name} - ${plan.type === "byok" ? "BYOK Access" : `${plan.credits} Credits`}`,
      customId,
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("[PAYPAL_CREATE_ORDER_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to create PayPal order" }, { status: 500 });
  }
}
